import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  Lock, 
  Mail, 
  AlertCircle,
  Wrench,
  WifiOff
} from 'lucide-react';
import { PortalLogo } from './PortalLogo';
import { COMPANY_CONFIG } from '../config/branding';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => boolean;
}

type SystemStatus = 'online' | 'maintenance' | 'offline';

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const [maintenanceInfo, setMaintenanceInfo] = useState<{
    message?: string;
    estimatedReturn?: string;
  } | null>(null);

  // Verificação em tempo real do status de conexão e modo de manutenção do servidor
  useEffect(() => {
    let isMounted = true;
    const checkServerStatus = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!res.ok) {
          if (isMounted) setSystemStatus('offline');
          return;
        }
        const data = await res.json();
        if (data.maintenance || data.status === 'maintenance') {
          if (isMounted) {
            setSystemStatus('maintenance');
            try {
              const mRes = await fetch('/api/maintenance', { cache: 'no-store' });
              if (mRes.ok) {
                const mData = await mRes.json();
                setMaintenanceInfo(mData);
              }
            } catch {}
          }
        } else {
          if (isMounted) {
            setSystemStatus('online');
            setMaintenanceInfo(null);
          }
        }
      } catch (err) {
        // Se a chamada de rede falhar temporariamente
        if (isMounted) {
          // Verifica se há modo de manutenção ativado via localStorage (para testes do admin)
          const localMaint = localStorage.getItem('itsm_maintenance_mode') === 'true';
          if (localMaint) {
            setSystemStatus('maintenance');
            setMaintenanceInfo({
              message: 'Modo de manutenção programada ativado para testes e governança.',
              estimatedReturn: 'Em breve'
            });
          } else {
            setSystemStatus('online');
          }
        }
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail corporativo.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const ok = onLogin(email.trim(), password.trim());
      setIsLoading(false);
      if (!ok) {
        setErrorMsg('E-mail ou senha inválidos. Verifique suas credenciais de acesso.');
      }
    }, 200);
  };

  return (
    <div 
      id="standalone-login-screen"
      className="min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative selection:bg-emerald-600 selection:text-white"
    >
      {/* Barra de Topo com Apenas o Sinalizador de Status do Sistema */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 z-10">
        <div>
          {systemStatus === 'online' && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistema Online</span>
            </div>
          )}

          {systemStatus === 'maintenance' && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/95 backdrop-blur-sm border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Sistema em Manutenção</span>
            </div>
          )}

          {systemStatus === 'offline' && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50/95 backdrop-blur-sm border border-rose-300 text-rose-900 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Servidor Indisponível</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Ambiente Seguro • TLS 1.3</span>
        </div>
      </header>

      {/* Card Central de Login com Design Sofisticado */}
      <main className="w-full max-w-md my-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
            {/* Emblema Central em Pixel Art Verde (Nuvem e Celular) */}
            <div className="flex flex-col items-center justify-center">
              <div className="p-3 rounded-2xl bg-[#121820] border border-[#232d3b] shadow-lg shadow-emerald-950/20 group hover:scale-105 transition-transform duration-200">
                <PortalLogo variant="icon" size="xl" showContainer={false} className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>
            </div>

            {/* Tipografia Centralizada com Alinhamento Perfeito */}
            <div className="text-center w-full">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {COMPANY_CONFIG.systemTitle.replace(/-/g, ' ')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {COMPANY_CONFIG.systemSubtitle || 'Central Unificada de Chamados & Facilities'}
              </p>
            </div>

          {/* Aviso Proeminente Quando o Sistema Estiver em Manutenção */}
          {systemStatus === 'maintenance' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Manutenção Preventiva em Andamento</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {maintenanceInfo?.message || 'Estamos atualizando a infraestrutura e segurança do portal para melhor atendê-lo.'}
              </p>
              {maintenanceInfo?.estimatedReturn && (
                <p className="text-[11px] font-semibold text-amber-950">
                  Previsão de retorno: {maintenanceInfo.estimatedReturn}
                </p>
              )}
              <p className="text-[10px] text-amber-700/80 italic">
                * Acesso restrito a administradores autorizados durante esta janela.
              </p>
            </div>
          )}

          {/* Aviso Quando o Servidor Estiver Indisponível */}
          {systemStatus === 'offline' && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-950">
                <WifiOff className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Falha de Conexão com o Servidor</span>
              </div>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                Não foi possível conectar aos serviços centrais. Verifique sua conexão ou tente novamente em instantes.
              </p>
            </div>
          )}

          {/* Alerta de Erro de Credencial */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulário de E-mail e Senha */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  id="page-login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`seu.nome@${COMPANY_CONFIG.companyDomain}`}
                  className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  id="page-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-page-submit-login"
              disabled={isLoading}
              className="w-full min-h-[46px] rounded-xl bg-[#121820] hover:bg-[#1a2332] active:bg-[#0c1017] disabled:opacity-70 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#232d3b] hover:border-emerald-500/50 shadow-md active:scale-95 transition-all touch-manipulation cursor-pointer group"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Acessar o Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Nota de Segurança e Conformidade */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-tight">
              Acesso protegido com monitoramento de inatividade em conformidade com as diretrizes <strong>ISO/IEC 27001</strong> e <strong>LGPD</strong>.
            </p>
          </div>
        </div>
      </main>

      {/* Rodapé Corporativo */}
      <footer className="w-full max-w-5xl py-3 text-center text-xs text-slate-500 font-medium z-10">
        <p>{COMPANY_CONFIG.copyrightNotice}</p>
      </footer>
    </div>
  );
};
