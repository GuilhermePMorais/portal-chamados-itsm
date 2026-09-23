import React from 'react';

interface AlkoRoundLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
}

export const AlkoRoundLogo: React.FC<AlkoRoundLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap: Record<string, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dimensionClass = typeof size === 'string' ? sizeMap[size] || 'w-10 h-10' : '';
  const inlineStyle = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden bg-[#005b94] shadow-sm select-none flex items-center justify-center ${dimensionClass} ${className}`}
      style={inlineStyle}
      title="Alko do Brasil - Emblema Oficial"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full block"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
      >
        {/* Base azul sólida preenchendo o círculo */}
        <circle cx="50" cy="50" r="50" fill="#005b94" />

        {/* Linha Divisória Central Vertical (Tronco da folha/esfera) */}
        <rect x="47.5" y="0" width="5" height="100" fill="#ffffff" />

        {/* Ranhuras/Cortes Diagonais Esquerdos */}
        <line x1="-2" y1="26" x2="48" y2="40" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="square" />
        <line x1="-2" y1="48" x2="48" y2="62" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="square" />
        <line x1="2" y1="70" x2="48" y2="84" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="square" />

        {/* Ranhuras/Cortes Diagonais Direitos (Espelhados) */}
        <line x1="102" y1="26" x2="52" y2="40" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="square" />
        <line x1="102" y1="48" x2="52" y2="62" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="square" />
        <line x1="98" y1="70" x2="52" y2="84" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="square" />
      </svg>
    </div>
  );
};
