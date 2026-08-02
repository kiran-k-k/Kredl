import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  showText = false,
}) => {
  const percentage = Math.min(Math.max(Math.round(value), 0), 100);

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      {/* Track */}
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
        {/* Filled bar */}
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-750 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs font-bold text-slate-650 min-w-[2.5rem] text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
};
