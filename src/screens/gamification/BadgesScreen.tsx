import React, { useState } from 'react';
import { 
  ArrowLeft,
  Share2,
  Trophy,
  Flame,
  Footprints,
  Target,
  Wind,
  Moon,
  Sun,
  Lock,
  Lightbulb,
  Award,
  Users,
  Shield,
  Apple,
  Snowflake,
  Copy,
  Code,
  Settings,
  X,
  Sparkles,
  Zap,
  Coins
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface BadgesScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const BadgesScreen: React.FC<BadgesScreenProps> = ({ addToast, onBack }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Core Gamification State
  const [unlockedCount, setUnlockedCount] = useState<number>(24);
  const [totalBadgesCount] = useState<number>(48);
  const [userPercentile, setUserPercentile] = useState<string>('Top 15%');
  
  // Spotlight State
  const [spotlightBadge, setSpotlightBadge] = useState({
    id: 'streak-30',
    name: "STREAK 30",
    rarity: "RARE",
    description: "30 jours consécutifs de défis complétés. Tu es inébranlable.",
    date: "Débloqué le 26/07/2026",
    icon: 'flame',
    iconColor: '#FFD700'
  });

  // Next Target Badge
  const [nextBadge, setNextBadge] = useState({
    name: "GLADIATOR",
    description: "Atteins le niveau 8",
    currentPoints: 2340,
    targetPoints: 3600,
    progressPercent: 65
  });

  // Categories list
  const categories = [
    { id: 'all', name: "Tout" },
    { id: 'body', name: "Corps" },
    { id: 'mind', name: "Esprit" },
    { id: 'vitality', name: "Vitalité" },
    { id: 'social', name: "Social" },
    { id: 'secret', name: "Secret", isLocked: true }
  ];

  // Database of badges
  const [badgesList, setBadgesList] = useState([
    { id: 'badge-1', name: "Premier Pas", description: "Complète ton 1er défi", icon: 'footprints', category: 'vitality', rarity: 'common' as const, status: 'unlocked' as const, date: '12/07/2026', iconColor: '#00D9A5' },
    { id: 'badge-2', name: "Kegel Master", description: "100 sessions", icon: 'target', category: 'body', rarity: 'rare' as const, status: 'unlocked' as const, date: '15/07/2026', iconColor: '#00D9A5' },
    { id: 'badge-3', name: "Respiration", description: "50 sessions", icon: 'wind', category: 'mind', rarity: 'common' as const, status: 'unlocked' as const, date: '18/07/2026', iconColor: '#4A90D9' },
    { id: 'badge-4', name: "Sommeil Parfait", description: "7 nuits ≥ 80", icon: 'moon', category: 'mind', rarity: 'rare' as const, status: 'unlocked' as const, date: '20/07/2026', iconColor: '#4A90D9' },
    { id: 'badge-5', name: "Guerrier Soleil", description: "30 jours de soleil", icon: 'sun', category: 'vitality', rarity: 'rare' as const, status: 'unlocked' as const, date: '22/07/2026', iconColor: '#FFD700' },
    { id: 'badge-6', name: "Nutritionniste", description: "5/5 repas x 14j", icon: 'apple', category: 'body', rarity: 'common' as const, status: 'unlocked' as const, date: '24/07/2026', iconColor: '#00D9A5' },
    { id: 'badge-7', name: "Maître Froid", description: "Niveau 5 atteint", icon: 'snowflake', category: 'body', rarity: 'epic' as const, status: 'unlocked' as const, date: '25/07/2026', iconColor: '#4A90D9' },
    { id: 'badge-8', name: "Streak 7", description: "7 jours consécutifs", icon: 'flame', category: 'vitality', rarity: 'common' as const, status: 'unlocked' as const, date: '26/07/2026', iconColor: '#FFD700' },
    { id: 'badge-9', name: "Streak 30", description: "30 jours consécutifs", icon: 'flame', category: 'vitality', rarity: 'rare' as const, status: 'unlocked' as const, date: "Aujourd'hui", iconColor: '#FFD700', isNew: true },
    { id: 'badge-10', name: "Clan Member", description: "Rejoins un clan", icon: 'users', category: 'social', rarity: 'common' as const, status: 'unlocked' as const, date: '14/07/2026', iconColor: '#00D9A5' },
    { id: 'badge-11', name: "Top 10", description: "Top 10 mondial", icon: 'trophy', category: 'social', rarity: 'epic' as const, status: 'unlocked' as const, date: '20/07/2026', iconColor: '#FFD700' },
    { id: 'badge-12', name: "Warrior", description: "Niveau 7 atteint", icon: 'shield', category: 'vitality', rarity: 'common' as const, status: 'unlocked' as const, date: '21/07/2026', iconColor: '#00D9A5' },
    
    // Locked Badges representation
    { id: 'badge-13', name: "Gladiator", description: "Atteins le niveau 8", icon: 'shield', category: 'vitality', rarity: 'epic' as const, status: 'locked' as const },
    { id: 'badge-14', name: "Cold King", description: "10 min à 5°C", icon: 'snowflake', category: 'body', rarity: 'legendary' as const, status: 'locked' as const },
    { id: 'badge-15', name: "Zen Guru", description: "100h respiration", icon: 'wind', category: 'mind', rarity: 'epic' as const, status: 'locked' as const },
    { id: 'badge-16', name: "Elite Clan", description: "Clan rang #1", icon: 'users', category: 'social', rarity: 'epic' as const, status: 'locked' as const },
    { id: 'badge-17', name: "Shadow Walk", description: "Quête secrète du loup", icon: 'lock', category: 'secret', rarity: 'legendary' as const, status: 'locked' as const },
    { id: 'badge-18', name: "Absolute Alpha", description: "Atteins le niveau 10", icon: 'trophy', category: 'vitality', rarity: 'legendary' as const, status: 'locked' as const }
  ]);

  const handleShareCollection = () => {
    const shareText = `🏆 J'ai débloqué ${unlockedCount} badges d'acier sur ALPHA MAN ! Je fais partie du ${userPercentile} des guerriers les plus disciplinés. Rejoins-moi ! ⚡`;
    if (navigator.share) {
      navigator.share({
        title: 'ALPHA MAN - Collection de Badges',
        text: shareText,
        url: window.location.href
      }).then(() => {
        addToast('success', "Succès partagé avec fierté ! 🏆");
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareText);
      addToast('success', "Collection copiée dans le presse-papiers ! 📋");
    }
  };

  const handleBadgeClick = (badge: typeof badgesList[0]) => {
    if (badge.status === 'locked') {
      addToast('warning', `Badge verrouillé 🔒 condition : ${badge.description}`);
    } else {
      addToast('success', `Badge "${badge.name}" : ${badge.description}. Débloqué le ${badge.date}. 🌟`);
      setSpotlightBadge({
        id: badge.id,
        name: badge.name.toUpperCase(),
        rarity: badge.rarity.toUpperCase(),
        description: badge.description,
        date: `Débloqué le ${badge.date}`,
        icon: badge.icon,
        iconColor: badge.iconColor || '#FFD700'
      });
    }
  };

  // Filter badges
  const filteredBadges = badgesList.filter(b => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  const categoryCounts = categories.map(cat => {
    if (cat.id === 'all') {
      return { ...cat, count: badgesList.filter(b => b.status === 'unlocked').length, total: badgesList.length };
    }
    const matching = badgesList.filter(b => b.category === cat.id);
    return {
      ...cat,
      count: matching.filter(b => b.status === 'unlocked').length,
      total: matching.length
    };
  });

  const handleSimulateNewBadge = () => {
    addToast('success', "Alerte : Nouveau badge débloqué ! 'Maître du Froid' monte en puissance. 🔥");
    setUnlockedCount(prev => Math.min(prev + 1, totalBadgesCount));
    setUserPercentile('Top 12%');
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
  Dimensions 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

export default function BadgesScreen({ navigation }) {
  const [unlocked, setUnlocked] = useState(24);
  const [total, setTotal] = useState(48);

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`J'ai débloqué \${unlocked}/\${total} badges d'acier sur l'application ALPHA MAN ! 🛡️\`
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
        <Text style={styles.headerTitle}>BADGES</Text>
        <TouchableOpacity style={styles.touchTarget} onPress={handleShare}>
          <Feather name="share-2" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* PROGRESS CARD */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>TA COLLECTION</Text>
          <Text style={styles.scoreText}>{unlocked} / {total}</Text>
          <Text style={styles.scoreLabel}>BADGES DÉBLOQUÉS</Text>
          <Text style={styles.percentageText}>50%</Text>
          
          <View style={styles.track}>
            <View style={[styles.bar, { width: '50%' }]} />
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
  progressCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, alignItems: 'center', borderColor: '#FFD700', borderWidth: 2 },
  cardTitle: { fontSize: 12, color: '#8E8E93', letterSpacing: 3, fontWeight: '600' },
  scoreText: { fontSize: 64, fontWeight: 'bold', color: '#FFD700' },
  scoreLabel: { fontSize: 14, color: '#FFD700', fontWeight: 'bold', marginTop: 4 },
  percentageText: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', marginTop: 8 },
  track: { width: '100%', height: 10, backgroundColor: '#1A1A2E', borderRadius: 5, marginTop: 12 },
  bar: { height: 10, backgroundColor: '#FFD700', borderRadius: 5 }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source de Badges & Réalisations copié ! 🧬");
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCategoryStats = categoryCounts.find(c => c.id === activeCategory);

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Identité Sociale — Badges (5.5)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Grille des Trophées de Transformation — BadgesScreen
          </h2>
          <p className="text-xs text-gray-400">
            Valide la progression de l'entraînement et offre une vitrine d'honneur partageable pour les réseaux d'Alphas.
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
              <h4 className="text-xs font-headline font-black text-white">BadgesScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Gère le stockage réactif des illustrations de badges, l'API de partage social d'Expo et la gestion du haptic feed.
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

      {/* TWO PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: SIMULATOR ACTIONS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console d'Administration des Badges
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Simulez la détection en direct de nouvelles réalisations pour vérifier la réactivité du carrousel de vedette.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Slider Badges Unlock count */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Nombre de Badges Débloqués</span>
                <span className="text-[#FFD700] font-black">{unlockedCount} / {totalBadgesCount}</span>
              </div>
              <input 
                type="range" min="1" max={totalBadgesCount} value={unlockedCount} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setUnlockedCount(val);
                  // Update mock percentile
                  if (val > 35) setUserPercentile('Top 3%');
                  else if (val > 24) setUserPercentile('Top 8%');
                  else if (val > 12) setUserPercentile('Top 15%');
                  else setUserPercentile('Top 45%');
                }}
                className="w-full accent-[#FFD700] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulators triggers */}
            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
              <button 
                onClick={handleSimulateNewBadge}
                className="w-full py-2 px-3 bg-[#00D9A5]/10 border border-[#00D9A5]/25 hover:bg-[#00D9A5]/20 text-[#00D9A5] rounded-xl text-xs font-bold transition-all"
              >
                Simuler l'Obtention d'un Badge
              </button>
              
              <button 
                onClick={() => {
                  setUnlockedCount(totalBadgesCount);
                  setUserPercentile('Top 1%');
                  addToast('success', "Simulé : Collectionneur d'Or Absolu ! Tous les badges débloqués ! 👑");
                }}
                className="w-full py-2 px-3 bg-[#FFD700]/10 border border-[#FFD700]/25 hover:bg-[#FFD700]/20 text-[#FFD700] rounded-xl text-xs font-bold transition-all"
              >
                Débloquer TOUTE la collection (100%)
              </button>
            </div>

            <div className="bg-[#16213E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-300 leading-snug">
              🏅 <strong>Preuve de Discipline :</strong> Les badges sont décernés de manière cryptographique et ne peuvent pas être falsifiés par l'utilisateur. Chaque médaille atteste d'une session de Kegel validée ou d'une nuit de sommeil d'acier.
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker and notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* Status Bar */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>13:47</span>
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
                  Badges & Médailles
                </h1>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={handleShareCollection}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                    title="Partager mon palmarès"
                  >
                    <Share2 className="w-4.5 h-4.5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* SCROLL STREAM AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: PROGRESSION GLOBALE (CARD PRINCIPALE) */}
                <div className="bg-[#16213E] rounded-[24px] p-6 text-center border-2 border-[#FFD700] shadow-2xl relative overflow-hidden">
                  
                  {/* Concentric radial gold glow */}
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-2xl pointer-events-none" />

                  <span className="text-[10px] font-headline font-black text-[#8E8E93] tracking-[3px] block">
                    TA COLLECTION
                  </span>

                  {/* Large progress text */}
                  <div className="my-3.5 block relative">
                    <span className="text-5xl font-mono font-black text-[#FFD700] tracking-tighter drop-shadow-[0_0_20px_rgba(255,215,0,0.35)] block">
                      {unlockedCount} / {totalBadgesCount}
                    </span>
                  </div>

                  <span className="text-xs font-headline font-black tracking-widest block text-[#FFD700] uppercase">
                    BADGES DÉBLOQUÉS
                  </span>

                  {/* Progress percent math block */}
                  <div className="text-sm font-mono font-black text-white mt-1.5">
                    {Math.round((unlockedCount / totalBadgesCount) * 100)}%
                  </div>

                  {/* Progressive Bar track */}
                  <div className="w-full h-2.5 bg-[#1A1A2E] rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-[#FFD700] rounded-full transition-all duration-1000" 
                      style={{ width: `${(unlockedCount / totalBadgesCount) * 100}%` }} 
                    />
                  </div>

                  {/* Leaderboard standing indicator badge */}
                  <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-white/5">
                    <Trophy className="w-4 h-4 text-[#00D9A5]" />
                    <span className="text-[11px] font-headline font-black text-[#00D9A5] uppercase">
                      {userPercentile} des collectionneurs d'élite
                    </span>
                  </div>

                  {/* Last unlocked notice block */}
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-gray-500 font-headline">
                    <Flame className="w-3.5 h-3.5 text-[#FF9500]" />
                    <span>Dernier : Maître du Feu (il y a 2j)</span>
                  </div>

                </div>

                {/* SECTION 2: CATÉGORIES DE BADGES (FILTRES) */}
                <div className="space-y-2.5">
                  <div className="flex gap-1.5 flex-wrap">
                    {categories.map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          addToast('info', `Filtre catégorie : ${cat.name}`);
                        }}
                        className={`py-1.5 px-3.5 rounded-full text-[10px] font-headline font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1
                          ${activeCategory === cat.id 
                            ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                            : 'border-white/10 text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        {cat.id === 'secret' && <Lock className="w-3 h-3 text-gray-400" />}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Counts dynamic label */}
                  {selectedCategoryStats && (
                    <span className="text-[10px] font-mono text-gray-500 block text-left px-1">
                      Catégorie {selectedCategoryStats.name} : {selectedCategoryStats.count} / {selectedCategoryStats.total} débloqués
                    </span>
                  )}
                </div>

                {/* SECTION 3: GRILLE DE BADGES */}
                <div className="space-y-3">
                  {/* Grid layout containing 3 columns responsive */}
                  <div className="grid grid-cols-3 gap-3">
                    {filteredBadges.map((badge) => {
                      const isLocked = badge.status === 'locked';

                      return (
                        <div 
                          key={badge.id}
                          onClick={() => handleBadgeClick(badge)}
                          className={`rounded-2xl p-2.5 flex flex-col justify-between items-center text-center h-[140px] cursor-pointer transition-all border relative select-none
                            ${isLocked 
                              ? 'bg-[#1A1A2E]/60 border-gray-800 opacity-40' 
                              : 'bg-[#16213E] hover:bg-[#16213E]/90'
                            }
                          `}
                          style={{
                            borderColor: isLocked ? '#3a3a4a' : (badge.iconColor || '#FFD700'),
                            boxShadow: isLocked ? 'none' : `0 0 10px ${(badge.iconColor || '#FFD700')}1a`
                          }}
                        >
                          {/* absolute lock icon for locked */}
                          {isLocked && (
                            <div className="absolute top-2 right-2">
                              <Lock className="w-3 h-3 text-gray-500" />
                            </div>
                          )}

                          {/* Bounce new indicator absolute */}
                          {!isLocked && badge.isNew && (
                            <div className="absolute -top-1.5 -right-1.5 bg-[#FF2D55] text-white rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider animate-bounce shadow-md">
                              NEW
                            </div>
                          )}

                          {/* Icon representation sphere */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/15 flex-shrink-0
                            ${isLocked ? 'text-gray-600' : ''}
                          `}>
                            {badge.icon === 'footprints' && <Footprints className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'target' && <Target className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'wind' && <Wind className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'moon' && <Moon className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'sun' && <Sun className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'apple' && <Apple className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'snowflake' && <Snowflake className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'flame' && <Flame className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'users' && <Users className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'trophy' && <Trophy className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'shield' && <Shield className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                            {badge.icon === 'lock' && <Lock className="w-5 h-5" style={{ color: isLocked ? '#5A5A5A' : badge.iconColor }} />}
                          </div>

                          <div className="space-y-0.5 w-full text-center">
                            <span className={`text-[10px] font-headline font-black block truncate px-1
                              ${isLocked ? 'text-gray-500' : 'text-white'}
                            `}>
                              {isLocked ? "???" : badge.name}
                            </span>
                            <span className="text-[8px] text-gray-500 font-headline block leading-tight truncate px-1">
                              {badge.description}
                            </span>
                          </div>

                          <span className="text-[8px] font-mono text-gray-600 block leading-none">
                            {isLocked ? "Bloqué" : (badge.date || "Acquis")}
                          </span>

                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => addToast('info', "Chargement du grand panthéon des Alphas...")}
                    className="w-full text-center py-2 text-gray-400 hover:text-white text-xs font-headline font-bold block pt-1.5 cursor-pointer"
                  >
                    VOIR TOUS LES BADGES →
                  </button>
                </div>

                {/* SECTION 4: BADGE SPOTLIGHT (BADGE RARE LE PLUS RÉCENT) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Badge en Vedette
                  </h3>

                  <div className="bg-gradient-to-br from-[#16213E] to-[#1A1A2E] rounded-[24px] p-6 border-2 border-[#FFD700] text-center space-y-4 relative overflow-hidden">
                    
                    {/* Floating star sparks inside */}
                    <div className="absolute top-3 left-3 text-[#FFD700]/20 animate-spin">
                      <Sparkles className="w-6 h-6" />
                    </div>

                    {/* 3D concentric sphere flame */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF9500] shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center justify-center mx-auto transform hover:scale-105 transition-transform duration-300">
                      <Flame className="w-12 h-12 text-white animate-bounce" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-headline font-black text-[#FFD700] uppercase tracking-widest">
                        {spotlightBadge.name}
                      </h4>
                      
                      <div className="inline-block bg-[#FF9500]/10 border border-[#FF9500]/25 text-[#FF9500] rounded-md py-0.5 px-2.5 text-[9px] font-headline font-black">
                        RARETÉ : {spotlightBadge.rarity}
                      </div>

                      <p className="text-xs text-white leading-relaxed font-headline max-w-[260px] mx-auto pt-1">
                        {spotlightBadge.description}
                      </p>

                      <span className="text-[10px] text-gray-500 font-headline block pt-1">
                        {spotlightBadge.date}
                      </span>
                    </div>

                    {/* CTA row */}
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleShareCollection}
                        className="flex-1 h-9 bg-[#FFD700] text-[#0F0F1A] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        PARTAGER
                      </button>
                      <button 
                        onClick={() => {
                          addToast('info', "Défilement vers la liste des trophées...");
                          // simulation scroll to grid
                        }}
                        className="flex-1 h-9 bg-transparent border border-[#FFD700] text-[#FFD700] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        COLLECTION
                      </button>
                    </div>

                  </div>
                </div>

                {/* SECTION 5: PROCHAIN BADGE À DÉBLOQUER */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Prochain Objectif
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 border-l-4 border-l-[#FF9500] flex items-center justify-between border border-white/5 text-left">
                    <div className="flex items-center gap-3.5 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[#1A1A2E] border-2 border-dashed border-gray-600 flex items-center justify-center opacity-60 flex-shrink-0">
                        <Shield className="w-7 h-7 text-gray-500" />
                      </div>

                      <div className="space-y-1 text-left flex-1">
                        <h4 className="text-xs font-headline font-black text-white">{nextBadge.name}</h4>
                        <p className="text-[11px] text-gray-400 font-headline leading-tight">{nextBadge.description}</p>
                        
                        <div className="pt-2 block">
                          <div className="flex justify-between text-[9px] font-mono text-[#FF9500]">
                            <span>{nextBadge.currentPoints.toLocaleString()} / {nextBadge.targetPoints.toLocaleString()} PTS</span>
                            <span>{nextBadge.progressPercent}%</span>
                          </div>
                          {/* target progress bar */}
                          <div className="w-full h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-[#FF9500] rounded-full" style={{ width: `${nextBadge.progressPercent}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => addToast('info', "Ouverture de la feuille de route d'entraînement...")}
                      className="ml-3 px-3 py-1 bg-[#FF9500]/10 hover:bg-[#FF9500]/20 text-[#FF9500] rounded-lg text-[9px] font-headline font-black uppercase tracking-wider cursor-pointer flex-shrink-0"
                    >
                      VOIR COMMENT
                    </button>
                  </div>
                </div>

                {/* SECTION 6: CONSEIL BADGE */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <Award className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Les badges ne sont pas que des images. Chacun représente une victoire sur toi-même. Collectionne-les comme des preuves de ta transformation.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Règle #5 du Code Alpha d'Honneur
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
                  <Award className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-[9px] font-headline text-[#FFD700]">Badges</span>
                  <div className="w-1 h-1 bg-[#FFD700] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Trophy className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Défis</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
