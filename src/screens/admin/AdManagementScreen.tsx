import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Award, 
  Download, 
  RefreshCw, 
  Settings, 
  GripVertical, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  X, 
  Shield, 
  Coins, 
  Percent,
  Sliders,
  HelpCircle,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdManagementScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack: () => void;
}

export interface PlacementData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  type: 'RÉCOMPENSÉ' | 'INTERSTITIEL';
  ecpm: number;
  viewsPerDay: number;
  fillRate: number;
  maxDailyFrequency: number;
  priorityNetwork: string;
}

export interface NetworkData {
  id: string;
  name: string;
  isActive: boolean;
  ecpm: number;
  fillRate: number;
  rank: number;
}

export interface RewardSettings {
  pointsPerAd: number;
  dailyLimit: number;
  weekendMultiplierActive: boolean;
  weekendMultiplierPercent: number;
}

export interface ProtectedZone {
  id: string;
  name: string;
  description: string;
  isLocked: boolean;
  isPermanent: boolean;
}

export interface UsageStats {
  adsWatchedToday: number;
  pointsDistributedToday: number;
  completionRate: number;
}

export const AdManagementScreen: React.FC<AdManagementScreenProps> = ({ 
  addToast, 
  onBack 
}) => {
  // Access Gate Security State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('alpha_admin_unlocked') === 'true';
  });
  const [accessCodeInput, setAccessCodeInput] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'placements' | 'networks' | 'rewards' | 'protected_zones'>('placements');
  
  // Data States
  const [placements, setPlacements] = useState<PlacementData[]>([]);
  const [networks, setNetworks] = useState<NetworkData[]>([]);
  const [rewardSettings, setRewardSettings] = useState<RewardSettings>({
    pointsPerAd: 50,
    dailyLimit: 4,
    weekendMultiplierActive: false,
    weekendMultiplierPercent: 50
  });
  const [usageStats, setUsageStats] = useState<UsageStats>({
    adsWatchedToday: 1430,
    pointsDistributedToday: 71500,
    completionRate: 88
  });
  const [protectedZones, setProtectedZones] = useState<ProtectedZone[]>([]);
  const [performanceData, setPerformanceData] = useState<{ network: string; ecpm: number; fillRate: number }[]>([]);
  
  // UI Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Modal Edit Placement State
  const [editingPlacementId, setEditingPlacementId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    type: 'RÉCOMPENSÉ' | 'INTERSTITIEL';
    maxDailyFrequency: number;
    priorityNetwork: string;
  }>({
    name: '',
    type: 'RÉCOMPENSÉ',
    maxDailyFrequency: 3,
    priorityNetwork: 'admob'
  });
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Modal Confirm Protected Zone Unlock State
  const [confirmingZoneId, setConfirmingZoneId] = useState<string | null>(null);
  const [confirmTextInput, setConfirmTextInput] = useState<string>('');
  
  // Revenue Stats State
  const [todayRevenue, setTodayRevenue] = useState<number>(1240);

  // Fetch all Ad configurations
  const fetchAdConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Placements
      const resPlacements = await fetch('/api/admin/ads/placements');
      if (resPlacements.ok) {
        const data = await resPlacements.json();
        setPlacements(data);
      }

      // 2. Networks
      const resNetworks = await fetch('/api/admin/ads/networks');
      if (resNetworks.ok) {
        const data = await resNetworks.json();
        setNetworks(data);
      }

      // 3. Performance data
      const resPerf = await fetch('/api/admin/ads/networks/performance?days=7');
      if (resPerf.ok) {
        const data = await resPerf.json();
        setPerformanceData(data);
      }

      // 4. Reward Settings
      const resRewards = await fetch('/api/admin/ads/rewards/settings');
      if (resRewards.ok) {
        const data = await resRewards.json();
        setRewardSettings(data);
      }

      // 5. Usage stats
      const resUsage = await fetch('/api/admin/ads/rewards/usage');
      if (resUsage.ok) {
        const data = await resUsage.json();
        setUsageStats(data);
      }

      // 6. Protected Zones
      const resZones = await fetch('/api/admin/ads/protected-zones');
      if (resZones.ok) {
        const data = await resZones.json();
        setProtectedZones(data);
      }

    } catch (err) {
      console.error('Error fetching ads config:', err);
      // Clean fallback in case of connection latency/server restart
      setPlacements([
        { id: 'rewarded_video_rewards', name: 'Récompense Vidéo (AdRewardsScreen)', description: 'Vidéo complète, opt-in utilisateur', isActive: true, type: 'RÉCOMPENSÉ', ecpm: 18, viewsPerDay: 2300, fillRate: 94, maxDailyFrequency: 5, priorityNetwork: 'admob' },
        { id: 'interstitial_kegel_end', name: 'Interstitiel Fin de Session Kegel', description: 'Affiché à la complétion d\'une session d\'exercices Kegel', isActive: true, type: 'INTERSTITIEL', ecpm: 12, viewsPerDay: 1400, fillRate: 89, maxDailyFrequency: 3, priorityNetwork: 'unity_ads' },
        { id: 'interstitial_back_dashboard', name: 'Interstitiel Retour Dashboard', description: 'Désactivé par défaut (fréquence trop intrusive si actif par défaut)', isActive: false, type: 'INTERSTITIEL', ecpm: 9, viewsPerDay: 0, fillRate: 85, maxDailyFrequency: 2, priorityNetwork: 'ironsource' }
      ]);
      setNetworks([
        { id: 'admob', name: 'AdMob', isActive: true, ecpm: 22, fillRate: 96, rank: 1 },
        { id: 'unity_ads', name: 'Unity Ads', isActive: true, ecpm: 16, fillRate: 92, rank: 2 },
        { id: 'ironsource', name: 'IronSource', isActive: true, ecpm: 14, fillRate: 88, rank: 3 }
      ]);
      setProtectedZones([
        { id: 'crisis_mode', name: 'Mode Crise Pattern Killer', description: 'CircuitObserverDiagram en context=crisis', isLocked: true, isPermanent: true },
        { id: 'distress_overlay', name: 'Overlay de détresse (Forum, Stories, Chat, Experts)', description: 'Filtre de détresse identifié de la Phase 6', isLocked: true, isPermanent: true },
        { id: 'story_composer', name: 'Composer de Story pendant rédaction', description: 'Évite l\'interruption cognitive en cours de rédaction d\'un récit intime', isLocked: true, isPermanent: false },
        { id: 'mentorship_chat', name: 'Chat Mentorat 1-à-1', description: 'Espace d\'accompagnement confidentiel et sécurisant', isLocked: true, isPermanent: false },
        { id: 'onboarding_first_steps', name: 'Onboarding (5 premières étapes)', description: 'Garantit que le nouveau guerrier comprend la proposition de valeur sans distraction', isLocked: true, isPermanent: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      fetchAdConfig();
    }
  }, [fetchAdConfig, isUnlocked]);

  // TOGGLE PLACEMENT
  const handleTogglePlacement = async (id: string, currentVal: boolean) => {
    try {
      const updatedVal = !currentVal;
      // Optimistic update
      setPlacements(prev => prev.map(p => p.id === id ? { ...p, isActive: updatedVal } : p));
      
      const res = await fetch(`/api/admin/ads/placements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedVal })
      });

      if (res.ok) {
        addToast('success', `Emplacement ${updatedVal ? 'activé' : 'désactivé'} avec succès !`);
      } else {
        throw new Error('Failed to update placement on backend');
      }
    } catch (err) {
      addToast('error', 'Erreur de mise à jour de l\'emplacement.');
      // Revert state
      setPlacements(prev => prev.map(p => p.id === id ? { ...p, isActive: currentVal } : p));
    }
  };

  // OPEN EDIT PLACEMENT FORM
  const handleOpenEditPlacement = (placement: PlacementData) => {
    setEditingPlacementId(placement.id);
    setEditForm({
      name: placement.name,
      type: placement.type,
      maxDailyFrequency: placement.maxDailyFrequency,
      priorityNetwork: placement.priorityNetwork
    });
    setIsFormOpen(true);
  };

  // SAVE PLACEMENT FORM
  const handleSavePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlacementId) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/ads/placements/${editingPlacementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const data = await res.json();
        setPlacements(prev => prev.map(p => p.id === editingPlacementId ? { ...p, ...data.placement } : p));
        addToast('success', 'Configuration de l\'emplacement enregistrée.');
        setIsFormOpen(false);
        setEditingPlacementId(null);
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err) {
      addToast('error', 'Impossible de sauvegarder le placement.');
    } finally {
      setIsSaving(false);
    }
  };

  // SWAP NETWORK RANKS (WATERFALL PRIORITY)
  const handleMoveNetwork = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= networks.length) return;

    const updated = [...networks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate rank fields
    const ordered = updated.map((net, i) => ({ ...net, rank: i + 1 }));
    setNetworks(ordered);

    try {
      const orderedIds = ordered.map(n => n.id);
      const res = await fetch('/api/admin/ads/networks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
      if (res.ok) {
        addToast('success', 'Ordre de cascade (Waterfall) mis à jour.');
      } else {
        throw new Error('reorder failed');
      }
    } catch (err) {
      addToast('error', 'Erreur de réordonnancement.');
      fetchAdConfig(); // rollback
    }
  };

  // TOGGLE NETWORK ACTIVE STATE
  const handleToggleNetworkActive = async (netId: string, currentVal: boolean) => {
    try {
      const updatedVal = !currentVal;
      setNetworks(prev => prev.map(n => n.id === netId ? { ...n, isActive: updatedVal } : n));
      addToast('info', `Réseau publicitaire ${updatedVal ? 'activé' : 'désactivé'}.`);
    } catch (err) {
      addToast('error', 'Erreur de bascule réseau.');
    }
  };

  // SAVE REWARDS SETTINGS
  const handleSaveRewardSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/ads/rewards/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setRewardSettings(data.settings);
        
        // Refresh usage stats
        const resUsage = await fetch('/api/admin/ads/rewards/usage');
        if (resUsage.ok) {
          const usageData = await resUsage.json();
          setUsageStats(usageData);
        }

        addToast('success', 'Réglages des récompenses enregistrés.');
      } else {
        throw new Error();
      }
    } catch (err) {
      addToast('error', 'Impossible d\'enregistrer les réglages.');
    } finally {
      setIsSaving(false);
    }
  };

  // TOGGLE PROTECTED ZONE
  const handleToggleProtectedZone = async (zone: ProtectedZone) => {
    if (zone.isPermanent) {
      addToast('warning', 'Protection permanente requise par protocole éthique ALPHA.');
      return;
    }

    if (zone.isLocked) {
      // Currently locked/protected -> wants to unlock (turn protection OFF)
      // Must open confirm modal!
      setConfirmingZoneId(zone.id);
      setConfirmTextInput('');
    } else {
      // Currently unlocked/unprotected -> wants to lock (turn protection ON)
      // Can lock immediately!
      try {
        setProtectedZones(prev => prev.map(z => z.id === zone.id ? { ...z, isLocked: true } : z));
        const res = await fetch(`/api/admin/ads/protected-zones/${zone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isLocked: true })
        });
        if (res.ok) {
          addToast('success', `Zone ${zone.name} est maintenant protégée.`);
        } else {
          throw new Error();
        }
      } catch (err) {
        addToast('error', 'Erreur lors du verrouillage de la zone.');
        fetchAdConfig();
      }
    }
  };

  // CONFIRM DISABLE PROTECTION
  const handleConfirmDisableZone = async () => {
    if (!confirmingZoneId || confirmTextInput !== 'DÉSACTIVER') return;

    try {
      setProtectedZones(prev => prev.map(z => z.id === confirmingZoneId ? { ...z, isLocked: false } : z));
      const res = await fetch(`/api/admin/ads/protected-zones/${confirmingZoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: false })
      });
      if (res.ok) {
        addToast('success', 'Protection désactivée de manière temporaire. Restez vigilant.');
      } else {
        throw new Error();
      }
    } catch (err) {
      addToast('error', 'Action rejetée par le protocole de sécurité.');
      fetchAdConfig();
    } finally {
      setConfirmingZoneId(null);
      setConfirmTextInput('');
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCodeInput.trim().length > 0) {
      setIsUnlocked(true);
      localStorage.setItem('alpha_admin_unlocked', 'true');
      addToast('success', 'Bienvenue Général ! Accès administrateur authentifié 🛡️');
    } else {
      addToast('error', 'Le code d\'accès administrateur ne peut pas être vide.');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] bg-[#0F0F1A] p-4 text-center select-none">
        {/* ACCESS CONTROL GATE */}
        <div className="w-full max-w-md bg-[#111124] border border-[#1C1C3A] rounded-[32px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-[#FFD700] to-emerald-500" />
          
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] animate-pulse">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-headline font-black text-[#FFD700] tracking-wider uppercase">ACCÈS ADMINISTRATEUR</h2>
              <p className="text-[11px] text-gray-500 font-sans mt-1">Espace réservé à l'équipe interne ALPHA MAN. Usage restreint.</p>
            </div>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Code d'accès d'urgence</label>
              <div className="relative">
                <input
                  type={showCode ? "text" : "password"}
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value)}
                  placeholder="Saisissez n'importe quel code pour tester..."
                  className="w-full bg-[#16213E] hover:bg-[#1E2E56]/40 focus:bg-[#1E2E56]/80 text-white font-sans text-xs border border-gray-800 focus:border-[#FFD700] rounded-xl px-4 py-3.5 pr-10 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFD700] hover:bg-yellow-500 active:scale-[0.98] text-[#0F0F1A] text-xs font-black uppercase py-3.5 rounded-xl transition-all font-sans tracking-wider shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-1.5"
            >
              Déverrouiller le Poste de Commandement <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[9px] text-gray-600 font-sans leading-relaxed italic border-t border-gray-800/60 pt-4">
            * Note de sécurité : Ce système simule l'accès. Une authentification IAM robuste et de véritables clés de chiffrement seront requises avant le déploiement sur les environnements de production d'ALPHA MAN.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col font-sans" id="ad-management-root">
      
      {/* HEADER */}
      <header className="bg-[#0F0F1A] border-b border-[#1A1A2E] px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#1A1A2E] hover:bg-gray-800 text-gray-300 flex items-center justify-center transition-all border border-[#2D2D44]"
            id="btn-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest font-headline text-[#FFD700] uppercase flex items-center gap-2">
              GESTION PUBLICITÉ <span className="text-[10px] bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded-md font-mono border border-[#FFD700]/20 tracking-normal normal-case">Ad Ops</span>
            </h1>
            <p className="text-[11px] text-[#8E8E93] font-body mt-0.5">Configuration des placements de monétisation, priorisation cascade (Waterfall) et préservation éthique.</p>
          </div>
        </div>

        <div>
          <div className="bg-[#00D9A5]/12 border border-[#00D9A5]/30 text-[#00D9A5] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D9A5] animate-pulse" />
            <span className="font-mono">{todayRevenue.toLocaleString()} DH aujourd'hui</span>
          </div>
        </div>
      </header>

      {/* TABS SELECTOR ROW */}
      <section className="px-8 mt-6">
        <div className="bg-[#1A1A2E] border border-[#2D2D44] p-1 rounded-2xl flex shadow-lg" id="ad-management-tabs-container">
          {(['placements', 'networks', 'rewards', 'protected_zones'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const isProtectedZones = tab === 'protected_zones';
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  border: isProtectedZones ? '1px solid rgba(255,45,85,0.3)' : undefined
                }}
                className={`flex-1 text-center py-3.5 rounded-xl text-[11px] font-bold font-mono uppercase tracking-wider transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-[#FFD700] text-[#0F0F1A] shadow-lg' 
                    : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'placements' && 'Emplacements'}
                {tab === 'networks' && 'Réseaux'}
                {tab === 'rewards' && 'Récompenses'}
                {tab === 'protected_zones' && '🛡️ Zones Protégées'}
                
                {isProtectedZones && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1A1A2E] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* CORE VIEWPORT CARDS */}
      <main className="flex-1 p-8 relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-16 text-gray-400"
            >
              <RefreshCw className="w-8 h-8 text-[#FFD700] animate-spin mb-3" />
              <p className="text-xs font-mono tracking-wider text-gray-500 uppercase">Chargement des données publicitaires...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* ━━━━━━━━━━━━━━━━━━━ TAB: PLACEMENTS ━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === 'placements' && (
                <div className="space-y-4" id="view-placements">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-black font-mono uppercase text-[#FFD700] tracking-widest">EMPLACEMENTS PUBLICITAIRES ACTIFS</h3>
                    <p className="text-xs text-gray-500 font-sans">Configuration des espaces d'intégration de scripts SDK</p>
                  </div>

                  <div className="space-y-3.5">
                    {placements.map((placement) => {
                      const isRewarded = placement.type === 'RÉCOMPENSÉ';
                      return (
                        <div 
                          key={placement.id} 
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#16213E] hover:border-gray-700/60 transition-all border border-[#1C1C3A] rounded-2xl shadow-md"
                          id={`placement-row-${placement.id}`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Toggle Switch */}
                            <button
                              onClick={() => handleTogglePlacement(placement.id, placement.isActive)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                placement.isActive ? 'bg-[#FFD700]' : 'bg-[#5A5A5A]'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0F0F1A] shadow ring-0 transition duration-200 ease-in-out ${
                                  placement.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Info */}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white font-body">{placement.name}</h4>
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  isRewarded 
                                    ? 'bg-[#00D9A5]/10 text-[#00D9A5] border border-[#00D9A5]/20' 
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {placement.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#8E8E93] font-body mt-0.5">{placement.description}</p>
                            </div>
                          </div>

                          {/* Stats Right */}
                          <div className="flex items-center gap-6 justify-between md:justify-end">
                            <div className="text-right">
                              <p className="text-[11px] font-mono text-[#8E8E93]">
                                eCPM <span className="text-white font-bold">{placement.ecpm} DH</span>
                              </p>
                              <p className="text-[10px] text-gray-500 font-sans">
                                {placement.viewsPerDay.toLocaleString()} vues/j · <span className="font-mono">{placement.fillRate}% fill</span>
                              </p>
                            </div>

                            {/* Settings Icon */}
                            <button
                              onClick={() => handleOpenEditPlacement(placement)}
                              className="w-10 h-10 rounded-xl bg-[#0F0F1A]/50 hover:bg-[#1A1A2E] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-gray-800 focus:outline-none"
                              style={{ width: 44, height: 44 }} // 44px perfect touch target
                              title="Édition avancée"
                            >
                              <Settings className="w-4 h-4 text-[#8E8E93] hover:text-[#FFD700] transition-colors" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ━━━━━━━━━━━━━━━━━━━ TAB: NETWORKS ━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === 'networks' && (
                <div className="space-y-6" id="view-networks">
                  
                  {/* WATERFALL ROW */}
                  <div className="bg-[#16213E] border border-[#1C1C3A] rounded-3xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-black font-mono text-[#FFD700] uppercase tracking-widest flex items-center gap-2">
                        <span>ORDRE DE PRIORITÉ (WATERFALL)</span>
                      </h3>
                      <span className="text-[10px] font-bold font-mono text-gray-500 bg-[#0F0F1A] px-2.5 py-1 rounded-lg border border-gray-800">
                        MÉDIATION AD OPS
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-body mb-5">
                      L'ordre détermine quel réseau publicitaire est sollicité en premier pour optimiser le taux de remplissage et maximiser le revenu par impression.
                    </p>

                    <div className="space-y-2.5">
                      {networks.map((net, index) => {
                        return (
                          <div 
                            key={net.id}
                            className="flex items-center justify-between p-4 bg-[#0F0F1A]/60 border border-gray-800 rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              {/* Drag Handles / Arrows */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleMoveNetwork(index, 'up')}
                                  disabled={index === 0}
                                  className={`p-1 rounded bg-[#16213E] hover:bg-gray-800 text-gray-400 hover:text-[#FFD700] transition-all disabled:opacity-20`}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleMoveNetwork(index, 'down')}
                                  disabled={index === networks.length - 1}
                                  className={`p-1 rounded bg-[#16213E] hover:bg-gray-800 text-gray-400 hover:text-[#FFD700] transition-all disabled:opacity-20`}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>

                              <GripVertical className="w-4 h-4 text-gray-600 hidden sm:block" />

                              {/* Rank */}
                              <span className="text-base font-bold font-mono text-[#FFD700] w-6 text-center">
                                {index + 1}
                              </span>

                              {/* Logo / Name */}
                              <div>
                                <h4 className="text-sm font-semibold text-white font-body">{net.name}</h4>
                                <span className="text-[10px] font-mono text-gray-500">
                                  ID: {net.id}
                                </span>
                              </div>
                            </div>

                            {/* Actions Right */}
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <span className="text-xs font-bold font-mono text-[#00D9A5]">{net.ecpm} DH <span className="text-[9px] text-[#8E8E93] font-normal">eCPM</span></span>
                                <span className="block text-[10px] text-gray-500">Fill rate: <span className="font-mono">{net.fillRate}%</span></span>
                              </div>

                              {/* Toggle Network */}
                              <button
                                onClick={() => handleToggleNetworkActive(net.id, net.isActive)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  net.isActive ? 'bg-[#00D9A5]' : 'bg-[#5A5A5A]'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0F0F1A] shadow ring-0 transition duration-200 ease-in-out ${
                                    net.isActive ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMPARATIVE PERFORMANCE CHART */}
                  <div className="bg-[#16213E] border border-[#1C1C3A] rounded-3xl p-6 shadow-xl" id="network-performance-chart">
                    <h3 className="text-xs font-black font-mono text-[#FFD700] uppercase tracking-widest mb-1.5">
                      COMPARAISON DE PERFORMANCE (7 DERNIERS JOURS)
                    </h3>
                    <p className="text-[11px] text-[#8E8E93] font-body mb-6">
                      Ratio d'efficacité globale croisé entre le taux de remplissage (Fill Rate) et le rendement eCPM.
                    </p>

                    {/* SVG Custom Columns */}
                    <div className="relative w-full h-[200px] bg-[#0F0F1A]/50 border border-gray-800 rounded-2xl p-4 flex items-end justify-around">
                      {performanceData.map((data, idx) => {
                        // Max eCPM is ~25
                        const ecpmHeight = (data.ecpm / 25) * 120; // max 120px
                        const fillHeight = (data.fillRate / 100) * 120; // max 120px
                        return (
                          <div key={data.network} className="flex flex-col items-center gap-2 w-1/3">
                            <div className="flex gap-4 items-end justify-center w-full h-[120px] relative">
                              
                              {/* eCPM Bar */}
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] font-mono text-[#00D9A5] font-bold mb-1">{data.ecpm} DH</span>
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: ecpmHeight }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                                  className="w-4 sm:w-6 bg-gradient-to-t from-[#00D9A5]/60 to-[#00D9A5] rounded-t-md shadow"
                                />
                              </div>

                              {/* Fill Rate Bar */}
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] font-mono text-blue-400 font-bold mb-1">{data.fillRate}%</span>
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: fillHeight }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 + 0.05 }}
                                  className="w-4 sm:w-6 bg-gradient-to-t from-blue-500/60 to-blue-400 rounded-t-md shadow"
                                />
                              </div>

                            </div>

                            {/* Label */}
                            <span className="text-[11px] font-mono font-bold text-gray-300 uppercase tracking-wider mt-1">
                              {data.network}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-4 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#00D9A5] rounded" />
                        <span className="text-gray-400 uppercase">eCPM (DH / 1k vues)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded" />
                        <span className="text-gray-400 uppercase">Fill rate (%)</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ━━━━━━━━━━━━━━━━━━━ TAB: REWARDS ━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === 'rewards' && (
                <div className="space-y-6" id="view-rewards">
                  
                  {/* CONFIGURATION REWARDS */}
                  <div className="bg-[#16213E] border border-[#1C1C3A] rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xs font-black font-mono text-[#FFD700] uppercase tracking-widest mb-4">
                      RÉGLAGES DES RÉCOMPENSES (POINTS CLANS)
                    </h3>

                    <div className="space-y-6">
                      
                      {/* Points per ad */}
                      <div className="bg-[#0F0F1A]/50 border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Points accordés par pub regardée</h4>
                          <p className="text-[11px] text-[#8E8E93] font-body mt-0.5">Distribués immédiatement au Clan de l'utilisateur après confirmation de la lecture vidéo.</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center sm:text-right pr-2">
                            <span className="text-2xl font-mono font-bold text-[#FFD700]">
                              {rewardSettings.pointsPerAd}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono block uppercase">Points</span>
                          </div>

                          <div className="flex items-center bg-[#16213E] rounded-xl p-1 border border-gray-800">
                            <button
                              onClick={() => setRewardSettings(prev => ({ ...prev, pointsPerAd: Math.max(10, prev.pointsPerAd - 10) }))}
                              className="w-8 h-8 rounded-lg bg-[#0F0F1A] text-white font-mono hover:bg-[#FFD700] hover:text-[#0F0F1A] transition-colors"
                            >
                              -
                            </button>
                            <button
                              onClick={() => setRewardSettings(prev => ({ ...prev, pointsPerAd: Math.min(200, prev.pointsPerAd + 10) }))}
                              className="w-8 h-8 rounded-lg bg-[#0F0F1A] text-white font-mono hover:bg-[#FFD700] hover:text-[#0F0F1A] transition-colors ml-1"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Daily ad limit */}
                      <div className="bg-[#0F0F1A]/50 border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Limite quotidienne par guerrier</h4>
                          <p className="text-[11px] text-[#8E8E93] font-body mt-0.5">Empêche le spam et le farming abusif de points via simulateurs ou scripts automatiques.</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center sm:text-right pr-2">
                            <span className="text-2xl font-mono font-bold text-[#FFD700]">
                              {rewardSettings.dailyLimit}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono block uppercase">Vidéos max</span>
                          </div>

                          <div className="flex items-center bg-[#16213E] rounded-xl p-1 border border-gray-800">
                            <button
                              onClick={() => setRewardSettings(prev => ({ ...prev, dailyLimit: Math.max(1, prev.dailyLimit - 1) }))}
                              className="w-8 h-8 rounded-lg bg-[#0F0F1A] text-white font-mono hover:bg-[#FFD700] hover:text-[#0F0F1A] transition-colors"
                            >
                              -
                            </button>
                            <button
                              onClick={() => setRewardSettings(prev => ({ ...prev, dailyLimit: Math.min(15, prev.dailyLimit + 1) }))}
                              className="w-8 h-8 rounded-lg bg-[#0F0F1A] text-white font-mono hover:bg-[#FFD700] hover:text-[#0F0F1A] transition-colors ml-1"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Weekend Multiplier */}
                      <div className="bg-[#0F0F1A]/50 border border-gray-800 p-5 rounded-2xl">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Multiplicateur de Weekend</h4>
                            <p className="text-[11px] text-[#8E8E93] font-body mt-0.5">Augmente l'engagement pendant les jours de congés en offrant un bonus de points.</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono font-bold text-[#FFD700]">
                              {rewardSettings.weekendMultiplierActive ? `+${rewardSettings.weekendMultiplierPercent}%` : 'Inactif'}
                            </span>

                            {/* Toggle Multiplier */}
                            <button
                              onClick={() => setRewardSettings(prev => ({ ...prev, weekendMultiplierActive: !prev.weekendMultiplierActive }))}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                rewardSettings.weekendMultiplierActive ? 'bg-[#FFD700]' : 'bg-[#5A5A5A]'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0F0F1A] shadow ring-0 transition duration-200 ease-in-out ${
                                  rewardSettings.weekendMultiplierActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {rewardSettings.weekendMultiplierActive && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-gray-800/80 flex items-center gap-4"
                          >
                            <label className="text-[11px] font-mono text-gray-400 uppercase">Pourcentage Bonus :</label>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={rewardSettings.weekendMultiplierPercent}
                              onChange={(e) => setRewardSettings(prev => ({ ...prev, weekendMultiplierPercent: Number(e.target.value) }))}
                              className="w-48 accent-[#FFD700] bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs font-mono font-bold text-white">+{rewardSettings.weekendMultiplierPercent}%</span>
                          </motion.div>
                        )}
                      </div>

                      {/* SAVE BUTTON */}
                      <button
                        onClick={handleSaveRewardSettings}
                        disabled={isSaving}
                        className="w-full py-3.5 rounded-xl bg-[#FFD700] hover:bg-[#E5C100] active:scale-95 text-[#0F0F1A] font-bold font-mono uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Enregistrer les réglages
                      </button>

                    </div>
                  </div>

                  {/* USAGE STATS ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="rewards-usage-stats">
                    {/* Watched */}
                    <div className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Pubs regardées</span>
                        <h4 className="text-xl font-black font-mono mt-1 text-white">{usageStats.adsWatchedToday.toLocaleString()}</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">aujourd'hui</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Distributed Points */}
                    <div className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Points distribués</span>
                        <h4 className="text-xl font-black font-mono mt-1 text-[#FFD700]">{usageStats.pointsDistributedToday.toLocaleString()}</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">aujourd'hui</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[#FFD700] flex items-center justify-center">
                        <Coins className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Taux de complétion</span>
                        <h4 className="text-xl font-black font-mono mt-1 text-[#00D9A5]">{usageStats.completionRate}%</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">indicateur qualité placement</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00D9A5] flex items-center justify-center">
                        <Percent className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ━━━━━━━━━━━━━━━━━━━ TAB: PROTECTED ZONES ━━━━━━━━━━━━━━━━━━━ */}
              {activeTab === 'protected_zones' && (
                <div className="space-y-6" id="view-protected-zones">
                  
                  {/* CONTEXT WARNING BANNER */}
                  <div className="bg-[#FF2D55]/6 border border-[#FF2D55]/25 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#FF2D55]/10 border border-[#FF2D55]/20 flex items-center justify-center text-[#FF2D55] shrink-0 mt-0.5">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Zones éthiquement protégées (No-Ads Rules)</h4>
                      <p className="text-xs text-gray-300 font-body leading-relaxed mt-1">
                        Ces zones ne montrent <strong>JAMAIS</strong> de publicité, quel que soit le réglage des emplacements. 
                        Désactiver une protection ici nécessite une confirmation explicite — ce n'est pas un réglage anodin. 
                        Nous accompagnons des hommes en situation de crise de vulnérabilité émotionnelle aiguë.
                      </p>
                    </div>
                  </div>

                  {/* LISTE DES ZONES */}
                  <div className="space-y-3.5">
                    {protectedZones.map((zone) => {
                      return (
                        <div
                          key={zone.id}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#16213E] border border-[#FF2D55]/15 rounded-2xl shadow-lg relative overflow-hidden"
                          id={`protected-zone-row-${zone.id}`}
                        >
                          {/* Accent border left for premium alert feedback */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1 ${zone.isLocked ? 'bg-[#FF2D55]' : 'bg-gray-500'}`} />

                          <div className="flex items-start sm:items-center gap-4 pl-1">
                            {/* Lock State Icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              zone.isLocked 
                                ? 'bg-[#FF2D55]/10 text-[#FF2D55] border-[#FF2D55]/20' 
                                : 'bg-gray-800 text-[#8E8E93] border-gray-700'
                            }`}>
                              {zone.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white font-body">{zone.name}</h4>
                                {zone.isPermanent && (
                                  <span className="text-[8px] font-black font-mono bg-[#FF2D55]/12 text-[#FF2D55] px-2 py-0.5 rounded border border-[#FF2D55]/30 uppercase tracking-widest">
                                    PERMANENT
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#8E8E93] font-body mt-0.5">{zone.description}</p>
                            </div>
                          </div>

                          {/* Switch toggle action */}
                          <div className="flex items-center justify-between md:justify-end gap-3 pl-14 sm:pl-0">
                            {zone.isPermanent ? (
                              <div className="group relative">
                                <button
                                  disabled
                                  className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-[#FF2D55] opacity-50 focus:outline-none"
                                >
                                  <span className="pointer-events-none inline-block h-5 w-5 transform translate-x-5 rounded-full bg-[#0F0F1A] shadow" />
                                </button>
                                {/* Tooltip on hover */}
                                <div className="absolute right-0 bottom-8 hidden group-hover:block bg-[#0F0F1A] text-white border border-[#FF2D55]/30 px-3 py-1 text-[10px] rounded shadow-2xl font-mono whitespace-nowrap z-30">
                                  Sécurité obligatoire non désactivable
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleToggleProtectedZone(zone)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  zone.isLocked ? 'bg-[#FF2D55]' : 'bg-[#5A5A5A]'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0F0F1A] shadow ring-0 transition duration-200 ease-in-out ${
                                    zone.isLocked ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL EDIT PLACEMENT */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-[#0F0F1A]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#16213E] border border-gray-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl"
            id="modal-edit-placement"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold font-headline text-white uppercase flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#FFD700]" />
                Modifier l'emplacement
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-[#0F0F1A] text-[#8E8E93] hover:text-white flex items-center justify-center border border-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlacement} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase mb-1.5">Nom de l'affichage</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0F0F1A] border border-gray-800 focus:border-[#FFD700] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase mb-1.5">Type de format publicitaire</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, type: 'RÉCOMPENSÉ' }))}
                    className={`py-3 rounded-xl border text-xs font-bold font-mono uppercase transition-all ${
                      editForm.type === 'RÉCOMPENSÉ'
                        ? 'bg-[#00D9A5]/12 border-[#00D9A5] text-[#00D9A5]'
                        : 'bg-[#0F0F1A] border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    RÉCOMPENSÉ (Opt-in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, type: 'INTERSTITIEL' }))}
                    className={`py-3 rounded-xl border text-xs font-bold font-mono uppercase transition-all ${
                      editForm.type === 'INTERSTITIEL'
                        ? 'bg-blue-500/12 border-blue-500 text-blue-400'
                        : 'bg-[#0F0F1A] border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    INTERSTITIEL (Plein écran)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase mb-1.5">Fréquence max par utilisateur par jour</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={editForm.maxDailyFrequency}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maxDailyFrequency: Number(e.target.value) }))}
                  className="w-full bg-[#0F0F1A] border border-gray-800 focus:border-[#FFD700] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase mb-1.5">Réseau SDK prioritaire (Cascade)</label>
                <select
                  value={editForm.priorityNetwork}
                  onChange={(e) => setEditForm(prev => ({ ...prev, priorityNetwork: e.target.value }))}
                  className="w-full bg-[#0F0F1A] border border-gray-800 focus:border-[#FFD700] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                >
                  {networks.map(n => (
                    <option key={n.id} value={n.id}>{n.name} (eCPM Moyen: {n.ecpm} DH)</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-wide border border-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-[#FFD700] hover:bg-[#E5C100] text-[#0F0F1A] font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-wide shadow-lg"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CONFIRM DISABLE MODAL (ZONES PROTÉGÉES) */}
      {confirmingZoneId && (
        <div className="fixed inset-0 bg-[#0F0F1A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#16213E] border border-[#FF2D55]/30 p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
            id="modal-confirm-disable"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF2D55]/10 flex items-center justify-center text-[#FF2D55] mb-4 border border-[#FF2D55]/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h3 className="text-base font-bold font-headline text-white mb-2 uppercase tracking-tight">
                Désactiver cette protection ?
              </h3>
              
              <p className="text-[#8E8E93] text-xs font-body mb-6 leading-relaxed">
                Des publicités pourront apparaître dans ce contexte. Vérifie que c'est vraiment ce que tu veux avant de continuer. 
                Une intrusion publicitaire à ce moment précis nuit à l'engagement d'un utilisateur en difficulté.
              </p>

              {/* Requirement Input */}
              <div className="w-full space-y-4">
                <div className="bg-[#0F0F1A] p-3 rounded-xl border border-gray-800 mb-2">
                  <p className="text-[10px] font-mono text-gray-500 uppercase">Pour confirmer, tapez mot-à-mot ci-dessous :</p>
                  <p className="text-xs font-bold font-mono text-white mt-1 select-all tracking-wider">DÉSACTIVER</p>
                </div>

                <input
                  type="text"
                  value={confirmTextInput}
                  onChange={(e) => setConfirmTextInput(e.target.value)}
                  placeholder="Tapez le mot de passe..."
                  className="w-full bg-[#0F0F1A] border border-gray-800 focus:border-[#FF2D55] rounded-xl px-4 py-3 text-sm text-center text-white focus:outline-none transition-all font-mono tracking-widest placeholder:tracking-normal placeholder:text-gray-600"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingZoneId(null);
                      setConfirmTextInput('');
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-all uppercase tracking-wide border border-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDisableZone}
                    disabled={confirmTextInput !== 'DÉSACTIVER'}
                    className="flex-1 bg-[#FF2D55] hover:bg-red-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition-all uppercase tracking-wide shadow-lg border border-[#FF2D55]/50"
                  >
                    Confirmer
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
