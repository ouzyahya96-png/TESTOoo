import React, { useState } from 'react';
import { 
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Trophy,
  Award,
  ChevronRight,
  Sparkles,
  BarChart2,
  Copy,
  Code,
  Settings,
  X,
  Info,
  ExternalLink
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface LeaderboardScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ addToast, onBack }) => {
  // Simulator state
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('global');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  
  // My Rank & Points State (Interactive)
  const [myRank, setMyRank] = useState<number>(247);
  const [myPoints, setMyPoints] = useState<number>(2340);
  const [myTrend, setMyTrend] = useState<number>(3);
  const [pointsToNextMilestone, setPointsToNextMilestone] = useState<number>(1860);
  const [progressPercent, setProgressPercent] = useState<number>(56);

  // Filter tabs definition
  const filters = [
    { id: 'global', name: "🌍 Global" },
    { id: 'morocco', name: "🇲🇦 Maroc" },
    { id: 'clan', name: "⚔️ Mon Clan" },
    { id: 'week', name: "📅 Semaine" },
    { id: 'month', name: "📆 Mois" },
    { id: 'friends', name: "👥 Amis" }
  ];

  // Podium Users Database (Mock API output based on activeFilter)
  const getPodiumData = () => {
    switch(activeFilter) {
      case 'clan':
        return [
          { rank: 2, userId: 'u-clan-2', name: "RedFist", initials: "RF", color: "#C0C0C0", points: 8420, level: 8, levelName: "Gladiator" },
          { rank: 1, userId: 'u-clan-1', name: "BerserkAlpha", initials: "BA", color: "#FFD700", points: 10450, level: 9, levelName: "Champion" },
          { rank: 3, userId: 'u-clan-3', name: "ShieldBro", initials: "SB", color: "#CD7F32", points: 7120, level: 7, levelName: "Warrior" }
        ];
      case 'morocco':
        return [
          { rank: 2, userId: 'u-mar-2', name: "AtlasGuerrier", initials: "AG", color: "#C0C0C0", points: 11200, level: 9, levelName: "Champion" },
          { rank: 1, userId: 'u-mar-1', name: "MarocAlpha", initials: "MA", color: "#FFD700", points: 15600, level: 10, levelName: "ALPHA" },
          { rank: 3, userId: 'u-mar-3', name: "RifLion", initials: "RL", color: "#CD7F32", points: 9890, level: 8, levelName: "Gladiator" }
        ];
      default:
        return [
          { rank: 2, userId: 'u-2', name: "TitanSoul", initials: "TS", color: "#C0C0C0", points: 12840, level: 9, levelName: "Champion" },
          { rank: 1, userId: 'u-1', name: "AlphaX", initials: "AX", color: "#FFD700", points: 18420, level: 10, levelName: "ALPHA" },
          { rank: 3, userId: 'u-3', name: "IronRage", initials: "IR", color: "#CD7F32", points: 11230, level: 9, levelName: "Champion" }
        ];
    }
  };

  // Main List database (Ranks 4-10)
  const [leaderboardList, setLeaderboardList] = useState([
    { rank: 4, userId: 'u-4', name: "DarkKnight", initials: "DK", color: "#FF2D55", points: 9840, level: 8, levelName: "Gladiator", trend: 2, isMe: false },
    { rank: 5, userId: 'u-5', name: "ZenPulse", initials: "ZP", color: "#00D9A5", points: 8900, level: 8, levelName: "Gladiator", trend: -1, isMe: false },
    { rank: 6, userId: 'u-6', name: "ShadowHunter", initials: "SH", color: "#4A90D9", points: 7530, level: 7, levelName: "Warrior", trend: 0, isMe: false },
    { rank: 7, userId: 'u-7', name: "VikingCold", initials: "VC", color: "#5A5A5A", points: 6420, level: 7, levelName: "Warrior", trend: 4, isMe: false },
    { rank: 8, userId: 'u-8', name: "SunDiscipline", initials: "SD", color: "#FFD700", points: 5120, level: 6, levelName: "Adept", trend: -2, isMe: false },
    { rank: 9, userId: 'u-9', name: "KegelKing", initials: "KK", color: "#FF9500", points: 4320, level: 6, levelName: "Adept", trend: 1, isMe: false },
    { rank: 10, userId: 'u-10', name: "SlayerAlpha", initials: "SA", color: "#8E8E93", points: 4200, level: 6, levelName: "Adept", trend: 0, isMe: false }
  ]);

  // Loaded page indicator for load more simulation
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Global Statistics
  const stats = {
    totalUsers: 12847,
    averagePoints: 3420,
    topScore: 18420,
    averageLevel: 5.2
  };

  // User details simulation interaction
  const handleSelectUser = (name: string, score: number) => {
    addToast('info', `Ouverture du profil de "${name}" (${score.toLocaleString()} PTS). Envoi d'un signal de fraternité d'acier... 🛡️`);
  };

  const handleLoadMore = () => {
    if (page >= 3) {
      setHasMore(false);
      addToast('warning', "Tous les Alphas classés ont été chargés.");
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);

    // Append some mock users for simulation
    const additionalUsers = [
      { rank: 11, userId: `u-11`, name: "GuerrierLoup", initials: "GL", color: "#C0C0C0", points: 3950, level: 5, levelName: "Adept", trend: 2, isMe: false },
      { rank: 12, userId: `u-12`, name: "SamouraiSain", initials: "SS", color: "#CD7F32", points: 3820, level: 5, levelName: "Adept", trend: -1, isMe: false },
      { rank: 13, userId: `u-13`, name: "ColdDigger", initials: "CD", color: "#00D9A5", points: 3510, level: 5, levelName: "Adept", trend: 5, isMe: false }
    ];
    
    setLeaderboardList(prev => [...prev, ...additionalUsers]);
    addToast('success', "Page 2 du classement chargée avec succès ! 👥");
  };

  const handleSimulateDisciplineAction = () => {
    // Perform simulated activity to move up
    setMyPoints(prev => prev + 250);
    setMyRank(prev => Math.max(1, prev - 12));
    setMyTrend(prev => prev + 5);
    setPointsToNextMilestone(prev => Math.max(0, prev - 250));
    setProgressPercent(prev => Math.min(100, Math.round(((myPoints + 250) / 4200) * 100)));
    addToast('success', "Discipline validée ! +250 PTS accumulés. Tu gagnes 12 places au classement mondial ! 🚀");
  };

  const handleSwitchFilter = (filterId: string) => {
    setActiveFilter(filterId);
    setPage(1);
    setHasMore(true);
    addToast('info', `Mise à jour du classement : filtre "${filterId}" appliqué.`);
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
  FlatList, 
  Dimensions 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function LeaderboardScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('global');
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.touchTarget} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CLASSEMENT</Text>
        <TouchableOpacity style={styles.touchTarget}>
          <Feather name="filter" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* MON CLASSEMENT (CARD PRINCIPALE) */}
        <View style={styles.myRankCard}>
          <View style={styles.rankRow}>
            <View>
              <Text style={styles.rankNum}>#247</Text>
              <Text style={styles.rankLabel}>MON RANG</Text>
            </View>
            <View style={styles.separator} />
            <View style={{ flex: 1 }}>
              <Text style={styles.myName}>Moi</Text>
              <Text style={styles.myLevel}>Niv. 7 Warrior</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.myPoints}>2,340</Text>
              <Text style={styles.pointsLabel}>PTS</Text>
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
  myRankCard: { backgroundColor: '#16213E', padding: 24, borderRadius: 24, margin: 16, borderColor: '#00D9A5', borderWidth: 2 },
  rankRow: { flexDirection: 'row', alignItems: 'center' },
  rankNum: { fontSize: 36, fontWeight: 'bold', color: '#00D9A5' },
  rankLabel: { fontSize: 10, color: '#8E8E93' },
  separator: { width: 1, height: 60, backgroundColor: '#1A1A2E', marginHorizontal: 16 },
  myName: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
  myLevel: { fontSize: 11, color: '#8E8E93' },
  myPoints: { fontSize: 20, fontWeight: 'bold', color: '#FFD700' },
  pointsLabel: { fontSize: 10, color: '#8E8E93' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source du classement de discipline copié ! 📊");
    setTimeout(() => setCopied(false), 2000);
  };

  const podium = getPodiumData();

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Arène de Compétition — Classement (5.6)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Moteur de Leaderboard de Discipline — LeaderboardScreen
          </h2>
          <p className="text-xs text-gray-400">
            Compare en temps réel les scores de vitalité des utilisateurs du Maroc et du monde pour stimuler la saine rivalité.
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
              <h4 className="text-xs font-headline font-black text-white">LeaderboardScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500">
                Implémente la structure de pagination, le tri dynamique par géolocalisation ou clan, et l'interface de podium adaptative.
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
        
        {/* LEFT PANEL: ADMIN CONTROLS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console d'Arène de Discipline
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Générez des points et observez le mouvement du guerrier dans la hiérarchie.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Action simulation trigger */}
            <div className="space-y-2">
              <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                Actions Interactives
              </span>
              <button 
                onClick={handleSimulateDisciplineAction}
                className="w-full py-2.5 px-3 bg-[#00D9A5]/10 border border-[#00D9A5]/25 hover:bg-[#00D9A5]/20 text-[#00D9A5] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                Valider Rituel d'Acier (+250 PTS)
              </button>
            </div>

            {/* Simulated ranks modifiers */}
            <div className="space-y-3 pt-2 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Position actuelle</span>
                <span className="text-[#FFD700] font-mono font-bold">Rang #{myRank}</span>
              </div>
              <input 
                type="range" min="1" max="500" value={myRank} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMyRank(val);
                  setPointsToNextMilestone(Math.max(100, 4200 - (val * 10)));
                }}
                className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Explanation box */}
            <div className="bg-[#1A1A2E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-300 leading-snug">
              🎖️ <strong>La saine émulation :</strong> Le code d'honneur ALPHA MAN encourage la lutte contre soi-même. Ce tableau d'arène offre l'énergie collective indispensable pour briser les paliers de flemme.
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE SIMULATOR PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN CONTAINER */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* StatusBar status indicators */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>13:53</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#FFD700] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER CONTAINER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-950 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xs font-headline font-black tracking-widest text-[#FFD700] uppercase">
                  Classement
                </h1>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => {
                      setShowFilterModal(true);
                      addToast('info', "Ouverture des options de filtrage de ligue...");
                    }}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-400"
                  >
                    <Filter className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* SCROLLABLE AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: MON CLASSEMENT (CARD PRINCIPALE) */}
                <div className="bg-[#16213E] rounded-[24px] p-5 border-2 border-[#00D9A5] shadow-2xl space-y-4 text-left">
                  
                  <div className="flex items-center justify-between">
                    {/* Left: Position Rank */}
                    <div className="text-left">
                      <span className="text-3xl font-mono font-black text-[#00D9A5] block">#{myRank}</span>
                      <span className="text-[9px] font-headline font-black text-gray-400 tracking-wider uppercase block">MON RANG</span>
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px h-10 bg-gray-800" />

                    {/* Middle: Name & Level */}
                    <div className="flex items-center gap-2.5 flex-1 px-3">
                      <div className="w-9 h-9 rounded-full bg-[#00D9A5] flex items-center justify-center font-headline font-black text-xs text-[#0F0F1A] flex-shrink-0">
                        ME
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className="text-xs font-headline font-black text-white block">Moi</span>
                        <span className="text-[10px] text-gray-400 font-headline block">Niv. 7 Warrior</span>
                      </div>
                    </div>

                    {/* Right: Points & Trend */}
                    <div className="text-right space-y-0.5">
                      <span className="text-sm font-mono font-black text-[#FFD700] block">{myPoints.toLocaleString()}</span>
                      <span className="text-[8px] font-headline text-gray-400 uppercase tracking-wider block">PTS</span>
                      <span className="text-[10px] text-[#00D9A5] font-headline font-bold flex items-center gap-0.5 justify-end">
                        <TrendingUp className="w-3 h-3" />
                        ↑ {myTrend}
                      </span>
                    </div>
                  </div>

                  {/* Target progression towards Top 100 */}
                  <div className="pt-2 border-t border-white/5 text-left space-y-1">
                    <span className="text-[10px] font-headline text-gray-400 block">
                      Top 100 à 4,200 pts — il te manque <strong className="text-white">{pointsToNextMilestone.toLocaleString()}</strong>
                    </span>
                    {/* Progress track */}
                    <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00D9A5] rounded-full transition-all duration-700" 
                        style={{ width: `${progressPercent}%` }} 
                      />
                    </div>
                  </div>

                  {/* Button simulation */}
                  <button 
                    onClick={handleSimulateDisciplineAction}
                    className="w-full h-9 bg-[#FFD700] hover:bg-[#FFD700]/95 text-[#0F0F1A] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" />
                    MONTER DANS LE CLASSEMENT
                  </button>

                </div>

                {/* SECTION 2: FILTRES (TABS) */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar text-left">
                  {filters.map((f) => (
                    <button 
                      key={f.id}
                      onClick={() => handleSwitchFilter(f.id)}
                      className={`py-2 px-4 rounded-full text-[10px] font-headline font-black uppercase tracking-wider border transition-all cursor-pointer flex-shrink-0
                        ${activeFilter === f.id 
                          ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                          : 'border-white/10 text-gray-400 hover:border-gray-700'
                        }
                      `}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                {/* SECTION 3: PODIUM (TOP 3) */}
                <div className="flex items-end justify-center h-[210px] pt-4 mb-4 border-b border-white/5 pb-2">
                  
                  {/* Rank 2 - Left */}
                  <div className="w-[100px] flex flex-col items-center">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-black/30 border-[3px] border-[#C0C0C0] flex items-center justify-center font-headline font-black text-sm text-white shadow-lg">
                        {podium[0]?.initials}
                      </div>
                      <span className="absolute -top-2 -right-2 text-xl">🥈</span>
                    </div>
                    
                    <span className="text-[11px] font-headline font-black text-white mt-2 block truncate w-[85px] text-center">
                      {podium[0]?.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#C0C0C0]">
                      {podium[0]?.points.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-gray-500 font-headline">
                      Niv. {podium[0]?.level}
                    </span>

                    {/* Pedestal */}
                    <div className="w-20 h-16 bg-[#C0C0C0]/20 rounded-t-lg mt-3 flex items-center justify-center text-xs font-mono font-black text-[#C0C0C0]">
                      2
                    </div>
                  </div>

                  {/* Rank 1 - Center */}
                  <div className="w-[120px] flex flex-col items-center z-10 mx-2">
                    <div className="relative">
                      {/* crown absolutely centered top */}
                      <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">👑</span>
                      <div className="w-16 h-16 rounded-full bg-black/30 border-4 border-[#FFD700] flex items-center justify-center font-headline font-black text-lg text-white shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                        {podium[1]?.initials}
                      </div>
                      <span className="absolute -top-1 -right-1 text-xl">🥇</span>
                    </div>

                    <span className="text-[12px] font-headline font-black text-[#FFD700] mt-2 block truncate w-[105px] text-center">
                      {podium[1]?.name}
                    </span>
                    <span className="text-xs font-mono font-black text-[#FFD700]">
                      {podium[1]?.points.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#FFD700] font-headline font-black">
                      Niv. {podium[1]?.level} ALPHA
                    </span>

                    {/* Highest Pedestal */}
                    <div className="w-24 h-24 bg-gradient-to-t from-[#FF9500]/30 to-[#FFD700]/30 rounded-t-xl mt-3 flex flex-col items-center justify-center text-sm font-mono font-black text-[#FFD700] shadow-md border-t border-[#FFD700]/20">
                      1
                    </div>
                  </div>

                  {/* Rank 3 - Right */}
                  <div className="w-[100px] flex flex-col items-center">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-black/30 border-[3px] border-[#CD7F32] flex items-center justify-center font-headline font-black text-sm text-white shadow-lg">
                        {podium[2]?.initials}
                      </div>
                      <span className="absolute -top-2 -right-2 text-xl">🥉</span>
                    </div>

                    <span className="text-[11px] font-headline font-black text-white mt-2 block truncate w-[85px] text-center">
                      {podium[2]?.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#CD7F32]">
                      {podium[2]?.points.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-gray-500 font-headline">
                      Niv. {podium[2]?.level}
                    </span>

                    {/* Pedestal */}
                    <div className="w-20 h-10 bg-[#CD7F32]/25 rounded-t-lg mt-3 flex items-center justify-center text-xs font-mono font-black text-[#CD7F32]">
                      3
                    </div>
                  </div>

                </div>

                {/* SECTION 4: CLASSEMENT COMPLET (TOP 4-100+) */}
                <div className="space-y-1">
                  <h3 className="text-[11px] font-headline font-black text-gray-500 uppercase tracking-widest px-2 mb-2 text-left">
                    CLASSEMENT GÉNÉRAL
                  </h3>

                  <div className="divide-y divide-gray-950">
                    {leaderboardList.map((user) => (
                      <div 
                        key={user.userId}
                        onClick={() => handleSelectUser(user.name, user.points)}
                        className="h-14 flex items-center justify-between hover:bg-white/2 cursor-pointer px-2 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank Number */}
                          <span className="w-6 font-mono font-black text-xs text-gray-600 text-center">
                            {user.rank}
                          </span>

                          {/* Avatar representation bubble */}
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-headline font-black text-white"
                            style={{ backgroundColor: `${user.color}35`, border: `1.5px solid ${user.color}` }}
                          >
                            {user.initials}
                          </div>

                          {/* Detail text */}
                          <div className="text-left space-y-0.5">
                            <span className="text-xs font-headline font-black text-white block">
                              {user.name}
                            </span>
                            <span className="text-[9px] text-gray-500 font-headline block">
                              {user.levelName} (Niv. {user.level})
                            </span>
                          </div>
                        </div>

                        {/* Points & trend block */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-white block">
                              {user.points.toLocaleString()}
                            </span>
                            <span className="text-[8px] text-gray-500 block uppercase tracking-wider">PTS</span>
                          </div>

                          {/* trend badge */}
                          <span className={`text-[10px] font-headline font-bold flex items-center gap-0.5 w-8 justify-end
                            ${user.trend > 0 ? 'text-[#00D9A5]' : ''}
                            ${user.trend < 0 ? 'text-[#FF2D55]' : ''}
                            ${user.trend === 0 ? 'text-gray-600' : ''}
                          `}>
                            {user.trend > 0 && `↑ ${user.trend}`}
                            {user.trend < 0 && `↓ ${Math.abs(user.trend)}`}
                            {user.trend === 0 && `—`}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* simulated gap spacer for my rank if not listed */}
                  {myRank > 10 && (
                    <div className="space-y-1">
                      <div className="py-2 text-center text-gray-600 font-mono text-xs">
                        ...
                      </div>

                      {/* My absolute rank highlighted bottom row */}
                      <div className="h-15 bg-[#00D9A5]/5 border-y-2 border-y-[#00D9A5] flex items-center justify-between px-4">
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-6 font-mono font-black text-xs text-[#00D9A5] text-center">
                            #{myRank}
                          </span>
                          <div className="w-9 h-9 rounded-full bg-[#00D9A5] flex items-center justify-center text-[10px] font-headline font-black text-[#0F0F1A]">
                            ME
                          </div>
                          <div className="text-left space-y-0.5">
                            <span className="text-xs font-headline font-black text-[#00D9A5] block">
                              Moi (Toi)
                            </span>
                            <span className="text-[9px] text-gray-400 font-headline block">
                              Niv. 7 Warrior
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-[#00D9A5] block">
                              {myPoints.toLocaleString()}
                            </span>
                            <span className="text-[8px] text-gray-500 block">PTS</span>
                          </div>
                          <span className="text-[10px] text-[#00D9A5] font-headline font-bold flex items-center gap-0.5 w-8 justify-end">
                            <TrendingUp className="w-3 h-3" />
                            ↑ {myTrend}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasMore && (
                    <button 
                      onClick={handleLoadMore}
                      className="w-full h-11 bg-transparent hover:bg-white/5 border border-gray-800 text-gray-400 rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all mt-4 cursor-pointer text-center"
                    >
                      CHARGER PLUS
                    </button>
                  )}

                </div>

                {/* SECTION 5: STATISTIQUES DU CLASSEMENT */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Stats Globales
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    
                    {/* Stat 1 */}
                    <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-1">
                      <div className="w-8 h-8 rounded-full bg-[#00D9A5]/10 flex items-center justify-center mx-auto text-[#00D9A5]">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-lg font-mono font-black text-[#00D9A5] block pt-1">
                        {stats.totalUsers.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 font-headline block leading-none">Alphas actifs</span>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-1">
                      <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto text-[#FFD700]">
                        <BarChart2 className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-lg font-mono font-black text-[#FFD700] block pt-1">
                        {stats.averagePoints.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 font-headline block leading-none">Pts moyens</span>
                    </div>

                    {/* Stat 3 */}
                    <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-1">
                      <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto text-[#FFD700]">
                        <Trophy className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-lg font-mono font-black text-[#FFD700] block pt-1">
                        {stats.topScore.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 font-headline block leading-none">Record mondial</span>
                    </div>

                    {/* Stat 4 */}
                    <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-1">
                      <div className="w-8 h-8 rounded-full bg-[#4A90D9]/10 flex items-center justify-center mx-auto text-[#4A90D9]">
                        <TrendingUp className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-lg font-mono font-black text-[#4A90D9] block pt-1">
                        {stats.averageLevel}
                      </span>
                      <span className="text-[10px] text-gray-400 font-headline block leading-none">Niveau moyen</span>
                    </div>

                  </div>
                </div>

                {/* SECTION 6: CONSEIL LEADERBOARD */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <TrendingUp className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Le classement n'est pas une fin en soi. C'est un miroir de ta discipline. Compare-toi à toi d'hier, pas aux autres. Mais utilise leur énergie comme carburant.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Règle #9 du Code Alpha d'Honneur
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

              {/* SIMULATED BOTTOM NAV */}
              <div className="h-16 border-t border-gray-950 bg-[#16213E] flex items-center justify-around px-4 z-10 select-none">
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Clan</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#FFD700] cursor-pointer">
                  <Trophy className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-[9px] font-headline text-[#FFD700]">Classement</span>
                  <div className="w-1 h-1 bg-[#FFD700] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Badges</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
