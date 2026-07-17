import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Brain,
  Calendar,
  Flame,
  HelpCircle,
  TrendingUp,
  Award,
  Shield,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  MessageSquare,
  Plus,
  Send,
  Zap
} from 'lucide-react';

import { 
  journalService, 
  JournalEntry, 
  DeepJournalEntry, 
  FutureLetter, 
  PREDEFINED_TAGS, 
  DEEP_JOURNAL_PROMPTS 
} from '../pattern_killer/journalService';

import { progressService } from '../pattern_killer/progressService';

import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';

interface AlphaJournalProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
}

export const AlphaJournal: React.FC<AlphaJournalProps> = ({ addToast, onPointsUpdate }) => {
  // Service-bound states
  const [journalState, setJournalState] = useState(() => journalService.getState());
  const [correlations, setCorrelations] = useState(() => journalService.calculateCorrelations());
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'quick' | 'analytics' | 'deep' | 'letters'>('analytics');
  
  // Quick Journal Form State
  const [mood, setMood] = useState<number>(7);
  const [energy, setEnergy] = useState<number>(7);
  const [urge, setUrge] = useState<number>(2);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [gratitudes, setGratitudes] = useState<string[]>(['', '', '']);

  // Deep Journal Form State
  const [selectedPrompt, setSelectedPrompt] = useState(DEEP_JOURNAL_PROMPTS[0]);
  const [deepResponse, setDeepResponse] = useState<string>('');

  // Future Letters Form State
  const [letterTitle, setLetterTitle] = useState<string>('');
  const [letterContent, setLetterContent] = useState<string>('');
  const [letterDays, setLetterDays] = useState<number>(30);

  // Sync state changes
  useEffect(() => {
    const handleUpdate = () => {
      setJournalState(journalService.getState());
      setCorrelations(journalService.calculateCorrelations());
    };
    window.addEventListener('alphaman_journal_updated', handleUpdate);
    return () => window.removeEventListener('alphaman_journal_updated', handleUpdate);
  }, []);

  // Quick form action helper
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      if (tag === "Rien n'a aidé") {
        setSelectedTags(["Rien n'a aidé"]);
      } else {
        setSelectedTags(prev => [...prev.filter(t => t !== "Rien n'a aidé"), tag]);
      }
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = customTag.trim();
    if (cleanTag && !selectedTags.includes(cleanTag)) {
      setSelectedTags(prev => [...prev.filter(t => t !== "Rien n'a aidé"), cleanTag]);
      setCustomTag('');
      addToast('success', `Tag personnalisé ajouté : ${cleanTag}`);
    }
  };

  // Submit quick log
  const handleQuickJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeGratitudes = gratitudes.filter(g => g.trim() !== "");
    
    const entry = journalService.addQuickEntry(
      mood,
      energy,
      urge,
      selectedTags.length > 0 ? selectedTags : ["Rien n'a aidé"],
      note,
      activeGratitudes
    );

    // Reward points through host app context
    if (onPointsUpdate) {
      // Award 15 points for completing daily journal
      const currentPts = progressService.getState().totalPoints + 15;
      progressService.saveState({ ...progressService.getState(), totalPoints: currentPts });
      onPointsUpdate(currentPts);
    }

    addToast('success', 'Journal d\'aujourd\'hui enregistré ! +15 Points d\'Esprit Souverain.');
    
    // Clear / Reset form
    setMood(7);
    setEnergy(7);
    setUrge(2);
    setSelectedTags([]);
    setNote('');
    setGratitudes(['', '', '']);
    
    // Update local view
    setJournalState(journalService.getState());
    setCorrelations(journalService.calculateCorrelations());
    
    // Switch to analytics to see updated graph
    setActiveTab('analytics');
  };

  // Submit deep introspection
  const handleDeepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deepResponse.trim().length < 20) {
      addToast('error', 'Creuse un peu plus en profondeur (min. 20 caractères).');
      return;
    }

    journalService.addDeepEntry(selectedPrompt.id, selectedPrompt.text, deepResponse);
    addToast('success', 'Introspection sauvegardée avec succès ! +30 XP de discipline cognitive.');
    
    setDeepResponse('');
    setJournalState(journalService.getState());
  };

  // Submit future letter
  const handleLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (letterContent.trim().length < 50) {
      addToast('error', 'Le contenu de ta lettre est trop court. Dis-toi plus de choses.');
      return;
    }

    const title = letterTitle.trim() || `Lettre pour mon futur moi dans ${letterDays} jours`;
    journalService.createLetter(title, letterContent, letterDays);
    addToast('success', `Lettre scellée et protégée pour une durée de ${letterDays} jours 🔒`);
    
    setLetterTitle('');
    setLetterContent('');
    setLetterDays(30);
    setJournalState(journalService.getState());
  };

  // Trigger file compilation and browser download
  const handleExport = () => {
    const data = journalService.exportJournalToTXT();
    const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', data.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Compilation terminée ! Téléchargement de ton journal de 90 jours lancé.');
  };

  // Calculate quick stats
  const totalEntries = journalState.entries.length;
  const avgMood = totalEntries > 0 
    ? (journalState.entries.reduce((sum, e) => sum + e.mood, 0) / totalEntries).toFixed(1)
    : '0.0';
  const avgEnergy = totalEntries > 0 
    ? (journalState.entries.reduce((sum, e) => sum + e.energy, 0) / totalEntries).toFixed(1)
    : '0.0';
  const avgUrge = totalEntries > 0 
    ? (journalState.entries.reduce((sum, e) => sum + e.urge, 0) / totalEntries).toFixed(1)
    : '0.0';

  // Slider color mappers
  const getMoodColor = (val: number) => {
    if (val >= 8) return 'text-[#00E676] bg-[#00E676]/10';
    if (val >= 5) return 'text-[#FFD700] bg-[#FFD700]/10';
    return 'text-[#E94560] bg-[#E94560]/10';
  };

  const getUrgeColor = (val: number) => {
    if (val >= 7) return 'text-[#E94560] bg-[#E94560]/10 border-red-500/30';
    if (val >= 4) return 'text-[#FF9800] bg-[#FF9800]/10 border-amber-500/30';
    return 'text-[#00E676] bg-[#00E676]/10 border-emerald-500/30';
  };

  // Render inline custom SVG charts for trend metrics
  const recent10Entries = journalState.entries.slice(-10);

  return (
    <div id="alpha-journaling-container" className="flex flex-col gap-6 w-full text-white bg-[#0F0F1A] border border-[#1A1A2E] p-4 md:p-6 rounded-3xl overflow-hidden relative">
      
      {/* 1. SECTION BRANDING */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] md:text-xs font-headline font-bold text-[#E94560] uppercase tracking-[0.25em]">
            PHASE 1 : MIND — NEURO-REWIRE
          </span>
          <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-white tracking-tight flex items-center gap-3">
            <Brain className="w-7 h-7 text-[#E94560]" />
            Journaling & Suivi Mental
          </h2>
          <p className="text-xs text-[#8E8E93] font-serif italic">
            &ldquo;Le cerveau est le champ de bataille. On gagne ici.&rdquo;
          </p>
        </div>
        
        <AlphaButton 
          variant="gold" 
          onClick={handleExport}
          className="flex items-center gap-2 font-headline font-black uppercase text-xs cursor-pointer tracking-wider"
        >
          <Download className="w-4 h-4" />
          Mon Journal Alpha (PDF/TXT)
        </AlphaButton>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AlphaCard variant="default" className="p-4 flex flex-col justify-between border-l-4 border-l-[#E94560]">
          <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider">JOURS ENREGISTRÉS</span>
          <h4 className="text-2xl font-mono font-black mt-2">{totalEntries} Jours</h4>
        </AlphaCard>
        
        <AlphaCard variant="default" className="p-4 flex flex-col justify-between border-l-4 border-l-[#00E676]">
          <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider">MOYENNE HUMEUR</span>
          <h4 className="text-2xl font-mono font-black text-[#00E676] mt-2">{avgMood}/10</h4>
        </AlphaCard>

        <AlphaCard variant="default" className="p-4 flex flex-col justify-between border-l-4 border-l-[#3B82F6]">
          <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider">MOYENNE ÉNERGIE</span>
          <h4 className="text-2xl font-mono font-black text-[#3B82F6] mt-2">{avgEnergy}/10</h4>
        </AlphaCard>

        <AlphaCard variant="default" className="p-4 flex flex-col justify-between border-l-4 border-l-[#FF9800]">
          <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider">INTENSITÉ MOY. URGES</span>
          <h4 className="text-2xl font-mono font-black text-[#FF9800] mt-2">{avgUrge}/10</h4>
        </AlphaCard>
      </div>

      {/* 3. SUB-TABS SELECTOR */}
      <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1.5 rounded-2xl w-full md:max-w-xl">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'analytics'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Tableau & Patterns
        </button>

        <button
          onClick={() => setActiveTab('quick')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'quick'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Plus className="w-3.5 h-3.5" />
          Journal Rapide (2 min)
        </button>

        <button
          onClick={() => setActiveTab('deep')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'deep'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Introspection Profonde
        </button>

        <button
          onClick={() => setActiveTab('letters')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'letters'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Lock className="w-3.5 h-3.5" />
          Lettres Temporelles
        </button>
      </div>

      {/* ==================================== TABS RENDERING ==================================== */}
      
      {/* 4.1. TAB : ANALYTICS & PATTERNS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Block: Interactive charts & Heatmap */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* ALERT BANNERS */}
            {correlations.has3RedDays && (
              <div className="bg-[#E94560]/10 border border-[#E94560]/30 rounded-2xl p-4 flex gap-3 items-start animate-pulse">
                <AlertCircle className="w-5 h-5 text-[#E94560] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-headline font-bold text-white uppercase tracking-wider">
                    ALERTE ROUGE : 3 JOURS CRITIQUES CONSÉCUTIFS 🚨
                  </h4>
                  <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                    Soldat, ta vigilance ou ton humeur est dans une phase de stress critique depuis 72 heures. N'affronte pas la tempête seule. Contacte immédiatement ton buddy, prends une douche glacée et vide tes urges par l'exercice physique immédiat.
                  </p>
                </div>
              </div>
            )}

            {correlations.moodTrend === "rising" && (
              <div className="bg-[#00E676]/10 border border-[#00E676]/30 rounded-2xl p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-headline font-bold text-white uppercase tracking-wider">
                    TENDANCE NEURONALE ACTIVE 🔥
                  </h4>
                  <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                    Ton humeur s'améliore de façon constante depuis 14 jours. Les récepteurs dopaminergiques de ton cortex se stabilisent, récompensant ta résistance par une paix intérieure souveraine.
                  </p>
                </div>
              </div>
            )}

            {/* MAIN GRAPHICS VIEWPORT */}
            <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1A1A2E]">
                <h3 className="text-sm font-headline font-bold uppercase tracking-wider">
                  Courbe de Fluctuations Neuro-Mentales (10 derniers jours)
                </h3>
                <span className="text-[10px] text-[#8E8E93] font-mono">Détails Interactifs</span>
              </div>

              {recent10Entries.length > 0 ? (
                <div className="relative w-full h-56 mt-2">
                  <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E676" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#00E676" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="urgeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E94560" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#E94560" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {/* Grids */}
                    {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                      <line key={i} x1="30" y1={20 + 130 * r} x2="490" y2={20 + 130 * r} stroke="#1A1A2E" strokeWidth="1" />
                    ))}

                    {/* Plot curves */}
                    {(() => {
                      const getX = (idx: number) => 30 + (idx / (recent10Entries.length - 1)) * 460;
                      const getY = (val: number) => 150 - (val / 10) * 130;
                      
                      const moodPoints = recent10Entries.map((e, i) => `${getX(i)},${getY(e.mood)}`).join(' ');
                      const urgePoints = recent10Entries.map((e, i) => `${getX(i)},${getY(e.urge)}`).join(' ');
                      const energyPoints = recent10Entries.map((e, i) => `${getX(i)},${getY(e.energy)}`).join(' ');

                      const moodArea = `30,150 ${moodPoints} 490,150`;
                      const urgeArea = `30,150 ${urgePoints} 490,150`;

                      return (
                        <g>
                          {/* Areas */}
                          <polygon points={moodArea} fill="url(#moodGrad)" />
                          <polygon points={urgeArea} fill="url(#urgeGrad)" />

                          {/* Curves */}
                          <polyline points={moodPoints} fill="none" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points={urgePoints} fill="none" stroke="#E94560" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points={energyPoints} fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Nodes */}
                          {recent10Entries.map((e, i) => (
                            <g key={i}>
                              <circle cx={getX(i)} cy={getY(e.mood)} r="3" fill="#00E676" />
                              <circle cx={getX(i)} cy={getY(e.urge)} r="3" fill="#E94560" />
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                  
                  {/* Legend overlay */}
                  <div className="flex gap-6 justify-center mt-3 text-[10px] font-headline font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00E676]" /> Humeur</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E94560]" /> Urge (Anticipation)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border border-dashed border-[#3B82F6]" /> Énergie</span>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center border border-dashed border-[#1A1A2E] rounded-xl text-gray-500 text-xs">
                  Aucune donnée disponible pour tracer la courbe. Complète ton journal quotidien !
                </div>
              )}
            </AlphaCard>

            {/* COGNITIVE HEATMAP CALENDAR */}
            <AlphaCard variant="default" className="p-6">
              <div className="flex justify-between items-center pb-2 border-b border-[#1A1A2E] mb-4">
                <h3 className="text-sm font-headline font-bold uppercase tracking-wider">
                  Matrice d'Emprise Mentale (Heatmap 14 Jours)
                </h3>
                <span className="text-[10px] text-[#8E8E93] font-mono">Vert = Souverain | Rouge = Alerte Urge</span>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center bg-[#0F0F1A] p-4 rounded-2xl border border-[#1A1A2E]">
                {journalState.entries.slice(-14).map((entry, idx) => {
                  const isUrgeHigh = entry.urge >= 6;
                  const isMoodGood = entry.mood >= 7;
                  let colorClass = 'bg-[#1C1C3A] text-slate-400';
                  if (isUrgeHigh) colorClass = 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/10';
                  else if (isMoodGood) colorClass = 'bg-[#00E676] text-black font-extrabold shadow-lg shadow-[#00E676]/10';

                  return (
                    <div 
                      key={idx} 
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono transition-transform hover:scale-110 cursor-pointer ${colorClass}`}
                      title={`Date: ${entry.date} | Humeur: ${entry.mood} | Urge: ${entry.urge}`}
                    >
                      <span className="text-[8px] opacity-75">{entry.dayOfWeek.slice(0, 3)}</span>
                      <span className="font-bold -mt-0.5">{entry.date.split('-')[2]}</span>
                    </div>
                  );
                })}
              </div>
            </AlphaCard>

          </div>

          {/* Right Block: Dynamic Auto correlations */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* GRATITUDE CORNERSTONE */}
            <div className="bg-[#16213E]/30 border border-[#1A1A2E] p-5 rounded-3xl flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FFD700]/5 rounded-full pointer-events-none" />
              <div className="flex items-center gap-2 text-[#FFD700]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-xs font-headline font-black uppercase tracking-wider">Discipline de Gratitude</h3>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Tu as répertorié <strong className="text-[#00E676] font-mono text-sm">{journalState.totalGratitudesCount} aspects de gratitude</strong>. Cette boucle vertueuse inhibe l'attention négative et re-formate activement le lobe temporal vers l'abondance.
              </p>
            </div>

            {/* DYNAMIC COGNITIVE CORRELATION INSIGHTS */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-headline font-bold text-[#E94560] uppercase tracking-widest block px-1">
                Corrélations Neuro-Comportementales
              </span>

              {correlations.ready ? (
                <div className="flex flex-col gap-3">
                  {correlations.correlations.map((corr, idx) => {
                    const isWarning = corr.type === "warning";
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all hover:bg-[#0F0F1A]/40
                          ${isWarning ? 'bg-[#FF9800]/5 border-[#FF9800]/15' : 'bg-[#00E676]/5 border-[#00E676]/15'}
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className={`text-xs font-headline font-extrabold uppercase tracking-wide ${isWarning ? 'text-[#FF9800]' : 'text-[#00E676]'}`}>
                            {corr.title}
                          </h4>
                          <span className="text-[10px] font-mono bg-black/20 px-2.5 py-0.5 rounded-md">
                            {isWarning ? `+${corr.percentage}% Urge` : `-${corr.percentage}% Urge`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E8E93] leading-relaxed mt-1">
                          {corr.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#111122] border border-dashed border-[#1A1A2E] p-6 rounded-2xl text-center text-xs text-gray-500">
                  Calculateur de patterns en veille. Enregistre au moins 5 entrées pour générer tes premières corrélations synaptiques.
                </div>
              )}
            </div>

            {/* MANUAL JOURNAL EXPORT TRIGGER BUTTON */}
            <div className="bg-[#0F0F1A] border border-[#1A1A2E] p-4 rounded-2xl flex justify-between items-center">
              <div>
                <h5 className="text-[10px] font-headline font-bold text-white uppercase">Export des données anonymisé</h5>
                <p className="text-[9px] text-[#8E8E93] mt-0.5">Format de consultation d'imprimerie</p>
              </div>
              <button 
                onClick={handleExport}
                className="p-2 bg-[#16213E] hover:bg-[#1C2C54] rounded-lg text-white transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 4.2. TAB : QUICK DAILY LOGGER FORM */}
      {activeTab === 'quick' && (
        <form onSubmit={handleQuickJournalSubmit} className="max-w-3xl mx-auto w-full bg-[#111122]/60 border border-[#1A1A2E] rounded-3xl p-6 md:p-8 flex flex-col gap-6 animate-[fade-in_0.2s_ease-out]">
          
          <div className="border-b border-[#1A1A2E] pb-4">
            <h3 className="text-lg font-headline font-black text-white">
              Séquenceur Rapide Mental (2 min max)
            </h3>
            <p className="text-xs text-[#8E8E93] mt-1">
              Prends ce rendez-vous crucial avec toi-même pour graver tes victoires et désactiver tes impulses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MOOD SLIDER */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-headline font-bold uppercase tracking-wider text-slate-300">
                <label>Comment te sens-tu globalement ?</label>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${getMoodColor(mood)}`}>
                  {mood}/10
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={mood} 
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full accent-[#00E676] bg-[#1C1C3A] rounded-lg appearance-none h-2 cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 font-serif italic text-right">
                {mood >= 8 ? "Souverain, serein, ancré." : mood >= 5 ? "Stable, calme, en transition." : "Tension critique, brouillard mental."}
              </span>
            </div>

            {/* ENERGY SLIDER */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-headline font-bold uppercase tracking-wider text-slate-300">
                <label>Ton niveau d'énergie physique ?</label>
                <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-mono font-bold">
                  {energy}/10 ⚡
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={energy} 
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full accent-[#3B82F6] bg-[#1C1C3A] rounded-lg appearance-none h-2 cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 font-serif italic text-right">
                {energy >= 8 ? "Énergie vitale élevée, prêt à transmuter." : energy >= 5 ? "Normal, équilibré." : "Fatigué, vigilance affaiblie."}
              </span>
            </div>

            {/* URGES SLIDER */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex justify-between items-center text-xs font-headline font-bold uppercase tracking-wider text-slate-300">
                <label>Intensité des envies/urges de rechute ?</label>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getUrgeColor(urge)}`}>
                  {urge}/10 {urge === 0 ? "Sérénité absolue" : urge >= 7 ? "Urge intense !" : "Contrôle stable"}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={urge} 
                onChange={(e) => setUrge(parseInt(e.target.value))}
                className="w-full accent-[#E94560] bg-[#1C1C3A] rounded-lg appearance-none h-2 cursor-pointer"
              />
            </div>

          </div>

          {/* CHIPS TAG SELECTOR */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-slate-300 block">
              Qu'est-ce qui t'a aidé à rester maître aujourd'hui ?
            </span>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer border
                      ${isSelected 
                        ? 'bg-[#E94560] border-transparent text-white scale-105 shadow-md shadow-[#E94560]/10' 
                        : 'bg-[#1C1C3A] border-[#2C2C4E] text-[#8E8E93] hover:text-white hover:border-gray-500'
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag creation */}
            <div className="flex items-center gap-2 mt-2 max-w-sm">
              <input
                type="text"
                placeholder="Créer un tag personnalisé..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className="flex-1 bg-[#1A1A2E] border border-[#2C2C4E] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E94560]"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="p-2 bg-[#E94560] hover:bg-[#FF2D55] text-white rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* GRATITUDE TRIPLETS */}
          <div className="flex flex-col gap-3 bg-[#0F0F1A] border border-[#1A1A2E] p-4 rounded-2xl">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#FFD700] block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Log de Gratitude (Écris 3 choses pour formater ton cerveau)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {gratitudes.map((g, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Gratitude #${i + 1}`}
                  value={g}
                  onChange={(e) => {
                    const next = [...gratitudes];
                    next[i] = e.target.value;
                    setGratitudes(next);
                  }}
                  className="bg-[#1C1C3A]/50 border border-[#2C2C4E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                />
              ))}
            </div>
          </div>

          {/* OPTIONAL NOTES TEXTAREA */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-headline font-bold uppercase tracking-wider text-slate-300">
              <label>Note de synthèse rapide (Optionnel)</label>
              <span className="font-mono text-gray-500">{note.length}/280</span>
            </div>
            <textarea
              placeholder="Ressentis, événements particuliers, triggers découverts..."
              maxLength={280}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-24 p-3 bg-[#1C1C3A]/50 border border-[#2D2D4E] rounded-xl text-xs focus:outline-none focus:border-[#E94560] resize-none"
            />
          </div>

          {/* SUBMIT */}
          <AlphaButton
            variant="primary"
            className="w-full py-4 text-xs font-headline font-extrabold uppercase cursor-pointer"
          >
            Enregistrer mon journal de combat du jour
          </AlphaButton>

        </form>
      )}

      {/* 4.3. TAB : DEEP INTROSPECTION WORKSPACE */}
      {activeTab === 'deep' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Block: Prompt select rail */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="text-xs font-headline font-bold text-[#E94560] uppercase tracking-widest px-1">
              Introspections disponibles ({DEEP_JOURNAL_PROMPTS.length} prompts)
            </span>
            
            <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar bg-[#0F0F1A]/80 border border-[#1A1A2E] p-3 rounded-2xl">
              {DEEP_JOURNAL_PROMPTS.map((prompt) => {
                const isActive = selectedPrompt.id === prompt.id;
                return (
                  <button
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer
                      ${isActive 
                        ? 'bg-[#E94560]/10 border-[#E94560] text-white' 
                        : 'bg-[#16213E]/30 border-[#1A1A2E] text-[#8E8E93] hover:text-white'
                      }
                    `}
                  >
                    <span className="text-[10px] font-mono text-[#E94560] uppercase block font-bold">PROMPT {prompt.id.split('_')[1]}</span>
                    <p className="text-xs font-headline font-semibold mt-1 leading-tight">{prompt.text}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Block: Workspace */}
          <form onSubmit={handleDeepSubmit} className="lg:col-span-7 bg-[#111122]/60 border border-[#1A1A2E] rounded-3xl p-6 flex flex-col gap-6">
            <div className="border-b border-[#1A1A2E] pb-3">
              <span className="text-[10px] font-mono text-[#FFD700] uppercase bg-[#FFD700]/10 border border-[#FFD700]/30 px-2.5 py-0.5 rounded-full font-bold">
                Espace d'écriture profonde
              </span>
              <h3 className="text-md font-headline font-black mt-3 leading-snug">
                &ldquo;{selectedPrompt.text}&rdquo;
              </h3>
            </div>

            <textarea
              placeholder="Rédige ton introspection sans détour. C'est en structurant tes arguments intellectuels ici que ton cortex logique déconnecte les réseaux d'automatismes obsessionnels..."
              value={deepResponse}
              onChange={(e) => setDeepResponse(e.target.value)}
              className="w-full h-72 p-4 bg-[#0F0F1A]/90 border border-[#1A1A2E] rounded-2xl text-xs md:text-sm text-gray-200 focus:outline-none focus:border-[#E94560] resize-none leading-relaxed"
            />

            <div className="flex justify-between items-center text-xs font-mono text-gray-500">
              <span>Min. 20 Caractères</span>
              <span>{deepResponse.length} caractères saisis</span>
            </div>

            <AlphaButton
              variant="primary"
              className="py-3.5 text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
            >
              Enregistrer l'Introspection (+30 XP)
            </AlphaButton>

            {/* Display historic introspections */}
            <div className="mt-4 pt-4 border-t border-[#1A1A2E] flex flex-col gap-4">
              <h4 className="text-xs font-headline font-extrabold uppercase tracking-widest text-[#E94560]">
                Mes introspections passées ({journalState.deepEntries.length})
              </h4>

              {journalState.deepEntries.map((de) => (
                <div key={de.id} className="bg-[#0F0F1A] border border-[#1A1A2E] p-4 rounded-2xl flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-[#E94560]">
                    <span>PROMPT : {de.promptText}</span>
                    <span>{de.date}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed italic mt-1 bg-black/10 p-2 rounded-xl">
                    &ldquo;{de.response}&rdquo;
                  </p>
                </div>
              ))}
            </div>

          </form>

        </div>
      )}

      {/* 4.4. TAB : FUTURE LETTERS VAULT */}
      {activeTab === 'letters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Write a letter form */}
          <form onSubmit={handleLetterSubmit} className="lg:col-span-6 bg-[#111122]/60 border border-[#1A1A2E] rounded-3xl p-6 flex flex-col gap-5">
            <div className="border-b border-[#1A1A2E] pb-3">
              <span className="text-[10px] font-mono text-[#9C27B0] uppercase bg-[#9C27B0]/10 border border-[#9C27B0]/30 px-2.5 py-0.5 rounded-full font-bold">
                Protocole de Scellement Temporel
              </span>
              <h3 className="text-md font-headline font-black text-white mt-3">
                Sceller un message pour ton futur moi 🔒
              </h3>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed mt-1">
                Aide ton futur moi en lui envoyant tes ressentis actuels ou en scellant une promesse. Ce message sera bloqué jusqu'au jour de son échéance.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-headline font-bold text-slate-300">Titre de la lettre</label>
              <input
                type="text"
                placeholder="Ex: Lettre pour mon jalon de 90 jours"
                value={letterTitle}
                onChange={(e) => setLetterTitle(e.target.value)}
                className="bg-[#1C1C3A]/50 border border-[#2D2D4E] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#9C27B0]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-headline font-bold text-slate-300">Durée de verrouillage temporel</label>
              <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1 rounded-xl">
                {[15, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setLetterDays(days)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all
                      ${letterDays === days 
                        ? 'bg-[#9C27B0] text-white shadow-md' 
                        : 'text-[#8E8E93] hover:text-white'
                      }
                    `}
                  >
                    {days} Jours
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-headline font-bold text-slate-300">Corps de la lettre (Conseils, promesses, encouragements)</label>
              <textarea
                placeholder="Écris avec sincérité et générosité. Qu'as-tu besoin que le toi du futur se rappelle ?"
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                className="w-full h-64 p-3 bg-[#0F0F1A]/80 border border-[#1A1A2E] rounded-xl text-xs leading-relaxed focus:outline-none focus:border-[#9C27B0] resize-none"
              />
            </div>

            <AlphaButton
              variant="primary"
              className="py-3 bg-gradient-to-r from-[#9C27B0] to-[#E94560] border-none text-white font-headline font-extrabold cursor-pointer"
            >
              🔒 Chiffrer & Sceller la Lettre
            </AlphaButton>
          </form>

          {/* Letters List */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <span className="text-xs font-headline font-bold text-[#E94560] uppercase tracking-widest px-1">
              Coffre de mes lettres temporelles ({journalState.letters.length})
            </span>

            {journalState.letters.length === 0 ? (
              <div className="bg-[#111122]/60 border border-dashed border-[#1A1A2E] p-8 rounded-3xl text-center text-xs text-gray-500">
                Aucun message scellé dans le coffre temporel.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {journalState.letters.map((letter) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isDelivered = letter.deliverDate <= todayStr;

                  return (
                    <AlphaCard key={letter.id} variant="default" className="p-5 flex flex-col gap-3 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-headline font-extrabold text-white">
                            {letter.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#8E8E93] mt-1 block">
                            Créée le : {letter.dateCreated} • Livraison le : {letter.deliverDate}
                          </span>
                        </div>
                        
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold
                          ${isDelivered ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#9C27B0]/10 text-[#9C27B0] animate-pulse'}
                        `}>
                          {isDelivered ? '✓ DISPONIBLE' : '🔒 SCELLÉ'}
                        </span>
                      </div>

                      {isDelivered ? (
                        letter.isOpened ? (
                          <div className="bg-[#0F0F1A] border border-[#1A1A2E] p-3 rounded-xl text-xs text-gray-300 italic font-serif leading-relaxed">
                            &ldquo;{letter.content}&rdquo;
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              journalService.openLetter(letter.id);
                              setJournalState(journalService.getState());
                              addToast('success', 'Verrouillage expiré ! Lettre lue avec succès.');
                            }}
                            className="w-full py-2 bg-[#1C1C3A] hover:bg-[#9C27B0] text-xs font-headline font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            📬 Lire la lettre livrée
                          </button>
                        )
                      ) : (
                        <div className="bg-[#0F0F1A]/80 border border-[#2D1D3A] p-3 rounded-xl text-[11px] text-gray-500 italic leading-relaxed">
                          La technologie temporelle protège ce message. Rendez-vous le <strong className="text-white font-mono">{letter.deliverDate}</strong> pour décoder ce message. Reste intègre pour mériter de le lire !
                        </div>
                      )}

                    </AlphaCard>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
