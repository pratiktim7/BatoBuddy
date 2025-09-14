import React from 'react';

interface BatoBuddyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const BatoBuddyLogo: React.FC<BatoBuddyLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg`}>
        <span className="text-white text-xl animate-bounce-gentle">
          🚌
        </span>
      </div>
      
      {/* Text */}
      {showText && (
        <div className={`leading-tight ${textSizeClasses[size]}`}>
          <div className="font-bold text-text tracking-wide">Bato</div>
          <div className="font-semibold text-accent -mt-1">Buddy</div>
        </div>
      )}
    </div>
  );
};

export default BatoBuddyLogo;
