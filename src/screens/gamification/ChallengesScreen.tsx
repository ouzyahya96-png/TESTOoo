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
  Info,
  Trophy,
  Zap,
  Footprints,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface ChallengesScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({ addToast, onBack }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Core Streak & Gamification State
  const [streakDays, setStreakDays] = useState<number>(12);
  const [personalBestStreak, setPersonalBestStreak] = useState<number>(12);
  const [streakMax] = useState<number>(30);
  const [streakNextMilestone] = useState<number>(15);
  const [streakBonus] = useState<number>(50);

  // Daily Challenges State
  const [dailyChallenges, setDailyChallenges] = useState([
    { 
      id: 'daily-1', 
      title: "Kegel Daily", 
      description: "3 séries de 10 contractions", 
      icon: 'target', 
      iconColor: '#00D9A5', 
      reward: 15, 
      status: 'completed' as 'completed' | 'in_progress' | 'pending', 
      progress: 3, 
      target: 3, 
      unit: 'séries' 
    },
    { 
      id: 'daily-2', 
      title: "Respiration Alpha", 
      description: "5 min de Box Breathing", 
      icon: 'wind', 
      iconColor: '#4A90D9', 
      reward: 10, 
      status: 'in_progress' as 'completed' | 'in_progress' | 'pending', 
      progress: 3, 
      target: 5, 
      unit: 'min' 
    },
    { 
      id: 'daily-3', 
      title: "Sommeil Parfait", 
      description: "8h + score ≥ 80", 
      icon: 'moon', 
      iconColor: '#8E8E93', 
      reward: 20, 
      status: 'pending' as 'completed' | 'in_progress' | 'pending', 
      progress: 0, 
      target: 1, 
      unit: 'nuit' 
    }
  ]);

  // Weekly Challenge State
  const [weeklyChallenge, setWeeklyChallenge] = useState({
    id: 'weekly-1',
    title: "Le Moine Guerrier",
    description: "Complète TOUS les défis quotidiens pendant 7 jours consécutifs. Aucune excuse.",
    daysCompleted: 3,
    daysTotal: 7,
    timeRemaining: "3j 8h",
    reward: 200,
    badge: "Badge Moine Guerrier",
    skin: "Skin exclusif",
    days: [
      { day: "Lundi", completed: true, isToday: false },
      { day: "Mardi", completed: true, isToday: false },
      { day: "Mercredi", completed: true, isToday: false },
      { day: "Jeudi", completed: false, isToday: true },
      { day: "Vendredi", completed: false, isToday: false },
      { day: "Samedi", completed: false, isToday: false },
      { day: "Dimanche", completed: false, isToday: false }
    ]
  });

  // Quests State
  const [quests, setQuests] = useState([
    { 
      id: 'quest-1', 
      title: "Premier Pas", 
      description: "Complète ton premier défi", 
      icon: 'footprints', 
      iconColor: '#00D9A5', 
      reward: 50, 
      status: 'completed' as 'completed' | 'in_progress' | 'locked', 
      progress: 1, 
      target: 1 
    },
    { 
      id: 'quest-2', 
      title: "Maître du Sommeil", 
      description: "7 nuits consécutives ≥ 80 pts", 
      icon: 'moon', 
      iconColor: '#4A90D9', 
      reward: 100, 
      status: 'in_progress' as 'completed' | 'in_progress' | 'locked', 
      progress: 4, 
      target: 7 
    },
    { 
      id: 'quest-3', 
      title: "Alpha Total", 
      description: "Atteins le niveau 10 ALPHA", 
      icon: 'crown', 
      iconColor: '#5A5A5A', 
      reward: 500, 
      status: 'locked' as 'completed' | 'in_progress' | 'locked', 
      progress: 7, 
      target: 10,
      condition: "Requis : Niveau 10"
    }
  ]);

  // Recent Rewards State
  const [recentRewards] = useState([
    { id: 'reward-1', title: "Kegel Master", description: "100 sessions", icon: 'target', iconColor: '#00D9A5', date: "Il y a 2j" },
    { id: 'reward-2', title: "Streak 7", description: "7 jours consécutifs", icon: 'flame', iconColor: '#FF9500', date: "Il y a 5j" },
    { id: 'reward-3', title: "Dopamine Rush", description: "+250% dopamine", icon: 'zap', iconColor: '#FFD700', date: "Il y a 1 sem" },
    { id: 'reward-4', title: "Warrior", description: "Niveau 7 atteint", icon: 'shield', iconColor: '#4A90D9', date: "Il y a 2 sem" }
  ]);

  // Handle simulations
  const handleClaimReward = (title: string, rewardPoints: number) => {
    addToast('success', `Félicitations ! Tu as réclamé ta récompense "${title}" de +${rewardPoints} PTS ! 🏆`);
  };

  const handleProgressDailyChallenge = (challengeId: string) => {
    setDailyChallenges(prev => prev.map(ch => {
      if (ch.id === challengeId && ch.status === 'in_progress') {
        const nextProgress = ch.progress + 1;
        const isCompleted = nextProgress >= ch.target;
        
        if (isCompleted) {
          addToast('success', `Défi "${ch.title}" accompli ! +${ch.reward} PTS accumulés. 🔥`);
          
          // Propagate to weekly if Thursday is done
          setWeeklyChallenge(w => {
            const updatedDays = w.days.map(d => {
              if (d.isToday) return { ...d, completed: true };
              return d;
            });
            const completedCount = updatedDays.filter(d => d.completed).length;
            return {
              ...w,
              days: updatedDays,
              daysCompleted: completedCount
            };
          });
        } else {
          addToast('info', `Progrès enregistré pour "${ch.title}" : ${nextProgress}/${ch.target} ${ch.unit}.`);
        }

        return {
          ...ch,
          progress: nextProgress,
          status: isCompleted ? 'completed' : 'in_progress'
        };
      }
      return ch;
    }));
  };

  const handleShareStreak = () => {
    const shareText = `🔥 J'en suis à ${streakDays} jours de discipline brute consécutifs sur ALPHA MAN ! Es-tu prêt à relever le défi et à forger ton mental de guerrier ?`;
    if (navigator.share) {
      navigator.share({
        title: 'ALPHA MAN - Ma chaîne de discipline',
        text: shareText,
        url: window.location.href
      }).then(() => {
        addToast('success', "Discipline partagée avec succès ! 🚀");
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('success', "Message de réussite recopié dans le presse-papiers ! 📋");
    }
  };

  const expoNativeCode = `import React, { useState } from 'react';
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
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function ChallengesScreen({ navigation }) {
  const [streakDays, setStreakDays] = useState(12);

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`J'en suis à \${streakDays} jours de discipline brute sur ALPHA MAN ! 🔥\`
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
        <Text style={styles.headerTitle}>DÉFIS</Text>
        <TouchableOpacity style={styles.touchTarget} onPress={handleShare}>
          <Feather name="share-2" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* STREAK GLOBAL */}
        <View style={styles.streakCard}>
          <Text style={styles.streakTitle}>CHAÎNE ACTIVE</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakRing}>
              <Text style={styles.streakNum}>{streakDays}</Text>
              <Text style={styles.streakLabel}>JOURS</Text>
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakMilestone}>Jour 15 : +50 pts bonus</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#FFD700', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  streakCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, borderColor: '#FFD700', borderWidth: 2 },
  streakTitle: { fontSize: 16, color: '#FFD700', fontWeight: 'bold' },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  streakRing: { width: 100, height: 100, borderRadius: 50, borderColor: '#FFD700', borderWidth: 10, justifyContent: 'center', alignItems: 'center' },
  streakNum: { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },
  streakLabel: { fontSize: 10, color: '#FFD700' },
  streakInfo: { marginLeft: 16 }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source du module des Défis copié ! ⚙️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Moteur d'Habitudes — Défis (5.4)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Quêtes Quotidiennes et Hebdos — ChallengesScreen
          </h2>
          <p className="text-xs text-gray-400">
            Établit un rituel d'acier et convertit la constance en récompenses matérielles et honorifiques.
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
              <h4 className="text-xs font-headline font-black text-white">ChallengesScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500">
                Gère le stockage local des streaks, l'algorithme d'octroi de points de la base de données et l'horodatage de réinitialisation.
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

      {/* TWO PANEL SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: ADJUST CHALLENGES SIMULATOR */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console d'Entraînement de Discipline
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Ajustez l'état des rituels du jour et le streak pour simuler les montées de dopamine.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Slide Streak Days */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Chaîne active (Streak)</span>
                <span className="text-[#FFD700] font-black">{streakDays} Jours</span>
              </div>
              <input 
                type="range" min="1" max="45" value={streakDays} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setStreakDays(val);
                  if (val > personalBestStreak) {
                    setPersonalBestStreak(val);
                  }
                }}
                className="w-full accent-[#FFD700] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulated Claim Actions */}
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                Simuler Récompenses Disponibles
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => handleClaimReward("Le Moine Guerrier - Bonus Hebdo", 200)}
                  className="w-full py-2 bg-[#FFD700]/10 border border-[#FFD700]/25 hover:bg-[#FFD700]/20 text-[#FFD700] rounded-xl text-xs font-bold transition-all text-center"
                >
                  Débloquer Bonus Hebdo (+200 PTS)
                </button>
                <button 
                  onClick={() => {
                    setStreakDays(15);
                    addToast('success', "Succès ! Palier des 15 jours atteint. +50 PTS bonus octroyés. 🌟");
                  }}
                  className="w-full py-2 bg-[#00D9A5]/10 border border-[#00D9A5]/25 hover:bg-[#00D9A5]/20 text-[#00D9A5] rounded-xl text-xs font-bold transition-all text-center"
                >
                  Passer au Palier Jour 15 (+50 PTS)
                </button>
              </div>
            </div>

            {/* Informational notice */}
            <div className="bg-[#1A1A2E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-300 leading-snug">
              📚 <strong>La Constante d'Acier :</strong> Dans le Code Alpha, la répétition quotidienne à heure fixe reprogramme l'activité neuronale. Ce module intègre un rappel synchronisé pour s'assurer qu'aucun guerrier ne brise son élan.
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* Status Bar */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>13:42</span>
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
                  Défis & Quêtes
                </h1>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => setShowInfoModal(true)}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-400"
                    title="Aide sur les défis"
                  >
                    <Info className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* SCROLL AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: STREAK GLOBAL (CARD PRINCIPALE) */}
                <div className="bg-[#16213E] rounded-[24px] p-5 border-2 border-[#FFD700] shadow-2xl relative overflow-hidden">
                  
                  {/* Personal Best Record Badge */}
                  {streakDays >= personalBestStreak && (
                    <div className="absolute top-4 right-4 bg-[#FFD700] rounded px-2 py-0.5 animate-pulse">
                      <span className="text-[8px] font-headline font-black text-[#0F0F1A] uppercase tracking-wider">🏆 RECORD PERSO</span>
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    
                    {/* Left: Flame circle icon */}
                    <div className="w-24 h-24 rounded-full border-[8px] border-[#1A1A2E] border-t-[#FFD700] flex flex-col items-center justify-center flex-shrink-0 bg-black/10 shadow-inner">
                      <span className="text-3xl font-mono font-black text-[#FFD700] leading-none">
                        {streakDays}
                      </span>
                      <span className="text-[8px] font-headline font-black text-[#FFD700] mt-1 tracking-wider uppercase">JOURS</span>
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 text-left space-y-1">
                      <h3 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider block">
                        CHAÎNE ACTIVE
                      </h3>
                      <p className="text-[11px] text-gray-400 font-headline leading-relaxed">
                        {streakDays} jours consécutifs de défis complétés. Objectif : 30 jours pour le titre <strong className="text-white">INÉBRANLABLE</strong>.
                      </p>
                      
                      <div className="pt-2">
                        <span className="text-[10px] text-[#00D9A5] font-headline font-bold block">
                          Jour {streakNextMilestone} : +{streakBonus} pts bonus
                        </span>
                        {/* Milestone progress bar */}
                        <div className="w-full h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-[#FFD700] rounded-full transition-all duration-700" 
                            style={{ width: `${Math.min(100, (streakDays / streakMax) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <button 
                    onClick={handleShareStreak}
                    className="w-full h-8 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/20 text-[#FFD700] rounded-xl text-[9px] font-headline font-black uppercase tracking-wider mt-4 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    PARTAGER MA CHAÎNE DE RITUEL
                  </button>

                </div>

                {/* SECTION 2: DÉFIS QUOTIDIENS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline px-1">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider">
                      Défis du Jour
                    </h3>
                    <span className="text-[10px] font-headline text-gray-500 italic">Réinitialisés à minuit</span>
                  </div>

                  <div className="space-y-2.5">
                    {dailyChallenges.map((ch) => {
                      const isCompleted = ch.status === 'completed';
                      const isInProgress = ch.status === 'in_progress';
                      const isPending = ch.status === 'pending';

                      return (
                        <div 
                          key={ch.id}
                          className={`rounded-2xl p-4 flex items-center justify-between transition-all relative border
                            ${isCompleted ? 'bg-[#00D9A5]/5 border-[#00D9A5]/25 text-gray-400' : ''}
                            ${isInProgress ? 'bg-[#16213E] border-white/5 border-l-4 border-l-[#4A90D9]' : ''}
                            ${isPending ? 'bg-[#16213E]/60 border-white/5 opacity-50 border-l-4 border-l-gray-600' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3.5 text-left">
                            <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0">
                              {ch.icon === 'target' && <Target className="w-5 h-5 text-[#00D9A5]" />}
                              {ch.icon === 'wind' && <Wind className="w-5 h-5 text-[#4A90D9]" />}
                              {ch.icon === 'moon' && <Moon className="w-5 h-5 text-gray-400" />}
                            </div>

                            <div className="text-left space-y-0.5">
                              <h4 className={`text-xs font-headline font-black ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {ch.title}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-headline leading-none">{ch.description}</p>
                              <span className={`text-[10px] font-mono font-black block pt-1
                                ${isCompleted ? 'text-gray-500' : ''}
                                ${isInProgress ? 'text-[#4A90D9]' : ''}
                                ${isPending ? 'text-gray-600' : ''}
                              `}>
                                +{ch.reward} PTS
                              </span>
                            </div>
                          </div>

                          {/* Right Controls */}
                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-[#00D9A5]">3/3</span>
                                <CheckCircle2 className="w-5 h-5 text-[#00D9A5]" />
                              </div>
                            )}

                            {isInProgress && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-[#4A90D9]">{ch.progress}/{ch.target}</span>
                                <button 
                                  onClick={() => handleProgressDailyChallenge(ch.id)}
                                  className="h-7 px-3 bg-[#4A90D9] hover:bg-[#4A90D9]/95 text-white rounded-lg text-[10px] font-headline font-black uppercase tracking-wider cursor-pointer"
                                >
                                  GO
                                </button>
                              </div>
                            )}

                            {isPending && (
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Lock className="w-4 h-4 text-gray-500" />
                                <span className="text-[10px] font-headline font-bold">Ce soir</span>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* Daily Completion overall bar */}
                  <div className="pt-3 text-center space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-[#8E8E93] font-headline px-1">
                      <span>Défis journaliers complétés</span>
                      <span>1/3</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00D9A5] rounded-full" style={{ width: '33%' }} />
                    </div>

                    <div className="pt-2 block">
                      <div className="inline-flex bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] rounded-xl py-0.5 px-3 text-[10px] font-bold">
                        Bonus Complétion 3/3 : +25 PTS
                      </div>
                    </div>
                  </div>

                </div>

                {/* SECTION 3: DÉFI HEBDOMADAIRE (CARD SPÉCIALE) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Défi de la Semaine
                  </h3>

                  <div className="bg-gradient-to-br from-[#16213E] to-[#1A1A2E] rounded-[24px] p-5 border-2 border-[#FFD700] space-y-4 text-left relative">
                    
                    {/* Time remaining absolute right header */}
                    <div className="absolute top-4 right-4 bg-[#FF2D55]/10 border border-[#FF2D55]/20 rounded-lg px-2.5 py-0.5 text-right flex-shrink-0">
                      <span className="text-[9px] font-mono font-black text-[#FF2D55]">{weeklyChallenge.timeRemaining}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-[#FFD700] rounded px-1.5 py-0.5 text-[#0F0F1A] font-headline font-black text-[8px] uppercase tracking-wider">
                        WEEKLY
                      </div>
                      <h4 className="text-xs font-headline font-black text-white">{weeklyChallenge.title}</h4>
                    </div>

                    <p className="text-[11px] text-[#8E8E93] font-headline leading-relaxed">
                      {weeklyChallenge.description}
                    </p>

                    {/* Day indicator dots */}
                    <div className="grid grid-cols-7 gap-1.5 pt-2 text-center">
                      {weeklyChallenge.days.map((d, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] font-headline font-bold transition-all
                            ${d.completed ? 'bg-[#00D9A5]/10 border-[#00D9A5] text-[#00D9A5]' : ''}
                            ${d.isToday && !d.completed ? 'bg-transparent border-[#FFD700] text-[#FFD700] animate-pulse' : ''}
                            {!d.completed && !d.isToday ? 'border-gray-700 text-gray-500 bg-black/10' : ''}
                          `}>
                            {d.completed ? "✓" : d.day.substring(0, 2)}
                          </div>
                          <span className={`text-[8px] font-headline block ${d.isToday ? 'text-[#FFD700] font-bold' : 'text-gray-500'}`}>
                            {d.day.substring(0, 3)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-[10px] font-headline text-gray-400">
                        <span>{weeklyChallenge.daysCompleted}/7 jours complétés</span>
                        <span className="text-[#FFD700] font-mono">43%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFD700] rounded-full" style={{ width: '43%' }} />
                      </div>

                      {/* Final rewards text block */}
                      <div className="flex items-center gap-2 text-[#FFD700] text-[11px] font-headline font-bold pt-1">
                        <Trophy className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                        <span>Récompense : +200 PTS + {weeklyChallenge.badge} + {weeklyChallenge.skin}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => addToast('info', "Chargement des modalités du Moine Guerrier...")}
                      className="w-full py-2 bg-transparent hover:bg-white/5 border border-[#FFD700] text-[#FFD700] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider transition-all mt-2 cursor-pointer text-center"
                    >
                      VOIR LES DÉTAILS DU DÉFI
                    </button>

                  </div>
                </div>

                {/* SECTION 4: QUÊTES SPÉCIALES */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Quêtes Spéciales
                  </h3>

                  <div className="space-y-2.5">
                    {quests.map((q) => {
                      const isQuestCompleted = q.status === 'completed';
                      const isQuestInProgress = q.status === 'in_progress';
                      const isQuestLocked = q.status === 'locked';

                      return (
                        <div 
                          key={q.id}
                          className={`bg-[#16213E] rounded-2xl p-4 flex items-center justify-between border border-white/5 relative
                            ${isQuestCompleted ? 'border-l-3 border-l-[#00D9A5] opacity-75' : ''}
                            ${isQuestInProgress ? 'border-l-3 border-l-[#4A90D9]' : ''}
                            ${isQuestLocked ? 'border-l-3 border-l-gray-600 opacity-50' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3.5 text-left flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-black/25 flex items-center justify-center flex-shrink-0">
                              {q.icon === 'footprints' && <Footprints className="w-5 h-5 text-[#00D9A5]" />}
                              {q.icon === 'moon' && <Moon className="w-5 h-5 text-[#4A90D9]" />}
                              {q.icon === 'crown' && <Crown className="w-5 h-5 text-gray-500" />}
                            </div>

                            <div className="text-left space-y-1 flex-1 min-w-0">
                              <h4 className={`text-xs font-headline font-black ${isQuestCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {q.title}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-headline leading-tight truncate">{q.description}</p>
                              
                              {/* mini progress line */}
                              {isQuestInProgress && (
                                <div className="space-y-1 pt-1 max-w-[120px]">
                                  <div className="flex justify-between text-[8px] font-mono text-gray-400">
                                    <span>Progression</span>
                                    <span>{q.progress}/{q.target}</span>
                                  </div>
                                  <div className="w-full h-1 bg-[#1A1A2E] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#4A90D9] rounded-full" style={{ width: `${(q.progress / q.target) * 100}%` }} />
                                  </div>
                                </div>
                              )}

                              {isQuestLocked && q.condition && (
                                <span className="text-[9px] text-gray-500 font-headline block">{q.condition}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                            {isQuestCompleted ? (
                              <span className="text-[8px] font-headline font-black text-[#0F0F1A] bg-[#00D9A5] px-1.5 py-0.5 rounded uppercase">
                                ✓ Complété
                              </span>
                            ) : (
                              <span className={`text-[10px] font-mono font-black ${isQuestLocked ? 'text-gray-600' : 'text-[#FFD700]'}`}>
                                +{q.reward} PTS
                              </span>
                            )}

                            {isQuestLocked && (
                              <Lock className="w-3.5 h-3.5 text-gray-600 mt-1" />
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => addToast('info', "Affichage du livre de quêtes d'acier...")}
                    className="w-full py-2 bg-transparent text-gray-400 hover:text-white text-xs font-headline font-bold text-center block pt-1.5 cursor-pointer"
                  >
                    VOIR TOUTES LES QUÊTES →
                  </button>

                </div>

                {/* SECTION 5: RÉCOMPENSES RÉCENTES */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Dernières Récompenses
                  </h3>

                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {recentRewards.map((item) => (
                      <div 
                        key={item.id}
                        className="w-[120px] bg-[#16213E] rounded-2xl p-3 flex flex-col justify-between items-center text-center flex-shrink-0 h-[140px] border border-white/5 relative"
                      >
                        <div className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
                          {item.icon === 'target' && <Target className="w-5 h-5 text-[#00D9A5]" />}
                          {item.icon === 'flame' && <Flame className="w-5 h-5 text-[#FF9500]" />}
                          {item.icon === 'zap' && <Zap className="w-5 h-5 text-[#FFD700]" />}
                          {item.icon === 'shield' && <Shield className="w-5 h-5 text-[#4A90D9]" />}
                        </div>

                        <div className="space-y-0.5 text-center mt-2">
                          <span className="text-[11px] font-headline font-black text-white block truncate px-1">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-gray-400 font-headline block leading-tight">{item.description}</span>
                        </div>

                        <span className="text-[8px] text-gray-500 font-headline mt-2 block leading-none">
                          {item.date}
                        </span>

                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 6: CONSEIL DÉFI */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <Target className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Les défis quotidiens sont le ciment de ta transformation. Ce n'est pas la taille du défi qui compte, c'est la constance. 1% mieux chaque jour = 37x mieux en un an.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Règle #1 du Code Alpha d'Honneur
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

              {/* SIMULATED BOTTOM NAV */}
              <div className="h-16 border-t border-gray-950 bg-[#16213E] flex items-center justify-around px-4 z-10 select-none">
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Coins className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#FFD700] cursor-pointer">
                  <Trophy className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-[9px] font-headline text-[#FFD700]">Défis</span>
                  <div className="w-1 h-1 bg-[#FFD700] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Rang</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM INFO MODAL POPUP */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-sm w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4.5 h-4.5" />
                Comment fonctionnent les défis ?
              </h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-white font-black text-xs"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-headline">
              Complète des défis quotidiens et hebdomadaires pour gagner des points VITALITY et des récompenses exclusives. Ne romps pas ta chaîne !
            </p>

            <div className="bg-[#16213E] p-3.5 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-normal font-headline">
              💪 <strong>Rappel du Code Alpha :</strong> C'est dans l'obscurité et la répétition silencieuse que les plus grands guerriers se forgent. Sois constant.
            </div>

            <button 
              onClick={() => setShowInfoModal(false)}
              className="w-full h-10 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-widest"
            >
              COMPRIS, JE RECOIPÈRE LA DISCIPLINE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
