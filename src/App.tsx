import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { DemandList } from './components/DemandList';
import { QuickNotes } from './components/QuickNotes';
import { AuditLog } from './components/AuditLog';
import { TeamManagement } from './components/TeamManagement';
import { DemandModal } from './components/DemandModal';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { MyProfileModal } from './components/MyProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { SessionTimeoutWarningModal } from './components/SessionTimeoutWarningModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { StorageService } from './lib/storage';
import { playNotificationSound } from './lib/sound';
import { COMPANY_CONFIG } from './config/branding';
import { 
  ActiveTab, 
  Demand, 
  QuickNote, 
  User, 
  DemandStatus,
  AppNotification,
  SecuritySettings
} from './types';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  ClipboardList, 
  StickyNote, 
  Users,
  Bell
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dados centrais
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState(StorageService.getAuditLogs());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modais
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [defaultDemandStatus, setDefaultDemandStatus] = useState<DemandStatus>('A Fazer');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Políticas de Segurança & Timeout de Sessão (ISO 27001 / LGPD)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    StorageService.getSecuritySettings()
  );
  const [timeoutWarningSeconds, setTimeoutWarningSeconds] = useState<number | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshNotifications = useCallback(() => {
    setNotifications(StorageService.getNotifications());
  }, []);

  // Carregar dados iniciais e manter sincronizado
  useEffect(() => {
    const initialUser = StorageService.getCurrentUser();
    setCurrentUser(initialUser);
    setDemands(StorageService.getDemands());
    setNotes(StorageService.getNotes());
    setUsers(StorageService.getUsers());
    setAuditLogs(StorageService.getAuditLogs());
    setNotifications(StorageService.getNotifications());

    const applySyncUpdates = () => {
      setDemands(StorageService.getDemands());
      setNotes(StorageService.getNotes());
      const refreshedUsers = StorageService.getUsers();
      setUsers(refreshedUsers);
      setAuditLogs(StorageService.getAuditLogs());
      refreshNotifications();

      // Atualiza usuário atual se perfil/cargo/foto mudou no servidor
      const curr = StorageService.getCurrentUser();
      if (curr) {
        const match = refreshedUsers.find(u => u.id === curr.id || u.email.toLowerCase() === curr.email.toLowerCase());
        if (
          match && (
            match.role !== curr.role || 
            match.name !== curr.name || 
            match.active !== curr.active ||
            match.avatarUrl !== curr.avatarUrl
          )
        ) {
          const updatedCurr = { ...curr, ...match };
          StorageService.setCurrentUser(updatedCurr);
          setCurrentUser(updatedCurr);
        }
      }
    };

    const runSync = async () => {
      const hasChanges = await StorageService.syncWithServer();
      if (hasChanges) {
        applySyncUpdates();
      }
    };

    // Sincronização inicial
    runSync();

    // Polling suave a cada 3 segundos para sincronização automática entre PC e celulares
    const syncInterval = setInterval(runSync, 3000);

    // Quando o usuário volta ao navegador ou desbloqueia o celular
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        runSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', runSync);

    // Ouvinte para novas notificações em tempo real com som
    const handleNewNotif = (e: any) => {
      refreshNotifications();
      playNotificationSound();
      if (e.detail) {
        addToast(
          'info',
          e.detail.title || 'Notificação Recebida',
          e.detail.emailSent 
            ? `${e.detail.message} (Disparado e-mail para Administradores e Técnicos)`
            : e.detail.message
        );
      }
    };

    // Ouvinte para sincronizar abas e dispositivos que compartilhem a sessão
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'alko_it_demands_v1') {
        setDemands(StorageService.getDemands());
      } else if (e.key === 'alko_it_notifications_v1') {
        refreshNotifications();
        playNotificationSound();
      } else if (e.key === 'alko_it_notes_v1') {
        setNotes(StorageService.getNotes());
      } else if (e.key === 'alko_it_current_user_v1') {
        setCurrentUser(StorageService.getCurrentUser());
      }
    };

    window.addEventListener('itsm-notification-received', handleNewNotif);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', runSync);
      window.removeEventListener('itsm-notification-received', handleNewNotif);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [addToast, refreshNotifications]);

  // Se o usuário for colaborador e estiver em aba não permitida, redirecionar
  useEffect(() => {
    if (currentUser?.role === 'Colaborador (Funcionário)') {
      if (activeTab === 'audit' || activeTab === 'team') {
        setActiveTab('demands');
      }
    }
  }, [currentUser, activeTab]);

  // Atualizar diretrizes de segurança quando salvas
  useEffect(() => {
    const handleSecSettings = (e: any) => {
      if (e.detail) {
        setSecuritySettings(e.detail);
      }
    };
    window.addEventListener('itsm-security-settings-changed', handleSecSettings);
    return () => window.removeEventListener('itsm-security-settings-changed', handleSecSettings);
  }, []);

  // Monitoramento de Tempo Limite de Sessão por Inatividade (ISO 27001 / LGPD)
  useEffect(() => {
    if (!currentUser || securitySettings.sessionTimeoutMinutes <= 0) {
      setTimeoutWarningSeconds(null);
      return;
    }

    let lastActivity = Date.now();
    const totalTimeoutSeconds = securitySettings.sessionTimeoutMinutes * 60;
    const warningLeadSeconds = securitySettings.warningBeforeSeconds || 60;
    const warningThreshold = Math.max(5, totalTimeoutSeconds - warningLeadSeconds);

    const handleUserActivity = () => {
      lastActivity = Date.now();
      setTimeoutWarningSeconds(null);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    const intervalId = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivity) / 1000);
      const remainingSeconds = totalTimeoutSeconds - elapsedSeconds;

      if (remainingSeconds <= 0) {
        // Encerramento forçado por tempo limite de inatividade
        clearInterval(intervalId);
        setTimeoutWarningSeconds(null);
        if (securitySettings.logTimeoutEvents) {
          StorageService.addAuditLog(
            'Permissão',
            `Sessão de ${currentUser.name} encerrada automaticamente por inatividade (${securitySettings.sessionTimeoutMinutes} min) - Diretriz ${securitySettings.complianceStandard}`,
            'Autenticação',
            currentUser.id
          );
        }
        StorageService.setCurrentUser(null);
        setCurrentUser(null);
        addToast(
          'info',
          'Sessão Expirada por Inatividade',
          `Sua estação foi desconectada após ${securitySettings.sessionTimeoutMinutes} minutos sem interação, conforme as diretrizes de segurança (${securitySettings.complianceStandard}).`
        );
      } else if (elapsedSeconds >= warningThreshold) {
        setTimeoutWarningSeconds(remainingSeconds);
      } else {
        setTimeoutWarningSeconds(null);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [currentUser, securitySettings, addToast]);

  // Filtragem de demandas com base no cargo / papel do usuário atual
  const visibleDemands = useMemo(() => {
    return StorageService.filterDemandsByRole(demands, currentUser);
  }, [demands, currentUser]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Handlers para Demandas
  const handleOpenNewDemand = (defaultStatus: DemandStatus = 'A Fazer') => {
    setSelectedDemand(null);
    setDefaultDemandStatus(defaultStatus);
    setIsDemandModalOpen(true);
  };

  const handleSelectDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setIsDemandModalOpen(true);
  };

  const handleSaveDemand = (data: Partial<Demand>) => {
    try {
      const isNew = !data.id;
      const saved = StorageService.saveDemand(data);
      setDemands(StorageService.getDemands());
      setAuditLogs(StorageService.getAuditLogs());
      refreshNotifications();
      addToast(
        'success',
        isNew ? 'Novo Chamado Aberto' : 'Chamado Atualizado',
        `Chamado #${saved.code} registrado. Notificação e e-mail disparados aos gestores!`
      );
    } catch (error) {
      console.error(error);
      addToast('error', 'Erro ao salvar demanda', 'Verifique os campos informados.');
    }
  };

  const handleUpdateDemandStatus = (demandId: string, newStatus: DemandStatus) => {
    const updated = StorageService.updateDemandStatus(demandId, newStatus);
    if (updated) {
      setDemands(StorageService.getDemands());
      setAuditLogs(StorageService.getAuditLogs());
      refreshNotifications();
      addToast(
        'info',
        `Status Atualizado (#${updated.code})`,
        `Chamado movido para "${newStatus}". Alerta enviado por e-mail e no app.`
      );
    }
  };

  const handleDeleteDemand = (demandId: string) => {
    const ok = StorageService.deleteDemand(demandId);
    if (ok) {
      setDemands(StorageService.getDemands());
      setAuditLogs(StorageService.getAuditLogs());
      refreshNotifications();
      addToast('info', 'Demanda Excluída', 'O chamado foi removido do sistema.');
    }
  };

  const handleAddDemandComment = (demandId: string, text: string) => {
    if (!currentUser) {
      addToast('error', 'Não autenticado', 'Faça login para comentar.');
      return;
    }
    const updated = StorageService.addDemandComment(demandId, text, currentUser);
    if (updated) {
      setDemands(StorageService.getDemands());
      setSelectedDemand(updated);
      setAuditLogs(StorageService.getAuditLogs());
      refreshNotifications();
      addToast('success', 'Comentário Registrado', 'Atualização registrada e e-mail enviado aos gestores.');
    }
  };

  // Handlers para Notas
  const handleSaveNote = (noteData: Partial<QuickNote>) => {
    if (!currentUser) {
      addToast('error', 'Erro', 'Usuário não autenticado.');
      return;
    }
    StorageService.saveNote(noteData, currentUser);
    setNotes(StorageService.getNotes());
    setAuditLogs(StorageService.getAuditLogs());
    addToast('success', 'Nota Salva', 'Seu lembrete foi armazenado.');
  };

  const handleDeleteNote = (noteId: string) => {
    StorageService.deleteNote(noteId);
    setNotes(StorageService.getNotes());
    setAuditLogs(StorageService.getAuditLogs());
    addToast('info', 'Nota Excluída', 'Lembrete removido.');
  };

  const handleTogglePinNote = (noteId: string) => {
    StorageService.togglePinNote(noteId);
    setNotes(StorageService.getNotes());
  };

  // Handlers para Equipe & Usuários
  const handleSaveUser = (userData: Omit<User, 'id' | 'createdAt'> & { id?: string; password?: string }) => {
    try {
      StorageService.saveUser(userData);
      setUsers(StorageService.getUsers());
      setAuditLogs(StorageService.getAuditLogs());
      addToast('success', 'Usuário Atualizado', `Permissões para ${userData.name} configuradas.`);
    } catch (err: any) {
      addToast('error', 'Erro ao salvar usuário', err?.message || 'Falha ao salvar.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    try {
      StorageService.deleteUser(userId);
      setUsers(StorageService.getUsers());
      setAuditLogs(StorageService.getAuditLogs());
      addToast('info', 'Usuário Removido', 'Acesso revogado.');
    } catch (err: any) {
      addToast('error', 'Erro', err?.message || 'Não foi possível excluir.');
    }
  };

  // Handlers de Autenticação
  const handleLogin = (email: string, pass: string): boolean => {
    const user = StorageService.authenticate(email, pass);
    if (user) {
      setCurrentUser(user);
      setAuditLogs(StorageService.getAuditLogs());
      addToast('success', `Bem-vindo, ${user.name}!`, `Perfil ativo: ${user.role}.`);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveTab('dashboard');
    addToast('info', 'Sessão Encerrada', `Você saiu do ${COMPANY_CONFIG.systemTitle}.`);
  };

  const handleSwitchToAdmin = () => {
    const ok = handleLogin(COMPANY_CONFIG.adminEmail, 'Admin@2026');
    if (ok) {
      setActiveTab('team');
    }
  };

  const handleSaveProfile = (updatedData: { name: string; avatarUrl?: string; password?: string }) => {
    if (!currentUser) return;
    try {
      const updatedUser: User = {
        ...currentUser,
        name: updatedData.name,
        avatarUrl: updatedData.avatarUrl,
      };

      StorageService.saveUser({
        ...updatedUser,
        password: updatedData.password,
      });
      setCurrentUser(updatedUser);
      setUsers(StorageService.getUsers());
      setAuditLogs(StorageService.getAuditLogs());
      addToast('success', 'Perfil Atualizado', 'Seus dados e foto foram salvos com sucesso!');
    } catch (err: any) {
      addToast('error', 'Erro ao atualizar perfil', err?.message || 'Falha ao salvar dados.');
    }
  };

  const isEmployee = currentUser?.role === 'Colaborador (Funcionário)';

  // Se o usuário não estiver logado (clicou em Sair), renderiza a tela dedicada de login
  // sem barra lateral, com fundo limpo, nítido e iluminação suave
  if (!currentUser) {
    return (
      <div className="min-h-screen text-slate-900 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-600 selection:text-white antialiased">
        {/* Fundo Nítido de Engenharia com Iluminação Superior Suave em Esmeralda */}
        <div 
          id="tech-infrastructure-background-login"
          className="fixed inset-0 pointer-events-none z-0 bg-[#f8fafc]"
        >
          {/* Brilho Atmosférico Superior Esmeralda */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(16,185,129,0.14),transparent_70%)]" />
          {/* Malha Geométrica Nítida de TI (Dot-Grid) */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{ 
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <LoginPage
            onLogin={handleLogin}
          />

          {/* Container de Notificações Toast */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-600 selection:text-white antialiased">
      {/* Fundo Nítido Corporativo */}
      <div 
        id="tech-infrastructure-background"
        className="fixed inset-0 pointer-events-none z-0 bg-[#f8fafc]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-5%,rgba(16,185,129,0.08),transparent_65%)]" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Cabeçalho Principal Adaptado à Proporção da Tela */}
        <Header
          currentUser={currentUser}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewDemandModal={() => handleOpenNewDemand()}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenSecuritySettings={() => setIsSecurityModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Layout Proporcional e Fluido: w-full max-w-[1720px] */}
        <div className="flex-1 flex w-full max-w-[1720px] mx-auto">
          {/* Barra Lateral de Navegação (Desktop & Mobile Drawer) */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            demandsCount={visibleDemands.length}
            notesCount={notes.length}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenSecuritySettings={() => setIsSecurityModalOpen(true)}
          />

          {/* Conteúdo Principal com Espaçamento Harmonioso e Fluido */}
          <main className="flex-1 p-3 sm:p-5 lg:p-7 min-w-0 overflow-x-hidden">
            {activeTab === 'dashboard' && (
              <Dashboard
                demands={visibleDemands}
                notes={notes}
                auditLogs={auditLogs}
                onOpenNewDemand={() => handleOpenNewDemand()}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onSelectDemand={handleSelectDemand}
              />
            )}

            {activeTab === 'kanban' && (
              <KanbanBoard
                demands={visibleDemands}
                onOpenNewDemand={handleOpenNewDemand}
                onSelectDemand={handleSelectDemand}
                onUpdateStatus={handleUpdateDemandStatus}
              />
            )}

            {activeTab === 'demands' && (
              <DemandList
                demands={visibleDemands}
                onOpenNewDemand={() => handleOpenNewDemand()}
                onSelectDemand={handleSelectDemand}
                onUpdateStatus={handleUpdateDemandStatus}
                onDeleteDemand={handleDeleteDemand}
              />
            )}

            {activeTab === 'notes' && (
              <QuickNotes
                notes={notes}
                currentUser={currentUser}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePinNote}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLog
                logs={auditLogs}
                onExportCsv={() => {
                  StorageService.exportAuditLogsToCsv();
                  addToast('success', 'Relatório CSV Gerado', 'Arquivo de auditoria baixado com sucesso!');
                }}
              />
            )}

            {activeTab === 'team' && (
              <TeamManagement
                users={users}
                currentUser={currentUser}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
                onSwitchToAdmin={handleSwitchToAdmin}
                onOpenSecuritySettings={() => setIsSecurityModalOpen(true)}
                securitySettings={securitySettings}
              />
            )}
          </main>
        </div>

        {/* Barra de Navegação Inferior Móvel (Bottom Bar para Toque Fácil) */}
        <nav 
          id="mobile-bottom-nav"
          className="lg:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
        >
          <button
            id="btn-bottom-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[56px] px-2 py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{isEmployee ? 'Painel' : 'Visão'}</span>
          </button>

          <button
            id="btn-bottom-kanban"
            onClick={() => setActiveTab('kanban')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[56px] px-2 py-1 rounded-xl transition-all active:scale-95 touch-manipulation relative ${
              activeTab === 'kanban' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <KanbanSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Kanban</span>
            {visibleDemands.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            id="btn-bottom-demands"
            onClick={() => setActiveTab('demands')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[56px] px-2 py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              activeTab === 'demands' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{isEmployee ? 'Chamados' : 'Demandas'}</span>
          </button>

          <button
            id="btn-bottom-notes"
            onClick={() => setActiveTab('notes')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[56px] px-2 py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              activeTab === 'notes' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <StickyNote className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Notas</span>
          </button>

          <button
            id="btn-bottom-notifications"
            onClick={() => setIsNotificationsModalOpen(true)}
            className="flex flex-col items-center justify-center min-h-[46px] min-w-[56px] px-2 py-1 rounded-xl text-slate-500 transition-all active:scale-95 touch-manipulation relative"
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Alertas</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-600" />
            )}
          </button>
        </nav>

        {/* Modal de Criação / Edição de Demanda */}
        <DemandModal
          isOpen={isDemandModalOpen}
          demand={selectedDemand}
          currentUser={currentUser}
          teamMembers={users}
          defaultStatus={defaultDemandStatus}
          onClose={() => setIsDemandModalOpen(false)}
          onSave={handleSaveDemand}
          onAddComment={handleAddDemandComment}
        />

        {/* Modal de Login */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />

        {/* Modal de Perfil do Usuário (Foto, Nome e Senha) */}
        <MyProfileModal
          isOpen={isProfileModalOpen}
          user={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={handleSaveProfile}
        />

        {/* Modal de Políticas de Segurança da Informação & Tempo de Sessão */}
        <SecuritySettingsModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          currentSettings={securitySettings}
          currentUser={currentUser}
          onSave={(newSettings) => {
            StorageService.saveSecuritySettings(newSettings, currentUser);
            setSecuritySettings(newSettings);
            addToast('success', 'Diretrizes Atualizadas', `Tempo limite de sessão configurado para ${newSettings.sessionTimeoutMinutes > 0 ? newSettings.sessionTimeoutMinutes + ' min' : 'Desativado'}.`);
          }}
        />

        {/* Modal de Aviso Prévio de Expiração de Sessão por Inatividade */}
        <SessionTimeoutWarningModal
          isOpen={timeoutWarningSeconds !== null && timeoutWarningSeconds > 0}
          secondsRemaining={timeoutWarningSeconds || 60}
          onStayLoggedIn={() => setTimeoutWarningSeconds(null)}
          onLogoutNow={handleLogout}
        />

        {/* Central de Notificações e Disparos por E-mail */}
        <NotificationsModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
          currentUser={currentUser}
          notifications={notifications}
          onNotificationsUpdated={refreshNotifications}
          onOpenDemandDetail={(code) => {
            const found = demands.find(d => d.code === code);
            if (found) {
              setSelectedDemand(found);
              setIsNotificationsModalOpen(false);
              setIsDemandModalOpen(true);
            }
          }}
        />

        {/* Container de Notificações Toast */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
