# Documentação Técnica — Alko IT Demand Management

## 1. Visão Geral da Arquitetura

O sistema é construído sobre uma arquitetura SPA (*Single Page Application*) moderna, rápida e independente, utilizando **React 19**, **TypeScript**, **Tailwind CSS v4** e empacotador **Vite**.

### Pilha Tecnológica:
- **Linguagem:** TypeScript 5.8+ (tipagem estática rigorosa para evitar falhas em tempo de execução).
- **Frontend Framework:** React 19 (Componentes funcionais com Hooks).
- **Estilização:** Tailwind CSS v4 com design tokens para contraste WCAG AA.
- **Ícones:** Lucide React (padronização visual enterprise sem dependências pesadas).
- **Animações e Transições:** Motion / CSS transitions nativas com aceleração por hardware.
- **Camada de Dados:** `StorageService` híbrido (persiste localmente em `localStorage` e possui integração plug-and-play com `Supabase` para sincronização em nuvem).

---

## 2. Estrutura de Diretórios

```
├── public/
│   ├── alko-logo.svg          # Logotipo oficial Alko em vetor com fundo transparente
│   └── pharma-bg.jpg          # Imagem de fundo institucional farmacêutica/biotecnologia
├── src/
│   ├── components/
│   │   ├── AlkoLogo.tsx       # Componente de marca vetorizado (fundo transparente, não invasivo)
│   │   ├── AuditLog.tsx       # Tabela de trilha de auditoria e exportação CSV
│   │   ├── Dashboard.tsx      # Indicadores de SLA, gráficos e alertas críticos
│   │   ├── DemandList.tsx     # Listagem de chamados com filtros e busca
│   │   ├── DemandModal.tsx    # Modal de criação/edição de chamados com comentários
│   │   ├── Header.tsx         # Cabeçalho fixo com logo, perfil e ações rápidas
│   │   ├── KanbanBoard.tsx    # Quadro Kanban interativo com botões de avanço por toque
│   │   ├── LoginModal.tsx     # Autenticação com credenciais e atalhos rápidos
│   │   ├── QuickNotes.tsx     # Notas rápidas adesivas coloridas
│   │   ├── Sidebar.tsx        # Navegação desktop e drawer retrátil mobile
│   │   ├── TeamManagement.tsx # Painel de equipe e permissões (Restrito Admin)
│   │   └── Toast.tsx          # Notificações contextuais não intrusivas
│   ├── lib/
│   │   ├── storage.ts         # Mecanismo de persistência e orquestração de dados
│   │   └── supabase.ts        # Conector opcional para banco de dados relacional
│   ├── types.ts               # Definições de tipos e interfaces TypeScript
│   ├── App.tsx                # Componente raiz, estados globais e roteamento interno
│   ├── main.tsx               # Ponto de entrada do React
│   └── index.css              # Importação do Tailwind CSS e fontes do sistema
├── index.html                 # Ponto de entrada HTML com metadados institucionais
├── package.json               # Gerenciador de dependências e scripts do Node.js
├── tsconfig.json              # Configuração do compilador TypeScript
└── vite.config.ts             # Configuração do Vite
```

---

## 3. Modelo de Dados (`types.ts`)

### `Demand` (Demanda / Chamado de TI):
```typescript
interface Demand {
  id: string;                    // Ex: 'DEM-1001'
  title: string;                 // Título resumido da demanda
  description: string;           // Detalhamento do chamado
  category: DemandCategory;      // 'Hardware' | 'Software' | 'Rede & Telefonia' | 'Facilities' | 'Acessos & Contas' | 'Outros'
  priority: Priority;            // 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  status: DemandStatus;          // 'Pendente' | 'Em Análise' | 'Em Andamento' | 'Bloqueado' | 'Concluído'
  requesterName: string;         // Nome do solicitante (ex: Almoxarifado, Produção, etc.)
  requesterEmail: string;        // E-mail do solicitante
  department: string;            // Departamento interno
  assignedTo?: string;           // E-mail do técnico ou analista responsável
  createdAt: string;             // Data de criação (ISO string)
  updatedAt: string;             // Última alteração (ISO string)
  dueDate?: string;              // Prazo de conclusão acordado
  comments: Comment[];           // Histórico de notas e atualizações da demanda
  tags: string[];                // Marcadores contextuais (ex: 'SAP', 'Manutenção')
}
```

### `User` (Usuário do Sistema):
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Supervisor Facilities' | 'Analista de Sistemas' | 'Técnico de Suporte';
  department: string;
  avatar?: string;
  createdAt: string;
}
```

---

## 4. Camada de Persistência (`StorageService`)

A persistência opera no padrão **Offline-First**:
1. Ao iniciar o sistema, `StorageService` verifica se há dados salvos no `localStorage` do navegador sob as chaves:
   - `alko_demands_v2`
   - `alko_users_v2`
   - `alko_notes_v2`
   - `alko_audit_logs_v2`
   - `alko_current_user_v2`
2. Se o usuário estiver acessando pela primeira vez, o serviço inicializa a base com registros corporativos realistas da Alko do Brasil (demandas de facilities, manutenção de rede, reparos de impressoras térmicas, suporte a ERP).
3. Todas as alterações (criação, edição, exclusão de notas, movimentação no Kanban) disparam salvamento automático imediato.
4. Qualquer administrador pode clicar no botão **"Restaurar Dados da Alko"** na barra lateral para recarregar a base de demonstração original a qualquer momento.

---

## 5. Conexão com Supabase (Persistência em Nuvem Multi-Usuário Gratuita)

Se a sua equipe desejar que múltiplos computadores em locais físicos diferentes compartilhem a mesma base de dados em tempo real pela internet, você pode conectar o **Supabase** gratuitamente:

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito.
2. No painel do Supabase, acesse **Project Settings** -> **API**.
3. Copie a `URL` do projeto e a chave `anon public`.
4. Crie um arquivo `.env` na raiz do projeto (ou adicione as variáveis no seu serviço de hospedagem como Vercel/Netlify):
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```
5. O conector em `src/lib/supabase.ts` detectará as variáveis automaticamente.

---

## 6. Otimizações de Acessibilidade & Mobile First

- **Área Mínima de Toque:** Todos os botões, abas, links e seletores possuem no mínimo `44px` de altura (`min-h-[44px]` ou `min-w-[44px]`), garantindo facilidade de uso em celulares e telas industriais sensíveis ao toque.
- **Navegação Móvel Flutuante:** Em telas com largura menor que 1024px (smartphones e tablets), uma barra de navegação inferior tátil fixa surge na base da tela, permitindo troca imediata entre Dashboard, Kanban, Demandas e Notas.
- **Logotipo Institucional Inteligente:**
  - Desenhado em vetor SVG puro.
  - Fundo 100% transparente.
  - Ajuste de dimensões equilibrado para não poluir visualmente nem criar distrações nos fluxos de trabalho.
- **Plano de Fundo Farmacêutico:**
  - Imagem de alta definição com sobreposição de camada de difusão (`bg-slate-50/92 backdrop-blur-[1px]`), preservando 100% da nitidez de textos e contrastes corporativos.
