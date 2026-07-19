import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Activity, 
  Flame, 
  Shield, 
  TrendingUp, 
  BarChart2, 
  Check, 
  Clock, 
  Sparkles, 
  Copy, 
  Code, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  RotateCcw,
  CheckSquare,
  Lock,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface AIPredictionsScreenProps {
  userId: string;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNavigateToSettings?: () => void;
}

interface HourlyRisk {
  hour: number;
  riskPercent: number;
  reason: string;
}

interface WeekForecast {
  date: string;
  dayLabel: string;
  maxRisk: number;
  riskHour: string;
}

interface PreventiveRecommendation {
  id: string;
  windowLabel: string;
  riskPercent: number;
  suggestedAction: string;
  status: 'pending' | 'committed' | 'snoozed';
}

interface ModelAccuracy {
  percentConfirmed: number;
  confirmedCount: number;
  falseAlarmCount: number;
}

export const AIPredictionsScreen: React.FC<AIPredictionsScreenProps> = ({
  userId = 'ALPHA_SOLDIER_1',
  addToast,
  onBack,
  onNavigateToSettings
}) => {
  // Screen States
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [todayHourlyRisk, setTodayHourlyRisk] = useState<HourlyRisk[]>([]);
  const [weekForecast, setWeekForecast] = useState<WeekForecast[]>([]);
  const [preventiveRecommendations, setPreventiveRecommendations] = useState<PreventiveRecommendation[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState<ModelAccuracy>({
    percentConfirmed: 78,
    confirmedCount: 42,
    falseAlarmCount: 12
  });
  const [predictionSensitivity, setPredictionSensitivity] = useState<'cautious' | 'balanced' | 'precise'>('balanced');
  
  // Data State controls
  const [hasEnoughData, setHasEnoughData] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedTooltipHour, setSelectedTooltipHour] = useState<number | null>(null);
  
  // Code Inspector View
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load predictions data
  const fetchPredictionsData = useCallback(async (quiet: boolean = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // 1. Fetch today's hourly risk
      const todayRes = await fetch(`/api/ai-engine/${userId}/predictions/today`);
      if (todayRes.ok) {
        const data = await todayRes.json();
        if (data.success) {
          setTodayHourlyRisk(data.todayHourlyRisk || []);
          setPredictionSensitivity(data.predictionSensitivity || 'balanced');
        }
      }

      // 2. Fetch weekly forecast & recommendations (includes simulation toggle)
      const weekRes = await fetch(`/api/ai-engine/${userId}/predictions/week?lowData=${!hasEnoughData ? 'true' : 'false'}`);
      if (weekRes.ok) {
        const data = await weekRes.json();
        if (data.success) {
          setWeekForecast(data.weekForecast || []);
          setPreventiveRecommendations(data.preventiveRecommendations || []);
          setHasEnoughData(data.hasEnoughData);
        }
      }

      // 3. Fetch model accuracy
      const accuracyRes = await fetch(`/api/ai-engine/${userId}/predictions/accuracy`);
      if (accuracyRes.ok) {
        const data = await accuracyRes.json();
        if (data.success) {
          setModelAccuracy(data.modelAccuracy);
        }
      }
    } catch (error) {
      console.error('Error fetching prediction screens data:', error);
      addToast('error', "Impossible de synchroniser les prédictions neuronales.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, hasEnoughData, addToast]);

  useEffect(() => {
    fetchPredictionsData();
  }, [fetchPredictionsData]);

  // Handle commit
  const handleCommit = async (id: string) => {
    try {
      // Haptic imitation
      if ('vibrate' in navigator) {
        navigator.vibrate([15]); // short light vibration for web
      }
      
      const res = await fetch(`/api/ai-engine/${userId}/predictions/${id}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        addToast('success', "Action préventive engagée souverainement ! 🛡️");
        setPreventiveRecommendations(prev => 
          prev.map(r => r.id === id ? { ...r, status: 'committed' } : r)
        );
      }
    } catch (error) {
      console.error(error);
      addToast('error', "Impossible d'enregistrer l'engagement.");
    }
  };

  // Handle snooze
  const handleSnooze = async (id: string) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(5); // soft vibration
      }
      
      const res = await fetch(`/api/ai-engine/${userId}/predictions/${id}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        addToast('info', "Rappel de précaution reporté de 2h.");
        setPreventiveRecommendations(prev => 
          prev.map(r => r.id === id ? { ...r, status: 'snoozed' } : r)
        );
      }
    } catch (error) {
      console.error(error);
      addToast('error', "Impossible de reporter.");
    }
  };

  // Current hour of the day
  const currentHour = new Date().getHours();

  // Highlighted hour info for Section 1 Tooltip
  const selectedHourInfo = selectedTooltipHour !== null 
    ? todayHourlyRisk.find(h => h.hour === selectedTooltipHour) 
    : null;

  // Next high-risk window summary
  const upcomingHighRiskWindow = todayHourlyRisk.find(h => h.riskPercent >= 60 && h.hour >= currentHour);

  // Toggle "hasEnoughData" to demonstrate empty state easily in preview
  const handleToggleDataState = () => {
    setHasEnoughData(prev => !prev);
    addToast('info', !hasEnoughData ? "Affichage des données complètes" : "Simulation : données historiques insuffisantes (< 5j)");
  };

  // Expo React Native equivalent code for copy/inspect
  const expoNativeCodeString = `import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AIPredictionsScreen({ route, navigation }) {
  const userId = route?.params?.userId || 'ALPHA_SOLDIER_1';
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [hourlyRisk, setHourlyRisk] = useState([]);
  const [weekForecast, setWeekForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [accuracy, setAccuracy] = useState({ percentConfirmed: 78 });
  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch predictions endpoints
      const todayRes = await fetch(\`https://api.alphaman.app/ai-engine/\${userId}/predictions/today\`);
      const todayData = await todayRes.json();
      setHourlyRisk(todayData.todayHourlyRisk || []);

      const weekRes = await fetch(\`https://api.alphaman.app/ai-engine/\${userId}/predictions/week\`);
      const weekData = await weekRes.json();
      setWeekForecast(weekData.weekForecast || []);
      setRecommendations(weekData.preventiveRecommendations || []);
      setHasEnoughData(weekData.hasEnoughData);

      const accRes = await fetch(\`https://api.alphaman.app/ai-engine/\${userId}/predictions/accuracy\`);
      const accData = await accRes.json();
      setAccuracy(accData.modelAccuracy);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await fetch(\`https://api.alphaman.app/ai-engine/\${userId}/predictions/\${id}/commit\`, { method: 'POST' });
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'committed' } : r));
  };

  const handleSnooze = async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetch(\`https://api.alphaman.app/ai-engine/\${userId}/predictions/\${id}/snooze\`, { method: 'POST' });
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'snoozed' } : r));
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRÉDICTIONS & ALERTES</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ai_settings')} style={styles.headerButton}>
          <Ionicons name="settings" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Hourly Strip */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>AUJOURD'HUI (SENSIVITÉ: ÉQUILIBRÉE)</Text>
        <View style={styles.hourlyStrip}>
          {hourlyRisk.map((item) => (
            <TouchableOpacity 
              key={item.hour} 
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTooltip(item);
              }}
              style={[
                styles.hourSegment,
                item.hour < new Date().getHours() && { opacity: 0.4 },
                item.hour === new Date().getHours() && styles.currentHourSegment,
                { backgroundColor: item.riskPercent >= 67 ? '#FF2D55' : item.riskPercent >= 34 ? '#FFD700' : '#1A1A2E' }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Week Forecast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LES 7 PROCHAINS JOURS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekForecast.map((day, idx) => (
            <TouchableOpacity key={idx} style={styles.forecastCard}>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              <Text style={styles.dateLabel}>{day.date}</Text>
              <View style={[styles.badgeCircle, { backgroundColor: day.maxRisk >= 67 ? '#FF2D55' : day.maxRisk >= 34 ? '#FFD700' : '#00D9A5' }]}>
                <Text style={styles.badgeText}>{day.maxRisk}%</Text>
              </View>
              <Text style={styles.hourLabel}>{day.riskHour}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommendations & Accuracy omitted for brevity in Expo reference */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#0F0F1A' },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFD700', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#16213E', borderRadius: 20, padding: 18, margin: 16 },
  sectionLabel: { color: '#8E8E93', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  hourlyStrip: { flexDirection: 'row', height: 44, marginTop: 14, justifyContent: 'space-between' },
  hourSegment: { width: 10, borderRadius: 3 },
  currentHourSegment: { borderWidth: 2, borderColor: '#FFFFFF', transform: [{ translateY: -2 }] },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
  forecastCard: { width: 72, backgroundColor: '#16213E', borderRadius: 14, padding: 10, alignItems: 'center', marginRight: 10 },
  dayLabel: { color: '#8E8E93', fontSize: 9, fontWeight: 'bold' },
  dateLabel: { color: '#5A5A5A', fontSize: 9, marginVertical: 4 },
  badgeCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  hourLabel: { color: '#8E8E93', fontSize: 8, marginTop: 4 }
});`;

  const copyCode = () => {
    navigator.clipboard.writeText(expoNativeCodeString);
    setCopied(true);
    addToast('success', "Code React Native copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-predictions-screen-container" className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-4 px-1 select-none">
      
      {/* STATUS BAR & TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1C1C35] pb-6 bg-[#0F0F1A] p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <button
            id="back-button"
            onClick={onBack}
            className="w-11 h-11 rounded-xl bg-[#16213E] border border-[#1A1A2E]/50 flex items-center justify-center text-white cursor-pointer hover:bg-[#1A1A2E] active:scale-95 transition-all"
            aria-label="Retour au tableau de bord"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#FFD700] uppercase block">
              Moteur Prédictif Autonome
            </span>
            <h2 className="text-xl font-headline font-black text-white mt-1">
              Prédictions de Crises & Alertes
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Mock switch for demo purposes */}
          <button
            onClick={handleToggleDataState}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono uppercase tracking-wider font-extrabold cursor-pointer transition-all ${
              hasEnoughData 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            📊 {hasEnoughData ? 'Données OK' : 'Données Insuffisantes'}
          </button>

          <button
            onClick={() => setShowNativeCode(!showNativeCode)}
            className="px-3.5 py-1.5 rounded-xl bg-[#16213E] border border-[#1C1C3A] hover:bg-[#1A1A2E] text-white flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer transition-all"
          >
            <Code className="w-3.5 h-3.5" />
            {showNativeCode ? "Masquer le code Expo" : "Inspecter code Expo"}
          </button>

          {onNavigateToSettings && (
            <button
              id="settings-nav-button"
              onClick={onNavigateToSettings}
              className="w-11 h-11 rounded-xl bg-[#16213E] border border-[#1C1C3A] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer hover:bg-[#1A1A2E] active:scale-95 transition-all"
              aria-label="Aller aux paramètres IA"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* EXPO NATIVE CODE INSPECTOR EXPANSION */}
      <AnimatePresence>
        {showNativeCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <AlphaCard variant="elevated" className="p-5 border border-[#1C1C35] bg-[#0E0E1A]">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Fichier : screens/ai/AIPredictionsScreen.tsx (React Native + Expo)
                  </span>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 bg-[#FFD700] hover:bg-[#E6C200] text-[#0F0F1A] text-[10px] font-headline font-black uppercase px-3.5 py-2 rounded-xl cursor-pointer transition-all"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Copié !" : "Copier le code"}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-gray-300 bg-[#07070F] p-4 rounded-xl overflow-x-auto max-h-[300px] border border-[#16213E]">
                {expoNativeCodeString}
              </pre>
            </AlphaCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT SPLIT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RotateCcw className="w-8 h-8 text-[#FFD700] animate-spin" />
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Synchronisation des modèles neuronaux...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE: SECTION 1 (TIMELINE) & SECTION 2 (7 DAYS FORECAST) - SPAN 7 */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* SECTION 1: TIMELINE DU JOUR */}
            <AlphaCard variant="default" className="p-6 border border-[#1C1C35] relative bg-[#16213E] rounded-3xl" isHoverable={false}>
              
              {/* Header inside card */}
              <div className="flex justify-between items-center border-b border-[#1A1A2E]/50 pb-4 mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                    AUJOURD'HUI — 24 HEURES DE CONTRÔLE
                  </span>
                  <span className="text-xs text-gray-500 font-mono mt-0.5">
                    Modèle bayésien de prédiction locale
                  </span>
                </div>
                {/* Active Sensitivity Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-[9px] font-headline font-black uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
                  Sensibilité : {
                    predictionSensitivity === 'cautious' ? '🛡️ PRUDENTE' : 
                    predictionSensitivity === 'precise' ? '⚡ PRÉCISE' : '⚖️ ÉQUILIBRÉE'
                  }
                </div>
              </div>

              {/* Tooltip Hover/Tap Display */}
              <div className="h-16 relative flex items-center justify-center mb-2">
                <AnimatePresence mode="wait">
                  {selectedHourInfo ? (
                    <motion.div
                      key={selectedHourInfo.hour}
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute w-full bg-[#0F0F1A] border border-[#1C1C35] rounded-xl p-3 flex flex-col gap-1 shadow-xl"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-headline font-black text-[#FFD700] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Créneau : {selectedHourInfo.hour}h00 - {selectedHourInfo.hour + 1}h00
                        </span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          selectedHourInfo.riskPercent >= 67 ? 'bg-[#FF2D55]/10 text-[#FF2D55]' :
                          selectedHourInfo.riskPercent >= 34 ? 'bg-[#FFD700]/10 text-[#FFD700]' :
                          'bg-[#00D9A5]/10 text-[#00D9A5]'
                        }`}>
                          Risque : {selectedHourInfo.riskPercent}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 italic leading-snug">{selectedHourInfo.reason}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-[11px] font-mono text-gray-500 italic uppercase tracking-wider"
                    >
                      💡 Tapez sur un créneau horaire pour décoder l'analyse neuronale
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 24-Hour Vertical Segments Row */}
              <div className="flex justify-between items-end gap-1 h-14 mt-4 relative">
                {todayHourlyRisk.map((item, idx) => {
                  const isCurrent = item.hour === currentHour;
                  const isPast = item.hour < currentHour;
                  const isSelected = selectedTooltipHour === item.hour;
                  
                  // Color according to predicted risk
                  let colorClass = 'bg-[#1A1A2E]'; // Low (0-33%)
                  if (item.riskPercent >= 67) {
                    colorClass = 'bg-rose-500'; // High
                  } else if (item.riskPercent >= 34) {
                    colorClass = 'bg-amber-400'; // Moderate
                  }

                  return (
                    <button
                      key={item.hour}
                      onClick={() => {
                        setSelectedTooltipHour(isSelected ? null : item.hour);
                        if ('vibrate' in navigator) {
                          navigator.vibrate(10);
                        }
                      }}
                      className={`flex-1 h-full rounded-md transition-all duration-300 relative group cursor-pointer ${colorClass} ${
                        isPast ? 'opacity-30' : 'hover:scale-y-110'
                      } ${
                        isCurrent ? 'border-2 border-white scale-y-110 -translate-y-0.5 shadow-lg shadow-white/20 z-10' : ''
                      } ${
                        isSelected ? 'ring-2 ring-[#FFD700] ring-offset-2 ring-offset-[#16213E]' : ''
                      }`}
                      style={{
                        opacity: isPast ? 0.35 : (isSelected ? 1 : 0.85),
                      }}
                      title={`${item.hour}h : Risque ${item.riskPercent}% - ${item.reason}`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white bg-black/60 px-1 py-0.5 rounded tracking-tighter uppercase">
                          Now
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Graduation labels */}
              <div className="flex justify-between text-[8px] font-mono text-gray-500 mt-2 px-1">
                <span>0H</span>
                <span>4H</span>
                <span>8H</span>
                <span>12H</span>
                <span>16H</span>
                <span>20H</span>
                <span>24H</span>
              </div>

              {/* Summary message under the strip */}
              <div className="mt-5 pt-3 border-t border-[#1A1A2E]/50 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono">Status d'Urgence :</span>
                {upcomingHighRiskWindow ? (
                  <span className="font-semibold text-[#FF2D55] flex items-center gap-1 animate-pulse">
                    ⚠️ Prochaine fenêtre à risque : {upcomingHighRiskWindow.hour}h-{upcomingHighRiskWindow.hour + 2}h ({upcomingHighRiskWindow.riskPercent}%)
                  </span>
                ) : (
                  <span className="font-semibold text-[#00D9A5] flex items-center gap-1">
                    ✓ Pas de fenêtre à risque élevé détectée aujourd'hui
                  </span>
                )}
              </div>

            </AlphaCard>

            {/* SECTION 2: PRÉVISION 7 JOURS */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Les 7 prochains jours
              </h3>

              {/* Scrollable horizontal forecast row */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {weekForecast.map((day, idx) => {
                  const isToday = idx === 0;
                  const isHigh = day.maxRisk >= 67;
                  const isMod = day.maxRisk >= 34 && day.maxRisk < 67;
                  
                  // Circle color
                  const circleColor = isHigh ? 'border-[#FF2D55] text-[#FF2D55]' : isMod ? 'border-[#FFD700] text-[#FFD700]' : 'border-[#00D9A5] text-[#00D9A5]';

                  return (
                    <button
                      key={day.dayLabel + idx}
                      onClick={() => {
                        setSelectedDayOffset(idx);
                        addToast('info', `Détails chargés pour le ${day.dayLabel} ${day.date}`);
                      }}
                      className={`flex-shrink-0 w-[84px] p-3 rounded-2xl bg-[#16213E] border flex flex-col items-center gap-2 transition-all cursor-pointer hover:-translate-y-1 ${
                        isToday 
                          ? 'border-[#FFD700] shadow-[0_4px_16px_rgba(255,215,0,0.15)] bg-gradient-to-b from-[#1C2541] to-[#16213E]' 
                          : 'border-transparent hover:border-[#1C1C35]'
                      }`}
                    >
                      <span className="text-[10px] font-headline font-black text-gray-400 uppercase tracking-tight">{day.dayLabel}</span>
                      <span className="text-[11px] font-mono text-gray-500 leading-none">{day.date} Jui.</span>
                      
                      {/* Pastille de risque max */}
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-[11px] font-bold bg-[#0F0F1A]/50 ${circleColor}`}>
                        {day.maxRisk}%
                      </div>

                      <span className="text-[8px] font-headline font-bold text-gray-400 mt-1 uppercase tracking-tight">
                        Max à {day.riskHour}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: SECTION 3 (REC) & SECTION 4 (ACCURACY) - SPAN 5 */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* CONDITIONAL RENDER BASED ON DATA SUFFICIENCY */}
            {!hasEnoughData ? (
              
              /* ÉTAT VIDE (si moins de 5 jours de données historiques) */
              <AlphaCard variant="default" className="p-8 border border-[#1C1C35] flex flex-col items-center justify-center text-center gap-4 bg-[#16213E] rounded-3xl" isHoverable={false}>
                <div className="w-12 h-12 rounded-full bg-[#1A1A2E] flex items-center justify-center text-gray-400 border border-[#1C1C35]">
                  <TrendingUp className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <h3 className="font-headline font-black text-white text-sm uppercase">Modélisation de Patterns En cours</h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                  Le moteur d'analyse requiert au minimum <span className="text-[#FFD700] font-semibold">5 jours de données d'activité</span> continues (sommeil, Kegel, journal) pour calibrer ses équations.
                </p>
                <div className="p-3 bg-[#0F0F1A] border border-[#1C1C3A] rounded-xl text-[10px] font-mono text-gray-500 italic max-w-xs leading-relaxed">
                  "Souveraineté et rigueur clinique exigent une base statistique stable. Vos prédictions s'affineront automatiquement."
                </div>
              </AlphaCard>

            ) : (
              <>
                {/* SECTION 3: RECOMMANDATIONS PRÉVENTIVES */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Prépare-toi maintenant (Recommandations IA)
                  </h3>

                  <div className="flex flex-col gap-3">
                    {preventiveRecommendations.map((rec) => {
                      const isCommitted = rec.status === 'committed';
                      const isSnoozed = rec.status === 'snoozed';

                      return (
                        <div
                          key={rec.id}
                          className={`rounded-2xl p-4 border-l-[3px] transition-all bg-[#1A1A2E] ${
                            isCommitted 
                              ? 'border-[#00D9A5] shadow-[0_4px_16px_rgba(0,217,165,0.08)] bg-[#102A24]/30' 
                              : isSnoozed 
                                ? 'border-[#8E8E93] opacity-60' 
                                : 'border-[#FFD700] shadow-md shadow-[#FFD700]/5'
                          }`}
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-[#0F0F1A]/40 mb-3">
                            <span className="text-xs font-headline font-black text-white">{rec.windowLabel}</span>
                            
                            {/* Badges */}
                            {isCommitted ? (
                              <span className="text-[9px] font-headline font-extrabold text-[#00D9A5] bg-[#00D9A5]/10 border border-[#00D9A5]/20 px-2.5 py-1 rounded-lg uppercase">
                                ✓ Engagé
                              </span>
                            ) : isSnoozed ? (
                              <span className="text-[9px] font-headline font-extrabold text-[#8E8E93] bg-[#8E8E93]/10 border border-[#8E8E93]/20 px-2.5 py-1 rounded-lg uppercase">
                                💤 Reporté
                              </span>
                            ) : (
                              <span className="text-[9px] font-headline font-extrabold text-[#FF2D55] bg-[#FF2D55]/10 border border-[#FF2D55]/20 px-2.5 py-1 rounded-lg uppercase">
                                {rec.riskPercent}% Risque
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-300 leading-relaxed font-sans">{rec.suggestedAction}</p>

                          {/* Interactive Buttons */}
                          {!isCommitted && !isSnoozed && (
                            <div className="flex gap-2 mt-4 pt-3 border-t border-[#0F0F1A]/20">
                              <button
                                onClick={() => handleCommit(rec.id)}
                                className="flex-1 bg-[#FFD700] hover:bg-[#E6C200] active:scale-95 text-[#0F0F1A] text-[10px] font-headline font-black uppercase py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                M'engager
                              </button>
                              <button
                                onClick={() => handleSnooze(rec.id)}
                                className="flex-1 bg-transparent border border-[#5A5A5A]/50 hover:border-gray-400 hover:bg-white/5 text-[#8E8E93] hover:text-white text-[10px] font-headline font-black uppercase py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                              >
                                Reporter
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 4: PRÉCISION DU MODÈLE (CONFIANCE & HONNÊTETÉ) */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-headline font-black text-[#4A90D9] uppercase tracking-widest flex items-center gap-1.5">
                    <BarChart2 className="w-4.5 h-4.5" />
                    Précision du Modèle (30 derniers jours)
                  </h3>

                  <AlphaCard variant="default" className="p-5 border border-[#1C1C35] bg-[#16213E] rounded-3xl" isHoverable={false}>
                    
                    {/* Big Stats Row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-mono font-black text-[#4A90D9] tracking-tight">
                          {modelAccuracy.percentConfirmed}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-sans leading-relaxed flex-1">
                        des alertes à risque élevé émises par l'algorithme se sont cliniquement confirmées par vos rapports d'urgence.
                      </p>
                    </div>

                    {/* Proportional Distribution Bar */}
                    <div className="h-2.5 w-full bg-[#1A1A2E] rounded-full overflow-hidden mt-4 flex">
                      <div 
                        className="bg-[#00D9A5] h-full transition-all duration-1000 ease-out"
                        style={{ width: `${modelAccuracy.percentConfirmed}%` }}
                      />
                      <div 
                        className="bg-[#5A5A5A] h-full transition-all duration-1000 ease-out"
                        style={{ width: `${100 - modelAccuracy.percentConfirmed}%` }}
                      />
                    </div>

                    {/* Legends Row */}
                    <div className="flex gap-4 justify-center items-center mt-3 text-[9px] font-mono text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00D9A5]" />
                        <span>Confirmées ({modelAccuracy.confirmedCount})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#5A5A5A]" />
                        <span>Fausses alertes ({modelAccuracy.falseAlarmCount})</span>
                      </div>
                    </div>

                    {/* Transparency block */}
                    <div className="mt-4 pt-3.5 border-t border-[#1C1C35]/50 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-400 italic leading-normal">
                        Le modèle apprend souverainement de chaque retour que tu donnes après une alerte. Plus tu réponds, plus il devient précis pour TOI spécifiquement.
                      </p>
                    </div>

                  </AlphaCard>
                </div>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
