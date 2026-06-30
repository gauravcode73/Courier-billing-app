import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-primary-600 border-t-transparent ${sizes[size]} ${className}`}
      role="status"
    />
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full space-y-4">
      <Spinner size="lg" />
      <p className="text-slate-500 font-medium text-sm animate-pulse">Loading AmodXpress Console...</p>
    </div>
  );
};
