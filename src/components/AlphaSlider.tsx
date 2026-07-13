import React from 'react';
import { AlphaSliderProps } from '../types';

export const AlphaSlider: React.FC<AlphaSliderProps> = ({
  id,
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  icon,
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full flex flex-col gap-2 p-4 bg-[#16213E]/60 border border-[#1A1A2E] rounded-2xl ${className}`}>
      {/* Label and Value line */}
      <div className="flex justify-between items-center select-none">
        <div className="flex items-center gap-2 text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider">
          {icon && <span className="text-[#E94560]">{icon}</span>}
          <span>{label || 'Intensité'}</span>
        </div>
        <span className="font-mono text-sm font-bold text-[#FFD700] bg-[#1A1A2E] px-2.5 py-1 rounded-lg border border-[#FFD700]/10">
          {value} / {max}
        </span>
      </div>

      {/* Actual Slider Track and Thumb */}
      <div className="relative flex items-center mt-1">
        {/* Fill Highlight */}
        <div 
          className="absolute h-1.5 bg-gradient-to-r from-[#E94560] to-[#FFD700] rounded-full pointer-events-none" 
          style={{ width: `${percentage}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-[#0F0F1A] rounded-full appearance-none cursor-pointer outline-none transition-all duration-150
            accent-[#E94560] hover:accent-[#FFD700]
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(233,69,96,0.5)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-all
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(233,69,96,0.5)]
          "
        />
      </div>

      {/* Min and Max markers */}
      <div className="flex justify-between text-[10px] font-mono text-[#5A5A5A] select-none">
        <span>MIN {min}</span>
        <span>MAX {max}</span>
      </div>
    </div>
  );
};

export const reactSliderCode = `import React from 'react';

interface AlphaSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  icon?: React.ReactNode;
}

export const AlphaSlider: React.FC<AlphaSliderProps> = ({
  value, min, max, step = 1, onChange, label, icon
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="w-full bg-[#16213E] p-4 rounded-xl border border-[#1A1A2E]">
      <div className="flex justify-between items-center text-xs font-headline text-[#8E8E93] mb-2">
        <span className="flex items-center gap-1.5">{icon} {label || 'SLIDER'}</span>
        <span className="font-mono text-white">{value}</span>
      </div>
      <div className="relative flex items-center">
        <div className="absolute h-1 bg-[#E94560] rounded" style={{ width: \`\${percentage}%\` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1 bg-[#0F0F1A] rounded-lg appearance-none cursor-pointer accent-[#E94560]" />
      </div>
    </div>
  );
};`;

export const reactNativeSliderCode = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface AlphaSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
}

export const AlphaSlider: React.FC<AlphaSliderProps> = ({
  value, min, max, step = 1, onChange, label
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.labelText}>{label || 'INTENSITY'}</Text>
        <Text style={styles.valueText}>{value} / {max}</Text>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#E94560"
        maximumTrackTintColor="#0F0F1A"
        thumbTintColor="#FFD700"
        style={styles.slider}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#16213E', padding: 16, borderRadius: 16, marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  labelText: { color: '#8E8E93', fontFamily: 'Montserrat-Bold', fontSize: 11 },
  valueText: { color: '#FFD700', fontFamily: 'RobotoMono-Bold', fontSize: 13 },
  slider: { width: '100%', height: 40 },
});`;
