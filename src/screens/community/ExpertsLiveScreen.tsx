import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Play, 
  Clock, 
  User, 
  ChevronRight, 
  Shield, 
  Code, 
  Copy, 
  MessageSquare, 
  Check, 
  Lock, 
  Info, 
  Volume2, 
  Eye, 
  Send,
  AlertTriangle,
  Flame,
  HelpCircle,
  X,
  AlertCircle,
  Heart
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface ExpertsLiveScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  userId?: string;
  userSubscriptionTier?: 'FREE' | 'ELITE' | 'ALPHA';
}

interface SessionData {
  id: string;
  expertName: string;
  expertTitle: string;
  expertSpecialty: 'urologie' | 'sexologie' | 'andrologie' | 'psychiatrie' | 'nutrition';
  topic: string;
  scheduledAt: string;
  requiredTier: string | null;
  registeredCount: number;
  isUserRegistered: boolean;
  isLiveNow: boolean;
  streamUrl: string | null;
}

interface ReplayData {
  id: string;
  expertName: string;
  topic: string;
  category: string;
  durationSeconds: number;
  videoUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt: string;
  requiredTier: string | null;
  submittedQuestions: Array<{ question: string; isAnonymous: boolean; answer: string | null }>;
}

export const ExpertsLiveScreen: React.FC<ExpertsLiveScreenProps> = ({
  addToast,
  onBack,
  userId = 'user-777',
  userSubscriptionTier = 'FREE' // defaults to FREE to test upgrades
}) => {
  const isMounted = useRef<boolean>(true);

  // Active view: 'upcoming' | 'replays'
  const [activeView, setActiveView] = useState<'upcoming' | 'replays'>('upcoming');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Real-time API States
  const [liveSessionNow, setLiveSessionNow] = useState<SessionData | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [replays, setReplays] = useState<ReplayData[]>([]);

  // Question composer states
  const [isQuestionComposerOpen, setIsQuestionComposerOpen] = useState<boolean>(false);
  const [questionComposerTargetSession, setQuestionComposerTargetSession] = useState<SessionData | null>(null);
  const [questionText, setQuestionText] = useState<string>('');
  const [isAnonymousQuestion, setIsAnonymousQuestion] = useState<boolean>(true);
  const [showSafetyFeedback, setShowSafetyFeedback] = useState<boolean>(false);

  // Active Replay Player state
  const [selectedReplay, setSelectedReplay] = useState<ReplayData | null>(null);

  // Native Expo view toggler
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Categories list
  const categories = [
    { id: 'all', label: 'TOUS' },
    { id: 'urologie', label: 'Urologie' },
    { id: 'sexologie', label: 'Sexologie' },
    { id: 'andrologie', label: 'Andrologie' },
    { id: 'psychiatrie', label: 'Psychiatrie' },
    { id: 'nutrition', label: 'Nutrition' },
  ];

  // Common specialty backgrounds for initials
  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'urologie': return 'from-blue-600 to-cyan-500';
      case 'sexologie': return 'from-pink-600 to-rose-500';
      case 'andrologie': return 'from-indigo-600 to-purple-500';
      case 'psychiatrie': return 'from-emerald-600 to-teal-500';
      case 'nutrition': return 'from-amber-600 to-orange-500';
      default: return 'from-gray-600 to-slate-500';
    }
  };

  // Shared Distress keywords detection
  const distressKeywords = [
    'suicide', 'suicider', 'mutiler', 'mutilation', 'finir mes jours', 'en finir', 'mourir',
    'veux crever', 'veux mourir', 'auto-mutiler', 'tuer moi', 'me tuer', 'plus envie de vivre'
  ];

  const checkTextForDistress = (text: string): boolean => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return distressKeywords.some(kw => normalized.includes(kw));
  };

  // Fetch Live, Upcoming, and Replays
  const fetchData = useCallback(async () => {
    try {
      // 1. Live Now
      const liveRes = await fetch(`/api/community/${userId}/experts/live-now`);
      if (liveRes.ok) {
        const data = await liveRes.json();
        setLiveSessionNow(data);
      }

      // 2. Upcoming Sessions
      const upcomingRes = await fetch(`/api/community/${userId}/experts/upcoming?category=${activeCategory}`);
      if (upcomingRes.ok) {
        const data = await upcomingRes.json();
        setUpcomingSessions(data);
      }

      // 3. Replays
      const replaysRes = await fetch(`/api/community/${userId}/experts/replays?category=${activeCategory}`);
      if (replaysRes.ok) {
        const data = await replaysRes.json();
        setReplays(data);
      }
    } catch (err) {
      console.error('Failed to load experts data:', err);
    }
  }, [userId, activeCategory]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // Register / Unregister for an upcoming session
  const handleRegisterForSession = async (session: SessionData) => {
    if (navigator.vibrate) navigator.vibrate(60); // Haptic Medium

    // Optimistic UI updates
    setUpcomingSessions(prev => prev.map(s => {
      if (s.id === session.id) {
        const nextReg = !s.isUserRegistered;
        return {
          ...s,
          isUserRegistered: nextReg,
          registeredCount: nextReg ? s.registeredCount + 1 : s.registeredCount - 1
        };
      }
      return s;
    }));

    try {
      const res = await fetch(`/api/community/${userId}/experts/sessions/${session.id}/register`, {
        method: 'POST'
      });
      if (res.ok) {
        if (!session.isUserRegistered) {
          addToast('success', `✓ Vous êtes inscrit à la session "${session.topic}". Un rappel a été planifié !`);
        } else {
          addToast('info', "Votre inscription a été retirée.");
        }
      } else {
        // revert
        fetchData();
        addToast('error', "Échec de l'inscription.");
      }
    } catch (err) {
      console.error(err);
      fetchData();
      addToast('error', "Erreur réseau.");
    }
  };

  // Submit Question to Upcoming Session
  const handleSubmitQuestion = async () => {
    const trimmed = questionText.trim();
    if (!trimmed || !questionComposerTargetSession) return;

    if (navigator.vibrate) navigator.vibrate(40); // Haptic Light

    const hasDistress = checkTextForDistress(trimmed);
    if (hasDistress) {
      setShowSafetyFeedback(true);
    }

    try {
      const res = await fetch(`/api/community/${userId}/experts/sessions/${questionComposerTargetSession.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          isAnonymous: isAnonymousQuestion,
          safetyFlag: hasDistress
        })
      });

      if (res.ok) {
        addToast('success', "Votre question a bien été soumise de manière anonyme et sécurisée 🎖️");
        setQuestionText('');
        if (!hasDistress) {
          setIsQuestionComposerOpen(false);
          setQuestionComposerTargetSession(null);
        }
      } else {
        addToast('error', "Une erreur est survenue lors de la soumission.");
      }
    } catch (err) {
      console.error(err);
      addToast('error', "Erreur de connexion.");
    }
  };

  // Open external streaming URL
  const handleJoinLive = (url: string | null, topic: string) => {
    if (url) {
      window.open(url, '_blank');
      addToast('info', `Entrée dans le direct de : "${topic}"`);
    } else {
      addToast('warning', "Le flux en direct est en préparation.");
    }
  };

  // Code Source Natif Expo (React Native & TypeScript)
  const nativeExpoCode = `import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Image, 
  TextInput, 
  Switch,
  Modal,
  Linking,
  Alert,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ExpertsLiveScreen({ navigation }) {
  const [activeView, setActiveView] = useState('upcoming'); // 'upcoming' | 'replays'
  const [category, setCategory] = useState('all');
  const [liveNow, setLiveNow] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [replays, setReplays] = useState([]);
  
  // Question Compose
  const [composerVisible, setComposerVisible] = useState(false);
  const [targetSession, setTargetSession] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Player state
  const [selectedReplay, setSelectedReplay] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const liveRes = await fetch('/api/community/user-777/experts/live-now');
      if (liveRes.ok) setLiveNow(await liveRes.json());

      const upRes = await fetch(\`/api/community/user-777/experts/upcoming?category=\${category}\`);
      if (upRes.ok) setUpcoming(await upRes.json());

      const repRes = await fetch(\`/api/community/user-777/experts/replays?category=\${category}\`);
      if (repRes.ok) setReplays(await repRes.json());
    } catch (err) {
      console.log(err);
    }
  }, [category]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const registerSession = async (session) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await fetch(\`/api/community/user-777/experts/sessions/\${session.id}/register\`, { method: 'POST' });
    if (res.ok) {
      Alert.alert("Succès", !session.isUserRegistered ? "✓ Inscrit avec succès !" : "Inscription retirée.");
      fetchAll();
    }
  };

  const submitQuestion = async () => {
    if (!questionText.trim()) return;
    const res = await fetch(\`/api/community/user-777/experts/sessions/\${targetSession.id}/questions\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: questionText, isAnonymous })
    });
    if (res.ok) {
      Alert.alert("Envoyé", "Votre question a été transmise à l'expert.");
      setQuestionText('');
      setComposerVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EXPERTS EN DIRECT</Text>
        <View style={styles.tabToggle}>
          <TouchableOpacity onPress={() => setActiveView('upcoming')} style={activeView === 'upcoming' ? styles.activeTab : styles.inactiveTab}>
            <Ionicons name="calendar-outline" size={18} color={activeView === 'upcoming' ? '#000' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveView('replays')} style={activeView === 'replays' ? styles.activeTab : styles.inactiveTab}>
            <Ionicons name="play-outline" size={18} color={activeView === 'replays' ? '#000' : '#8E8E93'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {liveNow && (
          <View style={styles.liveBanner}>
            <View style={styles.row}>
              <View style={styles.liveBadge}><Text style={styles.liveText}>🔴 EN DIRECT</Text></View>
              <Text style={styles.liveExpert}>{liveNow.expertName}</Text>
            </View>
            <Text style={styles.liveTopic}>{liveNow.topic}</Text>
            <TouchableOpacity style={styles.joinBtn} onPress={() => Linking.openURL(liveNow.streamUrl)}>
              <Text style={styles.joinText}>REJOINDRE MAINTENANT</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ padding: 16 }}>
          {upcoming.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{item.expertName[3]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expertName}>{item.expertName}</Text>
                  <Text style={styles.expertTitle}>{item.expertTitle}</Text>
                </View>
                {item.requiredTier && <Text style={styles.tierBadge}>{item.requiredTier}</Text>}
              </View>
              <Text style={styles.topicText}>{item.topic}</Text>
              <Text style={styles.dateText}>📅 {item.scheduledAt}</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TouchableOpacity style={styles.registerBtn} onPress={() => registerSession(item)}>
                  <Text style={styles.btnText}>{item.isUserRegistered ? '✓ INSCRIT' : 'JE SERAI PRÉSENT'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setTargetSession(item); setComposerVisible(true); }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFD700', fontFamily: 'Montserrat-Bold' },
  tabToggle: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 8, padding: 2 },
  activeTab: { backgroundColor: '#FFD700', padding: 6, borderRadius: 6 },
  inactiveTab: { padding: 6 },
  liveBanner: { backgroundColor: '#FF2D55', margin: 16, padding: 18, borderRadius: 20 },
  liveBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  liveExpert: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  liveTopic: { color: '#FFF', marginTop: 8, fontSize: 13 },
  joinBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  joinText: { color: '#FF2D55', fontWeight: 'bold' },
  card: { backgroundColor: '#16213E', padding: 16, borderRadius: 18, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  expertName: { color: '#FFF', fontWeight: 'bold' },
  expertTitle: { color: '#8E8E93', fontSize: 10 },
  topicText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 10 },
  dateText: { color: '#8E8E93', fontSize: 11, marginTop: 6 },
  registerBtn: { flex: 1, backgroundColor: '#FFD700', padding: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#0F0F1A', fontWeight: 'bold' },
  tierBadge: { color: '#FFD700', backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, borderRadius: 4 }
});
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(nativeExpoCode);
    setCopied(true);
    addToast('success', "Code source de ExpertsLiveScreen copié avec succès ! 🛡️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* 1. COMPOSER DE QUESTION MODAL OVERLAY */}
      {isQuestionComposerOpen && questionComposerTargetSession && (
        <div className="fixed inset-0 bg-[#0F0F1A]/95 z-50 flex items-center justify-center p-4 md:p-8 animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-[450px] bg-[#16213E] border border-[#1C1C3A] rounded-[32px] overflow-hidden p-6 relative flex flex-col space-y-4 text-left shadow-2xl">
            
            <button 
              onClick={() => {
                setIsQuestionComposerOpen(false);
                setQuestionComposerTargetSession(null);
                setShowSafetyFeedback(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest block">Posez votre question</span>
              <h3 className="text-md font-headline font-black text-white leading-tight">
                Ta question pour {questionComposerTargetSession.expertName}
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Les questions les plus soutenues par la communauté seront traitées en priorité lors du Q&A. Tu peux rester anonyme pour préserver ton intimité.
              </p>
            </div>

            {/* TOGGLE ANONYMOUS */}
            <div className="flex items-center justify-between bg-[#0F0F1A] rounded-2xl p-4 border border-gray-800">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#FFD700]" />
                <div>
                  <span className="text-xs font-bold text-white block">Poser anonymement</span>
                  <span className="text-[9px] text-gray-500 block">Votre pseudo ne sera pas partagé en direct.</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAnonymousQuestion} 
                  onChange={(e) => setIsAnonymousQuestion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD700]" />
              </label>
            </div>

            {/* TEXTINPUT */}
            <div className="space-y-1">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                maxLength={300}
                rows={4}
                placeholder="Écris ta question de manière concise et directe..."
                className="w-full bg-[#0F0F1A] border border-gray-800 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700] resize-none font-sans"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-500 px-1 font-mono">
                <span>Reste constructif et respectueux</span>
                <span>{questionText.length}/300</span>
              </div>
            </div>

            {/* SAFETY FEEDBACK FOR DISTRESS SENT */}
            {showSafetyFeedback && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 flex gap-3 text-left">
                <Heart className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">On dirait que ce sujet te touche personnellement 🛡️</span>
                  <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                    Ta question a bien été transmise à notre expert. Mais n'oublie pas : tu peux parler immédiatement et gratuitement au Coach IA ALPHA MAN pour un soutien discret en temps réel.
                  </p>
                  <button 
                    onClick={() => {
                      addToast('info', "Activation de la conversation immédiate avec le Coach de Secours...");
                      setIsQuestionComposerOpen(false);
                      setShowSafetyFeedback(false);
                    }}
                    className="text-[10px] font-bold text-[#FFD700] hover:underline"
                  >
                    Parler au Coach de Secours maintenant &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsQuestionComposerOpen(false);
                  setQuestionComposerTargetSession(null);
                  setShowSafetyFeedback(false);
                }}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold font-headline transition-all text-center"
              >
                ANNULER
              </button>
              
              <AlphaButton
                variant="gold"
                size="md"
                disabled={!questionText.trim()}
                onClick={handleSubmitQuestion}
                className="flex-1 text-xs font-bold"
              >
                ENVOYER MA QUESTION
              </AlphaButton>
            </div>

          </div>
        </div>
      )}

      {/* 2. REPLAY PLAYER MODAL */}
      {selectedReplay && (
        <div className="fixed inset-0 bg-[#0F0F1A]/98 z-40 flex items-center justify-center p-4 md:p-8 animate-[fade-in_0.2.5s_ease-out]">
          <div className="w-full max-w-[650px] bg-[#16213E] border border-[#1C1C3A] rounded-[36px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            
            {/* COMPOSANT DE LECTEUR VIDÉO PLACEHOLDER */}
            <div className="relative aspect-video w-full bg-[#000] flex items-center justify-center border-b border-gray-800">
              <video 
                src={selectedReplay.videoUrl} 
                controls 
                autoPlay 
                playsInline
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedReplay(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all z-50"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 left-4 bg-black/70 px-2.5 py-1 rounded-md text-[9px] font-mono text-[#00D9A5]">
                REPLAY EN HAUTE DÉFINITION 1080P
              </div>
            </div>

            {/* DETAILED REPLAY INFO SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left custom-scrollbar">
              
              <div>
                <span className="text-[10px] bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] px-2 py-0.5 rounded-md font-mono uppercase">
                  Replay d'Honneur
                </span>
                <h3 className="text-md font-headline font-black text-white mt-1.5">{selectedReplay.topic}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Présenté par <strong className="text-white">{selectedReplay.expertName}</strong>
                </p>
              </div>

              <div className="flex gap-4 border-y border-gray-800/60 py-3 text-[10px] text-gray-500 font-mono">
                <span>Durée : {Math.floor(selectedReplay.durationSeconds / 60)} minutes</span>
                <span>•</span>
                <span>Vues : {selectedReplay.viewCount} guerriers</span>
                <span>•</span>
                <span>Catégorie : {selectedReplay.category.toUpperCase()}</span>
              </div>

              {/* QUESTIONS ACCORDION */}
              <div className="space-y-3">
                <h4 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider">
                  Questions posées pendant cette session
                </h4>

                {selectedReplay.submittedQuestions.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic">Aucune question enregistrée pour ce replay.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedReplay.submittedQuestions.map((q, idx) => (
                      <div key={idx} className="bg-[#0F0F1A] border border-gray-800/80 rounded-2xl p-4 space-y-2">
                        <div className="flex gap-2 items-start">
                          <HelpCircle className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-gray-500 block font-mono">
                              {q.isAnonymous ? "Souverain Anonyme" : "Frère d'armes"} a demandé :
                            </span>
                            <p className="text-xs font-semibold text-white leading-relaxed">
                              "{q.question}"
                            </p>
                          </div>
                        </div>

                        {q.answer ? (
                          <div className="bg-[#16213E] border-l-2 border-[#00D9A5] p-3 rounded-r-xl text-[11px] text-gray-300 font-sans leading-relaxed">
                            <strong className="text-[#00D9A5] block mb-1">RÉPONSE DE L'EXPERT :</strong>
                            {q.answer}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500 italic pl-6">
                            Sans réponse enregistrée.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* PLAYER FOOTER CLOSE BUTTON */}
            <div className="p-4 border-t border-gray-800 bg-[#111124] flex">
              <button
                onClick={() => setSelectedReplay(null)}
                className="w-full py-3 bg-[#0F0F1A] hover:bg-gray-800 border border-gray-800 rounded-xl text-xs font-bold font-headline transition-all uppercase"
              >
                FERMER LE LECTEUR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. CORE HEADER & NATIVE CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Phase Communauté — Q&A Experts (6.3)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Experts & Directs Souverains
          </h2>
          <p className="text-xs text-gray-400">
            Accédez à des conférences d'élite, posez vos questions anonymes, et visualisez des replays d'urologie et de psychologie.
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

      {/* CODE SOURCE EXPO INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">ExpertsLiveScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500">
                Fiche complète comprenant le calendrier des sessions à venir, la soumission anonyme de questions, et le lecteur de replays d'élite.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={handleCopyCode}
              className="flex items-center gap-2 text-[10px] font-headline"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le Code Natif'}
            </AlphaButton>
          </div>
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[350px] custom-scrollbar">
            {nativeExpoCode}
          </pre>
        </div>
      )}

      {/* DUAL PANELS: LEFT ADMIN CONTROL PANEL, RIGHT SMARTPHONE EMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL GAUCHE: SIMULATION CONTROLLER */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-6 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              Contrôleur de Simulation
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Basculez entre le flux gratuit (FREE) et le niveau ÉLITE pour observer les verrous d'abonnement dynamiques sur les sessions d'experts.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* CURRENT USER TIER DISPLAY */}
            <div className="bg-[#0F0F1A] border border-gray-800 rounded-2xl p-4 space-y-1.5">
              <span className="text-[10px] text-gray-500 font-mono uppercase block">Votre niveau d'Abonnement Actuel :</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Niveau de simulation :</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${userSubscriptionTier === 'ELITE' || userSubscriptionTier === 'ALPHA' ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-gray-800 text-gray-400'}`}>
                  {userSubscriptionTier}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-sans leading-relaxed pt-1.5 border-t border-gray-800/60">
                La session "Dr. Amine El Mansouri" requiert le statut <strong className="text-[#FFD700]">ELITE</strong>. Si vous l'avez configuré sur FREE, le bouton de déverrouillage apparaîtra automatiquement !
              </p>
            </div>

            {/* MANUAL LIVE BANNER SWITCH */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block font-semibold">Bannière "En Direct" :</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setLiveSessionNow({
                      id: 'session-live-1',
                      expertName: 'Dr. Marc-Antoine Perrin',
                      expertTitle: 'Sexologue clinicien & Andrologue',
                      expertSpecialty: 'sexologie',
                      topic: 'Maîtriser la réactivité sexuelle : l\'art d\'entraîner l\'esprit et le corps',
                      scheduledAt: new Date().toISOString(),
                      requiredTier: null,
                      registeredCount: 342,
                      isUserRegistered: true,
                      isLiveNow: true,
                      streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                    });
                    addToast('info', "Bannière '🔴 EN DIRECT MAINTENANT' activée !");
                  }}
                  className="flex-1 py-1.5 bg-red-950/20 text-red-400 border border-red-900/30 text-[10px] font-bold rounded-xl text-center"
                >
                  Activer Direct 🔴
                </button>
                <button
                  onClick={() => {
                    setLiveSessionNow(null);
                    addToast('info', "Bannière 'En Direct' désactivée.");
                  }}
                  className="flex-1 py-1.5 bg-gray-800 text-gray-400 text-[10px] font-bold rounded-xl text-center"
                >
                  Désactiver Direct
                </button>
              </div>
            </div>

            {/* SIMULATED NEW REPLAY ARRIVAL */}
            <button
              onClick={() => {
                const newReplay: ReplayData = {
                  id: `replay-${Date.now()}`,
                  expertName: 'Dr. Amine El Mansouri',
                  topic: 'Optimisation de la régénération nerveuse post-flatline',
                  category: 'urologie',
                  durationSeconds: 1800,
                  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-sitting-by-the-window-staring-outside-40559-large.mp4',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
                  viewCount: 15,
                  publishedAt: 'À l\'instant',
                  requiredTier: 'ELITE',
                  submittedQuestions: []
                };
                setReplays(prev => [newReplay, ...prev]);
                addToast('success', "Un nouveau replay d'expert Élite a été publié ! 🏆");
              }}
              className="w-full py-2 bg-[#16213E] hover:bg-[#1E2E56] text-xs font-bold rounded-xl text-center transition-all border border-gray-800"
            >
              Simuler Publication de Replay 📹
            </button>

            {/* RESET ALL DATA */}
            <div className="pt-2 border-t border-gray-800">
              <button
                onClick={() => {
                  setLiveSessionNow({
                    id: 'session-live-1',
                    expertName: 'Dr. Marc-Antoine Perrin',
                    expertTitle: 'Sexologue clinicien & Andrologue',
                    expertSpecialty: 'sexologie',
                    topic: 'Maîtriser la réactivité sexuelle : l\'art d\'entraîner l\'esprit et le corps',
                    scheduledAt: new Date().toISOString(),
                    requiredTier: null,
                    registeredCount: 342,
                    isUserRegistered: true,
                    isLiveNow: true,
                    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                  });
                  addToast('info', "Simulation réinitialisée.");
                  fetchData();
                }}
                className="w-full py-2 bg-[#0A0A14] hover:bg-red-950/20 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-900/30 text-xs font-bold rounded-xl transition-all text-center"
              >
                Réinitialiser les données
              </button>
            </div>

          </div>
        </div>

        {/* PANEL DROIT: EMULATEUR SMARTPHONE SMART */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-[400px] aspect-[9/19] bg-[#0F0F1A] border-[10px] border-[#1C1C3A] rounded-[48px] overflow-hidden shadow-2xl relative flex flex-col font-sans">
            
            {/* STATUS BAR */}
            <div className="h-6 bg-[#0F0F1A] px-6 flex justify-between items-center text-[10px] text-gray-500 font-mono shrink-0">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="w-4 h-2.5 bg-gray-600 rounded-sm" />
              </div>
            </div>

            {/* PHONE HEADER */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1A1A2E] bg-[#0F0F1A] shrink-0">
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/60 text-white hover:bg-[#16213E] transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-center">
                <span className="text-xs font-headline font-black text-[#FFD700] tracking-widest uppercase block">
                  EXPERTS
                </span>
                <span className="text-[9px] text-[#8E8E93] block">
                  Savoir & Souveraineté
                </span>
              </div>

              {/* TOGGLES À VENIR / REPLAYS */}
              <div className="flex bg-[#1A1A2E] rounded-lg p-1">
                <button
                  onClick={() => setActiveView('upcoming')}
                  className={`p-1.5 rounded-md transition-all ${activeView === 'upcoming' ? 'bg-[#FFD700] text-[#0F0F1A]' : 'text-gray-400 hover:text-white'}`}
                  title="À venir"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveView('replays')}
                  className={`p-1.5 rounded-md transition-all ${activeView === 'replays' ? 'bg-[#FFD700] text-[#0F0F1A]' : 'text-gray-400 hover:text-white'}`}
                  title="Replays"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE VIEWPORT CONTENT */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar text-left pb-12">
              
              {/* LIVE NOW BANNER */}
              {liveSessionNow && (
                <div className="bg-gradient-to-tr from-[#FF2D55] to-[#FF9500] rounded-2xl p-4 space-y-3 shadow-lg border border-red-500 animate-[pulse_2s_infinite]">
                  <div className="flex items-center justify-between">
                    <span className="bg-white/20 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md animate-pulse">
                      🔴 EN DIRECT
                    </span>
                    <span className="text-[9px] text-white/90 font-mono">
                      Conférence d'Élite active
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-black text-white block">{liveSessionNow.expertName}</span>
                    <p className="text-[11px] font-bold text-white leading-snug">
                      "{liveSessionNow.topic}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleJoinLive(liveSessionNow.streamUrl, liveSessionNow.topic)}
                    className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#FF2D55] font-headline font-black text-[10px] uppercase rounded-xl transition-all shadow-md block text-center"
                  >
                    REJOINDRE MAINTENANT
                  </button>
                </div>
              )}

              {/* HORIZONTAL CATEGORY CHIPS */}
              <div className="overflow-x-auto flex gap-2 pb-2 scrollbar-none shrink-0">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        if (navigator.vibrate) navigator.vibrate(20);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black font-headline transition-all whitespace-nowrap shrink-0 border ${
                        isActive 
                          ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                          : 'bg-[#1A1A2E] text-[#8E8E93] border-gray-800 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* ==================== VUE À VENIR ==================== */}
              {activeView === 'upcoming' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-headline font-black text-[#8E8E93] tracking-wider uppercase">
                      Prochaines sessions Q&A ({upcomingSessions.length})
                    </h4>
                  </div>

                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 space-y-2">
                      <Calendar className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-xs">Aucune session programmée dans cette catégorie.</p>
                    </div>
                  ) : (
                    upcomingSessions.map((item) => {
                      // Check tier lock: user must have ELITE or ALPHA if requested
                      const isLocked = item.requiredTier === 'ELITE' && userSubscriptionTier === 'FREE';

                      return (
                        <div 
                          key={item.id}
                          className="bg-[#16213E] border border-gray-800/60 rounded-3xl p-4.5 space-y-3.5 shadow-md relative overflow-hidden text-left"
                        >
                          {/* EXPERT HEADER */}
                          <div className="flex items-start justify-between">
                            <div className="flex gap-2.5 items-center">
                              {/* Initial avatar with gradient matching specialty */}
                              <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${getSpecialtyColor(item.expertSpecialty)} flex items-center justify-center text-white font-black text-sm`}>
                                {item.expertName.split(' ')[1]?.[0]?.toUpperCase() || item.expertName[0]}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-white block leading-tight">{item.expertName}</span>
                                <span className="text-[9px] text-[#8E8E93] block leading-tight">{item.expertTitle}</span>
                              </div>
                            </div>

                            {item.requiredTier && (
                              <span className="text-[8px] bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/35 font-bold px-1.5 py-0.5 rounded uppercase">
                                {item.requiredTier}
                              </span>
                            )}
                          </div>

                          {/* SUBJECT TOPIC */}
                          <p className="text-xs font-black font-headline text-white leading-normal">
                            "{item.topic}"
                          </p>

                          {/* TIMING AND REGISTER COUNT */}
                          <div className="space-y-1 text-[10px] text-gray-400 font-mono">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-[#FFD700]" />
                              <span>{new Date(item.scheduledAt).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span className="block text-gray-500 font-sans text-[9px] pl-4.5">
                              {item.registeredCount} souverains inscrits pour y assister
                            </span>
                          </div>

                          {/* FOOTER ACTIONS */}
                          <div className="flex gap-2 items-center pt-1 border-t border-gray-800/50">
                            
                            {isLocked ? (
                              <button
                                onClick={() => addToast('warning', "Le statut ÉLITE est requis pour participer à ce séminaire spécialisé.")}
                                className="flex-1 py-2.5 bg-transparent hover:bg-[#FFD700]/5 border border-[#FFD700] text-[#FFD700] text-[10px] font-headline font-black uppercase rounded-xl transition-all text-center"
                              >
                                DÉBLOQUER AVEC ELITE 🔒
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRegisterForSession(item)}
                                className={`flex-1 py-2.5 text-[10px] font-headline font-black uppercase rounded-xl transition-all text-center ${
                                  item.isUserRegistered 
                                    ? 'bg-[#00D9A5] text-[#0F0F1A]' 
                                    : 'bg-[#FFD700] text-[#0F0F1A] hover:bg-yellow-500'
                                }`}
                              >
                                {item.isUserRegistered ? '✓ INSCRIT' : 'JE SERAI PRÉSENT'}
                              </button>
                            )}

                            {/* ASK QUESTION BUBBLE ICON */}
                            <button
                              onClick={() => {
                                if (isLocked) {
                                  addToast('warning', "Le statut ÉLITE est requis pour soumettre des questions à cet expert.");
                                  return;
                                }
                                setQuestionComposerTargetSession(item);
                                setIsQuestionComposerOpen(true);
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0F0F1A] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all shrink-0"
                              title="Poser une question"
                            >
                              <MessageSquare className="w-4 h-4 text-[#FFD700]" />
                            </button>

                          </div>

                        </div>
                      );
                    })
                  )}

                </div>
              )}

              {/* ==================== VUE REPLAYS ==================== */}
              {activeView === 'replays' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-headline font-black text-[#8E8E93] tracking-wider uppercase">
                      Bibliothèque des replays ({replays.length})
                    </h4>
                  </div>

                  {replays.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 space-y-2">
                      <Play className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
                      <p className="text-xs">Aucun replay disponible.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-left">
                      {replays.map((item) => {
                        const isLocked = item.requiredTier === 'ELITE' && userSubscriptionTier === 'FREE';

                        return (
                          <div 
                            key={item.id}
                            onClick={() => {
                              if (isLocked) {
                                addToast('warning', "Abonnement ÉLITE requis pour débloquer cette formation vidéo.");
                                return;
                              }
                              setSelectedReplay(item);
                            }}
                            className={`flex flex-col gap-2 p-2 bg-[#16213E] border border-gray-800/40 rounded-2xl cursor-pointer hover:bg-slate-800/50 transition-all text-left relative ${isLocked ? 'opacity-70' : ''}`}
                          >
                            {/* THUMBNAIL CONTAINER WITH OVERLAYS */}
                            <div className="relative aspect-video w-full bg-[#1A1A2E] rounded-xl overflow-hidden flex items-center justify-center">
                              <img 
                                src={item.thumbnailUrl} 
                                alt={item.topic} 
                                referrerPolicy="no-referrer"
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                              />
                              <div className="absolute inset-0 bg-black/30" />
                              
                              {/* CENTER PLAY CIRCLE */}
                              <div className="w-9 h-9 rounded-full bg-[#FFD700] hover:bg-yellow-500 transition-all flex items-center justify-center text-[#0F0F1A] shadow-md z-10">
                                {isLocked ? <Lock className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                              </div>

                              {/* DURATION OVERLAY */}
                              <span className="absolute bottom-1 right-1.5 bg-black/80 text-[8px] font-mono font-bold text-white px-1 py-0.5 rounded">
                                {Math.floor(item.durationSeconds / 60)}:{(item.durationSeconds % 60).toString().padStart(2, '0')}
                              </span>

                              {/* REQUIRED TIER OVERLAY */}
                              {item.requiredTier && (
                                <span className="absolute top-1 left-1.5 bg-[#FFD700] text-black text-[7px] font-black px-1 rounded uppercase tracking-wider">
                                  {item.requiredTier}
                                </span>
                              )}
                            </div>

                            {/* DETAILS */}
                            <div className="px-1 space-y-0.5">
                              <span className="text-[8px] text-gray-500 font-mono block leading-none uppercase">
                                {item.expertName}
                              </span>
                              <p className="text-[10px] font-bold text-white leading-snug line-clamp-2">
                                {item.topic}
                              </p>
                              <div className="flex gap-1 items-center text-[8px] text-gray-500 font-mono pt-1">
                                <Eye className="w-2.5 h-2.5 text-gray-600" />
                                <span>{item.viewCount} vues</span>
                                <span>·</span>
                                <span>{item.publishedAt}</span>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* PHONE REAR FOOTER */}
            <div className="h-6 bg-[#0F0F1A] border-t border-gray-900 flex justify-center items-center shrink-0">
              <div className="w-32 h-1 bg-gray-700 rounded-full" />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
