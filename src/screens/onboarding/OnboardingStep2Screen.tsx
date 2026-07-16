import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  CalendarDays,
  CalendarX,
  AlertTriangle,
  EyeOff,
  Heart,
  Smartphone,
  Code,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface OnboardingStep2ScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNext?: (selectedOption: string) => void;
}

export const OnboardingStep2Screen: React.FC<OnboardingStep2ScreenProps> = ({
  addToast,
  onBack,
  onNext
}) => {
  // Screen States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);

  // Animations simulator values
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Dynamic Support messages
  const getSupportMessage = (option: string | null) => {
    switch (option) {
      case 'less_than_1_year':
        return "Le plus tôt tu agis, plus vite tu verras des résultats. Bienvenue chez Alpha.";
      case '1_to_3_years':
        return "Tu n'es pas seul. 67% des Alphas étaient dans ton cas. Ça change.";
      case '3_to_5_years':
        return "C'est exactement le moment de casser le cycle. On a des outils pour ça.";
      case '5_plus_years':
        return "Si tu es encore là après 5 ans, c'est que tu es plus fort que tu ne le penses.";
      case 'prefer_not_to_say':
        return "Pas de pression. On est là quand tu seras prêt.";
      default:
        return "";
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate([20]); // Light haptic
    }
    setSelectedOption(optionId);
    addToast('info', `Option sélectionnée : ${optionId}`);
  };

  const handleNext = () => {
    if (!selectedOption) {
      // Trigger shake & error haptic
      setShakeTrigger(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); // Error haptic pattern
      }
      addToast('error', "Sélectionne une option pour continuer !");
      setTimeout(() => setShakeTrigger(false), 500);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate([35]); // Medium haptic
    }
    addToast('success', `Donnée enregistrée : struggleDuration = "${selectedOption}" !`);
    if (onNext) {
      onNext(selectedOption);
    }
  };

  const copyNativeCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source OnboardingStep2Screen copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // High Fidelity Expo / React Native TypeScript source code matching the specifications
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

type StruggleOption = 'less_than_1_year' | '1_to_3_years' | '3_to_5_years' | '5_plus_years' | 'prefer_not_to_say';

export default function OnboardingStep2Screen() {
  const navigation = useNavigation();

  // Selected state
  const [selectedOption, setSelectedOption] = useState<StruggleOption | null>(null);

  // Animated values
  const progressWidth = useRef(new Animated.Value(screenWidth * 0.20)).current; // starts at 20%
  const title1Opacity = useRef(new Animated.Value(0)).current;
  const title1TranslateY = useRef(new Animated.Value(20)).current;
  const title2Opacity = useRef(new Animated.Value(0)).current;
  const title2TranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Options Entrance Animations
  const optionAnims = useRef(
    [0, 1, 2, 3, 4].map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-20)
    }))
  ).current;

  // Message Support Animations
  const supportOpacity = useRef(new Animated.Value(0)).current;
  const supportTranslateY = useRef(new Animated.Value(10)).current;

  // Disabled Shake translation
  const shakeTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Progress bar animation from 20% to 40% (duration 400ms)
    Animated.timing(progressWidth, {
      toValue: screenWidth * 0.40,
      duration: 400,
      useNativeDriver: false
    }).start();

    // 2. Titles staggered entry
    Animated.sequence([
      Animated.parallel([
        Animated.timing(title1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(title1TranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]),
      Animated.parallel([
        Animated.timing(title2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(title2TranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();

    // 3. Staggered Entrance of option cards after 600ms
    const entryAnimations = optionAnims.map((anim, index) => {
      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(anim.translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]);
    });

    Animated.sequence([
      Animated.delay(600),
      Animated.stagger(100, entryAnimations)
    ]).start();
  }, []);

  // When selection changes, animate support message
  useEffect(() => {
    if (selectedOption) {
      supportOpacity.setValue(0);
      supportTranslateY.setValue(10);
      Animated.parallel([
        Animated.timing(supportOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(supportTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [selectedOption]);

  const handleSelectOption = (option: StruggleOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(option);
  };

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeTranslateX, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeTranslateX, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeTranslateX, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeTranslateX, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeTranslateX, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedOption) {
      triggerShake();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // saveToState('struggleDuration', selectedOption);
    navigation.navigate('OnboardingStep3Screen');
  };

  const getSupportMessage = () => {
    switch (selectedOption) {
      case 'less_than_1_year':
        return "Le plus tôt tu agis, plus vite tu verras des résultats. Bienvenue chez Alpha.";
      case '1_to_3_years':
        return "Tu n'es pas seul. 67% des Alphas étaient dans ton cas. Ça change.";
      case '3_to_5_years':
        return "C'est exactement le moment de casser le cycle. On a des outils pour ça.";
      case '5_plus_years':
        return "Si tu es encore là après 5 ans, c'est que tu es plus fort que tu ne le penses.";
      case 'prefer_not_to_say':
        return "Pas de pression. On est là quand tu seras prêt.";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      {/* TOP PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.headerStepText}>2 sur 5</Text>
        <View style={{ width: 44 }} /> {/* alignment offset */}
      </View>

      {/* BODY SCROLL CONTENT */}
      <View style={styles.content}>
        
        {/* TITRES */}
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.titleLine1, { opacity: title1Opacity, transform: [{ translateY: title1TranslateY }] }]}>
            Depuis combien
          </Animated.Text>
          <Animated.Text style={[styles.titleLine2, { opacity: title2Opacity, transform: [{ translateY: title2TranslateY }] }]}>
            de temps tu luttes ?
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Il n'y a pas de bonne ou mauvaise réponse. On est là pour ça.
          </Animated.Text>
        </View>

        {/* OPTIONS CONTAINER */}
        <View style={styles.optionsContainer}>
          {[
            {
              id: 'less_than_1_year',
              iconName: 'calendar-range',
              iconColor: '#4A90D9',
              title: "Moins d'un an",
              subtitle: "Je viens de réaliser que c'est un problème"
            },
            {
              id: '1_to_3_years',
              iconName: 'calendar-clock',
              iconColor: '#FF9500',
              title: "1 à 3 ans",
              subtitle: "J'ai essayé plusieurs fois, mais je retombe"
            },
            {
              id: '3_to_5_years',
              iconName: 'calendar-remove',
              iconColor: '#E94560',
              title: "3 à 5 ans",
              subtitle: "C'est devenu un cycle incontrôlable"
            },
            {
              id: '5_plus_years',
              iconName: 'calendar-alert',
              iconColor: '#FF2D55',
              title: "Plus de 5 ans",
              subtitle: "J'ai perdu espoir, mais je n'abandonne pas"
            },
            {
              id: 'prefer_not_to_say',
              iconName: 'eye-off-outline',
              iconColor: '#5A5A5A',
              title: "Je préfère ne pas répondre",
              subtitle: "C'est OK. On respecte ton choix."
            }
          ].map((opt, idx) => {
            const isSelected = selectedOption === opt.id;
            return (
              <Animated.View
                key={opt.id}
                style={{
                  opacity: optionAnims[idx].opacity,
                  transform: [{ translateX: optionAnims[idx].translateX }]
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected
                  ]}
                  onPress={() => handleSelectOption(opt.id as StruggleOption)}
                >
                  <View style={styles.optionLeftContent}>
                    <View style={styles.iconWrapper}>
                      <MaterialCommunityIcons name={opt.iconName as any} size={28} color={opt.iconColor} />
                    </View>
                    <View style={styles.textWrapper}>
                      <Text style={styles.optionTitle}>{opt.title}</Text>
                      <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                    </View>
                  </View>

                  {/* CUSTOM RADIO BUTTON */}
                  <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                    {isSelected && <View style={styles.radioButtonDot} />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* DYNAMIC SUPPORT MESSAGE */}
        {selectedOption && (
          <Animated.View style={[
            styles.supportCard,
            { 
              opacity: supportOpacity, 
              transform: [{ translateY: supportTranslateY }] 
            }
          ]}>
            <Ionicons name="heart" size={20} color="#00D9A5" />
            <Text style={styles.supportText}>{getSupportMessage()}</Text>
          </Animated.View>
        )}

      </View>

      {/* FOOTER ACTION BUTTON */}
      <Animated.View style={[styles.footer, { transform: [{ translateX: shakeTranslateX }] }]}>
        <TouchableOpacity
          activeOpacity={selectedOption ? 0.8 : 1}
          style={[styles.continueBtn, selectedOption ? styles.continueBtnActive : styles.continueBtnDisabled]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>CONTINUER</Text>
          {selectedOption && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        {!selectedOption && (
          <Text style={styles.missingSelectionHint}>
            Sélectionne une option pour continuer
          </Text>
        )}
      </Animated.View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16
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
    color: '#5A5A5A'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  titleContainer: {
    marginTop: 20
  },
  titleLine1: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    lineHeight: 36
  },
  titleLine2: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    color: '#E94560',
    lineHeight: 36
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 12,
    maxWidth: 300,
    lineHeight: 20
  },
  optionsContainer: {
    marginTop: 24,
    gap: 12
  },
  optionCard: {
    height: 80,
    backgroundColor: '#16213E',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  optionCardSelected: {
    borderColor: '#E94560'
  },
  optionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconWrapper: {
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2
  },
  optionSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    lineHeight: 14
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5A5A5A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  radioButtonSelected: {
    borderColor: '#E94560'
  },
  radioButtonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E94560'
  },
  supportCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,217,165,0.08)',
    borderColor: 'rgba(0,217,165,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    alignItems: 'center'
  },
  supportText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#00D9A5',
    lineHeight: 18
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    width: '100%'
  },
  continueBtn: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  continueBtnActive: {
    backgroundColor: '#E94560',
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16
  },
  continueBtnDisabled: {
    backgroundColor: '#5A5A5A',
    opacity: 0.5
  },
  continueBtnText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  missingSelectionHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A',
    textAlign: 'center',
    marginTop: 12
  }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      
      {/* HEADER ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
            Onboarding Step 2/5
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Questionnaire de Durée — OnboardingStep2Screen
          </h2>
          <p className="text-xs text-gray-400">
            Évaluez l'ancienneté du combat et offrez une réponse positive contextuelle personnalisée.
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

      {/* EXPO SOURCE CODE SECTION */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - OnboardingStep2Screen.tsx</h4>
              <p className="text-[10px] text-gray-500">
                Gère la barre de progression mobile de 20% à 40%, l'animation de translation d'entrée des cartes, le haptic léger, et le message de soutien adaptatif.
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

      {/* SIMULATOR SCREEN AND DIAGNOSTIC DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: MOBILE APP EMULATOR */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* DEVICE FRAME */}
          <div className="w-full max-w-[385px] bg-[#000] rounded-[48px] p-3 pt-5 pb-5 border-[6px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker hole */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-10 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2 h-2 bg-[#101020] rounded-full" />
            </div>

            {/* VIEWPORT CANVAS */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[660px]">
              
              {/* TOP 40% PROGRESS BAR */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A2E] z-30">
                <div 
                  className="h-full bg-[#E94560] transition-all duration-500 ease-out"
                  style={{ width: '40%' }}
                />
              </div>

              {/* TIME AND BATTERY BAR */}
              <div className="h-9 px-6 pt-2.5 flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 select-none z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-2.5 bg-[#E94560] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* BACK HEADER BAR */}
              <div className="px-3 py-1 flex justify-between items-center select-none z-10">
                <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-gray-900/30 flex items-center justify-center border border-gray-800/10 hover:bg-gray-800 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                </button>
                <span className="text-xs font-headline font-semibold text-gray-500">
                  2 sur 5
                </span>
                <div className="w-10" /> {/* empty placeholder for symmetry */}
              </div>

              {/* CORE QUESTIONNAIRE */}
              <div className="flex-1 flex flex-col justify-between px-5 py-4">
                
                {/* HEADLINES */}
                <div className="flex flex-col text-left">
                  <h2 className="font-headline font-black text-2xl text-white leading-tight">
                    Depuis combien
                  </h2>
                  <h2 className="font-headline font-black text-2xl text-[#E94560] leading-tight">
                    de temps tu luttes ?
                  </h2>
                  <p className="text-xs text-[#8E8E93] font-headline mt-2 leading-relaxed">
                    Il n'y a pas de bonne ou mauvaise réponse. On est là pour ça.
                  </p>
                </div>

                {/* SELECTABLE OPTIONS */}
                <div className="flex flex-col gap-2.5 my-4">
                  {[
                    {
                      id: 'less_than_1_year',
                      icon: <Calendar className="w-5 h-5 text-[#4A90D9]" />,
                      title: "Moins d'un an",
                      subtitle: "Je viens de réaliser que c'est un problème"
                    },
                    {
                      id: '1_to_3_years',
                      icon: <Clock className="w-5 h-5 text-[#FF9500]" />,
                      title: "1 à 3 ans",
                      subtitle: "J'ai essayé plusieurs fois, mais je retombe"
                    },
                    {
                      id: '3_to_5_years',
                      icon: <CalendarDays className="w-5 h-5 text-[#E94560]" />,
                      title: "3 à 5 ans",
                      subtitle: "C'est devenu un cycle incontrôlable"
                    },
                    {
                      id: '5_plus_years',
                      icon: <AlertTriangle className="w-5 h-5 text-[#FF2D55]" />,
                      title: "Plus de 5 ans",
                      subtitle: "J'ai perdu espoir, mais je n'abandonne pas"
                    },
                    {
                      id: 'prefer_not_to_say',
                      icon: <EyeOff className="w-5 h-5 text-[#5A5A5A]" />,
                      title: "Je préfère ne pas répondre",
                      subtitle: "C'est OK. On respecte ton choix."
                    }
                  ].map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer
                          ${isSelected 
                            ? 'bg-[#16213E] border-[#E94560] shadow-md shadow-[#E94560]/5' 
                            : 'bg-[#16213E]/80 border-transparent hover:bg-[#16213E]'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 bg-black/20 p-2 rounded-lg">
                            {opt.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-headline font-black text-white leading-none mb-1">
                              {opt.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-headline font-medium leading-none">
                              {opt.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* RADIO CONTAINER */}
                        <div 
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all
                            ${isSelected ? 'border-[#E94560]' : 'border-gray-600'}
                          `}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#E94560] animate-ping" />
                          )}
                        </div>

                      </button>
                    );
                  })}
                </div>

                {/* ADAPTATIVE SUPPORT COMPONENT */}
                {selectedOption && (
                  <div className="mb-4 p-3 bg-[#00D9A5]/5 border border-[#00D9A5]/20 rounded-xl flex items-start gap-2.5 animate-[fade-in_0.2s_ease-out]">
                    <Heart className="w-4 h-4 text-[#00D9A5] flex-shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[10px] font-headline text-[#00D9A5] font-bold leading-normal">
                      {getSupportMessage(selectedOption)}
                    </p>
                  </div>
                )}

                {/* BUTTON CONTINUE ACTUATOR */}
                <div 
                  className={`w-full flex flex-col items-center gap-1.5 transition-all
                    ${shakeTrigger ? 'animate-[shake_0.3s_ease-in-out]' : ''}
                  `}
                >
                  <button
                    onClick={handleNext}
                    className={`w-full h-11 rounded-xl font-headline font-extrabold text-xs uppercase text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer
                      ${selectedOption 
                        ? 'bg-[#E94560] shadow-[#E94560]/20 active:scale-97' 
                        : 'bg-gray-800 opacity-60'
                      }
                    `}
                  >
                    CONTINUER
                    {selectedOption && <ArrowRight className="w-4 h-4" />}
                  </button>
                  
                  {!selectedOption && (
                    <span className="text-[10px] font-headline text-gray-500 font-bold uppercase tracking-wider animate-pulse">
                      Sélectionne une option pour continuer
                    </span>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: REASSURANCE METRICS & SPECIFICATION EXPLAINERS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-800/20 pb-3">
              <Heart className="w-5 h-5 text-[#00D9A5]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Module de Reassurance Psychologique
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Pour éviter les décrochages typiques lors des questionnaires de santé masculine, ALPHA MAN intègre des <strong className="text-[#00D9A5]">bulles d'empathie contextuelle</strong> adaptées à l'ancienneté du combat.
            </p>

            <div className="bg-[#0A0A15] p-4 rounded-xl border border-gray-900 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">
                Moteur de Reassurance - Réponses Dynamiques :
              </span>

              <div className="flex flex-col gap-2">
                {[
                  { range: "Moins d'un an", value: "« Le plus tôt tu agis, plus vite tu verras des résultats. »" },
                  { range: "1 à 3 ans", value: "« Tu n'es pas seul. 67% des Alphas étaient dans ton cas. »" },
                  { range: "3 à 5 ans", value: "« C'est exactement le moment de casser le cycle. »" },
                  { range: "Plus de 5 ans", value: "« Si tu es encore là après 5 ans, c'est que tu es fort. »" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-800/25">
                    <span className="font-headline font-black text-gray-300">{item.range}</span>
                    <span className="font-headline text-[#00D9A5] italic text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AlphaCard>

          {/* SIMULATOR QUICK RE-RUN HELPER */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Calendar className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Simuler l'Anatomie du Formulaire
              </h3>
            </div>

            <div className="p-4 bg-[#16213E]/20 border border-gray-800 rounded-xl">
              <h5 className="text-xs font-headline font-bold text-white uppercase tracking-wide">
                Validation Client-Side stricte
              </h5>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Si l'utilisateur appuie sur "Continuer" sans avoir sélectionné de durée, le composant exécute une animation de secousse (shake) sur l'ensemble du bouton et émet un signal vibratoire d'erreur pour attirer l'attention de manière naturelle.
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedOption(null);
                    addToast('info', 'Sélection réinitialisée.');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 cursor-pointer"
                >
                  Forcer État Inactif
                </button>
                <button
                  onClick={() => {
                    setSelectedOption('5_plus_years');
                    addToast('info', 'Sélection forcée : Plus de 5 ans.');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-[#E94560]/20 border border-[#E94560]/40 text-[#E94560] cursor-pointer"
                >
                  Forcer Option 4
                </button>
              </div>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
