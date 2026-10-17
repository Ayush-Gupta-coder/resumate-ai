import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 12,
  label = 'Job Match',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return '#15803d'; // emerald-700
    if (val >= 60) return '#059669'; // emerald-600
    if (val >= 40) return '#d97706'; // amber-600
    return '#dc2626'; // red-600
  };

  const getTextColor = (val: number) => {
    if (val >= 80) return 'text-emerald-800';
    if (val >= 60) return 'text-emerald-700';
    if (val >= 40) return 'text-amber-700';
    return 'text-rose-700';
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(clampedScore)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold tracking-tight ${getTextColor(clampedScore)}`}>
            {clampedScore.toFixed(0)}%
          </span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
