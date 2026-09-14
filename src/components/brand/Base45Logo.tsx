import React from 'react';

interface Base45LogoProps {
  variant?: 'horizontal' | 'badge' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const Base45Logo: React.FC<Base45LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', badge: 36 },
    md: { icon: 38, text: 'text-lg', badge: 48 },
    lg: { icon: 48, text: 'text-xl', badge: 64 },
    xl: { icon: 64, text: 'text-3xl', badge: 88 }
  };

  const dim = sizeMap[size];

  // Isometric B4 Circuit Mark (exact geometric shape from Base 45 Innovation Group logo)
  const B4IconMark = (
    <svg
      width={dim.icon}
      height={dim.icon}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-md"
    >
      <defs>
        {/* Teal to Cyan Gradient for B */}
        <linearGradient id="b4-teal-grad" x1="10" y1="10" x2="70" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#00B0FF" />
          <stop offset="100%" stopColor="#0072FF" />
        </linearGradient>

        {/* Bright Orange/Amber Gradient for 4 */}
        <linearGradient id="b4-orange-grad" x1="50" y1="20" x2="110" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF9100" />
          <stop offset="60%" stopColor="#FF6D00" />
          <stop offset="100%" stopColor="#FF3D00" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="b4-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Base Platform Box Perspective lines */}
      <polygon points="15,75 50,95 85,75 50,55" fill="#0A192F" stroke="#00E5FF" strokeWidth="2" strokeOpacity="0.4" />
      <polygon points="15,75 50,95 50,105 15,85" fill="#030F26" stroke="#00E5FF" strokeWidth="1.5" strokeOpacity="0.3" />
      <polygon points="50,95 85,75 85,85 50,105" fill="#07132B" stroke="#FF9100" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* Isometric B Letter Structure */}
      <path
        d="M25 65 L25 25 L48 20 L58 35 L48 45 L62 55 L48 72 Z"
        fill="url(#b4-teal-grad)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <path
        d="M25 25 L35 18 L58 13 L68 28 L58 35 Z"
        fill="#00E5FF"
        fillOpacity="0.8"
      />

      {/* Isometric 4 Number Structure */}
      <path
        d="M50 45 L78 20 L92 48 L104 48 L104 62 L92 62 L92 78 L78 78 L78 62 L64 62 Z"
        fill="url(#b4-orange-grad)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />

      {/* Circuit Nodes & Traces */}
      <circle cx="35" cy="35" r="3" fill="#FFFFFF" />
      <line x1="35" y1="35" x2="20" y2="45" stroke="#00E5FF" strokeWidth="2" />
      <circle cx="20" cy="45" r="2.5" fill="#00E5FF" />

      <circle cx="75" cy="35" r="3" fill="#FFFFFF" />
      <line x1="75" y1="35" x2="88" y2="28" stroke="#FF9100" strokeWidth="2" />
      <circle cx="88" cy="28" r="2.5" fill="#FF9100" />

      <circle cx="65" cy="72" r="3" fill="#FFFFFF" />
      <line x1="65" y1="72" x2="50" y2="82" stroke="#FF9100" strokeWidth="2" />
      <circle cx="50" cy="82" r="2.5" fill="#FF9100" />
    </svg>
  );

  if (variant === 'icon-only') {
    return B4IconMark;
  }

  if (variant === 'badge') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          width={dim.badge}
          height={dim.badge}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF9100" />
              <stop offset="25%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#0072FF" />
              <stop offset="75%" stopColor="#3D5AFE" />
              <stop offset="100%" stopColor="#FF3D00" />
            </linearGradient>
          </defs>

          {/* Outer Ring & Circuit Tech Border */}
          <circle cx="100" cy="100" r="95" fill="#0B132B" stroke="url(#ring-grad)" strokeWidth="6" />
          <circle cx="100" cy="100" r="84" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.6" />

          {/* Central Logo */}
          <g transform="translate(40, 40) scale(1)">
            {/* Embedded B4 SVG Path */}
            <path
              d="M25 65 L25 25 L48 20 L58 35 L48 45 L62 55 L48 72 Z"
              fill="#00E5FF"
            />
            <path
              d="M50 45 L78 20 L92 48 L104 48 L104 62 L92 62 L92 78 L78 78 L78 62 L64 62 Z"
              fill="#FF9100"
            />
          </g>

          {/* Curved Text Arc Representation */}
          <text x="100" y="32" textAnchor="middle" fill="#FF9100" fontSize="13" fontWeight="900" letterSpacing="2">
            BASE 45
          </text>
          <text x="100" y="180" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" letterSpacing="3">
            INNOVATION GROUP
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {B4IconMark}

      <div className="flex flex-col">
        <div className="flex items-center space-x-1 font-black tracking-tight leading-none text-slate-900 dark:text-white">
          <span className={`${dim.text} text-slate-900 font-extrabold tracking-wide`}>BASE</span>
          <span className={`${dim.text} text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-teal-500 to-orange-500 font-black`}>
            45
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
            INNOVATION GROUP
          </span>
        )}
      </div>
    </div>
  );
};
