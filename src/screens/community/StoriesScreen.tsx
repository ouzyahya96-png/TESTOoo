import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Award, 
  Clock, 
  MessageSquare, 
  MessageCircle, 
  Flag, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Code, 
  Copy, 
  Settings, 
  AlertTriangle, 
  Sparkles, 
  Star,
  Users
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

// Props matching navigation in full app
interface StoriesScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  userId?: string;
  clanId?: string;
  pendingMilestone?: { day: number; label: string } | null;
}

export interface StoryCardData {
  id: string;
  authorPseudo: string;
  authorLevel: number;
  milestoneDay: number;
  milestoneLabel: string;
  answers: { hardest: string; whatChanged: string; advice: string };
  helpedCount: number;
  userHasReactedHelped: boolean;
  commentCount: number;
  status: 'pending' | 'approved' | 'featured' | 'needs_review';
  createdAt: string;
  clanId: string;
}

export interface CommentData {
  id: string;
  storyId: string;
  authorPseudo: string;
  authorLevel: number;
  text: string;
  createdAt: string;
}

export const StoriesScreen: React.FC<StoriesScreenProps> = ({ 
  addToast, 
  onBack, 
  userId = 'user-777', 
  clanId = 'clan-1',
  pendingMilestone = null
}) => {
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Simulator configurations
  const [simulatedStreak, setSimulatedStreak] = useState<number>(30);
  const [simulatedLevel, setSimulatedLevel] = useState<number>(12);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Core API synchronized states
  const [activeTab, setActiveTab] = useState<'clan' | 'discover'>('clan');
  const [stories, setStories] = useState<StoryCardData[]>([]);
  const [myPendingStory, setMyPendingStory] = useState<StoryCardData | null>(null);
  const [featuredStory, setFeaturedStory] = useState<StoryCardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Detail view state
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [storyDetail, setStoryDetail] = useState<StoryCardData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [commentSafetyTriggered, setCommentSafetyTriggered] = useState<boolean>(false);

  // Composer states
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [composerStep, setComposerStep] = useState<1 | 2 | 3>(1);
  const [composerAnswers, setComposerAnswers] = useState({
    hardest: '',
    whatChanged: '',
    advice: ''
  });
  const [composerSafetyTriggered, setComposerSafetyTriggered] = useState<boolean>(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState<boolean>(true);

  // Light client-side distress signals keywords filter
  const distressKeywords = [
    'suicide', 'suicider', 'mutiler', 'mutilation', 'finir mes jours', 'en finir', 'mourir',
    'veux crever', 'veux mourir', 'auto-mutiler', 'tuer moi', 'me tuer', 'plus envie de vivre'
  ];

  const checkTextForDistress = (text: string): boolean => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return distressKeywords.some(kw => normalized.includes(kw));
  };

  // Check current answers for safety signals
  useEffect(() => {
    const hasDistress = 
      checkTextForDistress(composerAnswers.hardest) || 
      checkTextForDistress(composerAnswers.whatChanged) || 
      checkTextForDistress(composerAnswers.advice);
    setComposerSafetyTriggered(hasDistress);
  }, [composerAnswers]);

  // Check comment for safety signals
  useEffect(() => {
    setCommentSafetyTriggered(checkTextForDistress(newCommentText));
  }, [newCommentText]);

  // Fetch stories according to activeTab (scope) & pending stories
  const fetchStoriesData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch main stories list
      const storiesRes = await fetch(`/api/community/${userId}/stories?scope=${activeTab}&clanId=${clanId}`);
      if (storiesRes.ok) {
        const data = await storiesRes.json();
        setStories(data);
      }

      // 2. Fetch mine pending story
      const pendingRes = await fetch(`/api/community/${userId}/stories/mine/pending`);
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setMyPendingStory(data);
      }

      // 3. Fetch featured story of the week
      const featuredRes = await fetch(`/api/community/${userId}/stories/featured`);
      if (featuredRes.ok) {
        const data = await featuredRes.json();
        setFeaturedStory(data);
      }
    } catch (error) {
      console.error('Failed to fetch stories data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, clanId, userId]);

  useEffect(() => {
    fetchStoriesData();
  }, [fetchStoriesData]);

  // Fetch comments when a story is selected
  useEffect(() => {
    if (selectedStoryId) {
      const selected = stories.find(s => s.id === selectedStoryId) || 
                       (featuredStory?.id === selectedStoryId ? featuredStory : null) ||
                       (myPendingStory?.id === selectedStoryId ? myPendingStory : null);
      setStoryDetail(selected);

      fetch(`/api/community/${userId}/stories/${selectedStoryId}/comments`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setComments(data))
        .catch(err => console.error('Failed to fetch comments:', err));
    } else {
      setStoryDetail(null);
      setComments([]);
    }
  }, [selectedStoryId, stories, featuredStory, myPendingStory, userId]);

  // Submit reaction "Ça m'a aidé"
  const handleReactHelped = async (storyId: string) => {
    try {
      if (navigator.vibrate) navigator.vibrate(50); // Haptic light
      const res = await fetch(`/api/community/${userId}/stories/${storyId}/react`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        
        // Update in active stories list
        setStories(prev => prev.map(s => s.id === storyId ? { ...s, helpedCount: data.helpedCount, userHasReactedHelped: data.userHasReactedHelped } : s));
        
        // Update in featured story
        if (featuredStory && featuredStory.id === storyId) {
          setFeaturedStory(prev => prev ? { ...prev, helpedCount: data.helpedCount, userHasReactedHelped: data.userHasReactedHelped } : null);
        }

        // Update in detail view
        if (storyDetail && storyDetail.id === storyId) {
          setStoryDetail(prev => prev ? { ...prev, helpedCount: data.helpedCount, userHasReactedHelped: data.userHasReactedHelped } : null);
        }

        addToast('success', data.userHasReactedHelped ? "Réaction enregistrée ! 🙌" : "Réaction retirée.");
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Submit new story
  const handleSubmitStory = async () => {
    try {
      const payload = {
        milestoneDay: simulatedStreak,
        answers: composerAnswers,
        clientSafetyFlag: composerSafetyTriggered
      };

      const res = await fetch(`/api/community/${userId}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Haptic Medium

        if (data.safetyTriggered) {
          addToast('warning', "Votre story a été envoyée pour examen prioritaire. N'hésitez pas à solliciter notre coach IA 🛡️");
        } else {
          addToast('success', "Story transmise souverainement ! En attente de validation 🙏");
        }

        // Reset composer
        setComposerAnswers({ hardest: '', whatChanged: '', advice: '' });
        setComposerStep(1);
        setIsComposerOpen(false);

        // Refetch data
        fetchStoriesData();
      }
    } catch (err) {
      console.error('Failed to submit story:', err);
      addToast('error', "Échec de l'envoi de la story.");
    }
  };

  // Submit comment
  const handleSubmitComment = async () => {
    if (newCommentText.trim().length < 20) {
      addToast('warning', "Le commentaire doit comporter au moins 20 caractères.");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/community/${userId}/stories/${selectedStoryId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newCommentText })
      });

      if (res.ok) {
        const data = await res.json();
        
        setComments(prev => [...prev, data.comment]);
        setNewCommentText('');
        
        if (storyDetail) {
          const updated = { ...storyDetail, commentCount: storyDetail.commentCount + 1 };
          setStoryDetail(updated);
          setStories(prev => prev.map(s => s.id === updated.id ? updated : s));
        }

        if (data.safetyTriggered) {
          addToast('warning', "Commentaire enregistré pour validation. Notre équipe d'entraide est prévenue de votre détresse 🛡️");
        } else {
          addToast('success', "Commentaire publié avec succès !");
        }
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      addToast('error', "Échec de la publication du commentaire.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Report story
  const handleReportContent = async (storyId: string) => {
    try {
      const res = await fetch(`/api/community/${userId}/stories/${storyId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Contenu inapproprié ou non constructif' })
      });
      if (res.ok) {
        if (navigator.vibrate) navigator.vibrate(80);
        addToast('success', "Signalement enregistré. Notre équipe vérifie ce contenu sous 24h. Merci pour votre souveraineté 🛡️");
        fetchStoriesData();
      }
    } catch (err) {
      console.error('Failed to report:', err);
    }
  };

  const isBandeauPalierVisible = [7, 30, 90, 365].includes(simulatedStreak) && 
    !myPendingStory && 
    !stories.some(s => s.authorPseudo === 'Moi' && s.milestoneDay === simulatedStreak);

  // Pure Expo React Native code in string to allow code inspection (dual presentation)
  const expoNativeCode = `import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  SafeAreaView, 
  StatusBar, 
  RefreshControl, 
  Alert,
  ScrollView,
  Animated
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export interface StoryCardData {
  id: string;
  authorPseudo: string;
  authorLevel: number;
  milestoneDay: number;
  milestoneLabel: string;
  answers: { hardest: string; whatChanged: string; advice: string };
  helpedCount: number;
  userHasReactedHelped: boolean;
  commentCount: number;
  status: 'pending' | 'approved' | 'featured' | 'needs_review';
  createdAt: string;
  clanId: string;
}

export default function StoriesScreen({ route }) {
  const navigation = useNavigation();
  const userId = route?.params?.userId || 'user-777';
  const clanId = route?.params?.clanId || 'clan-1';

  const [activeTab, setActiveTab] = useState<'clan' | 'discover'>('clan');
  const [stories, setStories] = useState<StoryCardData[]>([]);
  const [myPendingStory, setMyPendingStory] = useState<StoryCardData | null>(null);
  const [featuredStory, setFeaturedStory] = useState<StoryCardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  // Detail & Comment states
  const [selectedStory, setSelectedStory] = useState<StoryCardData | null>(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Composer states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [answers, setAnswers] = useState({ hardest: '', whatChanged: '', advice: '' });

  // Animations
  const bandeauScale = useRef(new Animated.Value(0.95)).current;
  const bandeauFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    Animated.parallel([
      Animated.timing(bandeauFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(bandeauScale, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(\`/api/community/\${userId}/stories?scope=\${activeTab}&clanId=\${clanId}\`);
      if (res.ok) setStories(await res.json());

      const pendingRes = await fetch(\`/api/community/\${userId}/stories/mine/pending\`);
      if (pendingRes.ok) setMyPendingStory(await pendingRes.json());

      const featRes = await fetch(\`/api/community/\${userId}/stories/featured\`);
      if (featRes.ok) setFeaturedStory(await featRes.json());
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleReact = async (storyId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await fetch(\`/api/community/\${userId}/stories/\${storyId}/react\`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStories(prev => prev.map(s => s.id === storyId ? { ...s, helpedCount: data.helpedCount, userHasReactedHelped: data.userHasReactedHelped } : s));
        if (featuredStory?.id === storyId) setFeaturedStory(prev => prev ? { ...prev, helpedCount: data.helpedCount, userHasReactedHelped: data.userHasReactedHelped } : null);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleReport = (storyId: string) => {
    Alert.alert(
      "🛡️ SIGNALER CE CONTENU",
      "Voulez-vous signaler ce récit comme inapproprié ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Signaler", 
          onPress: async () => {
            const res = await fetch(\`/api/community/\${userId}/stories/\${storyId}/report\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: 'Inapproprié' })
            });
            if (res.ok) {
              Alert.alert("Succès", "Signalement envoyé pour vérification humaine.");
              fetchData();
            }
          }
        }
      ]
    );
  };

  const submitComment = async () => {
    if (newComment.trim().length < 20) {
      Alert.alert("Attention", "Le commentaire doit faire au moins 20 caractères.");
      return;
    }
    try {
      const res = await fetch(\`/api/community/\${userId}/stories/\${selectedStory.id}/comments\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
        fetchData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const submitStory = async () => {
    try {
      const res = await fetch(\`/api/community/\${userId}/stories\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneDay: 30, answers })
      });
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsComposerOpen(false);
        setStep(1);
        setAnswers({ hardest: '', whatChanged: '', advice: '' });
        fetchData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RÉCITS</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowNotificationBadge(false)}>
          <Ionicons name="notifications" size={24} color="#FFD700" />
          {showNotificationBadge && <View style={styles.redDot} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={stories}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        ListHeaderComponent={() => (
          <View>
            {/* Story of the week banner */}
            {featuredStory && (
              <TouchableOpacity style={styles.featuredBanner} onPress={() => setSelectedStory(featuredStory)}>
                <Text style={styles.featuredBadge}>⭐ STORY DE LA SEMAINE</Text>
                <Text style={styles.featuredText} numberOfLines={2}>"{featuredStory.answers.hardest}"</Text>
                <Text style={styles.featuredMeta}>Par {featuredStory.authorPseudo} (Niveau {featuredStory.authorLevel}) — {featuredStory.milestoneLabel}</Text>
              </TouchableOpacity>
            )}

            {/* Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, activeTab === 'clan' && styles.tabActive]} onPress={() => setActiveTab('clan')}>
                <Text style={[styles.tabText, activeTab === 'clan' && styles.tabTextActive]}>MON CLAN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeTab === 'discover' && styles.tabActive]} onPress={() => setActiveTab('discover')}>
                <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>DÉCOUVRIR</Text>
              </TouchableOpacity>
            </View>

            {/* Pending self story */}
            {myPendingStory && (
              <View style={styles.pendingCard}>
                <Ionicons name="time-outline" size={18} color="#8E8E93" />
                <Text style={styles.pendingText}>Ta story est en cours de vérification. Généralement sous 24h.</Text>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.authorPseudo[0]}</Text></View>
              <Text style={styles.author}>{item.authorPseudo} (Niv. {item.authorLevel})</Text>
              <View style={styles.milestoneBadge}><Text style={styles.milestoneBadgeText}>{item.milestoneLabel}</Text></View>
            </View>

            <View style={styles.contentSection}>
              <Text style={styles.labelHard}>LE PLUS DUR</Text>
              <Text style={styles.sectionText} numberOfLines={3}>{item.answers.hardest}</Text>
              <TouchableOpacity onPress={() => setSelectedStory(item)}>
                <Text style={styles.readMore}>Lire la suite</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={[styles.reactBtn, item.userHasReactedHelped && styles.reactBtnActive]} onPress={() => handleReact(item.id)}>
                <Text style={item.userHasReactedHelped ? styles.reactActiveText : styles.reactText}>🙌 Ça m'a aidé ({item.helpedCount})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentCountBtn}>
                <Ionicons name="chatbubble-outline" size={14} color="#8E8E93" />
                <Text style={styles.commentCountText}> {item.commentCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportBtn} onPress={() => handleReport(item.id)}>
                <Ionicons name="flag-outline" size={14} color="#5A5A5A" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', fontFamily: 'Montserrat-Bold' },
  redDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF2D55' },
  featuredBanner: { backgroundColor: '#16213E', borderRadius: 20, borderWidth: 1.5, borderColor: '#FFD700', padding: 18, margin: 16 },
  featuredBadge: { fontSize: 10, fontWeight: 'bold', color: '#FFD700', fontFamily: 'Montserrat-Bold' },
  featuredText: { color: '#FFFFFF', fontSize: 13, marginTop: 8 },
  featuredMeta: { color: '#8E8E93', fontSize: 11, marginTop: 8 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 10, padding: 3, marginHorizontal: 16, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#FFD700' },
  tabText: { color: '#8E8E93', fontWeight: 'bold', fontSize: 12 },
  tabTextActive: { color: '#0F0F1A' },
  pendingCard: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, borderStyle: 'dashed', borderWidth: 1, borderColor: '#5A5A5A', margin: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingText: { color: '#8E8E93', fontSize: 12, flex: 1 },
  card: { backgroundColor: '#16213E', borderRadius: 18, padding: 16, marginHorizontal: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E94560', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  author: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  milestoneBadge: { marginLeft: 'auto', backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  milestoneBadgeText: { color: '#FFD700', fontSize: 9, fontWeight: 'bold' },
  contentSection: { marginTop: 6 },
  labelHard: { fontSize: 9, fontWeight: 'bold', color: '#FF2D55', letterSpacing: 1 },
  sectionText: { color: '#FFFFFF', fontSize: 12, marginTop: 4, lineHeight: 17 },
  readMore: { color: '#FFD700', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1A1A2E' },
  reactBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'transparent' },
  reactBtnActive: { backgroundColor: 'rgba(0,217,165,0.12)' },
  reactText: { color: '#8E8E93', fontSize: 11, fontWeight: 'bold' },
  reactActiveText: { color: '#00D9A5', fontSize: 11, fontWeight: 'bold' },
  commentCountBtn: { flexDirection: 'row', alignItems: 'center' },
  commentCountText: { color: '#8E8E93', fontSize: 11 },
  reportBtn: { padding: 4 }
});
`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source de l'écran des Récits copié ! 🛡️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* CONTROLEUR DU SIMULATEUR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Communauté & Transmission — Stories (6.4)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Partage de Récits & Paliers d'Élite — StoriesScreen
          </h2>
          <p className="text-xs text-gray-400">
            Intègre les récits structurés aux paliers de sobriété clés avec un filet de sécurité immédiat en cas de détresse neurologique.
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
              <h4 className="text-xs font-headline font-black text-white font-sans">StoriesScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500 font-sans">
                Fichier de composition guidée, filtres anti-rechute et liaison directe avec le protocole souverain d'entraide.
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

      {/* DEUX PANNEAUX : CONTROLES GAUCHE & SMARTPHONE SIMULATEUR DROITE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANNEAU GAUCHE: CONSOLE DE SIMULATION */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console d'Administration & Métriques
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Modifiez votre sobriété actuelle pour déverrouiller la rédaction de votre récit de palier.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Streak Adjuster */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Jours de sobriété accumulés :</span>
                <span className="text-[#FFD700] font-black">{simulatedStreak} Jours</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[5, 7, 15, 30, 45, 90, 120, 365].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSimulatedStreak(d);
                      addToast('info', `Série simulée à ${d} jours !`);
                    }}
                    className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all ${simulatedStreak === d ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' : 'bg-transparent text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'}`}
                  >
                    Jour {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Adjuster */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Niveau de l'utilisateur :</span>
                <span className="text-[#00D9A5] font-black">Niveau {simulatedLevel}</span>
              </div>
              <input 
                type="range" min="1" max="40" step="1" value={simulatedLevel} 
                onChange={(e) => setSimulatedLevel(parseInt(e.target.value))}
                className="w-full accent-[#00D9A5] h-1 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulated distress injector (test safety loop) */}
            <div className="space-y-2 p-3 bg-red-950/10 border border-red-900/20 rounded-2xl">
              <span className="text-[10px] font-headline text-red-400 block uppercase tracking-wide">Test du Filet de Sécurité</span>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Le système surveille les expressions suicidaires ou d'auto-mutilation de manière préventive pour déclencher l'accès immédiat au Coach IA.
              </p>
              <button
                onClick={() => {
                  setIsComposerOpen(true);
                  setComposerStep(1);
                  setComposerAnswers({
                    hardest: "Je n'en peux plus, j'ai envie d'en finir avec ma vie ce soir car tout est trop lourd.",
                    whatChanged: "Rien ne va.",
                    advice: "Aidez-moi."
                  });
                  addToast('info', "Formulaire pré-rempli avec des signaux de détresse critique pour tester le filet de sécurité 🛡️");
                }}
                className="w-full py-1.5 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-200 border border-red-900/30 rounded-xl text-[10px] font-bold transition-all text-center uppercase tracking-wider"
              >
                Injecter détresse critique
              </button>
            </div>

            {/* Info and help cards */}
            <div className="text-xs bg-[#16213E]/30 p-4 rounded-2xl border border-[#1C1C3A] space-y-2 leading-relaxed text-gray-300 font-sans">
              <span className="text-[10px] text-[#00D9A5] font-mono uppercase font-black block">Anatomie de la Transformation</span>
              <p>
                Contrairement aux réseaux habituels où l'on relate les détails morbides de la chute (re-déclencheurs), la structure d'écriture d'ALPHA MAN oblige le cerveau à se concentrer sur les étapes positives du rétablissement.
              </p>
            </div>

          </div>
        </div>

        {/* PANNEAU DROIT: SMARTPHONE EMULATOR SCREEN */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-[400px] aspect-[9/19] bg-[#0F0F1A] border-[10px] border-[#1C1C3A] rounded-[48px] overflow-hidden shadow-2xl relative flex flex-col font-sans">
            
            {/* STATUS BAR */}
            <div className="h-6 bg-[#0F0F1A] px-6 flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="w-4 h-2.5 bg-gray-600 rounded-sm" />
              </div>
            </div>

            {/* HEADER INTERACTIVE */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-[#1A1A2E] bg-[#0F0F1A]">
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/60 text-white hover:bg-[#16213E] transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs font-headline font-black text-[#FFD700] tracking-widest uppercase">
                RÉCITS
              </span>
              <button 
                onClick={() => {
                  setShowNotificationBadge(false);
                  addToast('info', "Vos notifications ont été marquées comme lues ! 🔔");
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/60 text-[#FFD700] relative hover:bg-[#16213E] transition-all"
              >
                <Bell className="w-5 h-5" />
                {showNotificationBadge && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#FF2D55] rounded-full border border-[#0F0F1A]" />
                )}
              </button>
            </div>

            {/* SCROLLABLE MAIN STREAM */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
              
              {/* BANNIÈRE STORY DE LA SEMAINE */}
              {featuredStory && (
                <div 
                  onClick={() => setSelectedStoryId(featuredStory.id)}
                  className="bg-gradient-to-b from-[#16213E] to-[#1A1A2E] rounded-3xl border-1.5 border-[#FFD700] p-4 text-left cursor-pointer hover:border-[#FFD700]/80 transition-all shadow-md group"
                >
                  <span className="text-[10px] font-bold text-[#FFD700] tracking-wide block uppercase flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" />
                    STORY DE LA SEMAINE
                  </span>
                  <p className="text-xs text-white mt-2 leading-relaxed font-sans line-clamp-2 italic group-hover:text-white/90">
                    "{featuredStory.answers.hardest}"
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 font-sans">
                    <span className="font-semibold text-white">{featuredStory.authorPseudo}</span>
                    <span>•</span>
                    <span>Niv. {featuredStory.authorLevel}</span>
                    <span className="ml-auto bg-[#FFD700]/15 text-[#FFD700] px-1.5 py-0.5 rounded text-[8px] font-bold">
                      {featuredStory.milestoneLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* TOGGLE MON CLAN / DÉCOUVRIR */}
              <div className="flex bg-[#1A1A2E] p-1 rounded-xl border border-[#252542]">
                <button
                  onClick={() => {
                    setActiveTab('clan');
                    addToast('info', "Affichage du flux de clan d'élite 🛡️");
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wide ${activeTab === 'clan' ? 'bg-[#FFD700] text-[#0F0F1A]' : 'text-gray-400 hover:text-white'}`}
                >
                  Mon Clan
                </button>
                <button
                  onClick={() => {
                    setActiveTab('discover');
                    addToast('info', "Découvrez la sélection éditoriale de la communauté 🌍");
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wide ${activeTab === 'discover' ? 'bg-[#FFD700] text-[#0F0F1A]' : 'text-gray-400 hover:text-white'}`}
                >
                  Découvrir
                </button>
              </div>

              {/* BANDEAU DE DÉCLENCHEMENT DE PALIER */}
              {isBandeauPalierVisible && (
                <div className="bg-[#FFD700]/10 border-1.5 border-[#FFD700] rounded-2xl p-4 text-left animate-[pulse_3s_infinite] transition-all">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FFD700]" />
                    <span className="text-xs font-extrabold text-white font-headline">Palier Atteint ! 🏆</span>
                  </div>
                  <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                    Tu viens d'atteindre {simulatedStreak} jours souverains. Raconte ton chemin pour guider tes frères d'armes ?
                  </p>
                  
                  <button
                    onClick={() => {
                      setComposerStep(1);
                      setIsComposerOpen(true);
                    }}
                    className="w-full mt-3 h-9 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    ÉCRIRE MA STORY
                  </button>
                  
                  <button 
                    onClick={() => {
                      addToast('info', "Masqué temporairement. Les frères t'attendent !");
                    }}
                    className="w-full text-center text-[9px] text-gray-500 hover:text-gray-400 mt-2 block underline"
                  >
                    Pas maintenant
                  </button>
                </div>
              )}

              {/* MA STORY EN ATTENTE */}
              {myPendingStory && (
                <div className="bg-[#1A1A2E] border border-dashed border-[#5A5A5A] rounded-2xl p-3 flex items-start gap-2.5 text-left">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white font-bold block">Votre Story en attente de relecture</span>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                      Généralement approuvée sous 24h par notre conseil d'entraide souverain.
                    </p>
                    <button 
                      onClick={() => setSelectedStoryId(myPendingStory.id)}
                      className="text-[9px] text-[#FFD700] underline mt-1 font-bold block"
                    >
                      Inspecter mon texte
                    </button>
                  </div>
                </div>
              )}

              {/* LIST OF STORIES */}
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
                  <div className="w-6 h-6 border-2 border-t-transparent border-[#FFD700] rounded-full animate-spin" />
                  <span>Actualisation de la lignée...</span>
                </div>
              ) : stories.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-xs font-sans">
                  Aucun récit n'a été publié pour ce clan actuellement.
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((item, index) => (
                    <div 
                      key={item.id}
                      style={{ animationDelay: `${index * 60}ms` }}
                      className="bg-[#16213E] rounded-3xl p-4 text-left border border-[#1F2E54]/40 animate-[fade-in-up_0.4s_ease-out_forwards] flex flex-col"
                    >
                      {/* HEADER */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E94560] to-[#FFD700] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                          {item.authorPseudo[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {item.authorPseudo}
                          </span>
                          <span className="text-[9px] text-gray-400 block font-mono">
                            Niveau {item.authorLevel}
                          </span>
                        </div>
                        <div className="ml-auto bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded text-[8px] font-bold text-[#FFD700] uppercase tracking-wider">
                          {item.milestoneLabel}
                        </div>
                      </div>

                      {/* STRUCTURING CONTENT */}
                      <div className="mt-3.5 space-y-1.5">
                        <span className="text-[8px] font-bold text-[#FF2D55] tracking-wider uppercase block">
                          LE PLUS DUR
                        </span>
                        <p className="text-[11px] text-gray-200 leading-relaxed font-sans line-clamp-3">
                          {item.answers.hardest}
                        </p>
                        <button 
                          onClick={() => setSelectedStoryId(item.id)}
                          className="text-[10px] text-[#FFD700] hover:underline font-bold block"
                        >
                          Lire la suite
                        </button>
                      </div>

                      {/* FOOTER ACTIONS */}
                      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#1F2E54]/30">
                        <button 
                          onClick={() => handleReactHelped(item.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${item.userHasReactedHelped ? 'bg-[#00D9A5]/12 text-[#00D9A5]' : 'bg-transparent text-gray-400 hover:text-white'}`}
                        >
                          🙌 Ça m'a aidé ({item.helpedCount})
                        </button>
                        
                        <button 
                          onClick={() => setSelectedStoryId(item.id)}
                          className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-white"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{item.commentCount}</span>
                        </button>

                        <button 
                          onClick={() => handleReportContent(item.id)}
                          className="text-gray-600 hover:text-red-400 p-1"
                          title="Signaler ce récit"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* COMPOSER MODAL (STEPS 1-2-3) */}
            {isComposerOpen && (
              <div className="absolute inset-0 bg-[#0F0F1A] z-40 flex flex-col p-5 animate-[slide-up_0.3s_ease-out_forwards] text-left">
                
                {/* COMPOSER HEADER */}
                <div className="flex items-center justify-between border-b border-[#1A1A2E] pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FFD700]" />
                    <span className="text-xs font-headline font-black text-white">ÉCRIRE MA STORY</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (composerAnswers.hardest || composerAnswers.whatChanged || composerAnswers.advice) {
                        if (confirm("Voulez-vous vraiment abandonner votre brouillon de récit ?")) {
                          setIsComposerOpen(false);
                        }
                      } else {
                        setIsComposerOpen(false);
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-white font-bold"
                  >
                    Annuler
                  </button>
                </div>

                {/* PROGRESS COUNTER */}
                <div className="flex gap-1.5 mt-4 shrink-0">
                  {[1, 2, 3].map((step) => (
                    <div 
                      key={step} 
                      className={`h-1 flex-1 rounded-full transition-all ${composerStep >= step ? 'bg-[#FFD700]' : 'bg-gray-800'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1 shrink-0">
                  <span>Étape {composerStep} sur 3</span>
                  <span>Palier simulé : {simulatedStreak} Jours</span>
                </div>

                {/* CURRENT STEP QUESTION */}
                <div className="flex-1 flex flex-col mt-4 justify-between">
                  <div className="space-y-4">
                    {composerStep === 1 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#FF2D55] tracking-wider uppercase block">
                          QUESTION 1/3
                        </span>
                        <h4 className="text-xs font-black text-white">
                          Qu'est-ce qui a été le plus dur pour toi jusqu'ici ?
                        </h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                          Exemple : "Gérer les impulsions de fatigue le soir" ou "Changer mes habitudes d'écran dans le lit".
                        </p>
                        <textarea
                          value={composerAnswers.hardest}
                          onChange={(e) => setComposerAnswers(prev => ({ ...prev, hardest: e.target.value }))}
                          maxLength={500}
                          placeholder="Saisissez votre expérience constructive... (minimum 40 caractères)"
                          className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-[#FFD700] placeholder-gray-600 h-28 resize-none"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                          <span>Min: 40, Max: 500</span>
                          <span className={composerAnswers.hardest.length < 40 ? 'text-[#FF2D55]' : 'text-[#00D9A5]'}>
                            {composerAnswers.hardest.length} / 500
                          </span>
                        </div>
                      </div>
                    )}

                    {composerStep === 2 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#00D9A5] tracking-wider uppercase block">
                          QUESTION 2/3
                        </span>
                        <h4 className="text-xs font-black text-white">
                          Qu'est-ce qui a radicalement changé depuis que tu tiens ?
                        </h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                          Exemple : "Un niveau d'énergie physique inédit au sport" ou "Une fierté retrouvée dans mes yeux le matin".
                        </p>
                        <textarea
                          value={composerAnswers.whatChanged}
                          onChange={(e) => setComposerAnswers(prev => ({ ...prev, whatChanged: e.target.value }))}
                          maxLength={500}
                          placeholder="Saisissez vos transformations physiques et cognitives... (minimum 40 caractères)"
                          className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-[#FFD700] placeholder-gray-600 h-28 resize-none"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                          <span>Min: 40, Max: 500</span>
                          <span className={composerAnswers.whatChanged.length < 40 ? 'text-[#FF2D55]' : 'text-[#00D9A5]'}>
                            {composerAnswers.whatChanged.length} / 500
                          </span>
                        </div>
                      </div>
                    )}

                    {composerStep === 3 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#FFD700] tracking-wider uppercase block">
                          QUESTION 3/3
                        </span>
                        <h4 className="text-xs font-black text-white">
                          Quel conseil souverain partages-tu avec un débutant ?
                        </h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                          Exemple : "Mets ton téléphone hors de portée et prends une douche glacée en cas d'alerte rouge".
                        </p>
                        <textarea
                          value={composerAnswers.advice}
                          onChange={(e) => setComposerAnswers(prev => ({ ...prev, advice: e.target.value }))}
                          maxLength={500}
                          placeholder="Transmettez vos armes de combat de manière factuelle... (minimum 40 caractères)"
                          className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-[#FFD700] placeholder-gray-600 h-28 resize-none"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                          <span>Min: 40, Max: 500</span>
                          <span className={composerAnswers.advice.length < 40 ? 'text-[#FF2D55]' : 'text-[#00D9A5]'}>
                            {composerAnswers.advice.length} / 500
                          </span>
                        </div>
                      </div>
                    )}

                    {/* FILET DE SÉCURITÉ IMMÉDIAT (DETECTION VISUELLE CLIENT) */}
                    {composerSafetyTriggered && (
                      <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-xl space-y-2 mt-2 animate-[pulse_2s_infinite]">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-[#FF2D55]" />
                          <span className="text-[10px] font-bold text-white uppercase">Soutien Émotionnel Détecté 🛡️</span>
                        </div>
                        <p className="text-[10px] text-gray-300 leading-relaxed">
                          On dirait que tu traverses un moment très difficile neurologiquement. Tu peux quand même envoyer ton récit — mais en attendant, tu n'es pas seul.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              addToast('info', "Redirection simulée vers le Coach d'urgence IA...");
                              setIsComposerOpen(false);
                              if (onBack) onBack(); // redirect to parent chat simulator
                            }}
                            className="bg-[#FFD700] text-[#0F0F1A] px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider"
                          >
                            Parler au Coach maintenant
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* NAVIGATION BUTTONS */}
                  <div className="flex gap-3 mt-4">
                    {composerStep > 1 && (
                      <button
                        onClick={() => setComposerStep(prev => (prev - 1) as any)}
                        className="flex-1 h-10 border border-gray-800 text-white rounded-xl text-xs font-bold uppercase transition-all"
                      >
                        Précédent
                      </button>
                    )}
                    
                    {composerStep < 3 ? (
                      <button
                        disabled={
                          (composerStep === 1 && composerAnswers.hardest.length < 40) ||
                          (composerStep === 2 && composerAnswers.whatChanged.length < 40)
                        }
                        onClick={() => setComposerStep(prev => (prev + 1) as any)}
                        className="flex-1 h-10 bg-[#FFD700] disabled:bg-gray-800 disabled:text-gray-500 text-[#0F0F1A] rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        disabled={composerAnswers.advice.length < 40}
                        onClick={handleSubmitStory}
                        className="flex-1 h-10 bg-[#00D9A5] disabled:bg-gray-800 disabled:text-gray-500 text-[#0F0F1A] rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
                      >
                        Publier ma story
                      </button>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* DETAIL STORY VIEW & COMMENTS */}
            {selectedStoryId && storyDetail && (
              <div className="absolute inset-0 bg-[#0F0F1A] z-40 flex flex-col animate-[slide-up_0.3s_ease-out_forwards] text-left">
                
                {/* DETAIL HEADER */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-[#1A1A2E] shrink-0 bg-[#0F0F1A]">
                  <button 
                    onClick={() => setSelectedStoryId(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#16213E]"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase">
                    RÉCIT EN DÉTAIL
                  </span>
                  <div className="w-8 h-8" /> {/* Spacer */}
                </div>

                {/* SCROLLABLE FULL CARD & COMMENTS */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  
                  {/* FULL CARD DETAILS */}
                  <div className="bg-[#16213E] rounded-3xl p-4 border border-[#1F2E54]/40">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E94560] to-[#FFD700] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                        {storyDetail.authorPseudo[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">
                          {storyDetail.authorPseudo}
                        </span>
                        <span className="text-[9px] text-gray-400 block font-mono">
                          Niveau {storyDetail.authorLevel}
                        </span>
                      </div>
                      <div className="ml-auto bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded text-[8px] font-bold text-[#FFD700] uppercase">
                        {storyDetail.milestoneLabel}
                      </div>
                    </div>

                    {/* Q1 */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[8px] font-bold text-[#FF2D55] tracking-wider uppercase block">
                        LE PLUS DUR
                      </span>
                      <p className="text-[11px] text-gray-200 leading-relaxed font-sans">
                        {storyDetail.answers.hardest}
                      </p>
                    </div>

                    {/* Q2 */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[8px] font-bold text-[#00D9A5] tracking-wider uppercase block">
                        CE QUI A CHANGÉ
                      </span>
                      <p className="text-[11px] text-gray-200 leading-relaxed font-sans">
                        {storyDetail.answers.whatChanged}
                      </p>
                    </div>

                    {/* Q3 */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-[#FFD700] tracking-wider uppercase block">
                        MON CONSEIL SOUVERAIN
                      </span>
                      <p className="text-[11px] text-gray-200 leading-relaxed font-sans italic">
                        "{storyDetail.answers.advice}"
                      </p>
                    </div>

                    {/* FOOTER STATS */}
                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[#1F2E54]/30">
                      <button 
                        onClick={() => handleReactHelped(storyDetail.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${storyDetail.userHasReactedHelped ? 'bg-[#00D9A5]/12 text-[#00D9A5]' : 'bg-transparent text-gray-400 hover:text-white'}`}
                      >
                        🙌 Ça m'a aidé ({storyDetail.helpedCount})
                      </button>

                      <span className="text-[9px] text-gray-500 font-mono">
                        Statut : {storyDetail.status.toUpperCase()}
                      </span>
                    </div>

                  </div>

                  {/* COMMENTS SECTION HEADER */}
                  <div className="border-b border-gray-800 pb-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Commentaires ({comments.length})
                    </span>
                    <span className="text-[9px] text-gray-500">Min. 20 caractères</span>
                  </div>

                  {/* COMMENTS LIST */}
                  {comments.length === 0 ? (
                    <p className="text-center text-[10px] text-gray-500 py-4 italic">
                      Aucun commentaire d'entraide pour l'instant. Soyez le premier !
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-[#1A1A2E] p-3 rounded-2xl border border-gray-850">
                          <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans">
                            <span className="font-bold text-white">{comment.authorPseudo} (Niv. {comment.authorLevel})</span>
                            <span className="text-[8px] font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-gray-300 mt-1 leading-relaxed font-sans">
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COMMENT DISTRESS FEEDBACK */}
                  {commentSafetyTriggered && (
                    <div className="bg-red-950/20 border border-red-900/40 p-2.5 rounded-xl space-y-1 text-left animate-pulse">
                      <span className="text-[9px] font-bold text-[#FF2D55] uppercase block">Assistance de crise détectée 🛡️</span>
                      <p className="text-[9px] text-gray-300 leading-normal">
                        Prends soin de toi. Ton message va être examiné par notre équipe d'entraide humaine en priorité.
                      </p>
                    </div>
                  )}

                </div>

                {/* BOTTOM COMMENT INPUT BAR */}
                <div className="p-3 border-t border-[#1A1A2E] bg-[#0F0F1A] flex gap-2 items-center shrink-0">
                  <TextInput
                    value={newCommentText}
                    onChangeText={setNewCommentText}
                    placeholder="Encouragez ce guerrier... (min 20 chars)"
                    placeholderTextColor="#5A5A5A"
                    className="flex-1 bg-[#16213E] text-white border border-[#1C1C3A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FFD700]"
                  />
                  <button 
                    disabled={newCommentText.trim().length < 20 || isSubmittingComment}
                    onClick={handleSubmitComment}
                    className="w-9 h-9 bg-[#FFD700] hover:bg-[#FFD700]/90 disabled:bg-gray-800 disabled:text-gray-500 text-[#0F0F1A] rounded-xl flex items-center justify-center shrink-0 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

// Simple custom TextInput emulator matching react-native specs for local preview compiling
interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({ 
  value, 
  onChangeText, 
  placeholder, 
  className 
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default StoriesScreen;
