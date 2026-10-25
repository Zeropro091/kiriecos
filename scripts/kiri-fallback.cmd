@echo off
REM KIRI fallback helper — klik dua kali atau jalankan dari cmd.
REM   backup   = bikin restore point sekarang
REM   list     = lihat restore point yang ada
REM   restore  = kembali ke restore point (minta ID)
cd /d C:\kiri
if "%~1"=="" goto menu
node scripts\kiri-fallback.mjs %*
goto end

:menu
echo ============================================
echo   KIRI — restore point
echo ============================================
node scripts\kiri-fallback.mjs list
echo.
set /p PILIH=Ketik ID untuk restore (kosongkan = batal):
if "%PILIH%"=="" goto end
node scripts\kiri-fallback.mjs restore %PILIH%

:end
echo.
pause
