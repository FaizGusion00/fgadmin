
import React from 'react';

interface FGAdminLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FGAdminLogo = ({ size = 'md', className = '' }: FGAdminLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="url(#logoGradient)"
          className="drop-shadow-lg"
        />
        
        {/* Inner circle */}
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="url(#innerGradient)"
        />
        
        {/* FG letters */}
        <text
          x="32"
          y="38"
          textAnchor="middle"
          className="fill-slate-700 font-bold text-lg"
          style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}
        >
          FG
        </text>
        
        {/* Tech elements - circuit pattern */}
        <g stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.6">
          {/* Circuit lines */}
          <path d="M12 20 L20 20 L20 28" />
          <path d="M44 20 L52 20 L52 28" />
          <path d="M12 44 L20 44 L20 36" />
          <path d="M44 44 L52 44 L52 36" />
          
          {/* Dots for connections */}
          <circle cx="20" cy="20" r="1.5" fill="#3b82f6" />
          <circle cx="44" cy="20" r="1.5" fill="#8b5cf6" />
          <circle cx="20" cy="44" r="1.5" fill="#06b6d4" />
          <circle cx="44" cy="44" r="1.5" fill="#10b981" />
        </g>
      </svg>
    </div>
  );
};
