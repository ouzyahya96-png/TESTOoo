import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  Share2,
  Calendar,
  Trophy,
  Info,
  Play,
  Pause,
  Square,
  Zap,
  Activity,
  Shield,
  Flame,
  Snowflake,
  Thermometer,
  AlertTriangle,
  Check,
  Lock,
  ChevronLeft,
  Settings,
  Code,
  Copy,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface ColdExposureScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  vitalityPoints?: number;
  onPointsUpdate?: (newPoints: number) => void;
}

export const ColdExposureScreen: React.FC<ColdExposureScreenProps> = ({ addToast, onBack, vitalityPoints = 2340, onPointsUpdate }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("Aujourd'hui");

  // Core Cold Parameters State loaded from localStorage
  const [coldScore, setColdScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alphaman_cold_score');
      return saved ? Number(saved) : 78;
    } catch {
      return 78;
    }
  });
  const [personalBest, setPersonalBest] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alphaman_cold_pb');
      return saved ? Number(saved) : 82;
    } catch {
      return 82;
    }
  });
  const [sessionDuration, setSessionDuration] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alphaman_cold_duration');
      return saved ? Number(saved) : 150;
    } catch {
      return 150;
    }
  });
  const [targetDuration, setTargetDuration] = useState<number>(180); // 3 minutes standard
  const [targetTemp, setTargetTemp] = useState<number>(15); // °C
  const [trend, setTrend] = useState<number>(15);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alphaman_cold_score', String(coldScore));
      localStorage.setItem('alphaman_cold_pb', String(personalBest));
      localStorage.setItem('alphaman_cold_duration', String(sessionDuration));
    } catch (e) {
      console.warn("Failed to save cold parameters state to localStorage", e);
    }
  }, [coldScore, personalBest, sessionDuration]);

  // Timer State
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [timerElapsed, setTimerElapsed] = useState<number>(0); // in seconds
  const [timerTarget, setTimerTarget] = useState<number>(180); // 3 minutes standard in seconds

  // Science Modal
  const [showScienceSheet, setShowScienceSheet] = useState<boolean>(false);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculated Benefits multipliers
  const dopamineBoost = Math.min(250, Math.round((sessionDuration / targetDuration) * 250));
  const norepinephrineBoost = Math.min(530, Math.round((sessionDuration / targetDuration) * 530));
  const resilienceBoost = Math.min(40, Math.round((sessionDuration / targetDuration) * 40));
  const metabolismBoost = Math.min(15, Math.round((sessionDuration / targetDuration) * 15));

  // Progression Levels Setup
  const progressionLevels = [
    { name: "Débutant", description: "30s à 20°C", duration: 30, temp: 20, status: 'completed' as const },
    { name: "Intermédiaire", description: "1 min à 18°C", duration: 60, temp: 18, status: 'completed' as const },
    { name: "Avancé", description: "2 min à 15°C", duration: 120, temp: 15, status: 'completed' as const },
    { name: "Expert", description: "3 min à 12°C", duration: 180, temp: 12, status: 'current' as const },
    { name: "Wim Hof", description: "5 min à 10°C + respiration", duration: 300, temp: 10, status: 'locked' as const }
  ];

  // 7 days history
  const weeklyData = [
    { day: "Lun", duration: 150, temp: 15, score: 78 },
    { day: "Mar", duration: 120, temp: 16, score: 65 },
    { day: "Mer", duration: 180, temp: 14, score: 100 },
    { day: "Jeu", duration: 90,  temp: 17, score: 50 },
    { day: "Ven", duration: 0,   temp: 20, score: 0 },
    { day: "Sam", duration: 210, temp: 12, score: 100 },
    { day: "Dim", duration: 150, temp: 15, score: 78 }
  ];

  // Timer interval engine
  useEffect(() => {
    if (timerActive && !timerPaused) {
      timerRef.current = setInterval(() => {
        let reachedTarget = false;
        let nextValCalculated = 0;
        let nextScoreCalculated = 0;

        setTimerElapsed(prev => {
          const nextVal = prev + 1;
          nextValCalculated = nextVal;
          nextScoreCalculated = Math.min(100, Math.round((nextVal / targetDuration) * 100));

          if (nextVal >= timerTarget) {
            reachedTarget = true;
            return timerTarget;
          }
          return nextVal;
        });

        // Run side-effects outside of the functional updater callback
        setSessionDuration(nextValCalculated);
        setColdScore(nextScoreCalculated);

        if (reachedTarget) {
          handleStopTimer();
          addToast('success', "Session de Froid terminée ! Incroyable résilience. ❄️");
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timerPaused, timerTarget, targetDuration]);

  // Format mm:ss helper
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setTimerActive(true);
    setTimerPaused(false);
    addToast('info', "Déclenchement du choc thermique... Respire calmement par le nez. ❄️");
  };

  const handlePauseTimer = () => {
    setTimerPaused(true);
    addToast('warning', "Chronomètre suspendu.");
  };

  const handleStopTimer = () => {
    setTimerActive(false);
    setTimerPaused(false);
    const finalDuration = timerElapsed > 0 ? timerElapsed : sessionDuration;
    
    // Check for personal best update
    if (finalDuration > personalBest) {
      setPersonalBest(finalDuration);
    }
    
    // Award points
    if (onPointsUpdate) {
      onPointsUpdate(vitalityPoints + 30);
    }
    
    setTimerElapsed(0);
    addToast('success', `Session de froid enregistrée : ${formatTime(finalDuration)} accumulés ! +30 PTS d'Esprit Souverain. ⚡`);
  };

  const handleSetTimerTarget = (mins: number) => {
    setTimerTarget(mins * 60);
    setTargetDuration(mins * 60);
    addToast('info', `Objectif de choc thermique réglé sur ${mins} minute(s).`);
  };

  const handleDateChange = () => {
    const dates = ["Aujourd'hui", "Hier", "13 Juillet", "12 Juillet"];
    const currIdx = dates.indexOf(selectedDate);
    const nextIdx = (currIdx + 1) % dates.length;
    setSelectedDate(dates[nextIdx]);

    if (nextIdx === 1) { // Hier
      setColdScore(65);
      setSessionDuration(120);
      setTargetTemp(16);
    } else if (nextIdx === 2) { // 13 Juillet
      setColdScore(100);
      setSessionDuration(210);
      setTargetTemp(12);
    } else { // Reset
      setColdScore(78);
      setSessionDuration(150);
      setTargetTemp(15);
    }
    addToast('info', `Météo et historiques d'exposition chargés pour : ${dates[nextIdx]}`);
  };

  const getScoreLabelAndColor = (score: number) => {
    if (score >= 90) return { label: "PARFAIT", color: "text-[#00D9A5]", border: "border-[#00D9A5]" };
    if (score >= 80) return { label: "EXCELLENT", color: "text-[#4A90D9]", border: "border-[#4A90D9]" };
    if (score >= 70) return { label: "BIEN", color: "text-[#FFD700]", border: "border-[#FFD700]" };
    if (score >= 60) return { label: "MOYEN", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    if (score >= 40) return { label: "INSUFFISANT", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    return { label: "CRITIQUE", color: "text-[#FF2D55]", border: "border-[#FF2D55]" };
  };

  const scoreConfig = getScoreLabelAndColor(coldScore);

  // React Native Expo source code string representation matching specification
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Share, 
  Dimensions, 
  Animated 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function ColdExposureScreen({ route, navigation }) {
  const [coldScore, setColdScore] = useState(78);
  const [sessionDuration, setSessionDuration] = useState(150); // seconds
  const [targetDuration, setTargetDuration] = useState(180); // 3 min
  const [targetTemp, setTargetTemp] = useState(15); // °C

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Mon exposition au froid ALPHA est de 2m 30s à \${targetTemp}°C. Dopamine +250% libérée ! ❄️\`
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.touchTarget} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FROID</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.touchTarget}>
            <Feather name="calendar" size={22} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchTarget} onPress={handleShare}>
            <Feather name="share-2" size={22} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* SCORE PRINCIPAL */}
        <View style={[styles.mainScoreCard, coldScore >= 80 ? styles.borderBlue : styles.borderRed]}>
          <Text style={styles.scoreTitle}>SESSION AUJOURD'HUI</Text>
          <Text style={styles.scoreText}>{coldScore}</Text>
          <Text style={styles.scoreLabel}>BIEN</Text>
          <Text style={styles.durationLabel}>❄️ 2 min 30s</Text>
          <Text style={styles.tempLabel}>🌡️ {targetTemp}°C</Text>
          <Text style={styles.comparativeLabel}>Objectif : 3 min • Manque : 30s</Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>↑ +15% vs hier</Text>
          </View>
        </View>

        {/* TIMER COCKPIT */}
        <Text style={styles.sectionTitle}>TIMER FROID</Text>
        <View style={styles.timerCard}>
          <View style={styles.progressRing}>
            <Text style={styles.timerDigits}>02:30</Text>
            <Text style={styles.timerUnit}>min</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#4A90D9', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  mainScoreCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, alignItems: 'center', borderWidth: 2 },
  borderBlue: { borderColor: '#4A90D9' },
  borderRed: { borderColor: '#FF2D55' },
  scoreTitle: { fontSize: 12, color: '#8E8E93', letterSpacing: 3, fontWeight: '600' },
  scoreText: { fontSize: 72, fontWeight: 'bold', color: '#4A90D9' },
  scoreLabel: { fontSize: 16, color: '#4A90D9', fontWeight: 'bold', marginTop: 8 },
  durationLabel: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold', marginTop: 12 },
  tempLabel: { fontSize: 18, color: '#4A90D9', fontWeight: 'bold', marginTop: 8 },
  comparativeLabel: { fontSize: 13, color: '#8E8E93', marginTop: 8 },
  trendBadge: { backgroundColor: 'rgba(0, 217, 165, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
  trendText: { color: '#00D9A5', fontSize: 14, fontWeight: '500' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source de l'exposition au Froid copié ! ❄️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#4A90D9] uppercase tracking-widest bg-[#4A90D9]/10 border border-[#4A90D9]/20 px-2 rounded-md">
            Pilier Vitalité #4 — ColdExposure (3.4)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Choc Thermique Inoculateur — ColdExposureScreen
          </h2>
          <p className="text-xs text-gray-400">
            Augmente la résilience mentale, multiplie par 2.5 la dopamine plasmatique et active le tissu adipeux brun sain.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour
            </AlphaButton>
          )}

          <AlphaButton 
            variant={showNativeCode ? "gold" : "primary"}
            size="sm"
            onClick={() => setShowNativeCode(!showNativeCode)}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            {showNativeCode ? "Masquer le Code" : "Inspecter Code Expo"}
          </AlphaButton>
        </div>
      </div>

      {/* REACT NATIVE CODE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">ColdExposureScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Configure le choc anabolisant, la transition thermorégulatrice et la stimulation de l'axe de motivation dopaminergique.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyExpoCode}
              className="flex items-center gap-2 text-[10px] font-headline"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le Code Natif'}
            </AlphaButton>
          </div>
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[350px] custom-scrollbar">
            {expoNativeCode}
          </pre>
        </div>
      )}

      {/* DOUBLE PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: ADJUST COLD SIMULATIONS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#4A90D9] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Régulateur de Douche Froide
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Simulez la température et le temps sous l'eau pour observer l'effet neurochimique immédiat.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Slider duration seconds */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Temps Exposé</span>
                <span className="text-[#4A90D9] font-bold">{formatTime(sessionDuration)} / {formatTime(targetDuration)}</span>
              </div>
              <input 
                type="range" min="0" max="300" value={sessionDuration} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSessionDuration(val);
                  setColdScore(Math.min(100, Math.round((val / targetDuration) * 100)));
                }}
                className="w-full accent-[#4A90D9] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Target Temperature Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Température de l'eau</span>
                <span className="text-[#FF2D55] font-bold">{targetTemp}°C</span>
              </div>
              <input 
                type="range" min="5" max="22" value={targetTemp} 
                onChange={(e) => {
                  const tempVal = parseInt(e.target.value);
                  setTargetTemp(tempVal);
                }}
                className="w-full accent-[#FF2D55] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Select standard targets */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-headline uppercase block">Objectif Ciblé</label>
              <select 
                value={targetDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTargetDuration(val);
                  setColdScore(Math.min(100, Math.round((sessionDuration / val) * 100)));
                }}
                className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-xs text-white"
              >
                <option value="30">30 secondes (Niveau Novice / Bain Glacé d'essai)</option>
                <option value="60">1 minute (Niveau Initié / Douche de base)</option>
                <option value="120">2 minutes (Niveau Standard / Résilience OK)</option>
                <option value="180">3 minutes (Niveau Confirmé / Neuro-optimisation)</option>
                <option value="300">5 minutes (Niveau Elite / Wim Hof Bath)</option>
              </select>
            </div>

            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setSessionDuration(180);
                  setTargetDuration(180);
                  setColdScore(100);
                  setTargetTemp(11);
                  addToast('success', "Simulé : Bain Glacé de 3 min à 11°C ! Statut neurochimique Elite. ❄️");
                }}
                className="w-full py-1.5 px-3 bg-[#4A90D9]/10 border border-[#4A90D9]/25 hover:bg-[#4A90D9]/20 text-[#4A90D9] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Session Confirmée (100%)
              </button>
              <button 
                onClick={() => {
                  setSessionDuration(15);
                  setColdScore(8);
                  setTargetTemp(21);
                  addToast('warning', "Simulé : Douche tiède écourtée. Aucun stress anabolisant.");
                }}
                className="w-full py-1.5 px-3 bg-[#FF2D55]/10 border border-[#FF2D55]/25 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Abandon Rapide (8%)
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW SIMULATOR */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN CONTAINER */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* STATUS BAR */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>07:45</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#4A90D9] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-950 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-md font-headline font-black tracking-widest text-[#4A90D9] uppercase">
                  Froid
                </h1>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleDateChange}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowScienceSheet(true)}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* DYNAMIC SCROLL CONTAINER */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* DATE SELECT BAR */}
                <div className="flex justify-between items-center bg-[#16213E]/40 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-headline">
                  <span className="text-gray-400">Date d'exposition</span>
                  <button 
                    onClick={handleDateChange}
                    className="text-[#4A90D9] font-black hover:underline cursor-pointer"
                  >
                    {selectedDate} • Modifier ↻
                  </button>
                </div>

                {/* SECTION 1: SCORE FROID DU JOUR (CARD PRINCIPALE) */}
                <div className={`bg-[#16213E] rounded-[24px] p-6 text-center border-2 ${scoreConfig.border} shadow-2xl relative overflow-hidden transition-all duration-300`}>
                  
                  {/* Neon glacier radial glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#4A90D9]/5 rounded-full blur-2xl pointer-events-none" />

                  {coldScore > personalBest && (
                    <div className="absolute top-4 right-4 bg-[#FFD700] rounded px-2 py-0.5 animate-pulse">
                      <span className="text-[9px] font-headline font-black text-[#0F0F1A]">🏆 RECORD</span>
                    </div>
                  )}

                  <span className="text-[10px] font-headline font-black text-[#8E8E93] tracking-[3px] block">
                    SESSION AUJOURD'HUI
                  </span>

                  {/* Main score digits */}
                  <div className="my-4 block relative">
                    <span className="text-6xl font-mono font-black text-[#4A90D9] tracking-tighter drop-shadow-[0_0_20px_rgba(74,144,217,0.3)] block">
                      {coldScore}
                    </span>
                  </div>

                  <span className={`text-sm font-headline font-black tracking-widest block uppercase ${scoreConfig.color}`}>
                    {scoreConfig.label}
                  </span>

                  {/* Temperature & duration details */}
                  <div className="flex flex-col items-center gap-1 mt-3">
                    <div className="flex items-center justify-center gap-1.5 text-md font-mono font-black text-white">
                      <Snowflake className="w-5 h-5 text-[#4A90D9]" />
                      <span>{formatTime(sessionDuration)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-mono font-bold text-[#4A90D9]">
                      <Thermometer className="w-4 h-4" />
                      <span>{targetTemp}°C</span>
                    </div>
                  </div>

                  {/* Comparison text */}
                  <p className="text-xs text-gray-400 font-headline mt-2.5">
                    Objectif : {formatTime(targetDuration)} • Manque : {sessionDuration < targetDuration ? `${formatTime(targetDuration - sessionDuration)}` : "0s"}
                  </p>

                  {/* Trend Badge */}
                  <div className="mt-4 inline-flex bg-[#00D9A5]/10 border border-[#00D9A5]/25 text-[#00D9A5] rounded-xl py-1 px-4 text-xs font-bold">
                    <span>↑ +{trend}% vs hier</span>
                  </div>
                </div>

                {/* SECTION 2: TIMER FROID EN DIRECT */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#4A90D9] uppercase tracking-wider px-1">
                    Timer Froid
                  </h3>

                  <div className="bg-[#16213E] rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center">
                    
                    {/* Circle circular progress ring */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="3" />
                        <circle 
                          cx="18" cy="18" r="15.915" fill="none" stroke="#4A90D9" strokeWidth="3" 
                          strokeDasharray={`${Math.min(100, Math.round((sessionDuration / targetDuration) * 100))} 100`} 
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Digits center */}
                      <div className="absolute text-center">
                        <span className="text-3xl font-mono font-black text-[#4A90D9] tracking-tighter block leading-none">
                          {timerActive ? formatTime(timerElapsed) : formatTime(sessionDuration)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-headline uppercase font-bold mt-1 block">min</span>
                      </div>
                    </div>

                    {/* Quick setting slider for target temperature */}
                    <div className="w-full mt-5 space-y-1 bg-black/10 p-3 rounded-2xl text-left">
                      <div className="flex justify-between items-center text-xs font-headline">
                        <span className="text-gray-400">Température de douche</span>
                        <span className="text-[#4A90D9] font-mono font-black">{targetTemp}°C</span>
                      </div>
                      <input 
                        type="range" min="5" max="22" value={targetTemp} 
                        onChange={(e) => setTargetTemp(parseInt(e.target.value))}
                        className="w-full accent-[#4A90D9] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Controls row */}
                    <div className="flex gap-4 mt-5 w-full">
                      {!timerActive ? (
                        <button 
                          onClick={handleStartTimer}
                          className="flex-1 h-11 bg-[#4A90D9] hover:bg-[#4A90D9]/90 text-white rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          DÉMARRER
                        </button>
                      ) : (
                        <div className="flex gap-3 w-full">
                          {!timerPaused ? (
                            <button 
                              onClick={handlePauseTimer}
                              className="flex-1 h-11 bg-[#FF9500] hover:bg-[#FF9500]/90 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <Pause className="w-4 h-4 fill-[#0F0F1A]" />
                              PAUSE
                            </button>
                          ) : (
                            <button 
                              onClick={handleStartTimer}
                              className="flex-1 h-11 bg-[#00D9A5] hover:bg-[#00D9A5]/90 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <Play className="w-4 h-4 fill-[#0F0F1A]" />
                              REPRENDRE
                            </button>
                          )}
                          <button 
                            onClick={handleStopTimer}
                            className="h-11 px-5 bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          >
                            <Square className="w-4 h-4 fill-white" />
                            FIN
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Target durations chips */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-5 border-t border-white/5 pt-4">
                      {["30s", "1 min", "2 min", "3 min", "5 min"].map((lbl, idx) => {
                        const secondsMap = [30, 60, 120, 180, 300];
                        const sVal = secondsMap[idx];
                        return (
                          <button 
                            key={lbl}
                            onClick={() => handleSetTimerTarget(sVal / 60)}
                            className={`py-1 px-3 rounded-full text-[10px] font-headline font-bold border transition-all cursor-pointer
                              ${targetDuration === sVal 
                                ? 'bg-[#4A90D9] text-white border-[#4A90D9]' 
                                : 'border-white/10 text-gray-400 hover:border-gray-500'
                              }
                            `}
                          >
                            {lbl}
                          </button>
                        );
                      })}
                    </div>

                    {/* Warning card for newcomers */}
                    <div className="mt-4 flex items-center gap-3 bg-[#FF9500]/5 border border-[#FF9500]/25 rounded-xl p-3 text-left">
                      <AlertTriangle className="w-5 h-5 text-[#FF9500] flex-shrink-0" />
                      <p className="text-[10px] font-headline text-[#FF9500] leading-snug">
                        Débute par 30s sous l'eau froide à la fin d'une douche normale. Augmente la durée progressivement.
                      </p>
                    </div>

                  </div>
                </div>

                {/* SECTION 3: BENEFICES DU FROID (2x2 GRID) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Bénéfices Activés
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Benefit 1: Dopamine */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#FFD700] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">DOPAMINE</span>
                        <span className="text-xs font-mono font-black text-[#FFD700]">+{dopamineBoost}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">MOTIVATION</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#FFD700]" style={{ width: `${(dopamineBoost / 250) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-none">Focus & Volonté</span>
                    </div>

                    {/* Benefit 2: Norepinephrine */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#FF2D55] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">NORADRÉNALINE</span>
                        <span className="text-xs font-mono font-black text-[#FF2D55]">+{norepinephrineBoost}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">ÉNERGIE</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#FF2D55]" style={{ width: `${(norepinephrineBoost / 530) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-none">Choc thermique</span>
                    </div>

                    {/* Benefit 3: Resilience */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#00D9A5] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">RÉSILIENCE</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">+{resilienceBoost}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">MENTAL</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#00D9A5]" style={{ width: `${(resilienceBoost / 40) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-none">Inoculation du stress</span>
                    </div>

                    {/* Benefit 4: Metabolism */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#4A90D9] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">MÉTABOLISME</span>
                        <span className="text-xs font-mono font-black text-[#4A90D9]">+{metabolismBoost}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">GRAISSES BRUNES</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#4A90D9]" style={{ width: `${(metabolismBoost / 15) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-none">Tissu adipeux brun</span>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: PROTOCOLE DE PROGRESSION */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Ta Progression
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 border border-white/5 space-y-4">
                    
                    <div className="space-y-1 text-left">
                      {progressionLevels.map((lvl, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-[#1A1A2E] last:border-0 relative">
                          <div className="flex items-center gap-3">
                            {/* Circle badge indicator */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[10px] font-bold
                              ${lvl.status === 'completed' ? 'bg-[#00D9A5] border-[#00D9A5] text-white' : ''}
                              ${lvl.status === 'current' ? 'bg-[#16213E] border-[#4A90D9] text-[#4A90D9]' : ''}
                              ${lvl.status === 'locked' ? 'bg-[#1A1A2E] border-gray-600 text-gray-500' : ''}
                            `}>
                              {lvl.status === 'completed' && <Check className="w-3.5 h-3.5 text-white" />}
                              {lvl.status === 'current' && <div className="w-2.5 h-2.5 rounded-full bg-[#4A90D9]" />}
                              {lvl.status === 'locked' && <Lock className="w-3 h-3 text-gray-500" />}
                            </div>

                            <div>
                              <h4 className={`text-xs font-headline font-black ${lvl.status === 'current' ? 'text-[#4A90D9]' : 'text-white'}`}>
                                {lvl.name}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-headline">{lvl.description}</p>
                            </div>
                          </div>

                          <span className={`text-[9px] font-headline font-black uppercase px-2 py-0.5 rounded
                            ${lvl.status === 'completed' ? 'text-[#00D9A5]' : ''}
                            ${lvl.status === 'current' ? 'bg-[#4A90D9] text-white' : ''}
                            ${lvl.status === 'locked' ? 'text-gray-500' : ''}
                          `}>
                            {lvl.status === 'completed' && "✓"}
                            {lvl.status === 'current' && "En cours"}
                            {lvl.status === 'locked' && "Bloqué"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Overall progression progress slider bar */}
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-[11px] text-[#8E8E93] font-headline">
                        <span>Niveau 4/5 — Expert</span>
                        <span className="font-bold text-[#4A90D9]">75%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4A90D9] rounded-full transition-all duration-500" style={{ width: '75%' }} />
                      </div>
                    </div>

                    {/* Voir techniques trigger */}
                    <button 
                      onClick={() => addToast('info', "Chargement des techniques avancées Wim Hof de respiration...")}
                      className="w-full h-10 border border-[#4A90D9]/40 hover:bg-[#4A90D9]/10 text-[#4A90D9] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
                    >
                      VOIR TECHNIQUES
                    </button>
                  </div>
                </div>

                {/* SECTION 5: GRAPHIQUE 7 JOURS */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    7 Derniers Jours
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 shadow-lg border border-white/5 space-y-4">
                    
                    {/* SVG column chart */}
                    <div className="h-32 w-full relative flex items-end justify-between px-2 pt-6">
                      
                      {/* y=180s target line */}
                      <div className="absolute left-0 right-0 border-t border-dashed border-[#00D9A5]/40" style={{ bottom: '60%' }}>
                        <span className="absolute -top-3 right-0 text-[8px] text-[#00D9A5] font-mono font-bold bg-[#16213E] px-1">Cible 3 min</span>
                      </div>

                      {weeklyData.map((d, i) => {
                        const h = `${Math.min(100, Math.round((d.duration / 300) * 100))}%`;
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                            <div className="h-24 w-full flex items-end justify-center relative">
                              {d.duration > 0 ? (
                                <div 
                                  className="w-6 bg-[#4A90D9] rounded-t-sm transition-all group-hover:brightness-110 relative"
                                  style={{ height: h }}
                                >
                                  {/* Tooltip on hover */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#0F0F1A] border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-mono text-white whitespace-nowrap z-20">
                                    {formatTime(d.duration)}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-6 h-1 bg-gray-800 rounded-sm" title="Zéro exposition" />
                              )}
                            </div>
                            <span className="text-[9px] text-gray-500 font-headline mt-2">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 text-xs font-headline">
                      <span className="text-gray-400">Moyenne : <strong className="text-white">2m 15s</strong></span>
                      <span className="text-[#00D9A5] font-black">📈 En hausse cette semaine</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: CONSEIL SCIENTIFIQUE */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#4A90D9] rounded-r-xl p-4 space-y-2">
                  <div className="flex gap-3 items-start">
                    <Snowflake className="w-5 h-5 text-[#4A90D9] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 L'exposition au froid déclenche une libération de noradrénaline 5x supérieure à la normale. C'est le stimulus le plus puissant pour la dopamine naturelle — supérieur à la caféine, comparable à certains médicaments.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Søeberg et al. (2021). Brown adipose tissue & cold exposure. Cell Reports Medicine.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

              {/* SIMULATED TAB BAR */}
              <div className="h-16 border-t border-gray-950 bg-[#16213E] flex items-center justify-around px-4 z-10 select-none">
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#4A90D9] cursor-pointer">
                  <Snowflake className="w-5 h-5 text-[#4A90D9] fill-[#4A90D9]/10" />
                  <span className="text-[9px] font-headline text-[#4A90D9]">Froid</span>
                  <div className="w-1 h-1 bg-[#4A90D9] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Vitalité</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* SCIENCE SHEET MODAL */}
      {showScienceSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-md font-headline font-black text-[#4A90D9] uppercase tracking-wider">
                ❄️ Science de l'Hormèse par le Froid
              </h3>
              <button 
                onClick={() => setShowScienceSheet(false)}
                className="text-gray-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-headline">
              Le choc thermique du froid (douche écossaise ou bain glacé) agit comme un stresseur anabolique puissant qui réinitialise le système nerveux central :
            </p>

            <ul className="space-y-2 text-xs text-gray-400 font-headline list-disc pl-4">
              <li>
                <strong className="text-white">Pic Dopaminergique Long :</strong> Libère de la dopamine pendant plus de 3 heures de manière constante, sans descente brutale (contrairement aux stimulants artificiels).
              </li>
              <li>
                <strong className="text-white">Thermogénèse Non Shivering :</strong> Recrute et développe le tissu adipeux brun qui consomme des calories directement pour générer de la chaleur corporelle.
              </li>
              <li>
                <strong className="text-white">Maîtrise Corticale :</strong> Forcer son esprit à rester calme sous l'eau glacée entraîne le cortex préfrontal à réguler l'amygdale.
              </li>
            </ul>

            <AlphaButton 
              variant="primary" 
              className="w-full h-10" 
              onClick={() => setShowScienceSheet(false)}
            >
              Compris, Capitaine
            </AlphaButton>
          </div>
        </div>
      )}

    </div>
  );
};
