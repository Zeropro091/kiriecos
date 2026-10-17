#Requires -Version 5.1
<#
.SYNOPSIS
  KIRI PROJECT - deploy satu perintah untuk server Windows.

.DESCRIPTION
  Clone/pull repo, build frontend + backend, jalankan migrasi database, lalu start app
  (Docker kalau ada, kalau tidak pm2). Idempotent: aman dijalankan berulang.

  Env dicari berurutan:
    1. -EnvFile <path>   -> file yang dikirim Ari (kiri.env.production)
    2. server\.env       -> kalau sudah pernah dipasang, dipakai apa adanya
    3. prompt paste      -> tempel isi env, Enter 2x untuk selesai

.EXAMPLE
  .\deploy.ps1 -EnvFile .\kiri.env.production

.EXAMPLE
  .\deploy.ps1 -Bootstrap -Tunnel
#>
[CmdletBinding()]
param(
  [string]$Repo     = 'https://github.com/Zeropro091/kiriecos.git',
  [string]$Branch   = 'main',
  [string]$Target   = 'C:\kiri',
  [string]$EnvFile  = '',
  [string]$ServiceName = 'kiri',
  [switch]$Bootstrap,
  [switch]$SkipPull,
  [switch]$SkipMigrate,
  [switch]$Tunnel
)

$ErrorActionPreference = 'Stop'
$Port = 4000

function Say  ($m) { Write-Host $m }
function Step ($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Ok   ($m) { Write-Host "  OK  $m" -ForegroundColor Green }
function Warn ($m) { Write-Host "  !!  $m" -ForegroundColor Yellow }
function Fail ($m) {
  Write-Host "`nGAGAL: $m" -ForegroundColor Red
  Write-Host 'Kirim 30 baris terakhir dari output ini ke Ari.' -ForegroundColor Red
  exit 1
}

function Refresh-Path {
  $m = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
  $u = [System.Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$m;$u"
}

function Ensure-Tool([string]$cmd, [string]$wingetId, [string]$label) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { Ok "$label sudah ada"; return $true }
  if (-not $Bootstrap) {
    Warn "$label tidak ditemukan (jalankan ulang dengan -Bootstrap untuk auto-install)"
    return $false
  }
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Warn "winget tidak ada, tidak bisa auto-install $label"
    return $false
  }
  Say "  install $label lewat winget..."
  & winget install --id $wingetId -e --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity
  Refresh-Path
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { Ok "$label terpasang"; return $true }
  Warn "$label masih belum terdeteksi - tutup lalu buka PowerShell baru, jalankan script lagi"
  return $false
}

function Read-EnvValue([string]$file, [string]$key) {
  if (-not (Test-Path $file)) { return $null }
  foreach ($line in Get-Content $file) {
    if ($line -match "^\s*$([regex]::Escape($key))\s*=\s*(.*)$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Get-LanIP {
  try {
    $ip = Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notmatch '^169\.' } |
      Select-Object -First 1 -ExpandProperty IPAddress
    return $ip
  } catch { return $null }
}

# ============================ 0. Preflight ============================
Step 'Preflight'
Say "PowerShell $($PSVersionTable.PSVersion) | $([System.Environment]::OSVersion.VersionString)"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Say ("mode: " + $(if ($isAdmin) { 'Administrator (penuh)' } else { 'user biasa (cukup, kecuali Docker)' }))

if (-not (Ensure-Tool 'git' 'Git.Git' 'git')) { Warn 'git tidak ada - pakai ZIP, atau ulangi dengan -Bootstrap' }
if (-not (Ensure-Tool 'node' 'OpenJS.NodeJS.LTS' 'Node.js LTS')) { Fail 'Node.js wajib ada. Install: winget install OpenJS.NodeJS.LTS' }

$nodeVer = (& node -v).TrimStart('v')
if ([int]($nodeVer -split '\.')[0] -lt 20) {
  Fail "Node $nodeVer terlalu lama. Butuh 20+ (disarankan 22 LTS). Install: winget install OpenJS.NodeJS.LTS"
}
Ok "node $nodeVer, $(& git --version)"

# ============================ 1. Kode ============================
Step 'Ambil kode'
$scriptRepo = $PSScriptRoot
if (Test-Path (Join-Path $scriptRepo 'server\package.json')) {
  $Target = $scriptRepo
  Say "pakai folder script ini: $Target"
} elseif (-not (Test-Path (Join-Path $Target '.git'))) {
  if ((Test-Path $Target) -and (Get-ChildItem $Target -Force | Select-Object -First 1)) {
    Fail "$Target sudah ada isinya tapi bukan repo git. Pindahkan/kosongkan dulu."
  }
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail 'git tidak ada. Download ZIP: https://github.com/Zeropro091/kiriecos/archive/refs/heads/main.zip lalu extract isinya ke C:\kiri, jalankan ulang script ini.'
  }
  Say "clone $Repo -> $Target"
  & git clone --branch $Branch $Repo $Target
  if ($LASTEXITCODE -ne 0) { Fail 'git clone gagal (cek koneksi internet / akses repo)' }
}

$hasGit = Test-Path (Join-Path $Target '.git')
if (-not $hasGit) {
  Warn 'folder ini bukan repo git (hasil ZIP) - update kode nanti lewat download ulang'
} elseif (-not $SkipPull) {
  Push-Location $Target
  & git fetch origin $Branch --quiet
  & git checkout $Branch --quiet
  & git reset --hard "origin/$Branch" --quiet
  $code = $LASTEXITCODE
  Pop-Location
  if ($code -ne 0) { Fail "gagal update ke origin/$Branch" }
}
$commit = if ($hasGit) { (& git -C $Target rev-parse --short HEAD) } else { 'zip' }
$subject = if ($hasGit) { (& git -C $Target log -1 --pretty=%s) } else { 'tanpa git (ZIP)' }
Ok "commit $commit - $subject"

# ============================ 2. Env ============================
Step 'Konfigurasi (.env)'
$envPath = Join-Path $Target 'server\.env'

if ($EnvFile) {
  if (-not (Test-Path $EnvFile)) { Fail "file env tidak ditemukan: $EnvFile" }
  Copy-Item $EnvFile $envPath -Force
  Ok "env dipasang dari $EnvFile"
} elseif (Test-Path $envPath) {
  Ok 'server\.env sudah ada, dipakai apa adanya'
} else {
  Warn 'env belum ada. Tempel isi file kiri.env.production di bawah,'
  Warn 'lalu tekan Enter pada baris kosong 2x untuk menyelesaikan.'
  $lines = New-Object System.Collections.Generic.List[string]
  $blanks = 0
  while ($true) {
    $l = Read-Host '>'
    if ([string]::IsNullOrWhiteSpace($l)) {
      $blanks++
      if ($blanks -ge 2) { break }
      continue
    }
    $blanks = 0
    $lines.Add($l)
  }
  if ($lines.Count -lt 3) { Fail 'env kosong / tidak valid' }
  $dir = Split-Path $envPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  [System.IO.File]::WriteAllLines($envPath, $lines, (New-Object System.Text.UTF8Encoding($false)))
  Ok "env ditulis ($($lines.Count) baris)"
}

foreach ($k in @('DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGINS')) {
  if (-not (Read-EnvValue $envPath $k)) { Fail "server\.env: $k kosong / tidak ada" }
}
if ((Read-EnvValue $envPath 'JWT_SECRET') -match 'change|insecure|dev-only') {
  Fail 'JWT_SECRET masih nilai contoh - server akan menolak boot'
}
if ((Read-EnvValue $envPath 'DATABASE_URL') -match 'neon\.tech') {
  Ok 'database: Neon (hosted)'
} else {
  Warn 'DATABASE_URL bukan Neon - pastikan database-nya memang di situ'
}

# ============================ 3. Build ============================
Step 'Build frontend'
Push-Location $Target
& npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail 'npm ci (root) gagal' }
& npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail 'build frontend gagal' }
if (-not (Test-Path (Join-Path $Target 'dist\index.html'))) { Pop-Location; Fail 'dist\index.html tidak terbentuk' }
Pop-Location
Ok 'frontend -> dist\'

Step 'Build backend'
Push-Location (Join-Path $Target 'server')
& npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail 'npm ci (server) gagal' }
& npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; Fail 'build backend gagal' }
Pop-Location
Ok 'backend -> server\dist\'

# ============================ 4. Migrasi ============================
if (-not $SkipMigrate) {
  Step 'Migrasi database (aditif, aman diulang)'
  Push-Location (Join-Path $Target 'server')
  & npx --no-install tsx src/db/migrate.ts
  $mcode = $LASTEXITCODE
  Pop-Location
  if ($mcode -ne 0) { Fail 'migrasi gagal - cek DATABASE_URL / DATABASE_SSL=true di server\.env' }
  Ok 'skema up to date'
}

# ============================ 5. Start ============================
Step 'Jalankan aplikasi'
$hasDocker = [bool](Get-Command docker -ErrorAction SilentlyContinue)
$runner = $null

if ($hasDocker) {
  Say 'Docker terdeteksi - pakai container (paling rapi, auto-restart)'
  Push-Location $Target
  & docker build -t "${ServiceName}-app:latest" .
  if ($LASTEXITCODE -ne 0) { Pop-Location; Fail 'docker build gagal' }
  & docker rm -f $ServiceName 2>$null | Out-Null
  & docker run -d --name $ServiceName --restart unless-stopped --env-file $envPath -p "${Port}:4000" "${ServiceName}-app:latest"
  if ($LASTEXITCODE -ne 0) { Pop-Location; Fail 'docker run gagal' }
  Pop-Location
  $runner = 'docker'
} else {
  Say 'Docker tidak ada - pakai pm2'
  if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Say '  install pm2...'
    & npm install -g pm2 --no-audit --no-fund
    Refresh-Path
  }
  if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Fail 'pm2 gagal terpasang. Alternatif: install Docker Desktop, atau jalankan manual: cd server; node dist/index.js'
  }
  & pm2 delete $ServiceName 2>$null | Out-Null
  Push-Location (Join-Path $Target 'server')
  & pm2 start dist/index.js --name $ServiceName --cwd (Join-Path $Target 'server') --time
  if ($LASTEXITCODE -ne 0) { Pop-Location; Fail 'pm2 start gagal' }
  & pm2 save | Out-Null
  Pop-Location
  $runner = 'pm2'
  Warn 'auto-start setelah reboot: jalankan sekali `npm i -g pm2-installer` lalu ikuti instruksinya'
}

# firewall (best effort)
if ($isAdmin) {
  try {
    if (-not (Get-NetFirewallRule -DisplayName "KIRI $Port" -ErrorAction SilentlyContinue)) {
      New-NetFirewallRule -DisplayName "KIRI $Port" -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port | Out-Null
      Ok "firewall: port $Port dibuka"
    }
  } catch { Warn "firewall tidak diubah: $($_.Exception.Message)" }
} else {
  Warn "bukan admin - port $Port tidak dibuka di firewall (akses lokal tetap jalan)"
}

# ============================ 6. Verifikasi ============================
Step 'Verifikasi'
$healthy = $false
$deadline = (Get-Date).AddSeconds(120)
while ((Get-Date) -lt $deadline) {
  try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 5
    if ($r.db -eq 'up') { $healthy = $true; break }
    Say "  health: db=$($r.db) - tunggu..."
  } catch { Say '  belum siap...' }
  Start-Sleep -Seconds 3
}

if (-not $healthy) {
  Say '--- log terakhir ---' -ForegroundColor Yellow
  if ($runner -eq 'docker') { & docker logs --tail 40 $ServiceName } else { & pm2 logs $ServiceName --lines 40 --nostream }
  Fail "health check tidak pernah db=up dalam 120 detik (runner: $runner)"
}
Ok 'health: db=up'

$home_code = (Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 15).StatusCode
Ok "GET / -> $home_code"

$lan = Get-LanIP
$urls = @("http://127.0.0.1:$Port")
if ($lan) { $urls += "http://${lan}:$Port" }

# ============================ 7. Opsional: tunnel publik ============================
$tunnelUrl = $null
if ($Tunnel) {
  Step 'Cloudflare quick tunnel'
  if (-not (Ensure-Tool 'cloudflared' 'Cloudflare.cloudflared' 'cloudflared')) {
    Warn 'cloudflared tidak ada - lewati tunnel'
  } else {
    $tlog = Join-Path $env:TEMP 'kiri-tunnel.log'
    if (Test-Path $tlog) { Remove-Item $tlog -Force }
    Start-Process -FilePath 'cloudflared' -ArgumentList 'tunnel', '--url', "http://127.0.0.1:$Port" -RedirectStandardError $tlog -WindowStyle Hidden
    for ($i = 0; $i -lt 30; $i++) {
      Start-Sleep -Seconds 2
      if (Test-Path $tlog) {
        $m = Select-String -Path $tlog -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches | Select-Object -First 1
        if ($m) { $tunnelUrl = $m.Matches[0].Value; break }
      }
    }
    if ($tunnelUrl) { Ok "tunnel: $tunnelUrl" } else { Warn 'URL tunnel belum muncul, cek log: ' + $tlog }
  }
}

# ============================ Ringkasan ============================
Write-Host "`n==================================================" -ForegroundColor Green
Write-Host ' KIRI PROJECT - SELESAI' -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Say "commit   : $commit"
Say "runner   : $runner"
Say "folder   : $Target"
Say "akses    :"
foreach ($u in $urls) { Say "  $u" }
if ($tunnelUrl) { Say "  $tunnelUrl  (sementara, publik)" }
Say ''
Say 'Yang perlu dikirim balik ke Ari:'
Say '  1. output di atas (commit + runner)'
Say '  2. hasil:  Invoke-RestMethod http://127.0.0.1:4000/api/health'
if ($runner -eq 'docker') { Say "  3. docker ps --filter name=$ServiceName" }
Say ''
Say 'Catatan: JANGAN jalankan `npm run seed` di server ini (bisa reset data produksi).'
