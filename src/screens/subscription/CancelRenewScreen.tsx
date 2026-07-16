import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  AlertTriangle,
  Gift,
  CheckCircle,
  HelpCircle,
  X,
  Clock,
  Check,
  Code,
  Copy,
  Settings,
  RefreshCw,
  Info,
  Heart,
  Calendar
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface CancelRenewScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNavigateToDashboard?: () => void;
}

export const CancelRenewScreen: React.FC<CancelRenewScreenProps> = ({ 
  addToast, 
  onBack,
  onNavigateToDashboard
}) => {
  // Simulator state controls
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Flow control states
  const [showSurvey, setShowSurvey] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [hasCancelled, setHasCancelled] = useState<boolean>(false);

  // Survey reason
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [otherReasonText, setOtherReasonText] = useState<string>('');

  // Countdown simulation
  const [timeLeft, setTimeLeft] = useState<string>('04:32:18');

  // Plan data
  const currentPlan = {
    id: "premium",
    name: "PREMIUM",
    price: 59,
    period: "Mensuel",
    expiryDate: "15 août 2026",
    daysRemaining: 21
  };

  // Simulated countdown effect
  useEffect(() => {
    let hours = 4;
    let minutes = 32;
    let seconds = 18;

    const timer = setInterval(() => {
      if (seconds > 0) {
        seconds--;
      } else {
        seconds = 59;
        if (minutes > 0) {
          minutes--;
        } else {
          minutes = 59;
          if (hours > 0) {
            hours--;
          } else {
            clearInterval(timer);
          }
        }
      }
      const pad = (num: number) => num.toString().padStart(2, '0');
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle accepting the special offer (-30% for 3 months)
  const handleAcceptRetentionOffer = () => {
    addToast('success', "Génial ! Vous avez accepté l'offre exclusive de -30% ! Vous restez PREMIUM pour seulement 41 DH/mois. 🦾");
    if (onBack) {
      onBack();
    }
  };

  // Handle confirming cancellation from the survey
  const handleConfirmCancellation = () => {
    if (!cancelReason) {
      addToast('error', "Veuillez sélectionner un motif d'annulation.");
      return;
    }
    setHasCancelled(true);
    setShowConfirmation(true);
    addToast('warning', "Votre demande de résiliation a bien été prise en compte pour le 15 août 2026.");
  };

  // Auto renew toggle
  const toggleAutoRenew = () => {
    const nextState = !autoRenew;
    setAutoRenew(nextState);
    if (nextState) {
      addToast('success', "Renouvellement automatique réactivé. Merci de votre confiance ! 🛡️");
    } else {
      addToast('warning', "Renouvellement automatique désactivé. Accès actif jusqu'au 15 août 2026.");
    }
  };

  // Renew now simulation
  const handleRenewNow = () => {
    addToast('success', "Prélèvement manuel anticipé de 59 DH initié avec succès via CMI. Élan conservé ! 🟢");
  };

  const expoNativeCode = `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  Modal 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

export default function CancelRenewScreen({ navigation }) {
  const [showSurvey, setShowSurvey] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [reason, setReason] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.touchTarget} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ANNULER</Text>
        <TouchableOpacity style={styles.touchTarget}>
          <Feather name="help-circle" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* IMPACT LOSS CARD */}
        <View style={styles.alertCard}>
          <Feather name="alert-triangle" size={48} color="#FF2D55" style={styles.icon} />
          <Text style={styles.alertTitle}>TU VAS PERDRE TOUT ÇA</Text>
          <Text style={styles.alertSubtitle}>Réfléchis bien avant de partir</Text>
        </View>

        {/* RETENTION OFFER */}
        <View style={styles.retentionCard}>
          <Text style={styles.exclusiveBadge}>OFFRE EXCLUSIVE</Text>
          <Text style={styles.retentionTitle}>RESTE AVEC NOUS</Text>
          <Text style={styles.dealText}>-30% pendant 3 mois</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#FF2D55', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  alertCard: { backgroundColor: 'rgba(255,45,85,0.08)', padding: 32, borderRadius: 24, margin: 16, borderColor: '#FF2D55', borderWidth: 2, alignItems: 'center' },
  alertTitle: { fontSize: 18, color: '#FF2D55', fontWeight: 'bold', marginTop: 16 },
  exclusiveBadge: { backgroundColor: '#0F0F1A', color: '#FFD700', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold', fontSize: 10 },
  retentionCard: { backgroundColor: '#FFD700', padding: 28, borderRadius: 24, margin: 16, alignItems: 'center' },
  retentionTitle: { fontSize: 20, color: '#0F0F1A', fontWeight: 'bold' },
  dealText: { fontSize: 32, color: '#0F0F1A', fontWeight: 'bold', marginTop: 16 }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source du module de rétention copié ! 🧬");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FF2D55] uppercase tracking-widest bg-[#FF2D55]/10 border border-[#FF2D55]/20 px-2 rounded-md">
            Rétention & Enquêtes (7.4)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Écran de Résiliation & Rétention — CancelRenewScreen
          </h2>
          <p className="text-xs text-gray-400">
            Validez la résiliation via une enquête d'amélioration ou proposez un deal d'acier de -30% à vos guerriers.
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
              <h4 className="text-xs font-headline font-black text-white">CancelRenewScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Incorpore un compte à rebours dynamique, des sélecteurs de radio personnalisés et le flow d'enquêtes.
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

      {/* TWO PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: SIMULATION CONTROLLER */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FF2D55] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console de Résiliation
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Activez ou désactivez les options pour prévisualiser l'écran à différents moments de vie de l'utilisateur.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="space-y-2">
              <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                Statut initial du Renov'
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAutoRenew(true);
                    setHasCancelled(false);
                    setShowSurvey(false);
                  }}
                  className={`flex-1 py-2 text-xs font-headline font-black rounded-xl border transition-all
                    ${autoRenew && !hasCancelled ? 'bg-[#00D9A5]/10 text-[#00D9A5] border-[#00D9A5]' : 'bg-transparent border-gray-800 text-gray-500'}
                  `}
                >
                  Actif standard
                </button>
                <button
                  onClick={() => {
                    setAutoRenew(false);
                    setHasCancelled(true);
                  }}
                  className={`flex-1 py-2 text-xs font-headline font-black rounded-xl border transition-all
                    ${hasCancelled ? 'bg-[#FF2D55]/10 text-[#FF2D55] border-[#FF2D55]' : 'bg-transparent border-gray-800 text-gray-500'}
                  `}
                >
                  Annulé
                </button>
              </div>
            </div>

            <div className="bg-[#16213E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-400 leading-normal font-headline">
              💪 <strong>L'Esprit Guerrier :</strong> Un Alpha d'honneur ne quitte jamais l'arène sans laisser de feedback constructif permettant d'optimiser l'expérience de la communauté !
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
                <span>14:21</span>
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
                <h1 className="text-xs font-headline font-black tracking-widest text-[#FF2D55] uppercase">
                  Résiliation
                </h1>
                <button 
                  onClick={() => addToast('info', "Contact d'urgence de la hotline des Guerriers Alpha...")}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-400"
                >
                  <HelpCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* STREAM AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: ALERTE DE PERTE (CARD IMPACT) */}
                <div className="bg-[#FF2D55]/5 border-2 border-[#FF2D55] rounded-[24px] p-6 text-center space-y-4">
                  
                  <div className="w-12 h-12 rounded-full bg-[#FF2D55]/10 flex items-center justify-center mx-auto text-[#FF2D55] animate-pulse">
                    <AlertTriangle className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-md font-headline font-black text-[#FF2D55] uppercase tracking-wide">
                      Tu vas perdre tout ça
                    </h3>
                    <p className="text-xs text-gray-400 font-headline">
                      Réfléchis bien avant de quitter le navire. Votre progression d'acier de 12 mois sera gelée.
                    </p>
                  </div>

                  {/* List losses */}
                  <div className="space-y-2.5 pt-2 text-left max-w-[260px] mx-auto">
                    {[
                      "Accès IA Alpha Engine",
                      "Plans d'entraînement personnalisés",
                      "Stats avancées + prédictions",
                      "Zéro publicité intempestive",
                      "Support d'acier prioritaire",
                      "Progression sauvegardée (mais limitée)"
                    ].map((loss, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-headline text-gray-200">
                        <X className="w-4 h-4 text-[#FF2D55] flex-shrink-0" />
                        <span>{loss}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expiry badge */}
                  <div className="bg-[#FF2D55]/10 rounded-xl py-2 px-4 flex items-center justify-center gap-2 text-[#FF2D55] text-xs font-headline font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>Accès PREMIUM garanti jusqu'au {currentPlan.expiryDate}</span>
                  </div>

                </div>

                {/* SECTION 2: OFFRE DE RÉTENTION (CARD SPÉCIALE) */}
                {!showSurvey && !hasCancelled && (
                  <div className="bg-gradient-to-br from-[#FFD700] to-[#FF9500] rounded-[24px] p-6 text-[#0F0F1A] text-center space-y-4 relative shadow-[0_10px_30px_rgba(255,215,0,0.15)]">
                    
                    <span className="bg-[#0F0F1A] text-[#FFD700] px-3 py-1 rounded text-[9px] font-headline font-black tracking-widest uppercase inline-block animate-bounce">
                      Offre Exclusive de Fraternité
                    </span>

                    <div className="space-y-1 text-center">
                      <h3 className="text-lg font-headline font-black text-[#0F0F1A] leading-tight">
                        RESTE AVEC NOUS
                      </h3>
                      <p className="text-xs text-[#0F0F1A]/80 font-headline">
                        Le code d'honneur Alpha propose un rabais spécial pour ne pas casser ton élan :
                      </p>
                    </div>

                    {/* Deal detail */}
                    <div className="space-y-1">
                      <h4 className="text-2xl font-mono font-black text-[#0F0F1A] tracking-tight">
                        -30% pendant 3 mois
                      </h4>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-[#0F0F1A]/60 line-through">59 DH</span>
                        <span className="text-base font-mono font-black text-[#0F0F1A]">41 DH / mois</span>
                      </div>
                      <p className="text-[10px] bg-black/10 py-1 px-2 rounded-lg font-headline text-[#0F0F1A] font-bold inline-block mt-1">
                        Tu économises 54 DH sur la période !
                      </p>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center justify-center gap-2 text-[#FF2D55] bg-[#0F0F1A] py-1.5 px-3 rounded-xl max-w-[190px] mx-auto text-xs font-mono font-bold animate-pulse">
                      <Clock className="w-4 h-4 text-[#FF2D55]" />
                      <span>Expire dans : {timeLeft}</span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleAcceptRetentionOffer}
                        className="w-full h-11 bg-[#0F0F1A] hover:bg-black text-[#FFD700] rounded-xl text-xs font-headline font-black uppercase tracking-wider shadow-lg cursor-pointer transition-colors"
                      >
                        ACCEPTER LES -30% IMMEDIATEMENT 🚀
                      </button>

                      <button
                        onClick={() => {
                          setShowSurvey(true);
                          addToast('info', "Veuillez remplir notre rapide questionnaire de résiliation d'acier.");
                        }}
                        className="text-[11px] text-[#0F0F1A] hover:underline font-headline font-medium block mx-auto cursor-pointer"
                      >
                        Non merci, continuer l'annulation
                      </button>
                    </div>

                  </div>
                )}

                {/* SECTION 3: ENQUÊTE DE DÉPART (CONDITIONNEL) */}
                {showSurvey && !hasCancelled && (
                  <div className="space-y-4 animate-[fade-in_0.3s_ease-out]">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1 text-left">
                      Pourquoi vous nous quittez ?
                    </h3>

                    <div className="bg-[#16213E] rounded-2xl p-5 border border-white/5 space-y-4">
                      
                      {/* Radios */}
                      <div className="divide-y divide-gray-950">
                        {[
                          { id: 'too_expensive', label: "C'est trop cher pour moi (59 DH)" },
                          { id: 'no_time', label: "Je n'ai pas assez de temps pour m'entraîner" },
                          { id: 'not_convinced', label: "Je ne suis pas convaincu par l'IA Alpha Engine" },
                          { id: 'bugs', label: "J'ai rencontré des bugs techniques" },
                          { id: 'other', label: "Autre raison de départ d'honneur" }
                        ].map((opt) => (
                          <div 
                            key={opt.id}
                            onClick={() => setCancelReason(opt.id)}
                            className="py-3 flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-xs font-headline text-gray-200">{opt.label}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                              ${cancelReason === opt.id ? 'border-[#00D9A5] bg-[#00D9A5]' : 'border-gray-600'}
                            `}>
                              {cancelReason === opt.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Textarea other */}
                      {cancelReason === 'other' && (
                        <div className="space-y-1.5 text-left">
                          <label className="text-[11px] text-gray-500 font-headline">Raconte-nous tout Guerrier :</label>
                          <textarea
                            value={otherReasonText}
                            onChange={(e) => setOtherReasonText(e.target.value)}
                            placeholder="Vos commentaires aident la communauté..."
                            className="w-full bg-[#1A1A2E] border border-gray-800 rounded-xl p-3 text-xs font-headline text-white h-20 focus:outline-none focus:border-[#FF2D55] transition-colors resize-none"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        <button
                          onClick={handleConfirmCancellation}
                          disabled={!cancelReason}
                          className={`w-full h-11 rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-colors cursor-pointer
                            ${cancelReason 
                              ? 'bg-[#FF2D55] hover:bg-[#D81B43] text-white' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }
                          `}
                        >
                          CONFIRMER L'ANNULATION
                        </button>

                        <button
                          onClick={() => {
                            setShowSurvey(false);
                            addToast('info', "Offre de rétention de secours remise en avant !");
                          }}
                          className="w-full text-center text-xs font-headline text-gray-400 hover:text-white py-1.5 cursor-pointer block"
                        >
                          En fait, je reste d'honneur !
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* SECTION 5: RENOUVELLEMENT AUTOMATIQUE (SI NON ANNULÉ ET ACTIF) */}
                {!hasCancelled && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1 text-left">
                      Renouvellement Automatique CMI
                    </h3>

                    <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 space-y-4">
                      
                      {/* Toggle row */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-left">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${autoRenew ? 'bg-[#00D9A5]/10 text-[#00D9A5]' : 'bg-gray-800 text-gray-500'}
                          `}>
                            <RefreshCw className={`w-5 h-5 ${autoRenew ? 'animate-spin' : ''}`} />
                          </div>
                          <div>
                            <span className="text-xs font-headline font-black text-white block">
                              Renouvellement automatique
                            </span>
                            <span className="text-[10px] text-gray-400 font-headline block">
                              Facturé le 15 de chaque mois (59 DH)
                            </span>
                          </div>
                        </div>

                        {/* Custom switch */}
                        <button 
                          onClick={toggleAutoRenew}
                          className={`w-12 h-7 rounded-full p-1 transition-all duration-200 flex items-center cursor-pointer
                            ${autoRenew ? 'bg-[#00D9A5] justify-end' : 'bg-gray-600 justify-start'}
                          `}
                        >
                          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                        </button>
                      </div>

                      <div className="w-full h-px bg-gray-900 border-dashed border-b border-gray-800" />

                      {/* Info renewing text */}
                      <div className="flex gap-2.5 items-start text-left">
                        <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-gray-400 font-headline leading-relaxed">
                          Prochain renouvellement automatique le <strong>15 août 2026</strong> à 59,00 DH via votre Visa marocaine. Un rappel par email d'acier sera émis 3 jours avant.
                        </p>
                      </div>

                      {/* Anticipated renew manual CTA */}
                      <button
                        onClick={handleRenewNow}
                        className="w-full h-11 bg-[#00D9A5] hover:bg-[#00B48A] text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        RENOUVELER ANTICIPÉ MAINTENANT
                      </button>

                      {/* Warning if autoRenew is false */}
                      {!autoRenew && (
                        <div className="bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-xl p-3 flex items-center gap-2.5 text-left">
                          <AlertTriangle className="w-4.5 h-4.5 text-[#FF9500] flex-shrink-0" />
                          <p className="text-[10px] text-[#FF9500] font-headline font-bold leading-normal">
                            Renouvellement automatique désactivé. Votre abonnement PREMIUM expirera automatiquement le 15/08/2026.
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* SECTION 6: CONSEIL FINAL */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <Heart className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Chaque Alpha qui part nous fait réfléchir. Si tu changes d'avis, ta progression sera toujours là. On ne supprime jamais un frère d'armes.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Règle #12 du Code Alpha d'Honneur
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

      {/* SECTION 4: CONFIRMATION D'ANNULATION (MODAL FINAL) */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fade-in_0.3s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-[32px] max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            
            <div className="w-16 h-16 rounded-full bg-[#FF2D55]/10 flex items-center justify-center mx-auto text-[#FF2D55]">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-md font-headline font-black text-white uppercase tracking-tight">
                ABONNEMENT ANNULÉ AVEC SUCCÈS
              </h3>
              <p className="text-xs text-gray-400 font-headline leading-relaxed">
                Votre abonnement PREMIUM prendra fin le <strong>15 août 2026</strong>. Vos prélèvements CMI sont définitivement arrêtés. Vous conservez l'accès intégral jusqu'à cette date.
              </p>
            </div>

            <div className="bg-[#00D9A5]/10 border border-[#00D9A5]/20 rounded-xl p-3 text-center text-xs font-headline font-black text-[#00D9A5]">
              ℹ️ Tu peux réactiver ton élan à tout moment !
            </div>

            <button
              onClick={() => {
                setShowConfirmation(false);
                if (onNavigateToDashboard) onNavigateToDashboard();
                else if (onBack) onBack();
              }}
              className="w-full h-12 bg-[#FF2D55] hover:bg-[#D81B43] text-white rounded-xl text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
            >
              COMPRIS, RETOUR À L'ARÈNE
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
