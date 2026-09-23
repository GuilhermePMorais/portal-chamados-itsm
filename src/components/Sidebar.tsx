import React from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  ClipboardList, 
  StickyNote, 
  History, 
  Users, 
  X, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab, User } from '../types';
import { PortalLogo } from './PortalLogo';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  demandsCount: number;
  notesCount: number;
  onOpenProfile?: () => void;
  onOpenSecuritySettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOpenMobile,
  onCloseMobile,
  demandsCount,
  notesCount,
  onOpenProfile,
  onOpenSecuritySettings,
}) => {
  const isAdmin = currentUser?.role === 'Administrador';
  const isEmployee = currentUser?.role === 'Colaborador (Funcionário)';

  // Configuração dos itens de navegação adaptados ao cargo / papel do usuário
  const allNavItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: isEmployee ? 'Meu Painel' : 'Visão Geral',
      icon: LayoutDashboard,
      description: isEmployee ? 'Status dos meus chamados' : 'Métricas e gráficos do setor',
      allowedRoles: ['all'],
    },
    {
      id: 'kanban' as ActiveTab,
      label: 'Quadro Kanban',
      icon: KanbanSquare,
      badge: demandsCount,
      description: 'Fluxo visual de atividades',
      allowedRoles: ['all'],
    },
    {
      id: 'demands' as ActiveTab,
      label: isEmployee ? 'Meus Chamados' : 'Demandas & Tickets',
      icon: ClipboardList,
      badge: demandsCount,
      description: isEmployee ? 'Minhas solicitações abertas' : 'Lista completa e filtros',
      allowedRoles: ['all'],
    },
    {
      id: 'notes' as ActiveTab,
      label: isEmployee ? 'Lembretes' : 'Notas Rápidas',
      icon: StickyNote,
      badge: notesCount,
      description: 'Post-its e anotações rápidas',
      allowedRoles: ['all'],
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Auditoria de Logs',
      icon: History,
      description: 'Histórico de ações e CSV',
      allowedRoles: ['Administrador', 'Supervisor de Facilities', 'Técnico de Manutenção / Facilities'],
    },
    {
      id: 'team' as ActiveTab,
      label: 'Equipe e Acessos',
      icon: Users,
      requiresAdmin: true,
      description: 'Papéis, cargos e permissões',
      allowedRoles: ['Administrador'],
    },
  ];

  // Filtrar itens com base no perfil do usuário
  const navItems = allNavItems.filter((item) => {
    if (item.allowedRoles.includes('all')) return true;
    if (!currentUser) return false;
    return item.allowedRoles.includes(currentUser.role);
  });

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpenMobile && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Container da Sidebar */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-10 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Topo do menu */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Cabeçalho do Drawer Mobile com Logo do Sistema */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
            <PortalLogo size="sm" className="h-8 w-auto opacity-95" />
            <button
              id="btn-close-sidebar-mobile"
              onClick={onCloseMobile}
              aria-label="Fechar menu"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 active:bg-slate-200 active:scale-95 touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Navegação */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isEmployee ? 'Portal do Colaborador' : 'Navegação Principal'}
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between min-h-[48px] px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 touch-manipulation group active:scale-[0.98] cursor-pointer ${
                    isActive
                      ? 'bg-[#121820] text-white font-semibold shadow-md border border-[#232d3b]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600'
                      }`}
                    />
                    <div>
                      <span className="text-sm block leading-tight">{item.label}</span>
                      <span
                        className={`text-[11px] block leading-tight mt-0.5 ${
                          isActive ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.requiresAdmin && (
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Acesso Rápido a Políticas de Segurança ISO 27001 para Administrador */}
          {isAdmin && onOpenSecuritySettings && (
            <div className="mx-3 mt-1 mb-2">
              <button
                type="button"
                id="btn-sidebar-security-policies"
                onClick={onOpenSecuritySettings}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/70 hover:bg-emerald-100/70 text-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight text-slate-900 group-hover:text-emerald-900">
                      Políticas &amp; Sessão
                    </span>
                    <span className="text-[10px] text-slate-500 leading-none">
                      Timeout e ISO 27001
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                  Ajustar
                </span>
              </button>
            </div>
          )}

          {/* Dica de Toque & Responsividade */}
          <div className="m-3 p-3.5 bg-slate-100/90 border border-slate-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold block mb-0.5 text-slate-900">
                  {isEmployee ? 'Autoatendimento ao Usuário' : 'Central de Atendimento'}
                </span>
                {isEmployee 
                  ? 'Abra novos chamados a qualquer momento. Você receberá atualizações em tempo real.'
                  : 'Administradores e Supervisores recebem cópias por e-mail de cada atualização em chamados.'}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          {/* Informações do Usuário Conectado */}
          {currentUser && (
            <button
              type="button"
              id="btn-sidebar-profile"
              onClick={onOpenProfile}
              title="Clique para editar seu perfil, foto e senha"
              className="w-full text-left px-2.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-500 transition-colors group cursor-pointer"
            >
              <UserAvatar user={currentUser} size="sm" />
              <div className="truncate flex-1 min-w-0">
                <span className="font-semibold text-slate-800 block truncate group-hover:text-emerald-700 transition-colors">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">{currentUser.email}</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded shrink-0">
                {isEmployee ? 'Colaborador' : currentUser.role.split(' ')[0]}
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
