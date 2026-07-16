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
  Smile,
  Droplet,
  Clock,
  Sun,
  CloudSun,
  Brain,
  ChevronLeft,
  Settings,
  Code,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface SunProtocolScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const SunProtocolScreen: React.FC<SunProtocolScreenProps> = ({ addToast, onBack }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("Aujourd'hui");

  // Core Sun Parameters State
  const [sunScore, setSunScore] = useState<number>(92);
  const [personalBest, setPersonalBest] = useState<number>(95);
  const [sunDuration, setSunDuration] = useState<number>(18); // minutes exposed today
  const [targetDuration, setTargetDuration] = useState<number>(20); // target minutes
  const [trend, setTrend] = useState<number>(12);
  
  // Timer State (Live session)
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [timerElapsed, setTimerElapsed] = useState<number>(0); // in seconds
  const [timerTarget, setTimerTarget] = useState<number>(1200); // 20 min in seconds
  
  // Weather state
  const [weatherData, setWeatherData] = useState({
    city: "Casablanca",
    temperature: 24,
    uvIndex: 6,
    condition: "sunny" as "sunny" | "cloudy" | "partly_cloudy"
  });

  // Science bottom sheet & Info triggers
  const [showScienceSheet, setShowScienceSheet] = useState<boolean>(false);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Benefits percentage calculated based on duration
  const testosteroneBoost = Math.min(15, Math.round((sunDuration / targetDuration) * 15));
  const serotoninBoost = Math.min(22, Math.round((sunDuration / targetDuration) * 22));
  const vitaminDPercent = Math.min(100, Math.round((sunDuration / targetDuration) * 85));
  const circadianSyncPercent = Math.min(100, Math.round((sunDuration / targetDuration) * 100));

  // Weekly sun history
  const weeklyData = [
    { day: "Lun", minutes: 18, uvIndex: 6, score: 92 },
    { day: "Mar", minutes: 12, uvIndex: 4, score: 60 },
    { day: "Mer", minutes: 22, uvIndex: 7, score: 100 },
    { day: "Jeu", minutes: 15, uvIndex: 5, score: 75 },
    { day: "Ven", minutes: 8,  uvIndex: 3, score: 40 },
    { day: "Sam", minutes: 20, uvIndex: 6, score: 100 },
    { day: "Dim", minutes: 18, uvIndex: 6, score: 92 }
  ];

  // Live timer interval
  useEffect(() => {
    if (timerActive && !timerPaused) {
      timerRef.current = setInterval(() => {
        setTimerElapsed(prev => {
          const nextVal = prev + 1;
          // Synchronize to minutes
          if (nextVal % 60 === 0) {
            setSunDuration(curr => {
              const nextMin = curr + 1;
              // recalculate score based on total duration vs target
              const nextScore = Math.min(100, Math.round((nextMin / targetDuration) * 100));
              setSunScore(nextScore);
              return nextMin;
            });
          }
          // Cap at target seconds
          if (nextVal >= timerTarget) {
            handleStopTimer();
            addToast('success', "Protocole Solaire complété ! Ta production hormonale est au zénith. ☀️");
            return timerTarget;
          }
          return nextVal;
        });
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

  // Format timer display mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setTimerActive(true);
    setTimerPaused(false);
    addToast('info', "Démarrage du protocole de photorégulation... Expose-toi face à l'est. ☀️");
  };

  const handlePauseTimer = () => {
    setTimerPaused(true);
    addToast('warning', "Timer suspendu.");
  };

  const handleStopTimer = () => {
    setTimerActive(false);
    setTimerPaused(false);
    setTimerElapsed(0);
    addToast('success', `Session enregistrée : ${sunDuration} min d'exposition accumulés ! ⚡`);
  };

  const handleSetTimerDuration = (mins: number) => {
    setTimerTarget(mins * 60);
    addToast('info', `Durée cible réglée sur ${mins} minutes.`);
  };

  const handleDateChange = () => {
    const dates = ["Aujourd'hui", "Hier", "13 Juillet", "12 Juillet"];
    const currIdx = dates.indexOf(selectedDate);
    const nextIdx = (currIdx + 1) % dates.length;
    setSelectedDate(dates[nextIdx]);

    if (nextIdx === 1) { // Hier
      setSunScore(60);
      setSunDuration(12);
      setWeatherData({ city: "Casablanca", temperature: 22, uvIndex: 4, condition: "partly_cloudy" });
    } else if (nextIdx === 2) { // 13 Juillet
      setSunScore(100);
      setSunDuration(22);
      setWeatherData({ city: "Casablanca", temperature: 26, uvIndex: 7, condition: "sunny" });
    } else { // Reset
      setSunScore(92);
      setSunDuration(18);
      setWeatherData({ city: "Casablanca", temperature: 24, uvIndex: 6, condition: "sunny" });
    }
    addToast('info', `Historique d'ensoleillement chargé pour : ${dates[nextIdx]}`);
  };

  const getScoreLabelAndColor = (score: number) => {
    if (score >= 90) return { label: "PARFAIT", color: "text-[#00D9A5]", border: "border-[#00D9A5]" };
    if (score >= 80) return { label: "OPTIMAL", color: "text-[#FFD700]", border: "border-[#FFD700]" };
    if (score >= 70) return { label: "BIEN", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    if (score >= 60) return { label: "MOYEN", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    if (score >= 40) return { label: "INSUFFISANT", color: "text-[#FF2D55]", border: "border-[#FF2D55]" };
    return { label: "CRITIQUE", color: "text-[#FF2D55]", border: "border-[#FF2D55]" };
  };

  const scoreConfig = getScoreLabelAndColor(sunScore);

  // React Native Expo representation code matching the exact spec
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

export default function SunProtocolScreen({ route, navigation }) {
  const [sunScore, setSunScore] = useState(92);
  const [sunDuration, setSunDuration] = useState(18); // minutes
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0); // seconds
  const [timerTarget, setTimerTarget] = useState(1200); // 20 min

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Mon protocole Solaire ALPHA est à \${sunDuration} minutes d'exposition ce matin. Testostérone +15% ! ☀️\`
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
        <Text style={styles.headerTitle}>SOLEIL</Text>
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
        <View style={[styles.mainScoreCard, sunScore >= 80 ? styles.borderGold : styles.borderRed]}>
          <Text style={styles.scoreTitle}>EXPOSITION AUJOURD'HUI</Text>
          <Text style={styles.scoreText}>{sunScore}</Text>
          <Text style={styles.scoreLabel}>OPTIMAL</Text>
          <Text style={styles.durationLabel}>☀️ {sunDuration} min</Text>
          <Text style={styles.comparativeLabel}>Objectif : 20 min • Manque : 2 min</Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>↑ +12% vs hier</Text>
          </View>
        </View>

        {/* TIMER COCKPIT */}
        <Text style={styles.sectionTitle}>TIMER SOLEIL</Text>
        <View style={styles.timerCard}>
          <View style={styles.progressRing}>
            <Text style={styles.timerDigits}>18:00</Text>
            <Text style={styles.timerUnit}>min</Text>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}>
              <Feather name="play" size={16} color="#0F0F1A" />
              <Text style={styles.primaryBtnText}>DÉMARRER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justify: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#FFD700', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  mainScoreCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, alignItems: 'center', borderWidth: 2 },
  borderGold: { borderColor: '#FFD700' },
  borderRed: { borderColor: '#FF2D55' },
  scoreTitle: { fontSize: 12, color: '#8E8E93', letterSpacing: 3, fontWeight: '600' },
  scoreText: { fontSize: 72, fontWeight: 'bold', color: '#FFD700' },
  scoreLabel: { fontSize: 16, color: '#FFD700', fontWeight: 'bold', marginTop: 8 },
  durationLabel: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold', marginTop: 12 },
  comparativeLabel: { fontSize: 13, color: '#8E8E93', marginTop: 8 },
  trendBadge: { backgroundColor: 'rgba(0, 217, 165, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
  trendText: { color: '#00D9A5', fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginLeft: 16, marginVertical: 12 },
  timerCard: { backgroundColor: '#16213E', borderRadius: 24, padding: 32, marginHorizontal: 16, alignItems: 'center' },
  progressRing: { width: 180, height: 180, borderRadius: 90, borderWidth: 12, borderColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  timerDigits: { fontSize: 36, fontWeight: 'bold', color: '#FFD700', fontFamily: 'monospace' },
  timerUnit: { fontSize: 12, color: '#8E8E93' },
  controlsRow: { flexDirection: 'row', gap: 16, marginTop: 24 },
  primaryBtn: { backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#0F0F1A', fontWeight: 'bold', marginLeft: 8 }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Pilier Vitalité #2 — SunProtocol (3.2)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Protocole Photorégulation Solaire — SunProtocolScreen
          </h2>
          <p className="text-xs text-gray-400">
            Maximise la testostérone libre, synchronise l'horloge interne et déclenche le pic de sérotonine matinal.
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
              <h4 className="text-xs font-headline font-black text-white">SunProtocolScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Suivi d'ensoleillement de Casablanca, Casablanca index UV précis, contrôle de timer et gestion des phases de vitamines.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                navigator.clipboard.writeText(expoNativeCode);
                setCopied(true);
                addToast('success', "Code source copié !");
                setTimeout(() => setCopied(false), 2000);
              }}
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

      {/* DOUBLE COMPONENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: MODULATEURS & PRESETS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cockpit Météo & UV
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Simulez la météo et la luminosité pour adapter l'objectif d'exposition.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Durée slide d'exposition */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Durée d'Ensoleillement</span>
                <span className="text-[#FFD700] font-bold">{sunDuration} min</span>
              </div>
              <input 
                type="range" min="0" max="60" value={sunDuration} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSunDuration(val);
                  setSunScore(Math.min(100, Math.round((val / targetDuration) * 100)));
                }}
                className="w-full accent-[#FFD700] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Target Duration Option */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-headline uppercase tracking-wider block">Objectif Solaire Cible</label>
              <select 
                value={targetDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTargetDuration(val);
                  setSunScore(Math.min(100, Math.round((sunDuration / val) * 100)));
                }}
                className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-xs text-white"
              >
                <option value="10">10 min (Plein ciel d'été / Index UV &gt; 8)</option>
                <option value="20">20 min (Printemps / Index UV 4-7 - Standard)</option>
                <option value="30">30 min (Voilé / Hiver / Index UV 2-3)</option>
                <option value="45">45 min (Nuageux complet / Index UV &lt; 2)</option>
              </select>
            </div>

            {/* UV Index & Location Simulator */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-headline uppercase block">Index UV</label>
                <input 
                  type="number" min="1" max="12" 
                  value={weatherData.uvIndex} 
                  onChange={(e) => {
                    const uv = parseInt(e.target.value) || 1;
                    setWeatherData(prev => ({ ...prev, uvIndex: uv }));
                  }}
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-headline uppercase block">Température (°C)</label>
                <input 
                  type="number" 
                  value={weatherData.temperature} 
                  onChange={(e) => {
                    const temp = parseInt(e.target.value) || 0;
                    setWeatherData(prev => ({ ...prev, temperature: temp }));
                  }}
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setWeatherData({ city: "Casablanca", temperature: 31, uvIndex: 9, condition: "sunny" });
                  setTargetDuration(10);
                  setSunScore(100);
                  setSunDuration(11);
                  addToast('success', "Simulé : Grand soleil d'été (Index UV 9) ! Objectif réduit à 10 min. ☀️");
                }}
                className="w-full py-1.5 px-3 bg-[#FFD700]/10 border border-[#FFD700]/25 hover:bg-[#FFD700]/20 text-[#FFD700] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Grand Soleil (UV 9)
              </button>
              <button 
                onClick={() => {
                  setWeatherData({ city: "Casablanca", temperature: 16, uvIndex: 2, condition: "cloudy" });
                  setTargetDuration(30);
                  setSunScore(40);
                  setSunDuration(12);
                  addToast('warning', "Simulé : Temps voilé / Hiver (Index UV 2) ! Objectif augmenté à 30 min. ☁️");
                }}
                className="w-full py-1.5 px-3 bg-[#4A90D9]/10 border border-[#4A90D9]/25 hover:bg-[#4A90D9]/20 text-[#4A90D9] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Temps Couvert (UV 2)
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW SIMULATOR */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Dynamic Island Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN INNER CONTAINER */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* STATUS BAR */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>08:15</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#FFD700] rounded-3xs" />
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
                <h1 className="text-md font-headline font-black tracking-widest text-[#FFD700] uppercase">
                  Soleil
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

              {/* DYNAMIC SCROLL VIEWER */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* DATE SELECT BAR */}
                <div className="flex justify-between items-center bg-[#16213E]/40 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-headline">
                  <span className="text-gray-400">Période d'exposition</span>
                  <button 
                    onClick={handleDateChange}
                    className="text-[#FFD700] font-black hover:underline cursor-pointer"
                  >
                    {selectedDate} • Modifier ↻
                  </button>
                </div>

                {/* SECTION 1: SCORE SOLEIL DU JOUR (CARD PRINCIPALE) */}
                <div className={`bg-[#16213E] rounded-[24px] p-6 text-center border-2 ${scoreConfig.border} shadow-2xl relative overflow-hidden transition-all duration-300`}>
                  
                  {/* Neon radial glow */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Absolute Best Score Trophy */}
                  {sunDuration > 19 && (
                    <div className="absolute top-4 right-4 bg-[#FFD700] rounded px-2 py-0.5 animate-pulse">
                      <span className="text-[9px] font-headline font-black text-[#0F0F1A]">🏆 RECORD</span>
                    </div>
                  )}

                  <span className="text-[10px] font-headline font-black text-[#8E8E93] tracking-[3px] block">
                    EXPOSITION AUJOURD'HUI
                  </span>

                  {/* Main score digits */}
                  <div className="my-4 block relative">
                    <span className="text-6xl font-mono font-black text-[#FFD700] tracking-tighter drop-shadow-[0_0_20px_rgba(255,215,0,0.3)] block">
                      {sunScore}
                    </span>
                  </div>

                  <span className={`text-sm font-headline font-black tracking-widest block uppercase ${scoreConfig.color}`}>
                    {scoreConfig.label}
                  </span>

                  {/* Exposed duration */}
                  <div className="flex items-center justify-center gap-1.5 text-md font-mono font-black text-white mt-3">
                    <Sun className="w-5 h-5 text-[#FFD700]" />
                    <span>{sunDuration} min</span>
                  </div>

                  {/* Comparative text label */}
                  <p className="text-xs text-gray-400 font-headline mt-1.5">
                    Objectif : {targetDuration} min • Manque : {sunDuration < targetDuration ? `${targetDuration - sunDuration} min` : "0 min"}
                  </p>

                  {/* Trend badge */}
                  <div className="mt-4 inline-flex bg-[#00D9A5]/10 border border-[#00D9A5]/25 text-[#00D9A5] rounded-xl py-1 px-4 text-xs font-bold">
                    <span>↑ +{trend}% vs hier</span>
                  </div>
                </div>

                {/* SECTION 2: TIMER SOLEIL EN DIRECT */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Timer Soleil
                  </h3>

                  <div className="bg-[#16213E] rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center">
                    
                    {/* Circle circular progress ring representation */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="3" />
                        <circle 
                          cx="18" cy="18" r="15.915" fill="none" stroke="#FFD700" strokeWidth="3" 
                          strokeDasharray={`${Math.min(100, Math.round((sunDuration / targetDuration) * 100))} 100`} 
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Digits inside center */}
                      <div className="absolute text-center">
                        <span className="text-3xl font-mono font-black text-[#FFD700] tracking-tighter block leading-none">
                          {timerActive ? formatTime(timerElapsed) : `${sunDuration}:00`}
                        </span>
                        <span className="text-[10px] text-gray-500 font-headline uppercase font-bold mt-1 block">min</span>
                      </div>
                    </div>

                    {/* Controls buttons row */}
                    <div className="flex gap-4 mt-6 w-full">
                      {!timerActive ? (
                        <button 
                          onClick={handleStartTimer}
                          className="flex-1 h-11 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Play className="w-4 h-4 fill-[#0F0F1A]" />
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

                    {/* Target duration selector chips */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-5 border-t border-white/5 pt-4">
                      {[5, 10, 15, 20, 30].map((m) => (
                        <button 
                          key={m}
                          onClick={() => handleSetTimerDuration(m)}
                          className={`py-1 px-3 rounded-full text-[10px] font-headline font-bold border transition-all cursor-pointer
                            ${timerTarget === m * 60 
                              ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                              : 'border-white/10 text-gray-400 hover:border-gray-500'
                            }
                          `}
                        >
                          {m} min
                        </button>
                      ))}
                    </div>

                    {/* Weather forecast cockpit bar */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-headline">
                      <CloudSun className="w-4 h-4 text-[#8E8E93]" />
                      <span>{weatherData.city} • {weatherData.temperature}°C • Index UV <strong>{weatherData.uvIndex}</strong></span>
                    </div>

                  </div>
                </div>

                {/* SECTION 3: BENEFICES & VITAMINE D (2x2 GRID) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Bénéfices Activés
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Benefit 1: Testosterone */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#00D9A5] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">TESTOSTÉRONE</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">+{testosteroneBoost}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">PRODUCTION</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#00D9A5]" style={{ width: `${(testosteroneBoost / 15) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-tight">Pic matinal stimulé</span>
                    </div>

                    {/* Benefit 2: Serotonin */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#FFD700] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">SÉROTONINE</span>
                        <span className="text-xs font-mono font-black text-[#FFD700]">+{serotoninBoost}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">HUMEUR</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#FFD700]" style={{ width: `${(serotoninBoost / 22) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-tight">Humeur & Énergie</span>
                    </div>

                    {/* Benefit 3: Vitamin D */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#4A90D9] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">VITAMINE D</span>
                        <span className="text-xs font-mono font-black text-[#4A90D9]">{vitaminDPercent}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">OBJECTIF</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#4A90D9]" style={{ width: `${vitaminDPercent}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-tight">Synthèse cutanée</span>
                    </div>

                    {/* Benefit 4: Circadian sync */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#00D9A5] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">CIRCADIEN</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">{circadianSyncPercent >= 100 ? 'SYNC' : `${circadianSyncPercent}%`}</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">BIOLOGIQUE</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#00D9A5]" style={{ width: `${circadianSyncPercent}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline leading-tight">Horloge interne synchronisée</span>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: GRAPHIQUE 7 JOURS */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    7 Derniers Jours
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 shadow-lg border border-white/5 space-y-4">
                    
                    {/* SVG column chart */}
                    <div className="h-32 w-full relative flex items-end justify-between px-2 pt-6">
                      
                      {/* y=20 target line */}
                      <div className="absolute left-0 right-0 border-t border-dashed border-[#00D9A5]/40" style={{ bottom: '40%' }}>
                        <span className="absolute -top-3 right-0 text-[8px] text-[#00D9A5] font-mono font-bold bg-[#16213E] px-1">Cible 20 min</span>
                      </div>

                      {weeklyData.map((d, i) => {
                        const h = `${Math.min(100, Math.round((d.minutes / 30) * 100))}%`;
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                            <div className="h-24 w-full flex items-end justify-center relative">
                              <div 
                                className="w-6 bg-[#FFD700] rounded-t-sm transition-all group-hover:brightness-110 relative"
                                style={{ height: h }}
                              >
                                {/* Tooltip hover helper */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#0F0F1A] border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-mono text-white whitespace-nowrap z-20">
                                  {d.minutes} min
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] text-gray-500 font-headline mt-2">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 text-xs font-headline">
                      <span className="text-gray-400">Moyenne : <strong className="text-white">16 min</strong></span>
                      <span className="text-[#00D9A5] font-black">📈 En hausse cette semaine</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: CONSEIL SCIENTIFIQUE */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2">
                  <div className="flex gap-3 items-start">
                    <Sun className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 10-30 min de soleil matinal (sans lunettes) suppriment la mélatonine résiduelle et déclenchent un pic de cortisol + sérotonine. Résultat : énergie, humeur, et testostérone naturelle.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Huberman Lab, 2022
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

              {/* SIMULATED BOTTOM TAB BAR */}
              <div className="h-16 border-t border-gray-950 bg-[#16213E] flex items-center justify-around px-4 z-10 select-none">
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#FFD700] cursor-pointer">
                  <Sun className="w-5 h-5 text-[#FFD700] fill-[#FFD700]/10" />
                  <span className="text-[9px] font-headline text-[#FFD700]">Soleil</span>
                  <div className="w-1 h-1 bg-[#FFD700] rounded-full mt-0.5" />
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

      {/* SCIENCE SHEET MODAL ON SCREEN */}
      {showScienceSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-md font-headline font-black text-[#FFD700] uppercase tracking-wider">
                🔬 Science de la Photorégulation
              </h3>
              <button 
                onClick={() => setShowScienceSheet(false)}
                className="text-gray-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-headline">
              L'exposition rétinienne à la lumière du soleil matinal (sans lunettes de soleil) déclenche immédiatement une cascade neuronale d'optimisation biologique :
            </p>

            <ul className="space-y-2 text-xs text-gray-400 font-headline list-disc pl-4">
              <li>
                <strong className="text-white">Inhibition de la Mélatonine :</strong> Supprime l'hormone du sommeil résiduelle pour éliminer le brouillard mental du matin.
              </li>
              <li>
                <strong className="text-white">Pic Circadien de Cortisol :</strong> Synchronise l'horloge interne pour garantir un endormissement facile exactement 16h plus tard.
              </li>
              <li>
                <strong className="text-white">Synthèse de Testostérone :</strong> Les rayons UV stimulent la production via l'axe hypothalamo-hypophysaire.
              </li>
            </ul>

            <AlphaButton 
              variant="gold" 
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
