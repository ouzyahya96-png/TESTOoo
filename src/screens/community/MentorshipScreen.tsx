import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Check, 
  Send, 
  MessageSquare, 
  Code, 
  Copy, 
  User, 
  Users, 
  Trophy, 
  Info,
  Shield, 
  Heart, 
  X,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface MentorshipScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  userId?: string;
}

interface MentorProfile {
  id: string;
  pseudo: string;
  level: number;
  streak: number;
  sharedTriggers: string[];
  allTriggers: string[];
  menteesHelpedCount: number;
  storyExcerpt: string | null;
}

interface MenteeProfile {
  id: string;
  pseudo: string;
  level: number;
  streak: number;
  sharedTriggers: string[];
  allTriggers: string[];
  lastActive: string;
}

interface PendingRequest {
  requestId: string;
  requesterId: string;
  pseudo: string;
  level: number;
  sharedTriggers: string[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderPseudo: string;
  senderLevel: number;
  text: string;
  isSystemMessage: boolean;
  createdAt: string;
}

export const MentorshipScreen: React.FC<MentorshipScreenProps> = ({
  addToast,
  onBack,
  userId = 'user-777'
}) => {
  const isMounted = useRef<boolean>(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Layout and view states
  const [activeView, setActiveView] = useState<'find' | 'become'>('find');
  const [openChatWith, setOpenChatWith] = useState<{ id: string; pseudo: string; isMentee: boolean } | null>(null);
  
  // Status states
  const [currentMentor, setCurrentMentor] = useState<MentorProfile | null>(null);
  const [isMentorActive, setIsMentorActive] = useState<boolean>(false);
  const [isEligibleToMentor, setIsEligibleToMentor] = useState<boolean>(true);
  const [currentStreak, setCurrentStreak] = useState<number>(65);
  const [eligibilityThreshold, setEligibilityThreshold] = useState<number>(60);
  
  // Data lists
  const [suggestedMentors, setSuggestedMentors] = useState<MentorProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [currentMentees, setCurrentMentees] = useState<MenteeProfile[]>([]);
  
  // Interaction states
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [selectedTriggersForMentoring, setSelectedTriggersForMentoring] = useState<string[]>(['Stress', 'Soir seul']);
  const [showEndMentorshipConfirm, setShowEndMentorshipConfirm] = useState<boolean>(false);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // 1-to-1 Chat specific states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [showSafetyDialog, setShowSafetyDialog] = useState<boolean>(false);

  // Constants
  const availableTriggers = ['Stress', 'Ennui', 'Soir seul', 'Réseaux sociaux', 'Fatigue', 'Frustration'];
  const userTriggers = ['Stress', 'Soir seul']; // Simulated user onboarding triggers

  // Distress safety check
  const distressKeywords = [
    'suicide', 'suicider', 'mutiler', 'mutilation', 'finir mes jours', 'en finir', 'mourir',
    'veux crever', 'veux mourir', 'auto-mutiler', 'tuer moi', 'me tuer', 'plus envie de vivre'
  ];

  const checkTextForDistress = (text: string): boolean => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return distressKeywords.some(kw => normalized.includes(kw));
  };

  // Fetch complete mentorship context
  const fetchStatusAndData = useCallback(async () => {
    try {
      // 1. Status
      const statusRes = await fetch(`/api/community/${userId}/mentorship/status`);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setCurrentMentor(data.currentMentor);
        setIsMentorActive(data.isMentorActive);
        setIsEligibleToMentor(data.isEligibleToMentor);
        setCurrentStreak(data.currentStreak);
        setEligibilityThreshold(data.threshold);
      }

      // 2. Suggestions
      const suggestedRes = await fetch(`/api/community/${userId}/mentorship/suggested`);
      if (suggestedRes.ok) {
        const data = await suggestedRes.json();
        setSuggestedMentors(data);
      }

      // 3. Requests if user is a mentor
      const reqRes = await fetch(`/api/community/${userId}/mentorship/requests`);
      if (reqRes.ok) {
        const data = await reqRes.json();
        setPendingRequests(data);
      }

      // 4. Mentees if user is a mentor
      const menteesRes = await fetch(`/api/community/${userId}/mentorship/mentees`);
      if (menteesRes.ok) {
        const data = await menteesRes.json();
        setCurrentMentees(data);
      }

    } catch (err) {
      console.error('Failed to load mentorship status:', err);
    }
  }, [userId]);

  // Chat messages polling or fetch
  const fetchChatMessages = useCallback(async () => {
    if (!openChatWith) return;
    const conversationId = openChatWith.isMentee ? `chat-${openChatWith.id}` : `chat-mentor-1`;
    try {
      const res = await fetch(`/api/community/${userId}/mentorship/chat/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  }, [userId, openChatWith]);

  useEffect(() => {
    isMounted.current = true;
    fetchStatusAndData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchStatusAndData]);

  // Polling for chat messages if open
  useEffect(() => {
    if (!openChatWith) return;
    fetchChatMessages();
    const interval = setInterval(() => {
      if (isMounted.current) {
        fetchChatMessages();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [openChatWith, fetchChatMessages]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Request a mentor
  const handleRequestMentor = async (mentorId: string, mentorPseudo: string) => {
    if (navigator.vibrate) navigator.vibrate(60); // Haptic Medium
    setSentRequests(prev => [...prev, mentorId]);
    
    try {
      const res = await fetch(`/api/community/${userId}/mentorship/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId })
      });
      if (res.ok) {
        const data = await res.json();
        addToast('success', `Votre demande a été envoyée avec succès à ${mentorPseudo} 🎖️`);
        setCurrentMentor(data.currentMentor);
      } else {
        addToast('error', "Une erreur est survenue lors de la demande.");
        setSentRequests(prev => prev.filter(id => id !== mentorId));
      }
    } catch (err) {
      console.error(err);
      addToast('error', "Une erreur réseau est survenue.");
      setSentRequests(prev => prev.filter(id => id !== mentorId));
    }
  };

  // Terminate mentorship
  const handleEndMentorship = async () => {
    try {
      const res = await fetch(`/api/community/${userId}/mentorship/end`, { method: 'POST' });
      if (res.ok) {
        addToast('info', "Relation de mentorat clôturée avec respect et gratitude. 🙌");
        setCurrentMentor(null);
        setShowEndMentorshipConfirm(false);
        fetchStatusAndData();
      }
    } catch (err) {
      console.error(err);
      addToast('error', "Échec de la clôture du mentorat.");
    }
  };

  // Register as Mentor
  const handleActivateMentorStatus = async () => {
    if (navigator.vibrate) navigator.vibrate(60); // Haptic Medium
    try {
      const res = await fetch(`/api/community/${userId}/mentorship/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggers: selectedTriggersForMentoring })
      });
      if (res.ok) {
        addToast('success', "Vous êtes officiellement Mentor souverain ! Votre badge d'Honneur a été débloqué 🎖️");
        setIsMentorActive(true);
        fetchStatusAndData();
      }
    } catch (err) {
      console.error(err);
      addToast('error', "Échec de l'activation du statut de mentor.");
    }
  };

  // Toggle trigger selection for mentorship
  const toggleTriggerSelection = (trigger: string) => {
    if (selectedTriggersForMentoring.includes(trigger)) {
      if (selectedTriggersForMentoring.length > 1) {
        setSelectedTriggersForMentoring(prev => prev.filter(t => t !== trigger));
      } else {
        addToast('warning', "Veuillez sélectionner au moins un déclencheur d'accompagnement.");
      }
    } else {
      setSelectedTriggersForMentoring(prev => [...prev, trigger]);
    }
  };

  // Accept request
  const handleAcceptRequest = async (requestId: string, requesterPseudo: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    try {
      const res = await fetch(`/api/community/${userId}/mentorship/requests/${requestId}/accept`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast('success', `Vous accompagnez désormais ${requesterPseudo} dans sa souveraineté ! ⚔️`);
        fetchStatusAndData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Decline request
  const handleDeclineRequest = async (requestId: string) => {
    // Discreetly decline, no notification
    try {
      const res = await fetch(`/api/community/${userId}/mentorship/requests/${requestId}/decline`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast('info', "Demande écartée discrètement pour préserver l'intimité.");
        fetchStatusAndData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send 1-to-1 chat message
  const handleSendChatMessage = async () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !openChatWith) return;

    if (navigator.vibrate) navigator.vibrate(40); // Light haptic

    const hasDistress = checkTextForDistress(trimmed);
    const conversationId = openChatWith.isMentee ? `chat-${openChatWith.id}` : `chat-mentor-1`;

    const optimisticMsg: ChatMessage = {
      id: `m-optimistic-${Date.now()}`,
      senderId: userId,
      senderPseudo: 'Moi',
      senderLevel: 12,
      text: trimmed,
      isSystemMessage: false,
      createdAt: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, optimisticMsg]);
    setMessageInput('');

    if (hasDistress) {
      setShowSafetyDialog(true);
    }

    try {
      const res = await fetch(`/api/community/${userId}/mentorship/chat/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          clientSafetyFlag: hasDistress
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data.message : m));
        if (data.safetyTriggered) {
          addToast('warning', "Message transmis. Support psychologique activé parallèlement 🛡️");
        }
      } else {
        setChatMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        addToast('error', "Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      addToast('error', "Erreur réseau.");
    }
  };

  // Native React Native Expo Code source
  const nativeExpoCode = `import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  FlatList, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function MentorshipScreen({ navigation, route }) {
  const userId = route?.params?.userId || 'user-777';
  const [activeView, setActiveView] = useState('find'); // 'find' | 'become'
  const [currentMentor, setCurrentMentor] = useState(null);
  const [isMentorActive, setIsMentorActive] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const [streak, setStreak] = useState(65);
  const [suggested, setSuggested] = useState([]);
  const [requests, setRequests] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [selectedTriggers, setSelectedTriggers] = useState(['Stress', 'Soir seul']);

  const [openChat, setOpenChat] = useState(null); // { id, pseudo, isMentee }
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showSafety, setShowSafety] = useState(false);

  const availableTriggers = ['Stress', 'Ennui', 'Soir seul', 'Réseaux sociaux', 'Fatigue', 'Frustration'];

  const fetchAll = useCallback(async () => {
    try {
      const sRes = await fetch(\`/api/community/\${userId}/mentorship/status\`);
      if (sRes.ok) {
        const d = await sRes.json();
        setCurrentMentor(d.currentMentor);
        setIsMentorActive(d.isMentorActive);
        setIsEligible(d.isEligibleToMentor);
        setStreak(d.currentStreak);
      }
      const sugRes = await fetch(\`/api/community/\${userId}/mentorship/suggested\`);
      if (sugRes.ok) setSuggested(await sugRes.json());

      const rRes = await fetch(\`/api/community/\${userId}/mentorship/requests\`);
      if (rRes.ok) setRequests(await rRes.json());

      const mRes = await fetch(\`/api/community/\${userId}/mentorship/mentees\`);
      if (mRes.ok) setMentees(await mRes.json());
    } catch(e) { console.log(e); }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const requestMentor = async (id, pseudo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await fetch(\`/api/community/\${userId}/mentorship/request\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId: id })
    });
    if (res.ok) {
      Alert.alert("Succès", \`Demande envoyée à \${pseudo} !\`);
      fetchAll();
    }
  };

  const acceptRequest = async (id, pseudo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await fetch(\`/api/community/\${userId}/mentorship/requests/\${id}/accept\`, { method: 'POST' });
    if (res.ok) {
      Alert.alert("Succès", \`Vous accompagnez désormais \${pseudo} !\`);
      fetchAll();
    }
  };

  const declineRequest = async (id) => {
    await fetch(\`/api/community/\${userId}/mentorship/requests/\${id}/decline\`, { method: 'POST' });
    fetchAll();
  };

  const activateMentor = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await fetch(\`/api/community/\${userId}/mentorship/activate\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggers: selectedTriggers })
    });
    if (res.ok) {
      Alert.alert("Félicitations", "Vous êtes officiellement Mentor souverain !");
      fetchAll();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MENTORAT</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeView === 'find' && styles.tabActive]}
          onPress={() => setActiveView('find')}
        >
          <Text style={[styles.tabText, activeView === 'find' && styles.tabTextActive]}>Trouver un Mentor</Text>
          {currentMentor && <View style={styles.dot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeView === 'become' && styles.tabActive]}
          onPress={() => setActiveView('become')}
        >
          <Text style={[styles.tabText, activeView === 'become' && styles.tabTextActive]}>Devenir Mentor</Text>
          {(requests.length > 0) && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {activeView === 'find' ? (
          currentMentor ? (
            <View style={styles.activeMentorCard}>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{currentMentor.pseudo[0]}</Text></View>
                <View>
                  <Text style={styles.mentorName}>{currentMentor.pseudo}</Text>
                  <Text style={styles.mentorSub}>Ton mentor • Niv.{currentMentor.level}</Text>
                </View>
              </View>
              <Text style={styles.streakText}>{currentMentor.streak} jours de souveraineté</Text>
              <TouchableOpacity 
                style={styles.chatBtn}
                onPress={() => setOpenChat({ id: currentMentor.id, pseudo: currentMentor.pseudo, isMentee: false })}
              >
                <Text style={styles.chatBtnText}>Ouvrir la conversation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={styles.infoText}>On te propose des mentors qui ont traversé des déclencheurs proches des tiens.</Text>
              {suggested.map(item => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{item.pseudo[0]}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pseudoText}>{item.pseudo} <Text style={styles.badgeText}>🎖️ MENTOR</Text></Text>
                      <Text style={styles.streakSub}>{item.streak} jours de résistance</Text>
                    </View>
                  </View>
                  <View style={styles.chipsRow}>
                    {item.allTriggers.map((t, idx) => (
                      <View key={idx} style={[styles.chip, selectedTriggers.includes(t) ? styles.chipGold : styles.chipGrey]}>
                        <Text style={styles.chipText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.excerptText}>"{item.storyExcerpt}"</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => requestMentor(item.id, item.pseudo)}>
                    <Text style={styles.actionBtnText}>Demander à être guidé</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
        ) : (
          !isEligible ? (
            <View style={styles.lockContainer}>
              <Ionicons name="lock-closed" size={32} color="#5A5A5A" />
              <Text style={styles.lockTitle}>Deviens mentor à partir de 60 jours de streak.</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: \`\${(streak/60)*100}%\` }]} />
              </View>
              <Text style={styles.lockSub}>{streak}/60 jours accomplis</Text>
            </View>
          ) : !isMentorActive ? (
            <View style={styles.becomeCard}>
              <Text style={styles.becomeTitle}>Tu es éligible pour devenir Mentor 🎖️</Text>
              <Text style={styles.becomeDesc}>
                Tu seras visible par des hommes qui traversent des déclencheurs proches des tiens. Tu peux accepter ou refuser chaque demande.
              </Text>
              <Text style={styles.selectLabel}>Sélectionne les déclencheurs que tu gères :</Text>
              <View style={styles.chipsRow}>
                {availableTriggers.map((t, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.chip, selectedTriggers.includes(t) ? styles.chipGold : styles.chipGrey]}
                    onPress={() => {
                      if (selectedTriggers.includes(t)) {
                        setSelectedTriggers(prev => prev.filter(x => x !== t));
                      } else {
                        setSelectedTriggers(prev => [...prev, t]);
                      }
                    }}
                  >
                    <Text style={styles.chipText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.registerBtn} onPress={activateMentor}>
                <Text style={styles.registerBtnText}>Devenir Mentor officiel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={styles.sectionHeader}>DEMANDES EN ATTENTE ({requests.length})</Text>
              {requests.map(req => (
                <View key={req.requestId} style={styles.card}>
                  <Text style={styles.pseudoText}>{req.pseudo} • Niv.{req.level}</Text>
                  <View style={styles.chipsRow}>
                    {req.sharedTriggers.map((t, i) => (
                      <View key={i} style={[styles.chip, styles.chipGold]}><Text style={styles.chipText}>{t}</Text></View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptRequest(req.requestId, req.pseudo)}>
                      <Text style={styles.btnText}>Accepter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineBtn} onPress={() => declineRequest(req.requestId)}>
                      <Text style={styles.declineBtnText}>Décliner</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <Text style={[styles.sectionHeader, { marginTop: 24 }]}>TES MENTORÉS ACTUELS ({mentees.length})</Text>
              {mentees.map(m => (
                <View key={m.id} style={styles.menteeCard}>
                  <Text style={styles.pseudoText}>{m.pseudo} • Niv.{m.level}</Text>
                  <Text style={styles.menteeSub}>{m.lastActive}</Text>
                  <TouchableOpacity 
                    style={styles.chatBtn}
                    onPress={() => setOpenChat({ id: m.id, pseudo: m.pseudo, isMentee: true })}
                  >
                    <Text style={styles.chatBtnText}>Ouvrir la conversation</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', fontFamily: 'Montserrat-Bold' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 10, padding: 3, marginHorizontal: 16, marginVertical: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, position: 'relative' },
  tabActive: { backgroundColor: '#16213E' },
  tabText: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold' },
  tabTextActive: { color: '#FFD700' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF2D55', position: 'absolute', top: 6, right: 12 },
  activeMentorCard: { backgroundColor: '#16213E', borderRadius: 20, padding: 20, margin: 16, borderWidth: 1.5, borderColor: '#00D9A5' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },
  mentorName: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  mentorSub: { fontSize: 11, color: '#8E8E93' },
  streakText: { fontSize: 15, fontWeight: 'bold', color: '#00D9A5', marginBottom: 16 },
  chatBtn: { backgroundColor: '#00D9A5', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  chatBtnText: { color: '#0F0F1A', fontWeight: 'bold', fontSize: 12 },
  infoText: { fontSize: 12, color: '#8E8E93', marginBottom: 16, lineHeight: 18 },
  card: { backgroundColor: '#16213E', borderRadius: 18, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  pseudoText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  badgeText: { fontSize: 10, color: '#FFD700', fontWeight: '600' },
  streakSub: { fontSize: 11, color: '#8E8E93' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 10 },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  chipGold: { backgroundColor: 'rgba(255,215,0,0.15)' },
  chipGrey: { backgroundColor: '#1A1A2E' },
  chipText: { fontSize: 10, color: '#FFD700' },
  excerptText: { fontSize: 11, color: '#FFF', fontStyle: 'italic', marginBottom: 12 },
  actionBtn: { backgroundColor: '#FFD700', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#0F0F1A', fontWeight: 'bold', fontSize: 11 },
  lockContainer: { alignItems: 'center', padding: 40 },
  lockTitle: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginVertical: 16 },
  progressBg: { height: 6, backgroundColor: '#1A1A2E', borderRadius: 3, width: '80%', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFD700' },
  lockSub: { fontSize: 11, color: '#8E8E93', marginTop: 8 },
  becomeCard: { backgroundColor: '#16213E', borderRadius: 20, padding: 20, margin: 16, borderWidth: 1.5, borderColor: '#FFD700' },
  becomeTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFD700' },
  becomeDesc: { fontSize: 12, color: '#8E8E93', marginVertical: 12, lineHeight: 18 },
  selectLabel: { fontSize: 12, color: '#FFF', fontWeight: 'bold', marginTop: 8 },
  registerBtn: { backgroundColor: '#FFD700', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  registerBtnText: { color: '#0F0F1A', fontWeight: 'bold', fontSize: 13 },
  sectionHeader: { fontSize: 11, fontWeight: 'bold', color: '#8E8E93', marginBottom: 12, trackingWidth: 1 },
  acceptBtn: { flex: 1, backgroundColor: '#00D9A5', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  declineBtn: { flex: 1, borderWidth: 1, borderColor: '#5A5A5A', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#0F0F1A', fontWeight: 'bold', fontSize: 11 },
  declineBtnText: { color: '#8E8E93', fontSize: 11 },
  menteeCard: { backgroundColor: '#16213E', borderRadius: 18, padding: 16, marginBottom: 12 }
});
`;

  const copyNativeCode = () => {
    navigator.clipboard.writeText(nativeExpoCode);
    setCopied(true);
    addToast('success', "Code source Expo de Mentorat copié ! 🛡️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* 1. INTERACTIVE CHAT SCREEN OVERLAY */}
      {openChatWith && (
        <div className="fixed inset-0 bg-[#0F0F1A] z-40 flex flex-col items-center justify-center p-4 md:p-8 animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-[500px] h-[90vh] bg-[#0F0F1A] border-4 border-[#1C1C3A] rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col font-sans">
            
            {/* STATUS BAR EMULATOR */}
            <div className="h-6 bg-[#0F0F1A] px-6 flex justify-between items-center text-[10px] text-gray-500 font-mono shrink-0">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="w-4 h-2.5 bg-gray-600 rounded-sm" />
              </div>
            </div>

            {/* CHAT HEADER */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1A1A2E] bg-[#111122]">
              <button 
                onClick={() => setOpenChatWith(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/60 text-white hover:bg-[#16213E] transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <span className="text-xs font-headline font-black text-[#FFD700] tracking-widest uppercase block">
                  {openChatWith.pseudo}
                </span>
                <span className="text-[9px] text-[#00D9A5] block">
                  {openChatWith.isMentee ? "Ton Mentoré" : "Ton Mentor d'élite"}
                </span>
              </div>

              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/30 text-gray-500">
                <User className="w-4 h-4 text-[#FFD700]" />
              </div>
            </div>

            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-xs">
                  <MessageSquare className="w-8 h-8 text-gray-600 mb-2" />
                  <p>Début de la conversation sécurisée.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  if (msg.isSystemMessage) {
                    return (
                      <div key={msg.id} className="flex items-center justify-center gap-1.5 py-1 text-center">
                        <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
                        <span className="text-[10px] text-gray-500 italic">{msg.text}</span>
                      </div>
                    );
                  }

                  const isMe = msg.senderId === userId;

                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-2 max-w-[80%] text-left ${isMe ? 'self-end ml-auto flex-row-reverse' : 'self-start mr-auto'}`}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00D9A5] to-blue-500 flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-2">
                          {openChatWith.pseudo[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className={`p-3 rounded-2xl ${isMe ? 'bg-[#FFD700] text-[#0F0F1A] rounded-tr-none' : 'bg-[#16213E] text-white rounded-tl-none'}`}>
                          <p className="text-xs leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[8px] text-gray-600 mt-1 block px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* CHAT INPUT */}
            <div className="border-t border-[#1A1A2E] bg-[#0F0F1A] p-2 flex items-center gap-2 shrink-0">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                maxLength={300}
                placeholder="Écris à ton frère d'armes..."
                rows={1}
                className="flex-1 bg-[#1A1A2E] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700] resize-none h-9 custom-scrollbar"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={!messageInput.trim()}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${messageInput.trim() ? 'bg-[#FFD700] text-[#0F0F1A]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* CRITICAL DISTRESS SAFETY DISCRETE POPUP */}
            {showSafetyDialog && (
              <div className="absolute inset-0 bg-[#0F0F1A]/95 z-50 flex items-center justify-center p-6 animate-[fade-in_0.3s_ease-out_forwards]">
                <div className="bg-[#16213E] border border-red-900/40 rounded-[28px] p-6 space-y-4 text-center max-w-[320px] shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-800/30 flex items-center justify-center mx-auto text-red-400">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-headline font-black text-white">
                      Besoin d'un filet de sécurité ? 🛡️
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Ton message d'appel à l'aide a bien été envoyé. Mais nous ne te laisserons pas lutter seul ce soir.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <AlphaButton
                      variant="gold"
                      size="sm"
                      className="w-full text-[10px] font-bold"
                      onClick={() => {
                        setShowSafetyDialog(false);
                        addToast('info', "Activation du mode secours avec le Coach IA souverain...");
                      }}
                    >
                      PARLER AU COACH IA
                    </AlphaButton>
                    <button
                      onClick={() => setShowSafetyDialog(false)}
                      className="w-full text-center text-[10px] text-gray-500 hover:text-gray-400 underline font-sans"
                    >
                      Je gère pour l'instant
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 2. ADMIN HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Phase Communauté — Mentorat d'Honneur (6.2)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Système Bilatéral de Mentorat Élite
          </h2>
          <p className="text-xs text-gray-400">
            Mettez en relation des guerriers d'élite et des aspirants souverains basés sur l'onboarding et les déclencheurs clés.
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
              <h4 className="text-xs font-headline font-black text-white">MentorshipScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500">
                Fichier de mentorat bilatéral avec système de matchmaking par déclencheurs et messagerie sécurisée intégrée.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyNativeCode}
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

      {/* DUAL PANELS: LEFT ADMIN CONTROL PANEL, RIGHT PHONE EMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL GAUCHE: SIMULATION CONTROLLER */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-6 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              Contrôleur de Simulation
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Gérez votre streak de souveraineté et observez les réactions du statut de Mentor de l'autre côté.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* STREAK ADJUSTER */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 block font-semibold">Votre Streak Actuel :</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" min="0" max="150" 
                  value={currentStreak}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentStreak(val);
                    setIsEligibleToMentor(val >= eligibilityThreshold);
                  }}
                  className="flex-1 accent-[#FFD700] h-1"
                />
                <span className={`text-xs font-bold ${currentStreak >= 60 ? 'text-[#00D9A5]' : 'text-red-500'}`}>
                  {currentStreak} jours
                </span>
              </div>
              <span className="text-[10px] text-gray-500 block leading-tight">
                Le seuil pour devenir Mentor est de <strong className="text-[#FFD700]">{eligibilityThreshold} jours</strong> de résistance absolue.
              </span>
            </div>

            {/* TRIGGER SIMULATOR INPUT FOR ACTIVE MESSAGING DEMO */}
            <div className="space-y-2 p-3 bg-red-950/10 border border-red-900/20 rounded-2xl">
              <span className="text-[10px] font-headline text-red-400 block uppercase tracking-wide">Test Secours en Chat 1-à-1</span>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Ouvrez la conversation avec un mentor ou un mentoré, puis injectez cette détresse critique pour tester le filet d'assistance.
              </p>
              <button
                onClick={() => {
                  if (!openChatWith) {
                    addToast('warning', "Veuillez d'abord ouvrir une conversation active dans le smartphone à droite !");
                    return;
                  }
                  setMessageInput("Je n'ai plus aucune force ce soir, j'ai envie d'en finir...");
                  addToast('info', "Phrase de détresse injectée dans le chat ! Cliquez sur Envoyer 🛡️");
                }}
                className="w-full py-1.5 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-200 border border-red-900/30 rounded-xl text-[10px] font-bold transition-all text-center uppercase"
              >
                Injecter détresse en chat
              </button>
            </div>

            {/* INJECT INCOMING PENDING REQUEST */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block font-semibold font-headline">Simulations de requêtes entrantes</span>
              <button
                onClick={() => {
                  const names = ["Hakim", "Zouhair", "Youssef", "Ismaïl", "Bilal"];
                  const selectedName = names[Math.floor(Math.random() * names.length)];
                  const newReq: PendingRequest = {
                    requestId: `req-${Date.now()}`,
                    requesterId: `user-sim-${Date.now()}`,
                    pseudo: selectedName,
                    level: Math.floor(Math.random() * 8) + 1,
                    sharedTriggers: ['Stress', 'Soir seul'].slice(0, Math.floor(Math.random() * 2) + 1)
                  };
                  setPendingRequests(prev => [newReq, ...prev]);
                  addToast('info', `Nouvelle demande de mentorat de ${selectedName} reçue ! 📩`);
                }}
                className="w-full py-2 bg-[#16213E] hover:bg-[#1E2E56] text-xs font-bold rounded-xl text-center transition-all border border-gray-800"
              >
                Simuler Demande Entrante 📩
              </button>
            </div>

            {/* RESET DEMO STATUS */}
            <div className="pt-2 border-t border-gray-800">
              <button
                onClick={async () => {
                  setCurrentMentor(null);
                  setIsMentorActive(false);
                  setCurrentStreak(65);
                  setIsEligibleToMentor(true);
                  setSentRequests([]);
                  await fetch(`/api/community/${userId}/mentorship/end`, { method: 'POST' });
                  addToast('info', "Données de simulation réinitialisées !");
                  fetchStatusAndData();
                }}
                className="w-full py-2 bg-[#0A0A14] hover:bg-red-950/20 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-900/30 text-xs font-bold rounded-xl transition-all text-center"
              >
                Réinitialiser la Démo
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

            {/* HEADER INTERACTIVE */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1A1A2E] bg-[#0F0F1A] shrink-0">
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/60 text-white hover:bg-[#16213E] transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-center">
                <span className="text-xs font-headline font-black text-[#FFD700] tracking-widest uppercase block">
                  MENTORAT
                </span>
                <span className="text-[9px] text-[#8E8E93] block">
                  Match de Fraternité Élite
                </span>
              </div>

              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/10 text-gray-500">
                <Shield className="w-5 h-5 text-[#FFD700]" />
              </div>
            </div>

            {/* NAV TABS */}
            <div className="px-4 pt-3 pb-1 bg-[#0F0F1A] shrink-0">
              <div className="flex bg-[#1A1A2E] rounded-xl p-1 relative">
                
                {/* TAB 1 */}
                <button
                  onClick={() => setActiveView('find')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 ${activeView === 'find' ? 'bg-[#16213E] text-[#FFD700]' : 'text-gray-400 hover:text-white'}`}
                >
                  Trouver un Mentor
                  {currentMentor && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse absolute top-2 right-4" />
                  )}
                </button>

                {/* TAB 2 */}
                <button
                  onClick={() => setActiveView('become')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 ${activeView === 'become' ? 'bg-[#16213E] text-[#FFD700]' : 'text-gray-400 hover:text-white'}`}
                >
                  Devenir Mentor
                  {pendingRequests.length > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-2 right-6" />
                  )}
                </button>

              </div>
            </div>

            {/* SCROLLABLE VIEWPORT CONTENT */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar text-left">
              
              {/* ==================== VUE TROUVER UN MENTOR ==================== */}
              {activeView === 'find' && (
                currentMentor ? (
                  
                  /* SI L'UTILISATEUR A DÉJÀ UN MENTOR ACTIF */
                  <div className="bg-[#16213E] border-2 border-[#00D9A5] rounded-3xl p-5 space-y-4 shadow-xl animate-[fade-in_0.3s_ease-out]">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#1A1A2E] border border-[#00D9A5] flex items-center justify-center text-white font-black text-sm">
                        {currentMentor.pseudo[0].toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black font-headline text-white">{currentMentor.pseudo}</span>
                          <span className="text-[9px] bg-[#00D9A5]/10 border border-[#00D9A5]/20 text-[#00D9A5] px-1.5 py-0.5 rounded font-mono">
                            Niv.{currentMentor.level}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Ton mentor officiel • Guidage quotidien
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#0F0F1A] rounded-2xl p-3 flex justify-between items-center">
                      <span className="text-[11px] text-gray-400">Streak du mentor :</span>
                      <span className="text-xs font-bold font-mono text-[#00D9A5]">
                        {currentMentor.streak} Jours de Victoire
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 italic bg-[#0F0F1A]/50 p-3 rounded-2xl border border-gray-800">
                      "{currentMentor.storyExcerpt}"
                    </p>

                    <AlphaButton
                      variant="success"
                      size="sm"
                      className="w-full text-xs font-bold flex items-center justify-center gap-2 py-3 rounded-xl shadow-glow-success"
                      onClick={() => setOpenChatWith({ id: currentMentor.id, pseudo: currentMentor.pseudo, isMentee: false })}
                    >
                      <MessageSquare className="w-4 h-4 text-[#0F0F1A]" />
                      Ouvrir la conversation
                    </AlphaButton>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => setShowEndMentorshipConfirm(true)}
                        className="text-[10px] text-gray-500 hover:text-red-400 transition-all underline"
                      >
                        Mettre fin à ce mentorat
                      </button>
                    </div>

                  </div>

                ) : (
                  
                  /* SI PAS ENCORE DE MENTOR : LISTE DES MENTORS */
                  <div className="space-y-3 animate-[fade-in_0.3s_ease-out]">
                    
                    <div className="bg-[#1A1A2E]/50 border border-gray-800 rounded-2xl p-3">
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        On te propose des mentors d'élite qui ont surmonté les mêmes déclencheurs clés que toi.
                      </p>
                    </div>

                    {suggestedMentors.map((item, index) => {
                      const isRequested = sentRequests.includes(item.id);

                      return (
                        <div 
                          key={item.id}
                          className="bg-[#16213E] rounded-3xl p-4 border border-gray-800 space-y-3 flex flex-col justify-between"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-full bg-[#1A1A2E] flex items-center justify-center text-white font-black text-xs border border-gray-700">
                                {item.pseudo[0].toUpperCase()}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white">{item.pseudo}</span>
                                  <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/20 text-[#FFD700] px-1 rounded-sm font-semibold">
                                    Niv.{item.level}
                                  </span>
                                </div>
                                <span className="text-[9px] text-[#FFD700] bg-yellow-500/5 px-1.5 py-0.5 rounded-md border border-yellow-500/10 inline-block mt-0.5 font-semibold">
                                  🎖️ MENTOR EXCLUSIF
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold font-mono text-[#00D9A5] block">
                                {item.streak} Jours
                              </span>
                              <span className="text-[8px] text-gray-500 uppercase block font-mono">
                                Résistance
                              </span>
                            </div>
                          </div>

                          {/* STORY EXCERPT */}
                          {item.storyExcerpt && (
                            <p className="text-[10px] text-gray-300 italic font-sans leading-relaxed border-l-2 border-[#FFD700]/30 pl-2">
                              "{item.storyExcerpt}"
                            </p>
                          )}

                          {/* TRIGGER CHIPS */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.allTriggers.map((t, idx) => {
                              const isMatch = userTriggers.includes(t);
                              return (
                                <span 
                                  key={idx}
                                  className={`text-[8px] font-sans font-bold px-2 py-0.5 rounded-full border ${isMatch ? 'bg-[#FFD700]/15 border-[#FFD700]/30 text-[#FFD700]' : 'bg-gray-800/60 border-gray-700 text-gray-400'}`}
                                >
                                  {t}
                                </span>
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-gray-500 font-sans pt-1">
                            <span>A aidé {item.menteesHelpedCount} hommes avec succès</span>
                          </div>

                          {/* CTA */}
                          <AlphaButton
                            variant={isRequested ? "secondary" : "gold"}
                            size="sm"
                            className="w-full text-[10px] font-bold py-2 rounded-xl"
                            disabled={isRequested}
                            onClick={() => handleRequestMentor(item.id, item.pseudo)}
                          >
                            {isRequested ? "Demande envoyée ⏳" : "Demander à être guidé"}
                          </AlphaButton>

                        </div>
                      );
                    })}

                  </div>

                )
              )}

              {/* ==================== VUE DEVENIR MENTOR ==================== */}
              {activeView === 'become' && (
                
                /* 1. SI L'UTILISATEUR NE REMPLIT PAS ENCORE LE SEUIL DE STREAK DE 60 JOURS */
                !isEligibleToMentor ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-[fade-in_0.3s_ease-out]">
                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-headline font-black text-white uppercase tracking-wider">Mentorat Verrouillé</h4>
                      <p className="text-xs text-gray-400 max-w-[240px] mx-auto leading-relaxed">
                        Deviens mentor d'élite à partir de {eligibilityThreshold} jours de streak de résistance absolue.
                      </p>
                    </div>

                    {/* Progress slider toward 60 days */}
                    <div className="w-full max-w-[280px] space-y-1.5 pt-2">
                      <div className="h-2 bg-gray-850 rounded-full overflow-hidden border border-gray-800">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-[#FFD700]"
                          style={{ width: `${Math.min(100, (currentStreak / eligibilityThreshold) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                        <span>{currentStreak} jours accomplis</span>
                        <span>{eligibilityThreshold} jours requis</span>
                      </div>
                    </div>
                  </div>
                ) : 
                
                /* 2. SI ÉLIGIBLE MAIS PAS ENCORE ACTIF EN TANT QUE MENTOR */
                !isMentorActive ? (
                  <div className="bg-[#16213E] border-2 border-[#FFD700] rounded-3xl p-5 space-y-4 shadow-xl animate-[fade-in_0.3s_ease-out]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest block font-mono">
                        Éligibilité Confirmée 🏆
                      </span>
                      <h3 className="text-sm font-headline font-black text-white">
                        Tu es éligible pour devenir Mentor officiel !
                      </h3>
                    </div>

                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Tu seras visible par des hommes qui traversent des déclencheurs proches des tiens. Tu pourras accepter ou refuser chaque demande.
                    </p>

                    {/* SELECT TRIGGERS */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Sélectionne tes compétences d'accompagnement :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableTriggers.map((t) => {
                          const isSel = selectedTriggersForMentoring.includes(t);
                          return (
                            <button
                              key={t}
                              onClick={() => toggleTriggerSelection(t)}
                              className={`text-[10px] font-sans font-bold px-2.5 py-1 rounded-full border transition-all ${isSel ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' : 'bg-[#1A1A2E]/80 border-gray-750 text-gray-400'}`}
                            >
                              {t} {isSel && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <AlphaButton
                      variant="gold"
                      size="sm"
                      className="w-full text-xs font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-1.5"
                      onClick={handleActivateMentorStatus}
                    >
                      Débloquer Badge & Activer Statut
                    </AlphaButton>

                  </div>
                ) : (
                  
                  /* 3. SI DÉJÀ MENTOR ACTIF : LISTE DES DEMANDES EN ATTENTE + MENTORÉS ACTUELS */
                  <div className="space-y-5 animate-[fade-in_0.3s_ease-out]">
                    
                    {/* DEMANDES EN ATTENTE */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-headline font-black text-gray-500 uppercase tracking-widest block">
                        DEMANDES EN ATTENTE ({pendingRequests.length})
                      </h4>
                      
                      {pendingRequests.length === 0 ? (
                        <div className="bg-[#16213E]/40 border border-dashed border-gray-800 rounded-2xl p-4 text-center">
                          <p className="text-[10px] text-gray-500">Aucune nouvelle demande pour le moment.</p>
                        </div>
                      ) : (
                        pendingRequests.map((req) => (
                          <div 
                            key={req.requestId}
                            className="bg-[#16213E] border border-gray-850 rounded-2xl p-4 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-white block">{req.pseudo}</span>
                                <span className="text-[9px] text-gray-400">Demandeur • Niv.{req.level}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                                {req.sharedTriggers.map((t, idx) => (
                                  <span key={idx} className="text-[8px] bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] px-1.5 py-0.5 rounded font-mono">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1.5">
                              <button
                                onClick={() => handleAcceptRequest(req.requestId, req.pseudo)}
                                className="flex-1 py-2 bg-[#00D9A5] hover:bg-[#00c596] text-[#0F0F1A] font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all"
                              >
                                Accepter
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(req.requestId)}
                                className="flex-1 py-2 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-bold text-[10px] rounded-lg uppercase tracking-wider transition-all"
                              >
                                Décliner
                              </button>
                            </div>

                          </div>
                        ))
                      )}
                    </div>

                    {/* TES MENTORÉS ACTUELS */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-headline font-black text-gray-500 uppercase tracking-widest block">
                        TES MENTORÉS ACTUELS ({currentMentees.length})
                      </h4>

                      {currentMentees.length === 0 ? (
                        <div className="bg-[#16213E]/40 border border-dashed border-gray-800 rounded-2xl p-4 text-center">
                          <p className="text-[10px] text-gray-500">Aucun mentoré actif actuellement.</p>
                        </div>
                      ) : (
                        currentMentees.map((m) => (
                          <div 
                            key={m.id}
                            className="bg-[#16213E] border border-gray-850 rounded-2xl p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-[#FFD700] flex items-center justify-center text-white text-[10px] font-bold">
                                  {m.pseudo[0].toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <span className="text-xs font-bold text-white block">{m.pseudo}</span>
                                  <span className="text-[9px] text-gray-400">Niv.{m.level} • Streak {m.streak} jours</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-[#00D9A5] font-mono">{m.lastActive}</span>
                            </div>

                            <button
                              onClick={() => setOpenChatWith({ id: m.id, pseudo: m.pseudo, isMentee: true })}
                              className="w-full py-2 bg-[#1A1A2E] hover:bg-[#252542] border border-gray-800 text-gray-300 font-bold text-[10px] rounded-lg transition-all"
                            >
                              Ouvrir la conversation
                            </button>

                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )

              )}

            </div>

          </div>
        </div>

      </div>

      {/* DISCRETE DISCONNECT CONFIRMATION DIALOG MODAL */}
      {showEndMentorshipConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#16213E] border border-gray-850 rounded-[28px] p-6 max-w-[340px] w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-900/30 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 text-left">
              <h4 className="text-sm font-headline font-black text-white text-center">Clôturer ce mentorat ?</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed text-center">
                Voulez-vous vraiment clore cette relation de mentorat de manière anticipée ? Aucun signal d'erreur ou d'échec ne sera envoyé à votre partenaire pour préserver la bienveillance.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleEndMentorship}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-xl transition-all"
              >
                Clôturer
              </button>
              <button
                onClick={() => setShowEndMentorshipConfirm(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-[11px] rounded-xl transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
