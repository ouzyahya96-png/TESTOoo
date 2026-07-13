import React, { useState } from 'react';
import {
  Brain,
  Dumbbell,
  Zap,
  Target,
  Moon,
  Sun,
  Apple,
  Snowflake,
  Wind,
  Star,
  Flame,
  Shield,
  Bell,
  Check,
  Crown,
  Sparkles,
  Layers,
  Code,
  LayoutDashboard,
  CheckCircle2,
  Copy,
  ChevronRight,
  Maximize2,
  Sliders,
  Volume2,
  Award,
  BookOpen,
  Eye,
  Info,
  Timer,
  Activity,
  Network,
  MessageSquare
} from 'lucide-react';

import { AlphaButton } from './components/AlphaButton';
import { AlphaArchitecture } from './components/AlphaArchitecture';
import { AlphaCard } from './components/AlphaCard';
import { AlphaProgress } from './components/AlphaProgress';
import { AlphaInput } from './components/AlphaInput';
import { AlphaBadge } from './components/AlphaBadge';
import { AlphaAvatar } from './components/AlphaAvatar';
import { AlphaSlider } from './components/AlphaSlider';
import { AlphaChart } from './components/AlphaChart';
import { AlphaModal } from './components/AlphaModal';
import { AlphaToast } from './components/AlphaToast';
import { AlphaSkeleton } from './components/AlphaSkeleton';
import { AlphaTimer } from './components/AlphaTimer';
import { AlphaPatternKiller } from './components/AlphaPatternKiller';
import { AlphaDopamineReset } from './components/AlphaDopamineReset';
import { AlphaEducation } from './components/AlphaEducation';
import { AlphaJournal } from './components/AlphaJournal';
import { AlphaKegel } from './components/AlphaKegel';
import { progressService } from './pattern_killer/progressService';

// Import Native codes & standard codes for display
import { reactButtonCode, reactNativeButtonCode } from './components/AlphaButton';
import { reactCardCode, reactNativeCardCode } from './components/AlphaCard';
import { reactProgressCode, reactNativeProgressCode } from './components/AlphaProgress';
import { reactInputCode, reactNativeInputCode } from './components/AlphaInput';
import { reactBadgeCode, reactNativeBadgeCode } from './components/AlphaBadge';
import { reactAvatarCode, reactNativeAvatarCode } from './components/AlphaAvatar';
import { reactSliderCode, reactNativeSliderCode } from './components/AlphaSlider';
import { reactChartCode, reactNativeChartCode } from './components/AlphaChart';
import { reactModalCode, reactNativeModalCode } from './components/AlphaModal';
import { reactToastCode, reactNativeToastCode } from './components/AlphaToast';
import { reactSkeletonCode, reactNativeSkeletonCode } from './components/AlphaSkeleton';
import { reactTimerCode, reactNativeTimerCode } from './components/AlphaTimer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'playground' | 'dashboard' | 'architecture'>('tokens');
  
  // Playground State
  const [selectedCompId, setSelectedCompId] = useState<number>(1);
  const [playgroundVariant, setPlaygroundVariant] = useState<any>('primary');
  const [playgroundSize, setPlaygroundSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [playgroundDisabled, setPlaygroundDisabled] = useState<boolean>(false);
  const [playgroundLoading, setPlaygroundLoading] = useState<boolean>(false);
  const [playgroundProgressVal, setPlaygroundProgressVal] = useState<number>(65);
  const [playgroundProgressType, setPlaygroundProgressType] = useState<'linear' | 'circular'>('linear');
  const [playgroundInputValue, setPlaygroundInputValue] = useState<string>('Alpha Male');
  const [playgroundSliderValue, setPlaygroundSliderValue] = useState<number>(7);
  const [playgroundChartType, setPlaygroundChartType] = useState<'line' | 'bar' | 'radar'>('line');
  const [isPlaygroundModalOpen, setIsPlaygroundModalOpen] = useState<boolean>(false);
  const [playgroundModalType, setPlaygroundModalType] = useState<'center' | 'bottom-sheet'>('center');
  const [codeLanguageTab, setCodeLanguageTab] = useState<'react' | 'native'>('react');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Toast Management State
  interface ToastItem {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Concept App state
  const [kegelIntensity, setKegelIntensity] = useState<number>(8);
  const [dailyHydration, setDailyHydration] = useState<number>(4); // out of 8 glasses
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [kegelModalOpen, setKegelModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [relapseShake, setRelapseShake] = useState(false);

  // Dopamine Reset Protocol Integration State
  const [vitalityPoints, setVitalityPoints] = useState<number>(() => progressService.getState().totalPoints);
  const [resetStreak, setResetStreak] = useState<number>(() => progressService.getState().streak);
  const [dashboardSubTab, setDashboardSubTab] = useState<'coaching' | 'dopamine' | 'education' | 'journal'>('dopamine');

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
    addToast('success', 'Code source copié dans le presse-papiers !');
  };

  // Components Data list for playground
  const componentsList = [
    { id: 1, name: 'AlphaButton', desc: 'Bouton premium hautement interactif avec animations tactiles et états.', icon: <Sparkles className="w-4 h-4" /> },
    { id: 2, name: 'AlphaCard', desc: 'Conteneur visuel supportant des animations de survol et des retours d\'erreur (shake).', icon: <Layers className="w-4 h-4" /> },
    { id: 3, name: 'AlphaProgress', desc: 'Barres de progression linéaires ou circulaires animées avec calculs de ratio.', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 4, name: 'AlphaInput', desc: 'Champs de saisie unifiés pour textes, sélections, toggles ou sliders.', icon: <Sliders className="w-4 h-4" /> },
    { id: 5, name: 'AlphaBadge', desc: 'Pills d\'état, badges de progression ou distinctions premium.', icon: <Crown className="w-4 h-4" /> },
    { id: 6, name: 'AlphaAvatar', desc: 'Profil de l\'utilisateur entouré d\'un anneau de progression de niveau d\'expérience.', icon: <Award className="w-4 h-4" /> },
    { id: 7, name: 'AlphaChart', desc: 'Graphiques SVG ultra-fluides (lignes, barres, radar) pour l\'évolution physique.', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { id: 8, name: 'AlphaModal', desc: 'Modale centrale ou Bottom Sheet immersive de bas d\'écran.', icon: <Maximize2 className="w-4 h-4" /> },
    { id: 9, name: 'AlphaToast', desc: 'Notifications toast d\'événements avec barre de progression de temporisation.', icon: <Bell className="w-4 h-4" /> },
    { id: 10, name: 'AlphaSkeleton', desc: 'Shimmer d\'attente ultra-élégant imitant l\'architecture du contenu.', icon: <Eye className="w-4 h-4" /> },
    { id: 11, name: 'AlphaTimer', desc: 'Chronomètre, minuteur à rebours et cycles d\'entraînement fractionnés.', icon: <Timer className="w-4 h-4" /> },
    { id: 12, name: 'AlphaSlider', desc: 'Contrôle à glissière doré de haute précision pour Kegel et intensité sonore.', icon: <Sliders className="w-4 h-4" /> },
  ];

  const getPlaygroundCodes = (compName: string) => {
    switch (compName) {
      case 'AlphaButton': return { react: reactButtonCode, native: reactNativeButtonCode };
      case 'AlphaCard': return { react: reactCardCode, native: reactNativeCardCode };
      case 'AlphaProgress': return { react: reactProgressCode, native: reactNativeProgressCode };
      case 'AlphaInput': return { react: reactInputCode, native: reactNativeInputCode };
      case 'AlphaBadge': return { react: reactBadgeCode, native: reactNativeBadgeCode };
      case 'AlphaAvatar': return { react: reactAvatarCode, native: reactNativeAvatarCode };
      case 'AlphaSlider': return { react: reactSliderCode, native: reactNativeSliderCode };
      case 'AlphaChart': return { react: reactChartCode, native: reactNativeChartCode };
      case 'AlphaModal': return { react: reactModalCode, native: reactNativeModalCode };
      case 'AlphaToast': return { react: reactToastCode, native: reactNativeToastCode };
      case 'AlphaSkeleton': return { react: reactSkeletonCode, native: reactNativeSkeletonCode };
      case 'AlphaTimer': return { react: reactTimerCode, native: reactNativeTimerCode };
      default: return { react: '', native: '' };
    }
  };

  const selectedComp = componentsList.find(c => c.id === selectedCompId) || componentsList[0];
  const playgroundCode = getPlaygroundCodes(selectedComp.name);

  // Trigger relapse shake
  const handleRelapseTrigger = () => {
    setRelapseShake(true);
    addToast('error', 'Alerte Relapse détectée ! Restez focus, soldat.');
    setTimeout(() => setRelapseShake(false), 600);
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col font-body selection:bg-[#E94560]/40">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur-md border-b border-[#1A1A2E] px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E94560] via-[#1A1A2E] to-[#FFD700] p-[2px] flex items-center justify-center shadow-[0_0_20px_rgba(233,69,96,0.3)]">
              <div className="w-full h-full rounded-xl bg-[#0F0F1A] flex items-center justify-center font-headline font-extrabold text-sm text-[#E94560] tracking-tighter">
                AM
              </div>
            </div>
            <div>
              <h1 className="font-headline font-extrabold text-xl tracking-wider text-white">
                ALPHA MAN <span className="text-xs text-[#E94560] font-mono border border-[#E94560]/30 px-1.5 py-0.5 rounded ml-1 bg-[#E94560]/10">DESIGN SYSTEM</span>
              </h1>
              <p className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest mt-0.5">
                Wellness Masculin de Niveau Mondial • 100% Dark Mode
              </p>
            </div>
          </div>

          {/* Navigation Toggles */}
          <div className="flex bg-[#16213E]/60 p-1 rounded-xl border border-[#1A1A2E]">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                ${activeTab === 'tokens' ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
              `}
            >
              <Sparkles className="w-4 h-4" />
              <span>Tokens</span>
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                ${activeTab === 'playground' ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
              `}
            >
              <Code className="w-4 h-4" />
              <span>Laboratoire</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                ${activeTab === 'dashboard' ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
              `}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Concept App</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                ${activeTab === 'architecture' ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
              `}
            >
              <Network className="w-4 h-4" />
              <span>Architecture</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8 pb-24">
        
        {/* ==================== 1. TOKENS TAB ==================== */}
        {activeTab === 'tokens' && (
          <div className="flex flex-col gap-8 animate-[fade-in_0.3s_ease-out]">
            <div className="p-6 bg-gradient-to-r from-[#16213E] to-[#1A1A2E] rounded-3xl border border-[#E94560]/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-headline font-bold uppercase tracking-widest">
                  Fidélité Absolue
                </span>
                <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-white mt-3 tracking-wide">
                  Des Fondations Rigoureuses pour le Leader Moderne
                </h2>
                <p className="text-sm text-[#8E8E93] mt-2 leading-relaxed">
                  L'ADN d'ALPHA MAN réside dans le contraste tranché entre le noir absolu du combat (<strong className="text-white">#0F0F1A</strong>), le rouge de l'urgence (<strong className="text-white">#E94560</strong>) et l'or de la récompense (<strong className="text-white">#FFD700</strong>). Pas de faux-semblant, pas de blanc pur fatiguant pour l'œil : l'immersion est totale.
                </p>
              </div>
              <div className="flex gap-4">
                <AlphaButton variant="secondary" onClick={() => setActiveTab('playground')}>
                  Entrer dans le Lab Components
                </AlphaButton>
              </div>
            </div>

            {/* Visual Tokens Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Palette Couleurs */}
              <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E94560] animate-ping" />
                  <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">Palette de Couleurs</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Primary (Deep Navy)', hex: '#1A1A2E', desc: 'Confiance, profondeur, structure interne', textColor: 'text-white' },
                    { name: 'Secondary (Alpha Red)', hex: '#E94560', desc: 'Énergie, action radicale, urgence vitale', textColor: 'text-white' },
                    { name: 'Accent (Gold Premium)', hex: '#FFD700', desc: 'Récompense, excellence, élite', textColor: 'text-black' },
                    { name: 'Background (Dark Void)', hex: '#0F0F1A', desc: 'Focus absolu, immunité visuelle nocturne', textColor: 'text-white' },
                    { name: 'Surface (Elevated)', hex: '#16213E', desc: 'Cartes, widgets, hiérarchie de profondeur', textColor: 'text-white' },
                    { name: 'Success (Growth Green)', hex: '#00D9A5', desc: 'Progression, virilité positive, kegel validé', textColor: 'text-black' },
                    { name: 'Error (Relapse Red)', hex: '#FF2D55', desc: 'Alerte, relâchement, relapse instantanée', textColor: 'text-white' },
                  ].map((color, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#0F0F1A]/50 border border-[#16213E]">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg border border-white/10 shrink-0" 
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="text-xs font-headline font-bold text-white">{color.name}</p>
                          <p className="text-[10px] text-[#8E8E93]">{color.desc}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#8E8E93] bg-[#16213E] px-2 py-1 rounded">
                        {color.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </AlphaCard>

              {/* Typographie & Grid */}
              <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3">
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">Typographies & Grid</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {/* Font pairing */}
                  <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                    <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Headline Font</span>
                    <p className="font-headline font-extrabold text-2xl text-white">Montserrat Bold</p>
                    <p className="text-xs text-[#8E8E93]">Pour les titres de défi, statuts majeurs et marques de prestige.</p>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                    <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Body Font</span>
                    <p className="font-body font-medium text-sm text-white">Inter Regular & Medium</p>
                    <p className="text-xs text-[#8E8E93]">Optimisé pour une lisibilité maximale à toutes les échelles.</p>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                    <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Data / Numbers</span>
                    <p className="font-mono font-bold text-2xl text-[#FFD700]">Roboto Mono (48px, 36px)</p>
                    <p className="text-xs text-[#8E8E93]">Pour l'affichage de chronomètres, scores et séries (streak).</p>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                    <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Langues Arabes Future</span>
                    <p className="font-headline text-lg text-[#00D9A5]" style={{ fontFamily: 'Noto Sans Arabic' }}>
                      الفا مان - Noto Sans Arabic
                    </p>
                    <p className="text-xs text-[#8E8E93]">Prêt pour la mondialisation du wellness masculin.</p>
                  </div>
                </div>
              </AlphaCard>

              {/* Spacings & Shadows */}
              <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">Spacings, Radius & Shadows</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {/* Grid 8px visualization */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Grille d'espacement (8px Grid)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'xs', val: '4px' },
                        { name: 'sm', val: '8px' },
                        { name: 'md', val: '16px' },
                        { name: 'lg', val: '24px' },
                      ].map((sp, idx) => (
                        <div key={idx} className="flex flex-col items-center bg-[#0F0F1A] border border-[#16213E] p-2 rounded-lg">
                          <span className="text-[10px] font-mono font-bold text-white">{sp.name}</span>
                          <span className="text-[9px] text-[#8E8E93]">{sp.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radiuses */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Radius Systèmes</span>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between p-2 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                        <span className="text-[#8E8E93]">Cartes / Widgets</span>
                        <span className="font-mono font-bold text-white">16px</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                        <span className="text-[#8E8E93]">Boutons (Primary)</span>
                        <span className="font-mono font-bold text-white">12px</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#0F0F1A]/40 rounded-xl border border-[#16213E]">
                        <span className="text-[#8E8E93]">Champs de Saisie</span>
                        <span className="font-mono font-bold text-white">12px</span>
                      </div>
                    </div>
                  </div>

                  {/* Shadows and Glows */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-[#8E8E93] font-headline uppercase tracking-widest font-extrabold">Glows & Ombres Spécifiées</span>
                    <div className="flex flex-col gap-2">
                      <div className="h-8 rounded-xl bg-[#16213E] flex items-center justify-center text-xs shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                        Level 1 Shadow (2px offset)
                      </div>
                      <div className="h-8 rounded-xl bg-[#16213E] flex items-center justify-center text-xs shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                        Level 2 Shadow (4px offset)
                      </div>
                      <div className="h-8 rounded-xl bg-[#16213E] flex items-center justify-center text-xs shadow-[0_0_20px_rgba(0,217,165,0.35)]">
                        Glow Success Green
                      </div>
                    </div>
                  </div>
                </div>
              </AlphaCard>
            </div>

            {/* Icons Inventory */}
            <AlphaCard variant="default" className="p-6">
              <div className="flex items-center gap-2 border-b border-[#1A1A2E] pb-3 mb-4">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <h3 className="font-headline font-bold text-md uppercase tracking-wider text-white">
                  Identité Iconographique (Line, 2px stroke, rounded caps)
                </h3>
              </div>
              <p className="text-xs text-[#8E8E93] mb-6 leading-relaxed">
                Chaque module d'ALPHA MAN possède son propre symbole de force. Ces icônes constituent les repères visuels pour l'activation neuronale et physique.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { icon: <Brain className="w-6 h-6" />, name: 'Mind / Cerveau', color: 'text-blue-400' },
                  { icon: <Dumbbell className="w-6 h-6" />, name: 'Body / Muscle', color: 'text-red-400' },
                  { icon: <Zap className="w-6 h-6 text-[#E94560]" />, name: 'Energy / Vitalité', color: 'text-amber-400' },
                  { icon: <Target className="w-6 h-6 text-[#E94560]" />, name: 'Kegel / Focus', color: 'text-[#E94560]' },
                  { icon: <Moon className="w-6 h-6 text-purple-400" />, name: 'Sleep / Sommeil', color: 'text-purple-400' },
                  { icon: <Sun className="w-6 h-6 text-yellow-400" />, name: 'Sun / Rythme', color: 'text-yellow-400' },
                  { icon: <Apple className="w-6 h-6 text-[#00D9A5]" />, name: 'Nutrition / Pomme', color: 'text-emerald-400' },
                  { icon: <Snowflake className="w-6 h-6 text-sky-400" />, name: 'Cold / Douche froide', color: 'text-sky-400' },
                  { icon: <Wind className="w-6 h-6" />, name: 'Breath / Respiration', color: 'text-teal-400' },
                  { icon: <Star className="w-6 h-6 text-[#FFD700]" />, name: 'Points / Score', color: 'text-[#FFD700]' },
                  { icon: <Flame className="w-6 h-6 text-orange-500 fill-current" />, name: 'Streak / Série', color: 'text-orange-500' },
                  { icon: <Shield className="w-6 h-6 text-[#FFD700] fill-current" />, name: 'Clan / Fraternité', color: 'text-yellow-500' },
                  { icon: <Bell className="w-6 h-6 text-orange-400" />, name: 'Alert / Rappels', color: 'text-orange-400' },
                  { icon: <Check className="w-6 h-6 text-[#00D9A5]" />, name: 'Success / Progrès', color: 'text-[#00D9A5]' },
                  { icon: <Crown className="w-6 h-6 text-[#FFD700] fill-current" />, name: 'Premium / Crown', color: 'text-[#FFD700]' },
                ].map((ic, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-4 bg-[#0F0F1A] border border-[#16213E] rounded-2xl hover:border-[#E94560]/30 transition-all duration-200">
                    <div className="mb-2 p-2 bg-[#16213E] rounded-xl">
                      {ic.icon}
                    </div>
                    <span className="text-xs font-headline font-bold text-white text-center">{ic.name.split('/')[0]}</span>
                    <span className="text-[9px] text-[#5A5A5A] font-mono mt-1 text-center">{ic.name.split('/')[1]}</span>
                  </div>
                ))}
              </div>
            </AlphaCard>
          </div>
        )}

        {/* ==================== 2. COMPONENT LAB PLAYGROUND TAB ==================== */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-[fade-in_0.3s_ease-out]">
            
            {/* Sidebar list of 12 components */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="p-4 bg-[#16213E]/50 border border-[#1A1A2E] rounded-2xl mb-2">
                <h3 className="font-headline font-extrabold text-sm uppercase tracking-wider text-white">
                  12 Composants du Design System
                </h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Sélectionnez un composant pour tester ses variables, ses états et copier son code.
                </p>
              </div>
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[600px] pr-1">
                {componentsList.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompId(comp.id);
                      // Set logical variants matching the component
                      if (comp.name === 'AlphaButton') setPlaygroundVariant('primary');
                      if (comp.name === 'AlphaCard') setPlaygroundVariant('default');
                      if (comp.name === 'AlphaBadge') setPlaygroundVariant('level');
                      if (comp.name === 'AlphaChart') setPlaygroundChartType('line');
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-left font-headline font-bold text-xs transition-all duration-200 cursor-pointer border
                      ${selectedCompId === comp.id 
                        ? 'bg-[#E94560]/10 border-[#E94560] text-white' 
                        : 'bg-[#16213E]/40 border-transparent text-[#8E8E93] hover:text-white hover:bg-[#16213E]/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`${selectedCompId === comp.id ? 'text-[#E94560]' : 'text-[#8E8E93]'}`}>
                        {comp.icon}
                      </span>
                      <span>{comp.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${selectedCompId === comp.id ? 'translate-x-1 text-[#E94560]' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Preview & Code Panel */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Live Render Area */}
              <div className="p-6 bg-[#16213E]/40 border border-[#1A1A2E] rounded-3xl flex flex-col gap-6">
                <div className="flex justify-between items-start border-b border-[#1A1A2E] pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#E94560] font-bold uppercase tracking-widest bg-[#E94560]/10 px-2 py-0.5 rounded">
                      Composant {selectedComp.id} sur 12
                    </span>
                    <h2 className="font-headline font-extrabold text-2xl text-white mt-1">
                      {selectedComp.name}
                    </h2>
                    <p className="text-xs text-[#8E8E93] mt-1">
                      {selectedComp.desc}
                    </p>
                  </div>
                </div>

                {/* Core Live Preview Playground Box */}
                <div className="min-h-[200px] bg-[#0F0F1A] border border-[#1A1A2E]/50 rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  
                  {/* Subtle Grid Indicator background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#16213E_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

                  {/* Component Renderers */}
                  <div className="w-full max-w-sm flex flex-col items-center justify-center relative z-10 gap-4">
                    
                    {/* 1. Button Renderer */}
                    {selectedComp.name === 'AlphaButton' && (
                      <AlphaButton
                        variant={playgroundVariant}
                        size={playgroundSize}
                        disabled={playgroundDisabled}
                        loading={playgroundLoading}
                        onClick={() => addToast('success', 'Bouton cliqué avec succès !')}
                      >
                        {playgroundVariant === 'gold' && <Crown className="w-4 h-4 fill-current mr-1" />}
                        {playgroundVariant === 'danger' && <Flame className="w-4 h-4 fill-current mr-1" />}
                        <span>Combattre</span>
                      </AlphaButton>
                    )}

                    {/* 2. Card Renderer */}
                    {selectedComp.name === 'AlphaCard' && (
                      <AlphaCard
                        variant={playgroundVariant}
                        isHoverable={true}
                        animateShake={playgroundDisabled}
                        className="p-6 w-full text-center"
                        onClick={() => addToast('info', 'Carte cliquée !')}
                      >
                        <h4 className="font-headline font-bold text-white uppercase text-sm mb-2">Carte {playgroundVariant}</h4>
                        <p className="text-xs text-[#8E8E93] leading-relaxed">
                          Faites l'expérience du survol ou déclenchez l'état shake d'alerte en cochant l'état "Secouer" dans les contrôles.
                        </p>
                      </AlphaCard>
                    )}

                    {/* 3. Progress Renderer */}
                    {selectedComp.name === 'AlphaProgress' && (
                      <AlphaProgress
                        value={playgroundProgressVal}
                        type={playgroundProgressType}
                        size={playgroundSize}
                        color={playgroundVariant === 'primary' ? 'secondary' : playgroundVariant}
                        label="KPI Énergie"
                      />
                    )}

                    {/* 4. Input Renderer */}
                    {selectedComp.name === 'AlphaInput' && (
                      <AlphaInput
                        type={playgroundVariant === 'primary' ? 'text' : playgroundVariant === 'secondary' ? 'number' : 'text'}
                        label="Saisie Lab"
                        value={playgroundInputValue}
                        onChange={(val) => setPlaygroundInputValue(val)}
                        placeholder="Tapez quelque chose..."
                        error={playgroundDisabled ? "Alerte de format incorrect" : undefined}
                      />
                    )}

                    {/* 5. Badge Renderer */}
                    {selectedComp.name === 'AlphaBadge' && (
                      <AlphaBadge
                        variant={playgroundVariant}
                        label={
                          playgroundVariant === 'level' ? 'Alpha Level 42' :
                          playgroundVariant === 'streak' ? '15 JOURS DE SÉRIE' :
                          playgroundVariant === 'status' ? 'VITALITÉ 98%' : 'PREMIUM GOLD'
                        }
                      />
                    )}

                    {/* 6. Avatar Renderer */}
                    {selectedComp.name === 'AlphaAvatar' && (
                      <AlphaAvatar
                        level={42}
                        size={playgroundSize}
                        showLevel={!playgroundDisabled}
                      />
                    )}

                    {/* 7. Chart Renderer */}
                    {selectedComp.name === 'AlphaChart' && (
                      <AlphaChart
                        type={playgroundChartType}
                        data={[
                          { label: 'LUN', value: 30, value2: 12 },
                          { label: 'MAR', value: 45, value2: 24 },
                          { label: 'MER', value: 85, value2: 15 },
                          { label: 'JEU', value: 60, value2: 30 },
                          { label: 'VEN', value: 95, value2: 40 },
                          { label: 'SAM', value: 70, value2: 45 },
                          { label: 'DIM', value: 110, value2: 60 },
                        ]}
                        height={180}
                        className="w-full"
                      />
                    )}

                    {/* 8. Modal Renderer */}
                    {selectedComp.name === 'AlphaModal' && (
                      <div className="flex flex-col gap-3 items-center">
                        <AlphaButton 
                          variant="secondary" 
                          onClick={() => setIsPlaygroundModalOpen(true)}
                        >
                          Ouvrir la modale
                        </AlphaButton>
                        <span className="text-[10px] text-[#8E8E93] font-mono">
                          Type choisi : {playgroundModalType}
                        </span>

                        <AlphaModal
                          isOpen={isPlaygroundModalOpen}
                          onClose={() => setIsPlaygroundModalOpen(false)}
                          type={playgroundModalType}
                          title="Entraînement ALPHA"
                        >
                          <div className="flex flex-col gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#E94560]/10 flex items-center justify-center mx-auto text-[#E94560]">
                              <Target className="w-8 h-8" />
                            </div>
                            <div>
                              <h4 className="font-headline font-bold text-white uppercase text-sm">Prêt pour votre session Kegel ?</h4>
                              <p className="text-xs text-[#8E8E93] mt-2">
                                Cette session augmentera votre focus, votre énergie masculine et votre score d'endurance de +15 points.
                              </p>
                            </div>
                            <div className="flex gap-3 justify-center mt-2">
                              <AlphaButton variant="ghost" onClick={() => setIsPlaygroundModalOpen(false)}>Annuler</AlphaButton>
                              <AlphaButton variant="secondary" onClick={() => {
                                setIsPlaygroundModalOpen(false);
                                addToast('success', 'Session Kegel démarrée avec succès !');
                              }}>Commencer</AlphaButton>
                            </div>
                          </div>
                        </AlphaModal>
                      </div>
                    )}

                    {/* 9. Toast Renderer */}
                    {selectedComp.name === 'AlphaToast' && (
                      <div className="flex flex-col gap-2 w-full">
                        <p className="text-xs text-[#8E8E93] text-center mb-2">Cliquez pour tester les différents types de Toasts interactifs :</p>
                        <div className="grid grid-cols-2 gap-2">
                          <AlphaButton variant="primary" size="sm" onClick={() => addToast('success', 'Force physique augmentée ! +12 points.')}>Success</AlphaButton>
                          <AlphaButton variant="danger" size="sm" onClick={() => addToast('error', 'Alerte : Ne perdez pas votre streak !')}>Error</AlphaButton>
                          <AlphaButton variant="ghost" size="sm" className="border border-[#FF9500]/30" onClick={() => addToast('warning', 'Alerte : Fréquence cardiaque élevée détectée.')}>Warning</AlphaButton>
                          <AlphaButton variant="gold" size="sm" onClick={() => addToast('info', 'Le Clan ALPHA vous propose un nouveau défi.')}>Premium Info</AlphaButton>
                        </div>
                      </div>
                    )}

                    {/* 10. Skeleton Renderer */}
                    {selectedComp.name === 'AlphaSkeleton' && (
                      <div className="w-full flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <AlphaSkeleton variant="circle" height={48} width={48} />
                          <div className="flex-1 flex flex-col gap-1.5">
                            <AlphaSkeleton variant="text" width="60%" height={16} />
                            <AlphaSkeleton variant="text" width="40%" height={12} />
                          </div>
                        </div>
                        <AlphaSkeleton variant="rectangle" height={80} className="w-full mt-2" />
                      </div>
                    )}

                    {/* 11. Timer Renderer */}
                    {selectedComp.name === 'AlphaTimer' && (
                      <AlphaTimer
                        type={playgroundVariant === 'primary' ? 'countdown' : playgroundVariant === 'secondary' ? 'stopwatch' : 'interval'}
                        initialSeconds={45}
                        className="w-full"
                        onComplete={() => addToast('success', 'Minuteur terminé ! Félicitations.')}
                      />
                    )}

                    {/* 12. Slider Renderer */}
                    {selectedComp.name === 'AlphaSlider' && (
                      <AlphaSlider
                        value={playgroundSliderValue}
                        min={1}
                        max={10}
                        onChange={(val) => setPlaygroundSliderValue(val)}
                        label="Intensité Kegel Coach"
                        icon={<Target className="w-4 h-4" />}
                        className="w-full"
                      />
                    )}

                  </div>
                </div>

                {/* Control Toggles inside Lab */}
                <div className="bg-[#0F0F1A]/60 p-4 rounded-2xl border border-[#1A1A2E]/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  
                  {/* Variant Controller */}
                  {['AlphaButton', 'AlphaCard', 'AlphaProgress', 'AlphaInput', 'AlphaBadge'].includes(selectedComp.name) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Variante / Type</span>
                      <select
                        value={playgroundVariant}
                        onChange={(e) => setPlaygroundVariant(e.target.value)}
                        className="p-2 bg-[#16213E] border border-[#1A1A2E] rounded-lg text-white font-medium"
                      >
                        {selectedComp.name === 'AlphaButton' && (
                          <>
                            <option value="primary">Primary (Navy)</option>
                            <option value="secondary">Secondary (Crimson)</option>
                            <option value="ghost">Ghost (Slate)</option>
                            <option value="danger">Danger (Red)</option>
                            <option value="gold">Gold (Elite)</option>
                          </>
                        )}
                        {selectedComp.name === 'AlphaCard' && (
                          <>
                            <option value="default">Default</option>
                            <option value="elevated">Elevated</option>
                            <option value="alert">Alert</option>
                            <option value="success">Success</option>
                            <option value="premium">Premium</option>
                          </>
                        )}
                        {selectedComp.name === 'AlphaProgress' && (
                          <>
                            <option value="secondary">Secondary (Alpha Red)</option>
                            <option value="success">Success (Green)</option>
                            <option value="accent">Accent (Gold)</option>
                            <option value="error">Error (Danger Red)</option>
                          </>
                        )}
                        {selectedComp.name === 'AlphaInput' && (
                          <>
                            <option value="primary">Saisie de texte</option>
                            <option value="secondary">Saisie numérique</option>
                          </>
                        )}
                        {selectedComp.name === 'AlphaBadge' && (
                          <>
                            <option value="level">Level badge</option>
                            <option value="streak">Streak badge</option>
                            <option value="status">Status badge</option>
                            <option value="premium">Premium Badge</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Size Controller */}
                  {['AlphaButton', 'AlphaProgress', 'AlphaAvatar'].includes(selectedComp.name) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Taille</span>
                      <div className="flex bg-[#16213E] border border-[#1A1A2E] p-1 rounded-lg">
                        {['sm', 'md', 'lg'].map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setPlaygroundSize(sz as any)}
                            className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer
                              ${playgroundSize === sz ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                            `}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disabled / Secouer state */}
                  {['AlphaButton', 'AlphaCard', 'AlphaInput', 'AlphaAvatar'].includes(selectedComp.name) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">
                        {selectedComp.name === 'AlphaCard' ? 'Alerte Secouer' : 'Désactivé'}
                      </span>
                      <button
                        onClick={() => setPlaygroundDisabled(!playgroundDisabled)}
                        className={`p-2 rounded-lg text-center font-bold border transition-all cursor-pointer
                          ${playgroundDisabled 
                            ? 'bg-[#FF2D55]/20 border-[#FF2D55] text-[#FF2D55]' 
                            : 'bg-[#16213E] border-[#1A1A2E] text-[#8E8E93] hover:text-white'
                          }
                        `}
                      >
                        {playgroundDisabled ? 'Activé (Alerte)' : 'Désactivé'}
                      </button>
                    </div>
                  )}

                  {/* Loading state for Button */}
                  {selectedComp.name === 'AlphaButton' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Chargement</span>
                      <button
                        onClick={() => setPlaygroundLoading(!playgroundLoading)}
                        className={`p-2 rounded-lg text-center font-bold border transition-all cursor-pointer
                          ${playgroundLoading 
                            ? 'bg-[#00D9A5]/20 border-[#00D9A5] text-[#00D9A5]' 
                            : 'bg-[#16213E] border-[#1A1A2E] text-[#8E8E93] hover:text-white'
                          }
                        `}
                      >
                        {playgroundLoading ? 'Chargement...' : 'Normal'}
                      </button>
                    </div>
                  )}

                  {/* Progress value editor */}
                  {selectedComp.name === 'AlphaProgress' && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Type de barre</span>
                        <div className="flex bg-[#16213E] border border-[#1A1A2E] p-1 rounded-lg">
                          {[
                            { label: 'Linéaire', val: 'linear' },
                            { label: 'Circulaire', val: 'circular' },
                          ].map((t) => (
                            <button
                              key={t.val}
                              onClick={() => setPlaygroundProgressType(t.val as any)}
                              className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer
                                ${playgroundProgressType === t.val ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                              `}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Valeur ({playgroundProgressVal}%)</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={playgroundProgressVal}
                          onChange={(e) => setPlaygroundProgressVal(Number(e.target.value))}
                          className="w-full mt-2 accent-[#E94560]"
                        />
                      </div>
                    </>
                  )}

                  {/* Chart type selection */}
                  {selectedComp.name === 'AlphaChart' && (
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Type de graphique</span>
                      <div className="flex bg-[#16213E] border border-[#1A1A2E] p-1 rounded-lg">
                        {[
                          { label: 'Ligne (Glow)', val: 'line' },
                          { label: 'Bâtons (Bar)', val: 'bar' },
                          { label: 'Radar (Force)', val: 'radar' },
                        ].map((c) => (
                          <button
                            key={c.val}
                            onClick={() => setPlaygroundChartType(c.val as any)}
                            className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer
                              ${playgroundChartType === c.val ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                            `}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modal type controller */}
                  {selectedComp.name === 'AlphaModal' && (
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Style de Modale</span>
                      <div className="flex bg-[#16213E] border border-[#1A1A2E] p-1 rounded-lg">
                        {[
                          { label: 'Modale Centrale', val: 'center' },
                          { label: 'Bottom Sheet (Mobile First)', val: 'bottom-sheet' },
                        ].map((md) => (
                          <button
                            key={md.val}
                            onClick={() => setPlaygroundModalType(md.val as any)}
                            className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer
                              ${playgroundModalType === md.val ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                            `}
                          >
                            {md.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timer types controller */}
                  {selectedComp.name === 'AlphaTimer' && (
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <span className="font-headline font-bold text-[#8E8E93] uppercase tracking-wider text-[10px]">Type de Chronomètre</span>
                      <div className="flex bg-[#16213E] border border-[#1A1A2E] p-1 rounded-lg">
                        {[
                          { label: 'Minuteur', val: 'primary' },
                          { label: 'Chronomètre', val: 'secondary' },
                          { label: 'Entraînement Fractionné', val: 'ghost' },
                        ].map((md) => (
                          <button
                            key={md.val}
                            onClick={() => setPlaygroundVariant(md.val)}
                            className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer
                              ${playgroundVariant === md.val ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                            `}
                          >
                            {md.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Source Code Visualizer */}
              <div className="bg-[#16213E]/40 border border-[#1A1A2E] rounded-3xl overflow-hidden flex flex-col">
                <div className="bg-[#16213E]/80 px-6 py-4 border-b border-[#1A1A2E] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-white">
                      Code Source Réutilisable
                    </h3>
                  </div>

                  {/* Language Selector */}
                  <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1 rounded-xl">
                    <button
                      onClick={() => setCodeLanguageTab('react')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-extrabold uppercase tracking-widest transition-colors cursor-pointer
                        ${codeLanguageTab === 'react' ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                      `}
                    >
                      React TSX (Web)
                    </button>
                    <button
                      onClick={() => setCodeLanguageTab('native')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-extrabold uppercase tracking-widest transition-colors cursor-pointer
                        ${codeLanguageTab === 'native' ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                      `}
                    >
                      React Native (Mobile)
                    </button>
                  </div>
                </div>

                {/* Code display window */}
                <div className="p-6 bg-[#0F0F1A] relative group">
                  <button
                    onClick={() => handleCopyCode(codeLanguageTab === 'react' ? playgroundCode.react : playgroundCode.native, selectedComp.name)}
                    className="absolute right-6 top-6 p-2 bg-[#16213E] border border-[#1A1A2E] text-[#8E8E93] hover:text-white hover:border-[#FFD700]/40 rounded-xl transition-all cursor-pointer opacity-80 group-hover:opacity-100 flex items-center gap-2"
                    title="Copier le code"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {copiedText === selectedComp.name ? 'Copié !' : 'Copier'}
                    </span>
                  </button>
                  <pre className="text-xs font-mono text-[#8E8E93] overflow-x-auto max-h-[400px] leading-relaxed p-2">
                    <code>{codeLanguageTab === 'react' ? playgroundCode.react : playgroundCode.native}</code>
                  </pre>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 3. CONCEPT SHOWCASE APP TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8 animate-[fade-in_0.3s_ease-out]">
            
            {/* Concept App Header with Streak Flame, Avatar level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gradient-to-r from-[#16213E]/80 to-[#1A1A2E]/80 p-6 rounded-3xl border border-[#E94560]/10">
              
              {/* User overview */}
              <div className="flex items-center gap-4">
                <AlphaAvatar level={42} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-extrabold text-lg text-white">SÉBASTIEN K.</h3>
                    <AlphaBadge variant="premium" label="VIP" />
                  </div>
                  <p className="text-xs text-[#8E8E93] mt-1">Niveau guerrier spirituel de classe S</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#00D9A5]" />
                    <span className="text-[10px] font-headline font-bold text-[#00D9A5] uppercase tracking-wider">Statut : Optimal</span>
                  </div>
                </div>
              </div>

              {/* Badges and Streak counters */}
              <div className="flex flex-wrap gap-2.5 justify-start md:justify-center">
                <AlphaBadge variant="streak" label={`${resetStreak} ${resetStreak > 1 ? 'Jours Consécutifs' : 'Jour Consécutif'}`} />
                <AlphaBadge variant="level" label={`Points : ${vitalityPoints.toLocaleString()}`} />
                <span className="inline-flex items-center gap-1 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded-full px-2.5 py-1 text-[10px] font-headline font-bold uppercase tracking-widest animate-pulse">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  ALPHA CLAN ELITE
                </span>
              </div>

              {/* Action commands */}
              <div className="flex justify-start md:justify-end gap-3">
                <AlphaButton variant="ghost" size="sm" onClick={() => setPremiumModalOpen(true)}>
                  Boutique
                </AlphaButton>
                <AlphaButton variant="secondary" size="sm" onClick={() => setKegelModalOpen(true)}>
                  <Target className="w-4 h-4" />
                  Kegel Coach
                </AlphaButton>
              </div>
            </div>

            {/* SUB TAB SELECTOR FOR THE SHOWCASE APP */}
            <div className="flex flex-wrap md:flex-nowrap bg-[#0F0F1A] border border-[#1A1A2E] p-1.5 rounded-2xl w-full max-w-2xl mx-auto md:mx-0 gap-1">
              <button
                onClick={() => setDashboardSubTab('dopamine')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[11px] font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                  ${dashboardSubTab === 'dopamine'
                    ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
                    : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
                  }
                `}
              >
                <Brain className="w-4 h-4" />
                Dopamine Reset (90j)
              </button>
              <button
                onClick={() => setDashboardSubTab('education')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[11px] font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                  ${dashboardSubTab === 'education'
                    ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
                    : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
                  }
                `}
              >
                <BookOpen className="w-4 h-4" />
                Éducation Cérébrale (40)
              </button>
              <button
                onClick={() => setDashboardSubTab('journal')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[11px] font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                  ${dashboardSubTab === 'journal'
                    ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
                    : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4" />
                Journaling & Track
              </button>
              <button
                onClick={() => setDashboardSubTab('coaching')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[11px] font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                  ${dashboardSubTab === 'coaching'
                    ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
                    : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
                  }
                `}
              >
                <Zap className="w-4 h-4" />
                Coach Kegel & Physique
              </button>
            </div>

            {dashboardSubTab === 'dopamine' ? (
              <AlphaDopamineReset addToast={addToast} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
            ) : dashboardSubTab === 'education' ? (
              <AlphaEducation addToast={addToast} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
            ) : dashboardSubTab === 'journal' ? (
              <AlphaJournal addToast={addToast} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
            ) : dashboardSubTab === 'coaching' ? (
              <AlphaKegel addToast={addToast} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
            ) : (
              <>
                {/* Quick stats grid using components */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Mind focus level card */}
              <AlphaCard variant="default" className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center select-none">
                  <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Mind & Focus</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Brain className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-mono text-3xl font-extrabold text-white">92%</h4>
                  <p className="text-[10px] text-[#8E8E93] mt-1">Onde cérébrale Alpha dominante</p>
                </div>
                <AlphaProgress value={92} color="success" size="sm" showLabel={false} />
              </AlphaCard>

              {/* Physical energy metric card */}
              <AlphaCard variant="default" className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center select-none">
                  <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Énergie Physique</span>
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[#E94560]">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-mono text-3xl font-extrabold text-white">85%</h4>
                  <p className="text-[10px] text-[#8E8E93] mt-1">Taux de testostérone estimé optimal</p>
                </div>
                <AlphaProgress value={85} color="secondary" size="sm" showLabel={false} />
              </AlphaCard>

              {/* Kegel tone tracker */}
              <AlphaCard variant="default" className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center select-none">
                  <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Contrôle Kegel (PC)</span>
                  <div className="w-8 h-8 rounded-lg bg-[#00D9A5]/10 flex items-center justify-center text-[#00D9A5]">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-mono text-3xl font-extrabold text-[#FFD700]">LVL 8</h4>
                  <p className="text-[10px] text-[#8E8E93] mt-1">Force contractile : Très Élevée</p>
                </div>
                <AlphaProgress value={80} color="accent" size="sm" showLabel={false} />
              </AlphaCard>

              {/* Sleep recovery efficiency */}
              <AlphaCard variant="default" className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center select-none">
                  <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Sommeil Profond</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Moon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-mono text-3xl font-extrabold text-white">7.8 hrs</h4>
                  <p className="text-[10px] text-[#8E8E93] mt-1">Restauration hormonale complète</p>
                </div>
                <AlphaProgress value={97} color="success" size="sm" showLabel={false} />
              </AlphaCard>
            </div>

            {/* Main Interactive Coaching Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Kegel & Breath interactive laboratory dashboard module */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Active workout center */}
                <AlphaCard variant="elevated" className={`p-6 flex flex-col gap-6 ${relapseShake ? 'shake-animation' : ''}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1A1A2E] pb-4 gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2.5 py-0.5 rounded-full">
                        Entraîneur Intelligent
                      </span>
                      <h3 className="font-headline font-extrabold text-xl text-white mt-1">
                        Session PC-Muscle / Kegel Active
                      </h3>
                      <p className="text-xs text-[#8E8E93]">
                        Tonifiez votre musculature interne pour augmenter l'énergie vitale et l'endurance.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <AlphaButton variant="ghost" size="sm" onClick={handleRelapseTrigger}>
                        Alerte Relapse
                      </AlphaButton>
                      <AlphaButton variant="secondary" size="sm" onClick={() => setKegelModalOpen(true)}>
                        <Timer className="w-4 h-4" />
                        Chronométrer
                      </AlphaButton>
                    </div>
                  </div>

                  {/* Active trainer grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* PC-Muscle active slider and status */}
                    <div className="flex flex-col gap-4">
                      <AlphaSlider
                        value={kegelIntensity}
                        min={1}
                        max={10}
                        onChange={(val) => setKegelIntensity(val)}
                        label="Intensité d'impulsion"
                        icon={<Target className="w-4.5 h-4.5" />}
                      />

                      <div className="bg-[#0F0F1A] border border-[#1A1A2E] p-4 rounded-2xl">
                        <div className="flex justify-between text-xs font-headline mb-2">
                          <span className="text-[#8E8E93]">STATUT CONTRACTILE</span>
                          <span className="text-[#00D9A5] font-bold">STABLE</span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">
                          La musculature de soutien réagit parfaitement à une intensité de {kegelIntensity}/10. Maintenez le rythme de contraction durant les signaux de l'AlphaTimer.
                        </p>
                      </div>
                    </div>

                    {/* Circular visual progress feedback */}
                    <div className="flex justify-center py-4 bg-[#0F0F1A]/40 rounded-2xl border border-[#1A1A2E]/50">
                      <AlphaProgress
                        type="circular"
                        value={kegelIntensity * 10}
                        size="lg"
                        color={kegelIntensity > 7 ? 'success' : 'secondary'}
                        label="Puissance"
                      />
                    </div>
                  </div>

                  {/* Quick interactive checklist */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-[#0F0F1A] p-4 rounded-2xl border border-[#1a1a2e] gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <Flame className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-xs text-white uppercase">Série quotidienne assurée</h4>
                        <p className="text-[10px] text-[#8E8E93]">Vous gagnez +20 points d'énergie de combat aujourd'hui.</p>
                      </div>
                    </div>
                    <AlphaButton variant="gold" size="sm" onClick={() => addToast('success', 'Streak de 15 jours validée ! En route vers la gloire.')}>
                      Valider ma Série
                    </AlphaButton>
                  </div>
                </AlphaCard>

                {/* Performance Analytics visualization */}
                <AlphaCard variant="default" className="p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-[#1A1A2E] pb-3">
                    <div>
                      <h3 className="font-headline font-extrabold text-md text-white uppercase tracking-wider">
                        Performances de Force Masculine
                      </h3>
                      <p className="text-xs text-[#8E8E93] mt-0.5">Analyses quotidiennes sur 7 jours</p>
                    </div>
                    <div className="flex bg-[#0F0F1A] p-1 rounded-lg border border-[#1A1A2E] text-[10px] font-bold">
                      <button className="px-2 py-1 rounded bg-[#E94560] text-white">Kegel</button>
                      <button className="px-2 py-1 rounded text-[#8E8E93] hover:text-white" onClick={() => addToast('info', 'Graphiques Testosterone disponibles en version premium VIP')}>Testostérone</button>
                    </div>
                  </div>

                  <AlphaChart
                    type="line"
                    data={[
                      { label: 'LUN', value: 45 },
                      { label: 'MAR', value: 50 },
                      { label: 'MER', value: 75 },
                      { label: 'JEU', value: 65 },
                      { label: 'VEN', value: 90 },
                      { label: 'SAM', value: 85 },
                      { label: 'DIM', value: 105 },
                    ]}
                    height={180}
                  />
                </AlphaCard>

              </div>

              {/* Sideroad components inside Concept dashboard */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Hydration tracker using input and card */}
                <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center select-none pb-2 border-b border-[#1A1A2E]">
                    <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Hydratation Hydrique</span>
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Snowflake className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-baseline font-mono select-none">
                      <span className="text-white text-3xl font-extrabold">{dailyHydration} / 8</span>
                      <span className="text-xs text-[#8E8E93]">verres d'eau pure</span>
                    </div>

                    {/* Hydration progress indicator */}
                    <AlphaProgress value={(dailyHydration / 8) * 100} color="success" size="sm" showLabel={false} />

                    <div className="grid grid-cols-2 gap-2.5 mt-2">
                      <AlphaButton 
                        variant="primary" 
                        size="sm" 
                        disabled={dailyHydration <= 0}
                        onClick={() => {
                          setDailyHydration(prev => Math.max(0, prev - 1));
                          addToast('info', 'Verre d\'eau décompté.');
                        }}
                      >
                        -1 Verre
                      </AlphaButton>
                      <AlphaButton 
                        variant="secondary" 
                        size="sm" 
                        disabled={dailyHydration >= 8}
                        onClick={() => {
                          setDailyHydration(prev => Math.min(8, prev + 1));
                          addToast('success', 'Verre d\'eau enregistré ! Hydratation cellulaire active.');
                        }}
                      >
                        +1 Verre
                      </AlphaButton>
                    </div>
                  </div>
                </AlphaCard>

                {/* Join the Clan elite block */}
                <AlphaCard variant="premium" className="p-5 flex flex-col gap-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] mx-auto animate-bounce">
                    <Shield className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-headline font-extrabold text-sm text-white uppercase tracking-wider">
                      Fraternité ALPHA CLAN
                    </h4>
                    <p className="text-xs text-[#8E8E93] mt-2 leading-relaxed">
                      Rejoignez 14,200 combattants de niveau mondial. Défiez vos frères d'armes, mesurez vos performances Kegel, et hissez-vous au sommet.
                    </p>
                  </div>
                  <AlphaButton variant="gold" size="sm" onClick={() => setPremiumModalOpen(true)}>
                    Rejoindre l'Élite VIP
                  </AlphaButton>
                </AlphaCard>

                {/* Quick countdown timers */}
                <AlphaCard variant="default" className="p-5 flex flex-col gap-3">
                  <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider select-none">
                    Session de Respiration (Apnée)
                  </span>
                  <AlphaTimer 
                    type="countdown" 
                    initialSeconds={30} 
                    onComplete={() => addToast('success', 'Restauration respiratoire complète !')} 
                  />
                </AlphaCard>

              </div>
            </div>

            {/* Premium Gold crown bottom-sheet modal */}
            <AlphaModal
              isOpen={premiumModalOpen}
              onClose={() => setPremiumModalOpen(false)}
              type="bottom-sheet"
              title="L'Expérience ALPHA ELITE VIP"
            >
              <div className="flex flex-col gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] mx-auto shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                  <Crown className="w-10 h-10 fill-current" />
                </div>
                <div>
                  <h4 className="font-headline font-extrabold text-lg text-white uppercase">Accès Premium Illimité</h4>
                  <p className="text-xs text-[#8E8E93] mt-2 leading-relaxed">
                    Débloquez l'intégralité du coach PC-Muscle intelligent, accédez aux graphiques hormonaux avancés, et rejoignez les salons de discussion sécurisés du Clan ALPHA mondial.
                  </p>
                </div>
                
                {/* Cost indicators */}
                <div className="p-4 bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-xs font-headline font-bold text-white uppercase">Abonnement Mensuel</p>
                    <p className="text-[10px] text-[#8E8E93]">Résiliable à tout moment</p>
                  </div>
                  <span className="font-mono text-[#FFD700] text-lg font-extrabold">14.99 € / mois</span>
                </div>

                <div className="flex gap-3 justify-center mt-3">
                  <AlphaButton variant="ghost" onClick={() => setPremiumModalOpen(false)}>Fermer</AlphaButton>
                  <AlphaButton variant="gold" onClick={() => {
                    setPremiumModalOpen(false);
                    addToast('success', 'Félicitations ! Vous êtes désormais un membre ALPHA ELITE VIP.');
                  }}>
                    Activer ALPHA VIP
                  </AlphaButton>
                </div>
              </div>
            </AlphaModal>

            {/* Kegel Workout stopwatch modal */}
            <AlphaModal
              isOpen={kegelModalOpen}
              onClose={() => setKegelModalOpen(false)}
              type="center"
              title="Laboratoire d'Entraînement PC"
            >
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <h4 className="font-headline font-bold text-xs text-white uppercase">Entraînement PC-Muscle Fractionné</h4>
                  <p className="text-xs text-[#8E8E93] mt-1">Contractez pendant les phases d'impulsion Kegel Coach.</p>
                </div>

                <AlphaTimer 
                  type="interval" 
                  initialSeconds={10} 
                  onComplete={() => addToast('success', 'Félicitations, session complétée ! +25 points d\'expérience.')} 
                />

                <div className="flex gap-3 justify-center mt-2">
                  <AlphaButton variant="ghost" className="w-full" onClick={() => setKegelModalOpen(false)}>Quitter</AlphaButton>
                </div>
              </div>
            </AlphaModal>

          </>
        )}

            {/* Pattern Killer Engine - Neural Rewire Section */}
            <div className="border-t border-[#1A1A2E] pt-8 mt-4">
              <AlphaPatternKiller addToast={addToast} />
            </div>

          </div>
        )}

        {activeTab === 'architecture' && (
          <AlphaArchitecture addToast={addToast} />
        )}

      </main>

      {/* FLOATABLE TOAST NOTIFICATION CONTAINER */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <AlphaToast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>

      {/* COMPLIANCE & ACCESSIBILITY ACCENTS FOOTER */}
      <footer className="mt-auto border-t border-[#1A1A2E] py-6 px-4 text-center text-xs text-[#5A5A5A] font-headline font-bold uppercase tracking-widest bg-[#0F0F1A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 ALPHA MAN Wellness. Tous droits réservés.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#E94560] transition-colors cursor-pointer" onClick={() => addToast('info', 'Version 1.0.0. Design System conforme WCAG 2.1 AA.')}>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span className="hover:text-[#E94560] transition-colors cursor-pointer" onClick={() => addToast('info', 'Support vocal de VoiceOver/TalkBack actif.')}>VoiceOver Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
