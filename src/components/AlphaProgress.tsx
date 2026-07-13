import React, { useEffect, useState } from 'react';
import { AlphaProgressProps } from '../types';

export const AlphaProgress: React.FC<AlphaProgressProps> = ({
  id,
  value,
  max = 100,
  type = 'linear',
  size = 'md',
  color = 'secondary',
  showLabel = true,
  label,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Growth animation (Progress fill: 1000ms ease-in-out, animated)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const colorClasses = {
    primary: 'bg-[#1A1A2E]',
    secondary: 'bg-[#E94560]',
    accent: 'bg-[#FFD700]',
    success: 'bg-[#00D9A5]',
    error: 'bg-[#FF2D55]',
  };

  const ringColors = {
    primary: '#1A1A2E',
    secondary: '#E94560',
    accent: '#FFD700',
    success: '#00D9A5',
    error: '#FF2D55',
  };

  if (type === 'circular') {
    // Determine dimensions based on size
    const dimensions = {
      sm: { size: 64, stroke: 5 },
      md: { size: 96, stroke: 8 },
      lg: { size: 128, stroke: 10 },
    }[size] || { size: 96, stroke: 8 };

    const radius = (dimensions.size - dimensions.stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

    return (
      <div id={id} className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx={dimensions.size / 2}
              cy={dimensions.size / 2}
              r={radius}
              className="stroke-[#16213E] fill-none"
              strokeWidth={dimensions.stroke}
            />
            {/* Foreground circle with animation */}
            <circle
              cx={dimensions.size / 2}
              cy={dimensions.size / 2}
              r={radius}
              className="fill-none transition-all duration-1000 ease-in-out"
              stroke={ringColors[color]}
              strokeWidth={dimensions.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono font-bold text-white text-md">
              {Math.round(animatedPercent)}%
            </span>
            {label && <span className="text-[10px] text-[#8E8E93] uppercase font-headline tracking-widest">{label}</span>}
          </div>
        </div>
        {showLabel && !label && (
          <span className="text-xs text-[#8E8E93] mt-2 font-headline uppercase tracking-widest">
            Niveau d'achèvement
          </span>
        )}
      </div>
    );
  }

  // Linear layout
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5',
  };

  return (
    <div id={id} className={`w-full ${className}`}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-headline font-semibold text-[#8E8E93] tracking-wider uppercase">
            {label || 'Progression'}
          </span>
          <span className="text-xs font-mono font-bold text-white">
            {Math.round(animatedPercent)}%
          </span>
        </div>
      )}
      <div className="w-full bg-[#16213E] rounded-full overflow-hidden p-0.5 border border-[#1A1A2E]">
        <div
          className={`${heightClasses[size]} rounded-full transition-all duration-1000 ease-out ${colorClasses[color]}`}
          style={{ width: `${animatedPercent}%` }}
        />
      </div>
    </div>
  );
};

export const reactProgressCode = `import React, { useEffect, useState } from 'react';

interface AlphaProgressProps {
  value: number;
  max?: number;
  type?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'error';
  showLabel?: boolean;
  label?: string;
}

export const AlphaProgress: React.FC<AlphaProgressProps> = ({
  value,
  max = 100,
  type = 'linear',
  size = 'md',
  color = 'secondary',
  showLabel = true,
  label,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setPercent(percentage);
  }, [percentage]);

  if (type === 'circular') {
    const sizePx = size === 'sm' ? 64 : size === 'lg' ? 128 : 96;
    const stroke = size === 'sm' ? 5 : size === 'lg' ? 10 : 8;
    const radius = (sizePx - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    const ringColor = {
      primary: '#1A1A2E', secondary: '#E94560', accent: '#FFD700', success: '#00D9A5', error: '#FF2D55'
    }[color];

    return (
      <div className="relative" style={{ width: sizePx, height: sizePx }}>
        <svg className="w-full h-full rotate-[-90deg]">
          <circle cx={sizePx/2} cy={sizePx/2} r={radius} stroke="#16213E" strokeWidth={stroke} fill="none" />
          <circle cx={sizePx/2} cy={sizePx/2} r={radius} stroke={ringColor} strokeWidth={stroke} fill="none"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-mono text-white">
          {Math.round(percent)}%
        </div>
      </div>
    );
  }

  const colorClass = {
    primary: 'bg-[#1A1A2E]', secondary: 'bg-[#E94560]', accent: 'bg-[#FFD700]', success: 'bg-[#00D9A5]', error: 'bg-[#FF2D55]'
  }[color];

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-headline mb-1">
        <span>{label || 'PROGRÈS'}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="w-full bg-[#16213E] rounded-full h-3 overflow-hidden">
        <div className={\`h-full rounded-full transition-all duration-1000 ease-out \${colorClass}\`} style={{ width: \`\${percent}%\` }} />
      </div>
    </div>
  );
};`;

export const reactNativeProgressCode = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface AlphaProgressProps {
  value: number;
  max?: number;
  type?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'error';
  label?: string;
}

export const AlphaProgress: React.FC<AlphaProgressProps> = ({
  value,
  max = 100,
  type = 'linear',
  size = 'md',
  color = 'secondary',
  label,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colorHex = {
    primary: '#1A1A2E', secondary: '#E94560', accent: '#FFD700', success: '#00D9A5', error: '#FF2D55'
  }[color];

  if (type === 'circular') {
    const sizePx = size === 'sm' ? 64 : size === 'lg' ? 128 : 96;
    const strokeWidth = size === 'sm' ? 5 : size === 'lg' ? 10 : 8;
    const radius = (sizePx - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ width: sizePx, height: sizePx, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={sizePx} height={sizePx} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={sizePx / 2} cy={sizePx / 2} r={radius} stroke="#16213E" strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.absoluteCenter}>
          <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.linearContainer}>
      <View style={styles.header}>
        <Text style={styles.labelText}>{label || 'PROGRESS'}</Text>
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: \`\${percentage}%\`, backgroundColor: colorHex }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  linearContainer: { width: '100%', marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  labelText: { color: '#8E8E93', fontFamily: 'Montserrat-Bold', fontSize: 11, textTransform: 'uppercase' },
  percentageText: { color: '#FFFFFF', fontFamily: 'RobotoMono-Bold', fontSize: 12 },
  track: { height: 10, backgroundColor: '#16213E', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  absoluteCenter: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
});`;
