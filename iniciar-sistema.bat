@echo off
title Portal de Chamados Alko - Iniciar Servidor Docker
cd /d "%~dp0"

echo =======================================================
echo    PORTAL DE CHAMADOS ALKO - INICIALIZACAO DOCKER
echo =======================================================
echo.
echo 1. Verificando o Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Docker nao esta instalado ou nao esta aberto.
    echo Se nao tiver o Docker, use o arquivo 'iniciar-sem-docker.bat'.
    pause
    exit /b
)

echo 2. Parando instancias antigas e reconstruindo o container...
docker compose down >nul 2>&1
docker compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao construir ou subir o container Docker.
    echo Verifique se o Docker Desktop esta aberto e pronto.
    echo DICA: Voce tambem pode rodar sem Docker usando 'iniciar-sem-docker.bat'.
    pause
    exit /b
)

echo.
echo 3. Aguardando inicializacao do servidor central (5 segundos)...
timeout /t 5 /nobreak >nul

docker ps --filter "name=portal_alko_sistema" --filter "status=running" | findstr "portal_alko_sistema" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo =======================================================
    echo [ALERTA] O container Docker nao conseguiu permanecer ativo!
    echo Veja abaixo os logs do container:
    echo -------------------------------------------------------
    docker logs portal_alko_sistema
    echo -------------------------------------------------------
    echo DICA: Se preferir rodar direto sem Docker, execute 'iniciar-sem-docker.bat'.
    echo =======================================================
    pause
    exit /b
)

echo.
echo =======================================================
echo   SISTEMA ONLINE E FUNCIONANDO COM SUCESSO!
echo =======================================================
echo.
echo Acesso neste computador:
echo   http://127.0.0.1:8090
echo   ou
echo   http://127.0.0.1:3000
echo.
echo Para acessar pelo celular ou de fora da empresa:
echo   Abra o arquivo 'iniciar-tunnel-cloudflare.bat' em outra janela.
echo.
echo Credenciais Administrador: admin@alko.com.br ^| Alko@2026
echo =======================================================
pause
