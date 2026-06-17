@echo off
title ChronoHub - Iniciando...
cls

echo =====================================================================
echo                CHRONOHUB - ENTORNO DE DESARROLLO
echo =====================================================================
echo.

:: ============================================================
:: Obtener la ruta raiz dinamicamente (donde este este .bat)
:: ============================================================
set ROOT=%~dp0
if "%ROOT:~-1%"=="\" set ROOT=%ROOT:~0,-1%

set BACKEND=%ROOT%\src\backend
set FRONTEND=%ROOT%\src\frontend\index.html
set VENV=%BACKEND%\venv
set PIP=%VENV%\Scripts\pip.exe
set PYTHON=%VENV%\Scripts\python.exe

:: -----------------------------------------------
:: Buscar Python compatible en esta PC
:: -----------------------------------------------
set "SYS_PYTHON="

where py >nul 2>&1
if not errorlevel 1 (
    for /f "usebackq delims=" %%p in (`py -3.14 -c "import sys; print(sys.executable)" 2^>nul`) do (
        if not defined SYS_PYTHON set "SYS_PYTHON=%%p"
    )
)

if not defined SYS_PYTHON (
    for /f "usebackq delims=" %%p in (`python -c "import sys; print(sys.executable)" 2^>nul`) do (
        if not defined SYS_PYTHON set "SYS_PYTHON=%%p"
    )
)

if not defined SYS_PYTHON if exist "%LocalAppData%\Programs\Python\Python314\python.exe" set "SYS_PYTHON=%LocalAppData%\Programs\Python\Python314\python.exe"
if not defined SYS_PYTHON if exist "%ProgramFiles%\Python314\python.exe" set "SYS_PYTHON=%ProgramFiles%\Python314\python.exe"
if not defined SYS_PYTHON if exist "%ProgramFiles(x86)%\Python314\python.exe" set "SYS_PYTHON=%ProgramFiles(x86)%\Python314\python.exe"
if not defined SYS_PYTHON if exist "C:\Python314\python.exe" set "SYS_PYTHON=C:\Python314\python.exe"

if not defined SYS_PYTHON (
    echo [ERROR] Python 3.14 no esta instalado o no esta disponible en esta PC.
    echo.
    echo Instala Python 3.14 desde: https://www.python.org/downloads
    echo Durante la instalacion, marca la opcion "Add Python to PATH".
    echo.
    pause
    exit /b 1
)

"%SYS_PYTHON%" --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python fue encontrado, pero no se pudo ejecutar correctamente.
    echo Ruta detectada: %SYS_PYTHON%
    echo.
    pause
    exit /b 1
)

:: -----------------------------------------------
:: Crear o recrear venv si no existe o esta roto
:: -----------------------------------------------
set "VENV_OK=0"
if exist "%PYTHON%" (
    "%PYTHON%" --version >nul 2>&1
    if not errorlevel 1 set "VENV_OK=1"
)

if not "%VENV_OK%"=="1" (
    echo [SETUP] Entorno virtual no valido o incompatible con esta PC.
    echo [SETUP] Recreando entorno virtual de Python...
    if exist "%VENV%" rmdir /s /q "%VENV%"

    "%SYS_PYTHON%" -m venv "%VENV%"
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        pause
        exit /b 1
    )

    echo [SETUP] Instalando dependencias ^(puede tardar un momento^)...
    "%PIP%" install --quiet -r "%BACKEND%\requirements.txt"
    if errorlevel 1 (
        echo [ERROR] Fallo la instalacion de dependencias.
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas correctamente.
    echo.
)

:: -----------------------------------------------
:: Crear archivo .env si no existe
:: -----------------------------------------------
if not exist "%BACKEND%\.env" (
    echo [SETUP] Creando archivo .env a partir de .env.example...
    copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
)

:: -----------------------------------------------
:: Liberar el puerto 8000 si ya esta en uso
:: -----------------------------------------------
for /f "tokens=5" %%p in ('netstat -ano ^| findstr "127.0.0.1:8000"') do (
    taskkill /PID %%p /F >nul 2>&1
)

:: -----------------------------------------------
:: Crear script temporal para lanzar el backend
:: -----------------------------------------------
set LAUNCHER=%TEMP%\chronohub_launch.bat
echo @echo off > "%LAUNCHER%"
echo title ChronoHub Backend >> "%LAUNCHER%"
echo cd /d "%BACKEND%" >> "%LAUNCHER%"
echo "%PYTHON%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload >> "%LAUNCHER%"
echo pause >> "%LAUNCHER%"

:: -----------------------------------------------
:: Lanzar el Backend en una nueva ventana
:: -----------------------------------------------
echo [1/2] Iniciando Backend...
echo       API:  http://127.0.0.1:8000
echo       Docs: http://127.0.0.1:8000/docs
echo.
start "ChronoHub Backend" cmd /k "%LAUNCHER%"

:: -----------------------------------------------
:: Abrir el Frontend
:: -----------------------------------------------
echo [2/2] Esperando que el backend inicie...
timeout /t 5 >nul
echo [2/2] Abriendo la interfaz de usuario...
start "" "%FRONTEND%"

echo.
echo =====================================================================
echo  Todo listo! Backend corriendo en http://127.0.0.1:8000
echo =====================================================================
echo.
timeout /t 4 >nul
exit
