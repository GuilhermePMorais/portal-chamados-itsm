export type UserRole = 
  | 'Administrador'
  | 'Supervisor de Facilities'
  | 'Técnico de Manutenção / Facilities'
  | 'Analista'
  | 'Assistente'
  | 'Técnico'
  | 'Auxiliar'
  | 'Colaborador (Funcionário)';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
}

export type DemandStatus = 
  | 'A Fazer'
  | 'Em Andamento'
  | 'Aguardando Fornecedor'
  | 'Em Testes'
  | 'Concluído';

export type DemandPriority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type DemandCategory = 
  | 'Hardware'
  | 'Software'
  | 'Redes & Internet'
  | 'Acessos & Contas'
  | 'Impressoras'
  | 'Telefonia'
  | 'ERP / SAP'
  | 'Facilities & Infra';

export interface DemandComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface Demand {
  id: string;
  code: string; // Ex: ALK-101
  title: string;
  description: string;
  requester: string;
  requesterEmail: string;
  department: string;
  category: DemandCategory;
  priority: DemandPriority;
  status: DemandStatus;
  assignedTo?: string; // Nome do técnico responsável
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  resolutionTimeHours?: number;
  comments: DemandComment[];
  tags: string[];
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'rose';
  pinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  action: 'Criação' | 'Atualização' | 'Exclusão' | 'Login' | 'Status Alterado' | 'Permissão';
  description: string;
  userEmail: string;
  userName: string;
  entityType: 'Demanda' | 'Nota' | 'Usuário' | 'Autenticação';
  entityId?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  ticketCode?: string;
  ticketId?: string;
  senderName: string;
  recipientRoles: UserRole[];
  read: boolean;
  emailSent: boolean;
  emailDetails?: {
    from: string;
    to: string[];
    subject: string;
    bodyHtml: string;
    sentAt: string;
  };
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'kanban' | 'demands' | 'notes' | 'audit' | 'team';

export interface SecuritySettings {
  /** Tempo limite de inatividade em minutos (0 = Desativado, 5, 10, 15, 30, 60, 120, 240, 480) */
  sessionTimeoutMinutes: number;
  /** Tempo em segundos para exibir o aviso prévio de expiração da sessão */
  warningBeforeSeconds: number;
  /** Exigir reautenticação após troca de permissões */
  strictReauth: boolean;
  /** Notificação ao administrador sobre logoffs forçados */
  logTimeoutEvents: boolean;
  /** Política de conformidade selecionada (ex: ISO 27001, LGPD, Personalizado) */
  complianceStandard: 'ISO 27001' | 'LGPD' | 'Personalizado';
  /** Modo de manutenção programada do sistema */
  maintenanceMode?: boolean;
  /** Mensagem exibida para os usuários durante a manutenção */
  maintenanceMessage?: string;
  /** Previsão de retorno ou conclusão da manutenção */
  maintenanceEstimatedReturn?: string;
  /** Data da última alteração das diretrizes de segurança */
  updatedAt: string;
}

export interface AzureRoleMapping {
  id: string;
  azureIdentifier: string; // E-mail, UPN ou ID de Grupo do Azure AD (ex: diretoria@empresa.com ou Grupo_TI)
  assignedRole: UserRole;
  description?: string;
}

export interface AzureAdConfig {
  enabled: boolean;
  tenantId: string;
  clientId: string;
  redirectUri: string;
  defaultRole: UserRole;
  autoProvisionUsers: boolean;
  roleMappings: AzureRoleMapping[];
}
