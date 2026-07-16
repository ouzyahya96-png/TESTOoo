import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Code,
  Copy,
  Check,
  Smartphone,
  Info,
  Database,
  Lock,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Flame,
  Moon
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';
import { AlphaBadge } from '../../components/AlphaBadge';

// Interfaces for our component
interface SplashScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ addToast, onBack }) => {
  // Simulator state variables
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'logo' | 'name' | 'tagline' | 'loading' | 'exit' | 'completed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>('Chargement...');
  
  // Simulated AsyncStorage database states
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  
  // Custom simulator settings
  const [isLottieMode, setIsLottieMode] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // 1x, 2x, 0.5x, 0 (reduced motion)
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  // Source view states
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Timer Ref for simulation tick
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Audio or rumble simulation
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([40]);
    }
  };

  // Re-run animation loop
  const startSimulation = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
    
    setIsPlaying(true);
    setElapsedTime(0);
    setProgress(0);
    setLoadingText('Chargement...');
    setAnimationPhase('logo');
    triggerHaptic();
    addToast('info', 'Lancement de la séquence Splash ALPHA MAN... 🚀');

    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;

    const tick = () => {
      const now = Date.now();
      const actualElapsed = now - startTimeRef.current;
      // Scale elapsed time by speed modifier
      const speedModifier = reduceMotion ? 10 : animationSpeed;
      const simulatedElapsed = actualElapsed * speedModifier;

      if (simulatedElapsed >= 3500) {
        setElapsedTime(3500);
        setProgress(100);
        setLoadingText("C'est parti");
        setAnimationPhase('completed');
        setIsPlaying(false);
        
        // Trigger simulated navigation
        const targetScreen = !hasSeenOnboarding ? 'OnboardingStep1Screen' : 'DashboardScreen';
        addToast('success', `Navigation : replace('${targetScreen}') (Simulation)`);
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        return;
      }

      setElapsedTime(simulatedElapsed);

      // Animation Phase state machine mapping
      // ÉTAPE 1 : LOGO (0ms - 800ms) (scale 0->1, ease-out, delay 200ms)
      // ÉTAPE 2 : NOM (delay 600ms, opacity 0->1, translateY 20->0)
      // ÉTAPE 3 : TAGLINE (delay 900ms, opacity 0->1, translateY 10->0)
      // ÉTAPE 4 : LOADING BAR (delay 1200ms, width 0%->100%, duration 2000ms [ends around 3200ms])
      // ÉTAPE 5 : EXIT TRANSITION (delay 2800ms, duration 700ms)

      if (simulatedElapsed < 600) {
        setAnimationPhase('logo');
      } else if (simulatedElapsed >= 600 && simulatedElapsed < 900) {
        setAnimationPhase('name');
      } else if (simulatedElapsed >= 900 && simulatedElapsed < 1200) {
        setAnimationPhase('tagline');
      } else if (simulatedElapsed >= 1200 && simulatedElapsed < 2800) {
        setAnimationPhase('loading');
      } else if (simulatedElapsed >= 2800) {
        setAnimationPhase('exit');
      }

      // Handle Loading progress width & text shifting
      if (simulatedElapsed >= 1200) {
        // Loading duration goes from 1200ms to 3200ms (2000ms duration)
        const loadingTime = Math.min(simulatedElapsed - 1200, 2000);
        const currentProgress = (loadingTime / 2000) * 100;
        setProgress(currentProgress);

        // Text changes at 33% and 66%
        if (currentProgress < 33) {
          setLoadingText('Chargement...');
        } else if (currentProgress >= 33 && currentProgress < 66) {
          setLoadingText('Préparation...');
        } else {
          setLoadingText("C'est parti");
        }
      } else {
        setProgress(0);
        setLoadingText('Chargement...');
      }

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);
  };

  // Pause simulation
  const pauseSimulation = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
    setIsPlaying(false);
    addToast('warning', 'Simulation mise en pause.');
  };

  // Reset simulation
  const resetSimulation = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
    setIsPlaying(false);
    setElapsedTime(0);
    setProgress(0);
    setLoadingText('Chargement...');
    setAnimationPhase('idle');
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  const copyNativeCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source Expo React Native copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate CSS keyframe styles depending on elapsed simulation times
  // Step 1: Logo scale (0 -> 1, duration 600ms, delay 200ms)
  const getLogoScale = () => {
    if (reduceMotion) return 1;
    if (elapsedTime < 200) return 0;
    if (elapsedTime >= 2800) {
      // Step 5: Exit (scale 1 -> 0.8, delay 2800, duration 500ms)
      const exitTime = Math.min(elapsedTime - 2800, 500);
      return 1 - (exitTime / 500) * 0.2;
    }
    const logoTime = Math.min(elapsedTime - 200, 600);
    return logoTime / 600; // linear approximation
  };

  const getLogoOpacity = () => {
    if (reduceMotion) return 1;
    if (elapsedTime < 200) return 0;
    if (elapsedTime >= 2800) {
      // Step 5: Exit (opacity 1 -> 0, delay 2800, duration 500ms)
      const exitTime = Math.min(elapsedTime - 2800, 500);
      return 1 - (exitTime / 500);
    }
    return 1;
  };

  // Step 2: Name opacity + translateY (0 -> 1, translateY 20 -> 0, delay 600ms, duration 500ms)
  const getNameOpacity = () => {
    if (reduceMotion) return 1;
    if (elapsedTime < 600) return 0;
    if (elapsedTime >= 2900) {
      // Step 5: Exit (opacity 1 -> 0, delay 2900ms, duration 300ms)
      const exitTime = Math.min(elapsedTime - 2900, 300);
      return 1 - (exitTime / 300);
    }
    const nameTime = Math.min(elapsedTime - 600, 500);
    return nameTime / 500;
  };

  const getNameTranslateY = () => {
    if (reduceMotion) return 0;
    if (elapsedTime < 600) return 20;
    if (elapsedTime >= 2900) return 0;
    const nameTime = Math.min(elapsedTime - 600, 500);
    return 20 - (nameTime / 500) * 20;
  };

  // Step 3: Tagline opacity + translateY (0 -> 1, translateY 10 -> 0, delay 900ms, duration 400ms)
  const getTaglineOpacity = () => {
    if (reduceMotion) return 1;
    if (elapsedTime < 900) return 0;
    if (elapsedTime >= 2900) {
      // Step 5: Exit (opacity 1 -> 0, delay 2900ms, duration 300ms)
      const exitTime = Math.min(elapsedTime - 2900, 300);
      return 1 - (exitTime / 300);
    }
    const taglineTime = Math.min(elapsedTime - 900, 400);
    return taglineTime / 400;
  };

  const getTaglineTranslateY = () => {
    if (reduceMotion) return 0;
    if (elapsedTime < 900) return 10;
    if (elapsedTime >= 2900) return 0;
    const taglineTime = Math.min(elapsedTime - 900, 400);
    return 10 - (taglineTime / 400) * 10;
  };

  // Step 4: Loading bar container opacity (0 -> 1, duration 300ms, delay 1000ms)
  const getLoadingBarOpacity = () => {
    if (reduceMotion) return 1;
    if (elapsedTime < 1000) return 0;
    if (elapsedTime >= 2900) {
      // Fade out with rest
      const exitTime = Math.min(elapsedTime - 2900, 300);
      return 1 - (exitTime / 300);
    }
    const barTime = Math.min(elapsedTime - 1000, 300);
    return barTime / 300;
  };

  // Step 5: Background Transition (#0F0F1A -> #16213E, delay 3000ms, duration 500ms)
  const getBackgroundColor = () => {
    if (reduceMotion && elapsedTime >= 3000) return '#16213E';
    if (elapsedTime < 3000) return '#0F0F1A';
    const bgTime = Math.min(elapsedTime - 3000, 500);
    const ratio = bgTime / 500;
    // Interpolating #0F0F1A (15, 15, 26) -> #16213E (22, 33, 62)
    const r = Math.round(15 + (22 - 15) * ratio);
    const g = Math.round(15 + (33 - 15) * ratio);
    const b = Math.round(26 + (62 - 26) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // High Fidelity expo typescript template code matching the specifications
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  AccessibilityInfo
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();

  // State
  const [loadingText, setLoadingText] = useState('Chargement...');
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  // Animated values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;
  const loadingContainerOpacity = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const loadingProgressOpacity = useRef(new Animated.Value(0)).current;
  const bgTransition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Check Accessibility reduce motion state
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotionEnabled(enabled);
      if (enabled) {
        // Instant presentation if user requested reduced animation profiles
        logoScale.setValue(1);
        nameOpacity.setValue(1);
        nameTranslateY.setValue(0);
        taglineOpacity.setValue(1);
        taglineTranslateY.setValue(0);
        loadingContainerOpacity.setValue(1);
        loadingProgress.setValue(100);
        loadingProgressOpacity.setValue(1);
      } else {
        startSplashAnimations();
      }
    });

    // 2. Fetch routing parameters from AsyncStorage and prepare transition
    const routingTimeout = setTimeout(async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const userToken = await AsyncStorage.getItem('userToken');
        
        if (hasSeenOnboarding === 'true') {
          navigation.replace('DashboardScreen');
        } else {
          navigation.replace('OnboardingStep1Screen');
        }
      } catch (err) {
        console.error("AsyncStorage error on Splash screen, falling back to onboarding", err);
        navigation.replace('OnboardingStep1Screen');
      }
    }, 3500);

    return () => clearTimeout(routingTimeout);
  }, []);

  const startSplashAnimations = () => {
    // ÉTAPE 1: LOGO (0ms - 800ms, scale 0 -> 1, duration 600ms, delay 200ms)
    const logoAnim = Animated.timing(logoScale, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    });

    // ÉTAPE 2: NOM (delay 600ms, opacity 0 -> 1, translateY 20 -> 0, duration 500ms)
    const nameAnim = Animated.parallel([
      Animated.timing(nameOpacity, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(nameTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      })
    ]);

    // ÉTAPE 3: TAGLINE (delay 900ms, opacity 0 -> 1, translateY 10 -> 0, duration 400ms)
    const taglineAnim = Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        delay: 900,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(taglineTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 900,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      })
    ]);

    // ÉTAPE 4: BARRE DE CHARGEMENT
    // Container Opacity: 0 -> 1, duration 300ms, delay 1000ms
    const loadingContainerAnim = Animated.timing(loadingContainerOpacity, {
      toValue: 1,
      duration: 300,
      delay: 1000,
      useNativeDriver: true
    });

    // Remplissage progress : 0 -> 100 in 2000ms, delay 1200ms
    const loadingProgressAnim = Animated.timing(loadingProgress, {
      toValue: 100,
      duration: 2000,
      delay: 1200,
      useNativeDriver: false, // width can't use native driver
      easing: Easing.inOut(Easing.ease)
    });

    // Pourcentage/label opacity : 0 -> 1, delay 1200ms
    const loadingProgressOpacityAnim = Animated.timing(loadingProgressOpacity, {
      toValue: 1,
      duration: 300,
      delay: 1200,
      useNativeDriver: true
    });

    // Listener for progress changes to update the loading text state at 33% and 66%
    loadingProgress.addListener(({ value }) => {
      if (value < 33) {
        setLoadingText('Chargement...');
      } else if (value >= 33 && value < 66) {
        setLoadingText('Préparation...');
      } else {
        setLoadingText("C'est parti");
      }
    });

    // ÉTAPE 5: TRANSITION DE SORTIE (2800ms - 3500ms)
    // Logo scale 1 -> 0.8, opacity 1 -> 0, delay 2800ms, duration 500ms
    const exitLogoAnim = Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 0.8,
        duration: 500,
        delay: 2800,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 500,
        delay: 2800,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]);

    // Nom + tagline : opacity 1 -> 0, delay 2900ms, duration 300ms
    const exitTextAnim = Animated.parallel([
      Animated.timing(nameOpacity, {
        toValue: 0,
        duration: 300,
        delay: 2900,
        useNativeDriver: true
      }),
      Animated.timing(taglineOpacity, {
        toValue: 0,
        duration: 300,
        delay: 2900,
        useNativeDriver: true
      }),
      Animated.timing(loadingContainerOpacity, {
        toValue: 0,
        duration: 300,
        delay: 2900,
        useNativeDriver: true
      })
    ]);

    // Fond : #0F0F1A -> #16213E (0 -> 1 index interpolation), delay 3000ms, duration 500ms
    const exitBgAnim = Animated.timing(bgTransition, {
      toValue: 1,
      duration: 500,
      delay: 3000,
      useNativeDriver: false // background color transitions can't use native driver
    });

    // Launch all animations simultaneously based on their predefined delay offsets
    Animated.parallel([
      logoAnim,
      nameAnim,
      taglineAnim,
      loadingContainerAnim,
      loadingProgressAnim,
      loadingProgressOpacityAnim,
      exitLogoAnim,
      exitTextAnim,
      exitBgAnim
    ]).start();
  };

  // Interpolate exit background color from #0F0F1A to #16213E
  const backgroundColor = bgTransition.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0F0F1A', '#16213E']
  });

  const widthPercent = loadingProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar hidden={true} />
      
      {/* SÉQUENCE CENTRALE */}
      <View style={styles.centerContainer} accessibilityRole="image" accessibilityLabel="Alpha Man, application de wellness masculine">
        
        {/* ÉTAPE 1: LOGO ALPHA MAN */}
        <Animated.View 
          style={[
            styles.logoContainer, 
            { 
              transform: [{ scale: logoScale }],
              opacity: logoOpacity
            }
          ]}
        >
          <View style={styles.innerLogoRing}>
            <Text style={styles.greekAlphaText}>α</Text>
          </View>
        </Animated.View>

        {/* ÉTAPE 2: NOM */}
        <Animated.View 
          style={{ 
            opacity: nameOpacity,
            transform: [{ translateY: nameTranslateY }] 
          }}
        >
          <Text style={styles.appNameText}>ALPHA MAN</Text>
        </Animated.View>

        {/* ÉTAPE 3: TAGLINE */}
        <Animated.View 
          style={{ 
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }] 
          }}
        >
          <Text style={styles.taglineText}>Reprends le contrôle. Deviens Alpha.</Text>
        </Animated.View>

        {/* ÉTAPE 4: BARRE DE CHARGEMENT */}
        <Animated.View style={[styles.loadingContainer, { opacity: loadingContainerOpacity }]}>
          <View style={styles.barBackground}>
            <Animated.View style={[styles.barFill, { width: widthPercent }]} />
          </View>
          <Animated.Text style={[styles.loadingLabel, { opacity: loadingProgressOpacity }]}>
            {loadingText}
          </Animated.Text>
        </Animated.View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#E94560',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 8, // offset simulation padding
  },
  innerLogoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greekAlphaText: {
    fontSize: 64,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 74,
  },
  appNameText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-ExtraBold',
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginTop: 32,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  barBackground: {
    width: 200,
    height: 4,
    backgroundColor: '#1A1A2E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#E94560',
    borderRadius: 2,
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 12,
    color: '#5A5A5A',
    fontFamily: 'Inter-Regular',
    letterSpacing: 1,
  }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      
      {/* HEADER CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
            Splash Screen Spec #8.1
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Visualisation & Séquenceur Interactive Splash Screen
          </h2>
          <p className="text-xs text-gray-400">
            Simulez la cinématique d'animation complète d'ALPHA MAN avant de copier le code source natif.
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

      {/* CODE VIEWPORT */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - SplashScreen.tsx</h4>
              <p className="text-[10px] text-gray-500">
                Gère l'intégralité des 5 étapes d'animation via Animated, s'adapte à ReduceMotion, interroge AsyncStorage et redirige proprement.
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

      {/* DUAL WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: MOBILE DEVICE PREVIEW */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* DEVICE PREVIEW SHELL */}
          <div className="w-full max-w-[380px] bg-black rounded-[48px] p-3 pt-5 pb-5 border-[6px] border-[#20202F] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Top camera/speaker notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-10 h-0.5 bg-[#20202F] rounded-full" />
              <div className="w-2 h-2 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN VIEWPORT */}
            <div 
              className="rounded-[36px] overflow-hidden flex flex-col items-center justify-center relative min-h-[640px] transition-all duration-500"
              style={{ backgroundColor: getBackgroundColor() }}
              aria-label="Alpha Man, application de wellness masculine"
            >
              {/* STATUS BAR SPACE */}
              <div className="absolute top-2 w-full px-6 flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 select-none z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>LTE</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-2.5 bg-[#E94560] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* CENTRAL ANIMATION ZONE */}
              <div className="flex flex-col items-center justify-center text-center p-6 relative z-10">
                
                {/* ETAPE 1 : LOGO */}
                <div 
                  className="transition-all duration-100 ease-out flex items-center justify-center"
                  style={{ 
                    transform: `scale(${getLogoScale()})`,
                    opacity: getLogoOpacity(),
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    border: '4px solid #E94560',
                    boxShadow: animationPhase === 'logo' || animationPhase === 'name' ? '0 0 25px rgba(233, 69, 96, 0.25)' : 'none'
                  }}
                >
                  <div 
                    className="flex items-center justify-center"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      border: '2px solid #FFD700',
                    }}
                  >
                    {isLottieMode ? (
                      /* SIMULATE LOTTIE PARTICLES FRAME */
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white animate-spin text-[#FFD700]" />
                        <span className="absolute inset-0 border-2 border-dashed border-[#E94560] rounded-full animate-ping" />
                      </div>
                    ) : (
                      <span className="text-[64px] font-headline font-extrabold text-white leading-none mb-1">
                        α
                      </span>
                    )}
                  </div>
                </div>

                {/* ETAPE 2 : APP NAME */}
                <h1 
                  className="font-headline font-black text-2xl text-white tracking-[0.25em] uppercase text-center transition-all duration-150"
                  style={{
                    marginTop: 32,
                    opacity: getNameOpacity(),
                    transform: `translateY(${getNameTranslateY()}px)`
                  }}
                >
                  ALPHA MAN
                </h1>

                {/* ETAPE 3 : TAGLINE */}
                <p 
                  className="text-xs text-[#8E8E93] font-headline max-w-[240px] text-center mt-4 leading-relaxed transition-all duration-150"
                  style={{
                    opacity: getTaglineOpacity(),
                    transform: `translateY(${getTaglineTranslateY()}px)`
                  }}
                >
                  Reprends le contrôle. Deviens Alpha.
                </p>

                {/* ETAPE 4 : LOADING BAR */}
                <div 
                  className="flex flex-col items-center mt-12 transition-opacity duration-150"
                  style={{
                    opacity: getLoadingBarOpacity()
                  }}
                >
                  <div className="w-[180px] h-[4px] bg-[#1A1A2E] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#E94560] rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-headline text-gray-500 font-bold uppercase tracking-wider mt-3">
                    {loadingText}
                  </span>
                </div>

              </div>

              {/* OVERLAY TIMER GRAPHIC HUD FOR DEVELOPERS */}
              <div className="absolute bottom-4 bg-black/70 border border-gray-800/40 px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-2 select-none">
                <span className="w-2 h-2 rounded-full bg-[#E94560] animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-gray-400">
                  Séquenceur : {elapsedTime}ms / 3500ms
                </span>
              </div>

              {/* MOCKUP OF SYSTEM NAVIGATION CONFIRMATION */}
              {elapsedTime >= 3500 && (
                <div className="absolute inset-0 bg-[#0F0F1A]/95 flex flex-col items-center justify-center p-6 z-30 animate-[fade-in_0.3s_ease-out]">
                  <div className="w-12 h-12 bg-[#00D9A5]/10 border border-[#00D9A5]/30 rounded-full flex items-center justify-center text-[#00D9A5] mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-headline font-bold text-white uppercase tracking-wider text-center">
                    CÉBLAGE NAVIGATION EXÉCUTÉ
                  </h4>
                  <p className="text-xs text-gray-400 text-center mt-2 max-w-[240px]">
                    L'appareil mobile remplace l'écran actuel par :
                  </p>
                  <div className="mt-4 px-3 py-1.5 bg-[#16213E] border border-gray-800 rounded-xl">
                    <span className="font-mono text-xs text-[#FFD700] font-bold">
                      {!hasSeenOnboarding ? 'OnboardingStep1Screen' : 'DashboardScreen'}
                    </span>
                  </div>
                  <button 
                    onClick={startSimulation}
                    className="mt-6 flex items-center gap-1.5 text-xs text-[#E94560] hover:underline font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rejouer la Séquence
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: INTERACTIVE DESK CONTROL SYSTEM */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* SIMULATOR CONTROLS */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <SlidersHorizontal className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Console de Pilotage du Splash
              </h3>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="flex flex-wrap gap-2">
              {!isPlaying ? (
                <button
                  onClick={startSimulation}
                  className="px-4 py-2 rounded-xl text-xs font-headline font-extrabold uppercase bg-[#E94560] text-white flex items-center gap-2 shadow-lg shadow-[#E94560]/20 hover:scale-102 transition-transform cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Lancer la Séquence (3s)
                </button>
              ) : (
                <button
                  onClick={pauseSimulation}
                  className="px-4 py-2 rounded-xl text-xs font-headline font-extrabold uppercase bg-amber-600 text-white flex items-center gap-2 hover:scale-102 transition-transform cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Pause Simulation
                </button>
              )}

              <button
                onClick={resetSimulation}
                className="px-3 py-2 rounded-xl text-xs font-headline font-extrabold uppercase bg-[#16213E] border border-gray-800 text-gray-300 flex items-center gap-1.5 hover:bg-gray-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            </div>

            {/* PRESETS TABLE & TIMELINE */}
            <div className="bg-[#0A0A15] border border-gray-900 rounded-xl p-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">
                Progression du Séquenceur d'Étape (Time-based State-machine)
              </span>

              <div className="grid grid-cols-5 gap-1.5 text-center mt-1">
                {[
                  { title: "1. Logo", timing: "0-800ms", active: elapsedTime < 600 && elapsedTime > 0 },
                  { title: "2. Nom", timing: "600-1100ms", active: elapsedTime >= 600 && elapsedTime < 900 },
                  { title: "3. Tagline", timing: "900-1300ms", active: elapsedTime >= 900 && elapsedTime < 1200 },
                  { title: "4. Barre", timing: "1000-3000ms", active: elapsedTime >= 1200 && elapsedTime < 2800 },
                  { title: "5. Sortie", timing: "2800-3500ms", active: elapsedTime >= 2800 }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-2 rounded-lg border transition-all ${
                      item.active 
                        ? 'bg-[#E94560]/10 border-[#E94560] text-white' 
                        : 'bg-gray-900/40 border-transparent text-gray-500'
                    }`}
                  >
                    <p className="text-[10px] font-headline font-bold">{item.title}</p>
                    <p className="text-[9px] font-mono mt-0.5">{item.timing}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ANIMATION ENGINE ADJUSTMENTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-headline font-bold text-gray-400 uppercase tracking-wide">
                  Vitesse de l'Animation (Échelle de Temps)
                </label>
                <div className="flex bg-[#16213E]/50 border border-[#1C1C3A] p-1 rounded-xl">
                  {[
                    { label: '0.5x', value: 0.5 },
                    { label: '1x (Normal)', value: 1 },
                    { label: '2x (Rapide)', value: 2 },
                  ].map((spd) => (
                    <button
                      key={spd.value}
                      onClick={() => {
                        setAnimationSpeed(spd.value);
                        addToast('info', `Multiplicateur de temps configuré sur ${spd.label}`);
                      }}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-headline font-bold transition-all cursor-pointer
                        ${animationSpeed === spd.value 
                          ? 'bg-[#E94560] text-white' 
                          : 'text-gray-400 hover:text-white'
                        }
                      `}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-headline font-bold text-gray-400 uppercase tracking-wide">
                  Option Logo Animé (Lottie)
                </label>
                <div className="flex bg-[#16213E]/50 border border-[#1C1C3A] p-1 rounded-xl">
                  {[
                    { label: 'Standard (SVG/CSS)', value: false },
                    { label: 'Lottie (Simulé)', value: true },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setIsLottieMode(opt.value);
                        addToast('success', `Moteur graphique configuré : ${opt.label}`);
                      }}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-headline font-bold transition-all cursor-pointer
                        ${isLottieMode === opt.value 
                          ? 'bg-[#E94560] text-white' 
                          : 'text-gray-400 hover:text-white'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* REDUCED MOTION TOGGLE ACCESSIBILITY */}
            <div className="flex items-center justify-between p-3.5 bg-[#16213E]/20 border border-gray-800 rounded-xl">
              <div>
                <h5 className="text-xs font-headline font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#00D9A5]" />
                  Réduction de Mouvement (Accessibilité)
                </h5>
                <p className="text-[11px] text-gray-400 mt-1">
                  Affiche instantanément l'état stable pour les utilisateurs sensibles aux animations.
                </p>
              </div>
              <button
                onClick={() => {
                  setReduceMotion(!reduceMotion);
                  addToast('info', `Réduction de mouvement ${!reduceMotion ? 'activée' : 'désactivée'}`);
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${reduceMotion ? 'bg-[#00D9A5]' : 'bg-gray-800'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${reduceMotion ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </AlphaCard>

          {/* SIMULATED STORAGE REDIRECTION */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-800/20 pb-3">
              <Database className="w-5 h-5 text-[#00D9A5]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Contrôle AsyncStorage & Routage Branché
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Modifiez l'état d'AsyncStorage pour simuler les différents embranchements de redirection après l'extinction du splash screen.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              
              <div className="flex items-center justify-between p-3.5 bg-gray-900/60 border border-gray-900 rounded-xl">
                <div>
                  <span className="font-mono text-[9px] text-[#FFD700] uppercase font-black">GET 'hasSeenOnboarding'</span>
                  <h6 className="text-xs font-headline font-bold text-white uppercase tracking-wide mt-1">Onboarding Validé</h6>
                </div>
                <button
                  onClick={() => {
                    setHasSeenOnboarding(!hasSeenOnboarding);
                    addToast('info', `Storage : hasSeenOnboarding mis à ${!hasSeenOnboarding}`);
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${hasSeenOnboarding ? 'bg-[#00D9A5]' : 'bg-gray-800'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${hasSeenOnboarding ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-900/60 border border-gray-900 rounded-xl">
                <div>
                  <span className="font-mono text-[9px] text-[#FFD700] uppercase font-black">GET 'userToken'</span>
                  <h6 className="text-xs font-headline font-bold text-white uppercase tracking-wide mt-1">Soldat Connecté</h6>
                </div>
                <button
                  onClick={() => {
                    const nextVal = userToken ? null : 'ALPHA_SECRET_JWT_TOKEN';
                    setUserToken(nextVal);
                    addToast('info', `Storage : userToken mis à ${nextVal ? 'Actif' : 'Null'}`);
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${userToken ? 'bg-[#00D9A5]' : 'bg-gray-800'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${userToken ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

            </div>

            <div className="p-3 bg-[#E94560]/5 border border-[#E94560]/10 rounded-xl">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">Filtre de Navigation Post-Splash :</span>
              <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                Si <strong className="text-white">hasSeenOnboarding == false</strong>, l'utilisateur est dirigé vers <strong className="text-[#E94560]">OnboardingStep1Screen</strong>. S'il a déjà vu l'onboarding, il va directement sur son tableau de bord <strong className="text-[#00D9A5]">DashboardScreen</strong>.
              </p>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
