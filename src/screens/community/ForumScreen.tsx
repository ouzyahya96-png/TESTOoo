import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Plus, 
  ChevronUp, 
  MessageCircle, 
  Pin, 
  Send, 
  X, 
  Flame, 
  Award, 
  Shield, 
  User, 
  HelpCircle, 
  Clock, 
  Code, 
  Copy,
  ChevronDown,
  Search,
  CheckCircle,
  Check,
  Flag,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { AlphaButton } from '../../components/AlphaButton';

interface ForumScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  userId?: string;
  clanId?: string;
  onRequestCoachChat?: () => void;
}

export interface ThreadData {
  id: string;
  category: string;
  scope: 'clan' | 'all';
  authorPseudo: string;
  authorLevel: number;
  authorReputationPoints: number;
  title: string;
  bodyPreview: string;
  body: string;
  createdAt: string;
  voteCount: number;
  userHasVoted: boolean;
  replyCount: number;
  isPinned: boolean;
  hasSolution?: boolean;
  solutionReplyId?: string | null;
  hasExpertReply?: boolean;
  moderationStatus?: 'approved' | 'needs_review' | 'removed';
  reportCount?: number;
  distressFlagged?: boolean;
}

export interface ReplyData {
  id: string;
  threadId: string;
  authorPseudo: string;
  authorLevel: number;
  authorReputationPoints: number;
  text: string;
  createdAt: string;
  voteCount: number;
  userHasVoted: boolean;
  isExpertReply?: boolean;
  expertName?: string;
  expertSpecialty?: 'urologie' | 'sexologie' | 'andrologie' | 'psychiatrie' | 'nutrition' | null;
  isMarkedBest?: boolean;
  moderationStatus?: 'approved' | 'needs_review' | 'removed';
  reportCount?: number;
  distressFlagged?: boolean;
}

// Function to calculate the reputation tier from cumulative points
export const getReputationTier = (points: number) => {
  if (points >= 500) {
    return { label: 'Légende du Forum', icon: '💎', color: '#4A90D9' };
  }
  if (points >= 200) {
    return { label: 'Pilier du Forum', icon: '🥇', color: '#FFD700' };
  }
  if (points >= 50) {
    return { label: 'Contributeur', icon: '🥈', color: '#C0C0C0' };
  }
  return { label: 'Nouveau', icon: '🌱', color: '#8E8E93' };
};

// Reputation Badge helper component
const ReputationBadge: React.FC<{ points: number; compact?: boolean }> = ({ points, compact = false }) => {
  const tier = getReputationTier(points || 0);
  if (compact) {
    return (
      <span className="ml-1 cursor-help inline-block select-none" title={`${tier.label} (${points || 0} pts)`}>
        {tier.icon}
      </span>
    );
  }
  return (
    <div 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-sans font-semibold select-none ml-1.5"
      style={{ borderColor: `${tier.color}30`, backgroundColor: `${tier.color}10`, color: tier.color }}
      title={`Points de réputation forum : ${points || 0}`}
    >
      <span>{tier.icon}</span>
      <span>{tier.label}</span>
    </div>
  );
};

// Trending Thread Card component
const TrendingCard: React.FC<{ thread: ThreadData; onClick: () => void }> = ({ thread, onClick }) => {
  const catInfo = categoryMap[thread.category] || categoryMap.general;
  return (
    <button
      onClick={onClick}
      className="w-[200px] bg-[#16213E] rounded-[14px] p-3 border border-[#FF9500]/25 text-left shrink-0 hover:border-[#FF9500]/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none flex flex-col justify-between h-[115px]"
    >
      <div>
        <span className={`${catInfo.bg} ${catInfo.color} border px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wide`}>
          {catInfo.icon} {catInfo.label.toUpperCase()}
        </span>
        <h5 className="text-[11px] font-semibold text-white mt-2 leading-snug line-clamp-2 font-headline">
          {thread.title}
        </h5>
      </div>
      <div className="text-[8px] text-[#FF9500] font-mono flex items-center gap-1 mt-1 shrink-0 select-none">
        <span>🔥 {thread.voteCount} votes · {thread.replyCount} {thread.replyCount > 1 ? 'réponses' : 'réponse'}</span>
      </div>
    </button>
  );
};

// Category details mapping
export const categoryMap: { [key: string]: { label: string; color: string; bg: string; icon: string } } = {
  pattern_killer: { label: 'Pattern Killer', color: 'text-red-400 border-red-500/20', bg: 'bg-red-500/10', icon: '🔥' },
  kegel_physique: { label: 'Kegel & Physique', color: 'text-blue-400 border-blue-500/20', bg: 'bg-blue-500/10', icon: '💪' },
  vitalite_energie: { label: 'Vitalité & Énergie', color: 'text-yellow-400 border-yellow-500/20', bg: 'bg-yellow-500/10', icon: '⚡' },
  confiance_relations: { label: 'Confiance & Relations', color: 'text-purple-400 border-purple-500/20', bg: 'bg-purple-500/10', icon: '🧠' },
  victoires: { label: 'Victoires & Paliers', color: 'text-emerald-400 border-emerald-500/20', bg: 'bg-emerald-500/10', icon: '🏆' },
  general: { label: 'Questions Générales', color: 'text-gray-400 border-gray-500/20', bg: 'bg-gray-500/10', icon: '❓' }
};

export const ForumScreen: React.FC<ForumScreenProps> = ({
  addToast,
  onBack,
  userId = 'user-777',
  clanId = 'clan-1',
  onRequestCoachChat
}) => {
  const isMounted = useRef<boolean>(true);

  // Filters & State
  const [scopeFilter, setScopeFilter] = useState<'clan' | 'all'>('clan');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  // Search variables
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ThreadData[] | null>(null);

  // Trending & Solutions state
  const [trendingThreads, setTrendingThreads] = useState<ThreadData[]>([]);
  const [confirmingBestAnswerFor, setConfirmingBestAnswerFor] = useState<string | null>(null);
  const [confirmCountdown, setConfirmCountdown] = useState<number>(0);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  // Threads list & selected thread details
  const [pinnedThreads, setPinnedThreads] = useState<ThreadData[]>([]);
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threadDetail, setThreadDetail] = useState<ThreadData | null>(null);
  const [threadReplies, setThreadReplies] = useState<ReplyData[]>([]);
  
  // Composers & inputs
  const [replyInput, setReplyInput] = useState<string>('');
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [composerCategory, setComposerCategory] = useState<string | null>(null);
  const [composerTitle, setComposerTitle] = useState<string>('');
  const [composerBody, setComposerBody] = useState<string>('');

  // Simulator controls
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Moderation & safety states
  const [isReportMenuOpen, setIsReportMenuOpen] = useState<boolean>(false);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reportTargetType, setReportTargetType] = useState<'thread' | 'reply' | null>(null);
  const [distressOverlayVisible, setDistressOverlayVisible] = useState<boolean>(false);
  const [abuseFilterError, setAbuseFilterError] = useState<{ field: 'title' | 'body' | 'reply'; message: string } | null>(null);
  const [threadsCreatedLast24h, setThreadsCreatedLast24h] = useState<number>(0);

  // Light client-side distress signals keywords filter (synchronized with other occurrences)
  const distressKeywords = [
    'suicide', 'suicider', 'mutiler', 'mutilation', 'finir mes jours', 'en finir', 'mourir',
    'veux crever', 'veux mourir', 'auto-mutiler', 'tuer moi', 'me tuer', 'plus envie de vivre'
  ];

  const checkTextForDistress = (text: string): boolean => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return distressKeywords.some(kw => normalized.includes(kw));
  };

  // Abuse detection rules (coordonnées externes, URLs multiples, insultes)
  const countURLs = (text: string): number => {
    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
    const matches = text.match(urlRegex);
    return matches ? matches.length : 0;
  };

  const hasShortener = (text: string): boolean => {
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly'];
    const lowercase = text.toLowerCase();
    return shorteners.some(s => lowercase.includes(s));
  };

  const hasExternalContact = (text: string): boolean => {
    // Simple phone pattern (8+ digits) or social media links/phrases
    const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{9,13}/;
    if (phonePattern.test(text)) return true;

    const socialPatterns = [
      'instagram.com', 'snapchat.com', 't.me/', 'discord.gg', 'facebook.com',
      'twitter.com', 'x.com', 'add me on', 'mon snap', 'mon insta', 'mon telegram',
      'contactez-moi sur', 'whatsapp'
    ];
    const lowercase = text.toLowerCase();
    if (socialPatterns.some(pat => lowercase.includes(pat))) return true;

    return false;
  };

  const abusiveTerms = ['insulte1', 'haineux1', 'spammeur', 'fdp', 'connard', 'salope', 'encule'];
  const hasAbusiveTerms = (text: string): boolean => {
    const lowercase = text.toLowerCase();
    return abusiveTerms.some(term => lowercase.includes(term));
  };

  const checkForAbuse = (text: string): boolean => {
    if (!text) return false;
    return countURLs(text) > 2 || hasShortener(text) || hasExternalContact(text) || hasAbusiveTerms(text);
  };

  // Horizontal categories for filters
  const categoriesList = [
    { id: 'all', label: 'TOUT', icon: '🌐' },
    { id: 'pattern_killer', label: 'Pattern Killer', icon: '🔥' },
    { id: 'kegel_physique', label: 'Kegel & Physique', icon: '💪' },
    { id: 'vitalite_energie', label: 'Vitalité & Énergie', icon: '⚡' },
    { id: 'confiance_relations', label: 'Confiance & Relations', icon: '🧠' },
    { id: 'victoires', label: 'Victoires & Paliers', icon: '🏆' },
    { id: 'general', label: 'Questions Générales', icon: '❓' }
  ];

  // Fetch threads and pinned posts
  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch normal threads
      const res = await fetch(`/api/community/${userId}/forum/threads?scope=${scopeFilter}&category=${activeCategory}&sort=${sortBy}`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
      }

      // 2. Fetch pinned threads
      const pinnedRes = await fetch(`/api/community/${userId}/forum/threads/pinned?scope=${scopeFilter}`);
      if (pinnedRes.ok) {
        const data = await pinnedRes.json();
        setPinnedThreads(data);
      }

      // 3. Fetch trending threads
      const trendingRes = await fetch(`/api/community/${userId}/forum/trending?scope=${scopeFilter}`);
      if (trendingRes.ok) {
        const data = await trendingRes.json();
        setTrendingThreads(data);
      }
    } catch (err) {
      console.error("Failed to load forum threads:", err);
      addToast('error', "Erreur de chargement des fils.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, scopeFilter, activeCategory, sortBy, addToast]);

  // Fetch replies if thread details is open
  const fetchThreadReplies = useCallback(async (threadId: string) => {
    try {
      // Fetch details of the thread
      const detailRes = await fetch(`/api/community/${userId}/forum/threads/${threadId}`);
      if (detailRes.ok) {
        const data = await detailRes.json();
        setThreadDetail(data);
      }

      // Fetch replies
      const repliesRes = await fetch(`/api/community/${userId}/forum/threads/${threadId}/replies`);
      if (repliesRes.ok) {
        const data = await repliesRes.json();
        setThreadReplies(data);
      }
    } catch (err) {
      console.error("Failed to load thread details/replies:", err);
    }
  }, [userId]);

  // Handle load thread detailed view
  const handleOpenThread = (threadId: string) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setSelectedThreadId(threadId);
    fetchThreadReplies(threadId);
  };

  useEffect(() => {
    isMounted.current = true;
    fetchThreads();
    return () => {
      isMounted.current = false;
    };
  }, [fetchThreads]);

  // Search trigger with 300ms debounce
  useEffect(() => {
    if (!isSearchActive || searchQuery.trim() === '') {
      setSearchResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/community/${userId}/forum/search?scope=${scopeFilter}&q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Error searching forum:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, scopeFilter, isSearchActive, userId]);

  // Distress overlay auto-dismiss timer (10 seconds)
  useEffect(() => {
    if (distressOverlayVisible) {
      const timer = setTimeout(() => {
        setDistressOverlayVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [distressOverlayVisible]);

  // Trigger vote on thread
  const handleVoteThread = async (e: React.MouseEvent, threadId: string, isPinnedList: boolean) => {
    e.stopPropagation(); // prevent opening thread detail on click
    if (navigator.vibrate) navigator.vibrate(40); // Haptic Light

    // Optimistic state update
    const updateList = (list: ThreadData[]) => 
      list.map(t => {
        if (t.id === threadId) {
          const nextVoted = !t.userHasVoted;
          return {
            ...t,
            userHasVoted: nextVoted,
            voteCount: nextVoted ? t.voteCount + 1 : t.voteCount - 1
          };
        }
        return t;
      });

    if (isPinnedList) {
      setPinnedThreads(updateList);
    } else {
      setThreads(updateList);
    }

    if (threadDetail && threadDetail.id === threadId) {
      setThreadDetail(prev => prev ? {
        ...prev,
        userHasVoted: !prev.userHasVoted,
        voteCount: !prev.userHasVoted ? prev.voteCount + 1 : prev.voteCount - 1
      } : null);
    }

    try {
      const res = await fetch(`/api/community/${userId}/forum/threads/${threadId}/vote`, {
        method: 'POST'
      });
      if (!res.ok) {
        fetchThreads();
      }
    } catch (err) {
      console.error(err);
      fetchThreads();
    }
  };

  // Trigger vote on reply
  const handleVoteReply = async (replyId: string) => {
    if (navigator.vibrate) navigator.vibrate(40); // Haptic Light

    setThreadReplies(prev => prev.map(r => {
      if (r.id === replyId) {
        const nextVoted = !r.userHasVoted;
        return {
          ...r,
          userHasVoted: nextVoted,
          voteCount: nextVoted ? r.voteCount + 1 : r.voteCount - 1
        };
      }
      return r;
    }));

    try {
      const res = await fetch(`/api/community/${userId}/forum/replies/${replyId}/vote`, {
        method: 'POST'
      });
      if (!res.ok) {
        if (selectedThreadId) fetchThreadReplies(selectedThreadId);
      }
    } catch (err) {
      console.error(err);
      if (selectedThreadId) fetchThreadReplies(selectedThreadId);
    }
  };

  // Publish reply
  const handlePostReply = async () => {
    const trimmed = replyInput.trim();
    if (!trimmed || !selectedThreadId) return;

    // Check for abuse filter (blocking)
    if (checkForAbuse(trimmed)) {
      setAbuseFilterError({
        field: 'reply',
        message: "Ce message ne respecte pas les règles de la communauté (liens ou coordonnées externes non autorisés). Modifie-le pour continuer."
      });
      return;
    }

    if (navigator.vibrate) navigator.vibrate(40); // Haptic Light

    // Check for distress filter (non-blocking)
    const isDistress = checkTextForDistress(trimmed);
    const modStatus = isDistress ? 'needs_review' : 'approved';

    // Optimistic UI reply item
    const mockReply: ReplyData = {
      id: `reply-mock-${Date.now()}`,
      threadId: selectedThreadId,
      authorPseudo: 'Guerrier_Novice',
      authorLevel: 3,
      authorReputationPoints: 12,
      text: trimmed,
      createdAt: new Date().toISOString(),
      voteCount: 0,
      userHasVoted: false,
      moderationStatus: modStatus,
      distressFlagged: isDistress,
      reportCount: 0
    };

    setThreadReplies(prev => [...prev, mockReply]);
    setReplyInput('');
    setAbuseFilterError(null);

    if (threadDetail) {
      setThreadDetail(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
    }

    try {
      const res = await fetch(`/api/community/${userId}/forum/threads/${selectedThreadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          moderationStatus: modStatus,
          distressFlagged: isDistress
        })
      });

      if (res.ok) {
        addToast('success', "✓ Votre réponse a été publiée avec succès !");
        fetchThreadReplies(selectedThreadId);
        // Refresh underlying thread counts
        fetchThreads();

        if (isDistress) {
          setDistressOverlayVisible(true);
        }
      } else {
        addToast('error', "Échec de publication.");
        if (selectedThreadId) fetchThreadReplies(selectedThreadId);
      }
    } catch (err) {
      console.error(err);
      if (selectedThreadId) fetchThreadReplies(selectedThreadId);
    }
  };

  // Mark Best Answer countdown logic
  const startMarkBestCountdown = (replyId: string) => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
    }
    setConfirmingBestAnswerFor(replyId);
    setConfirmCountdown(3);
    
    countdownTimer.current = setInterval(() => {
      setConfirmCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
          }
          // Trigger the marking action!
          executeMarkBestAnswer(replyId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelMarkBestCountdown = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setConfirmingBestAnswerFor(null);
    setConfirmCountdown(0);
  };

  const executeMarkBestAnswer = async (replyId: string) => {
    if (!selectedThreadId) return;
    try {
      const res = await fetch(`/api/community/${userId}/forum/threads/${selectedThreadId}/replies/${replyId}/mark-best`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast('success', "🏆 Réponse désignée comme la meilleure solution !");
        await fetchThreadReplies(selectedThreadId);
        await fetchThreads();
      } else {
        const errData = await res.json();
        addToast('error', errData.error || "Erreur de marquage.");
      }
    } catch (err) {
      console.error("Error marking best answer:", err);
      addToast('error', "Erreur de connexion.");
    } finally {
      setConfirmingBestAnswerFor(null);
      setConfirmCountdown(0);
    }
  };

  // Simulate an expert reply on the active thread
  const handleSimulateExpert = async () => {
    if (!selectedThreadId) return;
    try {
      const res = await fetch(`/api/community/${userId}/forum/threads/${selectedThreadId}/simulate-expert`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast('success', "👨‍⚕️ Une réponse d'expert a été générée sur ce fil !");
        await fetchThreadReplies(selectedThreadId);
        await fetchThreads();
      } else {
        addToast('error', "Erreur lors de la simulation.");
      }
    } catch (err) {
      console.error("Error simulating expert:", err);
      addToast('error', "Erreur de connexion.");
    }
  };

  // Create Thread handler
  const handleCreateThread = async () => {
    if (!composerCategory || !composerTitle.trim() || composerBody.trim().length < 20) return;

    // Check rate limit (maximum 5 threads/24h)
    if (threadsCreatedLast24h >= 5) {
      addToast('warning', "Tu as atteint la limite de fils pour aujourd'hui, reviens demain 🙏");
      return;
    }

    // Check for abuse filter (blocking)
    if (checkForAbuse(composerTitle.trim())) {
      setAbuseFilterError({
        field: 'title',
        message: "Ce message ne respecte pas les règles de la communauté (liens ou coordonnées externes non autorisés). Modifie-le pour continuer."
      });
      return;
    }

    if (checkForAbuse(composerBody.trim())) {
      setAbuseFilterError({
        field: 'body',
        message: "Ce message ne respecte pas les règles de la communauté (liens ou coordonnées externes non autorisés). Modifie-le pour continuer."
      });
      return;
    }

    if (navigator.vibrate) navigator.vibrate(60); // Haptic Medium

    // Check for distress filter (non-blocking)
    const isDistress = checkTextForDistress(composerTitle) || checkTextForDistress(composerBody);
    const modStatus = isDistress ? 'needs_review' : 'approved';

    try {
      const res = await fetch(`/api/community/${userId}/forum/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: composerCategory,
          title: composerTitle.trim(),
          body: composerBody.trim(),
          scope: scopeFilter,
          moderationStatus: modStatus,
          distressFlagged: isDistress
        })
      });

      if (res.ok) {
        const newThread = await res.json();
        addToast('success', "🏆 Nouveau fil créé avec succès !");
        
        // Increment thread creation count for rate-limit
        setThreadsCreatedLast24h(prev => prev + 1);

        // Reset composer & errors
        setComposerCategory(null);
        setComposerTitle('');
        setComposerBody('');
        setIsComposerOpen(false);
        setAbuseFilterError(null);

        // Fetch thread list and directly navigate to new thread
        await fetchThreads();
        handleOpenThread(newThread.id);

        if (isDistress) {
          setDistressOverlayVisible(true);
        }
      } else {
        addToast('error', "Échec de création du fil.");
      }
    } catch (err) {
      console.error(err);
      addToast('error', "Erreur réseau.");
    }
  };

  const handleOpenReportMenu = (targetId: string, targetType: 'thread' | 'reply') => {
    if (navigator.vibrate) navigator.vibrate(20);
    setReportTargetId(targetId);
    setReportTargetType(targetType);
    setIsReportMenuOpen(true);
  };

  const submitReport = async (reason: 'spam' | 'inappropriate' | 'harassment' | 'other') => {
    if (!reportTargetId || !reportTargetType) return;
    if (navigator.vibrate) navigator.vibrate(30);

    const apiPath = reportTargetType === 'thread'
      ? `/api/community/${userId}/forum/threads/${reportTargetId}/report`
      : `/api/community/${userId}/forum/replies/${reportTargetId}/report`;

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        addToast('success', "Signalement envoyé, merci de nous aider à garder cet espace sain 🙏");
        
        // Optimistically update or refetch
        if (reportTargetType === 'thread') {
          if (selectedThreadId === reportTargetId) {
            await fetchThreadReplies(selectedThreadId);
          }
          await fetchThreads();
        } else {
          if (selectedThreadId) {
            await fetchThreadReplies(selectedThreadId);
          }
        }
      } else {
        addToast('error', "Échec de l'envoi du signalement.");
      }
    } catch (err) {
      console.error(err);
      addToast('error', "Erreur réseau.");
    } finally {
      setIsReportMenuOpen(false);
      setReportTargetId(null);
      setReportTargetType(null);
    }
  };

  // React Native Expo source code string to display in preview inspector
  const nativeExpoCode = `import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  TextInput, 
  FlatList,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ForumScreen({ navigation }) {
  const [scopeFilter, setScopeFilter] = useState('clan'); // 'clan' | 'all'
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'popular' | 'unanswered'

  const [pinned, setPinned] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  
  // Create thread state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerCategory, setComposerCategory] = useState(null);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerBody, setComposerBody] = useState('');

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch(\`/api/community/user-777/forum/threads?scope=\${scopeFilter}&category=\${category}&sort=\${sortBy}\`);
      if (res.ok) setThreads(await res.json());

      const pinRes = await fetch(\`/api/community/user-777/forum/threads/pinned?scope=\${scopeFilter}\`);
      if (pinRes.ok) setPinned(await pinRes.json());
    } catch (err) {
      console.log(err);
    }
  }, [scopeFilter, category, sortBy]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleVote = async (thread) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const res = await fetch(\`/api/community/user-777/forum/threads/\${thread.id}/vote\`, { method: 'POST' });
    if (res.ok) fetchThreads();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FORUM</Text>
        <TouchableOpacity onPress={() => setComposerOpen(true)} style={styles.plusBtn}>
          <Ionicons name="add" size={24} color="#0F0F1A" />
        </TouchableOpacity>
      </View>

      {/* Scope Toggles */}
      <View style={styles.scopeToggle}>
        <TouchableOpacity 
          style={[styles.toggleBtn, scopeFilter === 'clan' && styles.toggleBtnActive]} 
          onPress={() => setScopeFilter('clan')}
        >
          <Text style={[styles.toggleText, scopeFilter === 'clan' && styles.toggleTextActive]}>MON CLAN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, scopeFilter === 'all' && styles.toggleBtnActive]} 
          onPress={() => setScopeFilter('all')}
        >
          <Text style={[styles.toggleText, scopeFilter === 'all' && styles.toggleTextActive]}>TOUS LES CLANS</Text>
        </TouchableOpacity>
      </View>

      {/* Thread List */}
      <FlatList
        data={threads}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedThread(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.badge}>🔥 {item.category.toUpperCase()}</Text>
              <Text style={styles.author}>{item.authorPseudo} (Lvl {item.authorLevel})</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.preview}>{item.bodyPreview}</Text>
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => handleVote(item)} style={styles.voteBtn}>
                <Feather name="chevron-up" size={16} color={item.userHasVoted ? '#00D9A5' : '#8E8E93'} />
                <Text style={styles.voteText}>{item.voteCount}</Text>
              </TouchableOpacity>
              <Text style={styles.repliesText}>💬 {item.replyCount} réponses</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', fontFamily: 'Montserrat-Bold' },
  headerBtn: { width: 44, height: 44, justifyContent: 'center' },
  plusBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  scopeToggle: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 12, margin: 16, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#FFD700' },
  toggleText: { color: '#8E8E93', fontWeight: 'bold', fontSize: 11 },
  toggleTextActive: { color: '#0F0F1A' },
  card: { backgroundColor: '#16213E', borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badge: { backgroundColor: 'rgba(255,215,0,0.15)', color: '#FFD700', fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  author: { color: '#8E8E93', fontSize: 10, marginLeft: 8 },
  title: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  preview: { color: '#8E8E93', fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1A1A2E', marginTop: 10, paddingTop: 10 },
  voteBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  voteText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  repliesText: { color: '#8E8E93', fontSize: 11 }
});
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(nativeExpoCode);
    setCopied(true);
    addToast('success', "Code source du ForumScreen copié avec succès ! 🛡️");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* 1. COMPOSER DE NOUVEAU FIL (MODAL) */}
      {isComposerOpen && (
        <div className="fixed inset-0 bg-[#0F0F1A]/95 z-50 flex items-center justify-center p-4 md:p-8 animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-[550px] bg-[#16213E] border border-[#1C1C3A] rounded-[32px] overflow-hidden p-6 relative flex flex-col space-y-4 text-left shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <button 
              onClick={() => setIsComposerOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest block">FORUM COMMUNAUTAIRE</span>
              <h3 className="text-md font-headline font-black text-white">Nouveau fil de discussion</h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Ouvrez un nouveau sujet d'honneur dans l'espace d'entraide de l'application. Orientez la conversation pour bâtir de solides habitudes.
              </p>
            </div>

            {/* SELECTION DE CATEGORIE OBLIGATOIRE */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 block">Choisissez une catégorie <span className="text-red-500">*</span></span>
              <div className="flex flex-wrap gap-2">
                {categoriesList.filter(c => c.id !== 'all').map((cat) => {
                  const isSelected = composerCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setComposerCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-headline transition-all border ${
                        isSelected 
                          ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                          : 'bg-[#0F0F1A] text-gray-400 border-gray-800 hover:text-white'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INPUT TITRE */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-300 block">Titre du sujet <span className="text-red-500">*</span></span>
              <input
                type="text"
                value={composerTitle}
                onChange={(e) => setComposerTitle(e.target.value)}
                maxLength={100}
                placeholder="Résume ta question ou ton sujet en une phrase..."
                className="w-full bg-[#0F0F1A] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
              />
              <div className="flex justify-end text-[9px] text-gray-500">
                {composerTitle.length}/100
              </div>
            </div>

            {/* INPUT CORPS */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-300 block">Développez votre pensée <span className="text-red-500">*</span></span>
              <textarea
                value={composerBody}
                onChange={(e) => setComposerBody(e.target.value)}
                minLength={20}
                maxLength={1000}
                rows={5}
                placeholder="Exposez de façon constructive votre situation, vos triggers ou vos victoires..."
                className="w-full bg-[#0F0F1A] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700] resize-none"
              />
              <div className="flex justify-between items-center text-[9px] text-gray-500">
                <span>Min. 20 caractères requis</span>
                <span>{composerBody.length}/1000</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsComposerOpen(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all text-center uppercase"
              >
                Annuler
              </button>
              
              <button
                disabled={!composerCategory || !composerTitle.trim() || composerBody.trim().length < 20}
                onClick={handleCreateThread}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all text-center uppercase ${
                  (!composerCategory || !composerTitle.trim() || composerBody.trim().length < 20)
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFD700] text-[#0F0F1A] hover:bg-yellow-500'
                }`}
              >
                PUBLIER LE FIL
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. CORE HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded-md">
            Phase Communauté — Forum Central (6.5)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Forum Communautaire
          </h2>
          <p className="text-xs text-gray-400">
            Échangez, posez vos questions et célébrez vos victoires avec vos frères de combat et de clan.
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
              <h4 className="text-xs font-headline font-black text-white">ForumScreen.tsx (TypeScript Expo)</h4>
              <p className="text-[10px] text-gray-500">
                Structure centrale complète du forum : catégories, fils, tri, réponses et votes.
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

      {/* THREE MODULE SECTIONS: LEFT CONTROLLER, MIDDLE PHONE EMULATOR (THREAD LIST), RIGHT THREAD DETAIL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PANEL GAUCHE: SIMULATION CONTROLLER */}
        <div className="lg:col-span-3 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-2">
            <h3 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-1">
              Contrôle de Simulation
            </h3>
            <p className="text-[10px] text-gray-500">
              Pilotez les états de la communauté pour tester les réponses et les flux de publication.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* INJECT POPULAR TEST POST */}
            <button
              onClick={() => {
                const testThread: ThreadData = {
                  id: `thread-test-${Date.now()}`,
                  category: 'vitalite_energie',
                  scope: scopeFilter,
                  authorPseudo: 'Souverain_D_Élite',
                  authorLevel: 15,
                  authorReputationPoints: 450,
                  title: '🚀 Comment j\'ai retrouvé un sommeil profond de 8h grâce aux rituels du soir',
                  bodyPreview: 'Pas d\'écrans après 21h, tisane de camomille, et séance d\'étirements musculaires profonds...',
                  body: 'Frères, mon sommeil était catastrophique. En combinant la sobriété numérique avec un rituel rigoureux d\'étirements et de respiration à 21h, j\'ai réactivé mon système parasympathique. Les résultats sont mesurables scientifiquement.',
                  createdAt: new Date().toISOString(),
                  voteCount: 99,
                  userHasVoted: false,
                  replyCount: 0,
                  isPinned: false
                };
                setThreads(prev => [testThread, ...prev]);
                addToast('success', "Un sujet hautement populaire a été simulé ! 🔥");
              }}
              className="w-full py-2 bg-[#16213E] hover:bg-[#1E2E56] text-[11px] font-bold rounded-xl text-center transition-all border border-gray-800"
            >
              Simuler publication d'un sujet populaire
            </button>

            {/* EMULATE UNANSWERED EMERGENCY TRIGGER */}
            <button
              onClick={() => {
                const urgentThread: ThreadData = {
                  id: `thread-test-urg-${Date.now()}`,
                  category: 'pattern_killer',
                  scope: 'clan',
                  authorPseudo: 'Guerrier_En_Danger',
                  authorLevel: 1,
                  authorReputationPoints: 2,
                  title: '🛑 SOS : Grosse envie de céder après une dure journée',
                  bodyPreview: 'Je suis fatigué, j\'ai envie de relâcher la pression. S\'il vous plaît, rappelez-moi pourquoi je fais ça.',
                  body: 'Je suis fatigué, j\'ai envie de relâcher la pression. S\'il vous plaît, rappelez-moi pourquoi je fais ça.',
                  createdAt: new Date().toISOString(),
                  voteCount: 1,
                  userHasVoted: false,
                  replyCount: 0,
                  isPinned: false
                };
                setThreads(prev => [urgentThread, ...prev]);
                addToast('warning', "Alerte : Un sujet d'urgence non répondu a été injecté ! ⚠️");
              }}
              className="w-full py-2 bg-red-950/20 text-red-400 border border-red-900/30 text-[11px] font-bold rounded-xl text-center hover:bg-red-950/40 transition-all"
            >
              Injecter sujet d'urgence sans réponse
            </button>

            {/* SEED INFO BOX */}
            <div className="bg-[#0F0F1A] border border-gray-800 rounded-2xl p-4 text-[10px] space-y-2 text-gray-400 font-sans leading-relaxed">
              <span className="text-[9px] font-mono text-[#00D9A5] uppercase font-black block">Logique produit</span>
              <p>
                Le Forum est par défaut scopé au <strong>Clan</strong> de l'utilisateur pour préserver la confiance et la fraternité intime, mais propose un accès <strong>Tous les clans</strong> pour échanger à l'échelle globale de l'écosystème.
              </p>
              <p>
                L'option de tri <strong>Sans réponse</strong> isole les frères en difficulté qui n'ont pas encore reçu de réponse pour que le clan se mobilise en priorité.
              </p>
            </div>

            <button
              onClick={() => {
                addToast('info', "Données réinitialisées.");
                fetchThreads();
                setSelectedThreadId(null);
                setThreadDetail(null);
              }}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-[11px] text-white font-bold rounded-xl text-center transition-all"
            >
              Réinitialiser la simulation
            </button>

          </div>
        </div>

        {/* PANEL INTERMÉDIAIRE: EMULATEUR SMARTPHONE (THREAD LISTING) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[390px] aspect-[9/19] bg-[#0F0F1A] border-[8px] border-[#1C1C3A] rounded-[44px] overflow-hidden shadow-2xl relative flex flex-col font-sans">
            
            {/* STATUS BAR */}
            <div className="h-6 bg-[#0F0F1A] px-6 flex justify-between items-center text-[10px] text-gray-500 font-mono shrink-0 select-none">
              <span>10:42</span>
              <div className="flex items-center gap-1.5">
                <span>98%</span>
                <div className="w-4 h-2 bg-emerald-500 rounded-sm" />
              </div>
            </div>
            {/* PHONE HEADER */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1A1A2E] bg-[#0F0F1A] shrink-0">
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#16213E]/60 text-white hover:bg-[#16213E] transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <span className="text-xs font-headline font-black text-[#FFD700] tracking-widest uppercase block">
                  FORUM
                </span>
                <span className="text-[9px] text-[#8E8E93] block">
                  Échanges d'Honneur
                </span>
              </div>

              {/* SEARCH & PLUS BUTTON ROW */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setIsSearchActive(prev => !prev);
                    if (!isSearchActive) {
                      setSearchQuery('');
                      setSearchResults(null);
                    }
                  }}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isSearchActive ? 'bg-gray-800 text-white' : 'hover:bg-[#16213E]/60 text-[#8E8E93]'}`}
                  title="Rechercher"
                >
                  <Search className="w-5 h-5" />
                </button>

                <button 
                  onClick={() => setIsComposerOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFD700] text-[#0F0F1A] hover:bg-yellow-500 transition-all shadow-md shrink-0"
                  title="Nouveau fil"
                >
                  <Plus className="w-5 h-5 font-black" />
                </button>
              </div>
            </div>

            {/* TOUGLE SCOPE: CLAN / TOUS LES CLANS */}
            <div className="px-4 pt-3 shrink-0">
              <div className="flex bg-[#1A1A2E] p-1 rounded-xl border border-[#252542]">
                <button
                  onClick={() => {
                    setScopeFilter('clan');
                    addToast('info', "Flux restreint à l'honneur de votre Clan 🛡️");
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wide ${scopeFilter === 'clan' ? 'bg-[#FFD700] text-[#0F0F1A]' : 'text-gray-400 hover:text-white'}`}
                >
                  Mon Clan
                </button>
                <button
                  onClick={() => {
                    setScopeFilter('all');
                    addToast('info', "Ouverture du flux global (Tous les Clans) 🌍");
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wide ${scopeFilter === 'all' ? 'bg-[#FFD700] text-[#0F0F1A]' : 'text-gray-400 hover:text-white'}`}
                >
                  Tous les clans
                </button>
              </div>
            </div>

            {/* SCROLLABLE VIEWPORT CONTENT */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar text-left pb-16">
              
              {/* CATEGORIES HORIZONTALES (CHIPS) / RECHERCHE INPUT */}
              <div className="shrink-0 min-h-[40px] flex items-center justify-between">
                {isSearchActive ? (
                  <div className="flex items-center gap-2 w-full animate-[fade-in_0.2s_ease-out]">
                    <div className="flex-1 bg-[#1A1A2E] rounded-[10px] py-1.5 px-3 flex items-center gap-2 border border-gray-800">
                      <Search className="w-4 h-4 text-[#5A5A5A] shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher dans le forum..."
                        className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
                        autoFocus
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setIsSearchActive(false);
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      className="text-[12px] text-[#8E8E93] hover:text-[#FFD700] transition-colors py-1 pl-1 shrink-0 font-sans"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto flex gap-2 pb-1 scrollbar-none shrink-0 w-full animate-[fade-in_0.2s_ease-out]">
                    {categoriesList.map((cat) => {
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
                          {cat.icon} {cat.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BARRE DE TRI */}
              <div className="flex justify-between items-center bg-[#111124] rounded-xl px-3 py-2 border border-gray-800/60 shrink-0">
                <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">Trier les sujets</span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  <button 
                    onClick={() => setSortBy('recent')}
                    className={`hover:text-white transition-all ${sortBy === 'recent' ? 'text-[#FFD700]' : ''}`}
                  >
                    Récent
                  </button>
                  <span className="text-gray-600 font-normal">·</span>
                  <button 
                    onClick={() => setSortBy('popular')}
                    className={`hover:text-white transition-all ${sortBy === 'popular' ? 'text-[#FFD700]' : ''}`}
                  >
                    Populaire
                  </button>
                  <span className="text-gray-600 font-normal">·</span>
                  <button 
                    onClick={() => setSortBy('unanswered')}
                    className={`hover:text-white transition-all ${sortBy === 'unanswered' ? 'text-[#FFD700]' : ''}`}
                  >
                    Sans réponse
                  </button>
                </div>
              </div>

              {/* FILS ÉPINGLÉS SECTION */}
              {!isSearchActive && pinnedThreads.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] text-gray-500 font-mono tracking-widest block uppercase pl-1">📌 Messages Épinglés</span>
                  <div className="space-y-2">
                    {pinnedThreads.map((item) => {
                      const catInfo = categoryMap[item.category] || categoryMap.general;
                      const isSelected = selectedThreadId === item.id;
                      const isAuthor = item.authorPseudo === 'Guerrier_Novice';
                      const isNeedsReview = item.moderationStatus === 'needs_review' || item.moderationStatus === 'removed';

                      if (isNeedsReview && !isAuthor) {
                        return (
                          <div key={item.id} className="bg-[#16213E]/40 border border-red-900/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center py-6">
                            <EyeOff className="w-5 h-5 text-red-400 mb-1" />
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Contenu Masqué</span>
                            <p className="text-[9px] text-gray-500 mt-1 max-w-[220px]">Ce message épinglé a reçu plusieurs signalements de la communauté et est en cours de révision.</p>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenThread(item.id)}
                          className={`bg-[#16213E] hover:bg-[#1E2E56] border rounded-2xl p-3.5 transition-all cursor-pointer text-left relative ${
                            isSelected ? 'border-[#FFD700] ring-1 ring-[#FFD700]/30' : 'border-[#FFD700]/30 hover:border-gray-700'
                          }`}
                        >
                          {isNeedsReview && isAuthor && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 mb-2.5 text-[9px] text-red-400 flex items-center gap-1.5 font-bold">
                              <span>⚠️ Ce sujet est en cours de modération (visible uniquement par vous).</span>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 text-[8px] font-bold text-gray-400 pb-2 border-b border-gray-800/40">
                            <span className="bg-[#FFD700]/15 text-[#FFD700] px-1.5 py-0.5 rounded uppercase flex items-center gap-1 select-none">
                              <span>📌 ÉPINGLÉ</span>
                              <span>·</span>
                              <span>{catInfo.icon} {catInfo.label.toUpperCase()}</span>
                            </span>
                            {item.hasExpertReply && (
                              <span className="bg-[#4A90D9]/12 text-[#4A90D9] text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-[#4A90D9]/20 select-none">
                                👨‍⚕️ Expert
                              </span>
                            )}
                            {item.hasSolution && (
                              <span className="bg-[#00D9A5]/12 text-[#00D9A5] text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-[#00D9A5]/20 select-none">
                                🏆 Solution
                              </span>
                            )}
                            <span className="ml-auto font-normal text-gray-500 font-sans">il y a 3j</span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-white mt-2 leading-snug line-clamp-2 font-headline">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                            {item.bodyPreview}
                          </p>

                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-800/50">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={(e) => handleVoteThread(e, item.id, true)}
                                className="flex items-center gap-1.5 group"
                              >
                                <ChevronUp className={`w-4 h-4 transition-transform group-hover:scale-125 ${item.userHasVoted ? 'text-[#00D9A5] font-black' : 'text-gray-500'}`} />
                                <span className={`text-[10px] font-bold ${item.userHasVoted ? 'text-[#00D9A5]' : 'text-gray-400'}`}>{item.voteCount}</span>
                              </button>

                              <span className="text-[10px] text-gray-500 font-mono">
                                💬 {item.replyCount}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReportMenu(item.id, 'thread');
                                }}
                                className="flex items-center gap-1 hover:text-red-400 text-gray-500 transition-colors"
                                title="Signaler ce fil"
                              >
                                <Flag className="w-3.5 h-3.5" />
                                <span className="text-[9px]">Signaler</span>
                              </button>
                            </div>
                            <span className="text-[9px] text-gray-500 italic flex items-center font-sans">
                              par {item.authorPseudo} <ReputationBadge points={item.authorReputationPoints} compact={true} /> (Lvl {item.authorLevel})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FILS TENDANCE SECTION */}
              {!isSearchActive && trendingThreads && trendingThreads.length > 0 && (
                <div className="space-y-2 mt-4">
                  <span className="text-[11px] font-bold text-[#FF9500] tracking-wider uppercase block px-1">🔥 TENDANCES</span>
                  <div className="overflow-x-auto flex gap-3 pb-2 scrollbar-none">
                    {trendingThreads.map((trend) => (
                      <TrendingCard 
                        key={trend.id} 
                        thread={trend} 
                        onClick={() => handleOpenThread(trend.id)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* LISTE DES FILS CLASSIQUES / RÉSULTATS RECHERCHE */}
              <div className="space-y-3 pt-1">
                {isSearchActive && searchQuery.trim() !== '' ? (
                  <>
                    <span className="text-[9px] text-gray-500 font-mono tracking-widest block uppercase pl-1">🔎 Résultats de recherche</span>
                    
                    {searchResults === null ? (
                      <div className="text-center py-10 text-gray-500 font-mono text-xs animate-pulse">
                        Recherche en cours dans la confrérie...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-12 bg-[#16213E]/10 rounded-2xl p-4 text-gray-500 space-y-2">
                        <Search className="w-8 h-8 text-[#5A5A5A] mx-auto" />
                        <p className="text-xs font-sans text-[#8E8E93]">
                          Aucun résultat pour "{searchQuery}". Essaie d'autres mots.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-[#8E8E93] px-1 font-sans font-medium select-none">
                          {searchResults.length} {searchResults.length > 1 ? 'résultats' : 'résultat'} pour "{searchQuery}"
                        </p>
                        {searchResults.map((item) => {
                          const catInfo = categoryMap[item.category] || categoryMap.general;
                          const isSelected = selectedThreadId === item.id;
                          const isAuthor = item.authorPseudo === 'Guerrier_Novice';
                          const isNeedsReview = item.moderationStatus === 'needs_review' || item.moderationStatus === 'removed';

                          if (isNeedsReview && !isAuthor) {
                            return (
                              <div key={item.id} className="bg-[#16213E]/40 border border-red-900/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center py-6">
                                <EyeOff className="w-5 h-5 text-red-400 mb-1" />
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Contenu Masqué</span>
                                <p className="text-[9px] text-gray-500 mt-1 max-w-[220px]">Ce message a reçu plusieurs signalements et est en cours de révision.</p>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleOpenThread(item.id)}
                              className={`bg-[#16213E] hover:bg-[#1E2E56] border rounded-2xl p-4 transition-all cursor-pointer text-left relative ${
                                isSelected ? 'border-[#FFD700] ring-1 ring-[#FFD700]/30' : 'border-gray-800/80 hover:border-gray-700'
                              }`}
                            >
                              {isNeedsReview && isAuthor && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 mb-2.5 text-[9px] text-red-400 flex items-center gap-1.5 font-bold">
                                  <span>⚠️ Ce sujet est en cours de modération (visible uniquement par vous).</span>
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5 text-[8px] font-mono text-gray-500">
                                <span className={`${catInfo.bg} ${catInfo.color} border px-2 py-0.5 rounded font-black uppercase whitespace-nowrap`}>
                                  {catInfo.icon} {catInfo.label}
                                </span>
                                {item.hasExpertReply && (
                                  <span className="bg-[#4A90D9]/12 text-[#4A90D9] text-[8px] font-black uppercase px-2 py-0.5 rounded border border-[#4A90D9]/20 whitespace-nowrap select-none">
                                    👨‍⚕️ Expert a répondu
                                  </span>
                                )}
                                {item.hasSolution && (
                                  <span className="bg-[#00D9A5]/12 text-[#00D9A5] text-[8px] font-black uppercase px-2 py-0.5 rounded border border-[#00D9A5]/20 whitespace-nowrap select-none">
                                    🏆 Résolu
                                  </span>
                                )}
                                <span className="text-gray-500 font-sans ml-auto flex items-center shrink-0">
                                  {item.authorPseudo} <ReputationBadge points={item.authorReputationPoints} compact={true} /> · Lvl {item.authorLevel}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-white mt-2 leading-normal line-clamp-2 font-headline">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                {item.bodyPreview}
                              </p>

                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-800/60 text-[10px]">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => handleVoteThread(e, item.id, false)}
                                    className="flex items-center gap-1 group"
                                  >
                                    <ChevronUp className={`w-4 h-4 transition-transform group-hover:scale-125 ${item.userHasVoted ? 'text-[#00D9A5] font-black' : 'text-gray-500'}`} />
                                    <span className={`font-black ${item.userHasVoted ? 'text-[#00D9A5]' : 'text-gray-400'}`}>{item.voteCount}</span>
                                  </button>

                                  <span className="text-gray-400 font-sans flex items-center gap-1">
                                    <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                                    {item.replyCount}
                                  </span>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReportMenu(item.id, 'thread');
                                    }}
                                    className="flex items-center gap-1 hover:text-red-400 text-gray-500 transition-colors"
                                    title="Signaler ce fil"
                                  >
                                    <Flag className="w-3.5 h-3.5" />
                                    <span>Signaler</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-[9px] text-gray-500 font-mono tracking-widest block uppercase pl-1">💬 Flux de discussion</span>

                    {isLoading ? (
                      <div className="text-center py-10 text-gray-500 font-mono text-xs animate-pulse">
                        Synchronisation de la confrérie...
                      </div>
                    ) : threads.length === 0 ? (
                      <div className="text-center py-12 bg-[#16213E]/30 rounded-2xl p-4 text-gray-500">
                        <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-xs">Aucun fil trouvé dans cette section.</p>
                      </div>
                    ) : (
                      threads.map((item) => {
                        const catInfo = categoryMap[item.category] || categoryMap.general;
                        const isSelected = selectedThreadId === item.id;
                        const isAuthor = item.authorPseudo === 'Guerrier_Novice';
                        const isNeedsReview = item.moderationStatus === 'needs_review' || item.moderationStatus === 'removed';
                        const timeText = "il y a 2h";

                        if (isNeedsReview && !isAuthor) {
                          return (
                            <div key={item.id} className="bg-[#16213E]/40 border border-red-900/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center py-6">
                              <EyeOff className="w-5 h-5 text-red-400 mb-1" />
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Contenu Masqué</span>
                              <p className="text-[9px] text-gray-500 mt-1 max-w-[220px]">Ce message a reçu plusieurs signalements de la communauté et est en cours de révision.</p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenThread(item.id)}
                            className={`bg-[#16213E] hover:bg-[#1E2E56] border rounded-2xl p-4 transition-all cursor-pointer text-left relative ${
                              isSelected ? 'border-[#FFD700] ring-1 ring-[#FFD700]/30' : 'border-gray-800/80 hover:border-gray-700'
                            }`}
                          >
                            {isNeedsReview && isAuthor && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 mb-2.5 text-[9px] text-red-400 flex items-center gap-1.5 font-bold">
                                <span>⚠️ Ce sujet est en cours de modération (visible uniquement par vous).</span>
                              </div>
                            )}
                            {/* Thread Card Header */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[8px] font-mono text-gray-500">
                              <span className={`${catInfo.bg} ${catInfo.color} border px-2 py-0.5 rounded font-black uppercase whitespace-nowrap`}>
                                {catInfo.icon} {catInfo.label}
                              </span>
                              {item.hasExpertReply && (
                                <span className="bg-[#4A90D9]/12 text-[#4A90D9] text-[8px] font-black uppercase px-2 py-0.5 rounded border border-[#4A90D9]/20 whitespace-nowrap select-none">
                                  👨‍⚕️ Expert a répondu
                                </span>
                              )}
                              {item.hasSolution && (
                                <span className="bg-[#00D9A5]/12 text-[#00D9A5] text-[8px] font-black uppercase px-2 py-0.5 rounded border border-[#00D9A5]/20 whitespace-nowrap select-none">
                                  🏆 Résolu
                                </span>
                              )}
                              <span className="text-gray-500 font-sans ml-auto flex items-center shrink-0">
                                {item.authorPseudo} <ReputationBadge points={item.authorReputationPoints} compact={true} /> · Lvl {item.authorLevel}
                              </span>
                              <span className="text-gray-600 font-sans font-normal">{timeText}</span>
                            </div>

                            {/* Title & Preview */}
                            <h4 className="text-xs font-bold text-white mt-2 leading-normal line-clamp-2 font-headline">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.bodyPreview}
                            </p>

                            {/* Thread Card Footer */}
                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-800/60 text-[10px]">
                              <div className="flex items-center gap-3">
                                {/* Vote trigger */}
                                <button
                                  onClick={(e) => handleVoteThread(e, item.id, false)}
                                  className="flex items-center gap-1 group"
                                >
                                  <ChevronUp className={`w-4 h-4 transition-transform group-hover:scale-125 ${item.userHasVoted ? 'text-[#00D9A5] font-black' : 'text-gray-500'}`} />
                                  <span className={`font-black ${item.userHasVoted ? 'text-[#00D9A5]' : 'text-gray-400'}`}>{item.voteCount}</span>
                                </button>

                                {/* Reply count */}
                                <span className="text-gray-400 font-sans flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                                  {item.replyCount}
                                </span>

                                {/* Signalement */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenReportMenu(item.id, 'thread');
                                  }}
                                  className="flex items-center gap-1 hover:text-red-400 text-gray-500 transition-colors"
                                  title="Signaler ce fil"
                                >
                                  <Flag className="w-3.5 h-3.5" />
                                  <span>Signaler</span>
                                </button>
                              </div>

                              {/* Unanswered badge */}
                              {item.replyCount === 0 && (
                                <span className="bg-[#FFD700]/12 text-[#FFD700] text-[8px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse select-none">
                                  Sans réponse ⏳
                                </span>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>

            </div>

            {/* PHONE BOTTOM TAB OVERLAY BAR */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-[#0F0F1A] border-t border-gray-800/60 flex items-center justify-around text-gray-500 font-mono text-[9px] shrink-0">
              <span className="text-[#FFD700]">● FORUM</span>
              <span>● CLANS</span>
              <span>● PROFIL</span>
            </div>

          </div>
        </div>

        {/* PANEL DROIT: FOCUS DETAILED VIEW SCREEN */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-4 text-left shadow-lg min-h-[500px] flex flex-col justify-between">
          
          {selectedThreadId && threadDetail ? (
            threadDetail.moderationStatus === 'needs_review' && threadDetail.authorPseudo !== 'Guerrier_Novice' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
                <EyeOff className="w-12 h-12 text-red-500/60 animate-bounce mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-red-400 font-headline uppercase">Sujet Temporairement Masqué</h4>
                  <p className="text-[11px] text-gray-500 font-sans max-w-[220px] mx-auto mt-1 leading-relaxed">
                    Ce contenu a fait l'objet de plusieurs signalements de la communauté et a été mis en attente pour examen de modération.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-4 h-full">
                
                {/* DETAILED MESSAGE HEADER */}
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[480px]">
                  
                  {threadDetail.moderationStatus === 'needs_review' && threadDetail.authorPseudo === 'Guerrier_Novice' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-[10px] text-red-400 flex flex-col gap-1 font-semibold leading-relaxed">
                      <span className="font-bold flex items-center gap-1.5">⚠️ Sujet en cours d'examen</span>
                      <span>Ce sujet a été signalé par d'autres guerriers et est actuellement masqué pour eux pendant sa révision.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD700]/30 to-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] font-black text-xs uppercase">
                        {threadDetail.authorPseudo[0]}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-xs font-bold text-white block">{threadDetail.authorPseudo}</span>
                          <ReputationBadge points={threadDetail.authorReputationPoints} compact={false} />
                        </div>
                        <span className="text-[9px] text-[#00D9A5] block font-mono">Niveau {threadDetail.authorLevel} d'Honneur</span>
                      </div>
                    </div>
                    
                    <span className="text-[9px] text-gray-500 font-mono">il y a quelques jours</span>
                  </div>

                  {/* ORIGINAL BODY */}
                  <div className="space-y-2">
                    <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase font-mono tracking-widest">
                      {(categoryMap[threadDetail.category] || categoryMap.general).label}
                    </span>
                    <h3 className="text-sm font-headline font-black text-white leading-normal">
                      {threadDetail.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap bg-[#0F0F1A] border border-gray-800/80 p-3.5 rounded-2xl">
                      {threadDetail.body}
                    </p>
                  </div>

                  {/* THREAD DETAILS FOOTER ACTION */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono py-1 border-b border-gray-800/50">
                    <button 
                      onClick={(e) => handleVoteThread(e, threadDetail.id, threadDetail.isPinned)}
                      className="flex items-center gap-1.5 bg-gray-800/60 hover:bg-gray-800 px-2.5 py-1 rounded-lg transition-all"
                    >
                      <ChevronUp className={`w-4 h-4 ${threadDetail.userHasVoted ? 'text-[#00D9A5]' : 'text-gray-500'}`} />
                      <span className={threadDetail.userHasVoted ? 'text-[#00D9A5] font-black' : ''}>{threadDetail.voteCount} soutiens</span>
                    </button>
                    <span>•</span>
                    <span>{threadReplies.length} réponses</span>
                    <span>•</span>
                    <button
                      onClick={() => handleOpenReportMenu(threadDetail.id, 'thread')}
                      className="flex items-center gap-1 hover:text-red-400 transition-colors"
                      title="Signaler ce fil"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Signaler</span>
                    </button>
                  </div>

                {/* REPLIES ITERATOR LIST */}
                <div className="space-y-2.5 pt-1.5">
                  <span className="text-[10px] font-headline font-black text-[#FFD700] tracking-wider uppercase block pb-1">
                    Échanges fraternels ({threadReplies.length})
                  </span>

                  {/* Bouton de simulation expert */}
                  {selectedThreadId && threadDetail && !threadReplies.some(reply => !!reply.isExpertReply) && (
                    <button
                      onClick={handleSimulateExpert}
                      className="w-full py-2 bg-[#16213E] hover:bg-[#1E2E56] text-[11px] font-bold rounded-xl text-center transition-all border border-gray-800"
                    >
                      🧪 Simuler une réponse d'expert sur ce fil
                    </button>
                  )}

                  {threadReplies.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 italic text-[11px] font-sans">
                      Soyez le premier à répondre pour prêter main forte à votre frère ! ⚔️
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {threadReplies.map((reply) => {
                        const isExpert = !!reply.isExpertReply;
                        const isBest = !!reply.isMarkedBest;
                        const isAuthor = reply.authorPseudo === 'Guerrier_Novice';
                        const isNeedsReview = reply.moderationStatus === 'needs_review' || reply.moderationStatus === 'removed';
                        
                        if (isNeedsReview && !isAuthor) {
                          return (
                            <div key={reply.id} className="bg-[#1A1A2E]/50 border border-red-900/20 rounded-2xl p-3 flex items-center gap-3">
                              <EyeOff className="w-4 h-4 text-red-400 shrink-0" />
                              <span className="text-[10px] text-gray-500 italic">Réponse masquée temporairement suite à des signalements de la communauté.</span>
                            </div>
                          );
                        }

                        let cardStyle = "bg-[#1A1A2E] border border-gray-800/80";
                        if (isBest) {
                          cardStyle = "bg-[rgba(0,217,165,0.08)] border-[1.5px] border-[#00D9A5] shadow-[0_0_12px_rgba(0,217,165,0.15)]";
                        } else if (isExpert) {
                          cardStyle = "bg-[rgba(74,144,217,0.08)] border-[1.5px] border-[#4A90D9]";
                        }

                        return (
                          <div 
                            key={reply.id}
                            className={`${cardStyle} rounded-2xl p-4 text-left space-y-2 relative transition-all duration-300`}
                          >
                            {isNeedsReview && isAuthor && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 text-[9px] text-red-400 font-bold leading-relaxed">
                                ⚠️ Votre réponse a été signalée et est actuellement invisible pour les autres membres.
                              </div>
                            )}

                            {/* Badges at the top if Expert or Best */}
                            <div className="flex flex-wrap gap-[6px] pb-1 items-center">
                              {isBest && (
                                <span className="bg-[#00D9A5]/15 text-[#00D9A5] text-[9px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1 select-none">
                                  🏆 SOLUTION
                                </span>
                              )}
                              {isExpert && (
                                isBest ? (
                                  <span 
                                    className="bg-[#4A90D9]/15 text-[#4A90D9] text-[9px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1 select-none font-sans"
                                    title={reply.expertSpecialty ? `Expert · ${reply.expertSpecialty.charAt(0).toUpperCase() + reply.expertSpecialty.slice(1)}` : "Expert"}
                                  >
                                    ✓ EXPERT
                                  </span>
                                ) : (
                                  <span className="bg-[#4A90D9]/15 text-[#4A90D9] text-[9px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1 select-none font-sans">
                                    ✓ RÉPONSE D'EXPERT {reply.expertSpecialty && `· ${reply.expertSpecialty.charAt(0).toUpperCase() + reply.expertSpecialty.slice(1)}`}
                                  </span>
                                )
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between text-[10px] border-b border-gray-800/40 pb-1.5 gap-2">
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="font-bold text-[#FFD700]">
                                  {reply.authorPseudo}
                                </span>
                                <span className="text-[8px] text-gray-500 font-mono">(Lvl {reply.authorLevel})</span>
                                <ReputationBadge points={reply.authorReputationPoints} compact={false} />
                              </div>
                              <span className="text-[9px] text-gray-500 font-sans">à l'instant</span>
                            </div>

                            <p className="text-xs text-white leading-relaxed font-sans whitespace-pre-wrap">
                              {reply.text}
                            </p>

                            {/* Reply Action Footer */}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-800/40">
                              <div className="flex items-center gap-2.5 shrink-0">
                                <button
                                  onClick={() => handleVoteReply(reply.id)}
                                  className="flex items-center gap-1 group"
                                >
                                  <ChevronUp className={`w-3.5 h-3.5 group-hover:scale-125 transition-transform ${reply.userHasVoted ? 'text-[#00D9A5] font-black' : 'text-gray-500'}`} />
                                  <span className={`text-[10px] ${reply.userHasVoted ? 'text-[#00D9A5] font-bold' : 'text-gray-400'}`}>
                                    {reply.voteCount}
                                  </span>
                                </button>

                                <button
                                  onClick={() => handleOpenReportMenu(reply.id, 'reply')}
                                  className="flex items-center gap-1 hover:text-red-400 text-gray-500 transition-colors text-[9px] font-bold"
                                  title="Signaler cette réponse"
                                >
                                  <Flag className="w-3 h-3" />
                                  <span>Signaler</span>
                                </button>
                              </div>

                              {/* Mark as Best / Solution button */}
                              {!threadDetail.hasSolution && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {confirmingBestAnswerFor === reply.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={cancelMarkBestCountdown}
                                        className="text-[8px] font-sans text-gray-400 hover:text-white bg-gray-800/80 px-2 py-0.5 rounded transition-colors"
                                      >
                                        Annuler
                                      </button>
                                      <button
                                        className="bg-[#FF9500] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 animate-pulse"
                                      >
                                        <span>Confirmer ({confirmCountdown}s)</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => startMarkBestCountdown(reply.id)}
                                      className="text-[9px] font-bold text-gray-500 hover:text-[#00D9A5] transition-colors flex items-center gap-1"
                                      title="Désigner comme meilleure réponse"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Meilleure réponse</span>
                                    </button>
                                  )}
                                </div>
                              )}

                              {!isExpert && !isBest && (
                                <span className="text-[9px] text-gray-600 font-mono">Réponse constructive</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* REPLY EMITTER BAR FIXED AT BOTTOM */}
              <div className="pt-3 border-t border-gray-800 bg-[#111124] space-y-2">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Prêtez main forte à votre frère avec un conseil..."
                    className="flex-1 bg-[#0F0F1A] border border-gray-800 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700] resize-none"
                  />
                  <button
                    disabled={!replyInput.trim()}
                    onClick={handlePostReply}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      replyInput.trim() 
                        ? 'bg-[#FFD700] text-[#0F0F1A] hover:bg-yellow-500' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-500 px-1 font-mono">
                  <span>Maximum 500 caractères</span>
                  <span>{replyInput.length}/500</span>
                </div>
              </div>

            </div>
          )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
              <MessageSquare className="w-12 h-12 text-gray-700 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-gray-400 font-headline uppercase">Aucun fil sélectionné</h4>
                <p className="text-[11px] text-gray-500 font-sans max-w-[220px] mx-auto mt-1 leading-relaxed">
                  Appuyez sur un sujet du forum dans l'émulateur central pour lire l'intégralité du fil et y répondre.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL DE SIGNALEMENT (REPORT DIALOG) */}
      {isReportMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#111124] border border-[#1C1C3A] rounded-2xl p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-2 text-red-400">
              <Flag className="w-5 h-5" />
              <h4 className="text-sm font-bold font-headline uppercase tracking-wider">Signaler ce contenu</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
              Aidez-nous à préserver la fraternité et la bienveillance au sein de la confrérie. Quel est le motif de ce signalement ?
            </p>
            <div className="space-y-2">
              {[
                { id: 'harassment', label: 'Harcèlement ou intimidation' },
                { id: 'inappropriate', label: 'Contenu inapproprié ou explicite' },
                { id: 'spam', label: 'Spam, liens suspects ou publicité' },
                { id: 'self_harm', label: 'Détresse, suicide ou automutilation' },
                { id: 'other', label: 'Autre infraction aux règles' }
              ].map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => submitReport(reason.id as any)}
                  className="w-full text-left text-xs text-white bg-[#16213E] hover:bg-[#1E2E56] hover:text-[#00D9A5] border border-gray-800/80 px-3.5 py-2.5 rounded-xl transition-all font-sans font-medium"
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsReportMenuOpen(false);
                  setReportTargetId(null);
                  setReportTargetType(null);
                }}
                className="text-xs text-gray-400 hover:text-white font-mono px-3 py-1.5 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE SÉCURITÉ / DÉTRESSE (DISTRESS WARNING OVERLAY) */}
      {distressOverlayVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-gradient-to-b from-[#1E1124] to-[#111124] border border-red-500/30 rounded-3xl p-6 space-y-5 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto animate-pulse">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-headline font-black text-white uppercase tracking-wide">
                Tu n'es pas seul, mon frère 🛡️
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans max-w-sm mx-auto">
                La confrérie est un lieu de combat, mais aussi de soutien inconditionnel. Si tu traverses une période difficile ou que tu penses à en finir, sache qu'il existe des oreilles attentives prêtes à t'épauler sans jugement.
              </p>
            </div>

            <div className="bg-[#0F0F1A] border border-gray-800/80 rounded-2xl p-4 space-y-2.5 text-left">
              <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">📍 France (SOS Amitié)</span>
                <span className="text-xs font-black text-red-400 font-mono">09 72 39 40 50</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">📍 Suicide Écoute</span>
                <span className="text-xs font-black text-red-400 font-mono">01 45 39 40 00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">📞 Ligne d'Urgence Nationale</span>
                <span className="text-xs font-black text-red-400 font-mono">31 14 (Appel Gratuit)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setDistressOverlayVisible(false);
                  if (onRequestCoachChat) {
                    onRequestCoachChat();
                  }
                }}
                className="flex-1 bg-[#FFD700] hover:bg-yellow-500 text-[#0F0F1A] text-xs font-black uppercase py-3 rounded-xl transition-all shadow-md hover:shadow-yellow-500/20 flex items-center justify-center gap-1.5"
              >
                💬 Parler à l'I.A. Coach de crise
              </button>
              <button
                onClick={() => setDistressOverlayVisible(false)}
                className="flex-1 bg-gray-800/60 hover:bg-gray-800 text-gray-300 text-xs font-bold uppercase py-3 rounded-xl transition-colors border border-gray-700/50"
              >
                Fermer (10s)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
