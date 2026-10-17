import React from 'react';

interface SkillBadgeProps {
  name: string;
  variant?: 'tech' | 'soft' | 'match' | 'missing' | 'additional';
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  variant = 'tech',
  size = 'md',
  onRemove,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'match':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'missing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'soft':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'additional':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'tech':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border ${getColors()} ${sizeClasses} transition-colors`}
    >
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-red-600 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
};
