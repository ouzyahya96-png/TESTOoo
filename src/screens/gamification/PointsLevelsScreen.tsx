import React, { useState } from 'react';
import { 
  ArrowLeft,
  Share2,
  Calendar,
  Shield,
  Coins,
  TrendingUp,
  Award,
  PlayCircle,
  Target,
  Wind,
  ShoppingBag,
  Flame,
  Moon,
  Sun,
  Lock,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Code,
  Copy,
  Settings,
  X,
  Filter
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface PointsLevelsScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const PointsLevelsScreen: React.FC<PointsLevelsScreenProps> = ({ addToast, onBack }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [historyLimit, setHistoryLimit] = useState<number>(5);

  // Core Gamification State
  const [vitalityPoints, setVitalityPoints] = useState<number>(2340);
  const [currentLevel, setCurrentLevel] = useState<number>(7);
  const [levelName, setLevelName] = useState<string>('WARRIOR');
  const [nextLevelName, setNextLevelName] = useState<string>('GLADIATOR');
  const [pointsToNextLevel] = useState<number>(3600);
  const [pointsProgress, setPointsProgress] = useState<number>(65);
  
  // Stats
  const [todayEarnings, setTodayEarnings] = useState<number>(120);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(840);
  const [totalEarned, setTotalEarned] = useState<number>(8420);
  const [weeklyTrend, setWeeklyTrend] = useState<number>(8);
  const [userPercentile, setUserPercentile] = useState<number>(12);

  // Levels database representation
  const levelTimeline = [
    { num: 1, name: "NOVICE", range: "0-100 pts", status: 'completed' as const },
    { num: 2, name: "APPRENTI", range: "100-300 pts", status: 'completed' as const },
    { num: 3, name: "DISCIPLE", range: "300-600 pts", status: 'completed' as const },
    { num: 4, name: "SOLDAT", range: "600-1,000 pts", status: 'completed' as const },
    { num: 5, name: "GUERRIER", range: "1,000-1,500 pts", status: 'completed' as const },
    { num: 6, name: "VÉTERAN", range: "1,500-2,200 pts", status: 'completed' as const },
    { num: 7, name: "WARRIOR", range: "2,200-3,600 pts", status: 'current' as const },
    { num: 8, name: "GLADIATOR", range: "3,600-5,500 pts", status: 'locked' as const },
    { num: 9, name: "CHAMPION", range: "5,500-8,000 pts", status: 'locked' as const },
    { num: 10, name: "ALPHA", range: "8,000+ pts", status: 'locked' as const, isUltimate: true }
  ];

  // Sources points breakdown
  const sourcesData = [
    { name: "Publicités", percentage: 45, points: 1053, color: "#FFD700" },
    { name: "Kegel", percentage: 20, points: 468, color: "#00D9A5" },
    { name: "Respiration", percentage: 15, points: 351, color: "#4A90D9" },
    { name: "Sommeil", percentage: 10, points: 234, color: "#8E8E93" },
    { name: "Nutrition", percentage: 5, points: 117, color: "#FF9500" },
    { name: "Défis", percentage: 5, points: 117, color: "#FF2D55" }
  ];

  // History dataset
  const [historyItems, setHistoryItems] = useState([
    { id: 'item-1', type: 'ad_watch', title: "Pub courte visionnée", description: "Récompense publicitaire", points: 10, timestamp: "Aujourd'hui, 14:32", icon: "play-circle", iconColor: "#00D9A5" },
    { id: 'item-2', type: 'ad_watch', title: "Pub standard visionnée", description: "Récompense publicitaire", points: 25, timestamp: "Aujourd'hui, 11:15", icon: "play-circle", iconColor: "#FFD700" },
    { id: 'item-3', type: 'kegel', title: "Session Kegel complétée", description: "Niveau 4, 15 contractions", points: 50, timestamp: "Aujourd'hui, 08:00", icon: "target", iconColor: "#00D9A5" },
    { id: 'item-4', type: 'breathing', title: "Respiration Alpha Breath", description: "10 min, technique avancée", points: 30, timestamp: "Hier, 21:00", icon: "wind", iconColor: "#4A90D9" },
    { id: 'item-5', type: 'purchase', title: "Achat : Boost Kegel", description: "Force +20% pendant 24h", points: -500, timestamp: "Hier, 18:30", icon: "shopping-bag", iconColor: "#FF2D55" },
    { id: 'item-6', type: 'streak_bonus', title: "Bonus streak jour 5", description: "5 jours consécutifs de pubs", points: 15, timestamp: "Hier, 00:00", icon: "flame", iconColor: "#FFD700" },
    { id: 'item-7', type: 'sleep', title: "Score sommeil excellent", description: "85/100, 7h 42m", points: 40, timestamp: "Avant-hier, 07:00", icon: "moon", iconColor: "#00D9A5" },
    { id: 'item-8', type: 'sun', title: "Objectif soleil atteint", description: "20 min, score 92", points: 35, timestamp: "Avant-hier, 12:00", icon: "sun", iconColor: "#FF9500" },
    { id: 'item-9', type: 'challenge', title: "Défi Hydratation validé", description: "3L d'eau pure consommés", points: 50, timestamp: "3 jours de cela", icon: "award", iconColor: "#FF2D55" },
    { id: 'item-10', type: 'cold', title: "Choc froid thermique", description: "3 min à 12°C", points: 45, timestamp: "4 jours de cela", icon: "snowflake", iconColor: "#4A90D9" }
  ]);

  const handleShare = () => {
    const shareText = `⚡ J'ai atteint le Niveau ${currentLevel} (${levelName}) sur l'application ALPHA MAN avec un solde de ${vitalityPoints} points VITALITY ! Relève le défi de la discipline brute.`;
    if (navigator.share) {
      navigator.share({
        title: 'ALPHA MAN - Points & Niveaux',
        text: shareText,
        url: window.location.href
      }).then(() => {
        addToast('success', "Succès partagé avec fierté ! 🏆");
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('success', "Message de réussite copié dans le presse-papiers ! 📋");
    }
  };

  // Filter logic
  const filteredHistory = historyItems.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'gains') return item.points > 0;
    if (activeFilter === 'spends') return item.points < 0;
    if (activeFilter === 'streak') return item.type === 'streak_bonus';
    return true;
  });

  const loadMoreHistory = () => {
    if (historyLimit >= filteredHistory.length) {
      addToast('info', "Aucun autre historique de points disponible.");
      return;
    }
    setHistoryLimit(prev => Math.min(prev + 5, filteredHistory.length));
    addToast('success', "Historique supplémentaire chargé !");
  };

  const handleLevelCalibration = (lvl: number) => {
    setCurrentLevel(lvl);
    let name = "WARRIOR";
    let next = "GLADIATOR";
    if (lvl === 1) { name = "NOVICE"; next = "APPRENTI"; }
    else if (lvl === 2) { name = "APPRENTI"; next = "DISCIPLE"; }
    else if (lvl === 3) { name = "DISCIPLE"; next = "SOLDAT"; }
    else if (lvl === 4) { name = "SOLDAT"; next = "GUERRIER"; }
    else if (lvl === 5) { name = "GUERRIER"; next = "VÉTERAN"; }
    else if (lvl === 6) { name = "VÉTERAN"; next = "WARRIOR"; }
    else if (lvl === 7) { name = "WARRIOR"; next = "GLADIATOR"; }
    else if (lvl === 8) { name = "GLADIATOR"; next = "CHAMPION"; }
    else if (lvl === 9) { name = "CHAMPION"; next = "ALPHA"; }
    else if (lvl >= 10) { name = "ALPHA"; next = "LÉGENDE ULTIME"; }
    
    setLevelName(name);
    setNextLevelName(next);
    addToast('info', `Simulé : Passage au Niveau ${lvl} (${name})`);
  };

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
  FlatList 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { VictoryPie } from 'victory-native';

export default function PointsLevelsScreen({ navigation }) {
  const [points, setPoints] = useState(2340);
  const [level, setLevel] = useState(7);
  const [levelName, setLevelName] = useState('WARRIOR');

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`J'ai atteint le Niveau \${level} (\${levelName}) sur l'application ALPHA MAN avec \${points} points VITALITY ! ⚡\`
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
        <Text style={styles.headerTitle}>POINTS & NIVEAUX</Text>
        <TouchableOpacity style={styles.touchTarget} onPress={handleShare}>
          <Feather name="share-2" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* SCORE PRINCIPAL */}
        <View style={styles.mainScoreCard}>
          <Text style={styles.scoreTitle}>TON SOLDE VITALITY</Text>
          <Text style={styles.scoreText}>{points.toLocaleString()}</Text>
          <Text style={styles.scoreLabel}>POINTS VITALITY</Text>
          
          <View style={styles.levelRow}>
            <Feather name="shield" size={24} color="#00D9A5" />
            <Text style={styles.levelText}>NIVEAU {level} — {levelName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>TOP 12%</Text>
            </View>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.track}>
            <View style={[styles.bar, { width: '65%' }]} />
          </View>
          <Text style={styles.trackLabel}>2,340 / 3,600 pour GLADIATOR</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontFamily: 'Montserrat-Bold', color: '#FFD700', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  mainScoreCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, alignItems: 'center', borderColor: '#FFD700', borderWidth: 2 },
  scoreTitle: { fontSize: 12, color: '#8E8E93', letterSpacing: 3, fontWeight: '600' },
  scoreText: { fontSize: 72, fontWeight: 'bold', color: '#FFD700' },
  scoreLabel: { fontSize: 14, color: '#FFD700', fontWeight: 'bold', marginTop: 4 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  levelText: { fontSize: 16, color: '#00D9A5', fontWeight: 'bold', marginLeft: 8 },
  badge: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  badgeText: { color: '#0F0F1A', fontSize: 10, fontWeight: 'bold' },
  track: { width: '100%', height: 10, backgroundColor: '#1A1A2E', borderRadius: 5, marginTop: 12 },
  bar: { height: 10, backgroundColor: '#00D9A5', borderRadius: 5 },
  trackLabel: { fontSize: 11, color: '#5A5A5A', marginTop: 6, textAlign: 'center' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source de Points & Niveaux copié ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Gamification Centrale — Points & Niveaux (5.1)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Tableau d'Honneur et Progression — PointsLevelsScreen
          </h2>
          <p className="text-xs text-gray-400">
            Suit l'intégralité des rituels convertis en points de résilience masculine VITALITY.
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
              <h4 className="text-xs font-headline font-black text-white">PointsLevelsScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Gère le classement par centiles, le rendu de l'arc de cercle de progression et le tri du livre d'audit de points.
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

      {/* TWO PANEL SYSTEM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: ADJUST POINTS SIMULATION */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Calibreur de Succès Alpha
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Ajustez le niveau et l'historique pour simuler la montée en puissance de l'utilisateur.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Level slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Niveau Actuel</span>
                <span className="text-[#00D9A5] font-black">{currentLevel} ({levelName})</span>
              </div>
              <input 
                type="range" min="1" max="10" value={currentLevel} 
                onChange={(e) => handleLevelCalibration(parseInt(e.target.value))}
                className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Points balance input slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Solde de Points</span>
                <span className="text-[#FFD700] font-black">{vitalityPoints.toLocaleString()} PTS</span>
              </div>
              <input 
                type="range" min="50" max="12000" step="50" value={vitalityPoints} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setVitalityPoints(val);
                  setPointsProgress(Math.min(100, Math.round((val / pointsToNextLevel) * 100)));
                }}
                className="w-full accent-[#FFD700] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Percentile range slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Classement Percentile</span>
                <span className="text-[#FF2D55] font-black">TOP {userPercentile}% mondial</span>
              </div>
              <input 
                type="range" min="1" max="99" value={userPercentile} 
                onChange={(e) => setUserPercentile(parseInt(e.target.value))}
                className="w-full accent-[#FF2D55] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulator triggers */}
            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setVitalityPoints(8920);
                  setCurrentLevel(10);
                  setLevelName("ALPHA");
                  setNextLevelName("DIEU DES ALPHAS");
                  setPointsProgress(100);
                  setUserPercentile(1);
                  setTodayEarnings(750);
                  addToast('success', "Simulé : Statut Divin d'Alpha Ultime débloqué ! 👑");
                }}
                className="w-full py-1.5 px-3 bg-[#FFD700]/10 border border-[#FFD700]/25 hover:bg-[#FFD700]/20 text-[#FFD700] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Statut ALPHA Ultime (Top 1%)
              </button>
              
              <button 
                onClick={() => {
                  setVitalityPoints(80);
                  setCurrentLevel(1);
                  setLevelName("NOVICE");
                  setNextLevelName("APPRENTI");
                  setPointsProgress(20);
                  setUserPercentile(95);
                  setTodayEarnings(0);
                  addToast('warning', "Simulé : Profil remis à zéro (Novice).");
                }}
                className="w-full py-1.5 px-3 bg-[#8E8E93]/10 border border-[#8E8E93]/25 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
              >
                Réinitialiser à Novice
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE EMULATOR PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker and Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* PHONE DISPLAY SCREEN */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* STATUS BAR */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>13:35</span>
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
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xs font-headline font-black tracking-widest text-[#FFD700] uppercase">
                  Points & Niveaux
                </h1>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={handleShare}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                    title="Partager mon niveau"
                  >
                    <Share2 className="w-4.5 h-4.5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* PHONE SCROLL AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: SOLDE & NIVEAU (CARD PRINCIPALE) */}
                <div className="bg-[#16213E] rounded-[24px] p-6 text-center border-2 border-[#FFD700] shadow-2xl relative overflow-hidden">
                  
                  {/* Neon radial glow */}
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none" />

                  <span className="text-[10px] font-headline font-black text-[#8E8E93] tracking-[3px] block">
                    TON SOLDE VITALITY
                  </span>

                  {/* Large points value */}
                  <div className="my-3.5 block relative">
                    <span className="text-5xl font-mono font-black text-[#FFD700] tracking-tighter drop-shadow-[0_0_20px_rgba(255,215,0,0.35)] block">
                      {vitalityPoints.toLocaleString()}
                    </span>
                  </div>

                  <span className="text-xs font-headline font-black tracking-widest block text-[#FFD700] uppercase">
                    POINTS VITALITY
                  </span>

                  {/* Level row */}
                  <div className="flex items-center justify-center gap-2 mt-5">
                    <Shield className="w-6 h-6 text-[#00D9A5] fill-[#00D9A5]/10" />
                    <span className="text-xs font-headline font-black text-[#00D9A5] uppercase tracking-wide">
                      NIVEAU {currentLevel} — {levelName}
                    </span>
                    <div className="bg-[#FFD700] rounded px-2 py-0.5 ml-1">
                      <span className="text-[8px] font-headline font-black text-[#0F0F1A]">TOP {userPercentile}%</span>
                    </div>
                  </div>

                  {/* Level Progress track */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <div className="w-full h-2.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00D9A5] rounded-full transition-all duration-1000" 
                        style={{ width: `${pointsProgress}%` }} 
                      />
                    </div>
                    
                    <span className="text-[10px] text-gray-500 font-headline block">
                      {vitalityPoints.toLocaleString()} / 3,600 pour {nextLevelName}
                    </span>
                  </div>

                  {/* Today, week, total micro stats */}
                  <div className="grid grid-cols-3 gap-1 mt-5 pt-4 border-t border-white/5 text-center">
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline block">Aujourd'hui</span>
                      <span className="text-xs font-mono font-black text-[#00D9A5]">+{todayEarnings}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline block">Cette semaine</span>
                      <span className="text-xs font-mono font-black text-[#00D9A5]">+{weeklyEarnings}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline block">Total gagné</span>
                      <span className="text-xs font-mono font-black text-[#FFD700]">{totalEarned.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Trend Badge */}
                  <div className="mt-4 inline-flex bg-[#00D9A5]/10 border border-[#00D9A5]/25 text-[#00D9A5] rounded-xl py-1 px-4 text-xs font-bold">
                    <span>↑ +{weeklyTrend}% vs semaine dernière</span>
                  </div>

                </div>

                {/* SECTION 2: PROGRESSION DES NIVEAUX (TIMELINE) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Ta Montée en Puissance
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 border border-white/5 space-y-4">
                    
                    {/* Vertical timeline items */}
                    <div className="space-y-2.5 text-left">
                      {levelTimeline.map((lvl) => {
                        const isCompleted = currentLevel > lvl.num;
                        const isCurrent = currentLevel === lvl.num;
                        const isLocked = currentLevel < lvl.num;

                        return (
                          <div key={lvl.num} className="flex items-center justify-between py-2 border-b border-[#1A1A2E] last:border-0 relative">
                            <div className="flex items-center gap-3">
                              
                              {/* Circle indicators */}
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold relative
                                ${isCompleted ? 'bg-[#5A5A5A]/30 border-[#5A5A5A] text-[#8E8E93]' : ''}
                                ${isCurrent ? 'bg-[#16213E] border-[#00D9A5] text-[#00D9A5] shadow-[0_0_15px_rgba(0,217,165,0.3)] animate-pulse' : ''}
                                ${isLocked ? 'bg-[#1A1A2E] border-gray-600 text-gray-500' : ''}
                              `}>
                                <span>{lvl.num}</span>
                                {isCurrent && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00D9A5]" />
                                )}
                              </div>

                              <div>
                                <h4 className={`text-xs font-headline font-black 
                                  ${isCompleted ? 'text-gray-500 line-through' : ''}
                                  ${isCurrent ? 'text-[#00D9A5] text-sm' : 'text-white'}
                                  ${isLocked ? 'text-gray-600' : ''}
                                `}>
                                  {lvl.name}
                                </h4>
                                <span className="text-[10px] font-mono text-gray-400 block">{lvl.range}</span>
                              </div>
                            </div>

                            {/* Badge */}
                            <span className={`text-[9px] font-headline font-black uppercase px-2 py-0.5 rounded
                              ${isCompleted ? 'text-[#8E8E93]' : ''}
                              ${isCurrent ? 'bg-[#00D9A5] text-[#0F0F1A]' : ''}
                              ${isLocked ? 'text-gray-600' : ''}
                            `}>
                              {isCompleted && "✓ Débloqué"}
                              {isCurrent && "En cours"}
                              {isLocked && "🔒 Bloqué"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Next level rewards checklist */}
                    <div className="bg-[#0F0F1A] rounded-xl p-4 space-y-2.5 border border-white/5 text-left">
                      <span className="text-[10px] font-headline font-black text-[#8E8E93] uppercase block tracking-wider">
                        Récompenses au prochain niveau
                      </span>
                      
                      <div className="space-y-1 text-xs font-headline text-gray-400">
                        <div className="flex items-center gap-2 text-[#00D9A5]">
                          <span>✓</span>
                          <span>Skin Gladiator exclusif</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#00D9A5]">
                          <span>✓</span>
                          <span>Accès Clan Privé d'Élite</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#00D9A5]">
                          <span>✓</span>
                          <span>Boost permanent +10% Vitality</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 line-through">
                          <span>✗</span>
                          <span>Titre personnalisé sur le forum</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SECTION 3: SOURCES DE GAINS (PIE CHART breakdown) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    D'où Viennent Tes Points ?
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 border border-white/5 space-y-4">
                    
                    <div className="flex gap-4 items-center">
                      
                      {/* Left side: Custom robust interactive CSS/SVG pie chart representation */}
                      <div className="w-1/3 flex justify-center flex-shrink-0">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          {/* Radial concentric circular rings stacked to mimic segmented distribution */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            {/* Pubs 45% */}
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#FFD700" strokeWidth="4" strokeDasharray="45 100" strokeDashoffset="0" />
                            {/* Kegel 20% */}
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#00D9A5" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-45" />
                            {/* Respiration 15% */}
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#4A90D9" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-65" />
                            {/* Sommeil 10% */}
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#8E8E93" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-80" />
                            {/* Nutrition 5% */}
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#FF9500" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="-90" />
                            {/* Defis 5% */}
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#FF2D55" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="-95" />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-[9px] font-mono font-bold text-gray-400">Gains</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Legend values list */}
                      <div className="flex-1 text-left space-y-1.5">
                        {sourcesData.map((src, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs font-headline">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: src.color }} />
                              <span className="text-gray-300">{src.name}</span>
                            </div>
                            <span className="text-gray-500 font-mono text-[10px]">{src.points} pts ({src.percentage}%)</span>
                          </div>
                        ))}
                      </div>

                    </div>

                    <div className="border-t border-white/5 pt-3 text-center">
                      <span className="text-xs font-mono font-black text-[#FFD700]">
                        Total accumulé : {totalEarned.toLocaleString()} PTS
                      </span>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: HISTORIQUE COMPLET (LISTE) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Historique Complet
                  </h3>

                  {/* Filter chips horizontal selector */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar select-none">
                    {[
                      { id: 'all', label: "Tout" },
                      { id: 'gains', label: "Gains" },
                      { id: 'spends', label: "Dépenses" },
                      { id: 'streak', label: "Streak" }
                    ].map((chip) => (
                      <button 
                        key={chip.id}
                        onClick={() => {
                          setActiveFilter(chip.id);
                          setHistoryLimit(5); // reset list view limit
                        }}
                        className={`py-1.5 px-4 rounded-full text-[11px] font-headline font-bold border transition-all cursor-pointer whitespace-nowrap
                          ${activeFilter === chip.id 
                            ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                            : 'border-white/10 text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Transaction listings */}
                  <div className="space-y-2">
                    {filteredHistory.slice(0, historyLimit).map((item) => (
                      <div 
                        key={item.id}
                        className="bg-[#16213E] rounded-xl p-3 flex items-center justify-between border border-white/5 relative"
                      >
                        <div className="flex items-center gap-3 text-left">
                          
                          {/* Icon Sphere */}
                          <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
                            {item.icon === 'play-circle' && <PlayCircle className="w-5 h-5 text-[#00D9A5]" />}
                            {item.icon === 'target' && <Target className="w-5 h-5 text-[#00D9A5]" />}
                            {item.icon === 'wind' && <Wind className="w-5 h-5 text-[#4A90D9]" />}
                            {item.icon === 'shopping-bag' && <ShoppingBag className="w-5 h-5 text-[#FF2D55]" />}
                            {item.icon === 'flame' && <Flame className="w-5 h-5 text-[#FFD700]" />}
                            {item.icon === 'moon' && <Moon className="w-5 h-5 text-[#00D9A5]" />}
                            {item.icon === 'sun' && <Sun className="w-5 h-5 text-[#FF9500]" />}
                            {item.icon === 'award' && <Award className="w-5 h-5 text-[#FF2D55]" />}
                            {item.icon === 'snowflake' && <Award className="w-5 h-5 text-[#4A90D9]" />}
                          </div>

                          <div>
                            <h4 className="text-xs font-headline font-black text-white">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 font-headline leading-tight">{item.description}</p>
                          </div>
                        </div>

                        {/* Right columns */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] font-mono text-gray-500">{item.timestamp}</span>
                          <span className={`text-xs font-mono font-black ${item.points > 0 ? 'text-[#00D9A5]' : 'text-[#FF2D55]'}`}>
                            {item.points > 0 ? `+${item.points}` : item.points}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Loader trigger button */}
                    {historyLimit < filteredHistory.length && (
                      <button 
                        onClick={loadMoreHistory}
                        className="w-full py-3 bg-transparent border border-gray-600 rounded-xl text-xs font-headline font-bold text-gray-400 hover:text-white hover:border-gray-400 transition-all cursor-pointer"
                      >
                        CHARGER PLUS D'ACTIVITÉS (Total : {filteredHistory.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* SECTION 5: CONSEIL GAMIFICATION */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <Lightbulb className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Les points VITALITY ne sont pas juste des chiffres. Ils représentent ta discipline, ta constance, ta transformation. Chaque point est une preuve que tu deviens un Alpha.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1">
                        Règles #7 du Code Alpha d'Honneur
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

              {/* SIMULATED BOTTOM NAV */}
              <div className="h-16 border-t border-gray-950 bg-[#16213E] flex items-center justify-around px-4 z-10 select-none">
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#FFD700] cursor-pointer">
                  <Award className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-[9px] font-headline text-[#FFD700]">Points</span>
                  <div className="w-1 h-1 bg-[#FFD700] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Coins className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Cadeaux</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
