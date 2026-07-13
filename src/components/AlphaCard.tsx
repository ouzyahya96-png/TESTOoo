import React from 'react';
import { AlphaCardProps } from '../types';

export const AlphaCard: React.FC<AlphaCardProps> = ({
  id,
  variant = 'default',
  children,
  onClick,
  className = '',
  isHoverable = true,
  animateShake = false,
}) => {
  // Styles based on specification
  const baseStyle = 'rounded-2xl transition-all duration-300 overflow-hidden';
  
  const variantStyles = {
    // Background: #0F0F1A, Surface: #16213E, Primary: #1A1A2E
    default: 'bg-[#16213E]/80 border border-[#1A1A2E]/50 shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
    elevated: 'bg-[#16213E] border border-[#E94560]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    alert: 'bg-[#16213E] border border-[#FF2D55]/30 shadow-[0_0_20px_rgba(255,45,85,0.25)]',
    success: 'bg-[#16213E] border border-[#00D9A5]/30 shadow-[0_0_20px_rgba(0,217,165,0.25)]',
    premium: 'bg-gradient-to-br from-[#16213E] via-[#1A1A2E] to-[#16213E] border border-[#FFD700]/30 shadow-[0_8px_32px_rgba(255,215,0,0.15)]',
  };

  const hoverStyle = isHoverable && onClick 
    ? 'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer active:brightness-95'
    : isHoverable ? 'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : '';

  const shakeStyle = animateShake ? 'shake-animation' : '';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        ${baseStyle}
        ${variantStyles[variant]}
        ${hoverStyle}
        ${shakeStyle}
        ${className}
      `}
      style={{
        touchAction: onClick ? 'manipulation' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

export const reactCardCode = `import React from 'react';

interface AlphaCardProps {
  variant?: 'default' | 'elevated' | 'alert' | 'success' | 'premium';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isHoverable?: boolean;
  animateShake?: boolean;
}

export const AlphaCard: React.FC<AlphaCardProps> = ({
  variant = 'default',
  children,
  onClick,
  className = '',
  isHoverable = true,
  animateShake = false,
}) => {
  const baseStyle = 'rounded-2xl transition-all duration-300 overflow-hidden';
  
  const variantStyles = {
    default: 'bg-[#16213E]/80 border border-[#1A1A2E]/50 shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
    elevated: 'bg-[#16213E] border border-[#E94560]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    alert: 'bg-[#16213E] border border-[#FF2D55]/30 shadow-[0_0_20px_rgba(255,45,85,0.25)]',
    success: 'bg-[#16213E] border border-[#00D9A5]/30 shadow-[0_0_20px_rgba(0,217,165,0.25)]',
    premium: 'bg-gradient-to-br from-[#16213E] via-[#1A1A2E] to-[#16213E] border border-[#FFD700]/30 shadow-[0_8px_32px_rgba(255,215,0,0.15)]',
  };

  const hoverStyle = isHoverable 
    ? 'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
    : '';

  const shakeStyle = animateShake ? 'animate-shake-red' : '';

  return (
    <div
      onClick={onClick}
      className={\`\${baseStyle} \${variantStyles[variant]} \${hoverStyle} \${shakeStyle} \${className}\`}
    >
      {children}
    </div>
  );
};`;

export const reactNativeCardCode = `import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface AlphaCardProps {
  variant?: 'default' | 'elevated' | 'alert' | 'success' | 'premium';
  children: React.ReactNode;
  onPress?: () => void;
  isHoverable?: boolean;
}

export const AlphaCard: React.FC<AlphaCardProps> = ({
  variant = 'default',
  children,
  onPress,
}) => {
  const getCardStyles = () => {
    let cardStyle = [styles.card];

    if (variant === 'default') cardStyle.push(styles.defaultCard);
    else if (variant === 'elevated') cardStyle.push(styles.elevatedCard);
    else if (variant === 'alert') cardStyle.push(styles.alertCard);
    else if (variant === 'success') cardStyle.push(styles.successCard);
    else if (variant === 'premium') cardStyle.push(styles.premiumCard);

    return cardStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={getCardStyles()}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyles()}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  defaultCard: {
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(26, 26, 46, 0.5)',
  },
  elevatedCard: {
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(233, 69, 96, 0.1)',
  },
  alertCard: {
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 85, 0.3)',
    shadowColor: '#FF2D55',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  successCard: {
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 165, 0.3)',
    shadowColor: '#00D9A5',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  premiumCard: {
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
});`;
