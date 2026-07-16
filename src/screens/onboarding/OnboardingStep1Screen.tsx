import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Shield,
  Brain,
  Award,
  Users,
  Flame,
  Star,
  CheckCircle,
  HelpCircle,
  Smartphone,
  RefreshCw,
  Code,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';
import { AlphaBadge } from '../../components/AlphaBadge';

interface OnboardingStep1ScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNext?: () => void;
}

export const OnboardingStep1Screen: React.FC<OnboardingStep1ScreenProps> = ({
  addToast,
  onBack,
  onNext
}) => {
  // Screen States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [animationTick, setAnimationTick] = useState<number>(0);

  // Custom Simulator Parameters
  const [simulatedStep, setSimulatedStep] = useState<number>(1);
  const [hasSkipped, setHasSkipped] = useState<boolean>(false);

  // Brain pulsing animation simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationTick(prev => (prev + 1) % 100);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Haptics simulation
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([30]);
    }
  };

  const handleNext = () => {
    triggerHaptic();
    addToast('success', "Transition : Onboarding Étape 2/5 chargée ! 🧠");
    if (onNext) {
      onNext();
    }
  };

  const handleSkip = () => {
    triggerHaptic();
    const confirmSkip = window.confirm("🚨 Passer l'onboarding ?\nTu manqueras des fonctionnalités hautement personnalisées basées sur tes réponses.");
    if (confirmSkip) {
      setHasSkipped(true);
      addToast('warning', "Onboarding ignoré. Redirection vers le Dashboard.");
    }
  };

  const copyNativeCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source Expo React Native copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // High Fidelity expo typescript template code matching the specifications perfectly
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function OnboardingStep1Screen() {
  const navigation = useNavigation();

  // Animated Values
  const progressWidth = useRef(new Animated.Value(0)).current;
  const brainScale = useRef(new Animated.Value(0.8)).current;
  const brainOpacity = useRef(new Animated.Value(0)).current;
  
  const title1Opacity = useRef(new Animated.Value(0)).current;
  const title1TranslateY = useRef(new Animated.Value(30)).current;
  const title2Opacity = useRef(new Animated.Value(0)).current;
  const title2TranslateY = useRef(new Animated.Value(30)).current;
  const title3Opacity = useRef(new Animated.Value(0)).current;
  const title3TranslateY = useRef(new Animated.Value(30)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const statsScale = useRef(new Animated.Value(0.95)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(20)).current;
  const footOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start sequence of entrance animations
    Animated.parallel([
      // Indicator progression bar: width 0 -> 20% (duration 400ms)
      Animated.timing(progressWidth, {
        toValue: screenWidth * 0.20,
        duration: 400,
        useNativeDriver: false
      }),

      // Brain illustration scale 0.8 -> 1.0, opacity 0 -> 1 (duration 600ms, delay 200ms)
      Animated.parallel([
        Animated.timing(brainScale, {
          toValue: 1.0,
          duration: 600,
          delay: 200,
          useNativeDriver: true
        }),
        Animated.timing(brainOpacity, {
          toValue: 1,
          duration: 600,
          delay: 200,
          useNativeDriver: true
        })
      ]),

      // Title line 1: delay 300ms, duration 500ms
      Animated.parallel([
        Animated.timing(title1Opacity, {
          toValue: 1,
          duration: 500,
          delay: 300,
          useNativeDriver: true
        }),
        Animated.timing(title1TranslateY, {
          toValue: 0,
          duration: 500,
          delay: 300,
          useNativeDriver: true
        })
      ]),

      // Title line 2: delay 450ms, duration 500ms
      Animated.parallel([
        Animated.timing(title2Opacity, {
          toValue: 1,
          duration: 500,
          delay: 450,
          useNativeDriver: true
        }),
        Animated.timing(title2TranslateY, {
          toValue: 0,
          duration: 500,
          delay: 450,
          useNativeDriver: true
        })
      ]),

      // Title line 3: delay 600ms, duration 500ms
      Animated.parallel([
        Animated.timing(title3Opacity, {
          toValue: 1,
          duration: 500,
          delay: 600,
          useNativeDriver: true
        }),
        Animated.timing(title3TranslateY, {
          toValue: 0,
          duration: 500,
          delay: 600,
          useNativeDriver: true
        })
      ]),

      // Subtitle: opacity, delay 800ms, duration 400ms
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        delay: 800,
        useNativeDriver: true
      }),

      // Social stats card: opacity + scale, delay 1000ms, duration 400ms
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 400,
          delay: 1000,
          useNativeDriver: true
        }),
        Animated.timing(statsScale, {
          toValue: 1.0,
          duration: 400,
          delay: 1000,
          useNativeDriver: true
        })
      ]),

      // CTA Button: opacity + translateY, delay 1200ms, duration 400ms
      Animated.parallel([
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 400,
          delay: 1200,
          useNativeDriver: true
        }),
        Animated.timing(ctaTranslateY, {
          toValue: 0,
          duration: 400,
          delay: 1200,
          useNativeDriver: true
        })
      ]),

      // Footnote text: opacity, delay 1400ms, duration 300ms
      Animated.timing(footOpacity, {
        toValue: 1,
        duration: 300,
        delay: 1400,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Passer l'onboarding ?",
      "Tu manqueras des fonctionnalités hautement personnalisées basées sur tes réponses scientifiques.",
      [
        { text: "Continuer l'onboarding", style: "cancel" },
        { 
          text: "Passer quand même", 
          style: "destructive", 
          onPress: () => navigation.replace('DashboardScreen') 
        }
      ]
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('OnboardingStep2Screen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* PROGRESSION INDICATOR */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* MINIMAL HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipBtnText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* BODY WRAPPER */}
      <View style={styles.content}>
        
        {/* SECTION 1: ANIMATED ILLUSTRATION (Brain rewire) */}
        <Animated.View style={[
          styles.illustrationCard, 
          { 
            opacity: brainOpacity,
            transform: [{ scale: brainScale }]
          }
        ]}>
          {/* Animated Brain wire connections */}
          <MaterialCommunityIcons name="brain" size={140} color="#E94560" style={styles.brainIcon} />
          {/* Connection particles indicator lines */}
          <View style={styles.sparkle1} />
          <View style={styles.sparkle2} />
        </Animated.View>

        {/* SECTION 2: PRINCIPAL STAGGERED TITLES */}
        <View style={styles.titleSection}>
          <Animated.Text style={[styles.titleLine, { opacity: title1Opacity, transform: [{ translateY: title1TranslateY }] }]}>
            SALUT.
          </Animated.Text>
          <Animated.Text style={[styles.titleLineAccent, { opacity: title2Opacity, transform: [{ translateY: title2TranslateY }] }]}>
            Ici, on ne juge pas.
          </Animated.Text>
          <Animated.Text style={[styles.titleLine, { opacity: title3Opacity, transform: [{ translateY: title3TranslateY }] }]}>
            On transforme.
          </Animated.Text>
        </View>

        {/* SECTION 3: SUBTITLE DESCRIPTION */}
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.subtitleText}>
            ALPHA MAN est une app de transformation masculine basée sur la science. Pas de jugement. Pas de honte. Juste des résultats.
          </Text>
        </Animated.View>

        {/* SECTION 4: SOCIAL PROOF STATS */}
        <Animated.View style={[
          styles.statsCard,
          { 
            opacity: statsOpacity,
            transform: [{ scale: statsScale }]
          }
        ]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>50K+</Text>
            <Text style={styles.statLabel}>Hommes Alpha</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#00D9A5' }]}>94%</Text>
            <Text style={styles.statLabel}>Taux de réussite</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9★</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </Animated.View>

      </View>

      {/* SECTION 5: CTA ACTION BOTTOM BLOCK */}
      <View style={styles.footer}>
        <Animated.View style={{ opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] }}>
          <TouchableOpacity style={styles.primaryCta} onPress={handleNext}>
            <Text style={styles.primaryCtaText}>COMMENCER MA TRANSFORMATION</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text style={[styles.footnoteText, { opacity: footOpacity }]}>
          Gratuit. Sans engagement.
        </Animated.Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F0F1A', 
    justifyContent: 'space-between' 
  },
  progressContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    height: 4, 
    backgroundColor: '#1A1A2E' 
  },
  progressBar: { 
    height: '100%', 
    backgroundColor: '#E94560' 
  },
  header: { 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    paddingHorizontal: 16 
  },
  skipBtn: { 
    width: 60, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  skipBtnText: { 
    fontSize: 14, 
    fontFamily: 'Inter-Regular', 
    color: '#8E8E93' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    alignItems: 'center' 
  },
  illustrationCard: { 
    width: 280, 
    height: 240, 
    backgroundColor: '#16213E', 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    position: 'relative'
  },
  brainIcon: { 
    alignSelf: 'center' 
  },
  sparkle1: { 
    position: 'absolute', 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#FFD700', 
    top: '25%', 
    left: '30%' 
  },
  sparkle2: { 
    position: 'absolute', 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#00D9A5', 
    bottom: '30%', 
    right: '25%' 
  },
  titleSection: { 
    marginTop: 24, 
    alignItems: 'center' 
  },
  titleLine: { 
    fontSize: 34, 
    fontFamily: 'Montserrat-Bold', 
    color: '#FFFFFF', 
    textAlign: 'center',
    lineHeight: 40
  },
  titleLineAccent: { 
    fontSize: 34, 
    fontFamily: 'Montserrat-Bold', 
    color: '#E94560', 
    textAlign: 'center',
    lineHeight: 40
  },
  subtitleText: { 
    fontSize: 14, 
    fontFamily: 'Inter-Regular', 
    color: '#8E8E93', 
    textAlign: 'center', 
    lineHeight: 22, 
    maxWidth: 320, 
    marginTop: 16 
  },
  statsCard: { 
    flexDirection: 'row', 
    backgroundColor: '#16213E', 
    borderRadius: 16, 
    padding: 16, 
    marginTop: 24, 
    justifyContent: 'space-around', 
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  statItem: { 
    alignItems: 'center' 
  },
  statValue: { 
    fontSize: 22, 
    fontFamily: 'RobotoMono-Bold', 
    color: '#FFD700' 
  },
  statLabel: { 
    fontSize: 10, 
    fontFamily: 'Inter-Regular', 
    color: '#8E8E93', 
    marginTop: 4 
  },
  verticalDivider: { 
    width: 1, 
    height: 36, 
    backgroundColor: '#1A1A2E' 
  },
  footer: { 
    paddingHorizontal: 24, 
    paddingBottom: 32, 
    width: '100%' 
  },
  primaryCta: { 
    width: '100%', 
    height: 56, 
    backgroundColor: '#E94560', 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16
  },
  primaryCtaText: { 
    fontSize: 14, 
    fontFamily: 'Montserrat-Bold', 
    color: '#FFFFFF', 
    letterSpacing: 1 
  },
  footnoteText: { 
    fontSize: 12, 
    fontFamily: 'Inter-Regular', 
    color: '#5A5A5A', 
    textAlign: 'center', 
    marginTop: 12 
  }
});`;

  // Simulate active SVG brain path rewire waves
  const brainWaveOffset1 = Math.sin(animationTick / 10) * 12;
  const brainWaveOffset2 = Math.cos(animationTick / 8) * 8;
  const connectionPulse = 0.6 + Math.sin(animationTick / 6) * 0.4;

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      
      {/* HEADER CONTROLS AND PRESET HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
            Onboarding Step 1/5
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Séquence d'Accroche Scientifique — OnboardingStep1Screen
          </h2>
          <p className="text-xs text-gray-400">
            Simulez la première étape interactive de l'onboarding ALPHA MAN.
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

      {/* EXPO SOURCE INSPECTION */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - OnboardingStep1Screen.tsx</h4>
              <p className="text-[10px] text-gray-500">
                Implémente l'indicateur de progression 20%, l'alerte de confirmation en cas de saut d'onboarding, et la séquence d'animations parallèles.
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

      {/* DUAL DIVISION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE PHONE DEVICE PREVIEW */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* PHONE MOCKUP SHELL */}
          <div className="w-full max-w-[385px] bg-[#000] rounded-[48px] p-3 pt-5 pb-5 border-[6px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Top notches bar */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-10 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2 h-2 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN VIEWPORT */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[660px]">
              
              {/* TOP ABSOLUTE 20% PROGRESS BAR */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A2E] z-30">
                <div 
                  className="h-full bg-[#E94560] transition-all duration-500 ease-out"
                  style={{ width: '20%' }}
                />
              </div>

              {/* STATUS BAR SPACE */}
              <div className="h-9 px-6 pt-2.5 flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 select-none z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-2.5 bg-[#E94560] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER MINIMAL ACTION */}
              <div className="px-5 py-2 flex justify-between items-center select-none z-10">
                <span className="text-[9px] font-mono text-[#E94560] tracking-widest font-extrabold uppercase">
                  ÉTAPE 1 SUR 5
                </span>
                
                <button
                  onClick={handleSkip}
                  className="text-xs font-headline font-semibold text-[#8E8E93] hover:text-white px-2 py-1.5 rounded-lg active:scale-95 transition-transform cursor-pointer"
                >
                  Passer
                </button>
              </div>

              {/* SIMULATED ROUTING SKIP SCREEN OVERLAY */}
              {hasSkipped && (
                <div className="absolute inset-0 bg-[#0F0F1A]/95 flex flex-col items-center justify-center p-6 z-40 animate-[fade-in_0.3s_ease-out]">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 mb-4">
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-headline font-black text-white uppercase tracking-wider text-center">
                    ONBOARDING IGNORÉ
                  </h4>
                  <p className="text-xs text-gray-400 text-center mt-2 max-w-[240px]">
                    L'utilisateur a choisi de contourner les étapes d'évaluation scientifique.
                  </p>
                  <div className="mt-4 px-3 py-1.5 bg-[#16213E] border border-gray-800 rounded-xl">
                    <span className="font-mono text-xs text-[#00D9A5] font-bold">
                      replace('DashboardScreen')
                    </span>
                  </div>
                  <button 
                    onClick={() => setHasSkipped(false)}
                    className="mt-6 flex items-center gap-1.5 text-xs text-[#E94560] hover:underline font-bold cursor-pointer"
                  >
                    Réinitialiser l'Onboarding
                  </button>
                </div>
              )}

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 flex flex-col items-center px-5 pt-3 pb-8 justify-between select-none">
                
                {/* SECTION 1: ANIMATED BRAIN REWIRE ILLUSTRATION */}
                <div 
                  className="w-full max-w-[260px] aspect-video bg-[#16213E] rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-800/20 shadow-lg shadow-black/20"
                >
                  {/* Glowing background circles simulating neural pulse */}
                  <div 
                    className="absolute w-24 h-24 rounded-full bg-[#E94560]/5 border border-[#E94560]/10 transition-all duration-300"
                    style={{ transform: `scale(${1 + brainWaveOffset1 / 40})` }}
                  />

                  <div className="relative z-10 flex flex-col items-center">
                    <Brain className="w-16 h-16 text-[#E94560] animate-pulse" />
                    
                    {/* SVG active connectors overlay */}
                    <svg className="absolute inset-0 w-24 h-24 -left-4 -top-4 pointer-events-none">
                      <path 
                        d="M10,10 Q50,40 90,10" 
                        fill="none" 
                        stroke="#FFD700" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4"
                        style={{ opacity: connectionPulse }}
                      />
                      <path 
                        d="M10,80 Q50,40 90,80" 
                        fill="none" 
                        stroke="#00D9A5" 
                        strokeWidth="1.5" 
                        strokeDasharray="5 3"
                        style={{ opacity: connectionPulse }}
                      />
                    </svg>

                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1.5 animate-pulse">
                      Neuro-plasticité active
                    </span>
                  </div>

                  {/* Moveable sparkles */}
                  <div 
                    className="absolute w-2 h-2 rounded-full bg-[#FFD700] transition-transform duration-100 shadow-md"
                    style={{ transform: `translate(${brainWaveOffset1}px, ${brainWaveOffset2}px)` }}
                  />
                  <div 
                    className="absolute w-1.5 h-1.5 rounded-full bg-[#00D9A5] transition-transform duration-100 shadow-md"
                    style={{ transform: `translate(${brainWaveOffset2}px, ${-brainWaveOffset1}px)` }}
                  />
                </div>

                {/* SECTION 2: PRINCIPAL STAGGERED HEADINGS */}
                <div className="text-center flex flex-col gap-1 mt-3">
                  <h1 className="font-headline font-black text-xl tracking-tight text-white leading-none">
                    SALUT.
                  </h1>
                  <h1 className="font-headline font-black text-xl tracking-tight text-[#E94560] leading-none">
                    Ici, on ne juge pas.
                  </h1>
                  <h1 className="font-headline font-black text-xl tracking-tight text-white leading-none">
                    On transforme.
                  </h1>
                </div>

                {/* SECTION 3: SUBTITLE SCIENTIFIC EXPLANATION */}
                <p className="text-xs text-[#8E8E93] font-headline text-center leading-relaxed max-w-[260px] my-2">
                  ALPHA MAN est une app de transformation masculine basée sur la science. Pas de jugement. Pas de honte. Juste des résultats.
                </p>

                {/* SECTION 4: SOCIAL PROOF DATA CARD */}
                <div className="w-full bg-[#16213E] border border-gray-800/30 rounded-xl p-3 grid grid-cols-3 gap-1 shadow-md">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-mono font-black text-[#FFD700]">50K+</span>
                    <span className="text-[8px] text-[#8E8E93] uppercase font-headline font-bold mt-0.5">Hommes Alpha</span>
                  </div>
                  <div className="flex flex-col items-center text-center border-x border-[#1A1A2E]">
                    <span className="text-xs font-mono font-black text-[#00D9A5]">94%</span>
                    <span className="text-[8px] text-[#8E8E93] uppercase font-headline font-bold mt-0.5">Réussite</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-mono font-black text-[#FFD700]">4.9★</span>
                    <span className="text-[8px] text-[#8E8E93] uppercase font-headline font-bold mt-0.5">Note moy.</span>
                  </div>
                </div>

                {/* SECTION 5: CTA ACTION CONTAINER */}
                <div className="w-full flex flex-col items-center gap-1.5 mt-4">
                  <button
                    onClick={handleNext}
                    className="w-full h-11 bg-[#E94560] rounded-xl font-headline font-extrabold text-xs uppercase text-white flex items-center justify-center gap-2 shadow-lg shadow-[#E94560]/20 active:scale-97 transition-transform cursor-pointer"
                  >
                    COMMENCER LA TRANSFORMATION
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[9px] font-headline text-gray-500 font-bold uppercase tracking-wider">
                    Gratuit. Sans engagement.
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: SIMULATOR DETAILS AND SPECS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-800/20 pb-3">
              <Users className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Preuve Sociale & Sciences Cognitives
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              La première étape d'Onboarding utilise des techniques de <strong className="text-[#FFD700]">reconstruction cognitive positive</strong>. En affichant une illustration neuronale interactive et des données statistiques réelles, l'application désamorce l'anxiété et active la motivation.
            </p>

            <div className="p-4 bg-[#16213E]/40 border border-gray-800 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00D9A5]/10 flex items-center justify-center text-[#00D9A5] flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-headline font-black text-white">CONTRAT DE ZÉRO JUGEMENT</h5>
                <p className="text-[11px] text-gray-400 mt-1">
                  En éliminant tout ton moralisateur, ALPHA MAN crée un espace psychologique sécurisé d'accompagnement.
                </p>
              </div>
            </div>

            {/* PRESETS ENGINE */}
            <div className="flex flex-col gap-2.5 mt-2">
              <label className="text-xs font-headline font-bold text-gray-400 uppercase tracking-wide">
                Contrôle de l'animation de connexion cérébrale
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    addToast('info', isPlaying ? 'Pulsation mise en pause' : 'Pulsation neuronale reprise');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-headline font-bold uppercase transition-all cursor-pointer
                    ${isPlaying ? 'bg-[#00D9A5] text-black' : 'bg-[#16213E] text-gray-400'}
                  `}
                >
                  {isPlaying ? '⏸️ Suspendre Pulsation' : '▶️ Relancer Pulsation'}
                </button>
                <button
                  onClick={() => {
                    setAnimationTick(0);
                    addToast('success', 'Animations réinitialisées');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 cursor-pointer"
                >
                  Reset Waves
                </button>
              </div>
            </div>
          </AlphaCard>

          {/* VITALITY POINTS PROGRESS HUB */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-3.5">
            <div className="flex items-center gap-2 border-b border-gray-800/20 pb-3">
              <Award className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Structure Onboarding Totale (5 Étapes)
              </h3>
            </div>
            
            <div className="relative border-l border-gray-800 ml-3.5 pl-5 flex flex-col gap-4">
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-[#E94560] ring-4 ring-[#E94560]/10" />
                <h6 className="text-xs font-headline font-black text-white uppercase tracking-wider">
                  Étape 1 : Accroche Scientifique (Actif)
                </h6>
                <p className="text-[10px] text-gray-400">Présentation du cadre de transformation sans jugement, statistiques sociales et CTA.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-gray-800" />
                <h6 className="text-xs font-headline font-black text-gray-500 uppercase tracking-wider">
                  Étape 2 : Évaluation Initiale (Symptômes & Profil)
                </h6>
                <p className="text-[10px] text-gray-600">Évaluation des troubles, stress et contractions pelviennes involontaires.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-gray-800" />
                <h6 className="text-xs font-headline font-black text-gray-500 uppercase tracking-wider">
                  Étape 3 : Estimation de l'Âge Pelvien (Algorithme)
                </h6>
                <p className="text-[10px] text-gray-600">Calcul du score physiologique pelvien par rapport aux repères démographiques.</p>
              </div>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
