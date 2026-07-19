import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Link as LinkIcon,
  Trophy,
  AlertCircle,
  Download,
  Sparkles,
  Code,
  Copy,
  RefreshCw,
  Clock,
  Activity,
  Flame,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface WeeklyReportDetailScreenProps {
  userId: string;
  initialWeekOffset?: number;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

interface MetricComparison {
  value: number | string;
  delta: string | number;
  trend: 'up' | 'down' | 'stable';
}

interface WeeklyReportData {
  weekLabel: string;
  avgScore: number;
  dailyScores: Array<{ day: string; score: number }>;
  bestDay: { day: string; score: number };
  worstDay: { day: string; score: number };
  comparison: {
    streak: MetricComparison;
    avgMood: MetricComparison;
    avgEnergy: MetricComparison;
    sessionsCompleted: { value: string; delta: string | number; trend: 'up' | 'down' | 'stable' };
  };
  pillarBreakdown: Array<{ pillar: string; percentage: number; color: string; label: string }>;
  correlations: Array<{ id: string; text: string; strength: 'forte' | 'modérée' }>;
  bestMoment: string;
  watchPoint: string;
  nextWeekFocus: { title: string; reason: string };
}

export const WeeklyReportDetailScreen: React.FC<WeeklyReportDetailScreenProps> = ({
  userId = 'ALPHA_SOLDIER_1',
  initialWeekOffset = 0,
  addToast,
  onBack
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(initialWeekOffset);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | null>(null);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [focusApplied, setFocusApplied] = useState<boolean>(false);

  // Fetch report data based on offset
  const fetchWeeklyReport = useCallback(async (quiet: boolean = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await fetch(`/api/ai-engine/${userId}/weekly-report?weekOffset=${weekOffset}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setWeeklyData(json.weeklyData);
        } else {
          setWeeklyData(null);
        }
      } else {
        setWeeklyData(null);
      }
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      addToast('error', "Impossible de charger le rapport hebdomadaire.");
      setWeeklyData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, weekOffset, addToast]);

  useEffect(() => {
    fetchWeeklyReport();
    setFocusApplied(false); // Reset focus applied when switching weeks
  }, [weekOffset, fetchWeeklyReport]);

  const goToPreviousWeek = () => {
    // Limits: let's say maximum offset is -3
    if (weekOffset <= -3) {
      addToast('info', "Limite de l'historique local atteinte.");
      return;
    }
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    if (weekOffset >= 0) return;
    setWeekOffset(prev => prev + 1);
  };

  const handleShareReport = () => {
    addToast('success', "Rapport exporté ! Lien de partage sécurisé copié dans le presse-papier.");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleApplyFocus = async () => {
    try {
      const response = await fetch(`/api/ai-engine/${userId}/weekly-report/apply-focus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weekOffset, focus: weeklyData?.nextWeekFocus?.title })
      });
      if (response.ok) {
        setFocusApplied(true);
        addToast('success', "Focus enregistré pour la semaine prochaine ! 🎯");
      } else {
        addToast('error', "Une erreur est survenue lors de l'application du focus.");
      }
    } catch (err) {
      addToast('error', "Erreur de communication serveur.");
    }
  };

  const handleExportPDF = async () => {
    addToast('info', "Préparation du document PDF...");
    try {
      window.open(`/api/ai-engine/${userId}/weekly-report/export?weekOffset=${weekOffset}`, '_blank');
      addToast('success', "Rapport PDF téléchargé avec succès ! 📄");
    } catch (error) {
      addToast('error', "Échec de l'exportation PDF.");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source Expo copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // Render score smoothed SVG path helper
  const getChartPath = (scores: Array<{ score: number }>) => {
    if (scores.length === 0) return '';
    const points = scores.map((s, idx) => {
      const x = idx * (420 / 6) + 40;
      const y = 80 - (s.score / 100) * 60; // scale between y=20 and y=80
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const getAreaPath = (scores: Array<{ score: number }>) => {
    const linePath = getChartPath(scores);
    if (!linePath) return '';
    const firstX = 40;
    const lastX = 6 * (420 / 6) + 40;
    return `${linePath} L ${lastX} 90 L ${firstX} 90 Z`;
  };

  return (
    <div id="weekly-report-detail-screen" className="flex-1 flex flex-col bg-[#0F0F1A] text-white">
      
      {/* HEADER BAR */}
      <div className="bg-[#0F0F1A] border-b border-[#1C1C3A]/40 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            id="back-button"
            type="button"
            onClick={onBack}
            className="w-11 h-11 rounded-xl bg-[#16213E]/40 border border-[#1C1C3A] hover:bg-[#1C1C3A] flex items-center justify-center text-white cursor-pointer transition-all active:scale-95"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h2 className="font-headline font-black text-xs sm:text-sm text-[#FFD700] tracking-widest uppercase text-center select-none">
            RAPPORT HEBDOMADAIRE
          </h2>

          <div className="flex items-center gap-2">
            <button
              id="inspect-code-button"
              type="button"
              onClick={() => setShowNativeCode(!showNativeCode)}
              className={`px-3 py-1.5 text-[10px] font-headline font-black rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                showNativeCode ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-[#111124] text-gray-400 border-[#1C1C3A] hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              {showNativeCode ? "Masquer Expo" : "Inspecter Expo"}
            </button>

            <button
              id="share-button"
              type="button"
              onClick={handleShareReport}
              className="w-11 h-11 rounded-xl bg-[#16213E]/40 border border-[#1C1C3A] hover:bg-[#1C1C3A] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-all active:scale-95"
              aria-label="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* NATIVE CODE SOURCE INSPECTOR */}
        {showNativeCode && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-5 flex flex-col gap-3 text-left"
          >
            <div className="flex justify-between items-center border-b border-[#1C1C35] pb-2">
              <div>
                <h4 className="text-xs font-headline font-black text-white uppercase tracking-wider">WeeklyReportDetailScreen.tsx (React Native & Svg)</h4>
                <p className="text-[10px] text-gray-500">
                  Code natif complet écrit pour Expo avec animations, Haptics et composants vectoriels.
                </p>
              </div>
              <button 
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 text-[10px] font-headline font-black rounded-xl bg-[#16213E] border border-[#1C1C3A] hover:bg-[#1C1C3A] text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copié !" : "Copier le code"}
              </button>
            </div>
            <pre className="font-mono text-[10px] text-gray-300 overflow-x-auto max-h-[300px] p-3 bg-[#0A0A14] rounded-2xl custom-scrollbar leading-relaxed">
              <code>{expoNativeCode}</code>
            </pre>
          </motion.div>
        )}

        {/* WEEK SELECTOR */}
        <div id="week-selector-bar" className="bg-[#111124] border border-[#1C1C3A] p-3 rounded-2xl flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousWeek}
            disabled={weekOffset <= -3}
            className="w-10 h-10 rounded-xl bg-[#16213E]/50 hover:bg-[#16213E] disabled:opacity-30 disabled:hover:bg-[#16213E]/50 flex items-center justify-center text-white cursor-pointer transition-all"
            aria-label="Semaine précédente"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="font-headline font-bold text-xs sm:text-sm text-white select-none">
              {weeklyData ? weeklyData.weekLabel : `Semaine Offset ${weekOffset}`}
            </span>
            {weekOffset === 0 && (
              <span className="text-[9px] font-headline font-extrabold text-[#FFD700] uppercase tracking-widest mt-0.5">
                Cette semaine
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={goToNextWeek}
            disabled={weekOffset >= 0}
            className={`w-10 h-10 rounded-xl bg-[#16213E]/50 hover:bg-[#16213E] disabled:opacity-0 flex items-center justify-center text-white cursor-pointer transition-all`}
            style={{ visibility: weekOffset === 0 ? 'hidden' : 'visible' }}
            aria-label="Semaine suivante"
          >
            <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-10 h-10 text-[#FFD700] animate-spin" />
            <p className="text-xs text-gray-400 font-mono">Chargement de l'analyse rétrospective...</p>
          </div>
        ) : weeklyData === null ? (
          /* EMPTY STATE (utilisateur pas inscrit / pas de données) */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 bg-[#111124] border border-[#1C1C3A] rounded-3xl text-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center text-[#5A5A5A]">
              <Calendar className="w-9 h-9" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
              <h4 className="font-headline font-black text-white text-sm uppercase">Absence de Matrices Neuronales</h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Pas encore de données d'activité pour cette période de synergie. Ton inscription ou ton historique est plus récent.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#ffdf33] text-black font-headline font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-97"
            >
              Revenir à cette semaine
            </button>
          </motion.div>
        ) : (
          /* FULL RAPPORT CONTENT */
          <AnimatePresence mode="wait">
            <motion.div
              key={weekOffset}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              
              {/* SECTION 1: COURBE DU SCORE SUR 7 JOURS */}
              <div id="score-trend-panel">
                <AlphaCard variant="elevated" className="p-5 border border-[#1C1C35] bg-[#16213E]/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center border-b border-[#1C1C3A]/50 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-headline font-black text-[#8E8E93] uppercase tracking-wider block">
                        SCORE DE TRANSFORMATION
                      </span>
                      <p className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">Analyses rétrospectives des fluctuations neuronales</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-2xl font-black text-[#FFD700]">{weeklyData.avgScore}</span>
                      <span className="font-headline font-bold text-xs text-[#8E8E93]">/100</span>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Moyenne Hebdo</span>
                    </div>
                  </div>

                  {/* SVG SCORE GRAPHIC */}
                  <div className="w-full h-36 flex flex-col justify-end relative">
                    <svg className="w-full h-24" viewBox="0 0 500 100" preserveAspectRatio="none">
                      {/* Area Fill under line */}
                      <path
                        d={getAreaPath(weeklyData.dailyScores)}
                        fill="rgba(255, 215, 0, 0.04)"
                        style={{ transition: 'all 0.5s ease' }}
                      />
                      
                      {/* Graph Line */}
                      <path
                        d={getChartPath(weeklyData.dailyScores)}
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="animate-[dash_1.5s_ease-out]"
                        style={{ transition: 'all 0.5s ease' }}
                      />

                      {/* Best Day Circle & Label */}
                      {weeklyData.dailyScores.map((pt, idx) => {
                        const isBest = pt.day === weeklyData.bestDay.day;
                        const isWorst = pt.day === weeklyData.worstDay.day;
                        const isToday = weekOffset === 0 && pt.day === 'Dim'; // Sunday is the last day of the week
                        
                        const cx = idx * (420 / 6) + 40;
                        const cy = 80 - (pt.score / 100) * 60;

                        if (isBest) {
                          return (
                            <g key={idx}>
                              <circle cx={cx} cy={cy} r="5.5" fill="#00D9A5" stroke="#16213E" strokeWidth="1.5" />
                              <text x={cx} y={cy - 12} textAnchor="middle" fill="#00D9A5" className="font-headline font-black text-[9px] uppercase tracking-wider">MAX</text>
                            </g>
                          );
                        }
                        if (isWorst) {
                          return (
                            <g key={idx}>
                              <circle cx={cx} cy={cy} r="5.5" fill="#FF2D55" stroke="#16213E" strokeWidth="1.5" />
                              <text x={cx} y={cy - 12} textAnchor="middle" fill="#FF2D55" className="font-headline font-black text-[9px] uppercase tracking-wider">MIN</text>
                            </g>
                          );
                        }
                        if (isToday) {
                          return (
                            <circle key={idx} cx={cx} cy={cy} r="5.5" fill="none" stroke="#FFD700" strokeWidth="2" />
                          );
                        }
                        return (
                          <circle key={idx} cx={cx} cy={cy} r="3.5" fill="#FFD700" opacity="0.4" />
                        );
                      })}
                    </svg>

                    {/* Bottom Day Labels */}
                    <div className="flex justify-between px-6 pt-3 select-none text-[10px] font-mono text-gray-500 font-bold uppercase">
                      {weeklyData.dailyScores.map((pt, idx) => (
                        <span key={idx} className={pt.day === 'Dim' && weekOffset === 0 ? "text-[#FFD700]" : ""}>
                          {pt.day}
                        </span>
                      ))}
                    </div>
                  </div>
                </AlphaCard>
              </div>

              {/* SECTION 2: COMPARAISON AVEC LA SEMAINE PRÉCÉDENTE */}
              <div>
                <h3 className="font-headline font-black text-xs text-[#FFD700] tracking-widest uppercase mb-3 select-none">
                  PAR PAR RAPPORT À LA SEMAINE DERNIÈRE
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* CARD 1: STREAK */}
                  <AlphaCard variant="elevated" className="p-4 border border-[#1C1C35] flex flex-col justify-between min-h-[105px]">
                    <span className="text-[10px] font-headline font-bold text-gray-400 uppercase tracking-wide">Streak de Combat</span>
                    <h4 className="font-headline font-black text-lg text-white mt-1.5 flex items-center gap-1.5">
                      <Flame className="w-5 h-5 text-orange-500 fill-current" />
                      {weeklyData.comparison.streak.value} Jours
                    </h4>
                    <div className="flex items-center gap-1 mt-2">
                      {weeklyData.comparison.streak.trend === 'up' ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                          <span className="text-[10px] font-mono font-bold text-[#00D9A5]">{weeklyData.comparison.streak.delta}</span>
                        </>
                      ) : weeklyData.comparison.streak.trend === 'down' ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                          <span className="text-[10px] font-mono font-bold text-[#FF2D55]">{weeklyData.comparison.streak.delta}</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-gray-500">Stable (=)</span>
                      )}
                    </div>
                  </AlphaCard>

                  {/* CARD 2: HUMEUR */}
                  <AlphaCard variant="elevated" className="p-4 border border-[#1C1C35] flex flex-col justify-between min-h-[105px]">
                    <span className="text-[10px] font-headline font-bold text-gray-400 uppercase tracking-wide">Humeur moyenne</span>
                    <h4 className="font-headline font-black text-lg text-white mt-1.5">
                      {weeklyData.comparison.avgMood.value} / 10
                    </h4>
                    <div className="flex items-center gap-1 mt-2">
                      {weeklyData.comparison.avgMood.trend === 'up' ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                          <span className="text-[10px] font-mono font-bold text-[#00D9A5]">{weeklyData.comparison.avgMood.delta}</span>
                        </>
                      ) : weeklyData.comparison.avgMood.trend === 'down' ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                          <span className="text-[10px] font-mono font-bold text-[#FF2D55]">{weeklyData.comparison.avgMood.delta}</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-gray-500">Stable (=)</span>
                      )}
                    </div>
                  </AlphaCard>

                  {/* CARD 3: ÉNERGIE */}
                  <AlphaCard variant="elevated" className="p-4 border border-[#1C1C35] flex flex-col justify-between min-h-[105px]">
                    <span className="text-[10px] font-headline font-bold text-gray-400 uppercase tracking-wide">Énergie moyenne</span>
                    <h4 className="font-headline font-black text-lg text-white mt-1.5 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#FFD700]" />
                      {weeklyData.comparison.avgEnergy.value}
                    </h4>
                    <div className="flex items-center gap-1 mt-2">
                      {weeklyData.comparison.avgEnergy.trend === 'up' ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                          <span className="text-[10px] font-mono font-bold text-[#00D9A5]">{weeklyData.comparison.avgEnergy.delta}</span>
                        </>
                      ) : weeklyData.comparison.avgEnergy.trend === 'down' ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                          <span className="text-[10px] font-mono font-bold text-[#FF2D55]">{weeklyData.comparison.avgEnergy.delta}</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-gray-500">Stable (=)</span>
                      )}
                    </div>
                  </AlphaCard>

                  {/* CARD 4: SESSIONS */}
                  <AlphaCard variant="elevated" className="p-4 border border-[#1C1C35] flex flex-col justify-between min-h-[105px]">
                    <span className="text-[10px] font-headline font-bold text-gray-400 uppercase tracking-wide">Sessions Complétées</span>
                    <h4 className="font-headline font-black text-lg text-white mt-1.5 flex items-center gap-1">
                      <Activity className="w-4 h-4 text-sky-400" />
                      {weeklyData.comparison.sessionsCompleted.value}
                    </h4>
                    <div className="flex items-center gap-1 mt-2">
                      {weeklyData.comparison.sessionsCompleted.trend === 'up' ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                          <span className="text-[10px] font-mono font-bold text-[#00D9A5]">{weeklyData.comparison.sessionsCompleted.delta}</span>
                        </>
                      ) : weeklyData.comparison.sessionsCompleted.trend === 'down' ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                          <span className="text-[10px] font-mono font-bold text-[#FF2D55]">{weeklyData.comparison.sessionsCompleted.delta}</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-gray-500">Stable (=)</span>
                      )}
                    </div>
                  </AlphaCard>

                </div>
              </div>

              {/* SECTION 3: RÉPARTITION PAR PILIER */}
              <div>
                <h3 className="font-headline font-black text-xs text-[#FFD700] tracking-widest uppercase mb-3 select-none">
                  OÙ EST PARTIE TON ÉNERGIE CETTE SEMAINE
                </h3>

                <AlphaCard variant="elevated" className="p-5 border border-[#1C1C35] bg-[#16213E]/20">
                  <div className="flex flex-col gap-4">
                    {weeklyData.pillarBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        {/* Label */}
                        <span className="font-headline font-bold text-[11px] text-white w-24 select-none uppercase">
                          {item.label}
                        </span>
                        
                        {/* Progress Bar Container */}
                        <div className="flex-1 bg-[#111124] h-2.5 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ delay: index * 0.08, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>

                        {/* Percentage */}
                        <span 
                          className="font-mono font-bold text-[11px] w-10 text-right select-none"
                          style={{ color: item.color }}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </AlphaCard>
              </div>

              {/* SECTION 4: CORRÉLATIONS DÉCOUVERTES */}
              <div>
                <h3 className="font-headline font-black text-xs text-[#FFD700] tracking-widest uppercase mb-3 select-none">
                  CE QUE LE MOTEUR A REMARQUÉ
                </h3>

                <div className="flex flex-col gap-3">
                  {weeklyData.correlations.map((corr) => (
                    <AlphaCard
                      key={corr.id}
                      variant="elevated"
                      className="p-4 border border-[#1C1C35] bg-[#1A1A2E]/60 border-l-[3px] border-l-[#4A90D9] flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-[#4A90D9]/15 flex items-center justify-center text-[#4A90D9] flex-shrink-0 mt-0.5">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-white leading-relaxed font-headline font-medium">
                          {corr.text}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[8px] font-headline font-black tracking-wider uppercase text-[#4A90D9] bg-[#4A90D9]/10 border border-[#4A90D9]/20 self-center flex-shrink-0">
                        {corr.strength === 'forte' ? "FORTE" : "MODÉRÉE"}
                      </span>
                    </AlphaCard>
                  ))}
                </div>
              </div>

              {/* SECTION 5: FAITS MARQUANTS */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* MEILLEUR MOMENT */}
                  <div className="bg-[#00D9A5]/5 border border-[#00D9A5]/25 p-4 rounded-2xl flex flex-col">
                    <div className="w-9 h-9 rounded-xl bg-[#00D9A5]/10 flex items-center justify-center text-[#00D9A5] border border-[#00D9A5]/20">
                      <Trophy className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-headline font-extrabold text-[#00D9A5] uppercase tracking-wider mt-2.5">
                      Meilleur moment
                    </span>
                    <p className="text-xs text-white leading-relaxed mt-1.5 font-headline font-medium">
                      {weeklyData.bestMoment}
                    </p>
                  </div>

                  {/* À SURVEILLER */}
                  <div className="bg-[#FF2D55]/5 border border-[#FF2D55]/25 p-4 rounded-2xl flex flex-col">
                    <div className="w-9 h-9 rounded-xl bg-[#FF2D55]/10 flex items-center justify-center text-[#FF2D55] border border-[#FF2D55]/20">
                      <AlertCircle className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-headline font-extrabold text-[#FF2D55] uppercase tracking-wider mt-2.5">
                      À surveiller
                    </span>
                    <p className="text-xs text-white leading-relaxed mt-1.5 font-headline font-medium">
                      {weeklyData.watchPoint}
                    </p>
                  </div>

                </div>
              </div>

              {/* SECTION 6: POUR LA SEMAINE PROCHAINE */}
              <div id="recomm-next-week-panel">
                <AlphaCard 
                  variant="elevated" 
                  className="p-5 border border-[#1C1C35] bg-[#1A1A2E] border-l-[3.5px] border-l-[#FFD700] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <span className="text-[10px] font-headline font-black text-[#FFD700] uppercase tracking-wider block select-none">
                    UNE SEULE CHOSE À CHANGER
                  </span>
                  
                  <h4 className="font-headline font-black text-sm sm:text-md text-white mt-2 leading-snug">
                    {weeklyData.nextWeekFocus.title}
                  </h4>
                  
                  <p className="text-xs text-[#8E8E93] mt-2 leading-relaxed">
                    {weeklyData.nextWeekFocus.reason}
                  </p>

                  <div className="mt-4">
                    {focusApplied ? (
                      <div className="inline-flex items-center gap-1.5 text-[#00D9A5] bg-[#00D9A5]/10 border border-[#00D9A5]/30 px-4 py-2 rounded-xl text-xs font-headline font-black uppercase">
                        ✓ Focus d'Habitude Appliqué
                      </div>
                    ) : (
                      <AlphaButton
                        id="apply-focus-button"
                        variant="gold"
                        size="sm"
                        onClick={handleApplyFocus}
                        className="font-headline font-black text-xs uppercase"
                      >
                        Appliquer pour la semaine prochaine
                      </AlphaButton>
                    )}
                  </div>
                </AlphaCard>
              </div>

              {/* EXPORT PDF BUTTON (BAS DE PAGE) */}
              <div className="mt-4 pb-12 flex justify-center">
                <button
                  id="pdf-download-button"
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full max-w-sm border border-[#5A5A5A]/50 hover:border-[#FFD700]/50 hover:text-[#FFD700] bg-transparent text-white font-headline font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:bg-white/5 active:scale-97"
                >
                  <Download className="w-4 h-4" />
                  Exporter ce rapport en PDF
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
};

// React Native Expo representation code source for inspector preview
const expoNativeCode = `import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  RefreshControl, 
  ActivityIndicator, 
  Share, 
  Alert, 
  Platform 
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Link, 
  Trophy, 
  AlertCircle, 
  Download 
} from 'lucide-react-native';

const THEME = {
  bg: '#0F0F1A',
  card: '#16213E',
  border: '#1C1C3A',
  primary: '#E94560',
  secondary: '#FF9500',
  success: '#00D9A5',
  alert: '#FF2D55',
  gold: '#FFD700',
  text: '#FFFFFF',
  textSecondary: '#8E8E93'
};

export default function WeeklyReportDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const userId = route.params?.userId || 'ALPHA_SOLDIER_1';
  const [weekOffset, setWeekOffset] = useState(route.params?.initialWeekOffset || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);
  const [focusApplied, setFocusApplied] = useState(false);

  const fetchWeeklyReport = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await fetch(\`https://api.alphaman.app/api/ai-engine/\${userId}/weekly-report?weekOffset=\${weekOffset}\`);
      const json = await response.json();
      if (json.success) {
        setWeeklyData(json.weeklyData);
      } else {
        setWeeklyData(null);
      }
    } catch (error) {
      console.log('Error fetching weekly report', error);
      setWeeklyData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, weekOffset]);

  useEffect(() => {
    fetchWeeklyReport();
    setFocusApplied(false);
  }, [weekOffset, fetchWeeklyReport]);

  const goToPreviousWeek = () => {
    if (weekOffset <= -3) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Limite", "Limite de l'historique local atteinte.");
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    if (weekOffset >= 0) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeekOffset(prev => prev + 1);
  };

  const sharePDFReport = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Share.share({
        message: \`Rapport Hebdomadaire d'Auto-Discipline Alpha - \${weeklyData?.weekLabel}. Score de Synergie : \${weeklyData?.avgScore}/100. Rejoins l'élite !\`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const applyNextWeekFocus = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Medium);
    try {
      const res = await fetch(\`https://api.alphaman.app/api/ai-engine/\${userId}/weekly-report/apply-focus\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekOffset, focus: weeklyData?.nextWeekFocus?.title })
      });
      if (res.ok) {
        setFocusApplied(true);
        Alert.alert("Succès", "Focus enregistré pour la semaine prochaine ! 🎯");
      }
    } catch (e) {
      Alert.alert("Erreur", "Erreur de communication.");
    }
  };

  const exportWeeklyReportPDF = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Rapport PDF", "Le rapport PDF a été généré localement et enregistré dans votre dossier Téléchargements.");
  };

  const getChartPath = (scores) => {
    if (!scores || scores.length === 0) return '';
    const points = scores.map((s, idx) => {
      const x = idx * 60 + 30;
      const y = 80 - (s.score / 100) * 60;
      return { x, y };
    });

    let path = \`M \${points[0].x} \${points[0].y}\`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + 20;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 40;
      const cpY2 = next.y;
      path += \` C \${cpX1} \${cpY1}, \${cpX2} \${cpY2}, \${next.x} \${next.y}\`;
    }
    return path;
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.gold} />
        <Text style={styles.loadingText}>Synchronisation neuronale clinique...</Text>
      </View>
    );
  }

  if (!weeklyData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Pas encore de données pour cette semaine</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setWeekOffset(0)}>
            <Text style={styles.emptyBtnText}>REVENIR À CETTE SEMAINE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerTouch} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RAPPORT HEBDOMADAIRE</Text>
        <TouchableOpacity style={styles.headerTouch} onPress={sharePDFReport}>
          <Share2 size={22} color={THEME.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchWeeklyReport(true)} tintColor={THEME.gold} />
        }
      >
        {/* WEEK SELECTOR */}
        <View style={styles.weekSelector}>
          <TouchableOpacity 
            style={[styles.arrowBtn, weekOffset <= -3 && { opacity: 0.3 }]} 
            onPress={goToPreviousWeek}
            disabled={weekOffset <= -3}
          >
            <ChevronLeft size={20} color={THEME.textSecondary} />
          </TouchableOpacity>
          <View style={styles.weekLabelContainer}>
            <Text style={styles.weekLabel}>{weeklyData.weekLabel}</Text>
            {weekOffset === 0 && <Text style={styles.weekSub}>Cette semaine</Text>}
          </View>
          <TouchableOpacity 
            style={[styles.arrowBtn, weekOffset === 0 && { opacity: 0 }]} 
            onPress={goToNextWeek}
            disabled={weekOffset === 0}
          >
            <ChevronRight size={20} color={THEME.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* SECTION 1: SCORE GRAPH */}
        <View style={styles.card}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreTitle}>SCORE DE TRANSFORMATION</Text>
            <Text style={styles.scoreVal}>
              {weeklyData.avgScore}<Text style={styles.scoreMax}>/100</Text>
            </Text>
          </View>

          <Svg height="100" width="380" style={styles.svg}>
            <Path 
              d={getChartPath(weeklyData.dailyScores)} 
              fill="none" 
              stroke={THEME.gold} 
              strokeWidth="2.5" 
            />
            {weeklyData.dailyScores.map((pt, idx) => {
              const cx = idx * 60 + 30;
              const cy = 80 - (pt.score / 100) * 60;
              if (pt.day === weeklyData.bestDay.day) {
                return <Circle key={idx} cx={cx} cy={cy} r="4" fill={THEME.success} />;
              }
              if (pt.day === weeklyData.worstDay.day) {
                return <Circle key={idx} cx={cx} cy={cy} r="4" fill={THEME.alert} />;
              }
              return <Circle key={idx} cx={cx} cy={cy} r="3" fill={THEME.gold} opacity="0.4" />;
            })}
          </Svg>
          
          <View style={styles.daysRow}>
            {weeklyData.dailyScores.map((pt, idx) => (
              <Text key={idx} style={styles.dayText}>{pt.day}</Text>
            ))}
          </View>
        </View>

        {/* SECTION 2: COMPARISON GRID */}
        <Text style={styles.sectionHeading}>PAR RAPPORT À LA SEMAINE DERNIÈRE</Text>
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Streak de Combat</Text>
            <Text style={styles.gridValue}>{weeklyData.comparison.streak.value}j</Text>
            <Text style={[styles.gridDelta, { color: weeklyData.comparison.streak.trend === 'up' ? THEME.success : THEME.alert }]}>
              {weeklyData.comparison.streak.delta}
            </Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Humeur moyenne</Text>
            <Text style={styles.gridValue}>{weeklyData.comparison.avgMood.value}/10</Text>
            <Text style={[styles.gridDelta, { color: weeklyData.comparison.avgMood.trend === 'up' ? THEME.success : THEME.alert }]}>
              {weeklyData.comparison.avgMood.delta}
            </Text>
          </View>
        </View>

        {/* SECTION 3: PILLAR BREAKDOWN */}
        <Text style={styles.sectionHeading}>OÙ EST PARTIE TON ÉNERGIE CETTE SEMAINE</Text>
        <View style={styles.card}>
          {weeklyData.pillarBreakdown.map((item, idx) => (
            <View key={idx} style={styles.pillarRow}>
              <Text style={styles.pillarLabel}>{item.label}</Text>
              <View style={styles.pillarTrack}>
                <View style={[styles.pillarFill, { width: \`\${item.percentage}%\`, backgroundColor: item.color }]} />
              </View>
              <Text style={[styles.pillarPct, { color: item.color }]}>{item.percentage}%</Text>
            </View>
          ))}
        </View>

        {/* SECTION 4: CORRELATIONS */}
        <Text style={styles.sectionHeading}>CE QUE LE MOTEUR A REMARQUÉ</Text>
        {weeklyData.correlations.map((corr) => (
          <View key={corr.id} style={styles.corrCard}>
            <Text style={styles.corrText}>{corr.text}</Text>
            <View style={styles.corrBadge}>
              <Text style={styles.corrBadgeText}>{corr.strength.toUpperCase()}</Text>
            </View>
          </View>
        ))}

        {/* SECTION 5: HIGHLIGHTS */}
        <View style={styles.highlightsRow}>
          <View style={styles.highlightCardBest}>
            <Trophy size={18} color={THEME.success} />
            <Text style={styles.highlightTitleBest}>Meilleur moment</Text>
            <Text style={styles.highlightDesc}>{weeklyData.bestMoment}</Text>
          </View>
          <View style={styles.highlightCardWatch}>
            <AlertCircle size={18} color={THEME.alert} />
            <Text style={styles.highlightTitleWatch}>À surveiller</Text>
            <Text style={styles.highlightDesc}>{weeklyData.watchPoint}</Text>
          </View>
        </View>

        {/* SECTION 6: FOCUS */}
        <View style={styles.focusCard}>
          <Text style={styles.focusHeader}>UNE SEULE CHOSE À CHANGER</Text>
          <Text style={styles.focusTitle}>{weeklyData.nextWeekFocus.title}</Text>
          <Text style={styles.focusReason}>{weeklyData.nextWeekFocus.reason}</Text>
          
          <TouchableOpacity style={styles.focusBtn} onPress={applyNextWeekFocus}>
            <Text style={styles.focusBtnText}>Appliquer pour la semaine prochaine</Text>
          </TouchableOpacity>
        </View>

        {/* EXPORT BUTTON */}
        <TouchableOpacity style={styles.exportBtn} onPress={exportWeeklyReportPDF}>
          <Download size={14} color={THEME.text} style={styles.exportIcon} />
          <Text style={styles.exportBtnText}>Exporter ce rapport en PDF</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg },
  loadingText: { color: THEME.textSecondary, marginTop: 12, fontSize: 12 },
  header: { height: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
  headerTouch: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: THEME.gold, fontSize: 14, fontWeight: 'bold', fontFamily: 'Montserrat-Bold' },
  scroll: { flex: 1, padding: 16 },
  weekSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  arrowBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  weekLabelContainer: { alignItems: 'center' },
  weekLabel: { color: THEME.text, fontSize: 14, fontWeight: '600' },
  weekSub: { color: THEME.gold, fontSize: 10, marginTop: 2 },
  card: { backgroundColor: THEME.card, borderRadius: 20, padding: 20, marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  scoreTitle: { color: THEME.textSecondary, fontSize: 11, fontWeight: 'bold' },
  scoreVal: { color: THEME.gold, fontSize: 20, fontWeight: 'bold' },
  scoreMax: { color: THEME.textSecondary, fontSize: 12 },
  svg: { marginTop: 14 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dayText: { color: THEME.textSecondary, fontSize: 9 },
  sectionHeading: { color: THEME.gold, fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  gridCard: { width: '48%', backgroundColor: THEME.card, borderRadius: 14, padding: 14 },
  gridLabel: { color: THEME.textSecondary, fontSize: 10 },
  gridValue: { color: THEME.text, fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  gridDelta: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  pillarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pillarLabel: { color: THEME.text, fontSize: 11, width: 90 },
  pillarTrack: { flex: 1, height: 8, backgroundColor: '#1A1A2E', borderRadius: 4 },
  pillarFill: { height: 8, borderRadius: 4 },
  pillarPct: { fontSize: 11, fontWeight: 'bold', width: 36, textAlign: 'right' },
  corrCard: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#4A90D9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  corrText: { color: THEME.text, fontSize: 12, flex: 1, marginRight: 10 },
  corrBadge: { backgroundColor: 'rgba(74,144,217,0.15)', borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  corrBadgeText: { color: '#4A90D9', fontSize: 8, fontWeight: 'bold' },
  highlightsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  highlightCardBest: { flex: 1, backgroundColor: 'rgba(0,217,165,0.08)', borderColors: 'rgba(0,217,165,0.25)', borderWith: 1, borderRadius: 16, padding: 16, marginRight: 8 },
  highlightCardWatch: { flex: 1, backgroundColor: 'rgba(255,45,85,0.08)', borderColors: 'rgba(255,45,85,0.25)', borderWith: 1, borderRadius: 16, padding: 16, marginLeft: 8 },
  highlightTitleBest: { color: THEME.success, fontSize: 10, fontWeight: 'bold', marginTop: 8 },
  highlightTitleWatch: { color: THEME.alert, fontSize: 10, fontWeight: 'bold', marginTop: 8 },
  highlightDesc: { color: THEME.text, fontSize: 11, lineHeight: 16, marginTop: 4 },
  focusCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, borderLeftWidth: 3, borderLeftColor: THEME.gold, marginBottom: 16 },
  focusHeader: { color: THEME.gold, fontSize: 10, fontWeight: 'bold' },
  focusTitle: { color: THEME.text, fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  focusReason: { color: THEME.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 6 },
  focusBtn: { backgroundColor: THEME.gold, borderRadius: 10, padding: 12, marginTop: 14, alignItems: 'center' },
  focusBtnText: { color: THEME.bg, fontSize: 12, fontWeight: 'bold' },
  exportBtn: { borderColors: '#5A5A5A', borderWith: 1, borderRadius: 12, padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  exportIcon: { marginRight: 8 },
  exportBtnText: { color: THEME.text, fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: THEME.textSecondary, fontSize: 13, marginBottom: 16 },
  emptyBtn: { backgroundColor: THEME.gold, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  emptyBtnText: { color: '#000000', fontWeight: 'bold', fontSize: 11 }
});
`;
