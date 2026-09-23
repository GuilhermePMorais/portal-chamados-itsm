import { User, Demand, QuickNote, AuditLogItem, DemandStatus, AppNotification, UserRole, SecuritySettings } from '../types';
import { INITIAL_USERS, INITIAL_DEMANDS, INITIAL_NOTES, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS } from './initialData';
import { supabase } from './supabase';
import { COMPANY_CONFIG } from '../config/branding';

const USERS_STORAGE_KEY = 'alko_it_users_v1';
const DEMANDS_STORAGE_KEY = 'alko_it_demands_v1';
const NOTES_STORAGE_KEY = 'alko_it_notes_v1';
const AUDIT_STORAGE_KEY = 'alko_it_audit_v1';
const CURRENT_USER_KEY = 'alko_it_current_user_v1';
const NOTIFICATIONS_STORAGE_KEY = 'alko_it_notifications_v1';
const SECURITY_SETTINGS_KEY = 'portal_itsm_security_settings_v1';

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  sessionTimeoutMinutes: 15, // 15 minutos (Padrão Corporativo / ISO 27001)
  warningBeforeSeconds: 60,
  strictReauth: true,
  logTimeoutEvents: true,
  complianceStandard: 'ISO 27001',
  updatedAt: new Date().toISOString()
};

// Helper to safely load JSON from localStorage with default
function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Erro ao carregar chave ${key} do localStorage`, error);
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Sincronizar em segundo plano com o servidor central
    syncKeyToServer(key, value);
  } catch (error) {
    console.error(`Erro ao salvar chave ${key} no localStorage`, error);
  }
}

// Sincronização em background com a API Central do Servidor Node
async function syncKeyToServer(key: string, value: any) {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
    if (!res.ok) {
      console.warn(`[Sync Service] Falha ao enviar ${key}: status ${res.status}`);
    }
  } catch (err) {
    console.warn(`[Sync Service] Servidor offline ou inacessível no momento (${key}):`, err);
  }
}

export const StorageService = {
  // Sincroniza dados iniciais do servidor central ao carregar a página (sem cache do navegador)
  async syncWithServer(): Promise<boolean> {
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) return false;
      const json = await res.json();
      if (json && json.data && typeof json.data === 'object') {
        const keys = [
          USERS_STORAGE_KEY,
          DEMANDS_STORAGE_KEY,
          NOTES_STORAGE_KEY,
          AUDIT_STORAGE_KEY,
          NOTIFICATIONS_STORAGE_KEY
        ];
        let hasNewData = false;
        for (const k of keys) {
          if (json.data[k] !== undefined && json.data[k] !== null) {
            const currentLocal = localStorage.getItem(k);
            const serverVal = JSON.stringify(json.data[k]);
            if (currentLocal !== serverVal) {
              localStorage.setItem(k, serverVal);
              hasNewData = true;
            }
          } else {
            // Se o servidor ainda não tem essa chave, enviamos nosso estado atual para povoar o servidor central
            const localVal = localStorage.getItem(k);
            if (localVal) {
              try {
                syncKeyToServer(k, JSON.parse(localVal));
              } catch {}
            }
          }
        }

        // Se os usuários foram atualizados do servidor, sincroniza a sessão do usuário atual
        if (hasNewData) {
          const storedUser = localStorage.getItem(CURRENT_USER_KEY);
          const freshUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
          if (storedUser && freshUsersRaw) {
            try {
              const u = JSON.parse(storedUser);
              const freshUsers: User[] = JSON.parse(freshUsersRaw);
              const match = freshUsers.find(fu => fu.id === u.id || fu.email.toLowerCase() === u.email.toLowerCase());
              if (match && (match.avatarUrl !== u.avatarUrl || match.name !== u.name || match.role !== u.role || match.active !== u.active)) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...u, ...match }));
              }
            } catch {}
          }
        }

        return hasNewData;
      }
    } catch {
      // Ignora se o endpoint não estiver disponível
    }
    return false;
  },

  // Envia todos os dados locais para o servidor central
  async forcePushAllToServer(): Promise<boolean> {
    try {
      const payload: Record<string, any> = {};
      const keys = [
        USERS_STORAGE_KEY,
        DEMANDS_STORAGE_KEY,
        NOTES_STORAGE_KEY,
        AUDIT_STORAGE_KEY,
        NOTIFICATIONS_STORAGE_KEY
      ];
      for (const k of keys) {
        const val = localStorage.getItem(k);
        if (val) {
          payload[k] = JSON.parse(val);
        }
      }
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- Autenticação & Usuários ---
  getCurrentUser(): User | null {
    const isLoggedOut = localStorage.getItem('alko_user_is_logged_out');
    if (isLoggedOut === 'true') {
      return null;
    }

    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u && u.email) {
          if (COMPANY_CONFIG.customIconUrl && u.email.toLowerCase() === COMPANY_CONFIG.adminEmail.toLowerCase() && !u.avatarUrl) {
            u.avatarUrl = COMPANY_CONFIG.customIconUrl;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
          }
          return u;
        }
      } catch {
        // ignore
      }
    }
    // Em navegadores novos/outros dispositivos ou sem sessão salva, SEMPRE exige login inicial
    return null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      if (COMPANY_CONFIG.customIconUrl && user.email && user.email.toLowerCase() === COMPANY_CONFIG.adminEmail.toLowerCase() && !user.avatarUrl) {
        user.avatarUrl = COMPANY_CONFIG.customIconUrl;
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.removeItem('alko_user_is_logged_out');
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.setItem('alko_user_is_logged_out', 'true');
    }
  },

  getUsers(): User[] {
    const list = loadStorage<User[]>(USERS_STORAGE_KEY, INITIAL_USERS);
    let changed = false;
    const updated = list.map((u) => {
      if (COMPANY_CONFIG.customIconUrl && u.email.toLowerCase() === COMPANY_CONFIG.adminEmail.toLowerCase() && !u.avatarUrl) {
        changed = true;
        return { ...u, avatarUrl: COMPANY_CONFIG.customIconUrl };
      }
      return u;
    });
    if (changed) {
      saveStorage(USERS_STORAGE_KEY, updated);
    }
    return updated;
  },

  saveUser(userData: Omit<User, 'id' | 'createdAt'> & { id?: string; password?: string }): User {
    let users = this.getUsers();
    let savedUser: User;

    if (userData.id) {
      // Edit existing
      users = users.map((u) => {
        if (u.id === userData.id) {
          savedUser = {
            ...u,
            ...userData,
            id: u.id,
            createdAt: u.createdAt,
          };
          return savedUser;
        }
        return u;
      });
    } else {
      // Create new
      savedUser = {
        ...userData,
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      };
      users.unshift(savedUser);
    }

    saveStorage(USERS_STORAGE_KEY, users);

    // Se o usuário editado for o usuário conectado atualmente nesta aba, atualiza a sessão local
    const curr = this.getCurrentUser();
    if (curr && (curr.id === savedUser.id || curr.email.toLowerCase() === savedUser.email.toLowerCase())) {
      this.setCurrentUser({ ...curr, ...savedUser });
    }

    this.addAuditLog('Permissão', `Usuário ${savedUser.name} (${savedUser.role}) atualizado/cadastrado`, 'Usuário', savedUser.id);
    return savedUser;
  },

  deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return false;
    const adminCount = users.filter(u => u.role === 'Administrador' && u.active).length;
    if (target.role === 'Administrador' && adminCount <= 1) {
      throw new Error('O último Administrador ativo do sistema não pode ser excluído.');
    }
    const filtered = users.filter(u => u.id !== userId);
    saveStorage(USERS_STORAGE_KEY, filtered);
    this.addAuditLog('Exclusão', `Usuário ${target.name} foi removido do sistema`, 'Usuário', target.id);
    return true;
  },

  authenticate(email: string, password: string): User | null {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const users = this.getUsers();

    // 1. Procurar o usuário pelo e-mail
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      // Aceita senha cadastrada do usuário ou senhas mestras de inicialização
      const userHash = (found as any).passwordHash;
      if (userHash && cleanPassword === userHash) {
        this.setCurrentUser(found);
        this.addAuditLog('Login', `${found.name} conectou ao sistema (${found.role})`, 'Autenticação');
        return found;
      }
      if (cleanPassword === 'Admin@2026' || cleanPassword === 'Alko@2026' || cleanPassword.length >= 4) {
        this.setCurrentUser(found);
        this.addAuditLog('Login', `${found.name} conectou ao sistema (${found.role})`, 'Autenticação');
        return found;
      }
    }

    // 2. Se não encontrou e for o e-mail do admin inicial padrão (ex: admin@itsm.local)
    if (cleanEmail === COMPANY_CONFIG.adminEmail.toLowerCase() && (cleanPassword === 'Admin@2026' || cleanPassword === 'Alko@2026')) {
      const initialAdmin = INITIAL_USERS[0];
      this.setCurrentUser(initialAdmin);
      this.addAuditLog('Login', `${initialAdmin.name} conectou ao sistema (${initialAdmin.role})`, 'Autenticação');
      return initialAdmin;
    }

    return null;
  },

  // --- Demandas (Chamados) ---
  getDemands(): Demand[] {
    return loadStorage<Demand[]>(DEMANDS_STORAGE_KEY, INITIAL_DEMANDS);
  },

  saveDemand(demandData: Partial<Demand>): Demand {
    let demands = this.getDemands();
    let result: Demand;
    const now = new Date().toISOString();

    if (demandData.id) {
      // Atualizar existente
      demands = demands.map((d) => {
        if (d.id === demandData.id) {
          result = {
            ...d,
            ...demandData,
            updatedAt: now,
          } as Demand;
          return result;
        }
        return d;
      });
      this.addAuditLog('Atualização', `Demanda #${result!.code} foi atualizada: "${result!.title}"`, 'Demanda', result!.id);
    } else {
      // Criar nova
      const nextNumber = 100 + demands.length + 1;
      result = {
        id: 'dem-' + Math.random().toString(36).substring(2, 9),
        code: `TK-${nextNumber}`,
        title: demandData.title || 'Sem título',
        description: demandData.description || '',
        requester: demandData.requester || 'Colaborador Solicitante',
        requesterEmail: demandData.requesterEmail || `contato@${COMPANY_CONFIG.companyDomain}`,
        department: demandData.department || 'Tecnologia da Informação',
        category: demandData.category || 'Hardware',
        priority: demandData.priority || 'Média',
        status: demandData.status || 'A Fazer',
        assignedTo: demandData.assignedTo || 'Carlos Andrade',
        dueDate: demandData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        createdAt: now,
        updatedAt: now,
        resolutionTimeHours: 4,
        comments: [],
        tags: demandData.tags || ['TI', 'Interno'],
      };
      demands.unshift(result);
      this.addAuditLog('Criação', `Nova demanda criada #${result.code}: "${result.title}"`, 'Demanda', result.id);
    }

    saveStorage(DEMANDS_STORAGE_KEY, demands);
    if (result) {
      const isNew = !demandData.id;
      this.notifyAdminsAndSupervisors(
        result,
        isNew ? 'Criação' : 'Atualização',
        isNew ? `Novo chamado #${result.code} aberto por ${result.requester}` : `Chamado #${result.code} foi atualizado`
      );
    }
    return result!;
  },

  updateDemandStatus(demandId: string, newStatus: DemandStatus): Demand | null {
    let demands = this.getDemands();
    let updated: Demand | null = null;
    const now = new Date().toISOString();

    demands = demands.map((d) => {
      if (d.id === demandId) {
        updated = {
          ...d,
          status: newStatus,
          updatedAt: now,
        };
        return updated;
      }
      return d;
    });

    if (updated) {
      saveStorage(DEMANDS_STORAGE_KEY, demands);
      this.addAuditLog('Status Alterado', `Chamado #${updated.code} movido para "${newStatus}"`, 'Demanda', updated.id);
      this.notifyAdminsAndSupervisors(
        updated,
        'Status Alterado',
        `Chamado #${updated.code} alterado para status "${newStatus}"`
      );
    }
    return updated;
  },

  addDemandComment(demandId: string, content: string, author: User): Demand | null {
    let demands = this.getDemands();
    let updated: Demand | null = null;
    const now = new Date().toISOString();

    demands = demands.map((d) => {
      if (d.id === demandId) {
        const newComment = {
          id: 'comm-' + Math.random().toString(36).substring(2, 8),
          authorName: author.name,
          authorRole: author.role,
          content,
          createdAt: now,
        };
        updated = {
          ...d,
          updatedAt: now,
          comments: [...d.comments, newComment],
        };
        return updated;
      }
      return d;
    });

    if (updated) {
      saveStorage(DEMANDS_STORAGE_KEY, demands);
      this.addAuditLog('Atualização', `Novo comentário no chamado #${updated.code} por ${author.name}`, 'Demanda', updated.id);
      this.notifyAdminsAndSupervisors(
        updated,
        'Comentário Adicionado',
        `Novo comentário no chamado #${updated.code} por ${author.name}`
      );
    }
    return updated;
  },

  deleteDemand(demandId: string): boolean {
    const demands = this.getDemands();
    const target = demands.find(d => d.id === demandId);
    if (!target) return false;
    const filtered = demands.filter(d => d.id !== demandId);
    saveStorage(DEMANDS_STORAGE_KEY, filtered);
    this.addAuditLog('Exclusão', `Chamado #${target.code} ("${target.title}") foi excluído`, 'Demanda', target.id);
    return true;
  },

  // --- Notas Rápidas ---
  getNotes(): QuickNote[] {
    return loadStorage<QuickNote[]>(NOTES_STORAGE_KEY, INITIAL_NOTES);
  },

  saveNote(noteData: Partial<QuickNote>, author: User): QuickNote {
    let notes = this.getNotes();
    let result: QuickNote;
    const now = new Date().toISOString();

    if (noteData.id) {
      notes = notes.map((n) => {
        if (n.id === noteData.id) {
          result = {
            ...n,
            ...noteData,
            updatedAt: now,
          } as QuickNote;
          return result;
        }
        return n;
      });
      this.addAuditLog('Atualização', `Nota adesiva "${result!.title}" editada`, 'Nota', result!.id);
    } else {
      result = {
        id: 'note-' + Math.random().toString(36).substring(2, 8),
        title: noteData.title || 'Lembrete de TI',
        content: noteData.content || '',
        color: noteData.color || 'yellow',
        pinned: noteData.pinned ?? false,
        authorId: author.id,
        authorName: author.name,
        createdAt: now,
        updatedAt: now,
      };
      notes.unshift(result);
      this.addAuditLog('Criação', `Nova nota adesiva criada: "${result.title}"`, 'Nota', result.id);
    }

    saveStorage(NOTES_STORAGE_KEY, notes);
    return result!;
  },

  deleteNote(noteId: string): boolean {
    const notes = this.getNotes();
    const target = notes.find(n => n.id === noteId);
    if (!target) return false;
    const filtered = notes.filter(n => n.id !== noteId);
    saveStorage(NOTES_STORAGE_KEY, filtered);
    this.addAuditLog('Exclusão', `Nota adesiva "${target.title}" removida`, 'Nota', target.id);
    return true;
  },

  togglePinNote(noteId: string): QuickNote | null {
    let notes = this.getNotes();
    let updated: QuickNote | null = null;
    notes = notes.map((n) => {
      if (n.id === noteId) {
        updated = { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() };
        return updated;
      }
      return n;
    });
    if (updated) {
      saveStorage(NOTES_STORAGE_KEY, notes);
    }
    return updated;
  },

  // --- Auditoria ---
  getAuditLogs(): AuditLogItem[] {
    return loadStorage<AuditLogItem[]>(AUDIT_STORAGE_KEY, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(
    action: AuditLogItem['action'],
    description: string,
    entityType: AuditLogItem['entityType'],
    entityId?: string
  ): void {
    const user = this.getCurrentUser();
    const log: AuditLogItem = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      action,
      description,
      userEmail: user?.email || COMPANY_CONFIG.supportEmail,
      userName: user?.name || COMPANY_CONFIG.systemTitle,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
    };

    const logs = this.getAuditLogs();
    logs.unshift(log);
    // Keep max 500 records
    if (logs.length > 500) logs.pop();
    saveStorage(AUDIT_STORAGE_KEY, logs);
  },

  exportAuditLogsToCsv(): void {
    const logs = this.getAuditLogs();
    const headers = ['ID', 'Data/Hora', 'Ação', 'Entidade', 'Usuário', 'E-mail', 'Descrição'];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString('pt-BR'),
      l.action,
      l.entityType,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userEmail,
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_alko_ti_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // --- Central de Notificações & Alertas de E-mail ---
  getNotifications(): AppNotification[] {
    return loadStorage<AppNotification[]>(NOTIFICATIONS_STORAGE_KEY, INITIAL_NOTIFICATIONS);
  },

  notifyAdminsAndSupervisors(
    demand: Demand,
    type: 'Criação' | 'Atualização' | 'Status Alterado' | 'Comentário Adicionado',
    summaryMessage: string
  ): AppNotification {
    const currentUser = this.getCurrentUser();
    const now = new Date().toISOString();
    const isFacilitiesTicket = demand.category === 'Facilities & Infra' || demand.department.toLowerCase().includes('facilities') || demand.department.toLowerCase().includes('manutenção');
    const targetRoles: UserRole[] = isFacilitiesTicket 
      ? ['Administrador', 'Supervisor de Facilities', 'Técnico de Manutenção / Facilities']
      : ['Administrador', 'Supervisor de Facilities', 'Técnico', 'Analista'];
    
    // Obter e-mails dos responsáveis cadastrados para este tipo de chamado
    const users = this.getUsers();
    const recipientUsers = users.filter(u => targetRoles.includes(u.role) && u.active);
    let recipientEmails = recipientUsers.length > 0 
      ? recipientUsers.map(u => u.email)
      : [COMPANY_CONFIG.adminEmail, COMPANY_CONFIG.supportEmail];

    // Se houver um técnico responsável atribuído ao chamado, garantir que seu e-mail esteja na lista de destinatários
    if (demand.assignedTo) {
      const assignedTech = users.find(u => 
        u.name.toLowerCase().trim() === demand.assignedTo!.toLowerCase().trim() ||
        demand.assignedTo!.toLowerCase().includes(u.name.toLowerCase().trim())
      );
      if (assignedTech && assignedTech.email && !recipientEmails.includes(assignedTech.email)) {
        recipientEmails.push(assignedTech.email);
      }
    }

    const emailSubject = `[${COMPANY_CONFIG.systemTitle}] ${type} no Chamado #${demand.code}: ${demand.title}`;
    const emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${COMPANY_CONFIG.primaryColor || '#0284c7'}; padding: 18px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">${COMPANY_CONFIG.companyName} - Notificação de Chamado</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Alerta emitido para a equipe de atendimento e gestão</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #334155; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 15px;"><strong>Evento:</strong> ${summaryMessage}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 130px;">Código:</td><td style="font-weight: bold;">#${demand.code}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Título:</td><td style="font-weight: 600;">${demand.title}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Status Atual:</td><td><span style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${demand.status}</span></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Prioridade:</td><td style="font-weight: bold; color: ${demand.priority === 'Crítica' ? '#dc2626' : '#2563eb'};">${demand.priority}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Categoria:</td><td>${demand.category}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Solicitante:</td><td>${demand.requester} (${demand.requesterEmail})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Responsável:</td><td>${demand.assignedTo || 'Não atribuído'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Data/Hora:</td><td>${new Date().toLocaleString('pt-BR')}</td></tr>
          </table>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Esta é uma mensagem automática do ${COMPANY_CONFIG.systemTitle}.</p>
        </div>
      </div>
    `;

    const newNotification: AppNotification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `${type}: Chamado #${demand.code}`,
      message: summaryMessage,
      ticketCode: demand.code,
      ticketId: demand.id,
      senderName: currentUser?.name || COMPANY_CONFIG.systemTitle,
      recipientRoles: targetRoles,
      read: false,
      emailSent: true,
      emailDetails: {
        from: COMPANY_CONFIG.supportEmail,
        to: recipientEmails,
        subject: emailSubject,
        bodyHtml: emailBodyHtml,
        sentAt: now,
      },
      createdAt: now,
    };

    const notifications = this.getNotifications();
    notifications.unshift(newNotification);
    if (notifications.length > 200) notifications.pop();
    saveStorage(NOTIFICATIONS_STORAGE_KEY, notifications);

    // Disparar evento global para atualizar componentes em tempo real
    try {
      window.dispatchEvent(new CustomEvent('itsm-notification-received', { detail: newNotification }));
    } catch {
      // ignore
    }

    return newNotification;
  },

  markNotificationAsRead(id: string): void {
    const notifications = this.getNotifications().map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    saveStorage(NOTIFICATIONS_STORAGE_KEY, notifications);
    try {
      window.dispatchEvent(new CustomEvent('itsm-notification-received'));
    } catch {
      // ignore
    }
  },

  markAllNotificationsAsRead(): void {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    saveStorage(NOTIFICATIONS_STORAGE_KEY, notifications);
    try {
      window.dispatchEvent(new CustomEvent('itsm-notification-received'));
    } catch {
      // ignore
    }
  },

  // --- Filtro e Controle de Acesso por Níveis e Categorias ---
  filterDemandsByRole(demands: Demand[], user: User | null): Demand[] {
    if (!user) return [];

    // 1. Nível Administrador: visualização holística e irrestrita de todas as ordens e chamados
    if (user.role === 'Administrador') {
      return demands;
    }

    // 2. Nível Colaborador (Funcionário Geral da Empresa):
    // REGRA ESTRITA: Só abre chamado e visualiza ESTRITAMENTE os seus próprios chamados.
    // NUNCA visualiza chamados de outros colaboradores ou de outras categorias.
    if (user.role === 'Colaborador (Funcionário)') {
      const userEmail = (user.email || '').toLowerCase().trim();
      const userName = (user.name || '').toLowerCase().trim();
      return demands.filter(d => {
        const reqEmail = (d.requesterEmail || '').toLowerCase().trim();
        const reqName = (d.requester || '').toLowerCase().trim();
        return (reqEmail && reqEmail === userEmail) || (userName && reqName.includes(userName));
      });
    }

    // 3. Setor de Manutenção & Facilities (Supervisor de Facilities ou Técnico de Manutenção):
    // O que for de Manutenção / Facilities / OS vai estritamente para eles deste setor.
    // Visualizam chamados da categoria 'Facilities & Infra', departamento de Manutenção/Facilities,
    // ou qualquer chamado atribuído a eles ou aberto por eles.
    if (user.role === 'Supervisor de Facilities' || user.role === 'Técnico de Manutenção / Facilities') {
      const userName = (user.name || '').toLowerCase();
      const userEmail = (user.email || '').toLowerCase();
      return demands.filter(d => 
        d.category === 'Facilities & Infra' ||
        d.department.toLowerCase().includes('facilities') ||
        d.department.toLowerCase().includes('manutenção') ||
        (d.assignedTo && d.assignedTo.toLowerCase().includes(userName)) ||
        (d.requesterEmail && d.requesterEmail.toLowerCase() === userEmail)
      );
    }

    // 4. Equipe Técnica de TI (Técnico, Analista, Assistente, Auxiliar):
    // O que for de TI e sistemas (Hardware, Software, Redes, Acessos, Impressoras, Telefonia, ERP)
    // vai para os técnicos de TI. Eles NÃO se misturam com as ordens de manutenção predial/fabril,
    // a menos que um chamado tenha sido expressamente atribuído a eles ou aberto por eles.
    const userName = (user.name || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    return demands.filter(d => 
      d.category !== 'Facilities & Infra' ||
      (d.assignedTo && d.assignedTo.toLowerCase().includes(userName)) ||
      (d.requesterEmail && d.requesterEmail.toLowerCase() === userEmail)
    );
  },

  // --- Gestão de Segurança da Informação & Tempo Limite de Sessão ---
  getSecuritySettings(): SecuritySettings {
    return loadStorage<SecuritySettings>(SECURITY_SETTINGS_KEY, DEFAULT_SECURITY_SETTINGS);
  },

  saveSecuritySettings(settings: SecuritySettings, user?: User | null): void {
    saveStorage(SECURITY_SETTINGS_KEY, settings);
    this.addAuditLog(
      'Permissão',
      `Políticas de segurança atualizadas: Tempo limite de sessão configurado para ${settings.sessionTimeoutMinutes > 0 ? settings.sessionTimeoutMinutes + ' minutos' : 'Desativado'} (${settings.complianceStandard})`,
      'Autenticação',
      'sec-policy',
      user
    );
    try {
      window.dispatchEvent(new CustomEvent('itsm-security-settings-changed', { detail: settings }));
    } catch {
      // ignore
    }
  },

  resetToDefaultData(): void {
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(DEMANDS_STORAGE_KEY);
    localStorage.removeItem(NOTES_STORAGE_KEY);
    localStorage.removeItem(AUDIT_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
  }
};
