import React from 'react';
import { 
  Menu, 
  Plus, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Bell,
  UserCheck
} from 'lucide-react';
import { User } from '../types';
import { PortalLogo } from './PortalLogo';
import { UserAvatar } from './UserAvatar';
import { COMPANY_CONFIG } from '../config/branding';

interface HeaderProps {
  currentUser: User | null;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenMobileMenu: () => void;
  onOpenNewDemandModal: () => void;
  onOpenLoginModal: () => void;
  onOpenProfile?: () => void;
  onOpenSecuritySettings?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenMobileMenu,
  onOpenNewDemandModal,
  onOpenLoginModal,
  onOpenProfile,
  onOpenSecuritySettings,
  onLogout,
}) => {
  const isEmployee = currentUser?.role === 'Colaborador (Funcionário)';
  const isAdmin = currentUser?.role === 'Administrador';

  return (
    <header 
      id="main-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors"
    >
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Botão Mobile + Logo do Portal */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-mobile-menu-toggle"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu lateral de navegação"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-transform active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center">
              <PortalLogo size="md" className="h-9 sm:h-10 w-auto opacity-95 shrink-0" />
            </div>

            <div className="hidden md:block pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs tracking-tight leading-none">
                  {COMPANY_CONFIG.systemTitle.replace(/-/g, ' ')}
                </span>
                <span 
                  title="Sincronização contínua e automática em tempo real ativa entre computadores e celulares"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 select-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Tempo Real
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                {COMPANY_CONFIG.systemSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações, Notificações, Novo Chamado & Usuário */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão de Diretrizes de Segurança (Apenas Administrador) */}
          {isAdmin && onOpenSecuritySettings && (
            <button
              id="btn-header-security-settings"
              onClick={onOpenSecuritySettings}
              title="Políticas de Segurança da Informação & Tempo de Sessão (ISO 27001)"
              aria-label="Configurações de Segurança"
              className="flex items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent text-slate-600 hover:text-emerald-700 transition-all duration-150 active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </button>
          )}

          {/* Central de Notificações */}
          <button
            id="btn-header-notifications"
            onClick={onOpenNotifications}
            title="Notificações do sistema e disparos de e-mail"
            aria-label="Abrir central de notificações"
            className="relative flex items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-all duration-150 active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Botão Nova Demanda (Estilo ServiceNow Matte Obsidian com Acento Verde) */}
          <button
            id="btn-header-new-demand"
            onClick={onOpenNewDemandModal}
            className="flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-[#121820] hover:bg-[#1a2332] active:bg-[#0c1017] text-white font-semibold text-xs sm:text-sm border border-[#232d3b] hover:border-emerald-500/50 shadow-sm transition-all duration-150 active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {isEmployee ? 'Abrir Chamado' : 'Nova Demanda'}
            </span>
            <span className="sm:hidden">Novo</span>
          </button>

          {/* Perfil do Usuário / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
              <button
                type="button"
                id="btn-header-my-profile"
                onClick={onOpenProfile}
                title="Ver e editar meu perfil, foto ou senha"
                className="flex items-center gap-2 sm:gap-2.5 p-1 -m-1 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors text-left group cursor-pointer"
              >
                <UserAvatar user={currentUser} size="md" />
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                      {currentUser.name}
                    </span>
                    {currentUser.role === 'Administrador' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-900 text-white rounded">
                        Admin
                      </span>
                    )}
                    {isEmployee && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        Solicitante
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                    {currentUser.role}
                  </span>
                </div>
              </button>

              {/* Botão de Trocar/Sair */}
              <button
                id="btn-header-logout"
                onClick={onLogout}
                title="Desconectar do sistema"
                aria-label="Desconectar do sistema"
                className="flex items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-transform active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-header-login"
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 font-semibold text-xs sm:text-sm transition-transform active:scale-95 touch-manipulation cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
