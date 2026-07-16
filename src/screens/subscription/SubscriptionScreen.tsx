import React, { useState } from 'react';
import { 
  ArrowLeft,
  Crown,
  Info,
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
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface SubscriptionScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ addToast, onBack }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [currentPlanExpiry, setCurrentPlanExpiry] = useState<string | null>(null);

  // CMI Payment Modal simulator
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [payingPlan, setPayingPlan] = useState<any | null>(null);
  const [cmiStep, setCmiStep] = useState<'select_bank' | 'card_entry' | 'otp' | 'success'>('select_bank');
  
  // Card inputs
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');

  // BottomSheet or Modal for info
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // FAQ states
  const [faq, setFaq] = useState([
    {
      question: "Puis-je annuler à tout moment ?",
      answer: "Oui, tu peux annuler ton abonnement à tout moment depuis les paramètres. Tu gardes l'accès complet jusqu'à la fin de la période payée.",
      isOpen: false
    },
    {
      question: "Comment fonctionne le paiement CMI ?",
      answer: "Nous utilisons le Centre Monétique Interbancaire marocain. Tu peux payer en toute sécurité par carte bancaire marocaine (Visa, Mastercard, cmi), ou par d'autres canaux locaux. Tout est crypté à 256 bits.",
      isOpen: false
    },
    {
      question: "Puis-je changer de plan ?",
      answer: "Absolument. Tu peux upgrader ou downgrader à tout moment. La différence de tarif est calculée automatiquement au prorata de l'utilisation.",
      isOpen: false
    }
  ]);

  // Plans database with prices in DH (Moroccan Dirham)
  const plans = [
    {
      id: 'free',
      name: "FREE",
      tier: "Débutant",
      priceMonthly: 0,
      priceYearly: 0,
      description: "Pour tester l'app de base",
      features: [
        { text: "Kegel niveaux 1-3", included: true },
        { text: "Respiration basique", included: true },
        { text: "Tracker sommeil simple", included: true },
        { text: "Sans pub limité", included: false },
        { text: "IA personnalisée", included: false }
      ],
      color: "#5A5A5A",
      buttonText: "ACTUEL",
      isPopular: false,
      isUltimate: false
    },
    {
      id: 'basic',
      name: "BASIC",
      tier: "Engagé",
      priceMonthly: 29,
      priceYearly: 278, // ~20% discount
      description: "Sans pub, accès complet",
      features: [
        { text: "Tout le contenu Kegel (10 niveaux)", included: true },
        { text: "Toutes les tech. de respiration", included: true },
        { text: "Tracker complet (5 piliers)", included: true },
        { text: "ZÉRO publicité", included: true, highlight: true },
        { text: "IA personnalisée", included: false }
      ],
      color: "#8E8E93",
      buttonText: "CHOISIR BASIC",
      isPopular: false,
      isUltimate: false
    },
    {
      id: 'premium',
      name: "PREMIUM",
      tier: "Optimisé",
      priceMonthly: 59,
      priceYearly: 566,
      description: "IA + personnalisation complète",
      features: [
        { text: "Tout BASIC +", included: true },
        { text: "IA Alpha Engine (conseils pers.)", included: true, highlight: true },
        { text: "Plans d'entraînement personnalisés", included: true },
        { text: "Stats avancées + prédictions", included: true },
        { text: "Coaching 1-on-1", included: false }
      ],
      color: "#00D9A5",
      buttonText: "CHOISIR PREMIUM",
      isPopular: true,
      isUltimate: false
    },
    {
      id: 'elite',
      name: "ELITE",
      tier: "Leader",
      priceMonthly: 99,
      priceYearly: 950,
      description: "Coaching + contenu exclusif",
      features: [
        { text: "Tout PREMIUM +", included: true },
        { text: "Coaching vocal 1-on-1 (2x/mois)", included: true, highlight: true },
        { text: "Vidéos exclusives (Huberman-style)", included: true },
        { text: "Priorité support", included: true },
        { text: "Accès événements VIP", included: false }
      ],
      color: "#4A90D9",
      buttonText: "CHOISIR ELITE",
      isPopular: false,
      isUltimate: false
    },
    {
      id: 'alpha',
      name: "ALPHA",
      tier: "Légende",
      priceMonthly: 199,
      priceYearly: 1910,
      description: "Tout illimité + accès VIP",
      features: [
        { text: "Tout ELITE +", included: true },
        { text: "Événements VIP (retreats, séminaires)", included: true, highlight: true },
        { text: "Accès bêta fonctionnalités", included: true },
        { text: "Badge ALPHA exclusif", included: true, highlight: true },
        { text: "Support prioritaire 24/7", included: true }
      ],
      color: "#FFD700",
      buttonText: "DEVENIR ALPHA",
      isPopular: false,
      isUltimate: true
    }
  ];

  // Comparison table items
  const comparisonRows = [
    { feature: "Kegel complet", free: "3 niv.", basic: "10 niv.", premium: "10 niv.", elite: "10 niv.", alpha: "10 niv." },
    { feature: "Respiration", free: "2 tech.", basic: "5 tech.", premium: "5 tech.", elite: "5 tech.", alpha: "5 tech." },
    { feature: "Sans pub", free: false, basic: true, premium: true, elite: true, alpha: true },
    { feature: "IA Alpha", free: false, basic: false, premium: true, elite: true, alpha: true },
    { feature: "Coaching", free: false, basic: false, premium: false, elite: "2x/mois", alpha: "Illimité" },
    { feature: "Exclusif", free: false, basic: false, premium: false, elite: true, alpha: true },
    { feature: "Événements", free: false, basic: false, premium: false, elite: false, alpha: true },
    { feature: "Support", free: "Standard", basic: "Standard", premium: "Prioritaire", elite: "Prioritaire", alpha: "24/7" }
  ];

  // Handle accordion toggle
  const toggleAccordion = (index: number) => {
    setFaq(prev => prev.map((item, i) => {
      if (i === index) return { ...item, isOpen: !item.isOpen };
      return item;
    }));
  };

  // Select plan to buy
  const handleSelectPlan = (plan: any) => {
    if (plan.id === 'free') {
      setCurrentPlan(null);
      setCurrentPlanExpiry(null);
      addToast('info', "Tu es repassé sur le plan Gratuit (limité avec publicités).");
      return;
    }

    if (currentPlan === plan.id) {
      addToast('warning', "Tu as déjà souscrit à ce plan !");
      return;
    }

    setPayingPlan(plan);
    setCmiStep('select_bank');
    setShowPaymentModal(true);
    addToast('info', `Initialisation du paiement sécurisé CMI pour le plan ${plan.name}...`);
  };

  // CMI simulator action success
  const handleCmiSuccess = () => {
    setCurrentPlan(payingPlan.id);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + 30);
    const expiryStr = dateObj.toLocaleDateString('fr-FR');
    setCurrentPlanExpiry(expiryStr);
    
    setShowPaymentModal(false);
    addToast('success', `Abonnement ${payingPlan.name} activé avec succès ! Merci de ta confiance, Guerrier. 🏆`);
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

export default function SubscriptionScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [currentPlan, setCurrentPlan] = useState(null);

  const handleSelectPlan = (planName) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Simulation du paiement CMI marocain
    alert(\`Redirection vers le portail de paiement sécurisé CMI marocain...\`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.touchTarget} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DEVIENS UN ALPHA</Text>
        <TouchableOpacity style={styles.touchTarget}>
          <Feather name="info" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* PERIOD SELECTOR */}
        <View style={styles.selectorRow}>
          <TouchableOpacity 
            style={[styles.selBtn, selectedPeriod === 'monthly' && styles.selActive]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[styles.selText, selectedPeriod === 'monthly' && styles.textActive]}>MENSUEL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.selBtn, selectedPeriod === 'yearly' && styles.selActive]}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <Text style={[styles.selText, selectedPeriod === 'yearly' && styles.textActive]}>ANNUEL -20%</Text>
          </TouchableOpacity>
        </View>

        {/* 5 PLAN TIERS */}
        {/* BASIC / PREMIUM / ELITE / ALPHA */}

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
  selectorRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 },
  selBtn: { backgroundColor: '#16213E', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24 },
  selActive: { backgroundColor: '#FFD700' },
  selText: { fontSize: 12, color: '#FFD700', fontWeight: 'bold' },
  textActive: { color: '#0F0F1A' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source du module d'Abonnement CMI copié ! 🧬");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Moteur de Monétisation (7.1)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Tiers d'Abonnements & Passerelle CMI — SubscriptionScreen
          </h2>
          <p className="text-xs text-gray-400">
            Intégration du Centre Monétique Interbancaire marocain pour sécuriser les cotisations de discipline.
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
              <h4 className="text-xs font-headline font-black text-white">SubscriptionScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Gère l'affichage des 5 tiers de tarifs, la sélection réactive et les protocoles de vérification CMI.
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

      {/* TWO PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: ADMIN SIMULATION CONTROLS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console d'Abonnement CMI
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Testez le cycle de vie du paiement marocain de manière transparente.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Quick action active sub simulation */}
            <div className="space-y-2">
              <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                Statut de Cotisation
              </span>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setCurrentPlan('premium');
                    setCurrentPlanExpiry('15/08/2026');
                    addToast('success', "Simulé : Utilisateur abonné au plan PREMIUM ! 👑");
                  }}
                  className="w-full py-2 bg-[#00D9A5]/10 border border-[#00D9A5]/20 hover:bg-[#00D9A5]/20 text-[#00D9A5] text-xs font-bold rounded-xl transition-all"
                >
                  Simuler Plan PREMIUM Actif
                </button>
                <button 
                  onClick={() => {
                    setCurrentPlan('alpha');
                    setCurrentPlanExpiry('30/09/2026');
                    addToast('success', "Simulé : Utilisateur membre de la Légende ALPHA ! 👑👑");
                  }}
                  className="w-full py-2 bg-[#FFD700]/10 border border-[#FFD700]/20 hover:bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold rounded-xl transition-all"
                >
                  Simuler Plan ALPHA Actif
                </button>
                <button 
                  onClick={() => {
                    setCurrentPlan(null);
                    setCurrentPlanExpiry(null);
                    addToast('info', "Simulé : Utilisateur non-abonné (FREE).");
                  }}
                  className="w-full py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-400 text-xs font-bold rounded-xl transition-all"
                >
                  Réinitialiser en Plan FREE
                </button>
              </div>
            </div>

            {/* Explanations cmi center */}
            <div className="bg-[#16213E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-300 leading-relaxed">
              🇲🇦 <strong>CMI marocain :</strong> Le protocole redirige l'utilisateur vers la page 3D-Secure de sa banque marocaine (CIH, Attijariwafa, BCP, BMCE...) pour valider la transaction par mot de passe à usage unique (OTP).
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW */}
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
                <span>13:56</span>
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
                  Devenez un Alpha
                </h1>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => setShowInfoModal(true)}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-400"
                  >
                    <Info className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* STREAM AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: BADGE ACTUEL (SI ABONNÉ) */}
                {currentPlan && (
                  <div className="bg-gradient-to-br from-[#FFD700] to-[#FF9500] rounded-2xl p-5 shadow-xl flex items-center justify-between text-[#0F0F1A]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#0F0F1A] flex items-center justify-center flex-shrink-0 text-[#FFD700]">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className="text-[9px] font-headline font-black tracking-widest uppercase block opacity-70">PLAN ACTUEL</span>
                        <h4 className="text-lg font-headline font-black tracking-tight leading-none uppercase">
                          {currentPlan}
                        </h4>
                        <span className="text-[10px] font-headline block opacity-85">
                          Renouvellement le {currentPlanExpiry}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addToast('info', "Ouverture du panneau de résiliation ou d'upgrade du CMI...");
                      }}
                      className="px-3.5 h-8 bg-[#0F0F1A] hover:bg-black text-[#FFD700] rounded-lg text-[10px] font-headline font-black tracking-wider uppercase transition-all cursor-pointer"
                    >
                      GÉRER
                    </button>
                  </div>
                )}

                {/* SECTION 2: SÉLECTEUR DE PÉRIODE */}
                <div className="text-center space-y-3">
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => {
                        setSelectedPeriod('monthly');
                        addToast('info', "Tarif mensuel sélectionné.");
                      }}
                      className={`h-10 px-6 rounded-full text-xs font-headline font-black tracking-wider border transition-all cursor-pointer
                        ${selectedPeriod === 'monthly' 
                          ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                          : 'border-gray-800 text-gray-400 hover:text-white'
                        }
                      `}
                    >
                      MENSUEL
                    </button>

                    <div className="relative">
                      <button 
                        onClick={() => {
                          setSelectedPeriod('yearly');
                          addToast('success', "Tarif annuel sélectionné. Vous bénéficiez de 20% de réduction immédiate ! ⚡");
                        }}
                        className={`h-10 px-6 rounded-full text-xs font-headline font-black tracking-wider border transition-all cursor-pointer
                          ${selectedPeriod === 'yearly' 
                            ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                            : 'border-gray-800 text-gray-400 hover:text-white'
                          }
                        `}
                      >
                        ANNUEL -20%
                      </button>
                      <span className="absolute -top-2.5 -right-2.5 bg-[#00D9A5] text-[#0F0F1A] rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider">
                        ÉCONOMIE
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8E8E93] font-headline">
                    {selectedPeriod === 'monthly' ? "Économisez 20% en passant à l'abonnement annuel" : "Félicitations pour ton engagement de 1 an !"}
                  </p>
                </div>

                {/* SECTION 3: LES 5 TIERS (CARDS VERTICALES) */}
                <div className="space-y-4">
                  {plans.map((p) => {
                    const isPlanActive = currentPlan === p.id || (p.id === 'free' && !currentPlan);
                    const finalPrice = selectedPeriod === 'monthly' ? p.priceMonthly : Math.round(p.priceYearly / 12);
                    const totalAnnualCost = p.priceYearly;

                    return (
                      <div 
                        key={p.id}
                        className={`rounded-2xl p-5 border relative flex flex-col justify-between text-left transition-all
                          ${isPlanActive ? 'bg-[#16213E] border-2 shadow-2xl' : 'bg-[#1A1A2E]/80 border-white/5 hover:border-gray-800'}
                        `}
                        style={{
                          borderColor: isPlanActive ? p.color : 'rgba(255,255,255,0.05)'
                        }}
                      >
                        
                        {/* Popular badge header absolute */}
                        {p.isPopular && (
                          <div className="absolute -top-3 left-5 bg-[#00D9A5] text-[#0F0F1A] px-2.5 py-0.5 rounded-md font-headline font-black text-[8px] uppercase tracking-wider animate-pulse">
                            POPULAIRE
                          </div>
                        )}

                        {/* Ultimate badge */}
                        {p.isUltimate && (
                          <div className="absolute -top-3 left-5 bg-[#FFD700] text-[#0F0F1A] px-2.5 py-0.5 rounded-md font-headline font-black text-[8px] uppercase tracking-wider">
                            ULTIME
                          </div>
                        )}

                        <div className="flex justify-between items-start">
                          <div>
                            <span 
                              className="text-[10px] font-headline font-black tracking-widest block uppercase"
                              style={{ color: p.color }}
                            >
                              {p.name}
                            </span>
                            <h3 className="text-base font-headline font-black text-white mt-1">
                              {p.tier}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-headline leading-tight mt-0.5">
                              {p.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xl font-mono font-black text-white block">
                              {finalPrice} DH
                            </span>
                            <span className="text-[9px] text-gray-500 font-headline block leading-none">/mois</span>
                            
                            {selectedPeriod === 'yearly' && p.priceYearly > 0 && (
                              <span className="text-[9px] text-[#00D9A5] font-mono block pt-1 font-bold">
                                {totalAnnualCost} DH/an
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Feature checklist */}
                        <div className="space-y-1.5 pt-4 border-t border-white/5 mt-4 text-left">
                          {p.features.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs font-headline">
                              {f.included ? (
                                <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${f.highlight ? 'text-[#FFD700]' : 'text-[#00D9A5]'}`} />
                              ) : (
                                <X className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={`text-[11px] leading-tight
                                ${f.included ? (f.highlight ? 'text-white font-bold' : 'text-gray-300') : 'text-gray-600 line-through'}
                              `}>
                                {f.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Buy/Action CTA */}
                        <button 
                          onClick={() => handleSelectPlan(p)}
                          className={`w-full py-2.5 rounded-xl text-xs font-headline font-black uppercase tracking-wider mt-4 cursor-pointer text-center transition-all
                            ${isPlanActive 
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                              : p.isUltimate 
                                ? 'bg-gradient-to-r from-[#FFD700] to-[#FF9500] text-[#0F0F1A] shadow-lg shadow-[#FFD700]/25' 
                                : 'bg-white text-[#0F0F1A] hover:bg-gray-100'
                            }
                          `}
                          disabled={isPlanActive}
                        >
                          {isPlanActive ? "PLAN ACTUEL" : p.buttonText}
                        </button>

                      </div>
                    );
                  })}
                </div>

                {/* SECTION 4: COMPARATIF RAPIDE */}
                <div className="space-y-3 pt-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1 text-left">
                    Comparatif Rapide
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-white/5 custom-scrollbar text-left">
                    <table className="w-full text-left border-collapse min-w-[480px]">
                      <thead>
                        <tr className="bg-[#1A1A2E]">
                          <th className="p-2.5 text-[9px] font-headline font-black text-gray-400 uppercase">FEATURE</th>
                          <th className="p-2.5 text-[9px] font-headline font-black text-gray-500 text-center uppercase">FREE</th>
                          <th className="p-2.5 text-[9px] font-headline font-black text-gray-400 text-center uppercase">BASIC</th>
                          <th className="p-2.5 text-[9px] font-headline font-black text-[#00D9A5] text-center uppercase">PREM.</th>
                          <th className="p-2.5 text-[9px] font-headline font-black text-[#4A90D9] text-center uppercase">ELITE</th>
                          <th className="p-2.5 text-[9px] font-headline font-black text-[#FFD700] text-center uppercase">ALPHA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/2">
                        {comparisonRows.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-[#16213E]/30' : 'bg-transparent'}>
                            <td className="p-2.5 text-[10px] font-headline font-bold text-white">
                              {row.feature}
                            </td>
                            
                            {/* FREE column */}
                            <td className="p-2.5 text-[9px] font-headline text-center font-bold text-gray-600">
                              {typeof row.free === 'boolean' ? (row.free ? "✓" : "✗") : row.free}
                            </td>

                            {/* BASIC column */}
                            <td className="p-2.5 text-[9px] font-headline text-center font-bold text-gray-400">
                              {typeof row.basic === 'boolean' ? (row.basic ? "✓" : "✗") : row.basic}
                            </td>

                            {/* PREMIUM column */}
                            <td className="p-2.5 text-[9px] font-headline text-center font-bold text-[#00D9A5]">
                              {typeof row.premium === 'boolean' ? (row.premium ? "✓" : "✗") : row.premium}
                            </td>

                            {/* ELITE column */}
                            <td className="p-2.5 text-[9px] font-headline text-center font-bold text-[#4A90D9]">
                              {typeof row.elite === 'boolean' ? (row.elite ? "✓" : "✗") : row.elite}
                            </td>

                            {/* ALPHA column */}
                            <td className="p-2.5 text-[9px] font-headline text-center font-bold text-[#FFD700]">
                              {typeof row.alpha === 'boolean' ? (row.alpha ? "✓" : "✗") : row.alpha}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 5: GARANTIE & SÉCURITÉ */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  
                  {/* Card 1 */}
                  <div className="bg-[#16213E] rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center space-y-1">
                    <ShieldCheck className="w-5 h-5 text-[#00D9A5]" />
                    <span className="text-[9px] font-headline font-black text-white block uppercase">7 JOURS</span>
                    <span className="text-[8px] text-gray-400 font-headline leading-tight block">Satisfait / Remboursé</span>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-[#16213E] rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center space-y-1">
                    <Lock className="w-5 h-5 text-[#00D9A5]" />
                    <span className="text-[9px] font-headline font-black text-white block uppercase">SÉCURISÉ</span>
                    <span className="text-[8px] text-gray-400 font-headline leading-tight block">Paiement CMI crypté</span>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-[#16213E] rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center space-y-1">
                    <XCircle className="w-5 h-5 text-[#00D9A5]" />
                    <span className="text-[9px] font-headline font-black text-white block uppercase">ANNULABLE</span>
                    <span className="text-[8px] text-gray-400 font-headline leading-tight block">Sans engagement</span>
                  </div>

                </div>

                {/* SECTION 6: FAQ RAPIDE */}
                <div className="space-y-2.5">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1 text-left">
                    Questions Fréquentes
                  </h3>

                  <div className="space-y-2">
                    {faq.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => toggleAccordion(idx)}
                        className="bg-[#16213E] rounded-xl p-3.5 border border-white/5 text-left cursor-pointer transition-all border-l-2 border-l-gray-600"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-[11px] font-headline font-black text-white leading-tight">
                            {item.question}
                          </h4>
                          {item.isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>

                        {item.isOpen && (
                          <p className="text-[10px] text-gray-400 font-headline mt-2 leading-relaxed animate-[fade-in_0.2s_ease-out]">
                            {item.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 7: CONSEIL FINAL */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <Zap className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Investir dans toi-même est le seul investissement qui rapporte 100% du temps. Chaque dirham dépensé ici revient multiplié en discipline, énergie, et transformation.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Règle #10 du Code Alpha d'Honneur
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

      {/* CMI SECURE PAYMENT GATEWAY SIMULATOR MODAL */}
      {showPaymentModal && payingPlan && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fade-in_0.25s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-[32px] max-w-md w-full p-6 text-left space-y-5 relative overflow-hidden shadow-2xl">
            
            {/* Header CMI log */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-white px-2 py-0.5 bg-[#E21A22] rounded font-black tracking-widest">
                  cmi
                </span>
                <span className="text-xs font-headline font-black text-gray-400 uppercase">
                  Paiement Sécurisé Maroc
                </span>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price overview summary */}
            <div className="bg-[#16213E] p-4 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] font-headline text-gray-400 uppercase block">ARTICLE</span>
                <span className="text-xs font-headline font-black text-white">ALPHA MAN - Plan {payingPlan.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-headline text-gray-400 uppercase block">MONTANT</span>
                <span className="text-md font-mono font-black text-[#FFD700]">
                  {selectedPeriod === 'monthly' ? payingPlan.priceMonthly : payingPlan.priceYearly} DH
                </span>
              </div>
            </div>

            {/* FLOW STEP 1: Select Bank */}
            {cmiStep === 'select_bank' && (
              <div className="space-y-3">
                <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                  Étape 1 : Choisir ton institution bancaire
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {['CIH Bank', 'Attijariwafa Bank', 'Banque Populaire (BCP)', 'BMCE Bank of Africa', 'Crédit du Maroc', 'Société Générale'].map((bank, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        addToast('info', `Sélectionné : ${bank}. Redirection vers le formulaire CMI.`);
                        setCmiStep('card_entry');
                      }}
                      className="p-3 bg-[#16213E]/60 border border-white/5 hover:border-white/10 hover:bg-[#16213E] rounded-xl text-[11px] font-headline font-bold text-center transition-all cursor-pointer"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FLOW STEP 2: Card inputs */}
            {cmiStep === 'card_entry' && (
              <div className="space-y-4">
                <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                  Étape 2 : Coordonnées de paiement marocain
                </span>
                
                <div className="space-y-3 text-xs">
                  
                  {/* Card Number */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-headline">Numéro de carte marocaine</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text" placeholder="5354 0000 0000 0000"
                        value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-gray-500 absolute right-3" />
                    </div>
                  </div>

                  {/* Date and CVV double */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-400 font-headline">Expiration (MM/AA)</label>
                      <input 
                        type="text" placeholder="08/29"
                        value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 font-headline">Code CVV</label>
                      <input 
                        type="password" placeholder="123" maxLength={3}
                        value={cvv} onChange={(e) => setCvv(e.target.value)}
                        className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Holder */}
                  <div className="space-y-1">
                    <label className="text-gray-400 font-headline">Nom complet du titulaire</label>
                    <input 
                      type="text" placeholder="YOUSSEF EL ALAMI"
                      value={cardHolder} onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full h-10 px-3 bg-[#16213E] border border-white/5 rounded-xl text-white uppercase font-mono"
                    />
                  </div>

                </div>

                <button
                  onClick={() => {
                    if (!cardNumber || !expiryDate || !cvv) {
                      addToast('error', "Veuillez remplir les informations de carte bancaire.");
                      return;
                    }
                    addToast('info', "Envoi de la demande d'autorisation 3D-Secure...");
                    setCmiStep('otp');
                  }}
                  className="w-full h-11 bg-[#E21A22] text-white rounded-xl text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
                >
                  VALIDER LE PAIEMENT (3D-SECURE)
                </button>
              </div>
            )}

            {/* FLOW STEP 3: OTP */}
            {cmiStep === 'otp' && (
              <div className="space-y-4 text-center">
                <span className="text-[10px] font-headline text-[#E21A22] uppercase tracking-wider block">
                  🔒 AUTHENTIFICATION BANCAIRE SÉCURISÉE
                </span>
                
                <p className="text-xs text-gray-300 font-headline leading-relaxed">
                  Un code de confirmation SMS a été envoyé au numéro lié à ta carte marocaine pour valider le débit de <strong className="text-white">{selectedPeriod === 'monthly' ? payingPlan.priceMonthly : payingPlan.priceYearly} DH</strong>.
                </p>

                <div className="space-y-1.5 max-w-[180px] mx-auto">
                  <input 
                    type="text" placeholder="Code OTP à 6 chiffres" maxLength={6}
                    value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full h-11 text-center bg-[#16213E] border border-[#E21A22] rounded-xl text-white font-mono font-black text-base tracking-widest"
                  />
                  <span className="text-[9px] text-gray-500 block">Exemple simulateur: Entrez n'importe quel code</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCmiStep('card_entry')}
                    className="flex-1 h-10 bg-transparent border border-gray-800 text-gray-400 rounded-xl text-xs font-headline font-bold uppercase cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleCmiSuccess}
                    className="flex-1 h-10 bg-[#00D9A5] text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
                  >
                    CONFIRMER
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* INFORMATION MODAL POPUP */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-sm w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4.5 h-4.5" />
                Pourquoi passer Premium ?
              </h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-white font-black text-xs"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-headline">
              Les versions payantes débloquent l'IA personnelle Alpha Engine, les techniques avancées, le coaching un-à-un, le contenu exclusif en vidéo et retirent l'intégralité des publicités. C'est un investissement concret dans toi-même.
            </p>

            <div className="bg-[#16213E] p-3.5 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-normal font-headline">
              💪 <strong>Règle d'or :</strong> L'engagement financier est le plus fort signal de motivation que tu puisses envoyer à ton cerveau. Passe au palier supérieur !
            </div>

            <button 
              onClick={() => setShowInfoModal(false)}
              className="w-full h-10 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-widest"
            >
              D'ACCORD, JE RELÈVE LE DÉFI
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
