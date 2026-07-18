import React, { useState, useEffect } from 'react';
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
  ChevronDown,
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
  MessageSquare,
  Coins,
  Users,
  Trophy,
  Settings,
  FileText,
  XCircle,
  Palette
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
import { NutritionScreen } from './screens/energy/NutritionScreen';
import { ColdExposureScreen } from './screens/energy/ColdExposureScreen';
import { AdRewardsScreen } from './screens/gamification/AdRewardsScreen';
import { PointsLevelsScreen } from './screens/gamification/PointsLevelsScreen';
import { ClansScreen } from './screens/gamification/ClansScreen';
import { ChallengesScreen } from './screens/gamification/ChallengesScreen';
import { BadgesScreen } from './screens/gamification/BadgesScreen';
import { LeaderboardScreen } from './screens/gamification/LeaderboardScreen';
import { SubscriptionScreen } from './screens/subscription/SubscriptionScreen';
import { SubscriptionManagementScreen } from './screens/subscription/SubscriptionManagementScreen';
import { BillingHistoryScreen } from './screens/subscription/BillingHistoryScreen';
import { CancelRenewScreen } from './screens/subscription/CancelRenewScreen';
import { AIEngineScreen } from './screens/ai/AIEngineScreen';
import { AISettingsScreen } from './screens/ai/AISettingsScreen';

import { TokensTab } from './screens/dashboard/TokensTab';
import { PlaygroundTab } from './screens/dashboard/PlaygroundTab';

export default function App() {
  // Toast Management State
  interface ToastItem {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getInitialTabFromUrl = (): 'tokens' | 'playground' | 'dashboard' | 'architecture' | 'nutrition' | 'cold' | 'rewards' | 'points' | 'clans' | 'challenges' | 'badges' | 'leaderboard' | 'subscription' | 'subscription_mgmt' | 'billing_history' | 'cancel_renew' | 'ai_engine' | 'ai_settings' => {
    const path = window.location.pathname.replace(/^\//, '');
    const validTabs = ['tokens', 'playground', 'dashboard', 'architecture', 'nutrition', 'cold', 'rewards', 'points', 'clans', 'challenges', 'badges', 'leaderboard', 'subscription', 'subscription_mgmt', 'billing_history', 'cancel_renew', 'ai_engine', 'ai_settings'];
    if (validTabs.includes(path)) {
      return path as any;
    }
    return 'tokens';
  };

  const [activeTab, setActiveTab] = useState<'tokens' | 'playground' | 'dashboard' | 'architecture' | 'nutrition' | 'cold' | 'rewards' | 'points' | 'clans' | 'challenges' | 'badges' | 'leaderboard' | 'subscription' | 'subscription_mgmt' | 'billing_history' | 'cancel_renew' | 'ai_engine' | 'ai_settings'>(getInitialTabFromUrl);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const validTabs = ['tokens', 'playground', 'dashboard', 'architecture', 'nutrition', 'cold', 'rewards', 'points', 'clans', 'challenges', 'badges', 'leaderboard', 'subscription', 'subscription_mgmt', 'billing_history', 'cancel_renew', 'ai_engine', 'ai_settings'];
      if (validTabs.includes(path)) {
        setActiveTab(path as any);
      } else {
        setActiveTab('tokens');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const path = `/${activeTab}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ tab: activeTab }, '', path);
    }
  }, [activeTab]);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light' | 'green' | 'gold'>(() => {
    return (localStorage.getItem('alpha-theme') as any) || 'dark';
  });
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'green' | 'gold') => {
    setTheme(newTheme);
    localStorage.setItem('alpha-theme', newTheme);
    addToast('success', `Thème ${newTheme.toUpperCase()} activé !`);
  };

  const THEMES = [
    { id: 'dark', label: 'Dark Mode 🌌', color: 'bg-[#0F0F1A]', accent: 'bg-[#E94560]', desc: 'Noir Intense' },
    { id: 'light', label: 'Light Mode ☀️', color: 'bg-[#F4F5F7]', accent: 'bg-[#D41A3B]', desc: 'Jour Lumineux' },
    { id: 'green', label: 'Green Biz 🌿', color: 'bg-[#06100C]', accent: 'bg-[#10B981]', desc: 'Vert Business' },
    { id: 'gold', label: 'Gold Luxe 👑', color: 'bg-[#0A0A0A]', accent: 'bg-[#D4AF37]', desc: 'Style Or Royal' },
  ];

  const NAVIGATION_CATEGORIES = [
    {
      id: 'lab_design',
      label: 'Lab & Design',
      icon: <Sparkles className="w-4 h-4 text-[#FFD700]" />,
      pages: [
        { id: 'tokens', label: 'Design Tokens 🎨' },
        { id: 'playground', label: 'Component Lab 🧪' },
        { id: 'architecture', label: 'Architecture Tech 🏗️' },
      ]
    },
    {
      id: 'concept_app',
      label: 'Concept App',
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
      pages: [
        { id: 'dashboard', label: 'Tableau de Bord 📱' },
        { id: 'nutrition', label: 'Nutrition & Recettes 🍎' },
        { id: 'cold', label: 'Froid & Douches ❄️' },
        { id: 'ai_engine', label: 'Alpha AI Engine 🧠' },
        { id: 'ai_settings', label: 'Paramètres IA ⚙️' },
      ]
    },
    {
      id: 'gamification',
      label: 'Gamification',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      pages: [
        { id: 'points', label: 'Points & Niveaux 📈' },
        { id: 'rewards', label: 'Pubs & Récompenses 🪙' },
        { id: 'clans', label: 'Clans & Fraternité 🛡️' },
        { id: 'challenges', label: 'Défis & Quêtes ⚡' },
        { id: 'badges', label: 'Badges d\'Honneur 🎖️' },
        { id: 'leaderboard', label: 'Classement Général 🏆' },
      ]
    },
    {
      id: 'premium',
      label: 'Premium Access',
      icon: <Crown className="w-4 h-4 text-yellow-400 fill-current" />,
      pages: [
        { id: 'subscription', label: 'Offres d\'Abonnement 👑' },
      ]
    },
    {
      id: 'account',
      label: 'Mon Compte',
      icon: <Settings className="w-4 h-4 text-purple-400" />,
      pages: [
        { id: 'subscription_mgmt', label: 'Gestion d\'Abonnement ⚙️' },
        { id: 'billing_history', label: 'Historique de Factures 📄' },
        { id: 'cancel_renew', label: 'Résiliation & Renouvellement ❌' },
      ]
    }
  ];
  
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

  // Synchronize vitalityPoints state to persistent progressService
  useEffect(() => {
    const currentState = progressService.getState();
    if (currentState.totalPoints !== vitalityPoints) {
      currentState.totalPoints = vitalityPoints;
      progressService.saveState(currentState);
    }
  }, [vitalityPoints]);

  // Trigger relapse shake
  const handleRelapseTrigger = () => {
    setRelapseShake(true);
    addToast('error', 'Alerte Relapse détectée ! Restez focus, soldat.');
    setTimeout(() => setRelapseShake(false), 600);
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-[#0F0F1A] text-white flex flex-col font-body selection:bg-[#E94560]/40">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur-md border-b border-[#1A1A2E] px-3 py-2 md:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-row flex-wrap lg:flex-nowrap items-center justify-between gap-3">
          <div 
            className="flex items-center gap-2.5 shrink-0 cursor-pointer hover:opacity-90 active:scale-98 transition-all select-none"
            onClick={() => {
              setActiveTab('tokens');
              setOpenCategoryDropdown(null);
              addToast('info', 'Retour à la page d\'accueil default (Design Tokens) 🌌');
            }}
          >
            <div className="logo-icon-container w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E94560] via-[#1A1A2E] to-[#FFD700] p-[1.5px] flex items-center justify-center shadow-[0_0_12px_rgba(233,69,96,0.2)]">
              <div className="logo-icon-inner w-full h-full rounded-lg bg-[#0F0F1A] flex items-center justify-center font-headline font-black text-xs text-[#E94560] tracking-tighter">
                AM
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5">
              <h1 className="font-headline font-extrabold text-base md:text-lg tracking-wider text-white leading-none">
                <span className="gold-logo">ALPHA MAN</span>
              </h1>
              <p className="text-[9px] text-[#8E8E93] font-headline uppercase tracking-widest sm:border-l sm:border-gray-800 sm:pl-2.5 leading-none sm:self-center mt-0.5 sm:mt-0">
                Wellness Masculin de Niveau Mondial
              </p>
            </div>
          </div>

          {/* Navigation Toggles and Theme Switcher container */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center overflow-x-auto max-w-full p-1 bg-[#16213E]/60 rounded-xl border border-[#1A1A2E] whitespace-nowrap scrollbar-none gap-1.5 scroll-smooth shrink-0">
              {NAVIGATION_CATEGORIES.map((cat) => {
                const isActive = cat.pages.some(p => p.id === activeTab);
                const isOpen = openCategoryDropdown === cat.id;
                
                return (
                  <div key={cat.id} className="relative">
                    <button
                      onClick={() => {
                        if (isOpen) {
                          setOpenCategoryDropdown(null);
                        } else {
                          setOpenCategoryDropdown(cat.id);
                          // Automatically set to the first sub-page if none in this category are active
                          const hasActivePage = cat.pages.some(p => p.id === activeTab);
                          if (!hasActivePage) {
                            setActiveTab(cat.pages[0].id as any);
                          }
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-headline text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 border
                        ${isActive 
                          ? 'bg-[#E94560] text-white border-[#E94560] shadow-[0_0_15px_rgba(233,69,96,0.25)]' 
                          : 'text-[#8E8E93] hover:text-white bg-transparent border-transparent'
                        }
                      `}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-[#8E8E93]'}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <>
                        {/* Invisible click-away backdrop */}
                        <div 
                          className="fixed inset-0 z-40 bg-transparent cursor-default" 
                          onClick={() => setOpenCategoryDropdown(null)}
                        />
                        <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#16213E] border border-[#E94560]/20 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 flex flex-col gap-1 animate-[fade-in_0.15s_ease-out]">
                          <div className="px-2.5 py-1.5 border-b border-[#1A1A2E] mb-1">
                            <span className="text-[10px] font-bold text-[#E94560] uppercase tracking-widest font-headline">
                              Sélectionner une Page
                            </span>
                          </div>
                          {cat.pages.map((page) => {
                            const isPageActive = activeTab === page.id;
                            return (
                              <button
                                key={page.id}
                                onClick={() => {
                                  setActiveTab(page.id as any);
                                  setOpenCategoryDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg font-headline font-bold text-xs transition-all duration-150 flex items-center justify-between cursor-pointer border
                                  ${isPageActive 
                                    ? 'bg-[#E94560]/10 border-[#E94560]/30 text-white' 
                                    : 'text-[#8E8E93] hover:text-white hover:bg-[#1A1A2E]/50 border-transparent'
                                  }
                                `}
                              >
                                <span>{page.label}</span>
                                {isPageActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* THEME SWITCHER */}
            <div className="relative shrink-0">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-headline text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border border-[#E94560]/30 bg-[#16213E]/60 text-white hover:border-[#E94560] hover:bg-[#16213E] shadow-[0_0_15px_rgba(233,69,96,0.15)]"
              >
                <Palette className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="hidden sm:inline">THEMES</span>
                <span className="text-[9px] bg-[#E94560]/20 text-[#E94560] border border-[#E94560]/30 px-1 py-0.5 rounded font-mono leading-none">
                  {theme.toUpperCase()}
                </span>
              </button>

              {themeDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent cursor-default" 
                    onClick={() => setThemeDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#16213E] border border-[#E94560]/30 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 flex flex-col gap-1.5">
                    <div className="px-2.5 py-1.5 border-b border-[#1A1A2E] mb-1">
                      <span className="text-[10px] font-bold text-[#E94560] uppercase tracking-widest font-headline">
                        Sélectionner un Thème
                      </span>
                    </div>
                    {THEMES.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            handleThemeChange(t.id as any);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg font-headline font-bold text-xs transition-all duration-150 flex items-center justify-between cursor-pointer border
                            ${isSelected 
                              ? 'bg-[#E94560]/10 border-[#E94560]/30 text-white shadow-[0_0_10px_rgba(233,69,96,0.1)]' 
                              : 'text-[#8E8E93] hover:text-white hover:bg-[#1A1A2E]/50 border-transparent'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5 items-center p-0.5 rounded bg-black/40 border border-white/5">
                              <div className={`w-3 h-3 rounded-full ${t.color}`} />
                              <div className={`w-1.5 h-3 rounded-full ${t.accent}`} />
                            </div>
                            <div className="flex flex-col">
                              <span>{t.label}</span>
                              <span className="text-[9px] text-[#8E8E93] font-normal font-sans leading-none mt-0.5">
                                {t.desc}
                              </span>
                            </div>
                          </div>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8 pb-24">
        {/* ==================== 1. TOKENS TAB ==================== */}
        {activeTab === 'tokens' && (
          <TokensTab setActiveTab={setActiveTab} />
        )}

        {/* ==================== 2. COMPONENT LAB PLAYGROUND TAB ==================== */}
        {activeTab === 'playground' && (
          <PlaygroundTab addToast={addToast} onBack={() => setActiveTab('tokens')} />
        )}

        {/* ==================== 3. CONCEPT SHOWCASE APP TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8 animate-[fade-in_0.3s_ease-out]">
            
            {/* Concept App Header with Streak Flame, Avatar level */}
            <div className="tokens-banner grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gradient-to-r from-[#16213E]/80 to-[#1A1A2E]/80 p-6 rounded-3xl border border-[#E94560]/10">
              
              {/* User overview */}
              <div className="flex items-center gap-4">
                <AlphaAvatar level={42} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-extrabold text-lg text-white">YAHYA K.</h3>
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
          <AlphaArchitecture addToast={addToast} onBack={() => setActiveTab('tokens')} />
        )}

        {activeTab === 'nutrition' && (
          <NutritionScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'cold' && (
          <ColdExposureScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} vitalityPoints={vitalityPoints} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
        )}

        {activeTab === 'rewards' && (
          <AdRewardsScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} vitalityPoints={vitalityPoints} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
        )}

        {activeTab === 'points' && (
          <PointsLevelsScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} vitalityPoints={vitalityPoints} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
        )}

        {activeTab === 'clans' && (
          <ClansScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'challenges' && (
          <ChallengesScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} vitalityPoints={vitalityPoints} onPointsUpdate={(pts) => setVitalityPoints(pts)} />
        )}

        {activeTab === 'badges' && (
          <BadgesScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'subscription_mgmt' && (
          <SubscriptionManagementScreen 
            addToast={addToast} 
            onBack={() => setActiveTab('dashboard')}
            onNavigateToPlans={() => setActiveTab('subscription')}
          />
        )}

        {activeTab === 'billing_history' && (
          <BillingHistoryScreen 
            addToast={addToast} 
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'cancel_renew' && (
          <CancelRenewScreen 
            addToast={addToast} 
            onBack={() => setActiveTab('dashboard')}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'ai_engine' && (
          <AIEngineScreen 
            addToast={addToast} 
            onBack={() => setActiveTab('dashboard')}
            onNavigateToSettings={() => setActiveTab('ai_settings')}
          />
        )}

        {activeTab === 'ai_settings' && (
          <AISettingsScreen 
            addToast={addToast} 
            onBack={() => setActiveTab('ai_engine')}
          />
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
