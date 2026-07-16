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
  Plus,
  Users,
  MessageSquare,
  UserPlus,
  Trophy,
  Search,
  UsersRound
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface ClansScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const ClansScreen: React.FC<ClansScreenProps> = ({ addToast, onBack }) => {
  // Simulator state to allow toggling between "Has Clan" and "No Clan"
  const [hasClan, setHasClan] = useState<boolean>(true);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<string>('global');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);

  // Form states for creating a clan
  const [newClanName, setNewClanName] = useState<string>('');
  const [newClanTagline, setNewClanTagline] = useState<string>('');

  // Local Clan State
  const [myClan, setMyClan] = useState({
    id: 'clan-1',
    name: "WARRIOR SQUAD",
    tagline: "No excuses. Only results.",
    initials: "WS",
    color: "#00D9A5",
    membersCount: 12,
    maxMembers: 20,
    totalScore: 45230,
    averagePerMember: 3769,
    streakDays: 8,
    wins: 3,
    rank: 3,
    progressPercent: 88,
    myRole: 'Guerrier'
  });

  // Clan members list
  const [members, setMembers] = useState([
    { id: 'm-1', name: "AlphaY", initials: "AY", color: "bg-[#FFD700] text-black", role: "Leader", points: 5420, isMe: false, isLeader: true },
    { id: 'm-2', name: "Moi", initials: "ME", color: "bg-[#00D9A5] text-black", role: "Guerrier", points: 2340, isMe: true, isLeader: false },
    { id: 'm-3', name: "RedKing", initials: "RK", color: "bg-[#4A90D9] text-white", role: "Vétéran", points: 4180, isMe: false, isLeader: false },
    { id: 'm-4', name: "SteelSoul", initials: "SS", color: "bg-[#FF9500] text-white", role: "Recrue", points: 890, isMe: false, isLeader: false },
    { id: 'm-5', name: "DarkKnight", initials: "DK", color: "bg-[#FF2D55] text-white", role: "Recrue", points: 1200, isMe: false, isLeader: false }
  ]);

  // Global leaderboards state
  const leaderboardClans = [
    { rank: 1, name: "IRON LEGION", initials: "IR", color: "bg-[#FFD700] text-black", score: 52840, membersCount: 18, maxMembers: 20, medal: "🥇" },
    { rank: 2, name: "TITAN SQUAD", initials: "TS", color: "bg-gray-400 text-black", score: 48120, membersCount: 16, maxMembers: 20, medal: "🥈" },
    { rank: 3, name: "BLACK WOLVES", initials: "BW", color: "bg-[#CD7F32] text-black", score: 46890, membersCount: 14, maxMembers: 20, medal: "🥉" },
    { rank: 4, name: "WARRIOR SQUAD", initials: "WS", color: "bg-[#00D9A5] text-black", score: 45230, membersCount: 12, maxMembers: 20, isMyClan: true },
    { rank: 5, name: "SPARTAN PHALANX", initials: "SP", color: "bg-[#FF2D55] text-white", score: 41890, membersCount: 15, maxMembers: 20 },
    { rank: 6, name: "PHOENIX ASCENT", initials: "PA", color: "bg-[#FF9500] text-white", score: 39500, membersCount: 11, maxMembers: 20 },
    { rank: 7, name: "VULCAN FORCE", initials: "VF", color: "bg-[#4A90D9] text-white", score: 34100, membersCount: 10, maxMembers: 20 }
  ];

  // Active Clan Challenge
  const [activeChallenge, setActiveChallenge] = useState({
    id: 'ch-1',
    title: "Challenge : 10K Kegel",
    description: "Le clan qui cumule le plus de contractions Kegel cette semaine gagne +500 pts/clan.",
    target: 10000,
    current: 8420,
    rivalClan: "IRON LEGION",
    rivalScore: 7890,
    timeRemaining: "2j 14h",
    hasParticipated: false,
    leaderboard: [
      { rank: 1, clanName: "IRON LEGION", score: 8420 },
      { rank: 2, clanName: "TITAN SQUAD", score: 7890 },
      { rank: 3, clanName: "WARRIOR SQUAD", score: 7200 }
    ]
  });

  // Recommended clans recruiting
  const recommendedClans = [
    { id: 'rec-1', name: "TITAN SQUAD", initials: "TS", color: "bg-[#4A90D9]", membersCount: 16, maxMembers: 20, score: 48000 },
    { id: 'rec-2', name: "BLACK WOLVES", initials: "BW", color: "bg-[#FF9500]", membersCount: 14, maxMembers: 20, score: 46000 },
    { id: 'rec-3', name: "SPARTAN PHALANX", initials: "SP", color: "bg-[#FF2D55]", membersCount: 12, maxMembers: 20, score: 41000 }
  ];

  // Actions
  const handleParticipateInChallenge = () => {
    if (activeChallenge.hasParticipated) {
      addToast('info', "Tu as déjà soumis ton score aujourd'hui ! Continue à t'entraîner. ⚡");
      return;
    }
    setActiveChallenge(prev => ({
      ...prev,
      current: prev.current + 150,
      hasParticipated: true
    }));
    setMyClan(prev => ({
      ...prev,
      totalScore: prev.totalScore + 150
    }));
    addToast('success', "Participation enregistrée ! +150 contractions ajoutées au score du clan. 🏆");
  };

  const handleShareInvite = () => {
    const inviteText = `⚡ Rejoins mon clan "WARRIOR SQUAD" sur ALPHA MAN ! Utilise mon code d'invitation [WS-777] pour gagner +100 points à ton arrivée. No excuses, only results.`;
    if (navigator.share) {
      navigator.share({
        title: 'Rejoins mon clan ALPHA MAN',
        text: inviteText,
        url: window.location.href
      }).then(() => {
        addToast('success', "Lien d'invitation partagé ! 🚀");
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(inviteText);
      addToast('success', "Code d'invitation copié ! Transmets-le à tes frères d'armes. 📋");
    }
  };

  const handleCreateClan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClanName) {
      addToast('error', "Le nom du clan est obligatoire !");
      return;
    }
    setMyClan({
      id: `clan-${Date.now()}`,
      name: newClanName.toUpperCase(),
      tagline: newClanTagline || "No excuses. Only results.",
      initials: newClanName.substring(0, 2).toUpperCase(),
      color: "#00D9A5",
      membersCount: 1,
      maxMembers: 20,
      totalScore: 2340, // my own points
      averagePerMember: 2340,
      streakDays: 1,
      wins: 0,
      rank: 99,
      progressPercent: 10,
      myRole: 'Leader'
    });
    setMembers([
      { id: 'm-me', name: "Moi", initials: "ME", color: "bg-[#00D9A5] text-black", role: "Leader", points: 2340, isMe: true, isLeader: true }
    ]);
    setHasClan(true);
    setShowCreateModal(false);
    addToast('success', `Félicitations ! Le clan "${newClanName.toUpperCase()}" a été fondé. Recrute tes guerriers ! 🛡️`);
  };

  const handleRequestJoin = (clanName: string) => {
    addToast('info', `Demande d'intégration soumise au clan "${clanName}". En attente de validation du Leader... ⏳`);
    setTimeout(() => {
      setMyClan({
        id: `clan-joined`,
        name: clanName.toUpperCase(),
        tagline: "Prêt à en découdre.",
        initials: clanName.substring(0, 2).toUpperCase(),
        color: "#00D9A5",
        membersCount: 15,
        maxMembers: 20,
        totalScore: 48000 + 2340,
        averagePerMember: 3150,
        streakDays: 5,
        wins: 1,
        rank: 5,
        progressPercent: 65,
        myRole: 'Recrue'
      });
      setHasClan(true);
      addToast('success', `Félicitations ! Le Leader a accepté ta candidature. Bienvenue dans ${clanName.toUpperCase()} ! 🛡️`);
    }, 2000);
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
  FlatList 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ClansScreen({ navigation }) {
  const [hasClan, setHasClan] = useState(true);

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: 'Rejoins mon clan WARRIOR SQUAD sur ALPHA MAN ! Code d\\'invitation: [WS-777]'
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
        <Text style={styles.headerTitle}>CLANS</Text>
        <TouchableOpacity style={styles.touchTarget}>
          <Feather name="settings" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {hasClan ? (
          <View style={styles.clanCard}>
            <View style={styles.avatarWS}>
              <Text style={styles.avatarText}>WS</Text>
            </View>
            <Text style={styles.clanName}>WARRIOR SQUAD</Text>
            <Text style={styles.clanTagline}>No excuses. Only results.</Text>
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnGreen} onPress={handleShareInvite}>
                <Text style={styles.btnText}>INVITER</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noClanCard}>
            <Text style={styles.noClanTitle}>Tu n'as pas de clan</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#00D9A5', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  clanCard: { backgroundColor: '#16213E', padding: 24, borderRadius: 24, margin: 16, borderColor: '#00D9A5', borderWidth: 2 },
  avatarWS: { width: 56, height: 56, backgroundColor: '#00D9A5', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#0F0F1A' },
  clanName: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', marginTop: 16 },
  clanTagline: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnGreen: { backgroundColor: '#00D9A5', flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#0F0F1A', fontWeight: 'bold' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source du module des Clans copié ! 🛡️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-widest bg-[#00D9A5]/10 border border-[#00D9A5]/20 px-2 rounded-md">
            Gamification Sociale — Clans (5.3)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Système de Tribus et Ligues d'Élite — ClansScreen
          </h2>
          <p className="text-xs text-gray-400">
            Fondez votre clan ou rejoignez une fraternité d'armes pour gravir le classement mondial de la vitalité ALPHA.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour
            </AlphaButton>
          )}

          {/* SIMULATOR TOGGLE FOR CLAN MEMBER STATUS */}
          <button 
            onClick={() => {
              setHasClan(!hasClan);
              addToast('info', hasClan ? "Simulé : Statut sans clan. Mode recrutement activé." : "Simulé : Profil de membre WARRIOR SQUAD activé.");
            }}
            className="px-3 py-1.5 border border-dashed border-[#FF9500]/30 hover:bg-[#FF9500]/10 text-[#FF9500] text-[10px] font-headline font-bold rounded-lg transition-all uppercase"
          >
            {hasClan ? "Simuler Sans Clan" : "Simuler Avec mon Clan"}
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
              <h4 className="text-xs font-headline font-black text-white">ClansScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500">
                Gère le stockage persistant de la fraternité, les invitations directes et les sockets du chat de la légion.
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
        
        {/* LEFT PANEL: SIMULATOR ACTIONS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#00D9A5] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console d'Administration de Clan
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Modifiez instantanément les scores globaux et ajoutez ou supprimez des frères d'armes pour tester la réactivité.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Slide Clan Score */}
            {hasClan && (
              <div className="space-y-3 bg-black/10 p-3.5 rounded-2xl">
                <span className="text-[10px] font-headline text-gray-400 block uppercase">Warrior Squad Stats</span>
                
                {/* Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-headline">
                    <span className="text-gray-400">Score global du Clan</span>
                    <span className="text-[#00D9A5] font-black">{myClan.totalScore.toLocaleString()} PTS</span>
                  </div>
                  <input 
                    type="range" min="10000" max="60000" step="500" value={myClan.totalScore} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMyClan(prev => ({ 
                        ...prev, 
                        totalScore: val,
                        averagePerMember: Math.round(val / prev.membersCount)
                      }));
                    }}
                    className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Streak Days */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-headline">
                    <span className="text-gray-400">Série consécutive (Streak)</span>
                    <span className="text-[#FFD700] font-black">{myClan.streakDays} Jours</span>
                  </div>
                  <input 
                    type="range" min="1" max="30" value={myClan.streakDays} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMyClan(prev => ({ ...prev, streakDays: val }));
                    }}
                    className="w-full accent-[#FFD700] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Simulated chat notifications injector */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-headline uppercase block">Simuler Évènements Réseau</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => {
                    addToast('info', "Un nouveau message reçu dans le chat du Clan : [AlphaY]: 'Entraînement de groupe à 18:00 ! 🏋️‍♂️'");
                  }}
                  className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all text-center"
                >
                  Recevoir Message de Chat
                </button>
                <button 
                  onClick={() => {
                    addToast('success', "Un nouvel utilisateur réclame son intégration dans le clan !");
                  }}
                  className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all text-center"
                >
                  Candidature de Recrue En Attente
                </button>
              </div>
            </div>

            <div className="bg-[#16213E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-300 leading-snug">
              🛡️ <strong>Fraternité Active :</strong> Dans ALPHA MAN, faire partie d'une tribu décuple la motivation naturelle. Les notifications push et les rappels d'entraînement d'équipe forcent l'alignement sur le Code Alpha de Discipline brute.
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE SIMULATOR EMULATOR */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker & Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN VIEW */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* STATUS BAR */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>13:40</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#00D9A5] rounded-3xs" />
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
                <h1 className="text-sm font-headline font-black tracking-widest text-[#00D9A5] uppercase">
                  Clans
                </h1>
                <div className="flex items-center">
                  {!hasClan ? (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-[#00D9A5] hover:bg-white/5 active:bg-white/10"
                      title="Créer un clan"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => addToast('info', "Ouverture de l'administration et des configurations du Clan...")}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/5 active:bg-white/10"
                      title="Configuration du clan"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* CORE SCREEN SCROLL BAR CONTAINER */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: MON CLAN (SI MEMBRE) */}
                {hasClan ? (
                  <div className="bg-[#16213E] rounded-[24px] p-5 border-2 border-[#00D9A5] shadow-2xl relative overflow-hidden text-left">
                    
                    {/* Concentric glacier glow */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00D9A5]/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Rank label right-top absolute position */}
                    <div className="absolute top-4 right-4 text-right">
                      <span className="text-[8px] text-gray-400 font-headline uppercase block tracking-wider">RANG</span>
                      <span className="text-2xl font-mono font-black text-[#FFD700] block leading-none">#{myClan.rank}</span>
                    </div>

                    {/* Clan Header representation */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#00D9A5] rounded-2xl flex items-center justify-center text-[#0F0F1A] font-headline font-black text-xl shadow-lg">
                        {myClan.initials}
                      </div>

                      <div className="text-left space-y-0.5">
                        <h2 className="text-md font-headline font-black text-white">{myClan.name}</h2>
                        <p className="text-xs text-gray-400 font-headline italic">"{myClan.tagline}"</p>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-headline pt-1">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                          <span>{myClan.membersCount}/{myClan.maxMembers} membres</span>
                        </div>
                      </div>
                    </div>

                    {/* Clan statistics table row layout */}
                    <div className="grid grid-cols-4 gap-1 mt-5 pt-4 border-t border-white/5 text-center">
                      <div>
                        <span className="text-[8px] text-gray-500 font-headline block uppercase leading-none mb-1">Score Clan</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">{myClan.totalScore.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 font-headline block uppercase leading-none mb-1">Moyenne</span>
                        <span className="text-xs font-mono font-black text-[#00D9A5]">{myClan.averagePerMember.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 font-headline block uppercase leading-none mb-1">Série</span>
                        <span className="text-xs font-mono font-black text-[#FFD700]">{myClan.streakDays} jrs</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 font-headline block uppercase leading-none mb-1">Victoires</span>
                        <span className="text-xs font-mono font-black text-[#FFD700]">{myClan.wins}</span>
                      </div>
                    </div>

                    {/* Progress track comparison bar */}
                    <div className="space-y-1.5 mt-4 pt-3 border-t border-white/5">
                      <div className="flex justify-between items-center text-[10px] font-headline text-[#8E8E93]">
                        <span>Vers le top 1 — 12% de retard</span>
                        <span className="font-bold text-[#00D9A5]">88%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#00D9A5] rounded-full transition-all duration-1000" 
                          style={{ width: `${myClan.progressPercent}%` }} 
                        />
                      </div>
                    </div>

                    {/* Actions button group Row layout */}
                    <div className="flex gap-2.5 mt-5">
                      <button 
                        onClick={handleShareInvite}
                        className="flex-1 h-9 bg-[#00D9A5] hover:bg-[#00D9A5]/95 text-[#0F0F1A] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        INVITER
                      </button>
                      <button 
                        onClick={() => addToast('info', "Entrée dans le salon de chat privé de la Warrior Squad...")}
                        className="flex-1 h-9 bg-[#16213E] border border-gray-600 text-white rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer relative"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        CHAT
                        {/* Notification marker badge */}
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF2D55]" />
                      </button>
                      <button 
                        onClick={() => addToast('info', "Affichage des défis de clan hebdomadaires...")}
                        className="flex-1 h-9 bg-[#FFD700] hover:bg-[#FFD700]/95 text-[#0F0F1A] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        DÉFIS
                      </button>
                    </div>

                  </div>
                ) : (
                  // SECTION 5: REJOINDRE UN CLAN (SI PAS MEMBRE)
                  <div className="bg-[#16213E] rounded-[24px] p-5 border border-white/5 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-black/25 flex items-center justify-center mx-auto">
                      <UsersRound className="w-8 h-8 text-[#00D9A5]" />
                    </div>

                    <div>
                      <h3 className="text-md font-headline font-black text-white">Tu n'as pas encore de clan</h3>
                      <p className="text-xs text-gray-400 font-headline leading-relaxed mt-1">
                        Rejoins un clan pour t'entraider, te challenger et monter dans le classement mondial avec tes frères d'armes.
                      </p>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex-1 h-10 bg-[#00D9A5] hover:bg-[#00D9A5]/90 text-[#0F0F1A] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Créer un Clan
                      </button>
                      <button 
                        onClick={() => setShowJoinModal(true)}
                        className="flex-1 h-10 bg-transparent border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/5 rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                        Rejoindre
                      </button>
                    </div>

                    {/* Recommended Clans listing section below */}
                    <div className="pt-4 border-t border-white/5 text-left space-y-2.5">
                      <span className="text-[10px] font-headline font-black text-gray-500 uppercase tracking-widest block">
                        Clans qui recrutent
                      </span>

                      <div className="space-y-2">
                        {recommendedClans.map((clan) => (
                          <div key={clan.id} className="flex justify-between items-center py-1.5 border-b border-[#1A1A2E] last:border-0">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-headline font-black text-xs ${clan.color}`}>
                                {clan.initials}
                              </div>
                              <div>
                                <span className="text-xs font-headline font-black text-white block">{clan.name}</span>
                                <span className="text-[9px] font-headline text-gray-500">{clan.membersCount}/{clan.maxMembers} • Score {Math.round(clan.score / 1000)}K</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleRequestJoin(clan.name)}
                              className="px-3 py-1 bg-[#00D9A5]/10 hover:bg-[#00D9A5]/20 text-[#00D9A5] rounded-lg text-[9px] font-headline font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                              REJOINDRE
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* SECTION 2: MEMBRES DU CLAN (HORIZONTAL SCROLL) */}
                {hasClan && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider">
                        Tes Frères d'Armes
                      </h3>
                      <button 
                        onClick={() => addToast('info', "Chargement de la liste complète des membres de la Warrior Squad...")}
                        className="text-[10px] font-headline font-bold text-[#8E8E93] hover:text-white cursor-pointer"
                      >
                        VOIR TOUS (12) →
                      </button>
                    </div>

                    {/* Horizontal slider member cards */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x custom-scrollbar">
                      {members.map((member) => (
                        <div 
                          key={member.id}
                          className="w-[100px] flex-shrink-0 bg-[#16213E] rounded-2xl p-3 flex flex-col justify-between items-center h-[145px] text-center snap-start relative border border-white/5"
                        >
                          {/* Crown badge absolute for leader */}
                          {member.isLeader && (
                            <div className="absolute -top-1 -right-1 bg-[#FFD700] text-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg" title="Leader du Clan">
                              👑
                            </div>
                          )}

                          {member.isMe && (
                            <div className="absolute bottom-11 right-2 bg-black border border-[#00D9A5]/40 rounded py-0.5 px-1 text-[7px] font-black text-[#00D9A5]">
                              MOI
                            </div>
                          )}

                          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-headline font-black text-xs ${member.color}`}>
                            {member.initials}
                          </div>

                          <div className="space-y-0.5 mt-2 text-center w-full">
                            <span className={`text-[11px] font-headline font-black block truncate px-1 ${member.isMe ? 'text-[#00D9A5]' : 'text-white'}`}>
                              {member.name}
                            </span>
                            <span className="text-[9px] text-gray-400 font-headline block leading-none">{member.role}</span>
                          </div>

                          <span className="text-[9px] font-mono font-bold text-gray-500 mt-2 block leading-none">
                            {member.points.toLocaleString()} pts
                          </span>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: DÉFIS CLAN ACTIFS */}
                {hasClan && activeChallenge && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                      Défis En Cours
                    </h3>

                    <div className="bg-[#16213E] rounded-2xl p-5 border-l-3 border-[#FFD700] space-y-4 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="text-[#FFD700] w-5 h-5 flex-shrink-0" />
                          <h4 className="text-xs font-headline font-black text-white leading-snug">{activeChallenge.title}</h4>
                        </div>
                        <div className="bg-[#FF2D55]/10 border border-[#FF2D55]/20 rounded-lg px-2 py-0.5 text-right flex-shrink-0">
                          <span className="text-[9px] font-mono font-black text-[#FF2D55] block">{activeChallenge.timeRemaining}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#8E8E93] font-headline leading-tight">
                        {activeChallenge.description}
                      </p>

                      {/* Comparative slider progress visual bar */}
                      <div className="space-y-2 bg-black/10 p-3 rounded-xl border border-white/5">
                        
                        {/* Our progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-headline font-bold text-[#00D9A5]">
                            <span>WARRIOR SQUAD (Nous)</span>
                            <span>{activeChallenge.current.toLocaleString()} / 10,000</span>
                          </div>
                          <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden relative">
                            {/* Notre barre */}
                            <div className="h-full bg-[#00D9A5] rounded-full transition-all duration-500" style={{ width: `${(activeChallenge.current / activeChallenge.target) * 100}%` }} />
                          </div>
                        </div>

                        {/* Rival progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-headline font-bold text-[#FF2D55]">
                            <span>Rival : {activeChallenge.rivalClan}</span>
                            <span>{activeChallenge.rivalScore.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden relative">
                            {/* Barre rival */}
                            <div className="h-full bg-[#FF2D55] rounded-full transition-all duration-500" style={{ width: `${(activeChallenge.rivalScore / activeChallenge.target) * 100}%` }} />
                          </div>
                        </div>

                      </div>

                      {/* Leaderboard inside challenge */}
                      <div className="grid grid-cols-3 gap-1 pt-2 text-center text-[10px] font-headline">
                        {activeChallenge.leaderboard.map((item, idx) => (
                          <div key={idx} className="bg-black/10 p-1.5 rounded-lg border border-white/5">
                            <span className="text-gray-500 block leading-none uppercase text-[8px]">#{idx + 1} Clan</span>
                            <span className="font-bold text-white block truncate mt-1">{item.clanName}</span>
                            <span className="font-mono text-[9px] text-[#FFD700] block mt-0.5">{item.score.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Participation CTA button */}
                      <button 
                        onClick={handleParticipateInChallenge}
                        disabled={activeChallenge.hasParticipated}
                        className={`w-full h-10 rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5
                          ${activeChallenge.hasParticipated 
                            ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' 
                            : 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A]'
                          }
                        `}
                      >
                        <Trophy className="w-4 h-4" />
                        {activeChallenge.hasParticipated ? "PARTICIPATION EXPÉDIÉE" : "PARTICIPER (+150 PTS)"}
                      </button>

                    </div>
                  </div>
                )}

                {/* SECTION 3: CLASSEMENT DES CLANS (LEADERBOARD) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Classement Mondial
                  </h3>

                  {/* Tab switchers */}
                  <div className="flex gap-1 overflow-x-auto pb-1.5 custom-scrollbar select-none">
                    {[
                      { id: 'global', label: "Global" },
                      { id: 'morocco', label: "Maroc" },
                      { id: 'week', label: "Semaine" },
                      { id: 'month', label: "Mois" }
                    ].map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => {
                          setActiveLeaderboardTab(tab.id);
                          addToast('info', `Filtre classement clan : ${tab.label}`);
                        }}
                        className={`py-1.5 px-4 rounded-full text-[11px] font-headline font-bold border transition-all cursor-pointer whitespace-nowrap
                          ${activeLeaderboardTab === tab.id 
                            ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                            : 'border-white/10 text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Leaderboard vertically loaded items */}
                  <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-2.5">
                    {leaderboardClans.map((clan, idx) => {
                      const isThird = clan.rank === 3;
                      const isMyHighlight = clan.isMyClan && hasClan;

                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border border-transparent transition-all relative
                            ${isMyHighlight ? 'bg-[#00D9A5]/5 border-[#00D9A5]/25' : ''}
                            ${clan.medal ? 'bg-black/10' : ''}
                          `}
                        >
                          <div className="flex items-center gap-2.5 text-left">
                            
                            {/* Medal indicator or digit rank */}
                            <span className="w-6 font-mono font-black text-sm text-gray-400 text-center">
                              {clan.medal ? clan.medal : clan.rank}
                            </span>

                            {/* Clan avatar icon */}
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-headline font-black text-xs ${clan.color}`}>
                              {clan.initials}
                            </div>

                            <div className="text-left">
                              <span className={`text-xs font-headline font-black block ${isMyHighlight ? 'text-[#00D9A5]' : 'text-white'}`}>
                                {clan.name} {isMyHighlight && "(Ton Clan)"}
                              </span>
                              <span className="text-[9px] text-gray-500 font-headline block leading-tight">{clan.membersCount}/{clan.maxMembers} Guerriers</span>
                            </div>

                          </div>

                          <span className={`text-xs font-mono font-black ${isMyHighlight ? 'text-[#00D9A5]' : 'text-white'}`}>
                            {clan.score.toLocaleString()} PTS
                          </span>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 6: CONSEIL CLAN */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#00D9A5] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <Users className="w-5 h-5 text-[#00D9A5] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Les Alphas en clan progressent 3x plus vite que les solitaires. La responsabilité envers tes frères est le meilleur moteur de discipline brute.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Règle #3 du Code Alpha d'Honneur
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
                <div className="flex flex-col items-center gap-1 text-[#00D9A5] cursor-pointer">
                  <Users className="w-5 h-5 text-[#00D9A5]" />
                  <span className="text-[9px] font-headline text-[#00D9A5]">Clans</span>
                  <div className="w-1 h-1 bg-[#00D9A5] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Trophy className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Vitalité</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* CREATE CLAN MODAL SCREEN */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-md font-headline font-black text-[#00D9A5] uppercase tracking-wider">
                🛡️ Fonder ma Tribu d'Armes
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateClan} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-headline text-gray-400 uppercase">Nom de mon Clan (Ex: Spartans, Iron Wolves)</label>
                <input 
                  type="text" 
                  value={newClanName}
                  onChange={(e) => setNewClanName(e.target.value)}
                  placeholder="Saisissez le nom ici..."
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00D9A5]"
                  maxLength={20}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-headline text-gray-400 uppercase">Devise ou Slogan du Clan</label>
                <input 
                  type="text" 
                  value={newClanTagline}
                  onChange={(e) => setNewClanTagline(e.target.value)}
                  placeholder="Ex: No pain no gain / Discipline ou défaite..."
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00D9A5]"
                  maxLength={40}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full h-11 bg-[#00D9A5] hover:bg-[#00D9A5]/90 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all"
                >
                  FONDER LE CLAN ACTUEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN CLAN MODAL SEARCH */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-md font-headline font-black text-[#FFD700] uppercase tracking-wider">
                🔍 Rechercher et Rejoindre une Fraternité
              </h3>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-400 font-headline leading-relaxed">
              Saisissez un code d'invitation secret à 6 chiffres ou cherchez le nom d'un clan pour postuler auprès du Leader.
            </p>

            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Ex: WS-777 ou TITAN..."
                className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD700]"
              />

              <button 
                onClick={() => {
                  setShowJoinModal(false);
                  handleRequestJoin("TITAN SQUAD");
                }}
                className="w-full h-11 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all"
              >
                RECHERCHER ET CANDIDATER
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
