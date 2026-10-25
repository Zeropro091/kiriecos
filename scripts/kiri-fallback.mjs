#!/usr/bin/env node
/**
 * kiri-fallback.mjs — restore point untuk KIRI (kode app + DB).
 *
 *   node scripts/kiri-fallback.mjs backup [label]   # bikin restore point
 *   node scripts/kiri-fallback.mjs list             # daftar restore point
 *   node scripts/kiri-fallback.mjs verify <id>      # bandingkan backup vs DB live
 *   node scripts/kiri-fallback.mjs restore <id>     # kembali ke restore point
 *
 * Satu restore point = image Docker container `kiri` (kode app + uploads, karena
 * container tidak punya volume) + dump logis seluruh tabel DB + manifest.
 *
 * `restore` selalu membuat snapshot kondisi sekarang dulu. Kalau container hasil
 * restore tidak sehat atau verifikasi DB gagal, container lama dihidupkan lagi
 * dan DB dipulihkan dari snapshot itu — restore yang gagal tidak boleh ikut
 * mematikan situs.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = 'C:/kiri';
const BACKUPS = join(ROOT, 'backups');
const SCRIPTS = join(ROOT, 'scripts');
const CONTAINER = 'kiri';
const PORT = 4000;
const KEEP = 6;
const REPO = 'kiri-rollback';

const sh = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
const trySh = (cmd, args, opts = {}) => {
  try { return { ok: true, out: sh(cmd, args, opts) }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};
const sleep = (s) => execFileSync('powershell', ['-NoProfile', '-Command', `Start-Sleep -Seconds ${s}`]);
const stamp = () => {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};
const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16);

const liveUrl = () => sh('docker', ['exec', CONTAINER, 'printenv', 'DATABASE_URL']);
const urlOf = (env) => {
  const hit = (env || []).find((e) => e.startsWith('DATABASE_URL='));
  return hit ? hit.slice('DATABASE_URL='.length) : '';
};

function inspect() {
  const raw = JSON.parse(sh('docker', ['inspect', CONTAINER]))[0];
  return {
    image: raw.Config.Image,
    env: raw.Config.Env,
    restart: raw.HostConfig.RestartPolicy.Name || 'unless-stopped',
    ports: raw.HostConfig.PortBindings || { '4000/tcp': [{ HostIp: '', HostPort: String(PORT) }] },
  };
}

/** Jalankan db-fallback.cjs di container sekali-pakai dari `image`. */
function dbCmd(sub, file, image, env) {
  const url = urlOf(env) || liveUrl();
  const out = sh('docker', [
    'run', '--rm',
    '-v', `${BACKUPS}:/backup`,
    '-v', `${SCRIPTS}:/scripts:ro`,
    '-e', `DATABASE_URL=${url}`,
    '-e', 'NODE_PATH=/app/server/node_modules',
    '--entrypoint', 'node', image, '/scripts/db-fallback.cjs', sub, file,
  ]);
  const line = out.split('\n').filter((l) => l.trim().startsWith('{')).pop();
  if (!line) throw new Error('output db-fallback tidak terbaca: ' + out.slice(-400));
  return JSON.parse(line);
}

function healthOk(tries = 40) {
  for (let i = 0; i < tries; i++) {
    const r = trySh('curl', ['-s', '-m', '3', `http://localhost:${PORT}/api/health`]);
    if (r.ok && /"ok"\s*:\s*true/.test(r.out) && /"db"\s*:\s*"up"/.test(r.out)) return true;
    sleep(1);
  }
  return false;
}

// ------------------------------------------------------------------ backup
function backup(label = '') {
  mkdirSync(BACKUPS, { recursive: true });
  const id = stamp() + (label ? '-' + label.replace(/[^a-z0-9-]/gi, '').slice(0, 24) : '');
  const dir = join(BACKUPS, id);
  mkdirSync(dir, { recursive: true });
  const cfg = inspect();

  console.log(`[1/4] docker commit ${CONTAINER} -> ${REPO}:${id}`);
  sh('docker', ['commit', CONTAINER, `${REPO}:${id}`]);
  const imageId = sh('docker', ['inspect', '--format', '{{.Id}}', `${REPO}:${id}`]).slice(7, 19);

  console.log('[2/4] dump DB');
  const db = dbCmd('dump', `/backup/${id}/db.json.gz`, `${REPO}:${id}`, cfg.env);
  const dumpPath = join(dir, 'db.json.gz');
  if (!existsSync(dumpPath)) throw new Error('file dump tidak terbentuk');

  console.log('[3/4] manifest');
  const head = trySh('git', ['-C', ROOT, 'rev-parse', 'HEAD']).out || '';
  const dirty = (trySh('git', ['-C', ROOT, 'status', '--porcelain']).out || '').split('\n').filter(Boolean).length;
  const manifest = {
    id, label: label || null, createdAt: new Date().toISOString(),
    image: `${REPO}:${id}`, imageId, container: CONTAINER, config: cfg,
    git: { head, dirtyFiles: dirty },
    db: { ...db, sha256: sha(readFileSync(dumpPath)) },
    healthy: healthOk(3),
  };
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(join(dir, 'restore.cmd'), `node C:\\kiri\\scripts\\kiri-fallback.mjs restore ${id}\r\n`);

  console.log(`[4/4] prune (simpan ${KEEP} terbaru)`);
  prune();
  console.log(JSON.stringify({ ok: true, id, dir, db, healthy: manifest.healthy }, null, 2));
  return manifest;
}

function prune() {
  const ids = readdirSync(BACKUPS).filter((d) => existsSync(join(BACKUPS, d, 'manifest.json'))).sort().reverse();
  for (const old of ids.slice(KEEP)) {
    const m = JSON.parse(readFileSync(join(BACKUPS, old, 'manifest.json'), 'utf8'));
    trySh('docker', ['rmi', m.image]);
    rmSync(join(BACKUPS, old), { recursive: true, force: true });
    console.log(`  hapus ${old}`);
  }
}

// ------------------------------------------------------------------ list
function list() {
  if (!existsSync(BACKUPS)) return console.log('belum ada restore point');
  const rows = readdirSync(BACKUPS)
    .filter((d) => existsSync(join(BACKUPS, d, 'manifest.json'))).sort()
    .map((d) => {
      const m = JSON.parse(readFileSync(join(BACKUPS, d, 'manifest.json'), 'utf8'));
      return { id: m.id, dibuat: m.createdAt.slice(0, 19), label: m.label || '-',
        git: (m.git.head || '').slice(0, 8), db_mb: +(m.db.bytesGz / 1048576).toFixed(2),
        tabel: m.db.tables, sehat: m.healthy };
    });
  console.table(rows);
  return rows;
}

// ------------------------------------------------------------------ jalankan container
function startContainer(image, cfg) {
  const args = ['run', '-d', '--name', CONTAINER, '--restart', cfg.restart || 'unless-stopped'];
  for (const [cp, binds] of Object.entries(cfg.ports || {})) {
    for (const b of binds) args.push('-p', `${b.HostIp ? b.HostIp + ':' : ''}${b.HostPort}:${cp.split('/')[0]}`);
  }
  for (const e of cfg.env || []) args.push('-e', e);
  args.push(image);
  return sh('docker', args);
}

// ------------------------------------------------------------------ restore
function restore(id) {
  const dir = join(BACKUPS, id);
  const mf = join(dir, 'manifest.json');
  if (!existsSync(mf)) throw new Error(`restore point '${id}' tidak ada — jalankan: list`);
  const m = JSON.parse(readFileSync(mf, 'utf8'));
  if (!trySh('docker', ['image', 'inspect', m.image]).ok) {
    throw new Error(`image ${m.image} tidak ada — restore point tidak lengkap`);
  }

  console.log(`== RESTORE ${id} ==`);
  console.log('[0/5] snapshot kondisi sekarang (titik balik kalau restore gagal)');
  const pre = backup('pre-restore');
  const preCfg = inspect();

  const oldName = `${CONTAINER}_before_${stamp()}`;
  let moved = false;
  try {
    console.log(`[1/5] simpan container sekarang sebagai ${oldName}`);
    sh('docker', ['rename', CONTAINER, oldName]);
    sh('docker', ['stop', oldName]);
    moved = true;

    console.log('[2/5] jalankan container dari image restore point');
    startContainer(m.image, m.config);
    if (!healthOk()) throw new Error('container hasil restore tidak lulus /api/health');

    console.log('[3/5] pulihkan DB');
    dbCmd('restore', `/backup/${id}/db.json.gz`, m.image, m.config.env);

    console.log('[4/5] verifikasi jumlah baris tiap tabel');
    const ver = dbCmd('verify', `/backup/${id}/db.json.gz`, m.image, m.config.env);
    if (!ver.ok) throw new Error('verifikasi gagal: ' + JSON.stringify(ver.report.filter((r) => !r.match)));

    console.log('[5/5] bersihkan container lama');
    trySh('docker', ['rm', '-f', oldName]);

    const out = { ok: true, id, healthy: true, git: (m.git.head || '').slice(0, 8), tables: ver.report.length, preSnapshot: pre.id };
    console.log(JSON.stringify(out, null, 2));
    return out;
  } catch (e) {
    console.log('!! restore gagal: ' + e.message);
    console.log('!! membalikkan ke kondisi sebelum restore…');
    trySh('docker', ['rm', '-f', CONTAINER]);
    if (moved) {
      trySh('docker', ['rename', oldName, CONTAINER]);
      trySh('docker', ['start', CONTAINER]);
    } else {
      startContainer(pre.image, preCfg);
    }
    try { dbCmd('restore', `/backup/${pre.id}/db.json.gz`, pre.image, preCfg.env); }
    catch (e2) { console.log('!! DB rollback juga gagal: ' + e2.message); }
    const healthy = healthOk();
    console.log(JSON.stringify({ ok: false, error: e.message, rolledBackTo: pre.id, healthy }, null, 2));
    throw e;
  }
}

// ------------------------------------------------------------------ verify
function verify(id) {
  const m = JSON.parse(readFileSync(join(BACKUPS, id, 'manifest.json'), 'utf8'));
  const out = dbCmd('verify', `/backup/${id}/db.json.gz`, m.image, m.config.env);
  console.log(JSON.stringify(out, null, 2));
  return out;
}

// ------------------------------------------------------------------ main
const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === 'backup') backup(arg || '');
  else if (cmd === 'list') list();
  else if (cmd === 'restore') restore(arg);
  else if (cmd === 'verify') verify(arg);
  else { console.log('pakai: node scripts/kiri-fallback.mjs <backup [label] | list | verify <id> | restore <id>>'); process.exit(2); }
} catch (e) {
  console.error('ERROR: ' + e.message);
  process.exit(1);
}
