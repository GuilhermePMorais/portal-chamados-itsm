import React, { useState } from 'react';
import { User } from '../types';
import { COMPANY_CONFIG } from '../config/branding';

interface UserAvatarProps {
  user?: Partial<User> | null;
  name?: string;
  avatarUrl?: string;
  email?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  name,
  avatarUrl,
  email,
  size = 'md',
  className = '',
}) => {
  const userName = user?.name || name || 'Usuário';
  const userEmail = (user?.email || email || '').toLowerCase().trim();
  const rawAvatar = user?.avatarUrl || avatarUrl;

  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [rawAvatar]);

  const hasCustomPhoto = Boolean(rawAvatar && !rawAvatar.includes('logo'));
  const isAdmin = user?.role === 'Administrador' || userEmail === COMPANY_CONFIG.adminEmail.toLowerCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-full',
    sm: 'w-8 h-8 text-xs rounded-full',
    md: 'w-10 h-10 text-sm rounded-full',
    lg: 'w-12 h-12 text-base rounded-full',
    xl: 'w-16 h-16 text-xl rounded-full',
  };

  // Se tiver foto enviada pelo usuário
  if (hasCustomPhoto && rawAvatar && !imageError) {
    return (
      <div className={`relative shrink-0 overflow-hidden bg-slate-100 ring-2 ring-blue-500/30 ${sizeClasses[size]} ${className}`}>
        <img
          src={rawAvatar}
          alt={userName}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover select-none"
        />
      </div>
    );
  }

  // Se houver ícone customizado de marca configurado (ex: perfil da Alko ativado)
  if (COMPANY_CONFIG.customIconUrl && isAdmin && !imageError) {
    return (
      <div className={`relative shrink-0 overflow-hidden bg-white ring-2 ring-blue-500/30 ${sizeClasses[size]} ${className}`}>
        <img
          src={COMPANY_CONFIG.customIconUrl}
          alt={userName}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain p-0.5 select-none"
        />
      </div>
    );
  }

  // Iniciais do usuário com estilo profissional
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const bgClass = isAdmin 
    ? 'bg-slate-900 text-white ring-slate-800'
    : 'bg-[#121820] text-emerald-400 ring-emerald-500/30';

  return (
    <div
      className={`shrink-0 font-bold flex items-center justify-center select-none ring-2 ${bgClass} ${sizeClasses[size]} ${className}`}
      title={userName}
    >
      <span>{initials}</span>
    </div>
  );
};
