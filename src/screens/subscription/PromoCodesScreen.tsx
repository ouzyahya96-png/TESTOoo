import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Tag, 
  Gift, 
  Users, 
  Copy, 
  Award, 
  Info, 
  Check, 
  X, 
  QrCode, 
  Share2, 
  Sparkles, 
  RefreshCw, 
  Code, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Zap,
  TrendingUp,
  Clock,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaButton } from '../../components/AlphaButton';

interface PromoCodesScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNavigateToSubscription?: () => void;
  userId?: string;
}

interface FlashOffer {
  id: string;
  title: string;
  oldPrice: number;
  newPrice: number;
  timeLeftSeconds: number;
  isActive: boolean;
  alreadyClaimedCount: number;
}

interface ActiveOffer {
  id: string;
  title: string;
  subtitle: string;
  type: 'BIENVENUE' | 'ANNIVERSAIRE' | 'STREAK BONUS' | 'CLAN VICTORY';
  color: string;
  badge: 'ACTIVE' | '48H' | 'DÉBLOQUÉ' | 'UTILISÉE';
  isUsed: boolean;
  usedDate: string | null;
}

interface ReferralState {
  code: string;
  invitedCount: number;
  convertedCount: number;
  pointsGained: number;
  palierBonusProgress: number;
  palierBonusUnlocked: boolean;
}

interface LoyaltyTier {
  name: string;
  monthsRequired: number;
  reward: string;
  unlocked: boolean;
}

interface LoyaltyProgram {
  currentLevel: string;
  monthsSubscribed: number;
  nextLevel: string;
  progressMonths: number;
  tiers: LoyaltyTier[];
}

export const PromoCodesScreen: React.FC<PromoCodesScreenProps> = ({
  addToast,
  onBack,
  onNavigateToSubscription,
  userId = 'guerrier_alpha'
}) => {
  // Tabs & Views
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  
  // Loader States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplyingCode, setIsApplyingCode] = useState<boolean>(false);
  
  // Data States
  const [flashOffer, setFlashOffer] = useState<FlashOffer | null>(null);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [referral, setReferral] = useState<ReferralState>({
    code: 'ALPHA-WARRIOR',
    invitedCount: 8,
    convertedCount: 3,
    pointsGained: 600,
    palierBonusProgress: 3,
    palierBonusUnlocked: false
  });
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram>({
    currentLevel: 'OR',
    monthsSubscribed: 12,
    nextLevel: 'PLATINE',
    progressMonths: 12,
    tiers: []
  });
  const [suggestedCodes, setSuggestedCodes] = useState<string[]>(['ALPHA50', 'WARRIOR', 'KEGEL100']);

  // Promo Input States
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoResult, setPromoResult] = useState<{
    success: boolean;
    message: string;
    code?: string;
    discountPercent?: number;
    rewardPoints?: number;
  } | null>(null);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [countdownStr, setCountdownStr] = useState<string>('04:23:18');

  // Fetch Promo Configuration
  const loadPromoData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/promos/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFlashOffer(data.flashOffer);
        setActiveOffers(data.activeOffers);
        setReferral(data.referral);
        setLoyaltyProgram(data.loyaltyProgram);
        setSuggestedCodes(data.suggestedCodes);
      } else {
        throw new Error('Fallback required');
      }
    } catch (err) {
      console.warn('API promos unreached, using local fallback state');
      // Local fallbacks
      setFlashOffer({
        id: 'flash_premium_50',
        title: '-50% SUR PREMIUM',
        oldPrice: 59,
        newPrice: 29.50,
        timeLeftSeconds: 15798,
        isActive: true,
        alreadyClaimedCount: 847
      });
      setActiveOffers([
        { id: 'offer_welcome', title: '-50% sur le 1er mois PREMIUM', subtitle: 'Valable 7 jours après inscription', type: 'BIENVENUE', color: '#00D9A5', badge: 'ACTIVE', isUsed: false, usedDate: null },
        { id: 'offer_birthday', title: '1 mois ELITE offert', subtitle: 'Valable 48h', type: 'ANNIVERSAIRE', color: '#FFD700', badge: '48H', isUsed: false, usedDate: null },
        { id: 'offer_streak', title: '30% de réduction sur ELITE', subtitle: 'Débloqué après 30 jours de suite', type: 'STREAK BONUS', color: '#4A90D9', badge: 'DÉBLOQUÉ', isUsed: false, usedDate: null },
        { id: 'offer_clan', title: '14 jours ALPHA offerts', subtitle: 'Utilisée après victoire de Clan', type: 'CLAN VICTORY', color: '#5A5A5A', badge: 'UTILISÉE', isUsed: true, usedDate: '2026-07-15' }
      ]);
      setReferral({
        code: 'ALPHA-WARRIOR',
        invitedCount: 8,
        convertedCount: 3,
        pointsGained: 600,
        palierBonusProgress: 3,
        palierBonusUnlocked: false
      });
      setLoyaltyProgram({
        currentLevel: 'OR',
        monthsSubscribed: 12,
        nextLevel: 'PLATINE',
        progressMonths: 12,
        tiers: [
          { name: 'BRONZE', monthsRequired: 3, reward: 'Skin Bronze', unlocked: true },
          { name: 'ARGENT', monthsRequired: 6, reward: '+500 PTS', unlocked: true },
          { name: 'OR', monthsRequired: 12, reward: '1 mois offert', unlocked: true },
          { name: 'PLATINE', monthsRequired: 18, reward: 'Badge Platine', unlocked: false },
          { name: 'DIAMANT', monthsRequired: 24, reward: 'VIP à vie', unlocked: false }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPromoData();
  }, [loadPromoData]);

  // Handle countdown timer for flash offer
  useEffect(() => {
    if (flashOffer && flashOffer.timeLeftSeconds > 0) {
      let secondsLeft = flashOffer.timeLeftSeconds;

      timerRef.current = setInterval(() => {
        if (secondsLeft > 0) {
          secondsLeft--;
          const hrs = Math.floor(secondsLeft / 3600);
          const mins = Math.floor((secondsLeft % 3600) / 60);
          const secs = secondsLeft % 60;
          const pad = (num: number) => num.toString().padStart(2, '0');
          setCountdownStr(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setCountdownStr('EXPIRÉ');
          setFlashOffer(prev => prev ? { ...prev, isActive: false } : null);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flashOffer]);

  // APPLY FLASH OFFER
  const handleApplyFlashOffer = () => {
    addToast('success', "⚡ Offre Flash activée ! Direction la page de souscription avec -50% appliqué.");
    if (onNavigateToSubscription) {
      onNavigateToSubscription();
    }
  };

  // APPLY PROMO CODE INPUT
  const handleApplyPromoCode = async () => {
    if (!promoInput.trim()) return;

    setIsApplyingCode(true);
    setPromoResult(null);

    try {
      const res = await fetch(`/api/promos/${userId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput })
      });

      const data = await res.json();
      if (res.ok) {
        setPromoResult({
          success: true,
          message: data.message,
          code: data.code,
          discountPercent: data.discountPercent,
          rewardPoints: data.rewardPoints
        });
        addToast('success', `Code ${data.code} appliqué avec succès ! 🎯`);
        
        // Refresh local points if points code is applied
        if (data.rewardPoints) {
          setReferral(prev => ({
            ...prev,
            pointsGained: prev.pointsGained + data.rewardPoints
          }));
        }
      } else {
        setPromoResult({
          success: false,
          message: data.error || 'Code invalide ou expiré.'
        });
        addToast('error', data.error || 'Erreur d\'application du code.');
      }
    } catch (err) {
      setPromoResult({
        success: false,
        message: 'Erreur technique lors de la validation du code.'
      });
      addToast('error', 'Erreur de connexion serveur.');
    } finally {
      setIsApplyingCode(false);
    }
  };

  // FILL SUGGESTED CHIPS
  const fillPromoCode = (code: string) => {
    setPromoInput(code);
    setPromoResult(null);
    addToast('info', `Code ${code} pré-rempli.`);
  };

  // SHARE REFERRAL CODE
  const handleShareReferral = async () => {
    try {
      const res = await fetch(`/api/promos/${userId}/referral/share`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setReferral(prev => ({ ...prev, invitedCount: data.invitedCount }));
        navigator.clipboard.writeText(referral.code);
        addToast('success', 'Lien de partage & code copiés ! Invitez vos frères d\'armes ⚔️');
      }
    } catch (err) {
      addToast('error', 'Impossible d\'enregistrer l\'action de partage.');
    }
  };

  // APPLY ACTIVE CARD OFFER
  const handleApplyCardOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/promos/${userId}/offers/${offerId}/apply`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setActiveOffers(prev => prev.map(o => o.id === offerId ? { ...o, isUsed: true, badge: 'UTILISÉE', usedDate: new Date().toISOString().split('T')[0] } : o));
        addToast('success', data.message);
      } else {
        addToast('warning', data.error);
      }
    } catch (err) {
      addToast('error', 'Erreur de communication avec le serveur.');
    }
  };

  // SIMULATOR CONTROL: CONVERT A FRIEND
  const handleSimulateConversion = async () => {
    try {
      const res = await fetch(`/api/promos/${userId}/simulation/convert`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setReferral(data.referral);
        addToast('success', 'Simulé : Un nouvel ami s\'est abonné ! +200 PTS et +7 jours VIP ajoutés. 🦾');
        if (data.referral.palierBonusUnlocked) {
          addToast('success', '🏆 MAGNIFIQUE ! 4 parrainages atteints ! 3 mois VIP GRATUITS offerts au Clan !');
        }
      }
    } catch (err) {
      addToast('error', 'Erreur de simulation de conversion.');
    }
  };

  // SIMULATOR CONTROL: RESET
  const handleSimulateReset = async () => {
    try {
      const res = await fetch(`/api/promos/${userId}/simulation/reset`, {
        method: 'POST'
      });
      if (res.ok) {
        addToast('info', 'Données promos réinitialisées à l\'origine.');
        loadPromoData();
        setPromoInput('');
        setPromoResult(null);
      }
    } catch (err) {
      addToast('error', 'Erreur de réinitialisation.');
    }
  };

  // EXPO NATIVE CODE STRING TEMPLATE
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  Modal,
  Share,
  Clipboard
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

export default function PromoCodesScreen({ navigation }) {
  // STATE MANAGEMENT
  const [promoCode, setPromoCode] = useState('');
  const [appliedResult, setAppliedResult] = useState(null);
  const [invitedCount, setInvitedCount] = useState(8);
  const [convertedCount, setConvertedCount] = useState(3);
  const [points, setPoints] = useState(600);
  const [secondsLeft, setSecondsLeft] = useState(15798);
  const [countdown, setCountdown] = useState('04:23:18');
  const [infoVisible, setInfoVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  // COUNTDOWN EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        const next = prev - 1;
        const h = Math.floor(next / 3600);
        const m = Math.floor((next % 3600) / 60);
        const s = next % 60;
        const pad = (num) => num.toString().padStart(2, '0');
        setCountdown(\`\${pad(h)}:\${pad(m)}:\${pad(s)}\`);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Clipboard.setString('ALPHA-WARRIOR');
    alert('Code parrainage copié dans le presse-papiers !');
  };

  const shareReferral = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: 'Rejoins-moi sur ALPHA MAN ! Utilise mon code parrainage ALPHA-WARRIOR pour débloquer 7 jours PREMIUM offerts.',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const applyPromo = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'ALPHA50') {
      setAppliedResult({ success: true, message: 'Code ALPHA50 valide ! -50% appliqué sur PREMIUM.' });
    } else if (clean === 'WARRIOR') {
      setAppliedResult({ success: true, message: 'Code WARRIOR valide ! -30% immédiat appliqué.' });
    } else {
      setAppliedResult({ success: false, message: 'Code promotionnel inconnu ou expiré.' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.touchTarget} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OFFRES SPÉCIALES</Text>
        <TouchableOpacity style={styles.touchTarget} onPress={() => setInfoVisible(true)}>
          <Feather name="info" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* SECTION 1: FLASH OFFER */}
        <View style={styles.flashCard}>
          <View style={styles.flashBadge}>
            <Text style={styles.flashBadgeText}>⚡ FLASH</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏰ {countdown}</Text>
          </View>
          
          <Text style={styles.flashTitle}>-50% SUR PREMIUM</Text>
          <Text style={styles.flashSubtitle}>Aujourd'hui uniquement</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>59 DH</Text>
            <Text style={styles.newPrice}>29,50 DH</Text>
            <Text style={styles.pricePeriod}>/mois</Text>
          </View>

          <View style={styles.savingBox}>
            <Text style={styles.savingText}>Tu économises 354 DH/an</Text>
          </View>

          <TouchableOpacity 
            style={styles.flashBtn} 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.navigate('Subscription');
            }}
          >
            <Text style={styles.flashBtnText}>PROFITER MAINTENANT</Text>
          </TouchableOpacity>
          <Text style={styles.alreadyClaimedText}>847 Alphas ont déjà profité</Text>
        </View>

        {/* SECTION 2: PROMO CODES */}
        <Text style={styles.sectionTitle}>CODE PROMO</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Feather name="tag" size={18} color="#8E8E93" style={styles.tagIcon} />
            <TextInput 
              style={styles.textInput}
              placeholder="Entre ton code promo..."
              placeholderTextColor="#5A5A5A"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              maxLength={12}
            />
            <TouchableOpacity 
              style={[styles.applyBtn, !promoCode && styles.applyBtnDisabled]}
              disabled={!promoCode}
              onPress={applyPromo}
            >
              <Text style={styles.applyBtnText}>OK</Text>
            </TouchableOpacity>
          </View>

          {appliedResult && (
            <View style={[styles.resultContainer, appliedResult.success ? styles.resultSuccess : styles.resultError]}>
              <Feather 
                name={appliedResult.success ? "check-circle" : "alert-circle"} 
                size={18} 
                color={appliedResult.success ? "#00D9A5" : "#FF2D55"} 
              />
              <Text style={[styles.resultText, appliedResult.success ? styles.textSuccess : styles.textError]}>
                {appliedResult.message}
              </Text>
            </View>
          )}

          <View style={styles.chipsRow}>
            {['ALPHA50', 'WARRIOR', 'KEGEL100'].map((chip) => (
              <TouchableOpacity 
                key={chip} 
                style={styles.chip}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPromoCode(chip);
                }}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 3: REFERRAL CARD */}
        <Text style={[styles.sectionTitle, { color: '#00D9A5' }]}>PARRAINE ET GAGNE</Text>
        <View style={[styles.card, { borderColor: '#00D9A5', borderWidth: 2 }]}>
          <View style={styles.referralHeader}>
            <Feather name="users" size={32} color="#00D9A5" />
            <View style={styles.refHeaderTextContainer}>
              <Text style={styles.refHeading}>Invite tes frères d'armes</Text>
              <Text style={styles.refDesc}>
                Gagne 200 PTS + 7 jours PREMIUM gratuit pour chaque ami qui s'abonne.
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{invitedCount}</Text>
              <Text style={styles.statLabel}>Invités</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#00D9A5' }]}>{convertedCount}</Text>
              <Text style={styles.statLabel}>Convertis</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#FFD700' }]}>{points}</Text>
              <Text style={styles.statLabel}>Gagnés (PTS)</Text>
            </View>
          </View>

          {/* PALIER MILESTONE */}
          <View style={styles.palierCard}>
            <Text style={styles.palierTitle}>🎁 4 parrainages = 3 mois VIP offerts</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: \`\${Math.min(100, (convertedCount/4)*100)}%\`} ]} />
            </View>
            <Text style={styles.progressText}>{convertedCount}/4 convertis pour débloquer le palier VIP</Text>
          </View>

          <View style={styles.shareCodeBox}>
            <Text style={styles.codeText}>ALPHA-WARRIOR</Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
              <Feather name="copy" size={16} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={shareReferral}>
              <Text style={styles.shareBtnText}>PARTAGER</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qrBtn} onPress={() => setQrVisible(true)}>
              <Text style={styles.qrBtnText}>QR CODE</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.referralRules}>
            • 7 jours PREMIUM gratuit pour ton ami\n
            • 200 PTS + 7 jours PREMIUM par conversion\n
            • 3 mois VIP offerts au 4ème parrainage\n
            • Limite 10 parrainages/mois
          </Text>
        </View>

      </ScrollView>

      {/* INFO MODAL */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comment fonctionnent les offres ?</Text>
            <Text style={styles.modalBody}>
              Les codes promo et offres flash te donnent accès à des réductions exclusives. Le parrainage te récompense pour chaque ami qui rejoint ALPHA MAN.
            </Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setInfoVisible(false)}>
              <Text style={styles.modalCloseText}>D'accord</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR MODAL */}
      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ton QR Code Parrainage</Text>
            <View style={styles.qrPlaceholder}>
              <Feather name="qr-code" size={120} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setQrVisible(false)}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
  touchTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#FFD700', letterSpacing: 1 },
  scroll: { paddingBottom: 40 },
  sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#FFD700', paddingHorizontal: 16, marginTop: 24, marginBottom: 12, letterSpacing: 1 },
  card: { backgroundColor: '#16213E', borderRadius: 16, padding: 20, marginHorizontal: 16 },
  
  // Flash Offer
  flashCard: { backgroundColor: '#FF2D55', borderRadius: 24, padding: 24, marginHorizontal: 16, marginTop: 16, position: 'relative', borderWidth: 2, borderColor: '#FF2D55' },
  flashBadge: { position: 'absolute', top: -10, left: 20, backgroundColor: '#FFFFFF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  flashBadgeText: { fontFamily: 'Montserrat-Bold', fontSize: 10, color: '#FF2D55' },
  timerBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  timerText: { fontFamily: 'RobotoMono-Bold', fontSize: 12, color: '#FFFFFF' },
  flashTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#FFFFFF', textAlign: 'center', marginTop: 16 },
  flashSubtitle: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#FFFFFF', opacity: 0.9, textAlign: 'center', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  oldPrice: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#FFFFFF', opacity: 0.7, textDecorationLine: 'line-through', marginRight: 10 },
  newPrice: { fontFamily: 'RobotoMono-Bold', fontSize: 28, color: '#FFD700' },
  pricePeriod: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#FFFFFF', opacity: 0.8 },
  savingBox: { alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, marginTop: 12 },
  savingText: { fontFamily: 'Inter-Medium', fontSize: 12, color: '#FFFFFF' },
  flashBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14, marginTop: 20, alignItems: 'center' },
  flashBtnText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#FF2D55' },
  alreadyClaimedText: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#FFFFFF', opacity: 0.8, textAlign: 'center', marginTop: 8 },

  // Promo Input
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 12, borderWidth: 1, borderColor: '#5A5A5A', paddingHorizontal: 12, height: 50 },
  tagIcon: { marginRight: 8 },
  textInput: { flex: 1, fontFamily: 'Inter-Regular', color: '#FFFFFF', fontSize: 14 },
  applyBtn: { backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 16, height: 36, alignItems: 'center', justifyContent: 'center' },
  applyBtnDisabled: { backgroundColor: '#5A5A5A' },
  applyBtnText: { fontFamily: 'Inter-Bold', fontSize: 12, color: '#0F0F1A' },
  resultContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 10, borderRadius: 8, borderWidth: 1 },
  resultSuccess: { backgroundColor: 'rgba(0,217,165,0.08)', borderColor: 'rgba(0,217,165,0.3)' },
  resultError: { backgroundColor: 'rgba(255,45,85,0.08)', borderColor: 'rgba(255,45,85,0.3)' },
  resultText: { fontFamily: 'Inter-Medium', fontSize: 12, marginLeft: 8, flex: 1 },
  textSuccess: { color: '#00D9A5' },
  textError: { color: '#FF2D55' },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  chip: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontFamily: 'RobotoMono-Medium', fontSize: 11, color: '#8E8E93' },

  // Referral
  referralHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  refHeaderTextContainer: { flex: 1 },
  refHeading: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#FFFFFF' },
  refDesc: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#8E8E93', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, backgroundColor: '#0F0F1A', padding: 12, borderRadius: 12 },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontFamily: 'RobotoMono-Bold', fontSize: 18, color: '#FFFFFF' },
  statLabel: { fontFamily: 'Inter-Regular', fontSize: 10, color: '#5A5A5A', marginTop: 4 },
  palierCard: { backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 12, padding: 12, marginTop: 16, borderLeftWidth: 3, borderLeftColor: '#FFD700' },
  palierTitle: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#FFD700' },
  progressBarBg: { height: 6, backgroundColor: '#1A1A2E', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#FFD700' },
  progressText: { fontFamily: 'Inter-Medium', fontSize: 10, color: '#8E8E93', marginTop: 6 },
  shareCodeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A2E', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FFD700', padding: 14, marginTop: 16 },
  codeText: { fontFamily: 'RobotoMono-Bold', fontSize: 16, color: '#FFD700' },
  copyBtn: { padding: 4 },
  actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  shareBtn: { flex: 1, backgroundColor: '#00D9A5', borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#0F0F1A' },
  qrBtn: { flex: 1, borderWidth: 1, borderColor: '#FFD700', borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center' },
  qrBtnText: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#FFD700' },
  referralRules: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#5A5A5A', marginTop: 16, lineHeight: 16 },

  // Modals
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#111124', borderWidth: 1, borderColor: '#1C1C3A', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFD700', textAlign: 'center', marginBottom: 12 },
  modalBody: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#8E8E93', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  modalCloseBtn: { backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'stretch', alignItems: 'center' },
  modalCloseText: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#0F0F1A' },
  qrPlaceholder: { padding: 20, backgroundColor: '#1A1A2E', borderRadius: 16, marginVertical: 16 }
});
`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source PromoCodesScreen copié ! 🧬');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative font-sans" id="promo-codes-root">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded-md">
            MODULE PROMO ET ENGAGEMENT (7.5)
          </span>
          <h2 className="text-md font-bold text-white mt-1 uppercase tracking-wider">
            Codes Promo, Parrainage & Fidélité — PromoCodesScreen
          </h2>
          <p className="text-xs text-gray-400 font-body">
            Simulateur d'acquisition virale et de rétention d'utilisateurs avec passerelle fidélité par paliers.
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
              <h4 className="text-xs font-bold text-white">PromoCodesScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500 font-mono">
                Code source natif React Native avec StyleSheet optimisé pour l'application mobile.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyExpoCode}
              className="flex items-center gap-2 text-[10px] font-sans"
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
            <h3 className="text-sm font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-2 font-mono">
              <Gift className="w-4 h-4" />
              Console d'Offres Promo
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Pilotez les états de parrainage et de conversion pour tester les comportements de récompenses.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Convert a friend simulation */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                Acquisition Virale
              </span>
              <button 
                onClick={handleSimulateConversion}
                className="w-full py-2.5 bg-[#00D9A5]/10 border border-[#00D9A5]/20 hover:bg-[#00D9A5]/20 text-[#00D9A5] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                Simuler un Parrainage Réussi
              </button>
              <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                Incrémente le nombre d'amis convertis. Offre instantanément +200 PTS. Si le total atteint 4 parrainages convertis, débloque automatiquement les <strong>3 mois de VIP offerts</strong>.
              </p>
            </div>

            {/* Quick reset of the simulated storage */}
            <div className="space-y-2 pt-2 border-t border-gray-800/60">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                Contrôle de l'État
              </span>
              <button 
                onClick={handleSimulateReset}
                className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Réinitialiser la Simulation
              </button>
            </div>

            {/* Static documentation rules */}
            <div className="p-3 bg-[#16213E]/50 border border-white/5 rounded-xl text-[10px] text-gray-400 space-y-1.5">
              <span className="font-bold text-[#FFD700] uppercase block font-mono">🎯 Codes Promo valides :</span>
              <p>• <strong className="text-white">ALPHA50</strong> : -50% sur l'abonnement Premium.</p>
              <p>• <strong className="text-white">WARRIOR</strong> : -30% immédiat.</p>
              <p>• <strong className="text-white">KEGEL100</strong> : Bonus de +100 Points Clans.</p>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: SMARTPHONE SIMULATOR */}
        <div className="lg:col-span-8 flex justify-center">
          
          {/* Smartphone mock frame */}
          <div className="w-full max-w-md bg-[#0F0F1A] border-4 border-[#1C1C3A] rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[750px] relative">
            
            {/* Top camera Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-[#1C1C3A] rounded-b-xl z-50 flex items-center justify-center">
              <span className="w-3 h-3 bg-black rounded-full" />
              <span className="w-12 h-1 bg-gray-700 rounded-full ml-4" />
            </div>

            {/* PHONE HEADER */}
            <header className="h-16 pt-5 bg-[#0F0F1A] border-b border-[#1A1A2E] px-4 flex items-center justify-between z-10">
              <button 
                onClick={onBack}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-white cursor-pointer"
                id="phone-btn-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-black text-[#FFD700] uppercase tracking-widest font-mono">
                OFFRES SPÉCIALES
              </h1>
              <button 
                onClick={() => setShowInfoPanel(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-[#8E8E93] hover:text-white cursor-pointer"
                id="phone-btn-info"
              >
                <Info className="w-5 h-5" />
              </button>
            </header>

            {/* PHONE MAIN SCROLL CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-12 text-left" style={{ maxHeight: '680px' }}>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#FFD700]" />
                  <p className="text-xs font-mono">Synchronisation des offres...</p>
                </div>
              ) : (
                <>
                  {/* SECTION 1: TODAY FLASH OFFER BANNER (If Active) */}
                  {flashOffer && flashOffer.isActive && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-br from-[#FF2D55] to-[#FF9500] rounded-3xl p-5 border-2 border-[#FF2D55] relative shadow-lg"
                      id="flash-offer-banner"
                    >
                      {/* Pulse Flash Badge */}
                      <span className="absolute -top-3 left-5 bg-white text-[#FF2D55] text-[9px] font-black font-mono px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-md animate-pulse">
                        ⚡ FLASH
                      </span>

                      {/* Timer Badge */}
                      <span className="absolute top-4 right-4 bg-black/40 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                        ⏰ {countdownStr}
                      </span>

                      <h3 className="text-lg font-black text-white text-center mt-4 tracking-tight uppercase font-mono">
                        {flashOffer.title}
                      </h3>
                      <p className="text-xs text-white/90 text-center font-medium mt-0.5">
                        Aujourd'hui uniquement
                      </p>

                      <div className="flex items-center justify-center gap-2 mt-4">
                        <span className="text-sm text-white/60 line-through font-mono">{flashOffer.oldPrice} DH</span>
                        <span className="text-2xl font-bold font-mono text-[#FFD700]">{flashOffer.newPrice.toFixed(2).replace('.', ',')} DH</span>
                        <span className="text-xs text-white/80">/mois</span>
                      </div>

                      <div className="bg-white/15 rounded-lg py-1 px-3 text-center w-fit mx-auto mt-3">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                          Tu économises 354 DH/an
                        </span>
                      </div>

                      <button
                        onClick={handleApplyFlashOffer}
                        className="w-full mt-5 py-3 rounded-xl bg-white text-[#FF2D55] font-black uppercase tracking-wider text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
                        id="btn-claim-flash"
                      >
                        PROFITER MAINTENANT
                      </button>

                      <p className="text-[10px] text-white/80 text-center mt-2.5 font-sans">
                        {flashOffer.alreadyClaimedCount} Alphas ont déjà profité de cette offre
                      </p>
                    </motion.div>
                  )}

                  {/* SECTION 2: PROMO CODES ENTRY */}
                  <section className="space-y-2" id="promo-codes-entry-section">
                    <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-wider font-mono px-1">
                      CODE PROMO
                    </h3>
                    
                    <div className="bg-[#16213E] rounded-2xl p-4 border border-[#1E294A] space-y-3.5 shadow-md">
                      
                      {/* Input row */}
                      <div className="flex items-center bg-[#1A1A2E] rounded-xl border border-gray-700/80 p-1.5 pl-3.5">
                        <Tag className="w-4 h-4 text-gray-500 mr-2.5 shrink-0" />
                        <input
                          type="text"
                          placeholder="Entre ton code promo..."
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            setPromoResult(null);
                          }}
                          maxLength={12}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder-gray-600 uppercase"
                        />
                        <button
                          onClick={handleApplyPromoCode}
                          disabled={!promoInput.trim() || isApplyingCode}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            promoInput.trim() 
                              ? 'bg-[#FFD700] text-[#0F0F1A] hover:bg-[#E6C200]' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isApplyingCode ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'OK'}
                        </button>
                      </div>

                      {/* Result notifications */}
                      {promoResult && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                            promoResult.success 
                              ? 'bg-[#00D9A5]/8 border-[#00D9A5]/30 text-[#00D9A5]' 
                              : 'bg-[#FF2D55]/8 border-[#FF2D55]/30 text-[#FF2D55]'
                          }`}
                        >
                          {promoResult.success ? (
                            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-semibold leading-relaxed">
                              {promoResult.message}
                            </p>
                            {promoResult.success && promoResult.discountPercent && promoResult.discountPercent > 0 && (
                              <button
                                onClick={onNavigateToSubscription}
                                className="mt-2 text-[10px] font-black uppercase tracking-wider bg-[#00D9A5] text-[#0F0F1A] px-3 py-1 rounded shadow hover:bg-[#00B085] transition-colors"
                              >
                                GO → S'abonner
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Chip shortcuts */}
                      <div className="flex flex-wrap gap-2 pt-1" id="promo-suggested-chips">
                        {suggestedCodes.map((code) => (
                          <button
                            key={code}
                            onClick={() => fillPromoCode(code)}
                            className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-full px-3 py-1 text-[10px] font-mono tracking-wider transition-all cursor-pointer"
                          >
                            {code}
                          </button>
                        ))}
                      </div>

                    </div>
                  </section>

                  {/* SECTION 3: REFERRAL PROGRAM (PARRAINE ET GAGNE) */}
                  <section className="space-y-2" id="referral-program-section">
                    <h3 className="text-xs font-black text-[#00D9A5] uppercase tracking-wider font-mono px-1">
                      PARRAINE ET GAGNE
                    </h3>

                    <div className="bg-[#16213E] rounded-3xl p-5 border-2 border-[#00D9A5] space-y-4 shadow-lg">
                      
                      {/* Header block */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#00D9A5]/10 border border-[#00D9A5]/25 text-[#00D9A5] flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight font-mono">
                            Invite tes frères d'armes
                          </h4>
                          <p className="text-[11px] text-gray-400 leading-normal font-sans mt-0.5">
                            Gagne <span className="text-[#FFD700] font-bold">200 PTS</span> + <span className="text-[#00D9A5] font-bold">7 jours PREMIUM</span> gratuit pour chaque ami qui s'abonne.
                          </p>
                        </div>
                      </div>

                      {/* Stats grid row */}
                      <div className="grid grid-cols-3 gap-2 bg-[#0F0F1A] p-3 rounded-xl border border-gray-800/80 text-center">
                        <div>
                          <span className="text-base font-black font-mono text-white">{referral.invitedCount}</span>
                          <span className="block text-[9px] text-gray-500 uppercase font-mono mt-0.5">Invités</span>
                        </div>
                        <div className="border-x border-gray-800">
                          <span className="text-base font-black font-mono text-[#00D9A5]">{referral.convertedCount}</span>
                          <span className="block text-[9px] text-gray-500 uppercase font-mono mt-0.5">Convertis</span>
                        </div>
                        <div>
                          <span className="text-base font-black font-mono text-[#FFD700]">{referral.pointsGained}</span>
                          <span className="block text-[9px] text-gray-500 uppercase font-mono mt-0.5">Gagnés</span>
                        </div>
                      </div>

                      {/* Palier Milestone Block */}
                      <div className="bg-[#FFD700]/5 border-l-4 border-[#FFD700] p-3.5 rounded-r-xl space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-black text-[#FFD700] font-mono flex items-center gap-1 uppercase">
                            🎁 4 parrainages = 3 mois VIP offerts
                          </span>
                        </div>
                        <div className="h-2 bg-[#0F0F1A] rounded-full overflow-hidden border border-gray-800">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (referral.palierBonusProgress / 4) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span>{referral.palierBonusProgress}/4 convertis</span>
                          {referral.palierBonusUnlocked ? (
                            <span className="text-[#00D9A5] font-black uppercase font-mono">DÉBLOQUÉ 🎉</span>
                          ) : (
                            <span className="font-mono text-gray-500">Palier VIP</span>
                          )}
                        </div>
                      </div>

                      {/* Code container box */}
                      <div className="flex items-center justify-between bg-[#1A1A2E] border border-[#2D2D44] border-dashed rounded-xl p-3.5">
                        <span className="font-mono text-sm font-black text-[#FFD700] tracking-wider">
                          {referral.code}
                        </span>
                        <button
                          onClick={handleShareReferral}
                          className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 hover:text-white text-[#FFD700] flex items-center justify-center transition-all cursor-pointer"
                          title="Copier le code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Buttons share / QR */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          onClick={handleShareReferral}
                          className="py-3 bg-[#00D9A5] hover:bg-[#00C293] text-[#0F0F1A] text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          PARTAGER
                        </button>
                        <button
                          onClick={() => setShowQRModal(true)}
                          className="py-3 border border-[#FFD700] text-[#FFD700] text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          QR CODE
                        </button>
                      </div>

                      {/* Rules block */}
                      <div className="text-[10px] text-gray-500 leading-normal font-sans border-t border-gray-800 pt-3 space-y-1">
                        <p>• 7 jours PREMIUM gratuit pour ton ami parrainé.</p>
                        <p>• 200 PTS + 7 jours PREMIUM supplémentaires par conversion pour toi.</p>
                        <p>• 3 mois VIP offerts automatiquement au 4ème parrainage validé.</p>
                        <p>• Limite de 10 invitations qualifiées par mois.</p>
                      </div>

                    </div>
                  </section>

                  {/* SECTION 4: ACTIVE OFFERS (TOUTES LES OFFRES) */}
                  <section className="space-y-2" id="active-offers-catalog-section">
                    <h3 className="text-xs font-black text-[#FFD700] uppercase tracking-wider font-mono px-1">
                      TOUTES LES OFFRES
                    </h3>

                    <div className="space-y-3">
                      {activeOffers.map((offer) => {
                        const isUsed = offer.isUsed;
                        return (
                          <div
                            key={offer.id}
                            className={`p-4 bg-[#16213E] border border-white/5 rounded-2xl relative shadow-md overflow-hidden flex justify-between gap-4 transition-all ${
                              isUsed ? 'opacity-50' : 'hover:border-gray-700'
                            }`}
                          >
                            {/* Colorful left border borderLeft */}
                            <div 
                              className="absolute top-0 bottom-0 left-0 w-1" 
                              style={{ backgroundColor: offer.color }} 
                            />

                            {/* Offer Info */}
                            <div className="pl-2 flex-1 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-black text-white font-mono uppercase tracking-wide">
                                  {offer.type}
                                </h4>
                                <span 
                                  className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border"
                                  style={{ 
                                    backgroundColor: `${offer.color}15`, 
                                    borderColor: `${offer.color}40`,
                                    color: offer.color 
                                  }}
                                >
                                  {offer.badge}
                                </span>
                              </div>
                              <p className="text-xs text-white/90 font-bold mt-1 font-body leading-tight">
                                {offer.title}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5 font-sans">
                                {offer.subtitle}
                              </p>

                              {isUsed && offer.usedDate && (
                                <p className="text-[9px] text-[#FF2D55] font-mono mt-1 font-bold">
                                  Utilisée le {new Date(offer.usedDate).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>

                            {/* Button */}
                            {!isUsed && (
                              <div className="flex items-end shrink-0">
                                <button
                                  onClick={() => handleApplyCardOffer(offer.id)}
                                  className="px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#E5C100] text-[#0F0F1A] text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                  UTILISER
                                </button>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center pt-2">
                      <button 
                        onClick={() => addToast('info', 'Historique complet des transactions et bonus d\'offres à jour.')}
                        className="text-xs text-gray-500 hover:text-white font-mono tracking-wider uppercase transition-colors"
                      >
                        VOIR L'HISTORIQUE DES OFFRES →
                      </button>
                    </div>
                  </section>

                  {/* SECTION 5: PROGRAMME FIDÉLITÉ (LOYALTY PROGRAM) */}
                  <section className="space-y-2" id="loyalty-program-section">
                    
                    <div className="bg-gradient-to-br from-[#16213E] to-[#1A1A2E] rounded-3xl p-5 border border-[#FFD700]/30 space-y-4 shadow-xl relative">
                      
                      {/* Header block */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-[#FFD700]" />
                          <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider font-mono">
                            PROGRAMME FIDÉLITÉ
                          </h4>
                        </div>
                        <span className="text-[10px] font-black font-mono bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/25 px-2.5 py-0.5 rounded-lg uppercase">
                          OR
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 font-sans leading-normal">
                        Plus tu restes, plus tu gagnes. Chaque mois d'abonnement consécutif débloque des privilèges et skins de combat exclusifs.
                      </p>

                      {/* 5 Levels horizontal row */}
                      <div className="flex justify-between items-center relative pt-4 pb-2">
                        
                        {/* Underline connect */}
                        <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
                        <div className="absolute top-1/2 left-3 w-3/5 h-0.5 bg-[#FFD700] -translate-y-1/2 z-0" />

                        {loyaltyProgram.tiers.map((tier) => {
                          const isCurrent = tier.name === 'OR';
                          return (
                            <div key={tier.name} className="flex flex-col items-center gap-1.5 z-10 relative">
                              <div 
                                className={`rounded-full flex items-center justify-center font-mono font-black text-[9px] relative transition-all ${
                                  isCurrent 
                                    ? 'w-11 h-11 bg-[#FFD700] text-[#0F0F1A] border-4 border-[#0F0F1A] shadow-lg shadow-[#FFD700]/30 animate-pulse'
                                    : tier.unlocked 
                                      ? 'w-7 h-7 bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]'
                                      : 'w-7 h-7 bg-[#0F0F1A] text-gray-600 border border-gray-800'
                                }`}
                              >
                                {tier.monthsRequired}m
                              </div>
                              <span className={`text-[8px] font-bold font-mono uppercase tracking-wide ${
                                isCurrent ? 'text-[#FFD700]' : tier.unlocked ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {tier.name}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                      {/* Progress bar info */}
                      <div className="space-y-1.5 pt-2">
                        <div className="h-1.5 bg-[#0F0F1A] rounded-full overflow-hidden border border-gray-800">
                          <div 
                            className="h-full bg-[#FFD700] rounded-full"
                            style={{ width: '66%' }} // 12/18 months progress
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                          <span>12/18 mois vers PLATINE</span>
                          <span>Niveau Or actif</span>
                        </div>
                      </div>

                    </div>
                  </section>

                  {/* SECTION 6: PROMO TIP (CONSEIL PROMO) */}
                  <section className="bg-[#1A1A2E] border-l-4 border-[#FFD700] p-4 rounded-r-xl shadow-sm space-y-1" id="promo-tip-card">
                    <p className="text-[11px] text-gray-300 font-body leading-relaxed">
                      💡 <strong>Les meilleures offres sont réservées aux Alphas fidèles.</strong> Reste actif, parraine tes frères, et débloque des récompenses que personne d'autre n'a.
                    </p>
                    <p className="text-[9px] text-[#5A5A5A] font-mono italic">
                      Règle #12 du Code Alpha
                    </p>
                  </section>

                </>
              )}

            </div>

            {/* Bottom screen navigator bar decor */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-10" />

          </div>
        </div>

      </div>

      {/* COMMENT ÇA MARCHE MODAL (INFO PANEL) */}
      <AnimatePresence>
        {showInfoPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-sm w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                <h3 className="text-sm font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <HelpCircle className="w-5 h-5" />
                  Comment fonctionnent les offres ?
                </h3>
                <button 
                  onClick={() => setShowInfoPanel(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-xs text-gray-300 leading-relaxed">
                Les codes promo et offres flash te donnent accès à des réductions exclusives. Le parrainage te récompense pour chaque ami qui rejoint ALPHA MAN.
              </p>

              <div className="bg-[#16213E] p-3 rounded-xl border border-white/5 text-[10px] text-gray-400 leading-normal">
                💪 <strong>Guerrier Alpha :</strong> Les ressources de ton Clan augmentent avec la taille de tes troupes. Invite ton réseau d'hommes en quête de discipline !
              </div>

              <button 
                onClick={() => setShowInfoPanel(false)}
                className="w-full py-3 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0F0F1A] rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                D'ACCORD, COMPRIS
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR CODE POPUP MODAL */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-center"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-xs w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-3 text-left">
                <h3 className="text-xs font-bold text-[#00D9A5] uppercase tracking-wider font-mono">
                  Ton QR Code Parrainage
                </h3>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Image Placeholder */}
              <div className="bg-[#0F0F1A] border border-gray-800 p-5 rounded-2xl w-fit mx-auto shadow-inner">
                <QrCode className="w-40 h-40 text-white" />
              </div>

              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-[10px] text-gray-400 font-mono tracking-wide">
                  Fais scanner ce code par ton ami pour lui offrir ses 7 jours Premium et valider ton bonus !
                </p>
              </div>

              <button 
                onClick={() => setShowQRModal(false)}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
