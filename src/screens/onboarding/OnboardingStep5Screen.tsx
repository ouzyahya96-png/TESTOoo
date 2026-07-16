import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Zap,
  Smile,
  BatteryCharging,
  Lock,
  Gift,
  Flame,
  Code,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface OnboardingStep5ScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNext?: () => void;
}

export const OnboardingStep5Screen: React.FC<OnboardingStep5ScreenProps> = ({
  addToast,
  onBack,
  onNext
}) => {
  // Screen States
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activePlanCard, setActivePlanCard] = useState<number | null>(1); // Expand Phase 1 by default
  const [celebrationActive, setCelebrationActive] = useState<boolean>(true);

  // Stop celebration particles after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCelebrationActive(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleFinishOnboarding = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 30, 100]); // Final Heavy success buzzes
    }
    addToast('success', "Félicitations ! Profil ALPHA MAN généré avec succès. Bienvenue à bord ! 🔥");
    if (onNext) {
      onNext();
    }
  };

  const copyNativeCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source OnboardingStep5Screen copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // High Fidelity React Native / Expo Code matching the specifications exactly
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width: screenWidth } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OnboardingStep5Screen() {
  const navigation = useNavigation();
  
  // Local state
  const [userProfile, setUserProfile] = useState({
    struggleDuration: "1 à 3 ans",
    primaryTriggers: "Le soir, Le stress",
    currentMood: "Motivé (7/10)",
    energyLevel: "Bien (6/10)"
  });
  
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  // Animations declarations
  const progressWidth = useRef(new Animated.Value(screenWidth * 0.80)).current; // starts at 80%
  const trophyScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  
  const profileCardOpacity = useRef(new Animated.Value(0)).current;
  const profileCardTranslateY = useRef(new Animated.Value(30)).current;
  
  const planTitleOpacity = useRef(new Animated.Value(0)).current;
  const phase1TranslateX = useRef(new Animated.Value(-50)).current;
  const phase1Opacity = useRef(new Animated.Value(0)).current;
  const phase2TranslateX = useRef(new Animated.Value(-50)).current;
  const phase2Opacity = useRef(new Animated.Value(0)).current;
  const phase3TranslateX = useRef(new Animated.Value(-50)).current;
  const phase3Opacity = useRef(new Animated.Value(0)).current;

  const bonusScale = useRef(new Animated.Value(0)).current;
  const bonusOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(30)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Load compiled onboarding states (Optional)
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('onboarding_answers');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserProfile({
            struggleDuration: parsed.struggleDuration || "1 à 3 ans",
            primaryTriggers: parsed.triggers ? parsed.triggers.join(', ') : "Le soir, Le stress",
            currentMood: parsed.currentMood ? \`Motivé (\${parsed.currentMood}/10)\` : "Motivé (7/10)",
            energyLevel: parsed.energyLevel ? \`Bien (\${parsed.energyLevel}/10)\` : "Bien (6/10)"
          });
        }
      } catch (e) {
        console.log("Error loading onboarding answers", e);
      }
    };
    loadData();

    // 2. Play sequential layout animations
    Animated.timing(progressWidth, {
      toValue: screenWidth,
      duration: 600,
      useNativeDriver: false
    }).start();

    // Trophy spring entrance
    Animated.spring(trophyScale, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
      delay: 200
    }).start();

    // Title sequence
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(titleTranslateY, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start();

    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      delay: 600
    }).start();

    // Profile card
    Animated.parallel([
      Animated.timing(profileCardOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(profileCardTranslateY, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();

    // Plan phases staggered translation
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(planTitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(phase1TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(phase1Opacity, { toValue: 1, duration: 400, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(phase2TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(phase2Opacity, { toValue: 1, duration: 400, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(phase3TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(phase3Opacity, { toValue: 1, duration: 400, useNativeDriver: true })
      ])
    ]).start();

    // Bonus & CTA final entrance
    Animated.parallel([
      Animated.timing(bonusOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(bonusScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1, friction: 5, delay: 200, useNativeDriver: true }),
      Animated.timing(ctaOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(ctaTranslateY, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();

  }, []);

  const togglePhase = (phaseId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Save onboarding completion flags
    const timestamp = new Date().toISOString();
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    await AsyncStorage.setItem('onboardingCompletedAt', timestamp);
    
    // POST to API backend (Async fire-and-forget)
    try {
      fetch('https://api.alphaman.app/users/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedAt: timestamp })
      });
    } catch (e) {
      // Ignored for offline-first support
    }

    // Redirect to Dashboard (Standard replacement prevents going back to onboarding)
    navigation.reset({
      index: 0,
      routes: [{ name: 'DashboardScreen' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      {/* CONFETTI LAYER */}
      <LottieView
        source={require('../../assets/confetti.json')}
        autoPlay
        loop={false}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* 100% SUCCESS PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* HEADER ACTIONS */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.headerStepText}>5 sur 5</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* MAIN PLAN SCROLLBODY */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CONGRATS SECTION */}
        <View style={styles.congratsWrapper}>
          <Animated.View style={[styles.trophyContainer, { transform: [{ scale: trophyScale }] }]}>
            <Ionicons name="trophy" size={54} color="#FFD700" />
          </Animated.View>
          
          <Animated.Text style={[styles.mainTitle, { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }]}>
            Tu es prêt.
          </Animated.Text>
          <Animated.Text style={[styles.mainSubtitle, { opacity: subtitleOpacity }]}>
            Voici ton plan Alpha personnalisé.
          </Animated.Text>
        </View>

        {/* PROFILE RECAP CARD */}
        <Animated.View style={[
          styles.recapCard,
          { opacity: profileCardOpacity, transform: [{ translateY: profileCardTranslateY }] }
        ]}>
          <View style={styles.recapCardHeader}>
            <Ionicons name="checkmark-done-circle" size={24} color="#00D9A5" />
            <Text style={styles.recapCardTitle}>TON PROFIL ALPHA</Text>
          </View>
          
          <View style={styles.separator} />

          {/* ITEM 1 */}
          <View style={styles.recapItem}>
            <View>
              <Text style={styles.recapItemLabel}>Tu luttes depuis</Text>
              <Text style={styles.recapItemValue}>{userProfile.struggleDuration}</Text>
            </View>
            <Ionicons name="calendar-outline" size={18} color="#FF9500" />
          </View>

          {/* ITEM 2 */}
          <View style={styles.recapItem}>
            <View style={{ maxWidth: '85%' }}>
              <Text style={styles.recapItemLabel}>Tes moments critiques</Text>
              <Text style={styles.recapItemValue} numberOfLines={1}>{userProfile.primaryTriggers}</Text>
            </View>
            <Ionicons name="flash-outline" size={18} color="#E94560" />
          </View>

          {/* ITEM 3 */}
          <View style={styles.recapItem}>
            <View>
              <Text style={styles.recapItemLabel}>Ton humeur aujourd'hui</Text>
              <Text style={[styles.recapItemValue, { color: '#00D9A5' }]}>{userProfile.currentMood}</Text>
            </View>
            <Ionicons name="happy-outline" size={18} color="#00D9A5" />
          </View>

          {/* ITEM 4 */}
          <View style={[styles.recapItem, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.recapItemLabel}>Ton niveau d'énergie</Text>
              <Text style={[styles.recapItemValue, { color: '#FF9500' }]}>{userProfile.energyLevel}</Text>
            </View>
            <Ionicons name="battery-charging-outline" size={18} color="#FF9500" />
          </View>

          {/* PERSISTENT PRIVACY LOCK HINT */}
          <View style={styles.privacyHint}>
            <Ionicons name="lock-closed" size={12} color="#5A5A5A" />
            <Text style={styles.privacyHintText}>Ces données restent privées. Jamais partagées.</Text>
          </View>
        </Animated.View>

        {/* 90 DAY TIMELINE */}
        <Animated.Text style={[styles.timelineSectionTitle, { opacity: planTitleOpacity }]}>
          TON PLAN DE 90 JOURS
        </Animated.Text>

        {/* PHASE 1: DETOX */}
        <Animated.View style={[
          styles.phaseCard,
          { borderLeftColor: '#FF2D55', opacity: phase1Opacity, transform: [{ translateX: phase1TranslateX }] }
        ]}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => togglePhase(1)}>
            <View style={styles.phaseCardHeader}>
              <View style={[styles.badge, { backgroundColor: '#FF2D55' }]}>
                <Text style={styles.badgeText}>SEMAINE 1</Text>
              </View>
              <Ionicons 
                name={expandedPhase === 1 ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#8E8E93" 
              />
            </View>
            <Text style={styles.phaseTitle}>DETOX</Text>
            <Text style={styles.phaseDesc}>
              Ton cerveau crie. C'est normal. On te donne les outils pour survivre.
            </Text>
            
            {expandedPhase === 1 && (
              <View style={styles.expandedGoals}>
                <Text style={styles.goalLine}>✓ 3 séances de respiration / jour</Text>
                <Text style={styles.goalLine}>✓ Pattern Killer actif 24/7</Text>
                <Text style={styles.goalLine}>✓ Journal quotidien d'humeur</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* PHASE 2: REWIRE */}
        <Animated.View style={[
          styles.phaseCard,
          { borderLeftColor: '#FF9500', opacity: phase2Opacity, transform: [{ translateX: phase2TranslateX }] }
        ]}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => togglePhase(2)}>
            <View style={styles.phaseCardHeader}>
              <View style={[styles.badge, { backgroundColor: '#FF9500' }]}>
                <Text style={styles.badgeText}>SEMAINES 2-4</Text>
              </View>
              <Ionicons 
                name={expandedPhase === 2 ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#8E8E93" 
              />
            </View>
            <Text style={styles.phaseTitle}>REWIRE</Text>
            <Text style={styles.phaseDesc}>
              Ton cerveau apprend. On crée de nouvelles voies neuronales.
            </Text>
            
            {expandedPhase === 2 && (
              <View style={styles.expandedGoals}>
                <Text style={styles.goalLine}>✓ Kegel Niveau 1-2 introduit</Text>
                <Text style={styles.goalLine}>✓ Leçons neurosciences & biofeedback</Text>
                <Text style={styles.goalLine}>✓ Respiration de relaxation avancée</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* PHASE 3: REBUILD */}
        <Animated.View style={[
          styles.phaseCard,
          { borderLeftColor: '#00D9A5', opacity: phase3Opacity, transform: [{ translateX: phase3TranslateX }] }
        ]}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => togglePhase(3)}>
            <View style={styles.phaseCardHeader}>
              <View style={[styles.badge, { backgroundColor: '#00D9A5' }]}>
                <Text style={styles.badgeText}>MOIS 2-3</Text>
              </View>
              <Ionicons 
                name={expandedPhase === 3 ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#8E8E93" 
              />
            </View>
            <Text style={styles.phaseTitle}>REBUILD</Text>
            <Text style={styles.phaseDesc}>
              Tu construis l'homme que tu veux être. Confiance, vitalité, liberté.
            </Text>
            
            {expandedPhase === 3 && (
              <View style={styles.expandedGoals}>
                <Text style={styles.goalLine}>✓ Kegel Niveau 3-5 (Contrôle total)</Text>
                <Text style={styles.goalLine}>✓ Cold Protocol + Guide de Nutrition</Text>
                <Text style={styles.goalLine}>✓ Module de Confiance Sexuelle active</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* WELCOME BONUS GIFT CARD */}
        <Animated.View style={[
          styles.bonusCard,
          { opacity: bonusOpacity, transform: [{ scale: bonusScale }] }
        ]}>
          <Ionicons name="gift" size={38} color="#FFD700" style={styles.bonusIcon} />
          
          <View style={styles.bonusTextCol}>
            <Text style={styles.bonusCardTitle}>BONUS DE DÉPART</Text>
            <Text style={styles.bonusCardDesc}>
              +500 VITALITY POINTS pour avoir complété l'onboarding !
            </Text>
            <Text style={styles.bonusCardSub}>
              Utilise-les pour débloquer du contenu premium.
            </Text>
          </View>
          
          <Animated.View style={[styles.pointsBadge, { transform: [{ scale: badgeScale }] }]}>
            <Text style={styles.pointsBadgeText}>+500</Text>
          </Animated.View>
        </Animated.View>

        {/* Spacer to push contents above absolute footer */}
        <View style={{ height: 160 }} />

      </ScrollView>

      {/* FINAL ACTION BUTTON SECTION */}
      <Animated.View style={[
        styles.footer,
        { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] }
      ]}>
        <TouchableOpacity 
          style={styles.ctaBtn} 
          activeOpacity={0.85} 
          onPress={handleFinish}
        >
          <Text style={styles.ctaBtnText}>DEVENIR ALPHA</Text>
          <MaterialCommunityIcons name="fire" size={24} color="#FFD700" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        
        <Text style={styles.ctaSubText}>
          Gratuit. Aucun engagement. Tu peux annuler à tout moment.
        </Text>
        
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => navigation.navigate('SubscriptionPlansScreen')}
        >
          <Text style={styles.plansLink}>Voir les plans d'abonnement →</Text>
        </TouchableOpacity>
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A'
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#1A1A2E',
    zIndex: 40
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00D9A5'
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 30
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerStepText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#00D9A5'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  congratsWrapper: {
    alignItems: 'center',
    marginBottom: 28
  },
  trophyContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,215,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    marginBottom: 16
  },
  mainTitle: {
    fontSize: 34,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  mainSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8
  },
  recapCard: {
    backgroundColor: '#16213E',
    borderRadius: 20,
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 32
  },
  recapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recapCardTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color: '#FFD700',
    letterSpacing: 2,
    marginLeft: 8
  },
  separator: {
    height: 1,
    backgroundColor: '#1A1A2E',
    marginVertical: 14
  },
  recapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E'
  },
  recapItemLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93'
  },
  recapItemValue: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginTop: 2
  },
  privacyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14
  },
  privacyHintText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A',
    marginLeft: 6
  },
  timelineSectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#FFD700',
    letterSpacing: 1,
    marginBottom: 16
  },
  phaseCard: {
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  phaseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF'
  },
  phaseTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    marginTop: 8
  },
  phaseDesc: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 6,
    lineHeight: 18
  },
  expandedGoals: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E'
  },
  goalLine: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    lineHeight: 22
  },
  bonusCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  bonusIcon: {
    marginRight: 12
  },
  bonusTextCol: {
    flex: 1
  },
  bonusCardTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color: '#FFD700'
  },
  bonusCardDesc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 16
  },
  bonusCardSub: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2
  },
  pointsBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  pointsBadgeText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#0F0F1A'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 50
  },
  ctaBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#E94560',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8
  },
  ctaBtnText: {
    fontSize: 16,
    fontFamily: 'Montserrat-ExtraBold',
    color: '#FFFFFF',
    letterSpacing: 2
  },
  ctaSubText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A',
    marginTop: 12,
    textAlign: 'center'
  },
  plansLink: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E94560',
    marginTop: 8,
    textAlign: 'center'
  }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* CELEBRATION FALLING CONFETTIS (WEB REPLICA) */}
      {celebrationActive && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden h-[800px]">
          {Array.from({ length: 40 }).map((_, i) => {
            const randomLeft = Math.random() * 100;
            const randomDelay = Math.random() * 3;
            const randomDuration = 2 + Math.random() * 2;
            const randomColors = ['#FFD700', '#00D9A5', '#E94560'];
            const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
            const randomSize = 6 + Math.random() * 8;
            return (
              <div 
                key={i}
                className="absolute top-[-20px] rounded-sm animate-[fall_3s_linear_infinite]"
                style={{
                  left: `${randomLeft}%`,
                  animationDelay: `${randomDelay}s`,
                  animationDuration: `${randomDuration}s`,
                  backgroundColor: randomColor,
                  width: `${randomSize}px`,
                  height: `${randomSize}px`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            );
          })}
        </div>
      )}

      {/* HEADER SECTION SPECS AND ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-widest bg-[#00D9A5]/10 border border-[#00D9A5]/20 px-2 rounded-md">
            Onboarding Step 5/5 — Final Phase
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Conversion & Plan Personnalisé — OnboardingStep5Screen
          </h2>
          <p className="text-xs text-gray-400">
            Délivrez le plan de 90 jours calibré, affichez le récap de profil, injectez le bonus et convertissez l'utilisateur.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour Dashboard
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

      {/* EXPO SOURCE CODE DRAWER */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - OnboardingStep5Screen.tsx</h4>
              <p className="text-[10px] text-gray-500">
                Gère la barre de progression verte à 100%, l'explosion de confettis Lottie, le trophée scale spring, le recap de profil issu de l'AsyncStorage et le bouton de conversion tactile avec vibrations lourdes.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyNativeCode}
              className="flex items-center gap-2 text-[10px] font-headline"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le Code Natif'}
            </AlphaButton>
          </div>
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[400px] custom-scrollbar">
            {expoNativeCode}
          </pre>
        </div>
      )}

      {/* PLAYGROUND SIMULATOR HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SIMULATOR PHONE SHELL */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          <div className="w-full max-w-[385px] bg-[#000] rounded-[48px] p-3 pt-5 pb-5 border-[6px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Top speaker microphone slot */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-10 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2 h-2 bg-[#101020] rounded-full" />
            </div>

            {/* MAIN VIEWPORT WINDOW */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[690px]">
              
              {/* TOP 100% SUCCESS PROGRESS BAR */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A2E] z-30">
                <div 
                  className="h-full bg-[#00D9A5] transition-all duration-1000 ease-out"
                  style={{ width: '100%' }}
                />
              </div>

              {/* TIMING AND NETWORK STAT BAR */}
              <div className="h-9 px-6 pt-2.5 flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 select-none z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-2.5 bg-[#00D9A5] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* BACK BAR ACTIONS */}
              <div className="px-3 py-1 flex justify-between items-center select-none z-10">
                <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-gray-900/30 flex items-center justify-center border border-gray-800/10 hover:bg-gray-800 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#8E8E93]" />
                </button>
                <span className="text-xs font-headline font-semibold text-[#00D9A5]">
                  5 sur 5
                </span>
                <div className="w-10" />
              </div>

              {/* EMULATOR BODY FORM */}
              <div className="flex-1 flex flex-col justify-between px-5 py-4 overflow-y-auto max-h-[510px] custom-scrollbar text-left">
                
                {/* HEADLINES CONGRATS */}
                <div className="flex flex-col items-center text-center my-2">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.15)] animate-[bounce_2s_infinite]">
                    <Trophy className="w-8 h-8 text-[#FFD700]" />
                  </div>
                  
                  <h2 className="font-headline font-black text-2xl text-white mt-4 leading-none">
                    Tu es prêt.
                  </h2>
                  <p className="text-xs text-[#8E8E93] font-headline mt-1.5 leading-relaxed">
                    Voici ton plan Alpha personnalisé.
                  </p>
                </div>

                {/* PROFILE RECAP CARD */}
                <div className="bg-[#16213E] rounded-2xl p-4 border-t-2 border-[#FFD700] my-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00D9A5]" />
                    <span className="text-[10px] font-headline font-black text-[#FFD700] tracking-wider">
                      TON PROFIL ALPHA
                    </span>
                  </div>
                  <div className="h-[1px] bg-gray-800/40 my-2" />

                  {/* STAT 1 */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/30">
                    <div>
                      <p className="text-[9px] text-gray-500 font-headline uppercase font-bold">Tu luttes depuis</p>
                      <p className="text-[11px] font-headline font-black text-white">1 à 3 ans</p>
                    </div>
                    <Calendar className="w-4 h-4 text-[#FF9500]" />
                  </div>

                  {/* STAT 2 */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/30">
                    <div className="max-w-[80%]">
                      <p className="text-[9px] text-gray-500 font-headline uppercase font-bold">Moments critiques</p>
                      <p className="text-[11px] font-headline font-black text-white truncate">Le soir, Le stress</p>
                    </div>
                    <Zap className="w-4 h-4 text-[#E94560]" />
                  </div>

                  {/* STAT 3 */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/30">
                    <div>
                      <p className="text-[9px] text-gray-500 font-headline uppercase font-bold">Humeur aujourd'hui</p>
                      <p className="text-[11px] font-headline font-black text-[#00D9A5]">Motivé (7/10)</p>
                    </div>
                    <Smile className="w-4 h-4 text-[#00D9A5]" />
                  </div>

                  {/* STAT 4 */}
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-[9px] text-gray-500 font-headline uppercase font-bold">Énergie active</p>
                      <p className="text-[11px] font-headline font-black text-[#FF9500]">Bien (6/10)</p>
                    </div>
                    <BatteryCharging className="w-4 h-4 text-[#FF9500]" />
                  </div>

                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Lock className="w-3 h-3 text-gray-600" />
                    <span className="text-[9px] font-headline font-bold text-gray-600 uppercase tracking-wide">
                      Chiffrement de bout en bout actif
                    </span>
                  </div>
                </div>

                {/* 90 DAY TIMELINE ACCORDIONS */}
                <div className="mb-4">
                  <h4 className="text-[10px] font-headline font-black text-[#FFD700] tracking-widest uppercase mb-3">
                    TON PLAN DE 90 JOURS
                  </h4>

                  {/* PHASE 1 */}
                  <div 
                    onClick={() => setActivePlanCard(activePlanCard === 1 ? null : 1)}
                    className="bg-[#16213E] rounded-xl p-3 border-l-4 border-[#FF2D55] mb-2 cursor-pointer hover:bg-[#1c294d] transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-extrabold bg-[#FF2D55] text-white px-1.5 py-0.5 rounded">
                        SEMAINE 1
                      </span>
                      {activePlanCard === 1 ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <h5 className="font-headline font-black text-sm text-white mt-1">DETOX</h5>
                    <p className="text-[10px] text-gray-400 font-headline mt-0.5 leading-tight">
                      Ton cerveau crie. C'est normal. On te donne les outils pour survivre.
                    </p>
                    {activePlanCard === 1 && (
                      <div className="mt-2 pt-2 border-t border-gray-800/40 text-[9px] font-headline text-gray-400 flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> 3 séances de respiration / jour</span>
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Pattern Killer actif 24/7</span>
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Journal d'humeur automatique</span>
                      </div>
                    )}
                  </div>

                  {/* PHASE 2 */}
                  <div 
                    onClick={() => setActivePlanCard(activePlanCard === 2 ? null : 2)}
                    className="bg-[#16213E] rounded-xl p-3 border-l-4 border-[#FF9500] mb-2 cursor-pointer hover:bg-[#1c294d] transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-extrabold bg-[#FF9500] text-white px-1.5 py-0.5 rounded">
                        SEMAINES 2-4
                      </span>
                      {activePlanCard === 2 ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <h5 className="font-headline font-black text-sm text-white mt-1">REWIRE</h5>
                    <p className="text-[10px] text-gray-400 font-headline mt-0.5 leading-tight">
                      Ton cerveau apprend. On crée de nouvelles voies neuronales.
                    </p>
                    {activePlanCard === 2 && (
                      <div className="mt-2 pt-2 border-t border-gray-800/40 text-[9px] font-headline text-gray-400 flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Kegel Niveau 1-2 introduit</span>
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Leçons de neuroscience quotidiennes</span>
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Respiration avancée</span>
                      </div>
                    )}
                  </div>

                  {/* PHASE 3 */}
                  <div 
                    onClick={() => setActivePlanCard(activePlanCard === 3 ? null : 3)}
                    className="bg-[#16213E] rounded-xl p-3 border-l-4 border-[#00D9A5] cursor-pointer hover:bg-[#1c294d] transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-extrabold bg-[#00D9A5] text-white px-1.5 py-0.5 rounded">
                        MOIS 2-3
                      </span>
                      {activePlanCard === 3 ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <h5 className="font-headline font-black text-sm text-white mt-1">REBUILD</h5>
                    <p className="text-[10px] text-gray-400 font-headline mt-0.5 leading-tight">
                      Tu construis l'homme que tu veux être. Confiance, vitalité, liberté.
                    </p>
                    {activePlanCard === 3 && (
                      <div className="mt-2 pt-2 border-t border-gray-800/40 text-[9px] font-headline text-gray-400 flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Kegel Niveau 3-5 (Contrôle optimal)</span>
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Cold Protocol et diète de combat</span>
                        <span className="flex items-center gap-1 text-[#00D9A5]"><CheckCircle2 className="w-3 h-3" /> Confiance sexuelle active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SIGNUP BONUS CARD */}
                <div className="bg-[#1A1A2E] rounded-xl p-3 border border-yellow-500/20 flex gap-2.5 items-center mb-4">
                  <Gift className="w-10 h-10 text-[#FFD700] flex-shrink-0 animate-pulse" />
                  <div className="flex-1 text-left">
                    <h5 className="text-[10px] font-headline font-black text-[#FFD700] uppercase">BONUS DE DÉPART</h5>
                    <p className="text-[10px] font-headline font-bold text-white mt-0.5 leading-tight">
                      +500 VITALITY POINTS débloqués !
                    </p>
                    <p className="text-[8px] text-gray-400 font-headline leading-none mt-0.5">
                      Pour utiliser sur le contenu premium.
                    </p>
                  </div>
                  <div className="bg-[#FFD700] rounded-full px-2 py-1 text-[10px] font-headline font-black text-[#0F0F1A]">
                    +500
                  </div>
                </div>

                {/* SUBMIT HERO CTA BOX */}
                <div className="w-full flex flex-col items-center gap-2">
                  <button
                    onClick={handleFinishOnboarding}
                    className="w-full h-12 bg-[#E94560] shadow-lg shadow-[#E94560]/30 hover:bg-[#ff5573] active:scale-95 transition-all rounded-xl font-headline font-black text-sm uppercase text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    DEVENIR ALPHA
                    <Flame className="w-5 h-5 text-[#FFD700] animate-pulse" />
                  </button>

                  <span className="text-[8px] text-gray-600 font-headline uppercase font-bold text-center tracking-wider leading-none">
                    Gratuit. Aucun engagement. Tu peux annuler à tout moment.
                  </span>
                  
                  <button className="text-[9px] text-[#E94560] font-headline font-bold hover:underline">
                    Voir les plans d'abonnement →
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: CALIBRATION INFORMATION AND PSYCHOLOGY */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Finalisation de l'Onboarding (Step 5)
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Cette dernière étape synthétise toutes les données récoltées (âge, durée d'addiction, triggers d'urgence, humeur, niveau d'énergie) pour prouver à l'utilisateur que l'algorithme a compris son profil unique. Le bouton principal <span className="text-[#E94560] font-black">DEVENIR ALPHA</span> applique les réglages et le redirige vers son tableau de bord d'entraînement.
            </p>

            <div className="bg-[#0A0A15] p-4 rounded-xl border border-gray-900 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">
                Effets psychologiques recherchés :
              </span>
              
              <div className="flex flex-col gap-1.5 text-xs text-gray-300">
                <p>
                  • <strong className="text-white">Validation active :</strong> Le récapitulatif de profil prouve que l'application a analysé avec rigueur les données saisies par l'utilisateur.
                </p>
                <p>
                  • <strong className="text-white">Gains immédiats (Gamification) :</strong> L'ajout immédiat de +500 points de Vitalité récompense l'effort initial et incite à l'action.
                </p>
                <p>
                  • <strong className="text-white">Transparence totale :</strong> La note de confidentialité rassure l'utilisateur sur le cryptage et la non-divulgation des données sensibles.
                </p>
              </div>
            </div>
          </AlphaCard>

          {/* SIMULATION CONTROLLERS */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Trophy className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Outils de démonstration
              </h3>
            </div>

            <p className="text-xs text-gray-400">
              Déclenchez à nouveau la pluie de confettis ou testez la transition finale de l'onboarding pour confirmer l'expérience utilisateur globale.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCelebrationActive(false);
                  setTimeout(() => setCelebrationActive(true), 100);
                  addToast('success', 'Explosion de confettis réactivée ! 🎉');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 cursor-pointer"
              >
                Lancer Confettis
              </button>

              <button
                onClick={handleFinishOnboarding}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-[#00D9A5]/20 border border-[#00D9A5]/40 text-[#00D9A5] cursor-pointer"
              >
                Valider l'Onboarding
              </button>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
