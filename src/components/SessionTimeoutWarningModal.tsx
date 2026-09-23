import React from 'react';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const SessionTimeoutWarningModal: React.FC<SessionTimeoutWarningModalProps> = ({
  isOpen,
  secondsRemaining,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="session-timeout-warning-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="session-timeout-warning-card"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center animate-bounce">
          <Clock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200">
            Aviso de Segurança da Informação
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            Sua sessão está prestes a expirar
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Por conformidade com as políticas corporativas de segurança (ISO 27001 / LGPD), esta estação será desconectada automaticamente por inatividade.
          </p>
        </div>

        {/* Contador Regressivo em Destaque */}
        <div className="bg-[#121820] text-white p-4 rounded-2xl border border-[#232d3b] flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tempo Restante</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:
              {String(secondsRemaining % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onLogoutNow}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Encerrar Agora</span>
          </button>

          <button
            type="button"
            onClick={onStayLoggedIn}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Continuar Conectado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
