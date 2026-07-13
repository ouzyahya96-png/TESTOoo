import React, { useState, useEffect, useRef } from 'react';
import { AlphaTimerProps } from '../types';
import { Play, Pause, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export const AlphaTimer: React.FC<AlphaTimerProps> = ({
  id,
  type = 'countdown',
  initialSeconds = 60,
  onComplete,
  className = '',
}) => {
  const [seconds, setSeconds] = useState(type === 'countdown' ? initialSeconds : 0);
  const [isActive, setIsActive] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Interval state config (Kegel training cycle)
  const intervals = [
    { label: 'Contraction Kegel (Max)', duration: 5 },
    { label: 'Relâchement total', duration: 5 },
    { label: 'Contraction Kegel (Max)', duration: 5 },
    { label: 'Relâchement total', duration: 5 },
  ];

  useEffect(() => {
    // Reset timer when type or initialSeconds changes
    setSeconds(type === 'countdown' ? initialSeconds : 0);
    setIsActive(false);
  }, [type, initialSeconds]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (type === 'countdown') {
          setSeconds((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              if (onComplete) onComplete();
              return 0;
            }
            return prev - 1;
          });
        } else if (type === 'stopwatch') {
          setSeconds((prev) => prev + 1);
        } else if (type === 'interval') {
          setSeconds((prev) => {
            const currentDuration = intervals[currentIntervalIndex - 1]?.duration || 10;
            if (prev >= currentDuration - 1) {
              // Next interval cycle
              if (currentIntervalIndex < intervals.length) {
                setCurrentIntervalIndex((prevIdx) => prevIdx + 1);
                return 0;
              } else {
                // Done all intervals!
                setIsActive(false);
                setCurrentIntervalIndex(1);
                if (onComplete) onComplete();
                return 0;
              }
            }
            return prev + 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, type, currentIntervalIndex, onComplete]);

  const handleReset = () => {
    setIsActive(false);
    setSeconds(type === 'countdown' ? initialSeconds : 0);
    setCurrentIntervalIndex(1);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentIntervalLabel = type === 'interval' 
    ? intervals[currentIntervalIndex - 1]?.label 
    : null;

  return (
    <div id={id} className={`flex flex-col items-center bg-[#16213E]/50 border border-[#1A1A2E] rounded-2xl p-6 ${className}`}>
      {/* Label above */}
      <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest mb-3 select-none">
        {type === 'countdown' && 'Minuteur à Rebours'}
        {type === 'stopwatch' && 'Chronomètre Alpha'}
        {type === 'interval' && 'Entraînement par Intervalles'}
      </span>

      {/* Big typography monospace ("Roboto Mono") */}
      <div className="font-mono text-white text-5xl font-extrabold tracking-tight py-4 drop-shadow-[0_4px_12px_rgba(233,69,96,0.3)]">
        {formatTime(seconds)}
      </div>

      {/* Interval active step indicator */}
      {type === 'interval' && currentIntervalLabel && (
        <div className="text-center mt-1 mb-5">
          <span className="text-xs px-3 py-1 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] font-headline font-bold uppercase tracking-wider animate-pulse">
            Cycle {currentIntervalIndex}/{intervals.length} : {currentIntervalLabel}
          </span>
          <p className="text-[10px] text-[#5A5A5A] mt-2 font-mono uppercase">
            Prochain: {intervals[currentIntervalIndex]?.label || 'Fin de session'}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-150 active:scale-90
            ${isActive 
              ? 'bg-[#E94560]/20 text-[#E94560] border border-[#E94560]/40 hover:bg-[#E94560]/30 shadow-[0_0_15px_rgba(233,69,96,0.2)]' 
              : 'bg-[#00D9A5]/20 text-[#00D9A5] border border-[#00D9A5]/40 hover:bg-[#00D9A5]/30 shadow-[0_0_15px_rgba(0,217,165,0.2)]'
            }
          `}
          title={isActive ? "Pause" : "Play"}
        >
          {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[#16213E] text-[#8E8E93] border border-[#1A1A2E] hover:border-[#8E8E93]/40 hover:text-white cursor-pointer transition-all duration-150 active:scale-90"
          title="Réinitialiser"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {type === 'interval' && isActive && (
          <button
            onClick={() => {
              if (currentIntervalIndex < intervals.length) {
                setCurrentIntervalIndex((prev) => prev + 1);
                setSeconds(0);
              } else {
                setIsActive(false);
                setCurrentIntervalIndex(1);
                setSeconds(0);
                if (onComplete) onComplete();
              }
            }}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#16213E] text-[#FFD700] border border-[#FFD700]/20 hover:border-[#FFD700]/50 hover:text-white cursor-pointer transition-all duration-150 active:scale-90"
            title="Passer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const reactTimerCode = `import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AlphaTimerProps {
  type?: 'countdown' | 'stopwatch';
  initialSeconds?: number;
}

export const AlphaTimer: React.FC<AlphaTimerProps> = ({ type = 'countdown', initialSeconds = 60 }) => {
  const [seconds, setSeconds] = useState(type === 'countdown' ? initialSeconds : 0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => type === 'countdown' ? (prev > 0 ? prev - 1 : 0) : prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, type]);

  const format = (total: number) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  };

  return (
    <div className="flex flex-col items-center bg-[#16213E] p-6 rounded-2xl border border-[#1A1A2E]">
      <span className="font-mono text-white text-4xl font-bold">{format(seconds)}</span>
      <div className="flex gap-2 mt-4">
        <button onClick={() => setIsActive(!isActive)} className="p-3 bg-[#E94560] rounded-full text-white">
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={() => { setIsActive(false); setSeconds(type === 'countdown' ? initialSeconds : 0); }} className="p-3 bg-[#1A1A2E] rounded-full text-[#8E8E93]">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};`;

export const reactNativeTimerCode = `import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AlphaTimerProps {
  type?: 'countdown' | 'stopwatch';
  initialSeconds?: number;
}

export const AlphaTimer: React.FC<AlphaTimerProps> = ({ type = 'countdown', initialSeconds = 60 }) => {
  const [seconds, setSeconds] = useState(type === 'countdown' ? initialSeconds : 0);
  const [isActive, setIsActive] = useState(false);
  const timerId = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      timerId.current = setInterval(() => {
        setSeconds((prev) => (type === 'countdown' ? (prev > 0 ? prev - 1 : 0) : prev + 1));
      }, 1000);
    } else {
      clearInterval(timerId.current);
    }
    return () => clearInterval(timerId.current);
  }, [isActive, type]);

  const format = (total: number) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{format(seconds)}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => setIsActive(!isActive)}>
          <Text style={styles.btnText}>{isActive ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => { setIsActive(false); setSeconds(type === 'countdown' ? initialSeconds : 0); }}>
          <Text style={styles.btnSecText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#16213E', padding: 24, borderRadius: 16, alignItems: 'center' },
  timerText: { fontFamily: 'RobotoMono-Bold', fontSize: 36, color: '#FFFFFF' },
  row: { flexDirection: 'row', marginTop: 16 },
  btn: { backgroundColor: '#E94560', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  btnText: { color: '#FFFFFF', fontFamily: 'Montserrat-Bold' },
  btnSecondary: { backgroundColor: '#1A1A2E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  btnSecText: { color: '#8E8E93', fontFamily: 'Montserrat-Bold' },
});`;
