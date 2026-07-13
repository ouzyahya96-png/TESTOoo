import React from 'react';
import { AlphaInputProps } from '../types';

export const AlphaInput: React.FC<AlphaInputProps> = ({
  id,
  type,
  label,
  placeholder = 'Entrez une valeur...',
  value,
  onChange,
  options = [],
  min = 0,
  max = 100,
  step = 1,
  error,
  disabled = false,
  icon,
  className = '',
}) => {
  const isSelected = (val: any) => value === val;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest flex items-center justify-between">
          <span>{label}</span>
          {error && <span className="text-[#FF2D55] text-[10px] tracking-normal font-normal">{error}</span>}
        </label>
      )}

      <div className="relative w-full">
        {/* Toggle Option */}
        {type === 'toggle' ? (
          <button
            id={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(!value)}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left
              ${value 
                ? 'bg-[#16213E] border-[#E94560]/40 text-white' 
                : 'bg-[#16213E]/50 border-[#1A1A2E]/80 text-[#8E8E93]'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#E94560]/30'}
            `}
          >
            <span className="text-sm font-medium">{value ? 'Activé' : 'Désactivé'}</span>
            <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${value ? 'bg-[#E94560]' : 'bg-[#5A5A5A]'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        ) : type === 'slider' ? (
          /* Slider view */
          <div className="flex flex-col gap-2 p-3 bg-[#16213E]/40 border border-[#1A1A2E]/50 rounded-xl">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#8E8E93]">Intensité</span>
              <span className="text-white font-bold">{value} / {max}</span>
            </div>
            <input
              id={id}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-2 bg-[#16213E] rounded-lg appearance-none cursor-pointer accent-[#E94560] disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        ) : type === 'select' ? (
          /* Select Option */
          <div className="relative">
            {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]">{icon}</div>}
            <select
              id={id}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full p-3.5 bg-[#16213E] border rounded-xl text-white text-sm transition-all duration-200 appearance-none outline-none cursor-pointer
                ${icon ? 'pl-11' : 'pl-3.5'}
                ${error ? 'border-[#FF2D55]' : 'border-[#1A1A2E] hover:border-[#E94560]/30'}
                disabled:opacity-40 disabled:cursor-not-allowed
              `}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0F0F1A] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8E8E93]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        ) : (
          /* Default Text / Number inputs */
          <div className="relative">
            {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]">{icon}</div>}
            <input
              id={id}
              type={type}
              value={value}
              disabled={disabled}
              placeholder={placeholder}
              onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
              className={`w-full p-3.5 bg-[#16213E] border rounded-xl text-white placeholder-[#8E8E93]/50 text-sm transition-all duration-200 outline-none
                ${icon ? 'pl-11' : 'pl-3.5'}
                ${error ? 'border-[#FF2D55] focus:border-[#FF2D55] focus:shadow-[0_0_10px_rgba(255,45,85,0.15)]' : 'border-[#1A1A2E] focus:border-[#E94560]/60 focus:shadow-[0_0_10px_rgba(233,69,96,0.15)]'}
                disabled:opacity-40 disabled:cursor-not-allowed
              `}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const reactInputCode = `import React from 'react';

interface AlphaInputProps {
  type: 'text' | 'number' | 'select' | 'toggle' | 'slider';
  label?: string;
  placeholder?: string;
  value: any;
  onChange: (val: any) => void;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  error?: string;
}

export const AlphaInput: React.FC<AlphaInputProps> = ({
  type, label, placeholder, value, onChange, options = [], min = 0, max = 100, error
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-headline font-bold text-[#8E8E93]">{label}</label>}
      {type === 'toggle' ? (
        <button onClick={() => onChange(!value)} className="flex items-center justify-between p-3 bg-[#16213E] rounded-xl text-sm">
          <span>{value ? 'Activé' : 'Désactivé'}</span>
          <div className={\`w-10 h-5 rounded-full p-0.5 \${value ? 'bg-[#E94560]' : 'bg-[#5A5A5A]'}\`}>
            <div className={\`bg-white w-4 h-4 rounded-full transform transition-transform \${value ? 'translate-x-5' : ''}\`} />
          </div>
        </button>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="p-3 bg-[#16213E] text-white rounded-xl border border-[#1A1A2E] focus:border-[#E94560] outline-none" />
      )}
    </div>
  );
};`;

export const reactNativeInputCode = `import React from 'react';
import { View, Text, TextInput, Switch, StyleSheet } from 'react-native';

interface AlphaInputProps {
  type: 'text' | 'number' | 'toggle';
  label?: string;
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
}

export const AlphaInput: React.FC<AlphaInputProps> = ({
  type, label, value, onChange, placeholder
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {type === 'toggle' ? (
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>{value ? 'Activé' : 'Désactivé'}</Text>
          <Switch
            value={value}
            onValueChange={onChange}
            trackColor={{ false: '#5A5A5A', true: '#E94560' }}
            thumbColor="#FFFFFF"
          />
        </View>
      ) : (
        <TextInput
          value={String(value)}
          onChangeText={onChange}
          keyboardType={type === 'number' ? 'numeric' : 'default'}
          placeholder={placeholder}
          placeholderTextColor="rgba(142, 142, 147, 0.5)"
          style={styles.input}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: 8 },
  label: { color: '#8E8E93', fontFamily: 'Montserrat-Bold', fontSize: 11, marginBottom: 6 },
  input: {
    backgroundColor: '#16213E',
    borderColor: '#1A1A2E',
    borderWidth: 1,
    borderRadius: 12,
    color: '#FFFFFF',
    padding: 14,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213E',
    padding: 14,
    borderRadius: 12,
  },
  toggleText: { color: '#FFFFFF', fontSize: 14 },
});`;
