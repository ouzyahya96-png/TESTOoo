import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Share2,
  Calendar,
  Trophy,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Moon,
  Sun,
  Apple,
  Snowflake,
  Wind,
  Brain,
  Lightbulb,
  AlertCircle,
  Eye,
  Info,
  Play,
  Check,
  Sunset,
  Sunrise,
  Bell,
  ChevronLeft,
  Settings,
  Code,
  Copy,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface SleepTrackerScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const SleepTrackerScreen: React.FC<SleepTrackerScreenProps> = ({ addToast, onBack }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("Aujourd'hui");

  // Core Sleep Parameters State
  const [sleepScore, setSleepScore] = useState<number>(85);
  const [personalBest, setPersonalBest] = useState<number>(91);
  const [sleepDuration, setSleepDuration] = useState<string>("7h 42m");
  const [sleepDurationMinutes, setSleepDurationMinutes] = useState<number>(462);
  const [targetDuration] = useState<number>(480); // 8h
  const [bedTime, setBedTime] = useState<string>("23:00");
  const [wakeUpTime, setWakeUpTime] = useState<string>("06:30");
  const [sleepLatency, setSleepLatency] = useState<string>("14 min");
  const [numAwakenings, setNumAwakenings] = useState<number>(2);
  const [circadianCycle, setCircadianCycle] = useState<number>(75);
  const [numCycles, setNumCycles] = useState<number>(5);

  // Bottom sheets & Interactive Picker
  const [showScienceSheet, setShowScienceSheet] = useState<boolean>(false);
  const [showAlarmPicker, setShowAlarmPicker] = useState<boolean>(false);
  const [tempAlarmTime, setTempAlarmTime] = useState<string>("06:30");

  // 5-Stage Wind Down Protocol Checklist
  const [windDownTasks, setWindDownTasks] = useState([
    { id: 'wd-1', title: "Lumière tamisée (mode app sombre)", time: "21:00", completed: true },
    { id: 'wd-2', title: "Stop écrans 1h avant (blue light)", time: "21:30", completed: true },
    { id: 'wd-3', title: "Respiration 4-7-8 (5 min)", time: "21:45", completed: true },
    { id: 'wd-4', title: "Magnésium + Mélatonine (si prescrit)", time: "21:50", completed: false },
    { id: 'wd-5', title: "Lecture papier (pas d'écran)", time: "21:55", completed: false }
  ]);

  // Hypnogram segments representation for timeline visualization
  // Total duration: 7h 42m (462 minutes)
  const hypnogramData = [
    { stage: 'awake' as const, startTime: "23:00", duration: 14, color: "#FF2D55", label: "Éveillé" },
    { stage: 'light' as const, startTime: "23:14", duration: 60, color: "#4A90D9", label: "Léger" },
    { stage: 'deep' as const, startTime: "00:14", duration: 50, color: "#00D9A5", label: "Profond" },
    { stage: 'rem' as const, startTime: "01:04", duration: 30, color: "#FFD700", label: "REM" },
    { stage: 'light' as const, startTime: "01:34", duration: 80, color: "#4A90D9", label: "Léger" },
    { stage: 'deep' as const, startTime: "02:54", duration: 34, color: "#00D9A5", label: "Profond" },
    { stage: 'rem' as const, startTime: "03:28", duration: 42, color: "#FFD700", label: "REM" },
    { stage: 'light' as const, startTime: "04:10", duration: 110, color: "#4A90D9", label: "Léger" },
    { stage: 'rem' as const, startTime: "06:00", duration: 30, color: "#FFD700", label: "REM" },
    { stage: 'awake' as const, startTime: "06:30", duration: 12, color: "#FF2D55", label: "Éveillé" }
  ];

  // Calculated phases statistics based on state inputs or default breakdown
  const sleepPhases = {
    deep: { duration: "1h 24m", percentage: 18, target: 20, color: "#00D9A5", label: "PROFOND" },
    rem: { duration: "1h 42m", percentage: 22, target: 25, color: "#FFD700", label: "REM" },
    light: { duration: "4h 36m", percentage: 60, target: 55, color: "#4A90D9", label: "LÉGER" },
    awake: { duration: "42 min", percentage: 9, target: 10, color: "#FF2D55", label: "ÉVEILLÉ" }
  };

  // Weekly data
  const weeklyData = [
    { day: "Lun", score: 85, duration: "7h 42m" },
    { day: "Mar", score: 68, duration: "6h 15m" },
    { day: "Mer", score: 72, duration: "6h 50m" },
    { day: "Jeu", score: 55, duration: "5h 10m" },
    { day: "Ven", score: 90, duration: "8h 15m" },
    { day: "Sam", score: 78, duration: "7h 10m" },
    { day: "Dim", score: 82, duration: "7h 35m" }
  ];

  const getScoreLabelAndColor = (score: number) => {
    if (score >= 90) return { label: "PARFAIT", color: "text-[#00D9A5]", border: "border-[#00D9A5]" };
    if (score >= 80) return { label: "EXCELLENT", color: "text-[#4A90D9]", border: "border-[#4A90D9]" };
    if (score >= 70) return { label: "BIEN", color: "text-[#FFD700]", border: "border-[#FFD700]" };
    if (score >= 60) return { label: "MOYEN", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    if (score >= 40) return { label: "INSUFFISANT", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    return { label: "CRITIQUE", color: "text-[#FF2D55]", border: "border-[#FF2D55]" };
  };

  const scoreConfig = getScoreLabelAndColor(sleepScore);

  // Toggle protocol checkbox state
  const handleToggleTask = (id: string) => {
    setWindDownTasks(prev => 
      prev.map(task => {
        if (task.id === id) {
          const updated = { ...task, completed: !task.completed };
          if (updated.completed) {
            addToast('success', `Rituel validé : ${task.title} ⚡`);
          }
          return updated;
        }
        return task;
      })
    );
  };

  // Save alarm setting
  const handleSaveAlarm = () => {
    setWakeUpTime(tempAlarmTime);
    setShowAlarmPicker(false);
    addToast('success', `Alarme configurée à ${tempAlarmTime} ! Synchronisation circadienne OK. ⏰`);
  };

  // Share functionality
  const handleShare = () => {
    const summaryText = `Optimisation Sommeil ALPHA : Score ${sleepScore}/100 (${sleepDuration}, ${numCycles} cycles complétés). Testostérone régénérée ! ⚡`;
    if (navigator.share) {
      navigator.share({
        title: 'ALPHA MAN - Sommeil',
        text: summaryText,
        url: window.location.href
      }).then(() => {
        addToast('success', "Score partagé avec succès !");
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(summaryText);
      addToast('success', "Résumé copié dans le presse-papier ! 📋");
    }
  };

  // Date switching simulation
  const handleDateChange = () => {
    const dates = ["Aujourd'hui", "Hier", "13 Juillet", "12 Juillet"];
    const currIdx = dates.indexOf(selectedDate);
    const nextIdx = (currIdx + 1) % dates.length;
    setSelectedDate(dates[nextIdx]);

    if (nextIdx === 1) { // Hier
      setSleepScore(64);
      setSleepDuration("6h 12m");
      setBedTime("01:10");
      setWakeUpTime("07:22");
      setSleepLatency("24 min");
      setNumAwakenings(4);
      setCircadianCycle(55);
      setNumCycles(4);
    } else if (nextIdx === 2) { // 13 Juillet
      setSleepScore(91);
      setSleepDuration("8h 20m");
      setBedTime("22:45");
      setWakeUpTime("07:05");
      setSleepLatency("8 min");
      setNumAwakenings(1);
      setCircadianCycle(90);
      setNumCycles(6);
    } else { // Reset
      setSleepScore(85);
      setSleepDuration("7h 42m");
      setBedTime("23:00");
      setWakeUpTime("06:30");
      setSleepLatency("14 min");
      setNumAwakenings(2);
      setCircadianCycle(75);
      setNumCycles(5);
    }
    addToast('info', `Données métriques chargées pour le ${dates[nextIdx]}`);
  };

  // Completed items count in checklist
  const completedStagesCount = windDownTasks.filter(t => t.completed).length;

  // React Native Expo representation code according to the exact spec
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Dimensions, 
  Animated, 
  Share 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function SleepTrackerScreen({ route, navigation }) {
  const [sleepScore, setSleepScore] = useState(85);
  const [sleepDuration, setSleepDuration] = useState('7h 42m');
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeUpTime, setWakeUpTime] = useState('06:30');

  // Animation Refs
  const countUpValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(countUpValue, {
        toValue: 85,
        duration: 1200,
        useNativeDriver: false
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Mon score de sommeil ALPHA est de \${sleepScore}/100 (\${sleepDuration}). Testostérone rechargée ! ⚡\`
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
        <Text style={styles.headerTitle}>SOMMEIL</Text>
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
        <View style={[styles.mainScoreCard, sleepScore >= 80 ? styles.borderBlue : styles.borderRed]}>
          <Text style={styles.scoreTitle}>SCORE DE CETTE NUIT</Text>
          <Text style={styles.scoreText}>{sleepScore}</Text>
          <Text style={styles.scoreLabel}>EXCELLENT</Text>
          <Text style={styles.durationLabel}>🌙 {sleepDuration}</Text>
          <Text style={styles.comparativeLabel}>Objectif : 8h • Manque : 18 min</Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>↑ +12% vs hier</Text>
          </View>
        </View>
        
        {/* HYPNOGRAMME & 4 CARDS STAGES PLANNED HERE */}
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
  comparativeLabel: { fontSize: 13, color: '#8E8E93', marginTop: 8 },
  trendBadge: { backgroundColor: 'rgba(0, 217, 165, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
  trendText: { color: '#00D9A5', fontSize: 14, fontWeight: '500' }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS & CONTROLLER HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#4A90D9] uppercase tracking-widest bg-[#4A90D9]/10 border border-[#4A90D9]/20 px-2 rounded-md">
            Pilier Vitalité #1 — SleepTracker (3.1)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Suivi Clinique du Sommeil Alpha — SleepTrackerScreen
          </h2>
          <p className="text-xs text-gray-400">
            Intègre les phases d'ondes lentes, l'hypnogramme interactif, le cycle circadien et le wind-down protocol.
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

      {/* CODE SOURCE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">SleepTrackerScreen.tsx (TypeScript Expo Native)</h4>
              <p className="text-[10px] text-gray-500">
                Structure de code conforme aux contraintes React Native, avec gestes haptiques et notifications.
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

      {/* WORKSPACE GRAPHIC ROW Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: SIMULATION PRESETS CONTROLLERS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Biométries de la Nuit
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Simulez différentes nuits et observez la régulation du sommeil profond et de la latence.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Score slide control */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Score Sommeil</span>
                <span className="text-[#4A90D9] font-bold">{sleepScore}%</span>
              </div>
              <input 
                type="range" min="10" max="100" value={sleepScore} 
                onChange={(e) => setSleepScore(parseInt(e.target.value))}
                className="w-full accent-[#4A90D9] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Durée sleep option */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-headline uppercase tracking-wider block">Durée de Sommeil</label>
              <select 
                value={sleepDuration} 
                onChange={(e) => {
                  setSleepDuration(e.target.value);
                  if (e.target.value === "4h 15m") {
                    setSleepDurationMinutes(255);
                    setNumCycles(3);
                    setCircadianCycle(45);
                  } else if (e.target.value === "6h 12m") {
                    setSleepDurationMinutes(372);
                    setNumCycles(4);
                    setCircadianCycle(60);
                  } else {
                    setSleepDurationMinutes(462);
                    setNumCycles(5);
                    setCircadianCycle(75);
                  }
                }}
                className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-xs text-white"
              >
                <option value="4h 15m">4h 15m (Critique - Risque Testostérone ⚠️)</option>
                <option value="6h 12m">6h 12m (Moyen 📉)</option>
                <option value="7h 42m">7h 42m (Optimal 👍)</option>
                <option value="8h 30m">8h 30m (Elite 👑)</option>
              </select>
            </div>

            {/* Latence, réveils */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-headline uppercase block">Latence</label>
                <input 
                  type="text" value={sleepLatency} onChange={(e) => setSleepLatency(e.target.value)}
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-headline uppercase block">Réveils nocturnes</label>
                <input 
                  type="number" value={numAwakenings} onChange={(e) => setNumAwakenings(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setSleepScore(94);
                  setSleepDuration("8h 30m");
                  setSleepDurationMinutes(510);
                  setBedTime("22:30");
                  setWakeUpTime("07:00");
                  setSleepLatency("8 min");
                  setNumAwakenings(0);
                  setCircadianCycle(95);
                  setNumCycles(6);
                  addToast('success', "Nuit d'élite simulée ! Hormones optimales. 👑");
                }}
                className="w-full py-1.5 px-3 bg-[#00D9A5]/10 border border-[#00D9A5]/25 hover:bg-[#00D9A5]/20 text-[#00D9A5] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Récupération Elite (94%)
              </button>
              <button 
                onClick={() => {
                  setSleepScore(35);
                  setSleepDuration("4h 15m");
                  setSleepDurationMinutes(255);
                  setBedTime("02:15");
                  setWakeUpTime("06:30");
                  setSleepLatency("42 min");
                  setNumAwakenings(5);
                  setCircadianCycle(35);
                  setNumCycles(2);
                  addToast('error', "Simulé fatigue sévère (-30% testostérone 🩸)");
                }}
                className="w-full py-1.5 px-3 bg-[#FF2D55]/10 border border-[#FF2D55]/25 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Fatigue Sévère (35%)
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW SIMULATOR */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker & Dynamic island notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN INNER CONTAINER */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* STATUS BAR */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#4A90D9] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER CONTAINER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-950 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-md font-headline font-black tracking-widest text-[#4A90D9] uppercase">
                  Sommeil
                </h1>
                <div className="flex items-center gap-0.5">
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
                
                {/* DATE SELECTOR BAR */}
                <div className="flex justify-between items-center bg-[#16213E]/40 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-headline">
                  <span className="text-gray-400">Date d'analyse</span>
                  <button 
                    onClick={handleDateChange}
                    className="text-[#4A90D9] font-black hover:underline cursor-pointer"
                  >
                    {selectedDate} • Modifier ↻
                  </button>
                </div>

                {/* SECTION 1: SCORE SOMMEIL DU JOUR (CARD PRINCIPALE) */}
                <div className={`bg-[#16213E] rounded-[24px] p-6 text-center border-2 ${scoreConfig.border} shadow-2xl relative overflow-hidden transition-all duration-300`}>
                  
                  {/* Absolute positioning Record Badge */}
                  {sleepScore > personalBest && (
                    <div className="absolute top-4 right-4 bg-[#FFD700] rounded px-2 py-0.5 animate-pulse">
                      <span className="text-[9px] font-headline font-black text-[#0F0F1A]">🏆 RECORD</span>
                    </div>
                  )}

                  <span className="text-[10px] font-headline font-black text-[#8E8E93] tracking-[3px] block">
                    SCORE DE CETTE NUIT
                  </span>

                  {/* Main digital score display with neon glow */}
                  <div className="my-4 block relative">
                    <span className="text-6xl font-mono font-black text-[#4A90D9] tracking-tighter drop-shadow-[0_0_20px_rgba(74,144,217,0.3)] block">
                      {sleepScore}
                    </span>
                  </div>

                  <span className={`text-sm font-headline font-black tracking-widest block uppercase ${scoreConfig.color}`}>
                    {scoreConfig.label}
                  </span>

                  {/* Real-time Sleep Duration info */}
                  <div className="flex items-center justify-center gap-1.5 text-md font-mono font-black text-white mt-3">
                    <Moon className="w-5 h-5 text-[#4A90D9]" />
                    <span>{sleepDuration}</span>
                  </div>

                  {/* Objective comparison label */}
                  <p className="text-xs text-gray-400 font-headline mt-1.5">
                    Objectif : 8h • Manque : {sleepDurationMinutes < targetDuration ? `${targetDuration - sleepDurationMinutes} min` : "0 min"}
                  </p>

                  {/* Trend Badge */}
                  <div className="mt-4 inline-flex bg-[#00D9A5]/10 border border-[#00D9A5]/25 text-[#00D9A5] rounded-xl py-1 px-4 text-xs font-bold">
                    <span>↑ +12% vs hier</span>
                  </div>
                </div>

                {/* SECTION 2: TIMELINE DE LA NUIT (HYPNOGRAMME) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Ta Nuit
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 border border-white/5 space-y-4">
                    
                    {/* Horizontal stacked timeline block */}
                    <div className="space-y-1">
                      <div className="w-full h-11 bg-[#1A1A2E] rounded-lg overflow-hidden flex relative">
                        {hypnogramData.map((seg, idx) => {
                          const percentage = (seg.duration / 462) * 100;
                          return (
                            <div 
                              key={idx}
                              className="h-full relative transition-all group cursor-pointer"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: seg.color 
                              }}
                              title={`${seg.label} : ${seg.duration} min`}
                            >
                              {/* Hover Tooltip line detail */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#0F0F1A] border border-white/10 rounded px-2 py-0.5 text-[8px] font-mono text-white whitespace-nowrap z-30">
                                {seg.label}: {seg.duration} min
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Time indicators beneath timeline */}
                      <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                        <span>23:00</span>
                        <span>01:00</span>
                        <span>03:00</span>
                        <span>05:00</span>
                        <span>07:00</span>
                      </div>
                    </div>

                    {/* Timeline Interactive Legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 bg-[#FF2D55] rounded-xs" />
                        <span className="text-[10px] text-gray-400 font-headline">Éveillé</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 bg-[#FFD700] rounded-xs" />
                        <span className="text-[10px] text-gray-400 font-headline">REM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 bg-[#4A90D9] rounded-xs" />
                        <span className="text-[10px] text-gray-400 font-headline">Léger</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 bg-[#00D9A5] rounded-xs" />
                        <span className="text-[10px] text-gray-400 font-headline">Profond</span>
                      </div>
                    </div>

                    {/* Detailed sleep metric numbers */}
                    <div className="grid grid-cols-5 gap-1 border-t border-white/5 pt-3 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-headline block leading-none">Endorm.</span>
                        <span className="text-xs font-mono font-black text-white">{sleepLatency}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-headline block leading-none">Réveils</span>
                        <span className="text-xs font-mono font-black text-white">{numAwakenings}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-headline block leading-none">Efficacité</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">94%</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-headline block leading-none">Score REM</span>
                        <span className="text-xs font-mono font-black text-[#FFD700]">22%</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-headline block leading-none">Profond</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">18%</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SECTION 3: DÉTAILS DES PHASES (4 CARDS GRID) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Détails des Phases
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Phase 1: Deep sleep */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#00D9A5] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">{sleepPhases.deep.label}</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">{sleepPhases.deep.percentage}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">{sleepPhases.deep.duration}</span>
                        {/* Progress slider bar */}
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#00D9A5]" style={{ width: `${sleepPhases.deep.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline">Objectif : {sleepPhases.deep.target}%</span>
                    </div>

                    {/* Phase 2: REM sleep */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#FFD700] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">{sleepPhases.rem.label}</span>
                        <span className="text-xs font-mono font-black text-[#FFD700]">{sleepPhases.rem.percentage}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">{sleepPhases.rem.duration}</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#FFD700]" style={{ width: `${sleepPhases.rem.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline">Objectif : {sleepPhases.rem.target}%</span>
                    </div>

                    {/* Phase 3: Light sleep */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#4A90D9] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">{sleepPhases.light.label}</span>
                        <span className="text-xs font-mono font-black text-[#4A90D9]">{sleepPhases.light.percentage}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">{sleepPhases.light.duration}</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#4A90D9]" style={{ width: `${sleepPhases.light.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline">Objectif : {sleepPhases.light.target}%</span>
                    </div>

                    {/* Phase 4: Awake */}
                    <div className="bg-[#16213E] rounded-2xl p-3.5 border-t-3 border-[#FF2D55] flex flex-col justify-between h-[120px] text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-headline font-black text-white">{sleepPhases.awake.label}</span>
                        <span className="text-xs font-mono font-black text-[#FF2D55]">{sleepPhases.awake.percentage}%</span>
                      </div>
                      <div>
                        <span className="text-lg font-mono font-black text-white block mt-1">{sleepPhases.awake.duration}</span>
                        <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#FF2D55]" style={{ width: `${sleepPhases.awake.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-headline">Objectif : &lt;{sleepPhases.awake.target}%</span>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: WIND-DOWN PROTOCOL (PROTOCOLE COUCHER) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Protocole Coucher
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 shadow-lg border-l-4 border-[#4A90D9] space-y-4">
                    
                    {/* Title header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sunset className="w-5 h-5 text-[#FFD700]" />
                        <h4 className="text-sm font-headline font-black text-white">Ton rituel du soir</h4>
                      </div>
                      <span className="text-xs font-mono font-black text-[#FFD700]">22:00</span>
                    </div>

                    {/* Interactive checklist */}
                    <div className="space-y-1">
                      {windDownTasks.map((task) => (
                        <div 
                          key={task.id}
                          onClick={() => handleToggleTask(task.id)}
                          className="flex items-center justify-between py-2 border-b border-[#1A1A2E] last:border-0 cursor-pointer hover:bg-white/2 px-1 transition-colors rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {/* Round Checkbox container */}
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${task.completed ? 'bg-[#00D9A5] border-[#00D9A5]' : 'border-gray-500 bg-transparent'}`}>
                              {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-xs font-headline ${task.completed ? 'text-[#8E8E93] line-through' : 'text-white font-medium'}`}>
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">{task.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* ProgressBar & Progression text */}
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-[11px] text-[#8E8E93] font-headline">
                        <span>{completedStagesCount}/5 étapes complétées</span>
                        <span className="font-bold text-[#FFD700]">{Math.round((completedStagesCount / 5) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#FFD700] rounded-full transition-all duration-500" 
                          style={{ width: `${(completedStagesCount / 5) * 100}%` }} 
                        />
                      </div>
                    </div>

                    {/* Modifier Button */}
                    <button 
                      onClick={() => addToast('info', "Ouverture de la configuration du rituel de sommeil...")}
                      className="w-full mt-2 h-10 border border-[#4A90D9]/40 hover:bg-[#4A90D9]/10 active:scale-98 text-[#4A90D9] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
                    >
                      MODIFIER LE PROTOCOLE
                    </button>
                  </div>
                </div>

                {/* SECTION 5: RÉVEIL & CIRCADIEN */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Réveil Optimal
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 shadow-lg border-l-4 border-[#FFD700] space-y-4">
                    
                    <div className="flex justify-between items-center">
                      {/* Left: Schedule details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Sunrise className="w-4 h-4 text-[#FFD700]" />
                          <span className="text-[10px] font-headline font-black text-gray-400 uppercase tracking-wider">Réveil programmé</span>
                        </div>
                        <span className="text-3xl font-mono font-black text-[#FFD700] leading-none block">{wakeUpTime}</span>
                        <span className="text-[10px] font-headline font-bold text-[#00D9A5] block">Phase REM terminée</span>
                      </div>

                      {/* Right: Circle chart indicator */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="3" />
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" stroke="#FFD700" strokeWidth="3" 
                            strokeDasharray={`${circadianCycle} 100`} 
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xs font-mono font-black text-[#FFD700] block">{circadianCycle}%</span>
                          <span className="text-[6px] text-gray-500 font-headline uppercase block">CYCLE</span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-card info metrics */}
                    <div className="grid grid-cols-3 gap-2 bg-black/15 p-2.5 rounded-xl text-center">
                      <div>
                        <span className="text-[9px] text-gray-500 font-headline block">Coucher</span>
                        <span className="text-xs font-mono font-black text-white">{bedTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-headline block">Durée</span>
                        <span className="text-xs font-mono font-black text-white">{sleepDuration}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-headline block">Cycles</span>
                        <span className="text-xs font-mono font-black text-white">{numCycles}</span>
                      </div>
                    </div>

                    {/* Régler alarme button */}
                    <button 
                      onClick={() => setShowAlarmPicker(true)}
                      className="w-full h-11 bg-[#FFD700] hover:bg-[#FFD700]/90 active:scale-98 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Bell className="w-4 h-4 text-[#0F0F1A]" />
                      RÉGLER ALARME
                    </button>
                  </div>
                </div>

                {/* SECTION 6: GRAPHIQUE 7 JOURS */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    7 Dernières Nuits
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 shadow-lg border border-white/5 space-y-4">
                    
                    {/* SVG column chart */}
                    <div className="h-32 w-full relative flex items-end justify-between px-2 pt-6">
                      
                      {/* y=80 target line */}
                      <div className="absolute left-0 right-0 border-t border-dashed border-[#FFD700]/40" style={{ bottom: '80%' }}>
                        <span className="absolute -top-3 right-0 text-[8px] text-[#FFD700] font-mono font-bold bg-[#16213E] px-1">Objectif 80</span>
                      </div>

                      {weeklyData.map((d, i) => {
                        const h = `${d.score}%`;
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                            <div className="h-24 w-full flex items-end justify-center relative">
                              <div 
                                className="w-6 bg-[#4A90D9] rounded-t-sm transition-all group-hover:brightness-110 relative"
                                style={{ height: h }}
                              >
                                {/* Tooltip hover helper */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#0F0F1A] border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-mono text-white whitespace-nowrap z-20">
                                  Score: {d.score}
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] text-gray-500 font-headline mt-2">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 text-xs font-headline">
                      <span className="text-gray-400">Moyenne : <strong className="text-white">78%</strong></span>
                      <span className="text-[#00D9A5] font-black">📈 En hausse cette semaine</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 7: CONSEIL SCIENTIFIQUE */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#4A90D9] rounded-r-xl p-4 space-y-2">
                  <div className="flex gap-3 items-start">
                    <Brain className="w-5 h-5 text-[#4A90D9] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 La testostérone est produite pendant le sommeil profond (stade 3-4). 1h de moins = -15% de testostérone le lendemain. Le sommeil est ton stéroïde naturel.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Walker, M. (2017). Why We Sleep. Scribner.
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
                <div className="flex flex-col items-center gap-1 text-[#4A90D9] cursor-pointer">
                  <Moon className="w-5 h-5 text-[#4A90D9] fill-[#4A90D9]/10" />
                  <span className="text-[9px] font-headline text-[#4A90D9]">Sommeil</span>
                  <div className="w-1 h-1 bg-[#4A90D9] rounded-full" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Sunrise className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Réveil</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* MODAL TIME PICKER DIALOG */}
      <AnimatePresence>
        {showAlarmPicker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#16213E] border border-white/10 rounded-[28px] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl"
            >
              <h3 className="text-sm font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFD700]" />
                Heure de Réveil Idéale
              </h3>
              <p className="text-xs text-gray-400">
                Configurez l'alarme pour s'aligner sur des cycles entiers de 90 minutes.
              </p>

              <div className="flex justify-center items-center py-4 bg-black/30 rounded-2xl border border-white/5">
                <input 
                  type="time" 
                  value={tempAlarmTime} 
                  onChange={(e) => setTempAlarmTime(e.target.value)}
                  className="bg-transparent text-white text-3xl font-mono font-bold focus:outline-none p-2 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-2">
                <AlphaButton variant="ghost" size="sm" onClick={() => setShowAlarmPicker(false)} className="flex-1">
                  Annuler
                </AlphaButton>
                <AlphaButton variant="primary" size="sm" onClick={handleSaveAlarm} className="flex-1 bg-[#FFD700] text-black">
                  Programmer
                </AlphaButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCIENCE SHEET BOTTOMSHEET DIALOG */}
      <AnimatePresence>
        {showScienceSheet && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-[#16213E] border-t border-white/10 rounded-t-[32px] p-6 w-full max-w-md text-left space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto" onClick={() => setShowScienceSheet(false)} />
              
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-headline font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#4A90D9]" />
                  Science du Sommeil Alpha
                </h3>
                <button 
                  onClick={() => setShowScienceSheet(false)}
                  className="text-xs font-mono font-bold text-gray-500 hover:text-white"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-headline">
                <div className="space-y-1">
                  <strong className="text-[#FFD700] block text-sm">Le Sommeil Régule la Testostérone</strong>
                  <p>
                    Le sommeil profond (stade 3-4 d'ondes lentes) est la période durant laquelle le cerveau sécrète la pulsatilité d'hormone de croissance (GH) et d'hormone lutéinisante (LH). C'est le régulateur principal de votre vitalité masculine.
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="text-[#FFD700] block text-sm">L'impact clinique direct</strong>
                  <p>
                    Les études cliniques démontrent qu'une seule semaine de restriction de sommeil à 5 heures par nuit fait chuter les niveaux de testostérone circulante d'environ 10% à 15%.
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="text-[#FFD700] block text-sm">Protocole 4-7-8</strong>
                  <p>
                    Inspirez pendant 4 secondes, retenez pendant 7 secondes, expirez bruyamment pendant 8 secondes. Ce rythme stimule instantanément le tonus vagal pour déclencher la sécrétion de mélatonine.
                  </p>
                </div>
              </div>

              <AlphaButton variant="primary" size="sm" onClick={() => setShowScienceSheet(false)} className="w-full bg-[#4A90D9]">
                Compris, j'optimise mon sommeil
              </AlphaButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
