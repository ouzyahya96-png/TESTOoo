import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Crown, 
  Award, 
  Activity, 
  Maximize2, 
  Bell, 
  Eye, 
  Timer, 
  Code, 
  Copy, 
  ChevronRight, 
  Target, 
  Flame,
  Check 
} from 'lucide-react';

import { AlphaButton, reactButtonCode, reactNativeButtonCode } from '../../components/AlphaButton';
import { AlphaCard, reactCardCode, reactNativeCardCode } from '../../components/AlphaCard';
import { AlphaProgress, reactProgressCode, reactNativeProgressCode } from '../../components/AlphaProgress';
import { AlphaInput, reactInputCode, reactNativeInputCode } from '../../components/AlphaInput';
import { AlphaBadge, reactBadgeCode, reactNativeBadgeCode } from '../../components/AlphaBadge';
import { AlphaAvatar, reactAvatarCode, reactNativeAvatarCode } from '../../components/AlphaAvatar';
import { AlphaSlider, reactSliderCode, reactNativeSliderCode } from '../../components/AlphaSlider';
import { AlphaChart, reactChartCode, reactNativeChartCode } from '../../components/AlphaChart';
import { AlphaModal, reactModalCode, reactNativeModalCode } from '../../components/AlphaModal';
import { AlphaToast, reactToastCode, reactNativeToastCode } from '../../components/AlphaToast';
import { AlphaSkeleton, reactSkeletonCode, reactNativeSkeletonCode } from '../../components/AlphaSkeleton';
import { AlphaTimer, reactTimerCode, reactNativeTimerCode } from '../../components/AlphaTimer';

interface PlaygroundTabProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const PlaygroundTab: React.FC<PlaygroundTabProps> = ({ addToast, onBack }) => {
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

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
    addToast('success', 'Code source copié dans le presse-papiers !');
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-[fade-in_0.3s_ease-out] text-left">
      {onBack && (
        <div className="flex justify-between items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
              Laboratoire d'interface — Component Lab
            </span>
            <h2 className="text-md font-headline font-black text-white mt-1">
              Testeur de Composants Interactifs
            </h2>
          </div>
          <AlphaButton variant="ghost" size="sm" onClick={onBack}>
            Retour
          </AlphaButton>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
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
                  icon={<Target className="w-4.5 h-4.5" />}
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
    </div>
  );
};
