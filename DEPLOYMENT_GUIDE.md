# Guia de Implantação em Nuvem e Certificados SSL (HTTPS)

Este documento detalha o processo de disponibilização do sistema em ambiente de nuvem, garantindo disponibilidade contínua, endereço web fixo e conformidade com os protocolos de segurança HTTPS.

---

## Por que a Hospedagem em Nuvem Elimina o Aviso de "Site Não Seguro"?

Ao executar a aplicação exclusivamente na rede interna via IP direto (exemplo: `http://192.168.x.x:3000`):
- O tráfego ocorre em protocolo HTTP sem criptografia de ponta a ponta.
- Navegadores modernos (Google Chrome, Safari, Edge) e sistemas operacionais móveis (Android, iOS) exibem avisos visuais de "Não seguro" para alertar sobre o risco de interceptação na rede local.

Ao realizar a implantação em provedores de nuvem (Render, Google Cloud Run, Vercel, Railway):
- As plataformas gerenciam e renovam automaticamente certificados digitais SSL/TLS emitidos por Autoridades Certificadoras reconhecidas (Google Trust Services, Let's Encrypt).
- Todas as conexões passam a utilizar o protocolo seguro HTTPS (`https://`).
- O navegador valida a cadeia de certificados e exibe o símbolo de cadeado de segurança, sem telas de aviso para os colaboradores.

---

## Opção 1: Render.com (Hospedagem em Nuvem com Integração GitHub)

O Render permite a hospedagem de aplicações Node.js com compilação contínua e provisionamento de certificado SSL automatizado.

### Procedimento de Configuração:

1. **Repositório no GitHub**:
   - Crie um repositório no GitHub (público ou privado) e envie o código do projeto.

2. **Acesso ao Render**:
   - Acesse `render.com` e efetue login com sua conta do GitHub.

3. **Criação do Serviço Web**:
   - No painel principal, selecione **New +** > **Web Service**.
   - Conecte o repositório do projeto.

4. **Definição dos Parâmetros de Execução**:
   - **Name**: `portal-chamados-itsm` (ou o identificador da organização)
   - **Region**: Selecione a região mais próxima (ex: Ohio ou Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free ($0/month)`

5. **Finalização**:
   - Clique em **Create Web Service**.
   - Em poucos minutos, a plataforma fornecerá um endereço seguro (exemplo: `https://portal-chamados-itsm.onrender.com`).
   - O endereço gerado permanece fixo e pode ser compartilhado com a equipe, configurado em favoritos ou instalado na tela de início de celulares.

---

## Opção 2: Google Cloud Run

Para organizações que operam na infraestrutura do Google Cloud:

1. Através do ambiente do Google AI Studio, utilize a opção **Share / Publish** no canto superior direito para provisionar o serviço no Cloud Run.
2. A aplicação recebe um endereço oficial sob o domínio `*.run.app` com certificado gerenciado pela infraestrutura do Google.

---

## Opção 3: Servidor Interno Corporativo via Docker (On-Premises)

Caso a política de segurança da empresa exija que os dados residam estritamente no data center local:

1. O projeto inclui arquivos pré-configurados:
   - `Dockerfile`
   - `docker-compose.yml`
   - `nginx.conf`

2. Para iniciar os serviços no servidor local:
   ```bash
   docker compose up -d --build
   ```

3. Para viabilizar HTTPS internamente em servidor local, utilize um proxy reverso Nginx com certificado interno ou Nginx Proxy Manager integrado ao Certbot.

---

## Instalação como Aplicativo em Dispositivos Móveis (PWA)

Com a URL segura HTTPS em funcionamento:

- **Android (Google Chrome)**:
  1. Acesse o endereço HTTPS no navegador.
  2. Abra o menu de opções (três pontos no canto superior).
  3. Selecione "Adicionar à tela inicial" ou "Instalar aplicativo".
  4. O atalho é criado na grade de aplicativos do aparelho.

- **iOS (Apple Safari)**:
  1. Acesse o endereço HTTPS no Safari.
  2. Toque no botão de Compartilhamento.
  3. Selecione a opção "Adicionar à Tela de Início".
  4. Confirme para fixar o ícone corporativo na tela principal.
