import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Save, 
  User as UserIcon, 
  Mail, 
  Building, 
  Shield, 
  Lock,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { User } from '../types';
import { UserAvatar } from './UserAvatar';
import { compressImage } from '../lib/imageUtils';
import { COMPANY_CONFIG } from '../config/branding';

interface MyProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSaveProfile: (updatedData: { name: string; avatarUrl?: string; password?: string }) => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSaveProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset when opened
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
      setPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isMasterAdmin = user.email.trim().toLowerCase() === COMPANY_CONFIG.adminEmail.toLowerCase() || user.role === 'Administrador';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('A imagem selecionada deve ter no máximo 15MB.');
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setAvatarUrl(compressed);
      setErrorMsg('');
    } catch {
      setErrorMsg('Não foi possível processar esta imagem. Tente outro formato.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('O nome completo é obrigatório.');
      return;
    }

    if (password && password.length < 4) {
      setErrorMsg('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    const finalAvatar = avatarUrl.trim()
      ? avatarUrl.trim()
      : (isMasterAdmin && COMPANY_CONFIG.customIconUrl ? COMPANY_CONFIG.customIconUrl : undefined);

    onSaveProfile({
      name: name.trim(),
      avatarUrl: finalAvatar,
      password: password ? password.trim() : undefined,
    });

    setSuccessMsg('Dados do seu perfil atualizados com sucesso!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Topo do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#121820] text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm border border-[#232d3b]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Meu Perfil &amp; Meus Dados
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Altere sua foto de perfil, seu nome e sua senha
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback visual */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Seção Foto do Usuário */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Sua Foto de Perfil
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative shrink-0">
                {avatarUrl && avatarUrl !== COMPANY_CONFIG.customIconUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Prévia da foto" 
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-sm"
                  />
                ) : COMPANY_CONFIG.customIconUrl ? (
                  <div className="w-16 h-16 rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm overflow-hidden p-1">
                    <img src={COMPANY_CONFIG.customIconUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[36px] px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Carregar Foto do Computador / Celular</span>
                  </button>

                  {COMPANY_CONFIG.customIconUrl && avatarUrl && avatarUrl !== COMPANY_CONFIG.customIconUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(COMPANY_CONFIG.customIconUrl || '')}
                      className="min-h-[36px] px-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Ícone Oficial</span>
                    </button>
                  )}

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-slate-400 hover:text-rose-600 underline ml-1"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <input
                  type="url"
                  value={COMPANY_CONFIG.customIconUrl && avatarUrl === COMPANY_CONFIG.customIconUrl ? '' : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Ou cole o link direto da imagem..."
                  className="w-full min-h-[34px] px-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* E-mail (somente leitura para integridade) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              E-mail Corporativo (Login)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">O e-mail é a chave de login do sistema.</span>
          </div>

          {/* Setor e Perfil (informativos) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cargo / Perfil
              </label>
              <div className="min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-100 flex items-center text-xs font-semibold text-slate-700">
                <Shield className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                {user.role}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Departamento
              </label>
              <div className="min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-100 flex items-center text-xs text-slate-700 truncate">
                <Building className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                <span className="truncate">{user.department}</span>
              </div>
            </div>
          </div>

          {/* Trocar Senha */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Alterar Senha de Acesso (Opcional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full min-h-[38px] pl-8 pr-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full min-h-[38px] pl-8 pr-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Meus Dados</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
