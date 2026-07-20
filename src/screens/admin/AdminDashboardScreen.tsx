import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  AlertCircle, 
  Flag, 
  BarChart2, 
  DollarSign, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Eye,
  EyeOff,
  UserPlus,
  Award,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ addToast, onBack }) => {
  // Access Gate Security State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('alpha_admin_unlocked') === 'true';
  });
  const [accessCodeInput, setAccessCodeInput] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);

  // Period filter State
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stats Data State
  const [stats, setStats] = useState({
    totalUsers: 24152,
    totalUsersDelta: 12.4,
    mrr: 290450,
    mrrDelta: 8.2,
    activeToday: 4812,
    activeTodayDelta: 15.1,
    conversionRate: 8.4,
    conversionRateDelta: -1.2
  });

  // subscriptionBreakdown Tier breakdown state
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState([
    { tier: 'FREE', label: 'Accès Libre', count: 10868, percentage: 45, color: 'bg-gray-400' },
    { tier: 'BASIC', label: 'Guerrier Novice', count: 4830, percentage: 20, color: 'bg-blue-400' },
    { tier: 'PREMIUM', label: 'Souverain d\'Élite', count: 5554, percentage: 23, color: 'bg-purple-500' },
    { tier: 'ELITE', label: 'Confrère de l\'Ombre', count: 2173, percentage: 9, color: 'bg-yellow-400' },
    { tier: 'ALPHA', label: 'Légende Absolue', count: 727, percentage: 3, color: 'bg-emerald-400' }
  ]);

  // Streak distribution
  const [streakDistribution, setStreakDistribution] = useState([
    { range: '0-7j', count: 12450 },
    { range: '8-30j', count: 6820 },
    { range: '31-90j', count: 3120 },
    { range: '91-365j', count: 1320 },
    { range: '365j+', count: 442 }
  ]);

  // Moderation summary state
  const [moderationQueue, setModerationQueue] = useState({
    stories: 3,
    forumThreads: 2,
    chatReports: 1,
    expertQuestions: 1,
    total: 7
  });

  // Recent activity log
  const [recentActivity, setRecentActivity] = useState([
    { id: 'act-1', type: 'user-plus', text: 'Nouveau guerrier souverain inscrit depuis Casablanca', timestamp: 'Il y a 5 min' },
    { id: 'act-2', type: 'credit-card', text: 'Abonnement PREMIUM activé par un membre de la Confrérie', timestamp: 'Il y a 12 min' },
    { id: 'act-3', type: 'flag', text: 'Message signalé pour révision dans le chat du Clan Alpha', timestamp: 'Il y a 24 min' },
    { id: 'act-4', type: 'award', text: 'Palier légendaire de 90 jours validé par @Guerrier_Elite', timestamp: 'Il y a 45 min' },
    { id: 'act-5', type: 'user-plus', text: 'Nouveau guerrier souverain inscrit depuis Marrakech', timestamp: 'Il y a 1h' },
    { id: 'act-6', type: 'credit-card', text: 'Mise à niveau vers le Tier ALPHA (Légende Absolue) par @Souverain77', timestamp: 'Il y a 1h 30' },
    { id: 'act-7', type: 'flag', text: 'Sujet du forum mis en attente suite à 3 signalements', timestamp: 'Il y a 2h' },
    { id: 'act-8', type: 'award', text: 'Niveau d\'Honneur 10 atteint par @Confrere_Spartiate', timestamp: 'Il y a 3h' }
  ]);

  // Fetch admin dashboard data from Express backend
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch core stats
      const statsRes = await fetch(`/api/admin/stats?period=${selectedPeriod}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch subscription breakdown
      const subRes = await fetch('/api/admin/subscriptions/breakdown');
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscriptionBreakdown(subData);
      }

      // Fetch streaks distribution
      const streakRes = await fetch('/api/admin/streaks/distribution');
      if (streakRes.ok) {
        const streakData = await streakRes.json();
        setStreakDistribution(streakData);
      }

      // Fetch moderation summary
      const modRes = await fetch('/api/admin/moderation/queue-summary');
      if (modRes.ok) {
        const modData = await modRes.json();
        setModerationQueue(modData);
      }

      // Fetch recent activity
      const actRes = await fetch(`/api/admin/activity/recent?period=${selectedPeriod}`);
      if (actRes.ok) {
        const actData = await actRes.json();
        setRecentActivity(actData);
      }
    } catch (error) {
      console.warn("Using offline fallback data for Admin Dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchDashboardData();
    }
  }, [selectedPeriod, isUnlocked]);

  // Unlock handling
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

  const handleLockAdmin = () => {
    setIsUnlocked(false);
    localStorage.removeItem('alpha_admin_unlocked');
    setAccessCodeInput('');
    addToast('info', 'Session administrateur déconnectée avec succès.');
  };

  // Click on moderation queues
  const handleModerationQueueClick = (system: string) => {
    addToast('info', `L'outil de modération complet arrive dans le prochain module (${system}) 🛡️`);
  };

  // Click on modules cards
  const handleModuleCardClick = (moduleName: string) => {
    addToast('info', `Le module "${moduleName}" sera disponible dans la prochaine mise à jour admin ⚙️`);
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
    <div className="flex-1 bg-[#0F0F1A] text-white flex flex-col font-sans">
      
      {/* HEADER SECTION */}
      <header className="bg-[#0F0F1A] border-b border-[#1A1A2E] px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-[#FFD700] flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tighter text-white font-headline">ALPHA MAN HQ</span>
              <span className="bg-[#FFD700] text-[#0F0F1A] text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-mono select-none">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-sans mt-0.5">Console de modération, d'analyse comportementale et d'infrastructure souveraine</p>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Period selector */}
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-xl p-1 flex items-center">
            {[
              { id: 'today', label: "Aujourd'hui" },
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: 'all', label: 'Tout' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as any)}
                className={`text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === period.id
                    ? 'bg-[#FFD700] text-[#0F0F1A] font-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            title="Rafraîchir les données"
            className="p-2.5 bg-[#16213E] hover:bg-[#1E2E56] border border-gray-800 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FFD700]' : ''}`} />
          </button>

          <button
            onClick={handleLockAdmin}
            className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl font-bold transition-all"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* DYNAMIC METRICS CARDS */}
      <section className="px-8 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STAT CARD 1 */}
        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 hover:border-gray-700 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Utilisateurs Totaux</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-mono text-white">
              {isLoading ? '...' : stats.totalUsers.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {stats.totalUsersDelta >= 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                  <span className="text-[11px] font-bold text-[#00D9A5]">+{stats.totalUsersDelta}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                  <span className="text-[11px] font-bold text-[#FF2D55]">{stats.totalUsersDelta}%</span>
                </>
              )}
              <span className="text-[9px] text-gray-500 font-sans">vs période précédente</span>
            </div>
          </div>
        </div>

        {/* STAT CARD 2 */}
        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 hover:border-gray-700 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Revenu Récurrent (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-mono text-white">
              {isLoading ? '...' : `${stats.mrr.toLocaleString()} DH`}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {stats.mrrDelta >= 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                  <span className="text-[11px] font-bold text-[#00D9A5]">+{stats.mrrDelta}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                  <span className="text-[11px] font-bold text-[#FF2D55]">{stats.mrrDelta}%</span>
                </>
              )}
              <span className="text-[9px] text-gray-500 font-sans">vs période précédente</span>
            </div>
          </div>
        </div>

        {/* STAT CARD 3 */}
        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 hover:border-gray-700 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Actifs Aujourd'hui</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-mono text-white">
              {isLoading ? '...' : stats.activeToday.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {stats.activeTodayDelta >= 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                  <span className="text-[11px] font-bold text-[#00D9A5]">+{stats.activeTodayDelta}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                  <span className="text-[11px] font-bold text-[#FF2D55]">{stats.activeTodayDelta}%</span>
                </>
              )}
              <span className="text-[9px] text-gray-500 font-sans">vs hier même heure</span>
            </div>
          </div>
        </div>

        {/* STAT CARD 4 */}
        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 hover:border-gray-700 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Taux de Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-mono text-white">
              {isLoading ? '...' : `${stats.conversionRate}%`}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {stats.conversionRateDelta >= 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-[#00D9A5]" />
                  <span className="text-[11px] font-bold text-[#00D9A5]">+{stats.conversionRateDelta}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-[#FF2D55]" />
                  <span className="text-[11px] font-bold text-[#FF2D55]">{stats.conversionRateDelta}%</span>
                </>
              )}
              <span className="text-[9px] text-gray-500 font-sans">Free → Payant</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY HEALTH GRAPHS */}
      <section className="px-8 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* SUBSCRIPTION BREAKDOWN CARD */}
        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-[24px] p-6 text-left shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider">
              RÉPARTITION DES ABONNEMENTS
            </h4>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Abonnés payants : 13 284</span>
          </div>

          <div className="space-y-4">
            {subscriptionBreakdown.map((item) => {
              // Calculate width percentage safely
              return (
                <div key={item.tier} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="font-bold text-white">{item.tier}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({item.label})</span>
                    </div>
                    <div className="font-mono text-[11px]">
                      <span className="text-white font-bold">{item.count.toLocaleString()} u.</span>
                      <span className="text-gray-500 ml-1.5">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#0F0F1A] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STREAKS DISTRIBUTION CARD */}
        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-[24px] p-6 text-left shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider">
              DISTRIBUTION DES STREAKS (SOBRIÉTÉ)
            </h4>
            <span className="text-[9px] font-mono text-[#00D9A5] uppercase tracking-widest">Rétention Élite</span>
          </div>

          {/* SVG mini chart */}
          <div className="h-[200px] flex items-end justify-between gap-3 pt-6 px-2">
            {streakDistribution.map((col, idx) => {
              const maxVal = Math.max(...streakDistribution.map(d => d.count));
              const heightPercent = maxVal > 0 ? (col.count / maxVal) * 160 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <div className="text-[10px] font-mono text-gray-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-all">
                    {col.count.toLocaleString()}
                  </div>
                  <div className="w-full relative rounded-t-lg bg-[#111124] overflow-hidden flex items-end" style={{ height: '160px' }}>
                    <div 
                      className="w-full bg-[#FFD700] hover:bg-yellow-500 rounded-t-md transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,215,0,0.2)]" 
                      style={{ height: `${heightPercent}px` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-black text-white mt-2 tracking-wider">
                    {col.range}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* MODERATION QUEUE OVERVIEW */}
      <section className="px-8 mt-6">
        <div className="flex items-center gap-2 mb-3.5">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h4 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider">
            FILE DE MODÉRATION (SYSTÈMES DE LA CONFRÉRIE)
          </h4>
        </div>

        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-[24px] overflow-hidden shadow-lg">
          <div className="divide-y divide-gray-800/60 text-left">
            
            {/* ROW 1 */}
            <div 
              onClick={() => handleModerationQueueClick('Récits')}
              className="flex items-center justify-between p-4.5 px-6 hover:bg-[#1E2E56]/30 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <h5 className="text-xs font-bold text-white">Récits & Paliers (Stories)</h5>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Parcours souverains déclarés en attente de vérification communautaire</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {moderationQueue.stories > 0 ? (
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    ⚠️ {moderationQueue.stories} À RÉVISER
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    À JOUR
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            {/* ROW 2 */}
            <div 
              onClick={() => handleModerationQueueClick('Forum')}
              className="flex items-center justify-between p-4.5 px-6 hover:bg-[#1E2E56]/30 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <h5 className="text-xs font-bold text-white">Fils de Discussion du Forum</h5>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Sujets signalés ou mis de côté pour infraction à la charte d'honneur</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {moderationQueue.forumThreads > 0 ? (
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    ⚠️ {moderationQueue.forumThreads} REPORTÉS
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    À JOUR
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            {/* ROW 3 */}
            <div 
              onClick={() => handleModerationQueueClick('Chat')}
              className="flex items-center justify-between p-4.5 px-6 hover:bg-[#1E2E56]/30 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <div>
                  <h5 className="text-xs font-bold text-white">Messages du Chat du Clan</h5>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Historiques de conversations signalés par les modérateurs de combat</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {moderationQueue.chatReports > 0 ? (
                  <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    ⚠️ {moderationQueue.chatReports} EN ATTENTE
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    À JOUR
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            {/* ROW 4 */}
            <div 
              onClick={() => handleModerationQueueClick('Experts')}
              className="flex items-center justify-between p-4.5 px-6 hover:bg-[#1E2E56]/30 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <div>
                  <h5 className="text-xs font-bold text-white">Questions & Alertes Détresse</h5>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Requêtes urgentes avec marqueur de détresse psychologique</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {moderationQueue.expertQuestions > 0 ? (
                  <span className="bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    🚨 {moderationQueue.expertQuestions} SÉCURITÉ ACTIVE
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    CALME
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>

          </div>

          {/* Footer stats badge */}
          <div className="bg-[#111124] px-6 py-4 border-t border-gray-800 text-left">
            <span className="text-[11px] font-bold text-[#FFD700] font-mono uppercase tracking-wider">
              🛡️ {moderationQueue.total} ÉLÉMENTS EN ATTENTE AU TOTAL SUR 4 SYSTÈMES ACTIFS
            </span>
          </div>
        </div>
      </section>

      {/* MODULES NAVIGATION CARD SECTION */}
      <section className="px-8 mt-6">
        <h4 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider mb-4 text-left">
          NAVIGUER VERS LES MODULES DE COMMANDEMENT
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1 CONTENT */}
          <div 
            onClick={() => handleModuleCardClick('Gestion de Contenu')}
            className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 cursor-pointer hover:border-[#FFD700]/40 hover:-translate-y-0.5 transition-all duration-300 shadow-md text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Gestion de Contenu</h5>
              <p className="text-[10px] text-gray-400 mt-1 font-sans leading-relaxed">Leçons de combat, défis physiques, profil experts, catalogue de recettes & douches froides.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center justify-between">
              <span className="bg-[#1A1A2E] text-gray-500 text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-md">
                Bientôt disponible
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

          {/* CARD 2 MODERATION */}
          <div 
            onClick={() => handleModuleCardClick('Modération')}
            className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 cursor-pointer hover:border-[#FFD700]/40 hover:-translate-y-0.5 transition-all duration-300 shadow-md text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Modération</h5>
              <p className="text-[10px] text-gray-400 mt-1 font-sans leading-relaxed">Gestion complète des récits, fils, chat de clans, signalements croisés et fiches de sanctions.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center justify-between">
              <span className="bg-[#1A1A2E] text-gray-500 text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-md">
                Bientôt disponible
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

          {/* CARD 3 ANALYTICS */}
          <div 
            onClick={() => handleModuleCardClick('Analytics')}
            className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 cursor-pointer hover:border-[#FFD700]/40 hover:-translate-y-0.5 transition-all duration-300 shadow-md text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] mb-4">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Analytics</h5>
              <p className="text-[10px] text-gray-400 mt-1 font-sans leading-relaxed">Suivi des cohortes, taux de rétention des streaks, churn d'abonnement, taux de conversion.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center justify-between">
              <span className="bg-[#1A1A2E] text-gray-500 text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-md">
                Bientôt disponible
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

          {/* CARD 4 PUBLICITY */}
          <div 
            onClick={() => handleModuleCardClick('Gestion Publicité')}
            className="bg-[#16213E] border border-[#1C1C3A] rounded-2xl p-5 cursor-pointer hover:border-[#FFD700]/40 hover:-translate-y-0.5 transition-all duration-300 shadow-md text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Gestion Publicité</h5>
              <p className="text-[10px] text-gray-400 mt-1 font-sans leading-relaxed">Emplacements pubs sponsorisées, seuils de récompenses en tokens, calcul de CPM et revenus.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center justify-between">
              <span className="bg-[#1A1A2E] text-gray-500 text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-md">
                Bientôt disponible
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

        </div>
      </section>

      {/* RECENT ACTIVITY LOGS */}
      <section className="px-8 mt-6 mb-12">
        <h4 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider mb-4 text-left">
          ACTIVITÉ RÉCENTE (ÉVÉNEMENTS EN DIRECT)
        </h4>

        <div className="bg-[#16213E] border border-[#1C1C3A] rounded-[24px] overflow-hidden shadow-lg">
          <div className="divide-y divide-gray-800/50 text-left">
            {recentActivity.map((activity) => {
              // Icon selector
              let iconComponent = <UserPlus className="w-4 h-4 text-emerald-400" />;
              if (activity.type === 'credit-card') {
                iconComponent = <CreditCard className="w-4 h-4 text-[#FFD700]" />;
              } else if (activity.type === 'flag') {
                iconComponent = <Flag className="w-4 h-4 text-red-400" />;
              } else if (activity.type === 'award') {
                iconComponent = <Award className="w-4 h-4 text-purple-400" />;
              }

              return (
                <div key={activity.id} className="p-4 px-6 flex items-center justify-between gap-3 hover:bg-[#1E2E56]/15 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0F0F1A] border border-gray-800/60 flex items-center justify-center shrink-0">
                      {iconComponent}
                    </div>
                    <span className="text-xs font-medium text-gray-200">{activity.text}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono shrink-0 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activity.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
