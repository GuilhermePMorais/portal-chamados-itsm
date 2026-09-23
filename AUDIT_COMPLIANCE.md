# Trilha de Auditoria, Conformidade e Governança (LGPD / ISO 27001)

Este documento especifica a arquitetura técnica, os requisitos de conformidade regulatória (LGPD e ISO/IEC 27001) e os mecanismos de controle implementados no módulo de auditoria do sistema.

---

## 1. Objetivos da Trilha de Auditoria

Em ambientes corporativos e departamentos de TI, qualquer alteração em chamados, permissões de usuários e dados sensíveis deve ser registrada de forma auditável e com integridade comprovada.

O sistema foi arquitetado segundo os seguintes princípios:
1. **Rastreabilidade**: Cada operação de inclusão, alteração de status, troca de prioridade, exclusão ou login gera um registro com data e hora no padrão ISO 8601 UTC.
2. **Não-Repúdio**: A ação é vinculada ao identificador único do usuário, e-mail institucional e nome completo.
3. **Conformidade com a LGPD (Lei nº 13.709/2018)**:
   - Artigo 6º (Segurança e Transparência): Mecanismos técnicos para proteção de dados contra acessos não autorizados.
   - Artigo 37º (Relatório de Impacto à Proteção de Dados): Histórico transparente de operações realizadas sobre registros e perfis de usuários.
4. **Alinhamento com a ISO/IEC 27001 (Controle A.12.4 - Registro de Eventos e Auditoria)**:
   - Registro cronológico das atividades de usuários e eventos de acesso ao sistema.

---

## 2. Estrutura de Dados do Log de Auditoria

Cada registro de evento na trilha de auditoria obedece à interface TypeScript (`AuditLogItem`):

```typescript
export interface AuditLogItem {
  /** Identificador único do log (UUID / timestamp unívoco) */
  id: string;

  /** Tipo de ação executada */
  action: 'Criação' | 'Edição' | 'Exclusão' | 'Status' | 'Prioridade' | 'Autenticação' | 'Acesso' | 'Sincronização';

  /** Descrição detalhada da ação */
  description: string;

  /** E-mail corporativo do autor da ação */
  userEmail: string;

  /** Nome completo do autor da ação */
  userName: string;

  /** Entidade afetada */
  entityType: 'Demanda' | 'Nota' | 'Usuário' | 'Autenticação';

  /** Identificador do registro afetado (ex: ALK-101 ou usr-123) */
  entityId?: string;

  /** Carimbo de data/hora oficial no padrão UTC (ISO 8601) */
  timestamp: string;

  /** Metadados complementares da operação */
  metadata?: Record<string, any>;
}
```

---

## 3. Eventos Monitorados Automaticamente

O sistema audita os seguintes eventos operacionais:

| Categoria | Ação Auditada | Ponto de Registro no Código |
|---|---|---|
| **Chamados / Demandas** | Abertura de novo chamado | `StorageService.createDemand()` |
| **Chamados / Demandas** | Mudança de status (ex: Aberto para Em Atendimento) | `StorageService.updateDemand()` |
| **Chamados / Demandas** | Atribuição de técnico responsável | `StorageService.updateDemand()` |
| **Chamados / Demandas** | Exclusão de chamado | `StorageService.deleteDemand()` |
| **Notas & Avisos** | Criação, fixação e remoção de notas operacionais | `StorageService.saveNote()`, `deleteNote()` |
| **Segurança & Usuários** | Criação de novo colaborador | `StorageService.createUser()` |
| **Segurança & Usuários** | Alteração de perfil de acesso | `StorageService.updateUser()` |
| **Segurança & Usuários** | Desativação ou revogação de credenciais | `StorageService.deleteUser()` |
| **Autenticação** | Logins efetuados com sucesso | `StorageService.authenticateUser()` |

---

## 4. Visualização e Filtragem da Trilha

A trilha de auditoria é restrita exclusivamente a perfis com papel de Administrador:

1. Acesse o sistema com credenciais de Administrador.
2. Na barra lateral de navegação, acesse a aba "Auditoria & Logs".
3. Recursos disponíveis:
   - **Busca por texto**: Pesquisa por e-mail, nome do usuário ou código do chamado.
   - **Filtro por Ação**: Filtragem por inclusão, alteração ou exclusão.
   - **Filtro por Período**: Seleção por data de ocorrência.
   - **Exportação para CSV**: Geração de arquivo estruturado para comprovação em auditorias internas ou externas.

---

## 5. Armazenamento e Integridade dos Registros

- **Persistência Centralizada**: Os logs de auditoria são armazenados em arquivo físico no servidor central (`data/alko_database.json`).
- **Imutabilidade Funcional**: A interface não oferece recursos para exclusão seletiva de eventos de auditoria. Uma vez gerado, o log permanece gravado como histórico permanente.
- **Rotina de Backup Recomendada**: Recomenda-se a realização de cópias de segurança periódicas do diretório de dados em mídias de armazenamento secundárias ou serviços de backup em nuvem.
