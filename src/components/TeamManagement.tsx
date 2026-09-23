import React, { useState, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Building, 
  Trash2, 
  Edit3, 
  Lock,
  CheckCircle2,
  XCircle,
  X,
  Camera,
  Upload
} from 'lucide-react';
import { User, UserRole, SecuritySettings } from '../types';
import { UserAvatar } from './UserAvatar';
import { compressImage } from '../lib/imageUtils';
import { COMPANY_CONFIG } from '../config/branding';

interface TeamManagementProps {
  users: User[];
  currentUser: User | null;
  onSaveUser: (userData: Omit<User, 'id' | 'createdAt'> & { id?: string; password?: string }) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchToAdmin: () => void;
  onOpenSecuritySettings?: () => void;
  securitySettings?: SecuritySettings;
}

const ROLES: UserRole[] = [
  'Administrador',
  'Supervisor de Facilities',
  'Técnico de Manutenção / Facilities',
  'Analista',
  'Assistente',
  'Técnico',
  'Auxiliar',
  'Colaborador (Funcionário)',
];

export const TeamManagement: React.FC<TeamManagementProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onSwitchToAdmin,
  onOpenSecuritySettings,
  securitySettings,
}) => {
  const isAdmin = currentUser?.role === 'Administrador';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Técnico');
  const [department, setDepartment] = useState('Suporte Técnico');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [active, setActive] = useState(true);

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setRole('Técnico');
    setDepartment('Suporte Técnico');
    setPassword('Senha@123');
    setAvatarUrl('');
    setActive(true);
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department);
    setPassword('');
    setAvatarUrl(user.avatarUrl || '');
    setActive(user.active);
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setAvatarUrl(compressed);
    } catch {
      // Fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const isAdminEmail = email.trim().toLowerCase() === COMPANY_CONFIG.adminEmail.toLowerCase();
    const finalAvatar = avatarUrl.trim()
      ? avatarUrl.trim()
      : (isAdminEmail && COMPANY_CONFIG.customIconUrl ? COMPANY_CONFIG.customIconUrl : undefined);

    onSaveUser({
      id: editingUser?.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department,
      avatarUrl: finalAvatar,
      active,
      password: password ? password.trim() : undefined,
    });

    setIsModalOpen(false);
    setEditingUser(null);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-8">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Acesso Restrito ao Administrador</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Você está conectado como <strong>{currentUser?.name}</strong> com o papel de <strong>{currentUser?.role}</strong>.
          Apenas administradores podem gerenciar e cadastrar a equipe técnica e de suporte.
        </p>
      </div>
    );
  }

  return (
    <div id="team-management-view" className="space-y-4 pb-12">
      {/* Topo com Botão Adicionar Membro e Políticas de Segurança */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Controle de Equipe e Níveis de Acesso
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de credenciais locais, permissões e políticas do {COMPANY_CONFIG.systemTitle.replace(/-/g, ' ')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenSecuritySettings && (
            <button
              id="btn-team-security-settings"
              type="button"
              onClick={onOpenSecuritySettings}
              className="min-h-[42px] px-3.5 rounded-xl border border-emerald-300 hover:border-emerald-500 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Segurança: {securitySettings && securitySettings.sessionTimeoutMinutes > 0 ? `${securitySettings.sessionTimeoutMinutes} min` : 'Timeout Off'}
              </span>
            </button>
          )}

          <button
            id="btn-add-team-member"
            onClick={handleOpenCreate}
            className="min-h-[42px] px-4 rounded-xl bg-[#121820] hover:bg-[#1a2332] active:bg-[#0c1017] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#232d3b] hover:border-emerald-500/50 shadow-sm active:scale-95 touch-manipulation shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Cadastrar Colaborador</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo de Conformidade ISO 27001 */}
      {securitySettings && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>
              <strong>Diretriz Ativa ({securitySettings.complianceStandard}):</strong> Encerramento de sessão por inatividade fixado em{' '}
              <strong>{securitySettings.sessionTimeoutMinutes > 0 ? `${securitySettings.sessionTimeoutMinutes} minutos` : 'Desativado'}</strong> com aviso prévio de {securitySettings.warningBeforeSeconds} segundos.
            </span>
          </div>
          {onOpenSecuritySettings && (
            <button
              onClick={onOpenSecuritySettings}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline shrink-0 cursor-pointer text-left sm:text-right"
            >
              Alterar tempo limite &rarr;
            </button>
          )}
        </div>
      )}

      {/* Grid de Membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const isEmployee = user.role === 'Colaborador (Funcionário)';
          const isAdminUser = user.role === 'Administrador';
          const isFacilities = user.role === 'Supervisor de Facilities' || user.role === 'Técnico de Manutenção / Facilities';

          return (
            <div
              key={user.id}
              id={`user-card-${user.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="lg" />

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {user.name}
                      </h3>
                      <span className="text-xs text-slate-500 block truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAdminUser
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isFacilities
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : isEmployee
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.active ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Acesso Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        Inativo / Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(user)}
                  title="Editar dados e cargo"
                  className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {user.email.toLowerCase() !== COMPANY_CONFIG.adminEmail.toLowerCase() && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja revogar o acesso de ${user.name}?`)) {
                        onDeleteUser(user.id);
                      }
                    }}
                    title="Excluir usuário"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação / Edição de Usuário Local */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingUser ? 'Editar Usuário' : 'Novo Membro da Equipe'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`usuario@${COMPANY_CONFIG.companyDomain}`}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Papel / Cargo
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Foto de Perfil
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {avatarUrl && avatarUrl !== COMPANY_CONFIG.customIconUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Prévia" 
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20" 
                      />
                    ) : COMPANY_CONFIG.customIconUrl && email.trim().toLowerCase() === COMPANY_CONFIG.adminEmail.toLowerCase() ? (
                      <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 flex items-center justify-center shadow-sm overflow-hidden p-1">
                        <img src={COMPANY_CONFIG.customIconUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="min-h-[36px] px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Carregar Foto</span>
                        </button>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="text-xs text-slate-400 hover:text-rose-600 underline"
                          >
                            Remover
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
                      <span className="text-[10px] text-slate-400 block">PNG, JPG ou WebP (Foto compactada automaticamente)</span>
                    </div>
                  </div>

                  <input
                    type="url"
                    value={COMPANY_CONFIG.customIconUrl && avatarUrl === COMPANY_CONFIG.customIconUrl ? '' : avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Ou cole a URL direta da imagem..."
                    className="w-full min-h-[38px] px-3 rounded-lg border border-slate-200 text-xs text-slate-600 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Suporte Nível 1"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso *'}
                </label>
                <input
                  type="text"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ex: Senha@123"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="checkbox-user-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="checkbox-user-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Usuário Ativo com permissão de login
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[42px] px-4 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-50 active:scale-95 touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm active:scale-95 touch-manipulation cursor-pointer"
                >
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
