# Guia Completo: Separação, Configuração e Deploy dos Dois Sistemas

Este documento explica em detalhes como gerenciar, subir e manter online as **duas versões independentes**:
1. **Sistema 1:** **Portal Alko** (Uso interno corporativo da empresa, repositório privado no GitHub).
2. **Sistema 2:** **Portal Chamados ITSM** (Versão neutra, open-source para portfólio no GitHub público e LinkedIn).

---

## Comparativo Direto entre as Duas Versões

| Parâmetro | Versão 1: Corporativo Alko (Privado) | Versão 2: Portal Chamados ITSM (Público) |
|---|---|---|
| **Finalidade** | Operação diária da empresa Alko | Portfólio técnico no LinkedIn e GitHub Open Source |
| **Repositório GitHub** | **Privado** (ex: `alko-chamados-interno`) | **Público** (ex: `portal-chamados-itsm`) |
| **Identidade Visual** | Logotipo oficial da Alko | **Pixel Art Verde:** Nuvem e Smartphone de TI em alta definição |
| **Cores & Tema** | Azul e cinza corporativo | **ServiceNow Aesthetic:** Preto fosco com degradê (`#0d1218` a `#1e2736`), acentos verde esmeralda (`#10b981`) |
| **Banner Hero do Painel** | Azul clássico | **Preto fosco com degradê**, iluminação radial atmosférica e botões táteis |
| **Plano de Fundo** | Fundo farmacêutico suave | Malha técnica geométrica nítida (Dot-Grid) com iluminação esmeralda |
| **Sinalizador no Login** | Fixo | **Dinâmico em Tempo Real:** 🟢 Online, 🟠 Manutenção, 🔴 Offline |
| **Nome nos Títulos e Telas** | Alko Gestão Operacional | **Portal Chamados ITSM** (sem hífens e alinhamento simétrico) |
| **E-mail de Administrador** | Seu e-mail ou `admin@alko.com.br` | **Genérico:** `admin@itsm.local` |
| **Senha Inicial** | Senha corporativa interna | `Admin@2026` |
| **Políticas de Sessão** | Ajustável para 10, 15 ou 30 min | Ajustável com padrão ISO 27001 / LGPD + Modo Manutenção |

---

## 1. Como Manter Dois Repositórios Separados no seu Computador

Recomendamos criar duas pastas no seu computador para nunca misturar os códigos:

```bash
# Estrutura sugerida:
meus-projetos/
├── 1-alko-privado/          <-- Repositório privado da Alko
└── 2-portal-chamados-itsm/   <-- Repositório público do LinkedIn/GitHub
```

---

## 2. Passo a Passo para o Sistema 2 (Portal Chamados ITSM — Público / Open-Source)

Este projeto atual **JÁ ESTÁ 100% LIMPO E CONFIGURADO** para esta versão pública:
- Sem nenhuma menção a e-mails pessoais ou à marca Alko.
- Nome oficial limpo: `Portal Chamados ITSM` (com alinhamento tipográfico perfeito).
- Emblema em **Pixel Art Verde (Nuvem + Smartphone)** simples, limpo e marcante.
- Fundo nítido em malha técnica (Dot-Grid) com iluminação superior suave em esmeralda.
- Usuário administrador padrão genérico: `admin@itsm.local` / `Admin@2026` com botão de preenchimento rápido.
- Controle de expiração de sessão por inatividade com conformidade ISO 27001 / LGPD.

### Passo 2.1: Criar o Repositório Público no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Nome do repositório: `portal-chamados-itsm`.
3. Descrição: `Sistema corporativo open source para gestão de chamados de TI, facilities, controle de SLA e trilha de auditoria (ITSM / ITIL).`
4. Selecione **Public**.
5. Clique em **Create repository**.

### Passo 2.2: Subir os Arquivos Limpos
No terminal da pasta deste projeto:
```bash
# Inicializar o git (se necessário)
git init
git branch -M main

# Adicionar todos os arquivos
git add .
git commit -m "feat: release oficial Portal Chamados ITSM com visual ServiceNow e conformidade ISO 27001"

# Conectar ao repositório público criado
git remote add origin https://github.com/SEU-USUARIO/portal-chamados-itsm.git
git push -u origin main --force
```

### Passo 2.3: Subir no Render
1. Acesse o [dashboard.render.com](https://dashboard.render.com).
2. Clique em **New +** > **Web Service**.
3. Conecte o repositório `portal-chamados-itsm`.
4. Configure:
   - **Name:** `portal-chamados-itsm`
   - **Region:** Ohio (US East) ou Frankfurt
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (ou `node server.ts`)
   - **Instance Type:** `Free`
5. Clique em **Deploy Web Service**.
6. Após ficar pronto, anote a URL gerada (ex: `https://portal-chamados-itsm.onrender.com`).
7. Siga o guia [DEPLOY_24_7_GRATIS.md](./DEPLOY_24_7_GRATIS.md) adicionando essa URL no UptimeRobot para mantê-lo ativo 24/7!

---

## 3. Passo a Passo para o Sistema 1 (Alko — Privado da Empresa)

Para o seu repositório privado da Alko que já está no Render:

### Configuração do Arquivo `src/config/branding.ts` no Projeto Alko:
No seu repositório da Alko, garanta que o arquivo `src/config/branding.ts` esteja com os dados da empresa:

```typescript
export const COMPANY_CONFIG: CompanyBrandingConfig = {
  companyName: 'Alko',
  companyFullName: 'Alko do Brasil',
  systemTitle: 'Alko - Gestão de TI e Facilities',
  companyDomain: 'alko.com.br',
  supportEmail: 'ti@alko.com.br',
  adminEmail: 'seu-email@alko.com.br',
  primaryColor: '#0284c7', // Azul corporativo Alko
  accentColor: '#0369a1',
  defaultSlaHours: 4,
  allowCustomPriorities: true,
  enableDepartmentFilter: true,
  copyrightYear: 2026,
};
```

### Funcionalidade de Timeout de Sessão no Projeto Alko:
O sistema de controle de sessão por inatividade que criamos é universal e funciona perfeitamente também na Alko:
- O Administrador acessa o botão **"Políticas de Segurança"** no cabeçalho ou na barra lateral.
- Define o tempo limite desejado (ex: 15 minutos, padrão de segurança corporativo).
- Seleciona a norma de conformidade (ISO 27001, LGPD ou SOX).
- Clica em **"Salvar Diretrizes"**.
- A partir desse momento, qualquer colaborador que ficar 15 minutos sem mover o mouse ou teclar receberá um aviso sonoro/visual prévio e será deslogado automaticamente, impedindo que pessoas não autorizadas usem estações de trabalho abertas!

### Ativação do Modo de Manutenção Programada:
Tanto na Alko quanto no Portal ITSM, o Administrador pode ativar o aviso de manutenção com previsão de retorno para os usuários:
- Consulte o guia completo: [MANUTENCAO_E_STATUS.md](./MANUTENCAO_E_STATUS.md)

---

## 4. Como Divulgar no LinkedIn

Com o `Portal Chamados ITSM` no ar, utilize o modelo pronto disponível em:
[LINKEDIN_POST_TEMPLATE.md](./LINKEDIN_POST_TEMPLATE.md)

Principais pontos para destacar na sua publicação:
1. **Inovação Técnica:** Desenvolvido em React 19, TypeScript, Tailwind CSS, com arquitetura responsiva para desktop e celular.
2. **Design Profissional:** Interface inspirada nos padrões do ServiceNow, com cores sóbrias (preto fosco, verde suave) e fundo temático de infraestrutura em nuvem.
3. **Segurança & Governança:** Trilha imutável de auditoria com exportação em CSV e **módulo de expiração de sessão por inatividade configurável** para conformidade com **ISO/IEC 27001 e LGPD**.
4. **Disponibilidade Contínua:** Demonstração online 24/7 com link funcional para testes.
5. **Código Aberto:** Repositório no GitHub com documentação completa.
