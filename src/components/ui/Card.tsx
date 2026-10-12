import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  bordered?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  bordered = true,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg ${bordered ? 'border border-slate-200 shadow-sm' : ''} ${className}`}
    >
      {(title || action) && (
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
