import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  Coins,
  Info,
  PlayCircle,
  MousePointer,
  Flame,
  Target,
  Wind,
  Palette,
  MessageSquare,
  ArrowUpCircle,
  ShoppingBag,
  Clock,
  Sparkles,
  Shield,
  ChevronRight,
  ChevronLeft,
  X,
  Code,
  Copy,
  TrendingUp,
  Award
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface AdRewardsScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  vitalityPoints?: number;
  onPointsUpdate?: (newPoints: number) => void;
}

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const AdRewardsScreen: React.FC<AdRewardsScreenProps> = ({ addToast, onBack, vitalityPoints: propVitalityPoints, onPointsUpdate }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("ads");

  // Core Points state
  const [vitalityPoints, setVitalityPoints] = useState<number>(() => propVitalityPoints ?? 2340);

  const [pointsPerAd, setPointsPerAd] = useState<number>(50);
  const [dailyLimit, setDailyLimit] = useState<number>(4);
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(0);

  // Fetch admin ad rewards settings on mount
  useEffect(() => {
    fetch('/api/admin/ads/rewards/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          const valPoints = data.pointsPerAd !== undefined ? Number(data.pointsPerAd) : 50;
          const valLimit = data.dailyLimit !== undefined ? Number(data.dailyLimit) : 4;
          setPointsPerAd(valPoints);
          setDailyLimit(valLimit);
          
          // Re-calculate rewards dynamically based on pointsPerAd
          setAdOffers(prev => prev.map(off => {
            let reward = off.reward;
            if (off.type === 'short') reward = Math.round(valPoints * 0.4);
            else if (off.type === 'standard') reward = valPoints;
            else if (off.type === 'long') reward = Math.round(valPoints * 2.4);
            else if (off.type === 'interactive') reward = Math.round(valPoints * 6);
            return { ...off, reward };
          }));
        }
      })
      .catch(err => console.error("Error fetching ad settings:", err));
  }, []);

  // Sync changes from parent down to local state if changed externally
  useEffect(() => {
    if (propVitalityPoints !== undefined) {
      setVitalityPoints(propVitalityPoints);
    }
  }, [propVitalityPoints]);

  // Sync changes back to parent
  useEffect(() => {
    if (onPointsUpdate && vitalityPoints !== propVitalityPoints) {
      onPointsUpdate(vitalityPoints);
    }
  }, [vitalityPoints, propVitalityPoints, onPointsUpdate]);
  const [currentLevel, setCurrentLevel] = useState<number>(7);
  const [levelName, setLevelName] = useState<string>('WARRIOR');
  const [nextLevelName, setNextLevelName] = useState<string>('GLADIATOR');
  const [pointsToNextLevel] = useState<number>(3600);
  const [todayEarnings, setTodayEarnings] = useState<number>(120);

  // Offers state
  const [adOffers, setAdOffers] = useState([
    { id: 'off-1', type: 'short' as const, title: "PUB COURTE", duration: "15 secondes", reward: 10, remaining: 5, maxPerDay: 5, color: "#00D9A5" },
    { id: 'off-2', type: 'standard' as const, title: "PUB STANDARD", duration: "30 secondes", reward: 25, remaining: 3, maxPerDay: 3, color: "#FFD700" },
    { id: 'off-3', type: 'long' as const, title: "PUB LONGUE", duration: "60 secondes", reward: 60, remaining: 1, maxPerDay: 1, color: "#4A90D9" },
    { id: 'off-4', type: 'interactive' as const, title: "INTERACTIVE", duration: "2-3 minutes", reward: 150, remaining: 1, maxPerDay: 1, color: "#FF2D55" }
  ]);

  // Streak state
  const [streakDays, setStreakDays] = useState<number>(5);
  const [streakMax] = useState<number>(7);
  const [streakMultiplier, setStreakMultiplier] = useState<number>(1);

  // Shop Items State (with Owned Status)
  const [shopItems, setShopItems] = useState([
    { id: 'shop-1', name: "Boost Kegel", description: "Force +20% pendant 24h", icon: "target", iconColor: "#00D9A5", price: 500, owned: false },
    { id: 'shop-2', name: "Respiration Alpha", description: "Technique Alpha Breath (Premium)", icon: "wind", iconColor: "#4A90D9", price: 800, owned: false },
    { id: 'shop-3', name: "Skin Gold", description: "Thème doré exclusif", icon: "palette", iconColor: "#FF2D55", price: 1200, owned: false },
    { id: 'shop-4', name: "Conseil IA", description: "1 recommandation personnalisée", icon: "message-circle", iconColor: "#00D9A5", price: 300, owned: false },
    { id: 'shop-5', name: "Passer niveau", description: "+1 niveau instantané", icon: "arrow-up-circle", iconColor: "#FFD700", price: 2000, owned: false }
  ]);

  // Earnings/Loss History state
  const [history, setHistory] = useState([
    { id: 'hist-1', type: 'ad_watch', title: "Pub courte visionnée", points: 10, timestamp: "14:32", icon: "play-circle", iconColor: "#00D9A5" },
    { id: 'hist-2', type: 'ad_watch', title: "Pub standard visionnée", points: 25, timestamp: "11:15", icon: "play-circle", iconColor: "#FFD700" },
    { id: 'hist-3', type: 'streak_bonus', title: "Bonus streak jour 5", points: 15, timestamp: "Hier", icon: "flame", iconColor: "#FFD700" },
    { id: 'hist-4', type: 'purchase', title: "Achat : Boost Kegel", points: -500, timestamp: "Hier", icon: "shopping-bag", iconColor: "#FF2D55" },
    { id: 'hist-5', type: 'ad_watch', title: "Pub courte visionnée", points: 10, timestamp: "Avant-hier", icon: "play-circle", iconColor: "#00D9A5" }
  ]);

  // Reset timer
  const [resetTimerStr, setResetTimerStr] = useState<string>('04:32:18');

  // Ad playing simulation overlay
  const [adPlaying, setAdPlaying] = useState<boolean>(false);
  const [currentPlayingAd, setCurrentPlayingAd] = useState<{ id: string, title: string, durationSec: number, reward: number } | null>(null);
  const [adCountdown, setAdCountdown] = useState<number>(0);
  const [canCloseAd, setCanCloseAd] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Countdown clock simulator ticks
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate ticking of reset clock
      setResetTimerStr(prev => {
        const parts = prev.split(':').map(Number);
        let h = parts[0], m = parts[1], s = parts[2];
        s--;
        if (s < 0) {
          s = 59;
          m--;
          if (m < 0) {
            m = 59;
            h--;
            if (h < 0) {
              h = 23;
            }
          }
        }
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ad playback simulation countdown
  useEffect(() => {
    let adInterval: NodeJS.Timeout;
    if (adPlaying && adCountdown > 0) {
      adInterval = setInterval(() => {
        setAdCountdown(prev => {
          if (prev <= 1) {
            setCanCloseAd(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(adInterval);
  }, [adPlaying, adCountdown]);

  // Click on offer to simulate playing ad
  const handleWatchAd = (offerId: string) => {
    if (adsWatchedToday >= dailyLimit) {
      addToast('error', `Limite quotidienne globale atteinte (${dailyLimit} pubs par jour). Revenez demain ! ⏳`);
      return;
    }

    const offer = adOffers.find(o => o.id === offerId);
    if (!offer) return;

    if (offer.remaining <= 0) {
      addToast('error', "Limite quotidienne atteinte pour cette offre de publicité.");
      return;
    }

    let durationSec = 15;
    if (offer.type === 'standard') durationSec = 30;
    if (offer.type === 'long') durationSec = 45; // simulate slightly shorter for better user testing
    if (offer.type === 'interactive') durationSec = 10; // short for testing speed but reward remains huge!

    setCurrentPlayingAd({
      id: offer.id,
      title: offer.title,
      durationSec,
      reward: offer.reward
    });
    setAdCountdown(durationSec);
    setCanCloseAd(false);
    setAdPlaying(true);
    addToast('info', `Chargement de la publicité : ${offer.title}...`);
  };

  // Skip or close ad reward logic
  const handleCloseAd = () => {
    if (!canCloseAd && adCountdown > 0) {
      addToast('warning', "Regarde la vidéo jusqu'au bout pour obtenir ton crédit de points.");
      return;
    }

    if (currentPlayingAd) {
      const reward = currentPlayingAd.reward;
      
      // Update balance
      setVitalityPoints(prev => prev + reward);
      setTodayEarnings(prev => prev + reward);
      setAdsWatchedToday(prev => prev + 1);

      // Decrement remaining count
      setAdOffers(prev => prev.map(off => {
        if (off.id === currentPlayingAd.id) {
          return { ...off, remaining: Math.max(0, off.remaining - 1) };
        }
        return off;
      }));

      // Add to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [
        {
          id: `hist-${Date.now()}`,
          type: 'ad_watch',
          title: `${currentPlayingAd.title} Visionnée`,
          points: reward,
          timestamp: timeStr,
          icon: "play-circle",
          iconColor: reward >= 60 ? "#4A90D9" : reward >= 25 ? "#FFD700" : "#00D9A5"
        },
        ...prev
      ]);

      // Check level progression up if threshold exceeded
      const currentProgressRatio = (vitalityPoints + reward) / pointsToNextLevel;
      if (vitalityPoints + reward >= pointsToNextLevel) {
        addToast('success', `Niveau supérieur atteint ! Tu passes Niveau ${currentLevel + 1} 🎉`);
        setCurrentLevel(prev => prev + 1);
        setLevelName(nextLevelName);
      } else {
        addToast('success', `Félicitations ! +${reward} POINTS Vitality crédités à ton solde. 🪙`);
      }
    }

    setAdPlaying(false);
    setCurrentPlayingAd(null);
  };

  // Buy Item in Shop
  const handleBuyItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.owned && item.id !== 'shop-5') {
      addToast('info', `Tu possèdes déjà le bonus : ${item.name}`);
      return;
    }

    if (vitalityPoints < item.price) {
      addToast('error', `Solde insuffisant. Il te manque ${item.price - vitalityPoints} points. Regarde d'autres vidéos ! 🪙`);
      return;
    }

    // Process Purchase
    setVitalityPoints(prev => prev - item.price);
    
    // Mark as owned (except Level Up which can be bought multiple times)
    if (item.id !== 'shop-5') {
      setShopItems(prev => prev.map(sh => sh.id === itemId ? { ...sh, owned: true } : sh));
    } else {
      // Level up bought!
      setCurrentLevel(prev => prev + 1);
      addToast('success', `NIVEAU SUPÉRIEUR ACHETÉ ! Tu es maintenant Niveau ${currentLevel + 1} 🚀`);
    }

    // Add transaction to history
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setHistory(prev => [
      {
        id: `hist-${Date.now()}`,
        type: 'purchase',
        title: `Achat : ${item.name}`,
        points: -item.price,
        timestamp: "En direct",
        icon: "shopping-bag",
        iconColor: "#FF2D55"
      },
      ...prev
    ]);

    addToast('success', `Bonus activé : ${item.name} ! -${item.price} PTS débités.`);
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
  Dimensions, 
  ActivityIndicator,
  Share
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3940256099942544/5224354917';

export default function AdRewardsScreen({ navigation }) {
  const [points, setPoints] = useState(2340);
  const [loading, setLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const rewardedRef = useRef(null);

  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdLoaded(true);
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        setPoints(p => p + reward.amount);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    );

    rewarded.load();
    rewardedRef.current = rewarded;

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const watchAd = () => {
    if (adLoaded && rewardedRef.current) {
      rewardedRef.current.show();
      setAdLoaded(false);
      rewardedRef.current.load();
    } else {
      alert("Publicité en cours de chargement. Veuillez réessayer.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>GAGNE DES POINTS</Text>
        <View style={styles.badgeSolde}>
          <Text style={styles.badgeText}>🪙 {points}</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>TON SOLDE VITALITY</Text>
          <Text style={styles.scoreText}>{points}</Text>
          <Text style={styles.pointsSub}>POINTS</Text>
        </View>
        
        <TouchableOpacity style={styles.watchBtn} onPress={watchAd}>
          <Text style={styles.btnText}>REGARDER UNE PUB (+25 PTS)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  title: { fontSize: 20, fontFamily: 'Montserrat-Bold', color: '#FFD700', fontWeight: 'bold' },
  scroll: { padding: 16 },
  mainCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, alignItems: 'center', borderColor: '#FFD700', borderWidth: 2 },
  scoreText: { fontSize: 64, fontWeight: 'bold', color: '#FFD700' },
  watchBtn: { backgroundColor: '#00D9A5', padding: 16, borderRadius: 16, marginTop: 24, alignItems: 'center' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source du module publicitaire AdRewards copié ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset counters for simulation purposes
  const handleSimulateReset = () => {
    setAdOffers([
      { id: 'off-1', type: 'short' as const, title: "PUB COURTE", duration: "15 secondes", reward: Math.round(pointsPerAd * 0.4), remaining: 5, maxPerDay: 5, color: "#00D9A5" },
      { id: 'off-2', type: 'standard' as const, title: "PUB STANDARD", duration: "30 secondes", reward: pointsPerAd, remaining: 3, maxPerDay: 3, color: "#FFD700" },
      { id: 'off-3', type: 'long' as const, title: "PUB LONGUE", duration: "60 secondes", reward: Math.round(pointsPerAd * 2.4), remaining: 1, maxPerDay: 1, color: "#4A90D9" },
      { id: 'off-4', type: 'interactive' as const, title: "INTERACTIVE", duration: "2-3 minutes", reward: Math.round(pointsPerAd * 6), remaining: 1, maxPerDay: 1, color: "#FF2D55" }
    ]);
    setAdsWatchedToday(0);
    addToast('success', "Toutes les offres publicitaires quotidiennes ont été réinitialisées ! 🔄");
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* HEADER SIMULATEUR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Modèle Économique F2P — AdRewards (5.2)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Génération Publicitaire et Marketplace — AdRewardsScreen
          </h2>
          <p className="text-xs text-gray-400">
            Regardez des annonces de sponsors ciblés de bien-être pour débloquer de l'énergie, de la testostérone ou des boosters de virilité.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour
            </AlphaButton>
          )}

          <button 
            onClick={handleSimulateReset}
            className="px-3 py-1.5 border border-dashed border-[#00D9A5]/30 hover:bg-[#00D9A5]/10 text-[#00D9A5] text-[10px] font-headline font-bold rounded-lg transition-all uppercase"
          >
            Réinitialiser Pubs ↻
          </button>

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
              <h4 className="text-xs font-headline font-black text-white">AdRewardsScreen.tsx (Expo + AdMob integration)</h4>
              <p className="text-[10px] text-gray-500">
                Gère les listeners d'évènements publicitaires, valide les jetons cryptographiques de récompense et recharge la cagnotte locale.
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
        
        {/* LEFT PANEL: QUICK INJECTOR */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              Injecteur de Points Vitalité
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Testez la réactivité du solde et les restrictions de la boutique en ajoutant directement des points de simulation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  setVitalityPoints(p => p + 100);
                  addToast('success', "+100 PTS Vitality simulés ! 🪙");
                }}
                className="py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all text-center"
              >
                +100 Points
              </button>
              <button 
                onClick={() => {
                  setVitalityPoints(p => p + 500);
                  addToast('success', "+500 PTS Vitality simulés ! 🪙");
                }}
                className="py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all text-center"
              >
                +500 Points
              </button>
              <button 
                onClick={() => {
                  setVitalityPoints(p => p + 1500);
                  addToast('success', "+1500 PTS Vitality simulés ! 🎉");
                }}
                className="py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all text-center col-span-2 text-yellow-400"
              >
                +1500 Points (Super Booster)
              </button>
            </div>

            <div className="bg-[#16213E] p-3.5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-headline text-gray-400 block uppercase">Diagnostics de Test</span>
              <p className="text-[11px] text-gray-300">
                Solde Actuel : <strong className="text-[#FFD700]">{vitalityPoints} PTS</strong>
              </p>
              <p className="text-[11px] text-gray-300">
                Niveau : <strong className="text-[#00D9A5]">{currentLevel} ({levelName})</strong>
              </p>
              <p className="text-[11px] text-gray-400 leading-snug">
                Les boutons d'achat dans la boutique deviendront automatiquement inactifs et grisés si votre solde est inférieur au coût indiqué.
              </p>
            </div>

            <button 
              onClick={() => {
                setVitalityPoints(50);
                addToast('warning', "Solde réinitialisé à 50 points pour tester les limites.");
              }}
              className="w-full py-2 bg-[#FF2D55]/10 border border-[#FF2D55]/25 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-bold transition-all"
            >
              Forcer un Solde Insuffisant (50 PTS)
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker & Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN INNER */}
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
              <div className="h-14 px-3 flex items-center justify-between border-b border-gray-950 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xs font-headline font-black tracking-widest text-[#FFD700] uppercase">
                  Gagne Des Points
                </h1>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setShowHowItWorks(true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                  {/* Balance badge */}
                  <div className="bg-[#16213E] border border-[#FFD700]/20 rounded-xl px-2.5 py-1.5 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]/10" />
                    <span className="text-[11px] font-mono font-black text-[#FFD700]">
                      {vitalityPoints.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC SCROLL VIEWER */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: SOLDE ACTUEL (CARD PRINCIPALE) */}
                <div className="bg-[#16213E] rounded-[24px] p-6 text-center border-2 border-[#FFD700] shadow-2xl relative overflow-hidden">
                  
                  {/* Glowing gold coins radial aura */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FFD700]/10 rounded-full blur-xl pointer-events-none" />

                  <span className="text-[10px] font-headline font-black text-[#8E8E93] tracking-[3px] block">
                    TON SOLDE VITALITY
                  </span>

                  {/* Solde digits */}
                  <div className="my-3 block relative">
                    <span className="text-5xl font-mono font-black text-[#FFD700] tracking-tighter drop-shadow-[0_0_20px_rgba(255,215,0,0.3)] block">
                      {vitalityPoints.toLocaleString()}
                    </span>
                  </div>

                  <span className="text-xs font-headline font-black tracking-wider block text-[#FFD700] uppercase">
                    POINTS DISPONIBLES
                  </span>

                  {/* Level label and progress slider */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-center">
                    <div className="flex justify-center items-center gap-1.5 text-xs font-headline text-[#8E8E93]">
                      <Shield className="w-3.5 h-3.5 text-[#00D9A5] fill-[#00D9A5]/10" />
                      <span>Niveau {currentLevel} — {levelName}</span>
                    </div>

                    <div className="w-48 h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden mx-auto">
                      <div className="h-full bg-[#FFD700] rounded-full" style={{ width: '65%' }} />
                    </div>

                    <span className="text-[9px] text-[#5A5A5A] font-headline block">
                      {vitalityPoints.toLocaleString()} / 3,600 pour {nextLevelName}
                    </span>
                  </div>

                  {/* Today earnings indicator */}
                  <div className="mt-4 inline-flex bg-[#00D9A5]/10 border border-[#00D9A5]/25 text-[#00D9A5] rounded-xl py-1 px-3 text-[11px] font-bold">
                    <span>↑ +{todayEarnings} pts aujourd'hui</span>
                  </div>
                </div>

                {/* SECTION 2: OFFRES PUBLICITAIRES (2 COLUMN GRID) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider">
                      Regarde et Gagne
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">
                      {adsWatchedToday} / {dailyLimit} aujourd'hui
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {adOffers.map((off) => {
                      const isLimitReached = adsWatchedToday >= dailyLimit;
                      return (
                        <div 
                          key={off.id}
                          onClick={() => {
                            if (isLimitReached) {
                              addToast('error', `Limite quotidienne atteinte (${dailyLimit} pubs par jour). Revenez demain ! ⏳`);
                              return;
                            }
                            handleWatchAd(off.id);
                          }}
                          className={`bg-[#16213E] rounded-2xl p-4 flex flex-col items-center justify-between h-[190px] border-t-3 hover:brightness-110 active:scale-95 transition-all text-center relative overflow-hidden ${
                            isLimitReached ? 'opacity-40 cursor-not-allowed select-none' : 'cursor-pointer'
                          }`}
                          style={{ borderTopColor: isLimitReached ? '#555' : off.color }}
                        >
                          {/* Play circle trigger icon */}
                          <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center mt-1">
                            {off.type === 'interactive' ? (
                              <MousePointer className="w-6 h-6" style={{ color: isLimitReached ? '#555' : off.color }} />
                            ) : (
                              <PlayCircle className="w-7 h-7" style={{ color: isLimitReached ? '#555' : off.color }} />
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-headline font-black text-white">{off.title}</h4>
                            <span className="text-[10px] text-[#8E8E93] font-headline">{off.duration}</span>
                          </div>

                          <span className="text-md font-mono font-black block" style={{ color: isLimitReached ? '#555' : off.color }}>
                            +{off.reward} PTS
                          </span>

                          <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 mt-1">
                            <span className="text-[9px] font-headline font-bold" style={{ color: isLimitReached ? '#555' : off.color }}>
                              {isLimitReached ? "LIMITE ATTEINTE" : `${off.remaining} restante${off.remaining > 1 ? 's' : ''}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time before reset */}
                  <div className="flex justify-center items-center gap-1.5 py-2 text-[11px] text-gray-500 font-headline">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Nouvelles offres dans {resetTimerStr}</span>
                  </div>
                </div>

                {/* SECTION 3: BONUS QUOTIDIEN (STREAK CIRCLE & SLIDER) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Bonus Quotidien
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 flex gap-4 items-center relative overflow-hidden">
                    
                    {streakDays === streakMax && (
                      <div className="absolute top-3 right-3 bg-[#FFD700] rounded px-1.5 py-0.5 animate-pulse">
                        <span className="text-[8px] font-headline font-black text-[#0F0F1A]">🔥 STREAK MAX</span>
                      </div>
                    )}

                    {/* Left 40% streak visual progress ring */}
                    <div className="w-1/3 flex flex-col items-center flex-shrink-0">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="4" />
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" stroke="#FFD700" strokeWidth="4" 
                            strokeDasharray={`${Math.round((streakDays / streakMax) * 100)} 100`} 
                          />
                        </svg>
                        <div className="absolute text-center flex flex-col leading-none">
                          <span className="text-lg font-mono font-black text-[#FFD700]">{streakDays}</span>
                          <span className="text-[8px] text-gray-500 font-headline uppercase font-bold mt-0.5">jours</span>
                        </div>
                      </div>
                    </div>

                    {/* Right 60% description */}
                    <div className="flex-1 text-left space-y-1.5">
                      <h4 className="text-xs font-headline font-black text-white flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]/10" />
                        Streak Publicité
                      </h4>
                      <p className="text-[11px] text-[#8E8E93] font-headline leading-tight">
                        Regarde au moins 1 pub par jour pour débloquer le multiplicateur de gains.
                      </p>
                      
                      <span className="text-[10px] text-[#00D9A5] font-headline font-black block">
                        Jour 6 : +15 pts bonus
                      </span>

                      {/* Little micro slider progress track */}
                      <div className="w-full h-1 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFD700] rounded-full" style={{ width: '71%' }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: MARKETPLACE (DÉPENSE TES POINTS) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider">
                      Dépense Tes Points
                    </h3>
                    <button 
                      onClick={() => addToast('info', "Chargement du catalogue complet du Shop VITALITY...")}
                      className="text-[10px] font-headline font-bold text-[#8E8E93] hover:text-white cursor-pointer"
                    >
                      VOIR TOUT LE SHOP →
                    </button>
                  </div>

                  {/* Horizontal Scroll bar container of items */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x custom-scrollbar">
                    {shopItems.map((item) => {
                      const canAfford = vitalityPoints >= item.price;
                      return (
                        <div 
                          key={item.id}
                          className="w-[150px] flex-shrink-0 bg-[#16213E] border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-[210px] text-center snap-start"
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            {/* Icon sphere */}
                            <div className="w-10 h-10 rounded-full bg-black/25 flex items-center justify-center">
                              {item.icon === 'target' && <Target className="w-5 h-5 text-[#00D9A5]" />}
                              {item.icon === 'wind' && <Wind className="w-5 h-5 text-[#4A90D9]" />}
                              {item.icon === 'palette' && <Palette className="w-5 h-5 text-[#FF2D55]" />}
                              {item.icon === 'message-circle' && <MessageSquare className="w-5 h-5 text-[#00D9A5]" />}
                              {item.icon === 'arrow-up-circle' && <ArrowUpCircle className="w-5 h-5 text-[#FFD700]" />}
                            </div>

                            <h4 className="text-xs font-headline font-black text-white leading-snug line-clamp-1">{item.name}</h4>
                            <p className="text-[9px] text-[#8E8E93] font-headline leading-tight line-clamp-2 h-6">{item.description}</p>
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-mono font-black text-[#FFD700] block">
                              {item.price} PTS
                            </span>

                            <button 
                              onClick={() => handleBuyItem(item.id)}
                              disabled={!canAfford && !item.owned}
                              className={`w-full py-1.5 rounded-lg text-[10px] font-headline font-black uppercase tracking-wider cursor-pointer transition-all
                                ${item.owned && item.id !== 'shop-5'
                                  ? 'bg-gray-800 text-gray-500 border border-gray-700/50' 
                                  : canAfford 
                                    ? 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A]' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }
                              `}
                            >
                              {item.owned && item.id !== 'shop-5' ? "OBTENU" : "ACHETER"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 5: HISTORIQUE DES GAINS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider">
                      Historique des gains
                    </h3>
                    <button 
                      onClick={() => addToast('info', "Chargement du registre complet des gains publicitaires...")}
                      className="text-[10px] font-headline font-bold text-[#8E8E93] hover:text-white cursor-pointer"
                    >
                      VOIR TOUT →
                    </button>
                  </div>

                  <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-2.5">
                    {history.slice(0, 5).map((hItem) => (
                      <div key={hItem.id} className="flex items-center justify-between py-1 border-b border-[#1A1A2E] last:border-0">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="w-7 h-7 rounded-lg bg-black/15 flex items-center justify-center">
                            {hItem.type === 'purchase' ? (
                              <ShoppingBag className="w-4 h-4 text-[#FF2D55]" />
                            ) : hItem.type === 'streak_bonus' ? (
                              <Flame className="w-4 h-4 text-[#FFD700]" />
                            ) : (
                              <PlayCircle className="w-4 h-4" style={{ color: hItem.iconColor }} />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-headline text-white block">{hItem.title}</span>
                            <span className="text-[9px] text-gray-500 font-headline block">{hItem.timestamp}</span>
                          </div>
                        </div>

                        <span className={`text-xs font-mono font-black ${hItem.points > 0 ? 'text-[#00D9A5]' : 'text-[#FF2D55]'}`}>
                          {hItem.points > 0 ? `+${hItem.points}` : hItem.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 6: UPGRADE PREMIUM (BANNER) */}
                <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#FFD700] to-[#FF9500] text-black overflow-hidden flex justify-between items-center text-left">
                  
                  {/* Absolute badge */}
                  <div className="absolute top-2 right-4 bg-[#FF2D55] text-white rounded px-2 py-0.5 rotate-[-3deg] shadow-md">
                    <span className="text-[7px] font-headline font-black">MEILLEURE OFFRE</span>
                  </div>

                  <div className="space-y-1.5 w-[65%]">
                    <h4 className="text-sm font-headline font-black tracking-wider">PASS PREMIUM</h4>
                    <p className="text-[11px] text-black/80 font-headline leading-tight">
                      Plus de pubs. Points x3. Accès illimité aux conseils et rituels anaboliques.
                    </p>
                    <span className="text-xs font-mono font-black block">99 DH/mois</span>
                  </div>

                  <button 
                    onClick={() => addToast('info', "Redirection vers la passerelle de paiement d'abonnement Premium...")}
                    className="bg-black hover:bg-black/90 text-[#FFD700] px-3.5 py-2.5 rounded-xl text-[10px] font-headline font-black uppercase tracking-wider cursor-pointer flex-shrink-0"
                  >
                    UPGRADE
                  </button>
                </div>

                <div className="h-10" />

              </div>

              {/* SIMULATED TAB BAR */}
              <div className="h-16 border-t border-gray-950 bg-[#16213E] flex items-center justify-around px-4 z-10 select-none">
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#FFD700] cursor-pointer">
                  <Coins className="w-5 h-5 text-[#FFD700] fill-[#FFD700]/10" />
                  <span className="text-[9px] font-headline text-[#FFD700]">Cadeaux</span>
                  <div className="w-1 h-1 bg-[#FFD700] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Vitalité</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* AD PLAYING OVERLAY SIMULATION */}
      {adPlaying && currentPlayingAd && (
        <div className="fixed inset-0 bg-black/95 flex flex-col justify-between p-6 z-50 animate-[fade-in_0.15s_ease-out]">
          
          {/* Header of ad player */}
          <div className="flex justify-between items-center text-xs font-headline">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D9A5] animate-ping" />
              <span className="text-gray-400">Diffusion Sponsorisée — <strong>{currentPlayingAd.title}</strong></span>
            </div>
            
            {canCloseAd ? (
              <button 
                onClick={handleCloseAd}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            ) : (
              <div className="bg-white/10 px-3 py-1.5 rounded-full text-white font-mono font-bold text-xs">
                Fermer dans {adCountdown}s
              </div>
            )}
          </div>

          {/* Core fake video viewport */}
          <div className="flex-1 my-8 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            
            {/* Visual design accent */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-sm z-10">
              <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto border border-[#FFD700]/20">
                <Sparkles className="w-8 h-8 text-[#FFD700] animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider block">SPONSOR ALIMENTATION ANABOLIQUE</span>
                <h3 className="text-lg font-headline font-black text-white mt-1">
                  ALPHA SHAKE CO.
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  "Une dose par jour couvre 100% de tes besoins en Zinc de haute qualité et en Vitamine D3 brute."
                </p>
              </div>

              {/* Progress bar inside video */}
              <div className="space-y-1 pt-4">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FFD700] transition-all duration-1000" 
                    style={{ width: `${((currentPlayingAd.durationSec - adCountdown) / currentPlayingAd.durationSec) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>{formatTime(currentPlayingAd.durationSec - adCountdown)}</span>
                  <span>{formatTime(currentPlayingAd.durationSec)}</span>
                </div>
              </div>
            </div>

            {/* Bottom notification */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 bg-black/40 border border-white/5 px-4 py-2.5 rounded-2xl text-xs font-headline">
              <Coins className="w-4 h-4 text-[#FFD700] fill-[#FFD700]/10" />
              <span>Gagne <strong>+{currentPlayingAd.reward} points Vitality</strong> à la fin du compte à rebours</span>
            </div>

          </div>

          {/* Action button inside ad */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                addToast('success', "Redirection vers l'offre partenaire dans un nouvel onglet ! 🛒");
                window.open("https://ai.studio/build", "_blank");
              }}
              className="w-full py-3.5 bg-gradient-to-r from-[#FFD700] to-[#FF9500] hover:brightness-110 text-black rounded-2xl text-xs font-headline font-black uppercase tracking-wider transition-all"
            >
              VISITER LE SITE PARTENAIRE
            </button>
            <p className="text-[10px] text-gray-500 text-center font-headline">
              Certains liens peuvent comporter des affiliations finançant la communauté de Vitalité ALPHA MAN.
            </p>
          </div>

        </div>
      )}

      {/* HOW IT WORKS MODAL */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-md font-headline font-black text-[#FFD700] uppercase tracking-wider">
                🪙 Comment ça marche ?
              </h3>
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="text-gray-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-headline">
              La version gratuite d'ALPHA MAN utilise des publicités discrètes et éducatives pour rester autonome et libre :
            </p>

            <ul className="space-y-2 text-xs text-gray-400 font-headline list-disc pl-4">
              <li>
                <strong className="text-white">Visionnez pour Gagner :</strong> Regardez de courtes publicités ciblées pour alimenter votre réserve de points de vitalité.
              </li>
              <li>
                <strong className="text-white">Boutique Exclusive :</strong> Échangez vos points contre des boosters temporaires de testostérone ou de virilité.
              </li>
              <li>
                <strong className="text-white">Conservez votre Streak :</strong> Regardez au moins une publicité quotidienne pour obtenir un multiplicateur x2.
              </li>
            </ul>

            <AlphaButton 
              variant="primary" 
              className="w-full h-10" 
              onClick={() => setShowHowItWorks(false)}
            >
              Compris, Chef
            </AlphaButton>
          </div>
        </div>
      )}

    </div>
  );
};
