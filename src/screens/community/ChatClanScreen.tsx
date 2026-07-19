import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Info, 
  Pin, 
  Send, 
  Flag, 
  MessageSquare, 
  Code, 
  Copy, 
  Settings, 
  ShieldAlert, 
  Trophy, 
  Users,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface ChatClanScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onOpenClansInfo?: () => void;
  onOpenChallenges?: () => void;
  userId?: string;
  clanId?: string;
}

interface ClanMessage {
  id: string;
  senderId: string;
  senderPseudo: string;
  senderLevel: number;
  text: string;
  isSystemMessage: boolean;
  createdAt: string;
}

export const ChatClanScreen: React.FC<ChatClanScreenProps> = ({
  addToast,
  onBack,
  onOpenClansInfo,
  onOpenChallenges,
  userId = 'user-777',
  clanId = 'clan-1'
}) => {
  const isMounted = useRef<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [activeMemberCount, setActiveMemberCount] = useState<number>(9);
  
  // Challenge mock from #5.4 system
  const [activeChallenge, setActiveChallenge] = useState<{ title: string; progressPercent: number } | null>({
    title: "1000 Flexions collectives du Clan cette semaine",
    progressPercent: 68
  });

  // Client-side distress safety states
  const [showSafetyDialog, setShowSafetyDialog] = useState<boolean>(false);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Suggested quick messages for empty state or easy input
  const quickSuggestions = [
    "Bonne chance à tous ce soir 💪",
    "Comment ça se passe pour vous ?",
    "Merci pour le soutien cette semaine"
  ];

  // Safety keywords for acute distress
  const distressKeywords = [
    'suicide', 'suicider', 'mutiler', 'mutilation', 'finir mes jours', 'en finir', 'mourir',
    'veux crever', 'veux mourir', 'auto-mutiler', 'tuer moi', 'me tuer', 'plus envie de vivre'
  ];

  const checkTextForDistress = (text: string): boolean => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return distressKeywords.some(kw => normalized.includes(kw));
  };

  // Fetch clan messages history
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${userId}/clan/${clanId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [userId, clanId]);

  // Fetch active member count
  const fetchActiveCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${userId}/clan/${clanId}/active-count`);
      if (res.ok) {
        const data = await res.json();
        setActiveMemberCount(data.activeCount);
      }
    } catch (err) {
      console.error('Failed to fetch active member count:', err);
    }
  }, [userId, clanId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    isMounted.current = true;
    
    // Initial loads
    fetchMessages();
    fetchActiveCount();

    // Setup simplicity polling (5 seconds interval for prototype demonstration)
    const pollingInterval = setInterval(() => {
      if (isMounted.current) {
        fetchMessages();
      }
    }, 5000);

    return () => {
      isMounted.current = false;
      clearInterval(pollingInterval);
    };
  }, [fetchMessages, fetchActiveCount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    if (navigator.vibrate) navigator.vibrate(40); // Haptic feedback simulated

    const hasDistress = checkTextForDistress(trimmed);

    // Optimistic message update for instant feedback
    const optimisticMsg: ClanMessage = {
      id: `msg-optimistic-${Date.now()}`,
      senderId: userId,
      senderPseudo: 'Moi',
      senderLevel: 12,
      text: trimmed,
      isSystemMessage: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setMessageInput('');

    if (hasDistress) {
      // Show immediately proposed help panel, does NOT block sending the message
      setShowSafetyDialog(true);
    }

    try {
      const res = await fetch(`/api/community/${userId}/clan/${clanId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          clientSafetyFlag: hasDistress
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Replace optimistic with real server message once confirmed
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data.message : m));

        if (data.safetyTriggered) {
          addToast('warning', "Message partagé. Un signal sécurisé discret a été transmis à l'équipe d'entraide 🛡️");
        }
      } else {
        // Remove optimistic message if error
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        addToast('error', "Échec de l'envoi du message.");
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      addToast('error', "Une erreur réseau est survenue.");
    }
  };

  // Report message
  const handleReportMessage = async (messageId: string, senderPseudo: string) => {
    if (confirm(`Voulez-vous vraiment signaler ce message de ${senderPseudo} pour non-respect des règles de la fraternité ?`)) {
      try {
        const res = await fetch(`/api/community/${userId}/clan/${clanId}/messages/${messageId}/report`, {
          method: 'POST'
        });
        if (res.ok) {
          addToast('success', "Signalement transmis à la modération du clan d'élite. Message masqué. 🛡️");
          // Remove from local list instantly
          setMessages(prev => prev.filter(m => m.id !== messageId));
        }
      } catch (err) {
        console.error('Failed to report:', err);
        addToast('error', "Échec de la transmission du signalement.");
      }
    }
  };

  // React Native code for Expo inspection
  const nativeExpoCode = `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  StatusBar, 
  Alert,
  Animated
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ChatClanScreen({ route }) {
  const navigation = useNavigation();
  const userId = route?.params?.userId || 'user-777';
  const clanId = route?.params?.clanId || 'clan-1';

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeCount, setActiveCount] = useState(9);
  const [activeChallenge, setActiveChallenge] = useState({
    title: "1000 Flexions collectives du Clan cette semaine",
    progressPercent: 68
  });

  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const flatListRef = useRef(null);

  const distressKeywords = [
    'suicide', 'suicider', 'mutiler', 'mutilation', 'finir mes jours', 'en finir', 'mourir',
    'veux crever', 'veux mourir', 'auto-mutiler', 'tuer moi', 'me tuer', 'plus envie de vivre'
  ];

  const checkTextForDistress = (text) => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return distressKeywords.some(kw => normalized.includes(kw));
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(\`/api/community/\${userId}/clan/\${clanId}/messages\`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) { console.log(e); }
  }, [userId, clanId]);

  const fetchActiveCount = useCallback(async () => {
    try {
      const res = await fetch(\`/api/community/\${userId}/clan/\${clanId}/active-count\`);
      if (res.ok) {
        const data = await res.json();
        setActiveCount(data.activeCount);
      }
    } catch (e) { console.log(e); }
  }, [userId, clanId]);

  useEffect(() => {
    fetchMessages();
    fetchActiveCount();
    const timer = setInterval(fetchMessages, 5000);
    return () => clearInterval(timer);
  }, [fetchMessages, fetchActiveCount]);

  const sendMessage = async () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const hasDistress = checkTextForDistress(trimmed);

    const tempId = \`optimistic-\${Date.now()}\`;
    const optimisticMsg = {
      id: tempId,
      senderId: userId,
      senderPseudo: 'Moi',
      senderLevel: 12,
      text: trimmed,
      isSystemMessage: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setMessageInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    if (hasDistress) {
      setShowSafetyDialog(true);
    }

    try {
      const res = await fetch(\`/api/community/\${userId}/clan/\${clanId}/messages\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, clientSafetyFlag: hasDistress })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
      }
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleLongPress = (msg) => {
    if (msg.senderId === userId) return;
    Alert.alert(
      "Options de message",
      \`Signaler le message de \${msg.senderPseudo} ?\`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Signaler",
          style: "destructive",
          onPress: async () => {
            const res = await fetch(\`/api/community/\${userId}/clan/\${clanId}/messages/\${msg.id}/report\`, { method: 'POST' });
            if (res.ok) {
              Alert.alert("Succès", "Message signalé et retiré.");
              fetchMessages();
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>LIONS DE L'ATLAS</Text>
          <Text style={styles.headerSub}>● {activeCount} membres actifs aujourd'hui</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('ClansScreen')}>
          <Ionicons name="information-circle-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Pinned Challenge Banner */}
      {activeChallenge && (
        <TouchableOpacity 
          style={styles.pinnedBanner} 
          onPress={() => navigation.navigate('ChallengesScreen')}
        >
          <Ionicons name="pin" size={14} color="#FFD700" style={{ marginRight: 6 }} />
          <Text style={styles.pinnedText} numberOfLines={1}>{activeChallenge.title}</Text>
          <Text style={styles.pinnedProgress}>{activeChallenge.progressPercent}% complété</Text>
        </TouchableOpacity>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          if (item.isSystemMessage) {
            return (
              <View style={styles.systemMsg}>
                <Ionicons name="trophy-outline" size={12} color="#8E8E93" style={{ marginRight: 4 }} />
                <Text style={styles.systemText}>{item.text}</Text>
              </View>
            );
          }

          const isMe = item.senderId === userId;
          return (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onLongPress={() => handleLongPress(item)}
              style={[styles.msgRow, isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}
            >
              {!isMe && (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.senderPseudo[0]}</Text>
                </View>
              )}
              <View style={styles.msgBody}>
                {!isMe && (
                  <Text style={styles.senderName}>
                    {item.senderPseudo} <Text style={styles.senderLevel}>Niv.{item.senderLevel}</Text>
                  </Text>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, isMe ? { color: '#0F0F1A' } : { color: '#FFFFFF' }]}>
                    {item.text}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputBar}>
          <TextInput
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder="Écris à ton clan..."
            placeholderTextColor="#8E8E93"
            style={styles.textInput}
            maxLength={300}
            multiline
          />
          <TouchableOpacity 
            disabled={!messageInput.trim()} 
            onPress={sendMessage}
            style={[styles.sendBtn, messageInput.trim() ? styles.sendBtnActive : styles.sendBtnInactive]}
          >
            <Ionicons name="send" size={16} color="#0F0F1A" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Safety Dialog */}
      {showSafetyDialog && (
        <View style={styles.safetyOverlay}>
          <View style={styles.safetyCard}>
            <Ionicons name="heart" size={32} color="#FFD700" />
            <Text style={styles.safetyTitle}>Besoin d'un filet de sécurité ? 🛡️</Text>
            <Text style={styles.safetyText}>
              Ton message a été envoyé à ton clan de soutien, mais nous voulons nous assurer que tu ne combattes pas seul ce soir.
            </Text>
            <TouchableOpacity 
              style={styles.safetyMainBtn}
              onPress={() => {
                setShowSafetyDialog(false);
                Alert.alert("Soutien activé", "Le coach IA s'ouvre pour t'accompagner immédiatement.");
              }}
            >
              <Text style={styles.safetyMainBtnText}>PARLER AU COACH IA</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.safetySubBtn}
              onPress={() => setShowSafetyDialog(false)}
            >
              <Text style={styles.safetySubBtnText}>Je gère pour l'instant</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', fontFamily: 'Montserrat-Bold' },
  headerSub: { fontSize: 10, color: '#8E8E93' },
  pinnedBanner: { height: 40, backgroundColor: 'rgba(255,215,0,0.08)', borderBottomWidth: 1, borderBottomColor: '#1A1A2E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  pinnedText: { flex: 1, fontSize: 11, color: '#FFD700', fontWeight: '600' },
  pinnedProgress: { fontSize: 10, color: '#8E8E93' },
  messagesList: { padding: 12 },
  systemMsg: { alignSelf: 'center', marginVertical: 8, flexDirection: 'row', alignItems: 'center' },
  systemText: { fontSize: 11, color: '#8E8E93', fontStyle: 'italic' },
  msgRow: { flexDirection: 'row', marginVertical: 6, maxWidth: '78%' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 14 },
  avatarText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },
  msgBody: { flex: 1 },
  senderName: { fontSize: 10, fontWeight: 'bold', color: '#FFD700', marginBottom: 2 },
  senderLevel: { color: '#8E8E93', fontSize: 8 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#FFD700', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#16213E', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  timestamp: { fontSize: 9, color: '#5A5A5A', marginTop: 2, alignSelf: 'flex-end' },
  inputBar: { minHeight: 60, borderTopWidth: 1, borderTopColor: '#1A1A2E', paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F0F1A' },
  textInput: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#FFFFFF', fontSize: 13, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnActive: { backgroundColor: '#FFD700' },
  sendBtnInactive: { backgroundColor: '#5A5A5A' },
  safetyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,15,26,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 100 },
  safetyCard: { backgroundColor: '#16213E', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%' },
  safetyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  safetyText: { color: '#8E8E93', fontSize: 12, textAlign: 'center', marginVertical: 16, lineHeight: 18 },
  safetyMainBtn: { backgroundColor: '#FFD700', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, width: '100%', alignItems: 'center' },
  safetyMainBtnText: { color: '#0F0F1A', fontWeight: 'bold', fontSize: 12 },
  safetySubBtn: { paddingVertical: 12, width: '100%', alignItems: 'center', marginTop: 8 },
  safetySubBtnText: { color: '#8E8E93', fontSize: 12 }
});
`;

  const copyNativeCode = () => {
    navigator.clipboard.writeText(nativeExpoCode);
    setCopied(true);
    addToast('success', "Code source de l'écran de chat copié ! 🛡️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* HEADER SIMULATION CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Communauté & Transmission — Chat de Clan (6.1)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Messagerie Instantanée de Clan Souverain
          </h2>
          <p className="text-xs text-gray-400">
            Échangez instantanément avec vos frères d'armes. Filet de sécurité anti-rechute intégré.
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
              <h4 className="text-xs font-headline font-black text-white">ChatClanScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500">
                Fichier de chat de clan en temps réel avec filet de secours immédiat en cas de détresse psychique.
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

      {/* DUAL PANELS: LEFT ADMIN CONSOLE, RIGHT INTERACTIVE PHONE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANNEAU GAUCHE: CONSOLE DE SIMULATION */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console d'Administration
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Testez et manipulez le comportement du chat en temps réel et les réactions de sécurité.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Simulation challenge adjuster */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block font-semibold">Bandeau d'Épinglage de Défi :</span>
              <div className="space-y-1">
                <input 
                  type="text" 
                  value={activeChallenge?.title || ''} 
                  onChange={(e) => setActiveChallenge(prev => prev ? { ...prev, title: e.target.value } : { title: e.target.value, progressPercent: 50 })}
                  className="w-full bg-[#16213E] text-xs text-white p-2 rounded-xl border border-gray-800 focus:outline-none"
                  placeholder="Titre du défi..."
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="range" min="0" max="100" 
                    value={activeChallenge?.progressPercent || 0}
                    onChange={(e) => setActiveChallenge(prev => prev ? { ...prev, progressPercent: parseInt(e.target.value) } : null)}
                    className="flex-1 accent-[#FFD700] h-1"
                  />
                  <span className="text-xs font-bold text-[#FFD700]">{activeChallenge?.progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Simulated distress injector (test safety loop) */}
            <div className="space-y-2 p-3 bg-red-950/10 border border-red-900/20 rounded-2xl">
              <span className="text-[10px] font-headline text-red-400 block uppercase tracking-wide">Test du Filet de Sécurité</span>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Entrez une phrase contenant des termes critiques. Le chat enverra quand même le message pour garder le soutien mais déploiera l'assistance IA immédiatement.
              </p>
              <button
                onClick={() => {
                  setMessageInput("Je n'en peux plus ce soir, j'ai juste envie de me suicider...");
                  addToast('info', "Phrase de détresse pré-remplie ! Appuyez sur Envoyer pour tester le filet de sécurité 🛡️");
                }}
                className="w-full py-1.5 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-200 border border-red-900/30 rounded-xl text-[10px] font-bold transition-all text-center uppercase tracking-wider"
              >
                Injecter détresse critique
              </button>
            </div>

            {/* Inject random member message */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 block font-semibold">Simuler l'activité du Clan :</span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    const randomMessages = [
                      { sender: "Souverain77", level: 14, txt: "Le workout du jour a piqué mais on ne lâche rien les frères ! 💪" },
                      { sender: "GuerrierDeLumiere", level: 19, txt: "Rappelez-vous : l'ombre recule toujours devant un regard droit." },
                      { sender: "SpartanShield", level: 12, txt: "Est-ce que quelqu'un fait le rituel des 500 squats aujourd'hui ?" }
                    ];
                    const selected = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                    const newMsg: ClanMessage = {
                      id: `msg-simulated-${Date.now()}`,
                      senderId: `user-random-${Date.now()}`,
                      senderPseudo: selected.sender,
                      senderLevel: selected.level,
                      text: selected.txt,
                      isSystemMessage: false,
                      createdAt: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, newMsg]);
                    addToast('info', `Message de ${selected.sender} simulé dans le flux !`);
                  }}
                  className="w-full py-2 bg-[#16213E] hover:bg-[#1C2C54] text-xs font-bold rounded-xl transition-all text-center"
                >
                  Simuler message d'un frère 💬
                </button>

                <button
                  onClick={() => {
                    const newSysMsg: ClanMessage = {
                      id: `msg-sys-${Date.now()}`,
                      senderId: 'system',
                      senderPseudo: 'Système',
                      senderLevel: 0,
                      text: "Arthur vient de franchir héroïquement le palier souverain des 15 Jours ! 🏆",
                      isSystemMessage: true,
                      createdAt: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, newSysMsg]);
                    addToast('info', "Notification de palier simulée !");
                  }}
                  className="w-full py-2 bg-[#1A1A2E] hover:bg-[#252542] text-xs font-bold rounded-xl transition-all text-center border border-[#1C1C3A] text-gray-300"
                >
                  Simuler palier de membre 🏆
                </button>
              </div>
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
              
              <div className="text-center">
                <span className="text-xs font-headline font-black text-[#FFD700] tracking-widest uppercase block">
                  LIONS DE L'ATLAS
                </span>
                <span className="text-[9px] text-[#8E8E93] block">
                  ● {activeMemberCount} membres actifs aujourd'hui
                </span>
              </div>

              <button 
                onClick={() => {
                  if (onOpenClansInfo) onOpenClansInfo();
                  else addToast('info', "Navigation vers l'écran des détails du Clan...");
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/60 text-[#FFD700] hover:bg-[#16213E] transition-all"
                title="Informations du clan"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            {/* PINNED CHALLENGE BANNER */}
            {activeChallenge && (
              <div 
                onClick={() => {
                  if (onOpenChallenges) onOpenChallenges();
                  else addToast('info', "Navigation vers l'écran des défis...");
                }}
                className="bg-[#FFD700]/8 border-b border-[#1A1A2E] px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-[#FFD700]/12 transition-all text-left shrink-0"
              >
                <Pin className="w-3.5 h-3.5 text-[#FFD700] rotate-45 shrink-0" />
                <span className="text-[10px] font-semibold text-[#FFD700] flex-1 truncate font-sans">
                  {activeChallenge.title}
                </span>
                <span className="text-[10px] text-gray-400 font-mono shrink-0">
                  {activeChallenge.progressPercent}% complété
                </span>
              </div>
            )}

            {/* MESSAGES VIEW CONTAINER */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar flex flex-col">
              
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                  <div className="w-12 h-12 rounded-full bg-[#16213E] flex items-center justify-center text-gray-500">
                    <MessageSquare className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-sans max-w-[200px]">
                    Sois le premier à écrire à ton clan aujourd'hui.
                  </p>
                  
                  {/* Suggestions list */}
                  <div className="flex flex-col gap-2 pt-2 w-full">
                    {quickSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMessageInput(suggestion)}
                        className="text-[10px] bg-[#16213E] hover:bg-[#252542] text-gray-300 py-2 px-3 rounded-xl border border-gray-800 transition-all text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col justify-end min-h-full">
                  {messages.map((item) => {
                    
                    // SYSTEM MESSAGES
                    if (item.isSystemMessage) {
                      return (
                        <div 
                          key={item.id}
                          className="flex items-center justify-center gap-1.5 py-1 text-center bg-transparent animate-[fade-in_0.4s_ease-out]"
                        >
                          <Trophy className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                          <span className="text-[10px] text-gray-400 font-sans italic">
                            {item.text}
                          </span>
                        </div>
                      );
                    }

                    // SENDER MESSAGES (ME VS OTHERS)
                    const isMe = item.senderId === userId;
                    
                    return (
                      <div 
                        key={item.id}
                        onDoubleClick={() => handleReportMessage(item.id, item.senderPseudo)}
                        className={`flex gap-2 max-w-[80%] text-left group relative ${isMe ? 'self-end flex-row-reverse' : 'self-start flex-row'}`}
                      >
                        {/* AVATAR */}
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E94560] to-[#FFD700] flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-sm mt-3.5">
                            {item.senderPseudo[0].toUpperCase()}
                          </div>
                        )}

                        <div className="flex flex-col">
                          
                          {/* SENDER META */}
                          {!isMe && (
                            <div className="flex items-center gap-1 text-[9px] font-sans font-bold text-[#FFD700] mb-0.5 ml-1">
                              <span>{item.senderPseudo}</span>
                              <span className="text-gray-500 text-[8px] font-mono bg-gray-800/60 px-1 rounded">
                                Niv.{item.senderLevel}
                              </span>
                            </div>
                          )}

                          {/* BUBBLE */}
                          <div 
                            className={`p-3 rounded-2xl ${isMe ? 'bg-[#FFD700] text-[#0F0F1A] rounded-tr-sm' : 'bg-[#16213E] text-white rounded-tl-sm'}`}
                          >
                            <p className="text-xs leading-relaxed font-sans select-all">
                              {item.text}
                            </p>
                          </div>

                          {/* FOOTER DISCRETE TIME / REPORT ACTION */}
                          <div className="flex justify-between items-center mt-1 px-1 text-[8px] text-gray-500 font-mono">
                            <span>
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {!isMe && (
                              <button 
                                onClick={() => handleReportMessage(item.id, item.senderPseudo)}
                                className="text-gray-600 hover:text-red-400 ml-2 uppercase tracking-wide font-bold font-sans text-[7px]"
                                title="Signaler"
                              >
                                Signaler
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    );

                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}

            </div>

            {/* INPUT INPUT-BAR FIXED */}
            <div className="border-t border-[#1A1A2E] bg-[#0F0F1A] p-2 flex items-center gap-1.5 shrink-0">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(messageInput);
                  }
                }}
                maxLength={300}
                placeholder="Écris à ton clan..."
                rows={1}
                className="flex-1 bg-[#1A1A2E] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700] resize-none h-9 custom-scrollbar"
              />
              <button
                onClick={() => handleSendMessage(messageInput)}
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
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-headline font-black text-white">
                      Besoin d'un filet de sécurité ? 🛡️
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Ton message d'appel à l'aide a bien été envoyé à tes frères d'armes. Mais nous ne te laisserons pas lutter seul ce soir.
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

      </div>

    </div>
  );
};
