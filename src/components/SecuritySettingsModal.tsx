import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  X, 
  Save, 
  Lock, 
  CheckCircle2, 
  FileText,
  UserCheck,
  Shield,
  Wrench
} from 'lucide-react';
import { SecuritySettings, User } from '../types';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: SecuritySettings;
  onSave: (settings: SecuritySettings) => void;
  currentUser: User | null;
}

const TIMEOUT_OPTIONS = [
  { value: 5, label: '5 Minutos', tag: 'Segurança Máxima', desc: 'Ambientes críticos de infraestrutura' },
  { value: 10, label: '10 Minutos', tag: 'Alta Segurança', desc: 'Recomendação rigorosa ISO/IEC 27001' },
  { value: 15, label: '15 Minutos', tag: 'Padrão Corporativo', desc: 'Equilíbrio ideal entre conformidade e usabilidade' },
  { value: 30, label: '30 Minutos', tag: 'Operacional', desc: 'Ideal para analistas com múltiplas telas' },
  { value: 60, label: '1 Hora', tag: 'Estendido', desc: 'Requer atenção ao deixar a estação desbloqueada' },
  { value: 120, label: '2 Horas', tag: 'Prolongado', desc: 'Para rotinas com pouca alternância' },
  { value: 240, label: '4 Horas', tag: 'Meio Turno', desc: 'Recomendado apenas para rede isolada' },
  { value: 480, label: '8 Horas', tag: 'Turno Completo', desc: 'Expira ao final da jornada de trabalho' },
  { value: 0, label: 'Desativado', tag: 'Demonstração', desc: 'Apenas para testes ou apresentações locais' },
];

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  currentUser,
}) => {
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(
    currentSettings.sessionTimeoutMinutes ?? 15
  );
  const [warningBeforeSeconds, setWarningBeforeSeconds] = useState(
    currentSettings.warningBeforeSeconds ?? 60
  );
  const [strictReauth, setStrictReauth] = useState(
    currentSettings.strictReauth ?? true
  );
  const [logTimeoutEvents, setLogTimeoutEvents] = useState(
    currentSettings.logTimeoutEvents ?? true
  );
  const [complianceStandard, setComplianceStandard] = useState<'ISO 27001' | 'LGPD' | 'Personalizado'>(
    currentSettings.complianceStandard ?? 'ISO 27001'
  );
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(
    currentSettings.maintenanceMode ?? false
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    currentSettings.maintenanceMessage ?? 'Estamos realizando uma manutenção preventiva e atualização de segurança no sistema.'
  );
  const [maintenanceEstimatedReturn, setMaintenanceEstimatedReturn] = useState<string>(
    currentSettings.maintenanceEstimatedReturn ?? 'Em breve (previsão de 30 min)'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SecuritySettings = {
      sessionTimeoutMinutes,
      warningBeforeSeconds,
      strictReauth,
      logTimeoutEvents,
      complianceStandard,
      maintenanceMode,
      maintenanceMessage,
      maintenanceEstimatedReturn,
      updatedAt: new Date().toISOString(),
    };

    // Atualiza estado local e sincroniza com backend via API
    try {
      localStorage.setItem('itsm_maintenance_mode', String(maintenanceMode));
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: maintenanceMode,
          message: maintenanceMessage,
          estimatedReturn: maintenanceEstimatedReturn,
        }),
      });
    } catch (err) {
      console.warn('Sincronização de manutenção via API em segundo plano:', err);
    }

    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div 
      id="security-settings-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div 
        id="security-settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        {/* Topo do Modal com Estilo Corporativo ServiceNow (Matte Obsidian + Acento Verde Esmeralda) */}
        <div className="bg-[#121820] text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-[#232d3b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Políticas de Segurança &amp; Tempo de Sessão
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  ISO 27001
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Diretrizes de proteção contra acessos indevidos e encerramento de sessão por inatividade
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Políticas salvas com sucesso! O novo tempo limite já está em vigor para todos os usuários.</span>
            </div>
          )}

          {/* Seção 1: Tempo Limite de Sessão (Inatividade) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Tempo Limite de Sessão por Inatividade (Timeout)</span>
              </label>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {sessionTimeoutMinutes > 0 ? `${sessionTimeoutMinutes} minutos` : 'Desativado'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Define quanto tempo uma estação conectada pode ficar sem nenhuma ação (movimento do mouse, digitação ou toque) antes que o sistema encerre o login por segurança.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {TIMEOUT_OPTIONS.map((opt) => {
                const isSelected = sessionTimeoutMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSessionTimeoutMinutes(opt.value)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{opt.label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt.tag}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Aviso Prévio ao Usuário */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Contagem Regressiva de Aviso Prévia</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setWarningBeforeSeconds(sec)}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold cursor-pointer ${
                    warningBeforeSeconds === sec
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {sec === 60 ? '60s (1 minuto)' : `${sec} segundos`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Uma janela modal aparecerá antes do término da sessão permitindo ao colaborador clicar em &quot;Continuar Conectado&quot;.
            </p>
          </div>

          {/* Seção 3: Marco Regulatório & Conformidade */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>Norma de Conformidade Institucional</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ISO 27001', 'LGPD', 'Personalizado'] as const).map((std) => (
                <button
                  key={std}
                  type="button"
                  onClick={() => setComplianceStandard(std)}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold cursor-pointer ${
                    complianceStandard === std
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {std}
                </button>
              ))}
            </div>
          </div>

          {/* Seção 4: Regras Complementares */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="text-xs font-bold text-slate-900 block">
              Diretrizes de Rastreabilidade e Auditoria
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logTimeoutEvents}
                  onChange={(e) => setLogTimeoutEvents(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Registrar encerramento de sessão na Trilha de Auditoria</span>
                  <span className="text-slate-500 text-[11px]">
                    Grava automaticamente data, hora e e-mail no arquivo imutável de logs para perícia e auditorias externas.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={strictReauth}
                  onChange={(e) => setStrictReauth(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Revogação Imediata ao Alterar Papéis</span>
                  <span className="text-slate-500 text-[11px]">
                    Exige nova autenticação caso o perfil de acesso ou permissões do colaborador sejam modificados.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Seção 5: Modo de Manutenção do Sistema & Status */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Modo de Manutenção Programada</span>
              </label>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceMode ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Quando ativado, a tela inicial exibe o sinalizador de &quot;Manutenção Programada&quot; e o aviso oficial com sua previsão de retorno para os usuários.
            </p>

            {maintenanceMode && (
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2.5 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-bold text-amber-900 block mb-1">
                    Mensagem de Aviso aos Usuários:
                  </label>
                  <input
                    type="text"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Ex: Atualizando o banco de dados e aplicando patches de segurança..."
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-amber-900 block mb-1">
                    Previsão de Retorno / Normalização:
                  </label>
                  <input
                    type="text"
                    value={maintenanceEstimatedReturn}
                    onChange={(e) => setMaintenanceEstimatedReturn(e.target.value)}
                    placeholder="Ex: Hoje às 18:00 (ou em 30 minutos)"
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Rodapé do Modal */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Configuração restrita a Administradores</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Diretrizes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
