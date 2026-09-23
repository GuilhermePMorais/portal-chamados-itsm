import React, { useState } from 'react';
import { 
  LogIn, 
  X, 
  Lock, 
  Mail, 
  AlertCircle
} from 'lucide-react';
import { PortalLogo } from './PortalLogo';
import { COMPANY_CONFIG } from '../config/branding';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const ok = onLogin(email.trim(), password.trim());
    if (ok) {
      onClose();
    } else {
      setErrorMsg('Credenciais inválidas. Verifique o e-mail e a senha informados.');
    }
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="login-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Topo com Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <PortalLogo variant="icon" size="md" className="w-10 h-10 shrink-0" />
            <div className="pl-3 border-l border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                {COMPANY_CONFIG.systemTitle.replace(/-/g, ' ')}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                Autenticação Corporativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 active:scale-95 touch-manipulation cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  id="input-login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`admin@${COMPANY_CONFIG.companyDomain}`}
                  className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  id="input-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-login"
              className="w-full min-h-[44px] rounded-xl bg-[#121820] hover:bg-[#1a2332] active:bg-[#0c1017] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#232d3b] hover:border-emerald-500/50 shadow-md transition-all active:scale-95 touch-manipulation cursor-pointer group"
            >
              <LogIn className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              <span>Autenticar no Sistema</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
