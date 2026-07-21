import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  HeartPulse, 
  AlertTriangle, 
  Heart, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Star, 
  HelpCircle,
  XCircle,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModerationItem {
  id: string;
  source: 'stories' | 'forum' | 'chat' | 'experts';
  contentType: 'thread' | 'reply' | 'message' | 'story' | 'question';
  status: 'pending' | 'needs_review' | 'approved' | 'removed' | 'featured';
  authorPseudo: string;
  authorLevel: number;
  authorStreak: number;
  contentPreview: string;
  contentFull: string;
  reportCount: number;
  reportReasons: Array<{ reason: string; count: number }>;
  distressFlagged: boolean;
  followedUpAt: string | null;
  followedUpBy: string | null;
  createdAt: string;
  followUpNote?: string;
}

interface RecentAction {
  id: string;
  type: string;
  text: string;
  timestamp: string;
}

interface ModerationScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack: () => void;
  initialSourceFilter?: 'all' | 'stories' | 'forum' | 'chat' | 'experts';
}

export const ModerationScreen: React.FC<ModerationScreenProps> = ({ 
  addToast, 
  onBack,
  initialSourceFilter = 'all'
}) => {
  // Check unlock status (protect screen)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('alpha_admin_unlocked') === 'true';
  });
  const [accessCodeInput, setAccessCodeInput] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);

  // Layout View selection
  const [activeView, setActiveView] = useState<'standard' | 'distress'>('standard');
  const [activeSourceFilter, setActiveSourceFilter] = useState<'all' | 'stories' | 'forum' | 'chat' | 'experts'>(initialSourceFilter);

  // Moderation Queues state
  const [standardQueue, setStandardQueue] = useState<ModerationItem[]>([]);
  const [distressQueue, setDistressQueue] = useState<ModerationItem[]>([]);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [queueCounts, setQueueCounts] = useState({
    stories: 0,
    forum: 0,
    chat: 0,
    experts: 0,
    total: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Expansion and Input States
  const [expandedRemoveCardId, setExpandedRemoveCardId] = useState<string | null>(null);
  const [removeReasonInput, setRemoveReasonInput] = useState<string>('');
  
  const [expandedFollowUpCardId, setExpandedFollowUpCardId] = useState<string | null>(null);
  const [followUpNoteInput, setFollowUpNoteInput] = useState<string>('');

  // Track truncated state for previews in list view
  const [expandedPreviews, setExpandedPreviews] = useState<Record<string, boolean>>({});

  // Auth unlock
  const handleUnlockAdmin = () => {
    if (accessCodeInput === 'ALPHA_HQ_2026') {
      setIsUnlocked(true);
      localStorage.setItem('alpha_admin_unlocked', 'true');
      addToast('success', 'Bienvenue Commandant de la Confrérie ! Accès autorisé 🛡️');
    } else if (accessCodeInput.trim().length > 0) {
      addToast('error', 'Code de sécurité invalide. Autorisation refusée.');
    } else {
      addToast('error', 'Le code d\'accès ne peut pas être vide.');
    }
  };

  // Fetch current Queue counts
  const fetchCounts = useCallback(() => {
    fetch('/api/admin/moderation/queue-summary')
      .then(res => res.json())
      .then(data => {
        setQueueCounts({
          stories: data.stories || 0,
          forum: data.forumThreads || 0,
          chat: data.chatReports || 0,
          experts: data.expertQuestions || 0,
          total: data.total || 0
        });
      })
      .catch(err => console.error('Error fetching queue summary:', err));
  }, []);

  // Fetch queue items based on filters
  const fetchQueue = useCallback(() => {
    setIsLoading(true);
    fetch(`/api/admin/moderation/queue?view=${activeView}&source=${activeSourceFilter}`)
      .then(res => res.json())
      .then(data => {
        if (activeView === 'standard') {
          setStandardQueue(data);
        } else {
          setDistressQueue(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching moderation queue:', err);
        setIsLoading(false);
        addToast('error', 'Échec du chargement de la file de modération.');
      });
  }, [activeView, activeSourceFilter, addToast]);

  // Fetch recent log actions
  const fetchRecentActions = useCallback(() => {
    fetch('/api/admin/moderation/recent-actions')
      .then(res => res.json())
      .then(data => {
        setRecentActions(data);
      })
      .catch(err => console.error('Error fetching recent actions:', err));
  }, []);

  // Sync all data on load/changes
  useEffect(() => {
    if (isUnlocked) {
      fetchQueue();
      fetchCounts();
      fetchRecentActions();
    }
  }, [isUnlocked, activeView, activeSourceFilter, fetchQueue, fetchCounts, fetchRecentActions]);

  // Approve action
  const handleApprove = async (item: ModerationItem) => {
    try {
      const res = await fetch(`/api/admin/moderation/${item.id}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast('success', `Contenu approuvé avec succès.`);
        // Remove locally from state with animation delay or immediately
        setStandardQueue(prev => prev.filter(i => i.id !== item.id));
        fetchCounts();
        fetchRecentActions();
      } else {
        throw new Error('Approval request failed');
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Erreur lors de l\'approbation du contenu.');
    }
  };

  // Feature action
  const handleFeature = async (item: ModerationItem) => {
    try {
      const res = await fetch(`/api/admin/moderation/${item.id}/feature`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast('success', `Récit de @${item.authorPseudo} mis en vedette ⭐`);
        setStandardQueue(prev => prev.filter(i => i.id !== item.id));
        fetchCounts();
        fetchRecentActions();
      } else {
        throw new Error('Feature request failed');
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Erreur lors de la mise en vedette.');
    }
  };

  // Remove action
  const handleRemoveSubmit = async (itemId: string) => {
    if (!removeReasonInput.trim()) {
      addToast('warning', 'Veuillez saisir un motif de retrait.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/moderation/${itemId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: removeReasonInput })
      });
      if (res.ok) {
        addToast('success', 'Contenu retiré et archivé.');
        setStandardQueue(prev => prev.filter(i => i.id !== itemId));
        setExpandedRemoveCardId(null);
        setRemoveReasonInput('');
        fetchCounts();
        fetchRecentActions();
      } else {
        throw new Error('Remove request failed');
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Erreur lors du retrait du contenu.');
    }
  };

  // Follow up action
  const handleFollowUpSubmit = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/moderation/${itemId}/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: followUpNoteInput })
      });
      if (res.ok) {
        addToast('success', 'Suivi détresse validé et noté.');
        // Update local item status to show confirmed
        setDistressQueue(prev => prev.map(i => {
          if (i.id === itemId) {
            return {
              ...i,
              followedUpAt: new Date().toISOString(),
              followedUpBy: 'Général HQ',
              followUpNote: followUpNoteInput
            };
          }
          return i;
        }));
        setExpandedFollowUpCardId(null);
        setFollowUpNoteInput('');
        fetchCounts();
        fetchRecentActions();
      } else {
        throw new Error('Follow-up request failed');
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Erreur lors de la validation du suivi.');
    }
  };

  // Helper to format source badges
  const renderSourceBadge = (source: string, contentType: string) => {
    switch (source) {
      case 'stories':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700]">
            📖 Récit
          </span>
        );
      case 'forum':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-[#4A90D9]/10 border border-[#4A90D9]/20 text-[#4A90D9]">
            💬 Forum ({contentType === 'thread' ? 'Sujet' : 'Réponse'})
          </span>
        );
      case 'chat':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-[#00D9A5]/10 border border-[#00D9A5]/20 text-[#00D9A5]">
            👥 Chat Clan
          </span>
        );
      case 'experts':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA]">
            🩺 Experts
          </span>
        );
      default:
        return null;
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[85vh] bg-[#0F0F1A] p-4 text-center select-none">
        {/* ACCESS CONTROL GATE */}
        <div className="w-full max-w-md bg-[#111124] border border-[#1C1C3A] rounded-[32px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-[#FFD700] to-emerald-500" />
          
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-1">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-headline font-black text-white uppercase tracking-wider">
              Poste de Modération HQ
            </h2>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Zone hautement restreinte. Saisissez la clé d'habilitation souveraine pour accéder au journal d'arbitrage et de secours.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showCode ? "text" : "password"}
                placeholder="CLÉ DE SÉCURITÉ ADMIN"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlockAdmin()}
                className="w-full bg-[#0B0B14] border border-gray-800 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] text-center font-mono text-sm tracking-widest text-white px-4 py-3 rounded-2xl placeholder:text-gray-600 outline-none transition-all uppercase"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-800/40 border border-gray-800 hover:bg-gray-800/80 text-xs font-black text-white uppercase tracking-wider py-3.5 rounded-2xl transition-all"
              >
                Retour
              </button>
              <button
                onClick={handleUnlockAdmin}
                className="flex-1 bg-red-600 hover:bg-red-500 text-xs font-black text-white uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-lg shadow-red-900/30"
              >
                Déverrouiller
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 font-mono">
            Habilitation: ALPHA_HQ_2026
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0F0F1A] text-white min-h-[90vh]">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1A1A2E] bg-[#0F0F1A] p-5 px-8 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-xl bg-[#16213E] border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white transition-all cursor-pointer"
            aria-label="Retour au Tableau de Bord"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-red-500 tracking-widest">Poste de Commandement</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <h1 className="text-xl font-headline font-black text-[#FFD700] tracking-wider uppercase font-sans">
              Modération HQ
            </h1>
          </div>
        </div>

        {/* Global queue indicator */}
        <div className="flex items-center gap-2.5 bg-[#16213E]/50 border border-gray-800/80 px-4.5 py-2.5 rounded-2xl font-sans self-start md:self-auto">
          <div className={`w-2.5 h-2.5 rounded-full ${queueCounts.total > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          {queueCounts.total > 0 ? (
            <span className="text-xs font-black text-[#FF2D55] uppercase tracking-wider font-mono">
              ⚠️ {queueCounts.total} Éléments en attente
            </span>
          ) : (
            <span className="text-xs font-black text-[#00D9A5] uppercase tracking-wider font-mono">
              Tout est à jour ✨
            </span>
          )}
        </div>
      </header>

      {/* CORE QUEUE TOGGLE CONTROLLER */}
      <section className="px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* FILE STANDARD BTN */}
          <button
            onClick={() => {
              setActiveView('standard');
              setExpandedRemoveCardId(null);
            }}
            className={`relative flex items-center justify-between p-6 px-7 rounded-[24px] border transition-all text-left group cursor-pointer ${
              activeView === 'standard' 
                ? 'bg-[#1E2E56]/40 border-[#FFD700] shadow-lg shadow-[#FFD700]/5' 
                : 'bg-[#16213E] border-[#1A1A2E] hover:border-gray-700/60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${
                activeView === 'standard' ? 'bg-[#FFD700]/15 text-[#FFD700]' : 'bg-gray-800/50 text-gray-400 group-hover:text-white'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">File de Modération Standard</h3>
                <p className="text-[10px] text-gray-400 font-sans mt-1">
                  Arbitrage des récits et signalements de spam ou abus
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-xl font-mono font-black block ${
                queueCounts.stories + queueCounts.forum + queueCounts.chat > 0 ? 'text-[#FFD700]' : 'text-gray-500'
              }`}>
                {queueCounts.stories + queueCounts.forum + queueCounts.chat}
              </span>
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block mt-0.5">En attente</span>
            </div>
          </button>

          {/* SIGNAUX DE DÉTRESSE BTN */}
          <button
            onClick={() => {
              setActiveView('distress');
              setExpandedFollowUpCardId(null);
            }}
            className={`relative flex items-center justify-between p-6 px-7 rounded-[24px] border transition-all text-left group cursor-pointer ${
              activeView === 'distress' 
                ? 'bg-[#FF2D55]/5 border-[#FF2D55] shadow-lg shadow-[#FF2D55]/5' 
                : 'bg-[#16213E] border-red-950/40 hover:border-red-800/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors relative ${
                activeView === 'distress' ? 'bg-[#FF2D55]/15 text-[#FF2D55]' : 'bg-red-950/20 text-red-400'
              }`}>
                <HeartPulse className="w-6 h-6" />
                {queueCounts.experts > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Signaux de Détresse</h3>
                <p className="text-[10px] text-gray-400 font-sans mt-1">
                  Assistance prioritaire aux guerriers exprimant de la souffrance
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-xl font-mono font-black block ${
                queueCounts.experts > 0 ? 'text-[#FF2D55] animate-pulse' : 'text-gray-500'
              }`}>
                {queueCounts.experts}
              </span>
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block mt-0.5">Non traités</span>
            </div>
          </button>

        </div>
      </section>

      {/* VIEW-SPECIFIC FILTER SECTION AND CARDS */}
      {activeView === 'standard' ? (
        <>
          {/* FILE STANDARD FILTER TABS */}
          <section className="px-8 mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSourceFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide transition-all uppercase cursor-pointer ${
                activeSourceFilter === 'all' 
                  ? 'bg-[#FFD700] text-[#0F0F1A]' 
                  : 'bg-[#16213E] hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Tous ({queueCounts.stories + queueCounts.forum + queueCounts.chat})
            </button>
            <button
              onClick={() => setActiveSourceFilter('stories')}
              className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide transition-all uppercase cursor-pointer ${
                activeSourceFilter === 'stories' 
                  ? 'bg-[#FFD700] text-[#0F0F1A]' 
                  : 'bg-[#16213E] hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              📖 Récits ({queueCounts.stories})
            </button>
            <button
              onClick={() => setActiveSourceFilter('forum')}
              className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide transition-all uppercase cursor-pointer ${
                activeSourceFilter === 'forum' 
                  ? 'bg-[#FFD700] text-[#0F0F1A]' 
                  : 'bg-[#16213E] hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              💬 Forum ({queueCounts.forum})
            </button>
            <button
              onClick={() => setActiveSourceFilter('chat')}
              className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide transition-all uppercase cursor-pointer ${
                activeSourceFilter === 'chat' 
                  ? 'bg-[#FFD700] text-[#0F0F1A]' 
                  : 'bg-[#16213E] hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              👥 Chat Clan ({queueCounts.chat})
            </button>
          </section>

          {/* FILE STANDARD LIST CONTAINER */}
          <section className="px-8 mt-4.5 flex-1">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#FFD700] animate-spin" />
                <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Recherche des archives...</span>
              </div>
            ) : standardQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-[#16213E]/30 rounded-3xl border border-gray-800/80 p-8 text-center">
                <CheckCircle className="w-10 h-10 text-[#00D9A5] mb-3" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Rien à traiter</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                  La communauté se porte bien aujourd'hui. Tout le contenu signalé ou en attente a été révisé.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {standardQueue.map((item) => {
                    const isReported = item.reportCount > 0;
                    const isPending = item.status === 'pending';
                    const isTruncated = item.contentFull.length > 200;
                    const isExpanded = !!expandedPreviews[item.id];
                    const isRemoving = expandedRemoveCardId === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        layoutId={`item-card-${item.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.25 }}
                        className={`bg-[#16213E] border rounded-[22px] p-5.5 flex flex-col justify-between transition-all relative overflow-hidden ${
                          isRemoving 
                            ? 'border-[#FF2D55]' 
                            : isReported 
                              ? 'border-[#FF2D55]/30 shadow-md shadow-[#FF2D55]/2' 
                              : isPending 
                                ? 'border-[#5A5A5A] border-dashed' 
                                : 'border-[#1A1A2E]'
                        }`}
                      >
                        <div>
                          {/* Card Header: badges */}
                          <div className="flex justify-between items-start gap-2">
                            {renderSourceBadge(item.source, item.contentType)}
                            
                            {isPending ? (
                              <span className="bg-gray-800 text-gray-400 border border-gray-700 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                                NOUVEAU
                              </span>
                            ) : (
                              <span className="bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/20 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                                SIGNALÉ ×{item.reportCount}
                              </span>
                            )}
                          </div>

                          {/* Author meta block */}
                          <div className="text-left mt-3">
                            <span className="text-xs font-bold text-white">@{item.authorPseudo}</span>
                            <span className="text-[10px] text-gray-400 font-mono ml-2 uppercase">Niv.{item.authorLevel}</span>
                            <span className="text-[10px] text-[#FFD700] font-mono ml-2 uppercase">🔥 {item.authorStreak} Jours</span>
                          </div>

                          {/* Content section */}
                          <div className="bg-[#0F0F1A] border border-gray-800/40 rounded-xl p-3.5 mt-2.5 text-left text-sm leading-relaxed text-gray-200">
                            <p className="font-sans whitespace-pre-wrap">
                              {isTruncated && !isExpanded 
                                ? `${item.contentFull.slice(0, 200)}...` 
                                : item.contentFull
                              }
                            </p>
                            {isTruncated && (
                              <button
                                onClick={() => setExpandedPreviews(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className="text-xs text-[#FFD700] hover:underline font-bold mt-2 cursor-pointer"
                              >
                                {isExpanded ? "Réduire" : "Voir tout l'article"}
                              </button>
                            )}
                          </div>

                          {/* Aggregated reasons if reported */}
                          {isReported && item.reportReasons.length > 0 && (
                            <div className="text-left mt-3 flex items-start gap-1.5 bg-[#FF2D55]/5 border border-[#FF2D55]/10 rounded-lg p-2 text-[10px] text-[#FF2D55] font-mono">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold uppercase block mb-0.5">Motifs de signalement:</span>
                                {item.reportReasons.map((r, idx) => (
                                  <span key={idx} className="block">
                                    • {r.reason} ({r.count})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timestamp info */}
                          <div className="text-left mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Déclaré le {new Date(item.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>

                        {/* Footer inline fields and confirmation */}
                        <div className="mt-4.5 pt-4 border-t border-gray-800/80">
                          {isRemoving ? (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-left space-y-2.5"
                            >
                              <span className="text-[10px] font-bold text-[#FF2D55] uppercase tracking-wider font-mono block">
                                🚫 Spécifier le motif du bannissement/retrait :
                              </span>
                              <textarea
                                value={removeReasonInput}
                                onChange={(e) => setRemoveReasonInput(e.target.value)}
                                placeholder="Saisissez la raison (ex: Spam, vulgarité, publicité intempestive...)"
                                className="w-full bg-[#0B0B14] border border-gray-800 focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55] text-xs p-3 rounded-xl text-white outline-none placeholder:text-gray-600 resize-none h-18 font-sans"
                              />
                              <div className="flex gap-2.5">
                                <button
                                  onClick={() => {
                                    setExpandedRemoveCardId(null);
                                    setRemoveReasonInput('');
                                  }}
                                  className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 font-mono font-bold text-xs uppercase text-gray-300 cursor-pointer"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={() => handleRemoveSubmit(item.id)}
                                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-mono font-bold text-xs uppercase text-white cursor-pointer"
                                >
                                  Confirmer le Retrait
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {/* APPROVE BUTTON */}
                              <button
                                onClick={() => handleApprove(item)}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-[#00D9A5] hover:bg-[#00D9A5]/90 text-[#0F0F1A] font-bold text-xs uppercase py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>Approuver</span>
                              </button>

                              {/* FEATURE BUTTON (only pending Stories) */}
                              {isPending && item.source === 'stories' && (
                                <button
                                  onClick={() => handleFeature(item)}
                                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 border border-[#FFD700] hover:bg-[#FFD700]/10 text-[#FFD700] font-bold text-xs uppercase py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5 shrink-0 fill-[#FFD700]/20" />
                                  <span>Vedette</span>
                                </button>
                              )}

                              {/* REMOVE BUTTON */}
                              <button
                                onClick={() => {
                                  setExpandedRemoveCardId(item.id);
                                  setRemoveReasonInput('');
                                }}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 border border-[#FF2D55] hover:bg-[#FF2D55]/10 text-[#FF2D55] font-bold text-xs uppercase py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Retirer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* SIGNAUX DE DÉTRESSE VIEW */}
          {/* CONTEXT BANNER */}
          <section className="px-8 mt-5">
            <div className="bg-[#FF2D55]/5 border border-[#FF2D55]/20 rounded-2xl p-4 flex items-start gap-3 text-left">
              <Info className="w-5 h-5 text-[#FF2D55] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  ⚠️ PROTOCOLE DE VEILLE COMMUNAUTAIRE
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed mt-1">
                  Ces messages ont été automatiquement identifiés comme pouvant indiquer une détresse réelle. Ils restent visibles normalement pour la communauté — ceci n'est PAS une file de modération de contenu. L'objectif ici est de confirmer qu'un humain a vu chaque signal et, si besoin, d'agir en dehors de l'app.
                </p>
              </div>
            </div>
          </section>

          {/* DISTRESS QUEUE LIST */}
          <section className="px-8 mt-4 flex-1">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#FF2D55] animate-spin" />
                <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Analyse d'urgence...</span>
              </div>
            ) : distressQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-[#16213E]/30 rounded-3xl border border-gray-800/80 p-8 text-center">
                <Heart className="w-10 h-10 text-gray-600 mb-3" />
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Paix absolue</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                  Aucun signal de détresse en attente de suivi en ce moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                <AnimatePresence mode="popLayout">
                  {distressQueue.map((item) => {
                    const isFollowedUp = !!item.followedUpAt;
                    const isExpended = expandedFollowUpCardId === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        layoutId={`distress-card-${item.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`bg-[#16213E] border rounded-[22px] p-5.5 flex flex-col justify-between transition-all relative ${
                          isFollowedUp 
                            ? 'border-emerald-500/30' 
                            : 'border-[#FF2D55]/25 shadow-md shadow-[#FF2D55]/3'
                        }`}
                      >
                        <div>
                          {/* Header badge */}
                          <div className="flex justify-between items-start">
                            {renderSourceBadge(item.source, item.contentType)}
                            
                            {isFollowedUp ? (
                              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                                SUIVI EFFECTUÉ
                              </span>
                            ) : (
                              <span className="bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/25 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono animate-pulse">
                                EN ATTENTE DE VEILLE
                              </span>
                            )}
                          </div>

                          {/* Author profile metrics (Super critical on distress) */}
                          <div className="text-left mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-sm font-bold text-white">@{item.authorPseudo}</span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase">Niv.{item.authorLevel}</span>
                            
                            {/* Streak has human importance */}
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase tracking-wider bg-gradient-to-r from-orange-500 to-red-500 text-white">
                              🔥 STREAK: {item.authorStreak} JOURS
                            </span>
                          </div>

                          {/* Distress contents: full detail, never truncated */}
                          <div className="bg-[#0F0F1A] border border-gray-800/60 rounded-xl p-4 mt-3 text-left text-sm leading-relaxed text-gray-100">
                            <p className="font-sans whitespace-pre-wrap font-medium">
                              {item.contentFull}
                            </p>
                          </div>

                          {/* Exact date/time info */}
                          <div className="text-left mt-3.5 flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span>Signal d'alerte émis le: <strong className="text-white">{new Date(item.createdAt).toLocaleString('fr-FR')}</strong></span>
                          </div>

                          {/* Follow up status strip */}
                          {isFollowedUp && (
                            <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-left space-y-1">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                Suivi validé par {item.followedUpBy} le {new Date(item.followedUpAt!).toLocaleString('fr-FR')}
                              </span>
                              {item.followUpNote && (
                                <p className="text-xs text-gray-300 font-sans pl-5.5 italic border-l border-gray-800/80 mt-1">
                                  " {item.followUpNote} "
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Follow up footer actions */}
                        {!isFollowedUp && (
                          <div className="mt-4.5 pt-4 border-t border-gray-800/80">
                            {isExpended ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-left space-y-2.5"
                              >
                                <span className="text-[10px] font-bold text-[#FF2D55] uppercase tracking-wider font-mono block">
                                  📝 Ajouter une note de suivi interne (Confidentielle) :
                                </span>
                                <textarea
                                  value={followUpNoteInput}
                                  onChange={(e) => setFollowUpNoteInput(e.target.value)}
                                  placeholder="Entrez une note sur les actions de secours menées (ex: contact direct établi sur Discord, e-mail de secours envoyé, ou simplement surveillé)."
                                  className="w-full bg-[#0B0B14] border border-gray-800 focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55] text-xs p-3 rounded-xl text-white outline-none placeholder:text-gray-600 resize-none h-18 font-sans"
                                />
                                <div className="flex gap-2.5">
                                  <button
                                    onClick={() => {
                                      setExpandedFollowUpCardId(null);
                                      setFollowUpNoteInput('');
                                    }}
                                    className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 font-mono font-bold text-xs uppercase text-gray-300 cursor-pointer"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => handleFollowUpSubmit(item.id)}
                                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-mono font-bold text-xs uppercase text-white cursor-pointer"
                                  >
                                    Confirmer le Suivi Humain
                                  </button>
                                </div>
                              </motion.div>
                            ) : (
                              <button
                                onClick={() => {
                                  setExpandedFollowUpCardId(item.id);
                                  setFollowUpNoteInput('');
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-[#FF2D55] hover:bg-red-600 text-white font-bold text-xs uppercase py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/20"
                              >
                                <HeartPulse className="w-4 h-4 shrink-0" />
                                <span>✓ Marquer comme suivi d'urgence</span>
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        </>
      )}

      {/* RECENT ACTIONS JOURNAL LOG */}
      <section className="px-8 mt-8 mb-12">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest font-mono">
            JOURNAL D'ACTIONS RÉCENTES (AUDIT DE CONFIANCE)
          </h4>
        </div>

        <div className="bg-[#16213E] border border-gray-800/80 rounded-[20px] p-3 shadow-md">
          <div className="divide-y divide-gray-800/50">
            {recentActions.length === 0 ? (
              <div className="p-4 text-xs text-gray-500 font-mono text-center">
                Aucune action enregistrée dans ce cycle de veille.
              </div>
            ) : (
              recentActions.map((act) => {
                let actionIcon = <Clock className="w-3.5 h-3.5 text-gray-500" />;
                if (act.type === 'approve') {
                  actionIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
                } else if (act.type === 'remove') {
                  actionIcon = <XCircle className="w-3.5 h-3.5 text-red-500" />;
                } else if (act.type === 'follow_up') {
                  actionIcon = <Heart className="w-3.5 h-3.5 text-[#FF2D55] fill-[#FF2D55]/10" />;
                } else if (act.type === 'feature') {
                  actionIcon = <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]/15" />;
                }

                return (
                  <div key={act.id} className="flex justify-between items-center p-3 px-4 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">{actionIcon}</div>
                      <span className="text-gray-300 font-sans font-medium truncate text-left">
                        {act.text}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono shrink-0 ml-3">
                      {act.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
