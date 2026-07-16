import React, { useState } from 'react';
import { 
  ArrowLeft,
  Crown,
  HelpCircle,
  Check,
  X,
  ShieldCheck,
  Lock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Code,
  Copy,
  Settings,
  CreditCard,
  Calendar,
  Repeat,
  PauseCircle,
  AlertTriangle,
  Gift,
  Download,
  Smartphone,
  Globe,
  Sparkles
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface SubscriptionManagementScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNavigateToPlans?: () => void;
}

export const SubscriptionManagementScreen: React.FC<SubscriptionManagementScreenProps> = ({ 
  addToast, 
  onBack,
  onNavigateToPlans
}) => {
  // Simulator states
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState<boolean>(false);
  
  // Subscription state (Starts as active Premium)
  const [currentPlan, setCurrentPlan] = useState<any>({
    id: 'premium',
    name: "PREMIUM",
    tier: "Optimisé",
    price: 59,
    period: "Facturé mensuellement",
    status: 'active', // active, paused, canceling
    startDate: "15 juillet 2026",
    nextBillingDate: "15 août 2026",
    daysRemaining: 21,
    totalDays: 30,
    features: [
      { text: "Kegel complet (10 niveaux)", included: true, badge: "ILLIMITÉ" },
      { text: "5 techniques de respiration", included: true, badge: "ILLIMITÉ" },
      { text: "Tracker complet 5 piliers", included: true, badge: "ILLIMITÉ" },
      { text: "ZÉRO publicité", included: true, badge: "ACTIF" },
      { text: "IA Alpha Engine", included: true, badge: "ACTIF" },
      { text: "Plans personnalisés IA", included: true, badge: "ACTIF" },
      { text: "Stats avancées + prédictions", included: true, badge: "ACTIF" },
      { text: "Support prioritaire", included: true, badge: "ACTIF" }
    ]
  });

  // Credit Card state
  const [paymentMethod, setPaymentMethod] = useState<any>({
    type: 'card',
    label: "Carte Bancaire",
    last4: "4242",
    expiry: "12/27",
    cardHolder: "YOUSSEF EL ALAMI"
  });

  // Edit card form states
  const [editCardNumber, setEditCardNumber] = useState<string>('');
  const [editExpiry, setEditExpiry] = useState<string>('');
  const [editCvv, setEditCvv] = useState<string>('');
  const [editHolder, setEditHolder] = useState<string>('');

  // Billing history
  const [invoices, setInvoices] = useState([
    { id: 'FAC-2026-0715', number: "FAC-2026-0715", date: "15 juillet 2026", amount: 59, status: 'paid' },
    { id: 'FAC-2026-0615', number: "FAC-2026-0615", date: "15 juin 2026", amount: 59, status: 'paid' },
    { id: 'FAC-2026-0515', number: "FAC-2026-0515", date: "15 mai 2026", amount: 59, status: 'paid' }
  ]);

  const [pauseDuration, setPauseDuration] = useState<number>(1); // 1, 2, or 3 months

  // Handle invoice download simulation
  const handleDownloadInvoice = (id: string) => {
    addToast('success', `Téléchargement de la facture ${id} lancé (format PDF sécurisé CMI) ! 📄`);
  };

  // Confirm cancel action with retention offer acceptance or full cancellation
  const handleConfirmCancel = () => {
    setCurrentPlan((prev: any) => ({
      ...prev,
      status: 'canceling',
      nextBillingDate: "Abonnement résilié - Accès jusqu'au 15 août 2026"
    }));
    setShowCancelModal(false);
    addToast('warning', "Abonnement résilié. Tu gardes l'accès PREMIUM jusqu'au 15 août 2026. Reviens quand tu veux, Guerrier ! 🛡️");
  };

  // Accept discount retention offer (-30% off, stays Premium for 41 DH instead of 59 DH)
  const handleAcceptRetentionOffer = () => {
    setCurrentPlan((prev: any) => ({
      ...prev,
      price: 41,
      period: "Tarif spécial de rétention (-30%)"
    }));
    // Append a notification or update list
    setShowCancelModal(false);
    addToast('success', "Offre acceptée ! Tarif réduit à 41 DH/mois appliqué pour les 3 prochains mois. Restons forts ensemble ! 🚀");
  };

  // Pause subscription simulation
  const handleConfirmPause = () => {
    setCurrentPlan((prev: any) => ({
      ...prev,
      status: 'paused',
      nextBillingDate: `En pause pour ${pauseDuration} mois (Reprise automatique)`
    }));
    setShowPauseModal(false);
    addToast('info', `Abonnement mis en pause pour ${pauseDuration} mois. Aucune facturation pendant cette période ! ⏸️`);
  };

  // Update card payment simulator
  const handleUpdatePayment = () => {
    if (!editCardNumber || !editExpiry || !editCvv) {
      addToast('error', "Veuillez remplir tous les champs de la carte.");
      return;
    }
    const last4digits = editCardNumber.replace(/\s/g, '').slice(-4) || "9988";
    setPaymentMethod({
      type: 'card',
      label: "Carte Bancaire",
      last4: last4digits,
      expiry: editExpiry,
      cardHolder: editHolder.toUpperCase() || "TITULAIRE"
    });
    setShowUpdatePaymentModal(false);
    addToast('success', "Moyen de paiement CMI mis à jour avec succès ! 💳");
  };

  const expoNativeCode = `import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Modal 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

export default function SubscriptionManagementScreen({ navigation }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    name: "PREMIUM",
    price: 59,
    status: 'active',
    nextBillingDate: '15 août 2026',
    daysRemaining: 21
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.touchTarget} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MON ABONNEMENT</Text>
        <TouchableOpacity style={styles.touchTarget}>
          <Feather name="help-circle" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* PLAN CARD */}
        <View style={styles.mainCard}>
          <Text style={styles.planBadge}>{currentPlan.name}</Text>
          <Text style={styles.statusBadge}>{currentPlan.status.toUpperCase()}</Text>
          
          <Text style={styles.planTitle}>{currentPlan.name}</Text>
          <Text style={styles.priceText}>{currentPlan.price} DH / mois</Text>
          <Text style={styles.billingText}>Prochain paiement : {currentPlan.nextBillingDate}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontFamily: 'Montserrat-Bold', color: '#FFD700', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  mainCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, borderColor: '#00D9A5', borderWidth: 2, position: 'relative' },
  planBadge: { position: 'absolute', top: 24, left: 24, backgroundColor: '#00D9A5', color: '#0F0F1A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold' },
  statusBadge: { position: 'absolute', top: 24, right: 24, backgroundColor: 'rgba(0,217,165,0.2)', color: '#00D9A5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: 'bold' },
  planTitle: { fontSize: 24, fontWeight: 'bold', color: '#00D9A5', textAlign: 'center', marginTop: 32 },
  priceText: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginTop: 16 },
  billingText: { fontSize: 13, color: '#FFD700', textAlign: 'center', marginTop: 16 }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source de la gestion d'abonnement copié ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-widest bg-[#00D9A5]/10 border border-[#00D9A5]/20 px-2 rounded-md">
            Portail de Gestion (7.2)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Gestion d'Abonnement Actif & Rétention — SubscriptionManagementScreen
          </h2>
          <p className="text-xs text-gray-400">
            Pilotez votre plan, téléchargez les factures locales CMI, mettez à jour votre carte bancaire ou suspendez l'abonnement.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
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

      {/* REACT NATIVE CODE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">SubscriptionManagementScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Gère l'affichage dynamique de la progression temporelle, les barres d'expiration et les offres de rétention d'acier.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyExpoCode}
              className="flex items-center gap-2 text-[10px] font-headline"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le Code Natif'}
            </AlphaButton>
          </div>
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[350px] custom-scrollbar">
            {expoNativeCode}
          </pre>
        </div>
      )}

      {/* MAIN TWO PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: ADMIN CONTROLS FOR PORTAL SIMULATOR */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console de Portail Client
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Modifiez l'état de l'abonnement simulé pour valider tous les flows d'interface.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Quick adjusters */}
            <div className="space-y-2">
              <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                Contrôles Temporels
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span>Jours restants</span>
                  <span className="text-[#00D9A5] font-mono font-bold">{currentPlan.daysRemaining} / 30 jours</span>
                </div>
                <input 
                  type="range" min="1" max="30" value={currentPlan.daysRemaining} 
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    setCurrentPlan((prev: any) => ({
                      ...prev,
                      daysRemaining: days
                    }));
                  }}
                  className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Quick notification trigger */}
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                Alertes de Facturation
              </span>
              <button
                onClick={() => {
                  addToast('warning', "Alerte : Échec du renouvellement automatique CMI (Problème de solde). Veuillez mettre à jour votre carte bancaire.");
                }}
                className="w-full py-2 bg-[#FF2D55]/10 border border-[#FF2D55]/20 hover:bg-[#FF2D55]/20 text-[#FF2D55] text-xs font-bold rounded-xl transition-all"
              >
                Simuler Échec de Paiement
              </button>
            </div>

            <div className="bg-[#16213E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-400 leading-normal font-headline">
              ℹ️ <strong>Rétention -30% :</strong> Si un utilisateur clique sur "Annuler l'abonnement", une card de rétention lui offre instantanément 30% de remise sur le plan actuel pour conserver son élan de discipline.
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW SIMULATOR */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* Status Bar */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>13:59</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#FFD700] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-950 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xs font-headline font-black tracking-widest text-[#FFD700] uppercase">
                  Mon Abonnement
                </h1>
                <button 
                  onClick={() => addToast('info', "Contact du support d'acier ouvert... 🛡️")}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-400"
                >
                  <HelpCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* STREAM AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: PLAN ACTUEL (CARD PRINCIPALE) */}
                <div className="bg-gradient-to-br from-[#16213E] to-[#1A1A2E] rounded-[24px] p-6 border-2 border-[#00D9A5] shadow-2xl relative text-center space-y-4">
                  
                  {/* Absolute badges */}
                  <span className="absolute top-5 left-5 bg-[#00D9A5] text-[#0F0F1A] px-3 py-0.5 rounded text-[9px] font-headline font-black tracking-widest">
                    {currentPlan.name}
                  </span>

                  <span className={`absolute top-5 right-5 px-2 py-0.5 rounded text-[8px] font-headline font-black tracking-wider uppercase
                    ${currentPlan.status === 'active' ? 'bg-[#00D9A5]/20 text-[#00D9A5]' : ''}
                    ${currentPlan.status === 'paused' ? 'bg-[#FF9500]/20 text-[#FF9500]' : ''}
                    ${currentPlan.status === 'canceling' ? 'bg-[#FF2D55]/20 text-[#FF2D55]' : ''}
                  `}>
                    {currentPlan.status}
                  </span>

                  {/* Icon representation */}
                  <div className="w-16 h-16 rounded-[20px] bg-[#00D9A5]/15 flex items-center justify-center mx-auto text-[#00D9A5] mt-6 shadow-md">
                    <Zap className="w-8 h-8" />
                  </div>

                  {/* Plan details */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-headline font-black text-[#00D9A5] tracking-tight uppercase leading-none">
                      {currentPlan.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-headline">
                      {currentPlan.tier} — IA & Personnalisation Complète
                    </p>
                  </div>

                  {/* Pricing details */}
                  <div className="space-y-1 pt-1.5 border-t border-white/5 max-w-[240px] mx-auto">
                    <span className="text-lg font-mono font-black text-white block">
                      {currentPlan.price} DH / mois
                    </span>
                    <span className="text-[10px] text-gray-500 font-headline block uppercase tracking-wider leading-none">
                      {currentPlan.period}
                    </span>
                  </div>

                  {/* Next billing date and timeline progress */}
                  <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#FFD700] font-headline font-black">
                      <Calendar className="w-4 h-4" />
                      <span>{currentPlan.nextBillingDate}</span>
                    </div>

                    {currentPlan.status === 'active' && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-headline">
                          <span>Abonnement entamé</span>
                          <span className="text-white font-bold">{currentPlan.daysRemaining} jours restants</span>
                        </div>
                        {/* Days bar */}
                        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#00D9A5] rounded-full transition-all duration-500" 
                            style={{ width: `${(currentPlan.daysRemaining / 30) * 100}%` }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-600 font-headline block">
                    Souscrit le 15 juillet 2026 à Casablanca via CMI
                  </span>

                </div>

                {/* SECTION 2: DÉTAILS DU PLAN (FEATURES) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1 text-left">
                    Ce Qui Est Inclus
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 divide-y divide-gray-950">
                    {currentPlan.features.map((f: any, idx: number) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs font-headline">
                        <div className="flex items-center gap-2.5 text-left">
                          <Check className="w-4.5 h-4.5 text-[#00D9A5] flex-shrink-0" />
                          <span className="text-gray-300 font-medium">{f.text}</span>
                        </div>
                        <span className="text-[8px] bg-[#00D9A5]/10 text-[#00D9A5] border border-[#00D9A5]/20 rounded px-1.5 py-0.5 font-bold tracking-wider">
                          {f.badge}
                        </span>
                      </div>
                    ))}

                    {/* Excluded premium features example */}
                    <div className="py-2.5 pt-3 flex justify-between items-center text-xs font-headline border-t border-dashed border-gray-800">
                      <div className="flex items-center gap-2.5 text-left opacity-40">
                        <X className="w-4.5 h-4.5 text-gray-600 flex-shrink-0" />
                        <span className="text-gray-500 line-through">Coaching vocal 1-on-1 (ELITE)</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (onNavigateToPlans) onNavigateToPlans();
                          else addToast('info', "Redirection vers le comparatif des plans pour upgrade...");
                        }}
                        className="bg-[#FFD700] text-[#0F0F1A] px-2 py-0.5 rounded text-[8px] font-headline font-black uppercase tracking-wider cursor-pointer"
                      >
                        UPGRADE
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: MOYEN DE PAIEMENT */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1 text-left">
                    Moyen de Paiement CMI
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] flex-shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <h4 className="text-xs font-headline font-black text-white">
                            {paymentMethod.label} (Visa/cmi)
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-gray-400 block leading-none">
                            **** **** **** {paymentMethod.last4}
                          </span>
                          <span className="text-[10px] text-gray-500 font-headline block pt-1 leading-none">
                            Expire {paymentMethod.expiry} — {paymentMethod.cardHolder}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setEditCardNumber('');
                          setEditExpiry('');
                          setEditCvv('');
                          setEditHolder(paymentMethod.cardHolder);
                          setShowUpdatePaymentModal(true);
                        }}
                        className="h-8 px-3.5 bg-[#FFD700]/10 hover:bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/25 rounded-lg text-[9px] font-headline font-black uppercase tracking-wider cursor-pointer"
                      >
                        MODIFIER
                      </button>
                    </div>

                    {/* Secondary local channels row */}
                    <div className="grid grid-cols-2 gap-2 text-left opacity-40">
                      <div className="bg-[#1A1A2E] p-2 rounded-xl border border-white/5 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] font-headline text-gray-500">Jawal Pay (indisp.)</span>
                      </div>
                      <div className="bg-[#1A1A2E] p-2 rounded-xl border border-white/5 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] font-headline text-gray-500">PayPal (indisp.)</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center font-headline block">
                      🔒 Tes informations financières de carte marocaine sont stockées de façon cryptée par le CMI.
                    </p>
                  </div>
                </div>

                {/* SECTION 4: HISTORIQUE DE FACTURATION */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider">
                      Factures CMI
                    </h3>
                    <button 
                      onClick={() => addToast('info', "Chargement de tout l'historique de facturation...")}
                      className="text-[11px] font-headline text-gray-400 hover:text-white"
                    >
                      VOIR TOUT
                    </button>
                  </div>

                  <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 divide-y divide-gray-950">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="py-3 flex justify-between items-center text-xs font-headline text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#00D9A5]/10 flex items-center justify-center text-[#00D9A5]">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-white font-bold block">{inv.number}</span>
                            <span className="text-[10px] text-gray-400 block">{inv.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="text-white font-mono font-bold block">{inv.amount},00 DH</span>
                            <span className="text-[8px] text-[#00D9A5] font-black uppercase tracking-wider block">Payée</span>
                          </div>
                          <button 
                            onClick={() => handleDownloadInvoice(inv.id)}
                            className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-black flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 5: ACTIONS (MODIFIER / ANNULER) */}
                <div className="space-y-3 pt-2 text-left">
                  
                  {/* Change plan */}
                  <button 
                    onClick={() => {
                      if (onNavigateToPlans) onNavigateToPlans();
                      else addToast('info', "Ouverture de la sélection des plans...");
                    }}
                    className="w-full h-12 bg-[#16213E] hover:bg-[#1A1A2E] border border-[#FFD700]/20 rounded-xl px-4 flex items-center justify-between text-[#FFD700] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Repeat className="w-4.5 h-4.5 text-[#FFD700]" />
                      <span className="text-xs font-headline font-black uppercase tracking-wider">Changer de plan d'acier</span>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-[#FFD700]" />
                  </button>

                  {/* Pause sub */}
                  <button 
                    onClick={() => {
                      setPauseDuration(1);
                      setShowPauseModal(true);
                    }}
                    className="w-full h-12 bg-[#16213E] hover:bg-[#1A1A2E] border border-gray-800 rounded-xl px-4 flex items-center justify-between text-gray-400 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <PauseCircle className="w-4.5 h-4.5 text-gray-400" />
                      <span className="text-xs font-headline font-black uppercase tracking-wider">Mettre en pause (1-3 mois)</span>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                  </button>

                  {/* Cancel sub */}
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="w-full h-12 bg-[#FF2D55]/5 hover:bg-[#FF2D55]/10 border border-[#FF2D55]/20 rounded-xl px-4 flex items-center justify-between text-[#FF2D55] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4.5 h-4.5 text-[#FF2D55]" />
                      <span className="text-xs font-headline font-black uppercase tracking-wider">Annuler l'abonnement</span>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-[#FF2D55]" />
                  </button>

                </div>

                {/* SECTION 7: CONSEIL GESTION */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#00D9A5] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-[#00D9A5] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Tu es en contrôle total. Change de plan, mets en pause, ou annule à tout moment. Aucune surprise, aucun engagement forcé.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Règle #11 du Code Alpha d'Honneur
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* CANCEL MODAL WITH RETENTION OFFER */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fade-in_0.25s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-[32px] max-w-sm w-full p-6 text-center space-y-5 relative shadow-2xl">
            
            <div className="w-14 h-14 rounded-full bg-[#FF9500]/10 flex items-center justify-center mx-auto text-[#FF9500]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 text-center">
              <h3 className="text-md font-headline font-black text-white uppercase tracking-tight">
                Es-tu sûr de vouloir partir ?
              </h3>
              <p className="text-xs text-gray-400 font-headline leading-relaxed">
                Tu perdras l'accès à l'IA Alpha Engine, aux plans d'entraînement personnalisés et aux statistiques avancées. Ton compte reviendra au palier gratuit.
              </p>
            </div>

            {/* Retention Offer Area */}
            <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-[#FFD700]">
                <Gift className="w-4.5 h-4.5" />
                <span className="text-xs font-headline font-black uppercase tracking-wider">OFFRE SPÉCIALE EN COURS</span>
              </div>
              <h4 className="text-xs font-headline font-black text-white">
                Reste avec nous et profite de -30% sur les 3 prochains mois !
              </h4>
              <p className="text-[10px] text-gray-400 font-headline">
                Ton abonnement PREMIUM passe à seulement <strong className="text-white">41 DH/mois</strong> au lieu de 59 DH/mois.
              </p>

              <button
                onClick={handleAcceptRetentionOffer}
                className="w-full h-8.5 bg-[#FFD700] text-[#0F0F1A] rounded-xl text-[10px] font-headline font-black uppercase tracking-widest mt-1 cursor-pointer"
              >
                ACCEPTER LES -30% IMMEDIATEMENT 🚀
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-10 bg-[#00D9A5] text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
              >
                NON, RESTER PREMIUM
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 h-10 bg-[#FF2D55]/10 border border-[#FF2D55]/30 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
              >
                OUI, ANNULER
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PAUSE MODAL SIMULATOR */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-xs w-full p-6 text-center space-y-4">
            
            <div className="w-12 h-12 rounded-full bg-[#FF9500]/10 flex items-center justify-center mx-auto text-[#FF9500]">
              <PauseCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-headline font-black text-white uppercase tracking-wider">
                Mettre en pause
              </h3>
              <p className="text-[11px] text-gray-400 font-headline leading-relaxed">
                Suspend temporairement ton abonnement et tes prélèvements CMI. Reprise automatique à la fin du délai.
              </p>
            </div>

            {/* selector */}
            <div className="flex justify-around gap-2 bg-[#16213E] p-1.5 rounded-xl">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => setPauseDuration(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-black transition-all cursor-pointer
                    ${pauseDuration === m ? 'bg-[#FFD700] text-[#0F0F1A]' : 'text-gray-400 hover:text-white'}
                  `}
                >
                  {m} Mois
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 h-9 bg-transparent border border-gray-800 text-gray-400 rounded-xl text-[10px] font-headline font-bold uppercase cursor-pointer"
              >
                Retour
              </button>
              <button
                onClick={handleConfirmPause}
                className="flex-1 h-9 bg-[#FFD700] text-[#0F0F1A] rounded-xl text-[10px] font-headline font-black uppercase tracking-wider cursor-pointer"
              >
                PAUSER L'ABONNEMENT
              </button>
            </div>

          </div>
        </div>
      )}

      {/* UPDATE PAYMENT CARD INFO MODAL SIMULATOR */}
      {showUpdatePaymentModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fade-in_0.25s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-[32px] max-w-sm w-full p-6 text-left space-y-4">
            
            <div className="flex justify-between items-center border-b border-gray-800 pb-2.5">
              <span className="text-xs font-headline font-black text-white uppercase">Modifier Carte CMI</span>
              <button onClick={() => setShowUpdatePaymentModal(false)} className="text-gray-400">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-left">
              
              <div className="space-y-1">
                <label className="text-gray-400 font-headline">Numéro de carte marocaine</label>
                <input 
                  type="text" placeholder="5354 0000 0000 4242"
                  value={editCardNumber} onChange={(e) => setEditCardNumber(e.target.value)}
                  className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-gray-400 font-headline">MM/AA</label>
                  <input 
                    type="text" placeholder="12/28"
                    value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-gray-400 font-headline">CVV</label>
                  <input 
                    type="password" placeholder="***" maxLength={3}
                    value={editCvv} onChange={(e) => setEditCvv(e.target.value)}
                    className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-gray-400 font-headline">Titulaire</label>
                <input 
                  type="text" placeholder="YOUSSEF EL ALAMI"
                  value={editHolder} onChange={(e) => setEditHolder(e.target.value)}
                  className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white font-mono uppercase"
                />
              </div>

            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowUpdatePaymentModal(false)}
                className="flex-1 h-10 bg-transparent border border-gray-800 text-gray-400 rounded-xl text-xs font-headline font-bold uppercase cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdatePayment}
                className="flex-1 h-10 bg-[#00D9A5] text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
              >
                Mise à Jour
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
