import React from 'react';
import { AlphaButtonProps } from '../types';
import { Loader2 } from 'lucide-react';

export const AlphaButton: React.FC<AlphaButtonProps> = ({
  id,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
}) => {
  // Styles base on specifications
  const baseStyle = 'relative inline-flex items-center justify-center font-headline font-semibold tracking-wide transition-all duration-150 focus:outline-none select-none';
  
  const variantStyles = {
    primary: 'bg-[#1A1A2E] text-white border border-[#E94560]/20 hover:bg-[#1f1f3a] hover:border-[#E94560]/50 active:scale-95 disabled:bg-[#1A1A2E]/50 disabled:text-opacity-50 disabled:border-[#5A5A5A]',
    secondary: 'bg-[#E94560] text-white hover:bg-[#ff5673] active:scale-95 shadow-[0_4px_16px_rgba(233,69,96,0.3)] disabled:bg-[#E94560]/50 disabled:shadow-none',
    ghost: 'bg-transparent text-[#8E8E93] border border-transparent hover:text-white hover:bg-[#16213E] active:scale-95 disabled:text-[#5A5A5A] disabled:bg-transparent',
    danger: 'bg-[#FF2D55] text-white hover:bg-[#ff4d6e] active:scale-95 shadow-[0_4px_16px_rgba(255,45,85,0.3)] disabled:bg-[#FF2D55]/50',
    gold: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0F0F1A] hover:brightness-110 active:scale-95 shadow-[0_4px_16px_rgba(255,215,0,0.3)] disabled:from-[#FFD700]/50 disabled:to-[#FFA500]/50',
  };

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 rounded-lg h-[36px]',
    md: 'text-sm px-6 py-3 rounded-xl h-[48px] min-w-[120px]',
    lg: 'text-base px-8 py-4 rounded-xl h-[56px] min-w-[160px] tracking-widest uppercase',
  };

  return (
    <button
      id={id}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyle}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${loading ? 'pointer-events-none' : ''}
        ${className}
      `}
      style={{
        touchAction: 'manipulation',
      }}
      aria-busy={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-inherit" />
          <span>Chargement...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2 justify-center">{children}</span>
      )}
    </button>
  );
};

export const reactButtonCode = `import React from 'react';
import { Loader2 } from 'lucide-react';

interface AlphaButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AlphaButton: React.FC<AlphaButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-headline font-semibold transition-all duration-150 focus:outline-none select-none';
  
  const variantStyles = {
    primary: 'bg-[#1A1A2E] text-white border border-[#E94560]/20 hover:bg-[#1f1f3a] active:scale-95 disabled:opacity-50',
    secondary: 'bg-[#E94560] text-white hover:bg-[#ff5673] active:scale-95 shadow-[0_4px_16px_rgba(233,69,96,0.3)]',
    ghost: 'bg-transparent text-[#8E8E93] hover:text-white hover:bg-[#16213E] active:scale-95',
    danger: 'bg-[#FF2D55] text-white hover:bg-[#ff4d6e] active:scale-95 shadow-[0_4px_16px_rgba(255,45,85,0.3)]',
    gold: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0F0F1A] hover:brightness-110 active:scale-95 shadow-[0_4px_16px_rgba(255,215,0,0.3)]',
  };

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 rounded-lg h-[36px]',
    md: 'text-sm px-6 py-3 rounded-xl h-[48px]',
    lg: 'text-base px-8 py-4 rounded-xl h-[56px] tracking-widest uppercase',
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={\`\${baseStyle} \${variantStyles[variant]} \${sizeStyles[size]} \${className}\`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : children}
    </button>
  );
};`;

export const reactNativeButtonCode = `import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

interface AlphaButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  title: string;
  onPress?: () => void;
}

export const AlphaButton: React.FC<AlphaButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  title,
  onPress,
}) => {
  const getButtonStyles = () => {
    let buttonStyle = [styles.button];
    let textStyle = [styles.text];

    // Variant overrides
    if (variant === 'primary') {
      buttonStyle.push(styles.primaryBtn);
      textStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      buttonStyle.push(styles.secondaryBtn);
      textStyle.push(styles.secondaryText);
    } else if (variant === 'ghost') {
      buttonStyle.push(styles.ghostBtn);
      textStyle.push(styles.ghostText);
    } else if (variant === 'danger') {
      buttonStyle.push(styles.dangerBtn);
      textStyle.push(styles.dangerText);
    } else if (variant === 'gold') {
      buttonStyle.push(styles.goldBtn);
      textStyle.push(styles.goldText);
    }

    // Size overrides
    if (size === 'sm') buttonStyle.push(styles.smBtn);
    else if (size === 'lg') buttonStyle.push(styles.lgBtn);
    else buttonStyle.push(styles.mdBtn);

    if (disabled) buttonStyle.push(styles.disabledBtn);

    return { buttonStyle, textStyle };
  };

  const { buttonStyle, textStyle } = getButtonStyles();

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.7}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'gold' ? '#0F0F1A' : '#FFFFFF'} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  text: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
  },
  // Variants
  primaryBtn: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(233, 69, 96, 0.2)',
  },
  primaryText: { color: '#FFFFFF' },
  
  secondaryBtn: {
    backgroundColor: '#E94560',
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryText: { color: '#FFFFFF' },
  
  ghostBtn: { backgroundColor: 'transparent' },
  ghostText: { color: '#8E8E93' },
  
  dangerBtn: {
    backgroundColor: '#FF2D55',
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dangerText: { color: '#FFFFFF' },
  
  goldBtn: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  goldText: { color: '#0F0F1A' },

  // Sizes
  smBtn: { height: 36, paddingHorizontal: 16, borderRadius: 8 },
  mdBtn: { height: 48, paddingHorizontal: 24, borderRadius: 12 },
  lgBtn: { height: 56, paddingHorizontal: 32, borderRadius: 12 },
  
  disabledBtn: { opacity: 0.5 },
});`;
