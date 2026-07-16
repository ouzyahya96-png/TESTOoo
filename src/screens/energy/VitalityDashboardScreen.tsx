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
  TrendingUp as TrendUpIcon,
  Star,
  Copy,
  Code,
  Settings,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface VitalityDashboardScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNavigateToTab?: (tab: 'sleep_tracker' | 'sun_protocol' | 'nutrition' | 'cold_exposure' | 'breathing') => void;
}

export const VitalityDashboardScreen: React.FC<VitalityDashboardScreenProps> = ({ 
  addToast, 
  onBack,
  onNavigateToTab 
}) => {
  // Simulator Controls & Views
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("Aujourd'hui");
  const [score, setScore] = useState<number>(72);
  
  // Dynamic labels based on score
  const getScoreLabel = (s: number) => {
    if (s >= 90) return { label: "EXCELLENT", color: "text-[#00D9A5]", border: "border-[#00D9A5]" };
    if (s >= 80) return { label: "TRÈS BIEN", color: "text-[#00D9A5]", border: "border-[#00D9A5]" };
    if (s >= 70) return { label: "BIEN", color: "text-[#FFD700]", border: "border-[#FFD700]" };
    if (s >= 60) return { label: "MOYEN", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    if (s >= 40) return { label: "À TRAVAILLER", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    return { label: "CRITIQUE", color: "text-[#FF2D55]", border: "border-[#FF2D55]" };
  };

  const currentScoreConfig = getScoreLabel(score);

  // Sparkline data (last 7 days of global score)
  const sparklineData = [65, 68, 70, 67, 72, 70, 72];

  // 5 Pillars config values
  const [sleepScore, setSleepScore] = useState<number>(85);
  const [sunScore, setSunScore] = useState<number>(92);
  const [nutritionScore, setNutritionScore] = useState<number>(65);
  const [coldScore, setColdScore] = useState<number>(78);
  const [breathScore, setBreathScore] = useState<number>(90);

  // Handle Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ALPHA MAN - Vitalité',
        text: `Mon score global de Vitalité ALPHA est de ${score}/100. Rejoins le cercle des Alphas ! ⚡`,
        url: window.location.href,
      }).then(() => {
        addToast('success', "Score vitalité partagé ! ⚡");
      }).catch((err) => {
        console.log(err);
      });
    } else {
      navigator.clipboard.writeText(`Score de Vitalité ALPHA : ${score}/100 ⚡ (Sommeil: ${sleepScore}%, Soleil: ${sunScore}%, Nutrition: ${nutritionScore}%, Froid: ${coldScore}%, Respiration: ${breathScore}%)`);
      addToast('success', "Résumé de Vitalité copié dans le presse-papier ! 📋");
    }
  };

  // Simulate pull to refresh
  const handleRefresh = () => {
    setIsLoading(true);
    addToast('info', "Mise à jour des piliers énergétiques...");
    setTimeout(() => {
      setIsLoading(false);
      addToast('success', "Données de vitalité synchronisées ! ⚡");
    }, 1200);
  };

  // Simulate Date selection
  const handleDateChange = () => {
    const dates = ["Aujourd'hui", "Hier", "12 Juillet", "11 Juillet"];
    const currentIndex = dates.indexOf(selectedDate);
    const nextIndex = (currentIndex + 1) % dates.length;
    setSelectedDate(dates[nextIndex]);
    
    // Scramble scores to simulate historical data
    if (nextIndex === 1) { // Hier
      setScore(68);
      setSleepScore(75);
      setSunScore(80);
      setNutritionScore(70);
      setColdScore(60);
      setBreathScore(85);
    } else if (nextIndex === 2) {
      setScore(81);
      setSleepScore(90);
      setSunScore(95);
      setNutritionScore(60);
      setColdScore(80);
      setBreathScore(92);
    } else {
      setScore(72);
      setSleepScore(85);
      setSunScore(92);
      setNutritionScore(65);
      setColdScore(78);
      setBreathScore(90);
    }

    addToast('info', `Historique chargé pour : ${dates[nextIndex]}`);
  };

  // Stacked chart data mapping
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const stackedWeeklyData = [
    { sleep: 70, sun: 80, nutrition: 60, cold: 40, breath: 90, global: 68 },
    { sleep: 80, sun: 75, nutrition: 65, cold: 60, breath: 85, global: 73 },
    { sleep: 85, sun: 90, nutrition: 70, cold: 80, breath: 95, global: 84 },
    { sleep: 65, sun: 60, nutrition: 55, cold: 20, breath: 70, global: 54 },
    { sleep: 75, sun: 85, nutrition: 65, cold: 70, breath: 90, global: 77 },
    { sleep: 90, sun: 95, nutrition: 80, cold: 90, breath: 95, global: 90 },
    { sleep: sleepScore, sun: sunScore, nutrition: nutritionScore, cold: coldScore, breath: breathScore, global: score },
  ];

  // React Native Expo representation code
  const expoNativeCode = `import React, { useState, useEffect } from 'react';
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

export default function VitalityDashboardScreen({ navigation }) {
  const [score, setScore] = useState(72);
  const [isLoading, setIsLoading] = useState(false);

  const pillars = [
    { id: 'sleep', name: 'SOMMEIL', score: 85, icon: 'moon-outline', color: '#4A90D9', target: 'SleepTrackerScreen', label: '7h 12m hier', goal: '8h', trend: '↑ 5%' },
    { id: 'sun', name: 'SOLEIL', score: 92, icon: 'sunny-outline', color: '#FFD700', target: 'SunProtocolScreen', label: '18 min aujourd\\\'hui', goal: '20 min', trend: '↑ 12%' },
    { id: 'nutrition', name: 'NUTRITION', score: 65, icon: 'food-apple-outline', color: '#00D9A5', target: 'NutritionScreen', label: '3/5 repas suivis', goal: '5/5', trend: '↓ 8%', negative: true },
    { id: 'cold', name: 'FROID', score: 78, icon: 'snow-outline', color: '#4A90D9', target: 'ColdExposureScreen', label: '2 min 30s ce matin', goal: '3 min', trend: '↑ 15%' },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Mon score de Vitalité ALPHA globale est de \${score}/100. Rejoins le cercle des Alphas ! ⚡\`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log(error);
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
        <Text style={styles.headerTitle}>VITALITÉ</Text>
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
        <View style={[styles.mainScoreCard, score >= 70 ? styles.borderGold : styles.borderRed]}>
          <Text style={styles.scoreTitle}>SCORE VITALITÉ GLOBAL</Text>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>BIEN</Text>
          <Text style={styles.percentileText}>
             Tu es dans le top 34% des Alphas
          </Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>↑ +8% cette semaine</Text>
          </View>
        </View>

        {/* 5 PILIERS */}
        <Text style={styles.sectionTitle}>TES 5 PILIERS</Text>
        <View style={styles.grid}>
          {pillars.map((pilier) => (
            <TouchableOpacity 
              key={pilier.id} 
              style={[styles.pillarCard, { borderTopColor: pilier.color }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(pilier.target);
              }}
            >
              <View style={styles.pillarHeader}>
                <Ionicons name={pilier.icon} size={20} color={pilier.color} />
                <Text style={styles.pillarName}>{pilier.name}</Text>
                <Text style={[styles.pillarScore, { color: pilier.color }]}>{pilier.score}%</Text>
              </View>
              <Text style={styles.pillarLabel}>{pilier.label}</Text>
              <View style={styles.pillarFooter}>
                <Text style={styles.pillarGoal}>Objectif : {pilier.goal}</Text>
                <Text style={[styles.pillarTrend, { color: pilier.negative ? '#FF2D55' : '#00D9A5' }]}>{pilier.trend}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#00D9A5', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  scroll: { paddingBottom: 40 },
  mainScoreCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, alignItems: 'center', borderWidth: 2 },
  borderGold: { borderColor: '#FFD700' },
  borderRed: { borderColor: '#FF2D55' },
  scoreTitle: { fontSize: 12, color: '#8E8E93', letterSpacing: 3, fontWeight: '600' },
  scoreText: { fontSize: 72, fontWeight: 'bold', color: '#00D9A5', marginVertical: 12 },
  scoreLabel: { fontSize: 16, color: '#00D9A5', fontWeight: 'bold' },
  percentileText: { fontSize: 13, color: '#8E8E93', marginVertical: 8 },
  trendBadge: { backgroundColor: 'rgba(0, 217, 165, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
  trendText: { color: '#00D9A5', fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginLeft: 16, marginVertical: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  pillarCard: { width: (screenWidth - 36) / 2, backgroundColor: '#16213E', borderRadius: 16, padding: 16, margin: 5, borderTopWidth: 3 },
  pillarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillarName: { fontSize: 11, color: '#FFFFFF', fontWeight: 'bold', marginLeft: 6, flex: 1 },
  pillarScore: { fontSize: 16, fontWeight: 'bold' },
  pillarLabel: { fontSize: 11, color: '#8E8E93', marginTop: 16 },
  pillarFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  pillarGoal: { fontSize: 10, color: '#5A5A5A' },
  pillarTrend: { fontSize: 10, fontWeight: 'bold' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source VitalityDashboardScreen copié ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-widest bg-[#00D9A5]/10 border border-[#00D9A5]/20 px-2 rounded-md">
            Générateur Vitalité Globale — VitalityDashboard (3.6)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Dashboard d'Intégration Energétique & 5 Piliers
          </h2>
          <p className="text-xs text-gray-400">
            Aperçu des performances combinées : Sommeil, Ensoleillement, Nutrition, Cryothérapie, Respiration.
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
              <h4 className="text-xs font-headline font-black text-white">Composant VitalityDashboardScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Affiche les scores cumulés de vos capteurs biologiques, intègre le partage de fiches et fournit les widgets d'accès rapide.
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
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[400px] custom-scrollbar">
            {expoNativeCode}
          </pre>
        </div>
      )}

      {/* COMPONENT BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: SIMULATION CONFIGURATOR */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Modulateur Biologique
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Modifiez individuellement les scores des 5 piliers pour observer les changements sur le score global de vitalité.
            </p>
          </div>

          {/* SLIDERS FOR PILLARS SCORES */}
          <div className="space-y-3">
            
            {/* Sommeil */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">1. Sommeil</span>
                <span className="text-[#4A90D9] font-bold">{sleepScore}%</span>
              </div>
              <input 
                type="range" min="10" max="100" value={sleepScore} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSleepScore(val);
                  setScore(Math.round((val + sunScore + nutritionScore + coldScore + breathScore) / 5));
                }}
                className="w-full accent-[#4A90D9] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Soleil */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">2. Soleil</span>
                <span className="text-[#FFD700] font-bold">{sunScore}%</span>
              </div>
              <input 
                type="range" min="10" max="100" value={sunScore} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSunScore(val);
                  setScore(Math.round((sleepScore + val + nutritionScore + coldScore + breathScore) / 5));
                }}
                className="w-full accent-[#FFD700] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Nutrition */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">3. Nutrition</span>
                <span className="text-[#00D9A5] font-bold">{nutritionScore}%</span>
              </div>
              <input 
                type="range" min="10" max="100" value={nutritionScore} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNutritionScore(val);
                  setScore(Math.round((sleepScore + sunScore + val + coldScore + breathScore) / 5));
                }}
                className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Cold Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">4. Froid</span>
                <span className="text-[#4A90D9] font-bold">{coldScore}%</span>
              </div>
              <input 
                type="range" min="10" max="100" value={coldScore} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setColdScore(val);
                  setScore(Math.round((sleepScore + sunScore + nutritionScore + val + breathScore) / 5));
                }}
                className="w-full accent-[#4A90D9] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Respiration */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">5. Respiration</span>
                <span className="text-[#00D9A5] font-bold">{breathScore}%</span>
              </div>
              <input 
                type="range" min="10" max="100" value={breathScore} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setBreathScore(val);
                  setScore(Math.round((sleepScore + sunScore + nutritionScore + coldScore + val) / 5));
                }}
                className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

          </div>

          <div className="border-t border-gray-800 pt-4 space-y-2">
            <button
              onClick={() => {
                setScore(94);
                setSleepScore(95);
                setSunScore(98);
                setNutritionScore(90);
                setColdScore(92);
                setBreathScore(95);
                addToast('success', "Profil Parfait Simulé ! Score Vitalité à 94% ⭐");
              }}
              className="w-full py-1.5 px-3 bg-[#00D9A5]/10 border border-[#00D9A5]/20 hover:bg-[#00D9A5]/20 text-[#00D9A5] rounded-xl text-xs font-bold transition-all"
            >
              Simuler Profil d'Élite (94%)
            </button>
            <button
              onClick={() => {
                setScore(38);
                setSleepScore(30);
                setSunScore(40);
                setNutritionScore(45);
                setColdScore(25);
                setBreathScore(50);
                addToast('warning', "Alerte Fatigue Simulée ! Score Vitalité Critique.");
              }}
              className="w-full py-1.5 px-3 bg-[#FF2D55]/10 border border-[#FF2D55]/20 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-bold transition-all"
            >
              Simuler Fatigue Critique (38%)
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: PHONE EMULATION */}
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
                <span>15:35</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#00D9A5] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-900 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-md font-headline font-black tracking-widest text-[#00D9A5] uppercase">
                  Vitalité
                </h1>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleDateChange}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* SCROLL VIEW COMPONENT */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">

                {/* DATE SELECTOR BAR PREVIEW */}
                <div className="flex justify-between items-center bg-[#16213E]/40 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-headline">
                  <span className="text-gray-400">Période d'analyse</span>
                  <button 
                    onClick={handleDateChange}
                    className="text-[#00D9A5] font-black hover:underline cursor-pointer"
                  >
                    {selectedDate} • Modifier ↻
                  </button>
                </div>

                {/* SECTION 1: SCORE GLOBAL VITALITÉ (CARD PRINCIPALE) */}
                <div className={`bg-[#16213E] rounded-3xl p-6 text-center border-2 ${currentScoreConfig.border} shadow-2xl relative overflow-hidden transition-all duration-300`}>
                  
                  {/* Neon background blur */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#00D9A5]/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-2xl pointer-events-none" />

                  <span className="text-[10px] font-headline font-black text-gray-400 tracking-[3px] block">
                    SCORE VITALITÉ GLOBAL
                  </span>

                  {/* Main digital score display with neon glow */}
                  <div className="my-3 block relative">
                    <span className="text-6xl font-mono font-black text-[#00D9A5] tracking-tighter drop-shadow-[0_0_20px_rgba(0,217,165,0.25)] block">
                      {score}
                    </span>
                  </div>

                  <span className={`text-sm font-headline font-black tracking-widest block ${currentScoreConfig.color}`}>
                    {currentScoreConfig.label}
                  </span>

                  {/* Alpha comparative indicator */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
                    <Trophy className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]/20" />
                    <span>Tu es dans le top 34% des Alphas</span>
                  </div>

                  {/* Inline trend badge */}
                  <div className="mt-4 inline-flex bg-[#00D9A5]/10 border border-[#00D9A5]/25 text-[#00D9A5] rounded-xl py-1 px-3 text-[12px] font-bold">
                    <span>↑ +8% cette semaine</span>
                  </div>

                  {/* SVG Sparkline underneath */}
                  <div className="mt-5 h-10 w-full flex items-center justify-center">
                    <svg className="w-48 h-full overflow-visible" viewBox="0 0 100 20">
                      <defs>
                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00D9A5" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#00D9A5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 0 15 L 16 12 L 32 9 L 48 11 L 64 6 L 80 8 L 100 5" 
                        fill="none" 
                        stroke="#00D9A5" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      <path 
                        d="M 0 15 L 16 12 L 32 9 L 48 11 L 64 6 L 80 8 L 100 5 L 100 20 L 0 20 Z" 
                        fill="url(#sparklineGrad)" 
                      />
                    </svg>
                  </div>
                </div>

                {/* SECTION 2: LES 5 PILIERS (GRILLE 2x3 & WIDGET CARDS) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Tes 5 Piliers
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* PILIER 1: SOMMEIL */}
                    <div 
                      onClick={() => onNavigateToTab?.('sleep_tracker')}
                      className="bg-[#16213E] rounded-2xl p-4 border-t-3 border-[#4A90D9] flex flex-col justify-between h-[160px] shadow-sm relative overflow-hidden hover:border-r hover:border-r-white/5 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <Moon className="w-5 h-5 text-[#4A90D9]" />
                          <span className="text-[10px] font-headline font-black text-white">SOMMEIL</span>
                        </div>
                        <span className="text-sm font-mono font-black text-[#4A90D9]">{sleepScore}%</span>
                      </div>

                      {/* Mini bar chart */}
                      <div className="flex items-end gap-1.5 h-10 my-1">
                        {[50, 75, 80, sleepScore].map((s, idx) => (
                          <div key={idx} className="flex-1 bg-black/30 h-full rounded-sm flex items-end">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500`}
                              style={{ 
                                height: `${s}%`,
                                backgroundColor: s >= 80 ? "#4A90D9" : s >= 60 ? "#FF9500" : "#FF2D55"
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <span className="text-[11px] text-gray-400 font-headline leading-none block">7h 12m hier</span>

                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-headline mt-1">
                        <span>Objectif : 8h</span>
                        <span className="text-[#00D9A5] font-black flex items-center gap-0.5">
                          ↑ 5%
                        </span>
                      </div>
                    </div>

                    {/* PILIER 2: SOLEIL */}
                    <div 
                      onClick={() => onNavigateToTab?.('sun_protocol')}
                      className="bg-[#16213E] rounded-2xl p-4 border-t-3 border-[#FFD700] flex flex-col justify-between h-[160px] shadow-sm relative overflow-hidden hover:border-r hover:border-r-white/5 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <Sun className="w-5 h-5 text-[#FFD700]" />
                          <span className="text-[10px] font-headline font-black text-white">SOLEIL</span>
                        </div>
                        <span className="text-sm font-mono font-black text-[#FFD700]">{sunScore}%</span>
                      </div>

                      {/* Mini bar chart */}
                      <div className="flex items-end gap-1.5 h-10 my-1">
                        {[60, 80, 85, sunScore].map((s, idx) => (
                          <div key={idx} className="flex-1 bg-black/30 h-full rounded-sm flex items-end">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500`}
                              style={{ 
                                height: `${s}%`,
                                backgroundColor: s >= 80 ? "#FFD700" : s >= 60 ? "#FF9500" : "#FF2D55"
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <span className="text-[11px] text-gray-400 font-headline leading-none block">18 min aujourd'hui</span>

                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-headline mt-1">
                        <span>Objectif : 20 min</span>
                        <span className="text-[#00D9A5] font-black flex items-center gap-0.5">
                          ↑ 12%
                        </span>
                      </div>
                    </div>

                    {/* PILIER 3: NUTRITION */}
                    <div 
                      onClick={() => onNavigateToTab?.('nutrition')}
                      className="bg-[#16213E] rounded-2xl p-4 border-t-3 border-[#00D9A5] flex flex-col justify-between h-[160px] shadow-sm relative overflow-hidden hover:border-r hover:border-r-white/5 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <Apple className="w-5 h-5 text-[#00D9A5]" />
                          <span className="text-[10px] font-headline font-black text-white">NUTRITION</span>
                        </div>
                        <span className="text-sm font-mono font-black text-[#FF9500]">{nutritionScore}%</span>
                      </div>

                      {/* Mini bar chart */}
                      <div className="flex items-end gap-1.5 h-10 my-1">
                        {[80, 75, 70, nutritionScore].map((s, idx) => (
                          <div key={idx} className="flex-1 bg-black/30 h-full rounded-sm flex items-end">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500`}
                              style={{ 
                                height: `${s}%`,
                                backgroundColor: s >= 80 ? "#00D9A5" : s >= 60 ? "#FF9500" : "#FF2D55"
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <span className="text-[11px] text-gray-400 font-headline leading-none block">3/5 repas suivis</span>

                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-headline mt-1">
                        <span>Objectif : 5/5</span>
                        <span className="text-[#FF2D55] font-black flex items-center gap-0.5">
                          ↓ 8%
                        </span>
                      </div>
                    </div>

                    {/* PILIER 4: COLD */}
                    <div 
                      onClick={() => onNavigateToTab?.('cold_exposure')}
                      className="bg-[#16213E] rounded-2xl p-4 border-t-3 border-[#4A90D9] flex flex-col justify-between h-[160px] shadow-sm relative overflow-hidden hover:border-r hover:border-r-white/5 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <Snowflake className="w-5 h-5 text-[#4A90D9]" />
                          <span className="text-[10px] font-headline font-black text-white">FROID</span>
                        </div>
                        <span className="text-sm font-mono font-black text-[#FFD700]">{coldScore}%</span>
                      </div>

                      {/* Mini bar chart */}
                      <div className="flex items-end gap-1.5 h-10 my-1">
                        {[40, 50, 70, coldScore].map((s, idx) => (
                          <div key={idx} className="flex-1 bg-black/30 h-full rounded-sm flex items-end">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500`}
                              style={{ 
                                height: `${s}%`,
                                backgroundColor: s >= 80 ? "#00D9A5" : s >= 60 ? "#FF9500" : "#FF2D55"
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <span className="text-[11px] text-gray-400 font-headline leading-none block">2 min 30s ce matin</span>

                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-headline mt-1">
                        <span>Objectif : 3 min</span>
                        <span className="text-[#00D9A5] font-black flex items-center gap-0.5">
                          ↑ 15%
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* PILIER 5: RESPIRATION - FULL WIDTH ROW CARD */}
                  <div 
                    onClick={() => onNavigateToTab?.('breathing')}
                    className="bg-[#16213E] rounded-2xl p-4 border-t-3 border-[#00D9A5] flex items-center justify-between h-[120px] shadow-sm relative overflow-hidden hover:border-b hover:border-b-white/5 cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Wind className="w-5 h-5 text-[#00D9A5]" />
                        <span className="text-[10px] font-headline font-black text-white tracking-widest uppercase">RESPIRATION</span>
                      </div>
                      <span className="text-xl font-mono font-black text-[#00D9A5] block">{breathScore}%</span>
                      <span className="text-[11px] text-gray-400 font-headline block">15 min aujourd'hui</span>
                      <span className="text-[10px] text-gray-500 font-headline block">Objectif : 10 min</span>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                      {/* Mini horizontal aligned bars */}
                      <div className="flex items-end gap-1.5 h-12 w-28 bg-black/10 p-1.5 rounded-lg border border-white/5">
                        {[60, 70, 80, breathScore].map((s, idx) => (
                          <div key={idx} className="flex-1 bg-black/30 h-full rounded-sm flex items-end">
                            <div 
                              className="w-full bg-[#00D9A5] rounded-t-sm transition-all duration-500"
                              style={{ height: `${s}%` }}
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-[#00D9A5] text-[10px] font-bold font-headline flex items-center gap-0.5">
                        ↑ 20%
                      </span>
                    </div>
                  </div>

                </div>

                {/* SECTION 3: RADAR CHART (5 DIMENSIONS VISUAL DESIGNED) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Ta Carte de Vitalité
                  </h3>

                  <div className="bg-[#16213E] border border-white/5 rounded-3xl p-5 shadow-lg flex flex-col items-center">
                    
                    {/* SVG Polar Radar Graph Custom Representation */}
                    <div className="relative w-56 h-56 flex items-center justify-center">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                        {/* 5 concentrics radar rings */}
                        {[20, 40, 60, 80, 100].map((r, idx) => (
                          <circle 
                            key={idx} 
                            cx="50" cy="50" r={r * 0.4} 
                            fill="none" 
                            stroke="#1A1A2E" 
                            strokeWidth="1" 
                          />
                        ))}

                        {/* 5 radial axis lines */}
                        {[0, 72, 144, 216, 288].map((angle, idx) => {
                          const rad = (angle * Math.PI) / 180;
                          const tx = 50 + Math.cos(rad) * 40;
                          const ty = 50 + Math.sin(rad) * 40;
                          return (
                            <line 
                              key={idx} 
                              x1="50" y1="50" x2={tx} y2={ty} 
                              stroke="#1A1A2E" 
                              strokeWidth="1" 
                            />
                          );
                        })}

                        {/* Axis labels positioning (Sommeil, Soleil, Nutrition, Cold, Breath) */}
                        <text x="50" y="8" textAnchor="middle" fill="#4A90D9" className="text-[6px] font-headline font-black">🌙 SOM</text>
                        <text x="94" y="38" textAnchor="middle" fill="#FFD700" className="text-[6px] font-headline font-black">☀️ SOL</text>
                        <text x="76" y="88" textAnchor="middle" fill="#00D9A5" className="text-[6px] font-headline font-black">🍖 NUT</text>
                        <text x="24" y="88" textAnchor="middle" fill="#4A90D9" className="text-[6px] font-headline font-black">🧊 FRO</text>
                        <text x="6" y="38" textAnchor="middle" fill="#00D9A5" className="text-[6px] font-headline font-black">🫁 RES</text>

                        {/* Weekly active filled polygon area */}
                        {/* Calculations for points on radial: tx = 50 + cos(rad) * score * 0.4 */}
                        {(() => {
                          const angles = [-90, -18, 54, 126, 198]; // Matched axis offsets
                          const scores = [sleepScore, sunScore, nutritionScore, coldScore, breathScore];
                          const points = angles.map((ang, i) => {
                            const rad = (ang * Math.PI) / 180;
                            const tx = 50 + Math.cos(rad) * scores[i] * 0.4;
                            const ty = 50 + Math.sin(rad) * scores[i] * 0.4;
                            return `${tx},${ty}`;
                          }).join(' ');

                          // Previous week polygon (reference)
                          const prevScores = [75, 80, 70, 60, 85];
                          const prevPoints = angles.map((ang, i) => {
                            const rad = (ang * Math.PI) / 180;
                            const tx = 50 + Math.cos(rad) * prevScores[i] * 0.4;
                            const ty = 50 + Math.sin(rad) * prevScores[i] * 0.4;
                            return `${tx},${ty}`;
                          }).join(' ');

                          return (
                            <>
                              {/* Reference Area */}
                              <polygon 
                                points={prevPoints} 
                                fill="#5A5A5A" 
                                fillOpacity="0.06" 
                                stroke="#5A5A5A" 
                                strokeWidth="0.8" 
                                strokeDasharray="1.5 1.5" 
                              />
                              {/* Current Area */}
                              <polygon 
                                points={points} 
                                fill="#00D9A5" 
                                fillOpacity="0.15" 
                                stroke="#00D9A5" 
                                strokeWidth="1.8" 
                              />
                              {/* Central Score Label Overlay */}
                              <circle cx="50" cy="50" r="14" fill="#16213E" stroke="#1A1A2E" strokeWidth="2" />
                            </>
                          );
                        })()}
                      </svg>

                      {/* Score directly inside radar center */}
                      <div className="absolute text-center">
                        <span className="text-xl font-mono font-black text-[#00D9A5] leading-none block">{score}</span>
                        <span className="text-[7px] text-gray-500 font-headline uppercase font-bold tracking-wider leading-none mt-0.5">GLOBAL</span>
                      </div>
                    </div>

                    {/* Legend underneath */}
                    <div className="flex gap-4 mt-3 text-[10px] text-gray-400 font-headline">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-[#00D9A5] rounded-xs" />
                        <span>Cette semaine</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-gray-500/20 border border-dashed border-gray-400 rounded-xs" />
                        <span>Semaine dernière</span>
                      </div>
                    </div>

                    {/* Scientific Insight label */}
                    <div className="mt-5 border-t border-white/5 pt-4 text-center">
                      <p className="text-xs text-gray-400 leading-normal font-headline flex items-center justify-center gap-1.5">
                        <span>💡</span>
                        <span>
                          Ton point fort : <strong>Respiration ({breathScore}%)</strong>. Ton point faible : <strong>Nutrition ({nutritionScore}%)</strong>. Concentre tes efforts de repas demain.
                        </span>
                      </p>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: RECOMMANDATIONS PERSONNALISÉES (IA) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Recommandations IA
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    
                    {/* Recommendation 1: High Priority */}
                    {sleepScore < 90 && (
                      <div className="bg-[#16213E] border-l-3 border-[#FF2D55] rounded-r-2xl rounded-l-md p-4 flex items-center justify-between shadow-sm">
                        <div className="flex gap-3 items-center flex-1 pr-2">
                          <div className="w-9 h-9 bg-[#FF2D55]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#FF2D55]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-headline font-black text-white">Améliore ton sommeil</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                              Tu dors 6h30 en moyenne. Objectif : 8h. Active le wind-down protocol à 22h.
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => onNavigateToTab?.('sleep_tracker')}
                          className="h-8 px-3 bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white rounded-lg text-[10px] font-headline font-black uppercase cursor-pointer flex items-center"
                        >
                          VOIR
                        </button>
                      </div>
                    )}

                    {/* Recommendation 2: Medium Priority */}
                    {nutritionScore < 80 && (
                      <div className="bg-[#16213E] border-l-3 border-[#FF9500] rounded-r-2xl rounded-l-md p-4 flex items-center justify-between shadow-sm">
                        <div className="flex gap-3 items-center flex-1 pr-2">
                          <div className="w-9 h-9 bg-[#FF9500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-[#FF9500]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-headline font-black text-white">Augmente ta nutrition</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                              3 repas sur 5 suivis. Ajoute le plan de collation protéinée pour atteindre 5/5.
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => onNavigateToTab?.('nutrition')}
                          className="h-8 px-3 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white rounded-lg text-[10px] font-headline font-black uppercase cursor-pointer flex items-center"
                        >
                          VOIR
                        </button>
                      </div>
                    )}

                    {/* Recommendation 3: Low Priority / Maintenance */}
                    {breathScore >= 80 && (
                      <div className="bg-[#16213E] border-l-3 border-[#FFD700] rounded-r-2xl rounded-l-md p-4 flex items-center justify-between shadow-sm">
                        <div className="flex gap-3 items-center flex-1 pr-2">
                          <div className="w-9 h-9 bg-[#FFD700]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Star className="w-5 h-5 text-[#FFD700]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-headline font-black text-white">Maintiens ta respiration</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                              Excellent niveau à {breathScore}%. Continue 10 minutes d'Alpha Breath par jour.
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => onNavigateToTab?.('breathing')}
                          className="h-8 px-3 bg-[#FFD700] hover:bg-[#FFD700]/90 text-black rounded-lg text-[10px] font-headline font-black uppercase cursor-pointer flex items-center"
                        >
                          VOIR
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* SECTION 5: HISTORIQUE 7 JOURS (STACKED BAR CHART) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    7 Derniers Jours
                  </h3>

                  <div className="bg-[#16213E] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
                    
                    {/* Multi segment stacked bar simulator */}
                    <div className="h-28 flex items-end justify-between px-2 pt-2">
                      {stackedWeeklyData.map((data, idx) => {
                        const day = daysOfWeek[idx];
                        
                        // Convert score values into small stack proportions
                        const sum = data.sleep + data.sun + data.nutrition + data.cold + data.breath;
                        const sleepHeight = `${Math.round((data.sleep / 500) * 100)}%`;
                        const sunHeight = `${Math.round((data.sun / 500) * 100)}%`;
                        const nutritionHeight = `${Math.round((data.nutrition / 500) * 100)}%`;
                        const coldHeight = `${Math.round((data.cold / 500) * 100)}%`;
                        const breathHeight = `${Math.round((data.breath / 500) * 100)}%`;

                        return (
                          <div key={idx} className="flex flex-col items-center flex-1">
                            {/* Stack container */}
                            <div className="h-20 w-3 rounded-md flex flex-col justify-end overflow-hidden bg-black/20">
                              <div className="w-full bg-[#00D9A5]" style={{ height: breathHeight }} title="Respiration" />
                              <div className="w-full bg-[#4A90D9]" style={{ height: coldHeight }} title="Froid" />
                              <div className="w-full bg-[#00D9A5]" style={{ height: nutritionHeight }} title="Nutrition" />
                              <div className="w-full bg-[#FFD700]" style={{ height: sunHeight }} title="Soleil" />
                              <div className="w-full bg-[#4A90D9]" style={{ height: sleepHeight }} title="Sommeil" />
                            </div>
                            <span className="text-[8px] text-gray-500 font-headline mt-1.5">{day}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stack Legends Map */}
                    <div className="grid grid-cols-5 gap-1.5 text-center pt-2 border-t border-white/5">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2 h-2 bg-[#4A90D9] rounded-2xs" />
                        <span className="text-[8px] text-gray-400 font-headline">Sommeil</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2 h-2 bg-[#FFD700] rounded-2xs" />
                        <span className="text-[8px] text-gray-400 font-headline">Soleil</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2 h-2 bg-[#00D9A5] rounded-2xs" />
                        <span className="text-[8px] text-gray-400 font-headline">Nutri</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2 h-2 bg-[#4A90D9] rounded-2xs" />
                        <span className="text-[8px] text-gray-400 font-headline">Froid</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2 h-2 bg-[#00D9A5] rounded-2xs" />
                        <span className="text-[8px] text-gray-400 font-headline">Resp</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-xs text-gray-400 font-headline">
                        Moyenne hebdomadaire : <strong>74%</strong>
                      </span>
                    </div>

                  </div>
                </div>

                {/* SECTION 6: CONSEIL DU JOUR */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-2xl rounded-l-md p-4 flex gap-3 text-left shadow-sm">
                  <Lightbulb className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-headline leading-relaxed">
                      💡 Conseil : Quand tu améliores un pilier, les autres suivent naturellement. Commence par celui avec le score le plus bas aujourd'hui. C'est la loi du levier.
                    </p>
                    <span className="text-[10px] text-gray-500 font-headline italic mt-1.5 block">
                      Huberman Lab, 2023
                    </span>
                  </div>
                </div>

              </div>

              {/* SIMULATED PULL TO REFRESH DRAGGER */}
              <button 
                onClick={handleRefresh}
                className="mx-auto my-2 py-1.5 px-4 bg-gray-900 border border-white/5 hover:bg-gray-800 rounded-full text-[10px] font-headline font-black text-gray-400 uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              >
                <span>↻ Glisser pour actualiser</span>
              </button>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
