@echo off
rem Downloads the Yoda Conclave video into assets\video\frat-video.mp4 so it plays on the page.
cd /d "%~dp0"
set "URL=https://youtu.be/Jl3MBpQnIdY"
set "OUT=assets\video\frat-video.mp4"
if not exist "assets\video" mkdir "assets\video"
echo.
echo  Downloading the video to %OUT% ...
echo.

set "YT="
where yt-dlp >nul 2>nul
if %errorlevel%==0 set "YT=yt-dlp"
if defined YT goto download

where python >nul 2>nul
if %errorlevel%==0 (
  python -m pip install --quiet --upgrade yt-dlp
  python -m yt_dlp --version >nul 2>nul
  if not errorlevel 1 set "YT=python -m yt_dlp"
)
if defined YT goto download

where py >nul 2>nul
if %errorlevel%==0 (
  py -m pip install --quiet --upgrade yt-dlp
  py -m yt_dlp --version >nul 2>nul
  if not errorlevel 1 set "YT=py -m yt_dlp"
)
if defined YT goto download

where winget >nul 2>nul
if %errorlevel%==0 (
  winget install --id yt-dlp.yt-dlp -e --accept-source-agreements --accept-package-agreements
  echo.
  echo  yt-dlp was installed. Close this window and double-click get-video.bat once more.
  pause
  goto :eof
)

echo  Could not find yt-dlp, Python or winget.
echo  Install Python from https://www.python.org/downloads/ (tick "Add Python to PATH") and run this file again.
pause
goto :eof

:download
%YT% -f "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "%OUT%" "%URL%"
if not errorlevel 1 goto done
echo.
echo  Retrying with a single-file format ...
%YT% -f "b[ext=mp4]/b" -o "%OUT%" "%URL%"
if errorlevel 1 goto failed

:done
echo.
echo  Done. Open index.html and press play on the video.
pause
goto :eof

:failed
echo.
echo  The download failed. Check your internet connection and try again.
pause
