import { User, Demand, QuickNote, AuditLogItem, AppNotification } from '../types';

// Base de Usuários Mestre Inicial (Genérica e Limpa para Distribuição Pública)
export const INITIAL_USERS: (User & { passwordHash?: string })[] = [
  {
    id: 'usr-admin',
    name: 'Administrador do Sistema',
    email: 'admin@itsm.local',
    role: 'Administrador',
    department: 'Tecnologia da Informação',
    avatarUrl: '',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
    passwordHash: 'Admin@2026'
  }
];

// Base Limpa em Produção (Sem chamados fictícios)
export const INITIAL_DEMANDS: Demand[] = [];

// Base Limpa em Produção (Sem notas adesivas fictícias)
export const INITIAL_NOTES: QuickNote[] = [];

// Registro inicial de auditoria
export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-init-system',
    action: 'Criação',
    description: 'Sistema Portal-Chamados-ITSM inicializado com sucesso em modo de produção.',
    userEmail: 'admin@itsm.local',
    userName: 'Administrador do Sistema',
    entityType: 'Usuário',
    timestamp: '2025-01-01T00:00:00Z'
  }
];

// Notificações limpas
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
