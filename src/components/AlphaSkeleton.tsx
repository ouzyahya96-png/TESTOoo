import React from 'react';
import { AlphaSkeletonProps } from '../types';

export const AlphaSkeleton: React.FC<AlphaSkeletonProps> = ({
  id,
  variant = 'rectangle',
  width = '100%',
  height,
  className = '',
}) => {
  const baseStyle = 'bg-gradient-to-r from-[#16213E] via-[#1A1A2E] to-[#16213E] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] opacity-65';
  
  const variantStyles = {
    text: 'rounded-md h-4 w-3/4 my-1.5',
    circle: 'rounded-full shrink-0',
    rectangle: 'rounded-xl',
  };

  const defaultHeight = {
    text: '16px',
    circle: '48px',
    rectangle: '100px',
  }[variant];

  const inlineStyles = {
    width: variant === 'circle' && height ? height : width,
    height: height || defaultHeight,
  };

  return (
    <div
      id={id}
      className={`
        ${baseStyle}
        ${variantStyles[variant]}
        ${className}
      `}
      style={inlineStyles}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export const reactSkeletonCode = `import React from 'react';

interface AlphaSkeletonProps {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
}

export const AlphaSkeleton: React.FC<AlphaSkeletonProps> = ({ variant = 'rectangle', width = '100%', height }) => {
  const rounded = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-xl';
  return (
    <div
      className={\`bg-gradient-to-r from-[#16213E] via-[#1A1A2E] to-[#16213E] animate-pulse \${rounded}\`}
      style={{ width, height: height || (variant === 'circle' ? 48 : variant === 'text' ? 16 : 100) }}
    />
  );
};`;

export const reactNativeSkeletonCode = `import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AlphaSkeletonProps {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: any;
  height?: any;
}

export const AlphaSkeleton: React.FC<AlphaSkeletonProps> = ({ variant = 'rectangle', width = '100%', height }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height: height || (variant === 'circle' ? 48 : variant === 'text' ? 16 : 100),
          borderRadius: variant === 'circle' ? 999 : variant === 'text' ? 4 : 12,
          opacity,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: { backgroundColor: '#16213E' },
});`;
