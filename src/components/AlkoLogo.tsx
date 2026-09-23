import React from 'react';

interface AlkoLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light';
}

export const AlkoLogo: React.FC<AlkoLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  theme = 'dark',
}) => {
  const heightMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const textColor = theme === 'light' ? '#ffffff' : '#000000';
  const subtextColor = theme === 'light' ? '#f1f5f9' : '#000000';
  const blueColor = '#005088'; // Tom azul oficial Alko do Brasil

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 440 440"
        className={`${heightMap[size]} w-auto aspect-square select-none shrink-0 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Logo Alko do Brasil - Símbolo"
      >
        <defs>
          <mask id="alko-icon-mask">
            {/* Círculo branco = área visível */}
            <circle cx="220" cy="220" r="200" fill="#ffffff" />
            {/* Linhas pretas na máscara = recortes 100% transparentes entre as folhas */}
            <line x1="220" y1="15" x2="220" y2="425" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="15" y1="110" x2="210" y2="175" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="425" y1="110" x2="230" y2="175" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="15" y1="200" x2="210" y2="265" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="425" y1="200" x2="230" y2="265" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="30" y1="295" x2="210" y2="360" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="410" y1="295" x2="230" y2="360" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="85" y1="385" x2="210" y2="428" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
            <line x1="355" y1="385" x2="230" y2="428" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          </mask>
        </defs>

        {/* Emblema Circular com transparência natural */}
        <circle cx="220" cy="220" r="200" fill={blueColor} mask="url(#alko-icon-mask)" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1520 440"
      className={`${heightMap[size]} w-auto select-none shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Logo Alko do Brasil Completo"
    >
      <defs>
        <mask id="alko-symbol-mask">
          {/* Círculo branco = área visível */}
          <circle cx="210" cy="220" r="195" fill="#ffffff" />
          {/* Linhas pretas = recortes 100% transparentes */}
          <line x1="210" y1="20" x2="210" y2="420" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="15" y1="115" x2="200" y2="175" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="405" y1="115" x2="220" y2="175" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="15" y1="200" x2="200" y2="260" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="405" y1="200" x2="220" y2="260" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="30" y1="288" x2="200" y2="348" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="390" y1="288" x2="220" y2="348" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="85" y1="372" x2="200" y2="415" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line x1="335" y1="372" x2="220" y2="415" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
        </mask>
      </defs>

      {/* Emblema Foliar Circular com Gaps 100% Transparentes */}
      <circle cx="210" cy="220" r="195" fill={blueColor} mask="url(#alko-symbol-mask)" />

      {/* Tipografia ALKO DO BRASIL Oficial sem Fundo */}
      <g id="alko-text-group" transform="translate(480, 0)">
        {/* Palavra ALKO */}
        <g id="text-alko" fill={textColor} transform="translate(0, 260)">
          {/* A estilizada com corte geométrico característico */}
          <path d="M 0,0 L 78,-236 L 152,-236 L 230,0 L 174,0 L 152,-66 L 76,-66 L 56,0 Z M 92,-114 L 138,-114 L 115,-184 Z" />
          {/* L */}
          <path d="M 276,-236 L 332,-236 L 332,-54 L 442,-54 L 442,0 L 276,0 Z" />
          {/* K */}
          <path d="M 490,-236 L 546,-236 L 546,-106 L 634,-236 L 706,-236 L 608,-94 L 712,0 L 640,0 L 546,-78 L 546,0 L 490,0 Z" />
          {/* O perfeitamente circular */}
          <path d="M 830,-242 C 900,-242 956,-186 956,-118 C 956,-50 900,6 830,6 C 760,6 704,-50 704,-118 C 704,-186 760,-242 830,-242 Z M 830,-186 C 792,-186 764,-156 764,-118 C 764,-80 792,-50 830,-50 C 868,-50 896,-80 896,-118 C 896,-156 868,-186 830,-186 Z" />
        </g>

        {/* Subtítulo DO BRASIL alinhado com tracking elegante */}
        <text
          x="0"
          y="350"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="68"
          fontWeight="800"
          letterSpacing="0.55em"
          fill={subtextColor}
        >
          DO BRASIL
        </text>
      </g>
    </svg>
  );
};
