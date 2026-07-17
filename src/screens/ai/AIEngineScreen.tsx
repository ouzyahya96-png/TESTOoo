import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  Bell,
  Lock,
  AlertCircle,
  Check,
  Send,
  Activity,
  Code,
  Copy,
  Smartphone,
  Shield,
  HelpCircle,
  Sliders,
  RefreshCw,
  BarChart2,
  MessageSquare,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface AIEngineScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

interface DataPoint {
  name: string;
  source: string;
  weight: string;
}

interface PriorityRec {
  id: string;
  title: string;
  reason: string;
  actionLabel: string;
  activated: boolean;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  metric: string;
  status: 'optimal' | 'warning' | 'alert' | 'success';
}

interface WeeklyReport {
  summary: string;
  streakDays: number;
  avgMood: number;
  avgSleepQuality: number;
  sessionsCompleted: number;
  sessionsTotal: number;
  activeUrgesResisted: number;
}

interface ModelTransparency {
  dataPoints: DataPoint[];
  note: string;
  version: string;
}

interface AIEngineData {
  userId: string;
  globalScore: number;
  scoreTrend: string;
  priorityRecommendation: PriorityRec;
  insights: Insight[];
  weeklyReport: WeeklyReport;
  modelTransparency: ModelTransparency;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: { text: string }[];
  timestamp: Date;
}

export const AIEngineScreen: React.FC<AIEngineScreenProps> = ({ addToast, onBack }) => {
  // UI and Inspector view states
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // AI Engine API data state
  const [data, setData] = useState<AIEngineData | null>(null);
  const [isActivating, setIsActivating] = useState<boolean>(false);

  // Chat interface state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      parts: [{ text: "Bonjour soldat. Je suis ton Moteur d'Analyse Alpha. Mes réseaux de neurones ont compilé tes données de Kegel, de sommeil, de stress et d'exposition au froid pour maximiser ton potentiel physique et mental. Quelle facette de ta synergie de vie souhaites-tu corréler aujourd'hui ?" }],
      timestamp: new Date()
    }
  ]);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Fetch AI report data
  const fetchReport = async (quiet: boolean = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const response = await fetch('/api/ai-engine/ALPHA_SOLDIER_1');
      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        addToast('error', "Échec de la connexion au moteur d'analyse IA");
      }
    } catch (error) {
      console.error(error);
      addToast('error', "Une erreur est survenue lors de l'accès au Moteur IA");
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Activate recommendation action
  const handleActivateRecommendation = async (recId: string) => {
    setIsActivating(true);
    try {
      const response = await fetch('/api/ai-engine/ALPHA_SOLDIER_1/recommendation/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recId }),
      });
      if (response.ok) {
        addToast('success', "🎯 Recommandation d'optimisation activée ! Rappel synchronisé.");
        fetchReport(true); // Quiet update to reflect changes
      } else {
        addToast('error', "Échec de l'activation");
      }
    } catch (error) {
      console.error(error);
      addToast('error', "Erreur d'activation");
    } finally {
      setIsActivating(false);
    }
  };

  // Chat conversation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsgText = chatMessage;
    setChatMessage('');
    
    // Add User Message immediately
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      parts: [{ text: userMsgText }],
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      // Build history payload mapped to Express backend
      const historyPayload = chatHistory.map(h => ({
        role: h.role,
        parts: h.parts
      }));

      const response = await fetch('/api/ai-engine/ALPHA_SOLDIER_1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText, history: historyPayload })
      });

      if (response.ok) {
        const json = await response.json();
        const botMsg: ChatMessage = {
          id: Math.random().toString(),
          role: 'assistant',
          parts: [{ text: json.reply }],
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, botMsg]);
      } else {
        addToast('error', "Le Moteur IA n'a pas pu répondre.");
      }
    } catch (error) {
      console.error(error);
      addToast('error', "Échec d'envoi");
    } finally {
      setIsSending(false);
    }
  };

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  // Default values fallback while loading
  const report = data || {
    globalScore: 84,
    scoreTrend: "+6%",
    priorityRecommendation: {
      id: "rec_sleep_1",
      title: "Dors avant 23:00 ce soir",
      reason: "Tes 3 dernières alertes de surcharge de stress (urgences) coïncident statistiquement avec des nuits de moins de 6h15.",
      actionLabel: "Activer le rappel Sommeil",
      activated: false
    },
    insights: [],
    weeklyReport: {
      summary: "Semaine d'excellence globale, soldée par un streak Kegel de 12 jours consécutifs et une régularité de sommeil en hausse.",
      streakDays: 12,
      avgMood: 7.8,
      avgSleepQuality: 85,
      sessionsCompleted: 11,
      sessionsTotal: 12,
      activeUrgesResisted: 9
    },
    modelTransparency: {
      dataPoints: [],
      note: "Le calcul de synergie s'effectue localement via un réseau de neurones de régression bayésienne.",
      version: "AlphaEngine v2.4"
    }
  };

  return (
    <div id="ai-engine-screen-container" className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-4 px-1">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1C1C35] pb-6">
        <div>
          <span className="text-[10px] font-headline font-extrabold tracking-widest text-[#00D9A5] bg-[#00D9A5]/10 px-2.5 py-1 rounded-full uppercase">
            Moteur IA Clinique — Spécification 7.1
          </span>
          <h2 className="text-xl font-headline font-black text-white mt-2">
            Moteur d'Analyse IA & Synergie de Vie
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Corrélations biophysiques avancées, modèles d'entraînement bayésiens, suggestions d'optimisation prédictives et coach interactif souverain.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
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

      {/* CODE SOURCE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">AIEngineScreen.tsx (TypeScript Expo Native)</h4>
              <p className="text-[10px] text-gray-500">
                Structure de code native optimisée pour iOS & Android, exploitant la synchronisation locale de données et haptiques.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={handleCopyCode}
              className="flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copié !" : "Copier le code"}
            </AlphaButton>
          </div>
          <pre className="font-mono text-[11px] text-gray-300 overflow-x-auto max-h-[400px] p-4 bg-[#0A0A14] rounded-2xl custom-scrollbar leading-relaxed">
            <code>{expoNativeCode}</code>
          </pre>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-10 h-10 text-[#E94560] animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Calcul des réseaux neuronaux d'analyse locale...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: SYNERGY METRICS, INSIGHTS & REPORT (SPAN 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* LARGE HERO BLOCK: GLOBAL SYNERGY SCORE */}
            <AlphaCard variant="elevated" className="p-6 relative overflow-hidden border-2 border-[#1C1C38] flex flex-col md:flex-row items-center gap-6">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#00D9A5]/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* CIRCULAR PROGRESS RING */}
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-[#16213E]"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-[#00D9A5]"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 - (376.8 * report.globalScore) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-headline font-black text-white">{report.globalScore}%</span>
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">Synergie de Vie</span>
                </div>
              </div>

              {/* DETAILS AND TREND */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-[#00D9A5]">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">{report.scoreTrend} cette semaine</span>
                </div>
                <h3 className="text-lg font-headline font-black text-white mt-1">Indicateur d'Optimisation Souveraine</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Ton système nerveux autonome, ton amplitude musculaire Kegel et ta discipline de sommeil sont en synergie optimale. Tu es sur la voie de l'Alpha d'Élite.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <div className="bg-[#16213E] border border-[#1C1C3C] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-mono text-gray-300">
                    <Activity className="w-3.5 h-3.5 text-[#00D9A5]" />
                    Kegel : Excellent
                  </div>
                  <div className="bg-[#16213E] border border-[#1C1C3C] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-mono text-gray-300">
                    <Zap className="w-3.5 h-3.5 text-[#FFD700]" />
                    Énergie : Maximale
                  </div>
                </div>
              </div>
            </AlphaCard>

            {/* PRIORITY RECOMMENDATION BLOCK */}
            <AlphaCard variant="gold" className="p-6 relative overflow-hidden border-2 border-[#FFD700]/30 bg-gradient-to-br from-[#1B1B10] to-[#0A0A04]">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FFD700]/5 rounded-full blur-2xl" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] flex-shrink-0 mt-0.5 border border-[#FFD700]/20">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-[#FFD700]">Recommandation Prioritaire IA</span>
                  <h4 className="text-md font-headline font-black text-white mt-0.5">{report.priorityRecommendation.title}</h4>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{report.priorityRecommendation.reason}</p>
                  
                  <div className="mt-4">
                    {report.priorityRecommendation.activated ? (
                      <div className="inline-flex items-center gap-1.5 text-[#00D9A5] bg-[#00D9A5]/10 border border-[#00D9A5]/30 px-3.5 py-1.5 rounded-xl text-xs font-headline font-extrabold uppercase">
                        <Check className="w-3.5 h-3.5" />
                        Rappel Activé !
                      </div>
                    ) : (
                      <AlphaButton 
                        variant="gold" 
                        size="sm" 
                        onClick={() => handleActivateRecommendation(report.priorityRecommendation.id)}
                        disabled={isActivating}
                      >
                        {isActivating ? "Activation..." : report.priorityRecommendation.actionLabel}
                      </AlphaButton>
                    )}
                  </div>
                </div>
              </div>
            </AlphaCard>

            {/* ANALYTICAL INSIGHTS GRID */}
            <div>
              <h4 className="text-xs font-headline font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                Corrélations de Vie Détectées
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.insights.map((insight: Insight) => (
                  <AlphaCard 
                    key={insight.id} 
                    variant="elevated" 
                    className="p-4 border border-[#1C1C35] hover:border-[#1F2D53] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-[#1C1C35]/50 pb-2">
                        <h5 className="font-headline font-black text-white text-xs uppercase leading-snug">{insight.title}</h5>
                        <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          insight.status === 'optimal' ? 'bg-[#00D9A5]/10 text-[#00D9A5]' :
                          insight.status === 'warning' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                          insight.status === 'alert' ? 'bg-[#FF2D55]/10 text-[#FF2D55]' :
                          'bg-[#4A90D9]/10 text-[#4A90D9]'
                        }`}>
                          {insight.metric}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2.5 leading-relaxed">{insight.description}</p>
                    </div>
                    
                    <div className="mt-3 pt-2.5 border-t border-[#1C1C35]/50 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-gray-500 uppercase">Origine : Calcul local</span>
                      <span className={`w-2 h-2 rounded-full ${
                        insight.status === 'optimal' ? 'bg-[#00D9A5]' :
                        insight.status === 'warning' ? 'bg-[#FF9500]' :
                        insight.status === 'alert' ? 'bg-[#FF2D55]' :
                        'bg-[#4A90D9]'
                      }`} />
                    </div>
                  </AlphaCard>
                ))}
              </div>
            </div>

            {/* WEEKLY REPORT SUMMARY PANEL */}
            <AlphaCard variant="elevated" className="p-6 border border-[#1C1C35] bg-[#0E0E1A]">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-[#8E8E93] uppercase">Bilan de Synergie Hebdomadaire</span>
                  <h4 className="text-sm font-headline font-black text-white mt-0.5">Rapport d'Auto-Discipline Clinique</h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{report.weeklyReport.summary}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[#1C1C35]/50">
                    <div className="text-center sm:text-left">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Séances Kegel</span>
                      <span className="text-md font-headline font-black text-white mt-0.5">
                        {report.weeklyReport.sessionsCompleted} / {report.weeklyReport.sessionsTotal}
                      </span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Streak Actuel</span>
                      <span className="text-md font-headline font-black text-[#FFD700] mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                        <Flame className="w-4 h-4 fill-current text-orange-500" />
                        {report.weeklyReport.streakDays} Jours
                      </span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Sommeil Moyen</span>
                      <span className="text-md font-headline font-black text-white mt-0.5">
                        {report.weeklyReport.avgSleepQuality}%
                      </span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Urgences Évitées</span>
                      <span className="text-md font-headline font-black text-[#00D9A5] mt-0.5">
                        🛡️ {report.weeklyReport.activeUrgesResisted}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AlphaCard>

            {/* MODEL TRANSPARENCY BLOCK */}
            <AlphaCard variant="elevated" className="p-6 border border-[#1C1C35] relative bg-gradient-to-b from-[#0F0F1D] to-[#0A0A14]">
              <div className="flex items-center justify-between border-b border-[#1C1C35]/50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5.5 h-5.5 text-blue-400" />
                  <div>
                    <h5 className="font-headline font-black text-white text-xs uppercase">Transparence Mathématique</h5>
                    <p className="text-[9px] font-mono text-gray-500">{report.modelTransparency.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3" />
                  Local & Privé
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Le score de synergie est issu d'une analyse pondérée évaluant tes efforts de vie. Voici comment notre algorithme Bayesien pondère tes données locales pour calibrer tes recommandations :
              </p>

              <div className="flex flex-col gap-2.5">
                {report.modelTransparency.dataPoints.map((dp: DataPoint, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-[#111124] border border-[#16213E] p-2.5 rounded-xl text-xs">
                    <div className="flex flex-col">
                      <span className="font-headline font-bold text-white text-[11px]">{dp.name}</span>
                      <span className="text-[9px] font-mono text-gray-500">Source : {dp.source}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-400 h-full" 
                          style={{ width: dp.weight }} 
                        />
                      </div>
                      <span className="font-mono font-bold text-blue-400 w-8 text-right">{dp.weight}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#1C1C35]/50 text-center text-[10px] text-gray-500 leading-relaxed font-serif italic">
                &ldquo;{report.modelTransparency.note}&rdquo;
              </div>
            </AlphaCard>

          </div>

          {/* RIGHT: INTERACTIVE CHAT PANEL - EMULATED SMARTPHONE FRAME (SPAN 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* PHONE INNER SHELL */}
            <div className="w-full bg-[#0F0F1A] border-4 border-[#1C1C38] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col h-[650px]">
              
              {/* PHONE CAMERA NOTCH */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#000000] rounded-b-2xl z-20 flex justify-center items-center">
                <div className="w-2 h-2 rounded-full bg-[#111] mr-4" />
                <div className="w-12 h-1 bg-[#222] rounded-full" />
              </div>

              {/* CHAT HEADER */}
              <div className="bg-[#16213E] border-b border-[#1C1C3A] pt-8 pb-4 px-6 flex items-center justify-between flex-shrink-0 relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E94560] to-[#FFD700] flex items-center justify-center text-white relative shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D9A5] border-2 border-[#16213E] rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-headline font-black text-white text-xs uppercase leading-none">MOTEUR ALPHA IA</h4>
                    <span className="text-[9px] font-mono text-[#00D9A5] tracking-wide uppercase font-black block mt-1.5">Algorithme Actif</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Sliders className="w-4 h-4 hover:text-white cursor-pointer transition-colors" onClick={() => addToast('info', "Option de calibrage neuronale")} />
                </div>
              </div>

              {/* CHAT MESSAGES BODY */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-[#090910]">
                {chatHistory.map((msg: ChatMessage) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#E94560] text-white rounded-tr-none font-medium'
                        : 'bg-[#16213E] text-gray-100 border border-[#1C1C35] rounded-tl-none font-medium'
                    }`}>
                      {msg.parts[0].text}
                    </div>
                    <span className="text-[8px] font-mono text-gray-600 mt-1 uppercase">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {isSending && (
                  <div className="self-start flex items-center gap-1.5 bg-[#16213E] border border-[#1C1C35] p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              {/* CHAT INPUT PANEL */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#0F0F1A] border-t border-[#1C1C38] flex items-center gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Pose une question sur tes analyses..."
                  className="flex-1 bg-[#111124] border border-[#1C1C3A] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E94560] transition-colors"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !chatMessage.trim()}
                  className="w-10 h-10 rounded-2xl bg-[#E94560] hover:bg-[#ff5a77] disabled:bg-[#16213E] disabled:text-gray-600 flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

            {/* INTEGRITY STATEMENTS CARD */}
            <AlphaCard variant="elevated" className="p-4 border border-[#1C1C35] flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-headline font-black text-white text-[11px] uppercase tracking-wider">Serment de Souveraineté</h5>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  Tes données de santé pelvienne et d'énergie ne feront jamais l'objet de profilage publicitaire ou de revente. ALPHA MAN garantit une transparence technologique clinique absolue.
                </p>
              </div>
            </AlphaCard>

          </div>

        </div>
      )}

    </div>
  );
};

// ========================== EXPO NATIVE CODE REFERENCE ==========================
const expoNativeCode = `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Base theme variables conforming with Alpha Man Design System
const THEME = {
  bg: '#0F0F1A',
  card: '#16213E',
  border: '#1C1C3A',
  primary: '#E94560',
  success: '#00D9A5',
  gold: '#FFD700',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  alert: '#FF2D55',
  warning: '#FF9500'
};

export default function AIEngineScreen() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    {
      id: '1',
      role: 'assistant',
      text: "Bonjour soldat. Je suis ton Moteur d'Analyse Alpha. Mes réseaux de neurones ont compilé tes données de Kegel, de sommeil, de stress et d'exposition au froid pour maximiser ton potentiel physique et mental."
    }
  ]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAIReport();
  }, []);

  const fetchAIReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://ais-dev-cvyu3qpduu7scuggzh6wu5-927581743590.europe-west2.run.app/api/ai-engine/ALPHA_SOLDIER_1');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.log("Failed to load report", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateRec = async (id) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    try {
      await fetch('https://ais-dev-cvyu3qpduu7scuggzh6wu5-927581743590.europe-west2.run.app/api/ai-engine/ALPHA_SOLDIER_1/recommendation/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchAIReport();
    } catch (e) {
      console.log("Activation failed", e);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const userText = message;
    setMessage('');
    
    const userMsg = { id: Math.random().toString(), role: 'user', text: userText };
    setChat(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await fetch('https://ais-dev-cvyu3qpduu7scuggzh6wu5-927581743590.europe-west2.run.app/api/ai-engine/ALPHA_SOLDIER_1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: chat.map(c => ({ role: c.role, parts: [{ text: c.text }] })) })
      });
      const data = await res.json();
      const botMsg = { id: Math.random().toString(), role: 'assistant', text: data.reply };
      setChat(prev => [...prev, botMsg]);
    } catch (e) {
      console.log("Chat error", e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Synchronisation du réseau de neurone Alpha...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* GLOBAL OPTIMIZATION SCORE RING */}
      <View style={styles.cardHero}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreVal}>{report?.globalScore || 84}%</Text>
          <Text style={styles.scoreSub}>Synergie globale</Text>
        </View>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Score d'Optimisation</Text>
          <Text style={styles.heroTrend}>📈 {report?.scoreTrend || '+6%'} cette semaine</Text>
          <Text style={styles.heroDesc}>
            Ton repos, ton tonus pelvien et ton stress mental agissent en harmonie souveraine.
          </Text>
        </View>
      </View>

      {/* PRIORITY RECOMMENDATION */}
      {report?.priorityRecommendation && (
        <View style={styles.cardGold}>
          <Ionicons name="notifications-outline" size={24} color={THEME.gold} style={styles.goldIcon} />
          <View style={styles.goldContent}>
            <Text style={styles.goldLabel}>Recommandation Prioritaire IA</Text>
            <Text style={styles.goldTitle}>{report.priorityRecommendation.title}</Text>
            <Text style={styles.goldReason}>{report.priorityRecommendation.reason}</Text>
            
            <TouchableOpacity 
              style={[styles.goldBtn, report.priorityRecommendation.activated && styles.goldBtnActivated]}
              onPress={() => handleActivateRec(report.priorityRecommendation.id)}
            >
              <Text style={styles.goldBtnText}>
                {report.priorityRecommendation.activated ? "Rappel Activé ✓" : report.priorityRecommendation.actionLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CORRELATIONS LIST */}
      <Text style={styles.sectionHeader}>Corrélations de Vie Détectées</Text>
      {report?.insights?.map((item) => (
        <View key={item.id} style={styles.cardNormal}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>{item.title}</Text>
            <Text style={styles.insightMetric}>{item.metric}</Text>
          </View>
          <Text style={styles.insightDesc}>{item.description}</Text>
        </View>
      ))}

      {/* MODEL TRANSPARENCY FACTORS */}
      <Text style={styles.sectionHeader}>Transparence & Poids Neuro-Algorithmiques</Text>
      <View style={styles.cardNormal}>
        <Text style={styles.transparencyDesc}>
          Les poids attribués aux facteurs de vie dans ton réseau de neurones local :
        </Text>
        {report?.modelTransparency?.dataPoints?.map((dp, index) => (
          <View key={index} style={styles.factorRow}>
            <View>
              <Text style={styles.factorName}>{dp.name}</Text>
              <Text style={styles.factorSource}>{dp.source}</Text>
            </View>
            <Text style={styles.factorWeight}>{dp.weight}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg
  },
  scrollContent: {
    padding: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.bg,
    padding: 24
  },
  loadingText: {
    marginTop: 12,
    color: THEME.textSecondary,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  cardHero: {
    backgroundColor: THEME.card,
    borderColor: THEME.border,
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: THEME.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  scoreVal: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: '900'
  },
  scoreSub: {
    color: THEME.textSecondary,
    fontSize: 7,
    textTransform: 'uppercase'
  },
  heroTextContainer: {
    flex: 1
  },
  heroTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '800'
  },
  heroTrend: {
    color: THEME.success,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2
  },
  heroDesc: {
    color: THEME.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6
  },
  cardGold: {
    backgroundColor: '#1C190D',
    borderColor: THEME.gold + '50',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20
  },
  goldIcon: {
    marginRight: 12
  },
  goldContent: {
    flex: 1
  },
  goldLabel: {
    color: THEME.gold,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  goldTitle: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2
  },
  goldReason: {
    color: '#D1CBB3',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6
  },
  goldBtn: {
    backgroundColor: THEME.gold,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 14
  },
  goldBtnActivated: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.success
  },
  goldBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold'
  },
  sectionHeader: {
    color: THEME.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 10
  },
  cardNormal: {
    backgroundColor: THEME.card,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 8
  },
  insightTitle: {
    color: THEME.text,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  insightMetric: {
    color: THEME.success,
    fontSize: 10,
    fontWeight: 'bold'
  },
  insightDesc: {
    color: THEME.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8
  },
  transparencyDesc: {
    color: THEME.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border
  },
  factorName: {
    color: THEME.text,
    fontSize: 11,
    fontWeight: 'bold'
  },
  factorSource: {
    color: THEME.textSecondary,
    fontSize: 8,
    marginTop: 2
  },
  factorWeight: {
    color: THEME.success,
    fontSize: 11,
    fontWeight: 'bold'
  }
});
`;
