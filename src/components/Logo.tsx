
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'horizontal' | 'vertical' | 'emblem';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  variant = 'horizontal',
  className = '',
}) => {
  const Emblem = ({
    className: emblemClass = '',
  }: {
    className?: string;
  }) => (
    <img
      src="/ElderCare_logo2.svg"
      alt="ElderCare"
      className={`${emblemClass} block object-contain`}
    />
  );

  // VERTICAL LOGO
  if (variant === 'vertical') {
    const verticalSizes = {
      sm: 'w-36 max-w-full',
      md: 'w-48 max-w-full',
      lg: 'w-56 sm:w-64 max-w-full',
      xl: 'w-64 sm:w-80 max-w-full',
    };

    return (
      <div
        className={`flex flex-col items-center text-center select-none ${className}`}
      >
        <div className="rounded-2xl border-2 border-teal-700 p-0 flex items-center justify-center bg-white overflow-hidden">
          <img
            src="/ElderCare_logo2.svg"
            alt="ElderCare"
            className={`${verticalSizes[size]} h-auto block object-contain`}
          />
        </div>

        {showSubtitle && (
          <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide mt-3">
            Caring Companion &amp; Daily Health Support
          </p>
        )}
      </div>
    );
  }

  // EMBLEM ONLY
  if (variant === 'emblem') {
    const emblemSizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
      xl: 'w-20 h-20',
    };

    return (
      <div
        className={`rounded-2xl border-2 border-teal-700 p-0 flex items-center justify-center bg-white overflow-hidden ${className}`}
      >
        <Emblem className={`${emblemSizes[size]}`} />
      </div>
    );
  }

  // HORIZONTAL LOGO
  const iconSizes = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-7 h-7 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
    xl: 'w-14 h-14 sm:w-18 sm:h-18',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2.5 select-none shrink-0 ${className}`}
    >
      <div className="shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl border-2 border-teal-700 p-0 bg-white overflow-hidden">
        <Emblem className={`${iconSizes[size]}`} />
      </div>

      <div className="flex flex-col min-w-0">
        <div
          className={`font-black tracking-tight text-slate-900 leading-none ${textSizes[size]}`}
        >
          <span>Elder</span>
          <span className="text-teal-700">Care</span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wide truncate mt-0.5">
            <span>Care</span>
            <span className="text-teal-600 font-bold">♥</span>
            <span>Safety</span>
            <span className="text-teal-600 font-bold">♥</span>
            <span>Companionship</span>
          </div>
        )}
      </div>
    </div>
  );
};