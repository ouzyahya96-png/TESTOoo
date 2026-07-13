import React from 'react';
import { AlphaBadgeProps } from '../types';
import { Award, Flame, Activity, Crown } from 'lucide-react';

export const AlphaBadge: React.FC<AlphaBadgeProps> = ({
  id,
  variant,
  label,
  icon,
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider select-none';
  
  const variantStyles = {
    level: 'bg-[#16213E] text-[#FFD700] border border-[#FFD700]/30 shadow-[0_2px_8px_rgba(255,215,0,0.1)]',
    streak: 'bg-[#E94560]/10 text-[#E94560] border border-[#E94560]/20 animate-[pulse_2s_infinite]',
    status: 'bg-[#00D9A5]/10 text-[#00D9A5] border border-[#00D9A5]/20',
    premium: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0F0F1A] shadow-[0_4px_12px_rgba(255,215,0,0.2)]',
  };

  const defaultIcons = {
    level: <Award className="w-3.5 h-3.5" />,
    streak: <Flame className="w-3.5 h-3.5 fill-current" />,
    status: <Activity className="w-3.5 h-3.5" />,
    premium: <Crown className="w-3.5 h-3.5 fill-current" />,
  };

  return (
    <span
      id={id}
      className={`
        ${baseStyle}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon || defaultIcons[variant]}
      <span>{label}</span>
    </span>
  );
};

export const reactBadgeCode = `import React from 'react';
import { Award, Flame, Activity, Crown } from 'lucide-react';

interface AlphaBadgeProps {
  variant: 'level' | 'streak' | 'status' | 'premium';
  label: string;
  icon?: React.ReactNode;
}

export const AlphaBadge: React.FC<AlphaBadgeProps> = ({ variant, label, icon }) => {
  const baseStyle = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider';
  
  const variantStyles = {
    level: 'bg-[#16213E] text-[#FFD700] border border-[#FFD700]/30',
    streak: 'bg-[#E94560]/10 text-[#E94560] border border-[#E94560]/20 animate-pulse',
    status: 'bg-[#00D9A5]/10 text-[#00D9A5] border border-[#00D9A5]/20',
    premium: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0F0F1A]',
  };

  const defaultIcons = {
    level: <Award className="w-3 h-3" />,
    streak: <Flame className="w-3 h-3" />,
    status: <Activity className="w-3 h-3" />,
    premium: <Crown className="w-3 h-3" />,
  };

  return (
    <span className={\`\${baseStyle} \${variantStyles[variant]}\`}>
      {icon || defaultIcons[variant]}
      <span>{label}</span>
    </span>
  );
};`;

export const reactNativeBadgeCode = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AlphaBadgeProps {
  variant: 'level' | 'streak' | 'status' | 'premium';
  label: string;
}

export const AlphaBadge: React.FC<AlphaBadgeProps> = ({ variant, label }) => {
  const getBadgeStyle = () => {
    let container = [styles.badge];
    let text = [styles.text];

    if (variant === 'level') {
      container.push(styles.levelContainer);
      text.push(styles.levelText);
    } else if (variant === 'streak') {
      container.push(styles.streakContainer);
      text.push(styles.streakText);
    } else if (variant === 'status') {
      container.push(styles.statusContainer);
      text.push(styles.statusText);
    } else if (variant === 'premium') {
      container.push(styles.premiumContainer);
      text.push(styles.premiumText);
    }

    return { container, text };
  };

  const { container, text } = getBadgeStyle();

  return (
    <View style={container}>
      <Text style={text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  levelContainer: { backgroundColor: '#16213E', borderColor: 'rgba(255, 215, 0, 0.3)' },
  levelText: { color: '#FFD700' },
  
  streakContainer: { backgroundColor: 'rgba(233, 69, 96, 0.1)', borderColor: 'rgba(233, 69, 96, 0.2)' },
  streakText: { color: '#E94560' },
  
  statusContainer: { backgroundColor: 'rgba(0, 217, 165, 0.1)', borderColor: 'rgba(0, 217, 165, 0.2)' },
  statusText: { color: '#00D9A5' },
  
  premiumContainer: { backgroundColor: '#FFD700' },
  premiumText: { color: '#0F0F1A' },
});`;
