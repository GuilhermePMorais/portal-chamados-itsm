# Guia de Customização e White-Label

Este manual orienta o processo de adaptação do sistema para a identidade visual, estrutura organizacional e regras de negócio de qualquer empresa em poucos passos.

---

## Sumário
1. [Personalização Centralizada (`src/config/branding.ts`)](#1-personalização-centralizada)
2. [Substituição de Logotipo e Favicon](#2-substituição-de-logotipo-e-favicon)
3. [Configuração de Departamentos e Setores](#3-configuração-de-departamentos-e-setores)
4. [Ajuste de Paleta de Cores](#4-ajuste-de-paleta-de-cores)
5. [Alteração do Prefixo de Numeração dos Chamados](#5-alteração-do-prefixo-de-numeração-dos-chamados)
6. [Configuração de Destinatários de Notificações](#6-configuração-de-destinatários-de-notificações)
7. [Configuração do Usuário Administrador Principal](#7-configuração-do-usuário-administrador-principal)

---

## 1. Personalização Centralizada

A parametrização de marca, nomes e canais de contato está centralizada no arquivo:
`src/config/branding.ts`

Abra este arquivo em um editor de código e altere os campos conforme a organização:

```typescript
export const COMPANY_CONFIG: CompanyConfig = {
  // Nome e identificação corporativa
  companyName: 'Minha Empresa S/A',
  companyFullName: 'Minha Empresa Tecnologia e Indústria Ltda.',

  // Identificação do portal
  systemTitle: 'Portal de Gestão & TI',
  systemSubtitle: 'Atendimento, Suporte & Chamados',

  // Prefixo dos chamados (ex: TIK-101, SUP-101, EMP-101)
  ticketPrefix: 'SUP',

  // Domínio institucional e contatos
  companyDomain: 'minhaempresa.com.br',
  supportEmail: 'suporte@minhaempresa.com.br',
  adminEmail: 'admin@minhaempresa.com.br',

  // Cor de destaque (código hexadecimal)
  primaryColor: '#005088',

  // Estrutura departamental
  departments: [
    'Tecnologia da Informação',
    'Infraestrutura & Redes',
    'Manutenção & Predial',
    'Recursos Humanos',
    'Financeiro & Fiscal',
    'Operações & Logística'
  ],

  // Rodapé de governança
  copyrightNotice: '© 2026 Minha Empresa S/A. Todos os direitos reservados.'
};
```

Ao salvar o arquivo, os cabeçalhos, formulários de triagem, alertas e relatórios refletirão os dados automaticamente.

---

## 2. Substituição de Logotipo e Favicon

### Método A: Utilizando imagem PNG ou SVG externa
1. Salve o arquivo de logotipo (formato PNG ou SVG com fundo transparente) no diretório `public/` (exemplo: `public/logo-empresa.png`).
2. No arquivo `src/config/branding.ts`, indique o caminho no campo:
   ```typescript
   customLogoUrl: '/logo-empresa.png',
   customIconUrl: '/icone-empresa.png',
   ```
3. No componente `src/components/Header.tsx`, substitua a exibição pelo elemento de imagem correspondente caso queira renderizar o arquivo diretamente.

### Método B: Logotipo Vetorial Nativo
Para manter a renderização vetorial ultraleve sem arquivos externos, você pode editar diretamente o componente `src/components/PortalLogo.tsx`, ajustando as cores e as formas vetoriais SVG da sua marca.

---

## 3. Configuração de Departamentos e Setores

Os departamentos são exibidos nos formulários de abertura de chamados, filtros da visualização Kanban e no gerenciamento de equipe.

Para customizar:
1. No arquivo `src/config/branding.ts`, edite o array `departments`.
2. Para adicionar opções estritas de tipagem, atualize a definição do tipo `Department` no arquivo `src/types/index.ts`.

---

## 4. Ajuste de Paleta de Cores

O sistema utiliza Tailwind CSS para a folha de estilos:
- As cores de ação principais utilizam classes neutras e sóbrias (`bg-slate-900`, `bg-blue-600`, `bg-emerald-600`).
- Para personalizar os tons da sua identidade institucional, você pode definir as variáveis no arquivo `src/index.css` ou mapear cores customizadas no arquivo de configuração do Tailwind.

Classes de prioridade de SLA:
- Crítico: Fundo vermelho claro com texto contrastante escuro.
- Alto: Fundo âmbar com texto contrastante escuro.
- Médio: Fundo azul suave com texto escuro.
- Baixo: Fundo cinza ardósia com texto escuro.

---

## 5. Alteração do Prefixo de Numeração dos Chamados

A numeração sequencial dos chamados adota por padrão um prefixo de 2 a 3 letras seguido do número da demanda (exemplo: `TK-101`, `SUP-101`, `EMP-101`).

Para alterar:
1. Defina o prefixo desejado no campo `ticketPrefix` em `src/config/branding.ts`.
2. O serviço de persistência (`src/lib/storage.ts`) utilizará esse prefixo ao gerar novos registros.

---

## 6. Configuração de Destinatários de Notificações

Para direcionar os alertas de novos chamados críticos e chamados de facilities para e-mails institucionais específicos da sua equipe:
1. Acesse o arquivo `src/lib/storage.ts`.
2. Localize a função `generateEmailAlertNotification`.
3. Ajuste os e-mails de destino para as contas dos seus analistas ou grupos de distribuição.

---

## 7. Configuração do Usuário Administrador Principal

Para iniciar a operação da sua empresa com seu próprio login administrativo:
1. Abra o arquivo `src/lib/initialData.ts`.
2. No array `INITIAL_USERS`, atualize o nome, e-mail e senha inicial para a conta corporativa designada.
3. Após o primeiro acesso, novos usuários e perfis podem ser criados diretamente pela aba "Equipe & Acessos".
