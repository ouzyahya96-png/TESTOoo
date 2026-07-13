import React from 'react';
import { AlphaAvatarProps } from '../types';

export const AlphaAvatar: React.FC<AlphaAvatarProps> = ({
  id,
  imageUrl,
  level,
  size = 'md',
  showLevel = true,
  className = '',
}) => {
  // Determine exact sizing classes
  const sizeClasses = {
    sm: { container: 'w-10 h-10', svgSize: 46, strokeWidth: 2, offset: 2, text: 'text-[9px] px-1 py-0.25' },
    md: { container: 'w-16 h-16', svgSize: 74, strokeWidth: 3, offset: 3, text: 'text-[10px] px-1.5 py-0.5' },
    lg: { container: 'w-24 h-24', svgSize: 104, strokeWidth: 4, offset: 4, text: 'text-[11px] px-2 py-0.5' },
    xl: { container: 'w-32 h-32', svgSize: 136, strokeWidth: 5, offset: 5, text: 'text-xs px-2.5 py-1' },
  }[size];

  // Dummy avatar if no imageUrl provided
  const avatarSrc = imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=AlphaMan${level}`;

  // Level indicator ring variables (SVG)
  const radius = (sizeClasses.svgSize - sizeClasses.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Let level determine progress on the ring, e.g. level 42 shows (42 % 10)*10 percent completion towards next level
  const progression = ((level % 10) || 10) * 10; 
  const strokeDashoffset = circumference - (progression / 100) * circumference;

  return (
    <div id={id} className={`relative inline-block ${className}`}>
      {/* Outer level progression ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg 
          width={sizeClasses.svgSize} 
          height={sizeClasses.svgSize} 
          className="transform -rotate-90"
        >
          {/* Base Track */}
          <circle
            cx={sizeClasses.svgSize / 2}
            cy={sizeClasses.svgSize / 2}
            r={radius}
            fill="none"
            stroke="#16213E"
            strokeWidth={sizeClasses.strokeWidth}
          />
          {/* Colored Level Progress */}
          <circle
            cx={sizeClasses.svgSize / 2}
            cy={sizeClasses.svgSize / 2}
            r={radius}
            fill="none"
            stroke="#FFD700" // Premium Gold
            strokeWidth={sizeClasses.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>

      {/* Avatar Image Container */}
      <div className={`rounded-full overflow-hidden border-2 border-[#0F0F1A] bg-[#16213E] relative ${sizeClasses.container} z-10 m-[3px]`}>
        <img
          src={avatarSrc}
          alt={`Alpha level ${level}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Level Floating Badge */}
      {showLevel && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 z-20">
          <span className={`bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0F0F1A] font-headline font-extrabold rounded-full ${sizeClasses.text} shadow-[0_2px_8px_rgba(255,215,0,0.4)]`}>
            LVL {level}
          </span>
        </div>
      )}
    </div>
  );
};

export const reactAvatarCode = `import React from 'react';

interface AlphaAvatarProps {
  imageUrl?: string;
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
}

export const AlphaAvatar: React.FC<AlphaAvatarProps> = ({ imageUrl, level, size = 'md', showLevel = true }) => {
  const sizePx = size === 'sm' ? 40 : size === 'lg' ? 96 : size === 'xl' ? 128 : 64;
  const ringSize = sizePx + 8;
  const radius = ringSize / 2 - 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((level % 10) || 10) * 10;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-block" style={{ width: ringSize, height: ringSize }}>
      <svg className="absolute inset-0 rotate-[-90deg]" width={ringSize} height={ringSize}>
        <circle cx={ringSize/2} cy={ringSize/2} r={radius} stroke="#16213E" strokeWidth={2} fill="none" />
        <circle cx={ringSize/2} cy={ringSize/2} r={radius} stroke="#FFD700" strokeWidth={2} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 m-1 rounded-full overflow-hidden border-2 border-[#0F0F1A] bg-[#16213E]">
        <img src={imageUrl || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${level}\`} alt="Avatar" className="w-full h-full" />
      </div>
      {showLevel && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5 z-10 bg-[#FFD700] text-[#0F0F1A] text-[9px] font-headline font-extrabold px-1.5 py-0.5 rounded-full shadow-lg">
          LVL {level}
        </div>
      )}
    </div>
  );
};`;

export const reactNativeAvatarCode = `import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface AlphaAvatarProps {
  imageUrl?: string;
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AlphaAvatar: React.FC<AlphaAvatarProps> = ({ imageUrl, level, size = 'md' }) => {
  const sizePx = size === 'sm' ? 40 : size === 'lg' ? 96 : 64;
  const ringSize = sizePx + 8;
  const radius = ringSize / 2 - 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((level % 10) || 10) * 10;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const defaultUri = \`https://api.dicebear.com/7.x/bottts/png?seed=\${level}\`;

  return (
    <View style={{ width: ringSize, height: ringSize, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={ringSize} height={ringSize} style={styles.svgAbsolute}>
        <Circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="#16213E" strokeWidth={2} fill="none" />
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke="#FFD700"
          strokeWidth={2}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={[styles.avatarContainer, { width: sizePx, height: sizePx }]}>
        <Image source={{ uri: imageUrl || defaultUri }} style={styles.image} />
      </View>
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>LVL {level}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  svgAbsolute: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  avatarContainer: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0F0F1A',
    backgroundColor: '#16213E',
  },
  image: { width: '100%', height: '100%' },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    color: '#0F0F1A',
    fontFamily: 'Montserrat-Bold',
    fontSize: 9,
    fontWeight: '800',
  },
});`;
