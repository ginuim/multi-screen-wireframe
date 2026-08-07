@echo off
setlocal
set "ROOT=%~dp0"
set "ESBUILD=%ROOT%framework\tools\esbuild-windows-x64.exe"
set "TMP=%ROOT%.build-tmp"

if not exist "%ESBUILD%" (
  echo Missing esbuild binary: %ESBUILD% 1>&2
  exit /b 1
)

if exist "%TMP%" rmdir /S /Q "%TMP%"
mkdir "%TMP%"

"%ESBUILD%" "%ROOT%src\app.jsx" --bundle --loader:.jsx=jsx --jsx-factory=React.createElement --jsx-fragment=React.Fragment --platform=browser --target=es2018 --format=iife --sourcemap=inline "--banner:js=/* GENERATED FILE. EDIT src/, THEN RUN BUILD. */" "--outfile=%TMP%\app.js"
if errorlevel 1 (
  rmdir /S /Q "%TMP%"
  exit /b 1
)

if not exist "%ROOT%dist" mkdir "%ROOT%dist"
move /Y "%TMP%\app.js" "%ROOT%dist\app.js" >nul
if errorlevel 1 (
  rmdir /S /Q "%TMP%"
  exit /b 1
)

rmdir /S /Q "%TMP%"
echo Built dist/app.js
exit /b 0
