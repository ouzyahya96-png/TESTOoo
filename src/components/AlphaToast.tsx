import React, { useEffect } from 'react';
import { AlphaToastProps } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const AlphaToast: React.FC<AlphaToastProps> = ({
  id,
  type,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeStyles = {
    success: {
      container: 'bg-[#16213E] border-[#00D9A5] text-white shadow-[0_4px_16px_rgba(0,217,165,0.2)]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#00D9A5] shrink-0" />,
      borderGlow: 'before:bg-[#00D9A5]',
    },
    warning: {
      container: 'bg-[#16213E] border-[#FF9500] text-white shadow-[0_4px_16px_rgba(255,149,0,0.2)]',
      icon: <AlertTriangle className="w-5 h-5 text-[#FF9500] shrink-0" />,
      borderGlow: 'before:bg-[#FF9500]',
    },
    error: {
      container: 'bg-[#16213E] border-[#FF2D55] text-white shadow-[0_4px_16px_rgba(255,45,85,0.2)]',
      icon: <AlertCircle className="w-5 h-5 text-[#FF2D55] shrink-0" />,
      borderGlow: 'before:bg-[#FF2D55]',
    },
    info: {
      container: 'bg-[#16213E] border-[#E94560] text-white shadow-[0_4px_16px_rgba(233,69,96,0.2)]',
      icon: <Info className="w-5 h-5 text-[#E94560] shrink-0" />,
      borderGlow: 'before:bg-[#E94560]',
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <div
      id={id}
      className={`
        relative flex items-center justify-between gap-4 p-4 rounded-xl border max-w-sm w-full select-none
        before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-xl
        animate-[slide-in_0.2s_ease-out]
        ${currentStyle.container}
        ${currentStyle.borderGlow}
      `}
      style={{
        animation: 'slide-in-right 250ms ease-out',
      }}
    >
      <div className="flex items-center gap-3">
        {currentStyle.icon}
        <p className="text-xs font-medium tracking-wide font-body text-white">
          {message}
        </p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-[#8E8E93] hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar countdown track */}
      <div 
        className="absolute bottom-0 left-1 right-1 h-[2px] bg-white/10 overflow-hidden rounded-b-xl"
      >
        <div 
          className={`h-full ${type === 'success' ? 'bg-[#00D9A5]' : type === 'warning' ? 'bg-[#FF9500]' : type === 'error' ? 'bg-[#FF2D55]' : 'bg-[#E94560]'} animate-[toast-progress_linear_forwards]`}
          style={{
            animationName: 'toast-progress',
            animationDuration: `${duration}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const reactToastCode = `import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface AlphaToastProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onClose: (id: string) => void;
}

export const AlphaToast: React.FC<AlphaToastProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const colorHex = {
    success: 'border-[#00D9A5]', warning: 'border-[#FF9500]', error: 'border-[#FF2D55]', info: 'border-[#E94560]'
  }[type];

  return (
    <div className={\`flex items-center justify-between p-4 bg-[#16213E] rounded-xl border-l-4 \${colorHex} shadow-lg\`}>
      <span className="text-white text-xs font-medium">{message}</span>
      <button onClick={() => onClose(id)} className="text-[#8E8E93] hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};`;

export const reactNativeToastCode = `import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AlphaToastProps {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export const AlphaToast: React.FC<AlphaToastProps> = ({ type, message }) => {
  const colorHex = type === 'success' ? '#00D9A5' : type === 'warning' ? '#FF9500' : '#FF2D55';

  return (
    <View style={[styles.container, { borderLeftColor: colorHex }]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213E',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  message: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter-Medium' },
});`;
