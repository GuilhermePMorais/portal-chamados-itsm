@echo off
title Portal de Chamados Alko - Servidor Central Node
cd /d "%~dp0"

echo =======================================================
echo    PORTAL DE CHAMADOS ALKO - INICIALIZACAO NODE/VITE
echo =======================================================
echo.

echo 1. Verificando o Node.js no computador...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O Node.js nao foi encontrado no seu computador!
    echo Para rodar sem Docker, voce precisa instalar o Node.js v18 ou v20:
    echo Baixe gratuitamente em: https://nodejs.org
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b
)

echo [OK] Node.js detectado com sucesso!
echo.

if not exist "node_modules" goto :INSTALL_DEPS
if not exist "node_modules\tsx" goto :INSTALL_DEPS
goto :START_APP

:INSTALL_DEPS
echo 2. Instalando modulos necessarios... Isso ocorre apenas na primeira vez.
echo Aguarde a conclusao do npm install...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias com npm install.
    echo Verifique sua conexao com a internet.
    pause
    exit /b
)

:START_APP
echo.
echo =======================================================
echo 3. Iniciando o Portal Alko na porta 3000...
echo.
echo Acesse no computador em: http://127.0.0.1:3000
echo Acesse no celular via: iniciar-tunnel-cloudflare.bat
echo.
echo ATENCAO: NAO FECHE esta janela preta enquanto usar o sistema!
echo Para parar o servidor, pressione CTRL + C.
echo =======================================================
echo.

call npm run dev

echo.
echo =======================================================
echo O servidor foi encerrado.
if %errorlevel% neq 0 (
    echo Se a mensagem acima indicar 'EADDRINUSE', a porta 3000 ja esta em uso.
    echo Feche containers do Docker ou outras janelas do Node.
)
echo Pressione qualquer tecla para fechar esta janela...
echo =======================================================
pause >nul
