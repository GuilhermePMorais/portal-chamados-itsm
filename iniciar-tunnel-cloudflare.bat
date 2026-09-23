@echo off
setlocal enabledelayedexpansion
title Cloudflare Tunnel - Portal Alko
cd /d "%~dp0"

echo =======================================================
echo    CLOUDFLARE TUNNEL - PORTAL DE CHAMADOS ALKO
echo =======================================================
echo.

REM 1. Verifica se o executavel existe ou baixa diretamente
if not exist "cloudflared.exe" (
    echo [1/2] Baixando cloudflared.exe para esta pasta...
    powershell -NoProfile -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe', 'cloudflared.exe'); Write-Host 'Download finalizado!' } catch { Write-Host 'Erro no download: ' $_ }"
)

if not exist "cloudflared.exe" (
    echo [ERRO] O arquivo cloudflared.exe nao esta na pasta.
    echo Baixe manualmente em https://github.com/cloudflare/cloudflared/releases
    pause
    exit /b
)

:CHECK_SERVERS
echo Verificando se o Portal Alko esta rodando...

set TARGET_PORT=

REM Testa diretamente se porta 3000 responde a HTTP com status 200
curl -s -m 2 -f http://127.0.0.1:3000/api/status >nul 2>&1
if not errorlevel 1 (
    set TARGET_PORT=3000
    echo [OK] Sistema Alko detectado e RESPONDENDO na porta 3000!
    goto :START_TUNNEL
)

REM Testa diretamente se porta 8090 responde a HTTP com status 200
curl -s -m 2 -f http://127.0.0.1:8090/api/status >nul 2>&1
if not errorlevel 1 (
    set TARGET_PORT=8090
    echo [OK] Sistema Alko detectado e RESPONDENDO na porta 8090!
    goto :START_TUNNEL
)

REM Testa raiz na porta 3000
curl -s -m 2 -f http://127.0.0.1:3000/ >nul 2>&1
if not errorlevel 1 (
    set TARGET_PORT=3000
    echo [OK] Sistema Alko detectado na porta 3000!
    goto :START_TUNNEL
)

REM Testa raiz na porta 8090
curl -s -m 2 -f http://127.0.0.1:8090/ >nul 2>&1
if not errorlevel 1 (
    set TARGET_PORT=8090
    echo [OK] Sistema Alko detectado na porta 8090!
    goto :START_TUNNEL
)

echo.
echo =======================================================
echo [ATENCAO] O SERVIDOR CENTRAL ALKO NAO ESTA ONLINE AINDA!
echo =======================================================
echo O tunel Cloudflare precisa que o sistema esteja rodando em
echo OUTRA janela antes de ser iniciado. Se abrir o tunel sem
echo o servidor, o navegador da o erro 'Gateway Invalido 502'.
echo.
echo O QUE FAZER AGORA:
echo   1. Mantenha esta janela aberta.
echo   2. Em OUTRA janela, execute um dos comandos:
echo        - Duplo clique em 'iniciar-sem-docker.bat' (Recomendado se nao usa Docker)
echo        - OU duplo clique em 'iniciar-sistema.bat' (Se usa Docker Desktop)
echo   3. Aguarde o servidor carregar na outra janela.
echo.
echo Pressione qualquer tecla para testar a conexao novamente...
pause >nul
echo.
goto :CHECK_SERVERS

:START_TUNNEL
echo.
echo =======================================================
echo Iniciando Cloudflare Tunnel para http://127.0.0.1:%TARGET_PORT%
echo O link seguro .trycloudflare.com vai aparecer abaixo.
echo NAO FECHE esta janela preta enquanto estiver usando.
echo =======================================================
echo.

REM Inicia o tunel apontando para o servico local
echo Tentando iniciar o tunnel...
.\cloudflared.exe tunnel --url http://127.0.0.1:%TARGET_PORT%

if errorlevel 1 (
    echo.
    echo [ALERTA] O tunel foi encerrado. Codigo: %errorlevel%
    echo Se a conexao falhou, verifique se a outra janela com o servidor ainda esta aberta.
)

echo.
echo =======================================================
echo O processo do tunel foi finalizado.
echo Pressione qualquer tecla para fechar esta janela.
echo =======================================================
pause >nul
