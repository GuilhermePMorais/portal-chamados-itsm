# Como Deixar o Sistema Online 24 Horas por Dia, 7 Dias por Semana (100% Grátis)

Este guia prático ensina o método definitivo para manter o **Portal Chamados ITSM** (e a sua versão da Alko) no ar ininterruptamente no **Render**, sem que ele "durma" após 15 minutos de inatividade, e sem pagar um único centavo.

---

## 1. Por que o Render "Dorme" no Plano Gratuito?

No plano Free do Render:
- Quando o serviço fica **15 minutos consecutivos sem receber requisições**, ele entra em modo de suspensão (*spin down*) para economizar recursos de servidor.
- Quando alguém tenta acessar novamente, ele demora de **40 a 60 segundos** para "acordar" (*cold start*).
- **A Solução:** Criamos endpoints dedicados e ultra-leves no backend:
  - `https://seu-sistema.onrender.com/health`
  - `https://seu-sistema.onrender.com/api/health`
- Esses endpoints respondem instantaneamente em formato JSON:
  ```json
  { "status": "ok", "service": "Portal Chamados ITSM", "uptimeSeconds": 1425 }
  ```
- Ao configurar um monitor de status gratuito para enviar um "ping" a essa rota a cada **5 ou 10 minutos**, o Render entende que o sistema tem tráfego contínuo e **NUNCA entra em suspensão**, permanecendo ativo 24/7!

---

## 2. Passo a Passo com o UptimeRobot (Método Recomendado — Mais Fácil e Confiável)

O **UptimeRobot** é um serviço consagrado de monitoramento gratuito que permite cadastrar até 50 URLs e faz verificações a cada 5 minutos.

### Passo 1: Criar Conta Gratuita
1. Acesse: [uptimerobot.com](https://uptimerobot.com)
2. Clique em **Sign Up Free** (cadastro com e-mail ou conta Google).

### Passo 2: Cadastrar o Monitor do seu Sistema
1. No painel do UptimeRobot, clique no botão verde **"+ Add New Monitor"**.
2. Preencha os campos exatamente assim:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Portal Chamados ITSM - 24/7` (ou `Alko - Chamados 24/7`)
   - **URL (or IP):** `https://seu-projeto.onrender.com/health` *(substitua pela URL real do seu Render)*
   - **Monitoring Interval:** `5 minutes` (ou `10 minutes`)
   - **Monitor Timeout:** `30 seconds`
3. Em **Select Alert Contacts To Notify**, marque o seu e-mail (caso o sistema caia, você recebe um aviso no celular).
4. Clique em **"Create Monitor"**.

> Pronto! A partir de agora, o UptimeRobot enviará uma requisição a cada 5 minutos. O servidor nunca ultrapassará a janela de 15 minutos e ficará **24 horas por dia, 7 dias por semana ativo**.

---

## 3. Alternativa 2: Cron-job.org (Intervalo de 1 minuto)

Se você preferir um intervalo menor:
1. Acesse [cron-job.org](https://cron-job.org/en/) e crie uma conta grátis.
2. Clique em **"Create cronjob"**.
3. Em **Title**, coloque `Manter ITSM Ativo`.
4. Em **URL**, insira `https://seu-projeto.onrender.com/health`.
5. Em **Execution schedule**, escolha **"Every 10 minutes"** (ou a cada 5 minutos).
6. Clique em **"Create"**.

---

## 4. Alternativa 3: GitHub Actions (Automático via Repositório)

Você também pode usar um fluxo do próprio GitHub para pingar a URL de hora em hora ou de 15 em 15 minutos:

Crie o arquivo `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Service Alive 24/7

on:
  schedule:
    # Dispara a cada 10 minutos
    - cron: '*/10 * * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          curl -s -f https://seu-projeto.onrender.com/health || echo "Falha temporária ao pingar"
```

---

## 5. Como Rodar com Docker (Localmente ou em VPS 24/7 Gratuita)

Se você preferir rodar via contêineres Docker, já deixamos tudo pronto nos arquivos `Dockerfile` e `docker-compose.yml`.

### Opção A: Rodar na sua máquina ou servidor interno:
```bash
# 1. Construir e iniciar em segundo plano
docker compose up -d --build

# 2. Verificar se está rodando
docker ps

# 3. Testar a rota de saúde
curl http://localhost:3000/health
```

### Opção B: VPS Gratuita Permanente (Oracle Cloud Free Tier)
- A Oracle oferece instâncias computacionais gratuitas para sempre (*Always Free Compute*).
- Você pode criar uma VM Ubuntu gratuita, instalar o Docker e subir o `docker compose up -d`. O sistema rodará com IP público e sem limitação de horas.

---

## 6. Resumo das Limitações do Plano Free do Render

- **Horas gratuitas mensais:** O Render oferece 750 horas gratuitas de execução por mês para contas verificadas.
- Um mês tem no máximo 744 horas (31 dias × 24 horas = 744h).
- Isso significa que **1 serviço individual no Render pode rodar o mês inteiro (744h) dentro da cota gratuita de 750h**.
- Se você tiver 2 projetos rodando 24/7 na mesma conta (Alko e ITSM), eles somarão 744h + 744h = 1488h (ultrapassando a cota de 1 conta única).
  - **Dica de mestre:** Para ter **dois sistemas rodando 24/7 100% de graça**:
    - **Sistema 1 (Alko Privado):** Hospede na sua conta 1 do Render com UptimeRobot.
    - **Sistema 2 (Portal Chamados ITSM Aberto):** Hospede em uma segunda conta do Render (ou no Vercel / Railway / Docker), ou mantenha ambos sob monitoramento com suspensão inteligente.
