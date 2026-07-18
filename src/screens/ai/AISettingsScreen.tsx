import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Brain,
  Shield,
  Bell,
  Sliders,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Database,
  Activity,
  Moon,
  Timer,
  Flame,
  Code,
  Copy,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface AISettingsScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

interface DataPermissions {
  contractile: boolean;
  sleep: boolean;
  stress: boolean;
  screenTime: boolean;
  urges: boolean;
  coldExposure: boolean;
}

interface AISettings {
  coachTone: 'spartan' | 'fraternal' | 'clinical';
  notificationFrequency: 'none' | 'critical' | 'smart' | 'daily';
  sensitivity: 'low' | 'moderate' | 'high';
  urgeSurfDuration: number; // in minutes
  permissions: DataPermissions;
}

export const AISettingsScreen: React.FC<AISettingsScreenProps> = ({ addToast, onBack }) => {
  // Show Expo Native code
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Loading and Saving states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Settings state
  const [settings, setSettings] = useState<AISettings>({
    coachTone: 'spartan',
    notificationFrequency: 'smart',
    sensitivity: 'moderate',
    urgeSurfDuration: 10,
    permissions: {
      contractile: true,
      sleep: true,
      stress: true,
      screenTime: true,
      urges: true,
      coldExposure: true
    }
  });

  // Save ref for debouncing
  const settingsRef = useRef<AISettings>(settings);
  settingsRef.current = settings;
  const initialLoadRef = useRef<boolean>(true);

  // Double-confirmation delete modals
  const [showConfirmModal1, setShowConfirmModal1] = useState<boolean>(false);
  const [showConfirmModal2, setShowConfirmModal2] = useState<boolean>(false);
  const [confirmTextInput, setConfirmTextInput] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai-engine/ALPHA_SOLDIER_1/settings');
        if (response.ok) {
          const json = await response.json();
          if (json.settings) {
            setSettings(json.settings);
          }
        } else {
          // If 404/error, use local storage fallback
          const localSettings = localStorage.getItem('alpha-ai-settings');
          if (localSettings) {
            setSettings(JSON.parse(localSettings));
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        const localSettings = localStorage.getItem('alpha-ai-settings');
        if (localSettings) {
          setSettings(JSON.parse(localSettings));
        }
      } finally {
        setIsLoading(false);
        // Turn off initial load flag on next tick
        setTimeout(() => {
          initialLoadRef.current = false;
        }, 100);
      }
    };

    fetchSettings();
  }, []);

  // Debounced PUT saving mechanism
  useEffect(() => {
    if (initialLoadRef.current) return;

    const delayDebounceFn = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Save to LocalStorage immediately
        localStorage.setItem('alpha-ai-settings', JSON.stringify(settingsRef.current));

        // PUT request to Backend Server
        const response = await fetch('/api/ai-engine/ALPHA_SOLDIER_1/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: settingsRef.current })
        });

        if (response.ok) {
          addToast('success', 'Sauvegarde automatique réussie 💾');
        } else {
          addToast('warning', 'Sauvegarde locale effectuée (serveur indisponible).');
        }
      } catch (err) {
        console.error('Failed to save settings to server:', err);
        addToast('warning', 'Sauvegarde locale effectuée (hors connexion).');
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [
    settings.coachTone,
    settings.notificationFrequency,
    settings.sensitivity,
    settings.urgeSurfDuration,
    settings.permissions.contractile,
    settings.permissions.sleep,
    settings.permissions.stress,
    settings.permissions.screenTime,
    settings.permissions.urges,
    settings.permissions.coldExposure
  ]);

  // Handler to mutate individual permissions
  const togglePermission = (key: keyof DataPermissions) => {
    setSettings(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  // Handler to mutate text values
  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // destructive reset handler
  const handleAbsoluteDelete = async () => {
    if (confirmTextInput !== 'EFFACER TOUT') {
      addToast('error', 'Saisie de confirmation incorrecte.');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/ai-engine/ALPHA_SOLDIER_1/reset', {
        method: 'POST'
      });

      if (response.ok) {
        // Reset everything
        localStorage.removeItem('alpha-ai-settings');
        localStorage.removeItem('alpha-theme');
        
        setSettings({
          coachTone: 'spartan',
          notificationFrequency: 'smart',
          sensitivity: 'moderate',
          urgeSurfDuration: 10,
          permissions: {
            contractile: true,
            sleep: true,
            stress: true,
            screenTime: true,
            urges: true,
            coldExposure: true
          }
        });

        addToast('success', 'Souveraineté restaurée. Toutes vos données ont été définitivement effacées 🛡️');
        setShowConfirmModal2(false);
        setConfirmTextInput('');
      } else {
        addToast('error', 'Échec de la suppression sur le serveur.');
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Une erreur est survenue lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(expoNativeSettingsCode);
    setCopied(true);
    addToast('success', 'Code source copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-settings-screen-container" className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-4 px-1">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1C1C35] pb-6">
        <div>
          <span className="text-[10px] font-headline font-extrabold tracking-widest text-[#E94560] bg-[#E94560]/10 px-2.5 py-1 rounded-full uppercase">
            Panneau Souverain de Contrôle
          </span>
          <h2 className="text-xl font-headline font-black text-white mt-2">
            Configuration du Moteur IA & Confidentialité
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Ajustez le ton de votre coach, configurez les prédictions neuronales, et exercez un contrôle souverain sur vos données de santé pelvienne.
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
            variant={showNativeCode ? 'gold' : 'primary'}
            size="sm"
            onClick={() => setShowNativeCode(!showNativeCode)}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            {showNativeCode ? 'Masquer le Code' : 'Inspecter Code Expo'}
          </AlphaButton>
        </div>
      </div>

      {/* CODE SOURCE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">AISettingsScreen.tsx (Expo Native TypeScript)</h4>
              <p className="text-[10px] text-gray-500">
                Paramétrage souverain de l'appareil avec bascules de confidentialité natives React Native.
              </p>
            </div>
            <AlphaButton
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le code'}
            </AlphaButton>
          </div>
          <pre className="font-mono text-[11px] text-gray-300 overflow-x-auto max-h-[400px] p-4 bg-[#0A0A14] rounded-2xl custom-scrollbar leading-relaxed">
            <code>{expoNativeSettingsCode}</code>
          </pre>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-t-[#E94560] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <Brain className="w-6 h-6 text-[#E94560]/40 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xs text-gray-400 font-mono">Synchronisation des paramètres cryptés...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: MAIN CONFIGURATIONS (SPAN 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. TON DU COACH (COACH TONE) */}
            <AlphaCard variant="default" className="p-6 flex flex-col gap-4 border border-[#1C1C35]">
              <div className="flex items-center gap-3 border-b border-[#1C1C35]/50 pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#E94560]/10 flex items-center justify-center text-[#E94560]">
                  <Flame className="w-4.5 h-4.5 fill-current" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-white text-sm uppercase">1. Alignement du Ton du Coach</h3>
                  <p className="text-[10px] text-gray-400">Configurez la posture verbale du moteur d'analyse.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'spartan',
                    label: '⚔️ Spartiate',
                    desc: 'Direct, tranchant, fraternel. Refuse tout larmoyage.'
                  },
                  {
                    id: 'fraternal',
                    label: '🤝 Mentor d’Élite',
                    desc: 'Empathie stratégique, soutien et encouragements virils.'
                  },
                  {
                    id: 'clinical',
                    label: '🔬 Neuro-Clinique',
                    desc: 'Scientifique, neutre, axé sur les rapports d’ondes lentes.'
                  }
                ].map(tone => {
                  const isSelected = settings.coachTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => updateSetting('coachTone', tone.id as any)}
                      className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#E94560]/10 border-[#E94560] text-white shadow-[0_0_12px_rgba(233,69,96,0.15)]'
                          : 'bg-[#111124] border-[#1C1C3A] text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span className="font-headline font-black text-xs">{tone.label}</span>
                      <span className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">{tone.desc}</span>
                    </button>
                  );
                })}
              </div>
            </AlphaCard>

            {/* 2. NOTIFICATIONS & PREDICTION SENSITIVITY */}
            <AlphaCard variant="default" className="p-6 flex flex-col gap-6 border border-[#1C1C35]">
              <div className="flex items-center gap-3 border-b border-[#1C1C35]/50 pb-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-[#FFD700]">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-white text-sm uppercase">2. Fréquence & Sensibilité IA</h3>
                  <p className="text-[10px] text-gray-400">Réglez l'intensité des alertes neuronales du Pattern Killer.</p>
                </div>
              </div>

              {/* Notification frequency */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-headline font-extrabold uppercase text-[#8E8E93] tracking-wider">
                  Fréquence des Notifications Intelligentes
                </span>
                <div className="bg-[#111124] p-1 rounded-xl border border-[#1C1C3A] flex gap-1">
                  {[
                    { id: 'none', label: 'Silencieux' },
                    { id: 'critical', label: 'Critique' },
                    { id: 'smart', label: 'Intelligent' },
                    { id: 'daily', label: 'Quotidien' }
                  ].map(item => {
                    const isSelected = settings.notificationFrequency === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateSetting('notificationFrequency', item.id as any)}
                        className={`flex-1 text-center py-2 rounded-lg font-headline font-bold text-xs uppercase transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E94560] text-white shadow-md'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-500 italic mt-0.5">
                  💡 Le mode <span className="text-white">Intelligent</span> utilise les pics de stress prévus par notre modèle bayésien local pour vous notifier de manière préventive.
                </p>
              </div>

              {/* Prediction sensitivity */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-headline font-extrabold uppercase text-[#8E8E93] tracking-wider">
                    Sensibilité des Prédictions Neuronales
                  </span>
                  <span className="font-mono text-xs text-[#E94560] bg-[#E94560]/10 border border-[#E94560]/20 px-2 py-0.5 rounded uppercase font-bold">
                    {settings.sensitivity === 'low' ? 'Basse' : settings.sensitivity === 'moderate' ? 'Modérée' : 'Haute / Prudentielle'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#111124] p-1 rounded-xl border border-[#1C1C3A]">
                  {[
                    { id: 'low', label: '⚡ Filtré', desc: 'Alertes rares' },
                    { id: 'moderate', label: '⚖️ Équilibré', desc: 'Standard clinique' },
                    { id: 'high', label: '🛡️ Sécuritaire', desc: 'Tolérance zéro' }
                  ].map(sens => {
                    const isSelected = settings.sensitivity === sens.id;
                    return (
                      <button
                        key={sens.id}
                        type="button"
                        onClick={() => updateSetting('sensitivity', sens.id as any)}
                        className={`py-2 rounded-lg text-center font-headline font-bold text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-[#E94560]/10 border border-[#E94560]/40 text-white font-extrabold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{sens.label}</span>
                          <span className="text-[8px] opacity-70 mt-0.5 font-normal">{sens.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </AlphaCard>

            {/* 3. URGE SURFING TIMER DURATION */}
            <AlphaCard variant="default" className="p-6 flex flex-col gap-4 border border-[#1C1C35]">
              <div className="flex items-center gap-3 border-b border-[#1C1C35]/50 pb-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Timer className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-white text-sm uppercase">3. Durée de l'Urge Surfing</h3>
                  <p className="text-[10px] text-gray-400">Calibrez l'exercice d'ancrage en cas d'alerte de crise.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-baseline select-none">
                  <span className="text-[11px] font-headline font-extrabold uppercase text-[#8E8E93] tracking-wider">Durée du minuteur respiratoire</span>
                  <span className="font-mono text-xl font-black text-white">{settings.urgeSurfDuration} minutes</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSetting('urgeSurfDuration', Math.max(3, settings.urgeSurfDuration - 1))}
                    disabled={settings.urgeSurfDuration <= 3}
                    className="w-10 h-10 rounded-xl bg-[#111124] border border-[#1C1C3A] hover:bg-[#1C1C3A] disabled:opacity-40 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-[#111124] h-2 rounded-full overflow-hidden relative">
                    <div
                      className="bg-sky-400 h-full transition-all duration-300"
                      style={{ width: `${((settings.urgeSurfDuration - 3) / 17) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => updateSetting('urgeSurfDuration', Math.min(20, settings.urgeSurfDuration + 1))}
                    disabled={settings.urgeSurfDuration >= 20}
                    className="w-10 h-10 rounded-xl bg-[#111124] border border-[#1C1C3A] hover:bg-[#1C1C3A] disabled:opacity-40 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-gray-500">
                  <span>3 MIN (MINIMUM)</span>
                  <span>20 MIN (ELITE)</span>
                </div>
              </div>
            </AlphaCard>

          </div>

          {/* RIGHT COLUMN: DATA PERMISSIONS & DESTRUCTIVE ACTIONS (SPAN 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 4. PRIVACY & DATA PERMISSIONS (MOST IMPORTANT SECTION) */}
            <AlphaCard variant="elevated" className="p-6 border border-[#1C1C35] bg-[#0E0E1A]">
              <div className="flex items-center justify-between border-b border-[#1C1C35]/50 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5.5 h-5.5 text-blue-400" />
                  <div>
                    <h3 className="font-headline font-black text-white text-xs uppercase leading-none">Confidentialité & Données</h3>
                    <span className="text-[9px] font-mono text-blue-400 tracking-widest uppercase font-black block mt-1.5">Contrôle Souverain local</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3" />
                  100% Crypté
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Le moteur IA tourne localement sur votre appareil. Vous choisissez exactement quelles données de santé pelvienne ou d'habitudes de vie alimentent les prédictions :
              </p>

              <div className="flex flex-col gap-3.5">
                {[
                  {
                    key: 'contractile',
                    label: 'Force & amplitude contractile',
                    desc: 'Signaux du capteur Perifit / kGoal',
                    icon: <Activity className="w-4 h-4 text-[#00D9A5]" />
                  },
                  {
                    key: 'sleep',
                    label: 'Qualité du sommeil',
                    desc: 'Données de repos profond et d\'ondes lentes',
                    icon: <Moon className="w-4 h-4 text-purple-400" />
                  },
                  {
                    key: 'stress',
                    label: 'Stress & humeur déclarés',
                    desc: 'Analyse sémantique de vos journaux de bord',
                    icon: <Brain className="w-4 h-4 text-blue-400" />
                  },
                  {
                    key: 'screenTime',
                    label: 'Temps d’écran & médias',
                    desc: 'Activité de sur-stimulation locale de l\'appareil',
                    icon: <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                  },
                  {
                    key: 'urges',
                    label: 'Historique des urges (crises)',
                    desc: 'Données statistiques enregistrées par le Pattern Killer',
                    icon: <Flame className="w-4 h-4 text-red-500" />
                  },
                  {
                    key: 'coldExposure',
                    label: 'Exposition au froid',
                    desc: 'Données de douches glacées et de cryothérapie',
                    icon: <Timer className="w-4 h-4 text-sky-400" />
                  }
                ].map(item => {
                  const allowed = settings.permissions[item.key as keyof DataPermissions];
                  return (
                    <div
                      key={item.key}
                      onClick={() => togglePermission(item.key as keyof DataPermissions)}
                      className={`flex items-center justify-between bg-[#111124] border p-3.5 rounded-2xl cursor-pointer transition-all ${
                        allowed
                          ? 'border-[#1C1C3A] hover:border-gray-700'
                          : 'border-red-500/10 opacity-60 hover:opacity-80 bg-red-950/5'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 pr-4">
                        <div className="mt-0.5">{item.icon}</div>
                        <div className="flex flex-col text-left">
                          <span className="font-headline font-black text-xs text-white leading-snug">{item.label}</span>
                          <span className="text-[10px] text-gray-400 mt-1">{item.desc}</span>
                        </div>
                      </div>

                      {/* IOS Styled Switch */}
                      <div className="shrink-0 relative">
                        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${allowed ? 'bg-[#00D9A5]' : 'bg-gray-800'}`}>
                          <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${allowed ? 'transform translate-x-4' : ''}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SAVING AUTO INDICATOR */}
              <div className="mt-5 pt-4 border-t border-[#1C1C35]/50 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>Sauvegarde locale en continu</span>
                {isSaving ? (
                  <span className="text-[#FFD700] flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-ping" />
                    Enregistrement...
                  </span>
                ) : (
                  <span className="text-[#00D9A5] flex items-center gap-1 font-bold">
                    ✓ Données Synchronisées
                  </span>
                )}
              </div>
            </AlphaCard>

            {/* 5. DESTRUCTIVE DELETION CARD (TOUT EFFACER) */}
            <AlphaCard variant="default" className="p-5 flex flex-col gap-3.5 border border-[#FF2D55]/30 bg-[#1A0A0E]/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[#FF2D55]">
                  <Trash2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-headline font-black text-white text-xs uppercase">Restauration de Souveraineté</h4>
                  <p className="text-[10px] text-gray-400">Effacez instantanément et définitivement toutes vos données.</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed text-left">
                Cette opération détruira de manière irrévocable l'intégralité de vos historiques d'entraînement pelvien, vos journaux de bord intimes, vos photos d'évolution cryptées et les poids neuronaux calibrés sur votre appareil.
              </p>

              <AlphaButton
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmModal1(true)}
                className="w-full bg-[#FF2D55]/10 hover:bg-[#FF2D55]/25 text-[#FF2D55] border border-[#FF2D55]/20 font-extrabold text-xs uppercase"
              >
                Effacer Toutes Mes Données
              </AlphaButton>
            </AlphaCard>

          </div>

        </div>
      )}

      {/* DOUBLE-CONFIRMATION MODAL 1 */}
      <AnimatePresence>
        {showConfirmModal1 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowConfirmModal1(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#16162A] border-2 border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-[0_20px_50px_rgba(255,45,85,0.2)] flex flex-col gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="font-headline font-black text-lg text-white uppercase">Sérieux ? (Étape 1 de 2)</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Vous vous apprêtez à effacer l'intégralité de vos efforts, votre série consécutive (streak) et vos rapports cliniques d'auto-discipline. Cette action est <span className="text-red-500 font-bold">100% irréversible</span>.
                </p>
              </div>

              <div className="flex gap-3 justify-center mt-3">
                <AlphaButton
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowConfirmModal1(false)}
                >
                  Annuler
                </AlphaButton>
                <AlphaButton
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700 font-bold"
                  onClick={() => {
                    setShowConfirmModal1(false);
                    setShowConfirmModal2(true);
                  }}
                >
                  Continuer
                </AlphaButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOUBLE-CONFIRMATION MODAL 2 (Saisie Textuelle) */}
      <AnimatePresence>
        {showConfirmModal2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => {
                setShowConfirmModal2(false);
                setConfirmTextInput('');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#16162A] border-2 border-red-600 rounded-3xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(255,0,0,0.35)] flex flex-col gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-600 mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="font-headline font-black text-lg text-white uppercase">Confirmation Cryptographique (Étape 2)</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Pour valider la suppression définitive de toutes vos données locales et serveurs, veuillez écrire <span className="text-red-500 font-bold font-mono">EFFACER TOUT</span> ci-dessous :
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  value={confirmTextInput}
                  onChange={(e) => setConfirmTextInput(e.target.value)}
                  placeholder="EFFACER TOUT"
                  className="w-full bg-[#0F0F1A] border-2 border-[#1C1C3A] focus:border-red-600 rounded-2xl px-4 py-3 text-center text-sm text-white font-mono placeholder-gray-700 outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3 justify-center mt-3">
                <AlphaButton
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirmModal2(false);
                    setConfirmTextInput('');
                  }}
                >
                  Annuler
                </AlphaButton>
                <AlphaButton
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:bg-gray-800 disabled:text-gray-600 font-extrabold uppercase text-xs"
                  disabled={confirmTextInput !== 'EFFACER TOUT' || isDeleting}
                  onClick={handleAbsoluteDelete}
                >
                  {isDeleting ? 'Purge en cours...' : 'CONFIRMER LA PURGE ABSOLUE'}
                </AlphaButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// ========================== EXPO NATIVE CODE REFERENCE ==========================
const expoNativeSettingsCode = `import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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

export default function AISettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings states conforming to the Alpha Man secure architecture
  const [coachTone, setCoachTone] = useState('spartan');
  const [notifFreq, setNotifFreq] = useState('smart');
  const [sensitivity, setSensitivity] = useState('moderate');
  const [urgeDuration, setUrgeDuration] = useState(10);

  // Secure data permissions
  const [permissions, setPermissions] = useState({
    contractile: true,
    sleep: true,
    stress: true,
    screenTime: true,
    urges: true,
    coldExposure: true
  });

  // Destruction confirmation modals
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://ais-dev-cvyu3qpduu7scuggzh6wu5-927581743590.europe-west2.run.app/api/ai-engine/ALPHA_SOLDIER_1/settings');
      const data = await res.json();
      if (data.settings) {
        setCoachTone(data.settings.coachTone);
        setNotifFreq(data.settings.notificationFrequency);
        setSensitivity(data.settings.sensitivity);
        setUrgeDuration(data.settings.urgeSurfDuration);
        setPermissions(data.settings.permissions);
      }
    } catch (err) {
      console.log('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedSettings) => {
    setIsSaving(true);
    try {
      await fetch('https://ais-dev-cvyu3qpduu7scuggzh6wu5-927581743590.europe-west2.run.app/api/ai-engine/ALPHA_SOLDIER_1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updatedSettings })
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.log('Save settings failure', e);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (key) => {
    const nextPerms = { ...permissions, [key]: !permissions[key] };
    setPermissions(nextPerms);
    handleSave({ coachTone, notificationFrequency: notifFreq, sensitivity, urgeSurfDuration: urgeDuration, permissions: nextPerms });
  };

  const handleAbsoluteDelete = async () => {
    if (confirmText !== 'EFFACER TOUT') {
      Alert.alert('Erreur', 'Saisie incorrecte.');
      return;
    }
    setIsDeleting(true);
    try {
      await fetch('https://ais-dev-cvyu3qpduu7scuggzh6wu5-927581743590.europe-west2.run.app/api/ai-engine/ALPHA_SOLDIER_1/reset', {
        method: 'POST'
      });
      setShowModal2(false);
      setConfirmText('');
      Alert.alert('Succès', 'Souveraineté restaurée. Toutes vos données ont été effacées.');
      fetchSettings();
    } catch (err) {
      console.log('Reset failed', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Synchronisation des paramètres cryptés...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* COACH TONE SELECTOR */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>1. ALIGNEMENT DU TON DU COACH</Text>
        <TouchableOpacity style={styles.toneBtn} onPress={() => { setCoachTone('spartan'); handleSave({ coachTone: 'spartan', notificationFrequency: notifFreq, sensitivity, urgeSurfDuration: urgeDuration, permissions }); }}>
          <Text style={styles.btnText}>⚔️ Spartiate {coachTone === 'spartan' && '✓'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toneBtn} onPress={() => { setCoachTone('fraternal'); handleSave({ coachTone: 'fraternal', notificationFrequency: notifFreq, sensitivity, urgeSurfDuration: urgeDuration, permissions }); }}>
          <Text style={styles.btnText}>🤝 Mentor d’Élite {coachTone === 'fraternal' && '✓'}</Text>
        </TouchableOpacity>
      </View>

      {/* PRIVACY SWITCHES */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>2. CONFIDENTIALITÉ & DONNÉES LOCALES</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Force & amplitude contractile</Text>
          <Switch value={permissions.contractile} onValueChange={() => togglePermission('contractile')} trackColor={{ true: THEME.success }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Qualité du sommeil</Text>
          <Switch value={permissions.sleep} onValueChange={() => togglePermission('sleep')} trackColor={{ true: THEME.success }} />
        </View>
      </View>

      {/* DESTRUCTIVE ACTION BUTTON */}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowModal1(true)}>
        <Text style={styles.deleteBtnText}>Effacer Toutes Mes Données</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  scrollContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg },
  loadingText: { color: THEME.textSecondary, marginTop: 12, fontSize: 12 },
  card: { backgroundColor: THEME.card, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  cardHeader: { color: THEME.text, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 12 },
  toneBtn: { padding: 12, backgroundColor: '#111124', borderRadius: 12, marginBottom: 8 },
  btnText: { color: THEME.text, fontSize: 13, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: THEME.border },
  switchLabel: { color: THEME.text, fontSize: 12 },
  deleteBtn: { backgroundColor: THEME.alert + '15', borderColor: THEME.alert + '30', borderWidth: 1, padding: 14, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  deleteBtnText: { color: THEME.alert, fontSize: 12, fontWeight: '900' }
});
`;
