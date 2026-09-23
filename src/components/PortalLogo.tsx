import React from 'react';
import { COMPANY_CONFIG } from '../config/branding';
import { PixelTechLogo } from './PixelTechLogo';

interface PortalLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light';
  showContainer?: boolean;
}

export const PortalLogo: React.FC<PortalLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  theme = 'dark',
  showContainer = true,
}) => {
  const heightMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const textColor = theme === 'light' ? '#ffffff' : '#0f172a';
  const subtextColor = theme === 'light' ? '#94a3b8' : '#64748b';

  // Se houver logotipo customizado definido nas configurações, renderiza a imagem
  if (COMPANY_CONFIG.customLogoUrl) {
    return (
      <img
        src={COMPANY_CONFIG.customLogoUrl}
        alt={COMPANY_CONFIG.companyName}
        className={`${heightMap[size]} w-auto object-contain select-none shrink-0 ${className}`}
      />
    );
  }

  // Variante Ícone Isolado (Pixel Art Verde)
  if (variant === 'icon') {
    return (
      <PixelTechLogo
        size={size}
        className={className}
        showContainer={showContainer}
      />
    );
  }

  // Nome formatado sem hífens
  const cleanTitle = (COMPANY_CONFIG.systemTitle || 'Portal Chamados ITSM').replace(/-/g, ' ');

  // Logotipo Completo (Pixel Art Verde + Tipografia Corporativa Alinhada)
  return (
    <div className={`flex items-center gap-3 select-none shrink-0 ${className}`}>
      <PixelTechLogo
        size={size}
        showContainer={showContainer}
      />
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            style={{ color: textColor }}
            className="font-extrabold tracking-tight text-sm sm:text-base uppercase"
          >
            {cleanTitle}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider hidden sm:inline-block">
            ITSM
          </span>
        </div>
        <span
          style={{ color: subtextColor }}
          className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-500 mt-0.5"
        >
          {COMPANY_CONFIG.systemSubtitle || 'Gestão Corporativa de TI & Facilities'}
        </span>
      </div>
    </div>
  );
};
