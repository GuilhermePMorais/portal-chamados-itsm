# Portal Chamados ITSM — Sistema Corporativo de Chamados, ITSM & Facilities

<p align="center">
  <img src="public/portal-logo.svg" width="90" height="90" alt="Logo do Portal ITSM" />
</p>

<p align="center">
  <b>Plataforma corporativa open source para Gestão de Incidentes (ITIL), Chamados de TI, Manutenção Predial/Facilities, Controle de SLA e Trilha de Auditoria (LGPD / ISO 27001).</b><br>
  Interface moderna com paleta fosca inspirada no ServiceNow, fundo temático de redes/nuvem e controle de segurança de sessão por inatividade.
</p>

---

## Comparativo: Solução Open Source vs. Grandes Plataformas do Mercado

Grandes organizações frequentemente enfrentam custos recorrentes elevados por licença de agente, contratos plurianuais rígidos e implementações lentas ao adotar plataformas proprietárias do mercado.

O **Portal Chamados ITSM** foi desenvolvido para oferecer a robustez funcional exigida por departamentos de TI e Operações, mantendo autonomia completa sobre o código e a infraestrutura:

| Critério / Funcionalidade | Portal Chamados ITSM | Grandes Plataformas do Mercado |
| :--- | :---: | :---: |
| **Custo de Licenciamento** | Gratuito e Open Source (Sem custos por agente) | Cobrança recorrente em moeda estrangeira por agente |
| **Soberania e Controle de Dados** | Total (Hospedagem on-premises ou nuvem própria) | Armazenamento em nuvens de terceiros com dependência de fornecedor |
| **Adequação LGPD e Governança** | Integrada nativamente (Logs de auditoria e controle de acesso) | Exige módulos adicionais ou configurações avançadas |
| **Tempo Limite de Sessão (ISO 27001)** | Configurável pelo administrador (10, 15, 30 min) com aviso sonoro | Requer add-ons de SSO / IAM de terceiros |
| **Módulo Unificado de Facilities & Predial** | Integrado nativamente à fila de chamados | Requer módulos adicionais ou licenciamento complementar |
| **Quadro Kanban Interativo** | Disponível com arrastar e soltar e fluxo ágil | Disponível sob planos avançados |
| **Sincronização Contínua em Tempo Real** | Integrada (compatível com desktop e dispositivos móveis) | Muitas vezes restrita ou dependente de módulos extras |
| **Customização e Identidade Visual (White-Label)** | Configuração simplificada e centralizada (`branding.ts`) | Parametrização complexa dependente de consultorias |
| **Tempo de Implementação** | Imediato (suporte a Docker e deploy simplificado) | Semanas a meses de planejamento e parametrização |

---

## Principais Funcionalidades

- **Gestão de Chamados e Incidentes (ITSM / ITIL)**:
  - Níveis de prioridade com cálculo e acompanhamento de SLA em tempo real.
  - Fila de triagem com atribuição de responsáveis técnicos, histórico de interações e anexos.
- **Políticas de Segurança da Informação & Sessão (ISO 27001 / LGPD)**:
  - O administrador define o tempo máximo de inatividade para desconexão automática (10 min, 15 min, 30 min ou personalizado).
  - Alerta visual e sonoro com contagem regressiva antes da desconexão forçada.
  - Registro de eventos de segurança no log de auditoria.
- **Módulo Integrado de TI e Facilities**:
  - Centralização de requisições tecnológicas (Hardware, Software, Redes) e ordens de serviço de infraestrutura predial (Elétrica, Ar-condicionado, Obras, Hidráulica).
- **Indicadores Operacionais e Relatórios**:
  - Métricas de tempo de atendimento, taxa de resolução dentro do prazo acordado e distribuição de demandas por setor.
- **Controle de Acesso Baseado em Perfis (RBAC)**:
  - Perfis definidos para Administrador, Supervisor, Técnico e Colaborador, assegurando isolamento setorial e sigilo de informações.
- **Trilha de Auditoria Imutável (Compliance & Governança)**:
  - Rastreabilidade cronológica de todas as operações com exportação em CSV para relatórios de auditoria externa.
- **Interface Responsiva & Design Corporativo**:
  - Paleta com foco em ergonomia visual no estilo ServiceNow (preto grafite fosco `#121820`, branco e verde suave `#10b981`), com fundo sutil temático de infraestrutura em nuvem.

---

## Documentação e Guias Prontos

- [Como Deixar Online 24/7 Grátis no Render](./DEPLOY_24_7_GRATIS.md) — Passo a passo para manter no ar ininterruptamente sem custo.
- [Guia de Separação das Duas Versões (Alko vs. ITSM)](./GUIA_DUAS_VERSOES.md) — Como gerenciar o repositório privado e o público sem misturar credenciais.
- [Guia de Deploy Geral](./DEPLOYMENT_GUIDE.md) — Instruções detalhadas para Render, Vercel, Railway e VPS.
- [Guia de Customização White-Label](./CUSTOMIZATION_GUIDE.md) — Como personalizar logos, temas, e-mails e departamentos.
- [Documentação Técnica de Arquitetura](./DOCUMENTACAO_TECNICA.md) — Diagrama de componentes, rotas e modelos de dados.
- [Modelo de Publicação para LinkedIn](./LINKEDIN_POST_TEMPLATE.md) — Texto pronto para divulgação profissional.

---

## Arquitetura e Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend e API**: Node.js, Express, Vite.
- **Persistência de Dados**: Armazenamento estruturado com sincronização centralizada em tempo real.
- **Infraestrutura**: Compatível com Docker, Docker Compose, Nginx, servidores locais e provedores de nuvem (Render, Railway, Cloud Run, VPS).

---

## Inicialização Rápida

### Requisitos Prévios
- Node.js versão 18 ou superior.
- Git instalado.

### Procedimento

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU-USUARIO/portal-chamados-itsm.git
cd portal-chamados-itsm

# 2. Instalar dependências
npm install

# 3. Executar o servidor de desenvolvimento
npm run dev
```

Acesse a interface no navegador pelo endereço `http://localhost:3000`.

### Acesso Inicial de Administrador

| Perfil | E-mail Padrão | Senha Padrão | Nível de Permissão |
|---|---|---|---|
| **Administrador do Sistema** | `admin@itsm.local` | `Admin@2026` | Acesso Total (Configurações, Usuários, Auditoria) |

*Recomendação de Segurança: Altere a senha padrão logo no primeiro acesso através da aba "Equipe e Acessos" ou no perfil de usuário.*

---

## Personalização para sua Empresa (White-Label)

O sistema foi arquitetado para ser completamente adaptável a qualquer organização em menos de 2 minutos.

Basta editar o arquivo `src/config/branding.ts`:

```typescript
export const COMPANY_CONFIG: CompanyBrandingConfig = {
  companyName: 'Nome da Sua Empresa',
  companyFullName: 'Razão Social Completa da Organização Ltda.',
  systemTitle: 'Portal de Atendimento e TI',
  companyDomain: 'suaempresa.com.br',
  supportEmail: 'suporte@suaempresa.com.br',
  adminEmail: 'admin@suaempresa.com.br',
  // ...
};
```

Para instruções passo a passo detalhadas, consulte o arquivo [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md).

---

## Documentação Completa

- [Guia de Deploy em Nuvem Gratuita](./DEPLOYMENT_GUIDE.md) — Passo a passo para colocar no ar com HTTPS.
- [Guia de Customização White-Label](./CUSTOMIZATION_GUIDE.md) — Como personalizar logos, temas, e-mails e departamentos.
- [Documentação Técnica de Arquitetura](./DOCUMENTACAO_TECNICA.md) — Diagrama de componentes, rotas e modelos de dados.
- [Trilha de Auditoria e Conformidade](./AUDIT_COMPLIANCE.md) — Políticas de retenção e conformidade LGPD / ISO 27001.
- [Modelo de Publicação para LinkedIn](./LINKEDIN_POST_TEMPLATE.md) — Texto pronto para divulgação profissional.

---

## Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
