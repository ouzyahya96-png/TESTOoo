import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Heart,
  Smile,
  Zap,
  Flame,
  Code,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface OnboardingStep4ScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNext?: (data: { currentMood: number; energyLevel: number; urgeLevel: number }) => void;
}

export const OnboardingStep4Screen: React.FC<OnboardingStep4ScreenProps> = ({
  addToast,
  onBack,
  onNext
}) => {
  // Screen States
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(5);
  const [selectedUrge, setSelectedUrge] = useState<number>(0);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);

  // Constants
  const moods = [
    { score: 1, emoji: "😫", label: "Épuisé" },
    { score: 3, emoji: "😰", label: "Anxieux" },
    { score: 5, emoji: "😐", label: "Neutre" },
    { score: 7, emoji: "💪", label: "Motivé" },
    { score: 10, emoji: "🔥", label: "Déterminé" }
  ];

  // Colors based on energy/urge level segments
  const getEnergyColor = (val: number) => {
    if (val <= 3) return '#FF2D55'; // Red
    if (val <= 6) return '#FF9500'; // Orange
    if (val <= 8) return '#FFD700'; // Yellow
    return '#00D9A5'; // Green
  };

  const getUrgeColor = (val: number) => {
    if (val <= 3) return '#00D9A5'; // Green (controlled)
    if (val <= 6) return '#FF9500'; // Orange (moderate)
    if (val <= 8) return '#E94560'; // Red (elevated)
    return '#FF2D55'; // Darker red (critical)
  };

  const getUrgeLabel = (val: number) => {
    if (val <= 3) return "Contrôlée";
    if (val <= 6) return "Modérée";
    if (val <= 8) return "Élevée";
    return "Critique";
  };

  const getEnergyLabel = (val: number) => {
    if (val <= 3) return "Épuisé";
    if (val <= 6) return "Moyen";
    if (val <= 8) return "Bien";
    return "Optimal";
  };

  // Diagnostic feedback message (mood + energy logic)
  const getValidationMessage = () => {
    if (selectedMood === null) return null;
    if (selectedMood <= 3 && selectedEnergy <= 3) {
      return "C'est exactement pour ça que tu es ici. On va remonter ensemble.";
    }
    if (selectedMood <= 6 && selectedEnergy <= 6) {
      return "Tu es au milieu du chemin. Le mieux est à venir.";
    }
    if (selectedMood >= 7 && selectedEnergy >= 7) {
      return "Tu as déjà une bonne base. On va la transformer en excellence.";
    }
    return "Chaque profil est unique. Ton plan sera personnalisé pour TOI.";
  };

  const handleMoodSelect = (score: number) => {
    if (navigator.vibrate) {
      navigator.vibrate([15]); // Light tap
    }
    setSelectedMood(score);
    addToast('info', `Humeur ajustée : ${score}/10`);
  };

  const handleEnergySelect = (level: number) => {
    if (navigator.vibrate) {
      navigator.vibrate([20]); // Tick
    }
    setSelectedEnergy(level);
    addToast('info', `Énergie ajustée : ${level}/10`);
  };

  const handleUrgeSelect = (level: number) => {
    if (navigator.vibrate) {
      navigator.vibrate([25]); // Tick
    }
    setSelectedUrge(level);
    if (level >= 7) {
      addToast('warning', `Alerte urge élevée : ${level}/10. Protocole d'urgence préparé !`);
    } else {
      addToast('info', `Envie ajustée : ${level}/10`);
    }
  };

  const handleNext = () => {
    if (selectedMood === null) {
      setShakeTrigger(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); // Error rumble
      }
      addToast('error', "Indique ton humeur pour continuer !");
      setTimeout(() => setShakeTrigger(false), 500);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate([35]); // Medium tap
    }
    addToast('success', `Profil émotionnel enregistré : Humeur=${selectedMood}, Énergie=${selectedEnergy}, Envie=${selectedUrge}!`);
    if (onNext) {
      onNext({
        currentMood: selectedMood,
        energyLevel: selectedEnergy,
        urgeLevel: selectedUrge
      });
    }
  };

  const copyNativeCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source OnboardingStep4Screen copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // High Fidelity React Native / Expo Code matching spec exactly
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
  ScrollView
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width: screenWidth } = Dimensions.get('window');

export default function OnboardingStep4Screen() {
  const navigation = useNavigation();

  // Selected state metrics
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(5);
  const [selectedUrge, setSelectedUrge] = useState<number>(0);

  // Animated layout indicators
  const progressWidth = useRef(new Animated.Value(screenWidth * 0.60)).current; // starts at 60%
  const title1Opacity = useRef(new Animated.Value(0)).current;
  const title1TranslateY = useRef(new Animated.Value(20)).current;
  const title2Opacity = useRef(new Animated.Value(0)).current;
  const title2TranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Staggered section entries
  const moodSectionOpacity = useRef(new Animated.Value(0)).current;
  const energySectionOpacity = useRef(new Animated.Value(0)).current;
  const urgeSectionOpacity = useRef(new Animated.Value(0)).current;

  // Dynamically floating notification triggers
  const alertOpacity = useRef(new Animated.Value(0)).current;
  const alertTranslateY = useRef(new Animated.Value(10)).current;

  const validationOpacity = useRef(new Animated.Value(0)).current;
  const validationTranslateY = useRef(new Animated.Value(10)).current;

  // Shake translation state
  const shakeTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Progress slider: 60% -> 80%
    Animated.timing(progressWidth, {
      toValue: screenWidth * 0.80,
      duration: 400,
      useNativeDriver: false
    }).start();

    // 2. Titles entry sequence
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

    // 3. Staggered section entrances
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(moodSectionOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(energySectionOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(urgeSectionOpacity, { toValue: 1, duration: 300, useNativeDriver: true })
      ])
    ]).start();
  }, []);

  // Alert & validation trigger animations
  useEffect(() => {
    if (selectedUrge >= 7) {
      Animated.parallel([
        Animated.timing(alertOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(alertTranslateY, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();
    } else {
      Animated.timing(alertOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [selectedUrge]);

  useEffect(() => {
    if (selectedMood !== null) {
      Animated.parallel([
        Animated.timing(validationOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(validationTranslateY, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();
    }
  }, [selectedMood, selectedEnergy]);

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
    if (selectedMood === null) {
      triggerShake();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // saveToState('emotionalMetrics', { currentMood: selectedMood, energyLevel: selectedEnergy, urgeLevel: selectedUrge });
    navigation.navigate('OnboardingStep5Screen');
  };

  const getValidationMessage = () => {
    if (selectedMood === null) return "";
    if (selectedMood <= 3 && selectedEnergy <= 3) {
      return "C'est exactement pour ça que tu es ici. On va remonter ensemble.";
    }
    if (selectedMood <= 6 && selectedEnergy <= 6) {
      return "Tu es au milieu du chemin. Le mieux est à venir.";
    }
    if (selectedMood >= 7 && selectedEnergy >= 7) {
      return "Tu as déjà une bonne base. On va la transformer en excellence.";
    }
    return "Chaque profil est unique. Ton plan sera personnalisé pour TOI.";
  };

  const getEnergyColor = () => {
    if (selectedEnergy <= 3) return '#FF2D55';
    if (selectedEnergy <= 6) return '#FF9500';
    if (selectedEnergy <= 8) return '#FFD700';
    return '#00D9A5';
  };

  const getEnergyLabel = () => {
    if (selectedEnergy <= 3) return "Épuisé";
    if (selectedEnergy <= 6) return "Moyen";
    if (selectedEnergy <= 8) return "Bien";
    return "Optimal";
  };

  const getUrgeColor = () => {
    if (selectedUrge <= 3) return '#00D9A5';
    if (selectedUrge <= 6) return '#FF9500';
    if (selectedUrge <= 8) return '#E94560';
    return '#FF2D55';
  };

  const getUrgeLabel = () => {
    if (selectedUrge <= 3) return "Contrôlée";
    if (selectedUrge <= 6) return "Modérée";
    if (selectedUrge <= 8) return "Élevée";
    return "Critique";
  };

  const moods = [
    { score: 1, emoji: "😫", label: "Épuisé" },
    { score: 3, emoji: "😰", label: "Anxieux" },
    { score: 5, emoji: "😐", label: "Neutre" },
    { score: 7, emoji: "💪", label: "Motivé" },
    { score: 10, emoji: "🔥", label: "Déterminé" }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      {/* TOP PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* HEADER ACTION BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.headerStepText}>4 sur 5</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* SCROLL CONTAINER BODY */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TITRES */}
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.titleLine1, { opacity: title1Opacity, transform: [{ translateY: title1TranslateY }] }]}>
            Comment te sens-tu
          </Animated.Text>
          <Animated.Text style={[styles.titleLine2, { opacity: title2Opacity, transform: [{ translateY: title2TranslateY }] }]}>
            en ce moment ?
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Sois honnête. C'est entre toi et toi.
          </Animated.Text>
        </View>

        {/* 1. HUMEUR / EMOJI SLIDER */}
        <Animated.View style={[styles.section, { opacity: moodSectionOpacity }]}>
          <Text style={styles.sectionTitle}>TON HUMEURE AUJOURD'HUI</Text>
          
          <View style={styles.emojisRow}>
            {moods.map((m) => {
              const isSelected = selectedMood === m.score;
              return (
                <TouchableOpacity
                  key={m.score}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMood(m.score);
                  }}
                  style={styles.emojiTouch}
                >
                  <Text style={[styles.emojiText, isSelected && styles.emojiTextSelected]}>
                    {m.emoji}
                  </Text>
                  <Text style={[styles.emojiLabel, isSelected && styles.emojiLabelSelected]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SLIDER CONTROLLER */}
          <View style={styles.sliderWrapper}>
            <Text style={styles.sliderLabel}>1</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={selectedMood || 5}
              onValueChange={(val) => setSelectedMood(val)}
              minimumTrackTintColor="#E94560"
              maximumTrackTintColor="#1A1A2E"
              thumbTintColor="#FFFFFF"
            />
            <Text style={styles.sliderLabel}>10</Text>
          </View>
          {selectedMood !== null && (
            <Text style={styles.sliderScoreIndicator}>Humeur active : {selectedMood}/10</Text>
          )}
        </Animated.View>

        {/* 2. ENERGIE THERMOMETRE */}
        <Animated.View style={[styles.section, { opacity: energySectionOpacity }]}>
          <Text style={styles.sectionTitle}>TON NIVEAU D'ÉNERGIE</Text>
          
          <View style={styles.segmentsBar}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
              const isActive = val <= selectedEnergy;
              const segColor = isActive ? getEnergyColor() : '#1A1A2E';
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.segment, { backgroundColor: segColor }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedEnergy(val);
                  }}
                />
              );
            })}
          </View>
          <Text style={[styles.levelIndicatorLabel, { color: getEnergyColor() }]}>
            Niveau {selectedEnergy}/10 - {getEnergyLabel()}
          </Text>
        </Animated.View>

        {/* 3. URGE/ENVIE (OPTIONNEL) */}
        <Animated.View style={[styles.section, { opacity: urgeSectionOpacity }]}>
          <Text style={styles.sectionTitle}>ENVIE / URGE AUJOURD'HUI (0-10)</Text>
          <Text style={styles.sectionSubText}>0 = aucune | 10 = très forte</Text>

          <View style={styles.segmentsBar}>
            {Array.from({ length: 11 }, (_, i) => i).map((val) => {
              const isActive = val <= selectedUrge;
              const segColor = isActive ? getUrgeColor() : '#1A1A2E';
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.segment, { backgroundColor: segColor }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedUrge(val);
                  }}
                />
              );
            })}
          </View>
          <Text style={[styles.levelIndicatorLabel, { color: getUrgeColor() }]}>
            Niveau {selectedUrge}/10 - {getUrgeLabel()}
          </Text>

          {/* DYNAMIC URGE WARNING CARD */}
          {selectedUrge >= 7 && (
            <Animated.View style={[
              styles.warningCard,
              { opacity: alertOpacity, transform: [{ translateY: alertTranslateY }] }
            ]}>
              <Ionicons name="alert-circle" size={20} color="#FF2D55" />
              <Text style={styles.warningText}>
                Niveau élevé détecté. Ton protocole d'urgence est prêt dans l'app.
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* 4. VALIDATION EMOTIONNEL CARD */}
        {selectedMood !== null && (
          <Animated.View style={[
            styles.validationCard,
            { opacity: validationOpacity, transform: [{ translateY: validationTranslateY }] }
          ]}>
            <Ionicons name="checkmark-circle" size={20} color="#00D9A5" />
            <Text style={styles.validationText}>{getValidationMessage()}</Text>
          </Animated.View>
        )}

        <View style={{ height: 100 }} /> {/* Scroll tail offset */}
      </ScrollView>

      {/* FIXED FOOTER CONTROLS */}
      <Animated.View style={[styles.footer, { transform: [{ translateX: shakeTranslateX }] }]}>
        <TouchableOpacity
          activeOpacity={selectedMood !== null ? 0.8 : 1}
          style={[styles.continueBtn, selectedMood !== null ? styles.continueBtnActive : styles.continueBtnDisabled]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>CONTINUER</Text>
          {selectedMood !== null && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        {selectedMood === null && (
          <Text style={styles.missingSelectionHint}>
            Indique ton humeur et ton énergie pour continuer
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
    paddingHorizontal: 16,
    zIndex: 10
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24
  },
  titleContainer: {
    marginBottom: 28
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
    lineHeight: 20
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: '#8E8E93',
    letterSpacing: 2,
    marginBottom: 16
  },
  sectionSubText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A',
    marginTop: -8,
    marginBottom: 12
  },
  emojisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16
  },
  emojiTouch: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  emojiText: {
    fontSize: 34,
    opacity: 0.4
  },
  emojiTextSelected: {
    opacity: 1,
    transform: [{ scale: 1.25 }]
  },
  emojiLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 6
  },
  emojiLabelSelected: {
    fontFamily: 'Inter-Bold',
    color: '#E94560'
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: 'RobotoMono-Bold',
    color: '#5A5A5A',
    width: 20,
    textAlign: 'center'
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10
  },
  sliderScoreIndicator: {
    fontSize: 11,
    fontFamily: 'RobotoMono-Bold',
    color: '#E94560',
    textAlign: 'center',
    marginTop: 4
  },
  segmentsBar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 4,
    gap: 4
  },
  segment: {
    flex: 1,
    height: '100%',
    borderRadius: 20
  },
  levelIndicatorLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 8
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,45,85,0.08)',
    borderColor: 'rgba(255,45,85,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    alignItems: 'center'
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF2D55',
    lineHeight: 16
  },
  validationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,217,165,0.08)',
    borderColor: 'rgba(0,217,165,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  validationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#00D9A5',
    lineHeight: 18
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 20
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
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A',
    textAlign: 'center',
    marginTop: 12
  }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      
      {/* HEADER SECTION SPECS AND ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
            Onboarding Step 4/5
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Indicateurs Émotionnels — OnboardingStep4Screen
          </h2>
          <p className="text-xs text-gray-400">
            Ajustez l'humeur par emoji slider, évaluez l'énergie thermique et identifiez les pics d'urgence.
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
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - OnboardingStep4Screen.tsx</h4>
              <p className="text-[10px] text-gray-500">
                Implémente la barre de progression mobile de 60% à 80%, l'emoji-slider spring, les barres thermométriques horizontales avec remplissage stagger, et l'alerte d'urgence adaptative.
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
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[660px]">
              
              {/* TOP 80% PROGRESS BAR */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A2E] z-30">
                <div 
                  className="h-full bg-[#E94560] transition-all duration-500 ease-out"
                  style={{ width: '80%' }}
                />
              </div>

              {/* TIMING AND NETWORK STAT BAR */}
              <div className="h-9 px-6 pt-2.5 flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 select-none z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-2.5 bg-[#E94560] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* BACK BAR ACTIONS */}
              <div className="px-3 py-1 flex justify-between items-center select-none z-10">
                <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-gray-900/30 flex items-center justify-center border border-gray-800/10 hover:bg-gray-800 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                </button>
                <span className="text-xs font-headline font-semibold text-gray-500">
                  4 sur 5
                </span>
                <div className="w-10" />
              </div>

              {/* EMULATOR BODY FORM */}
              <div className="flex-1 flex flex-col justify-between px-5 py-4 overflow-y-auto max-h-[500px] custom-scrollbar text-left">
                
                {/* HEADLINES */}
                <div>
                  <h2 className="font-headline font-black text-2xl text-white leading-tight">
                    Comment te sens-tu
                  </h2>
                  <h2 className="font-headline font-black text-2xl text-[#E94560] leading-tight">
                    en ce moment ?
                  </h2>
                  <p className="text-xs text-[#8E8E93] font-headline mt-2 leading-relaxed">
                    Sois honnête. C'est entre toi et toi.
                  </p>
                </div>

                {/* 1. HUMEUR / EMOJI SELECTOR */}
                <div className="my-4">
                  <h4 className="text-[10px] font-headline font-black text-[#8E8E93] tracking-widest uppercase mb-3">
                    Ton humeur aujourd'hui
                  </h4>

                  <div className="flex justify-between px-1 mb-3">
                    {moods.map((m) => {
                      const isSelected = selectedMood === m.score;
                      return (
                        <button
                          key={m.score}
                          onClick={() => handleMoodSelect(m.score)}
                          className="flex flex-col items-center gap-1 cursor-pointer group focus:outline-none"
                        >
                          <span 
                            className={`text-3xl transition-transform duration-300
                              ${isSelected ? 'scale-130 filter drop-shadow-[0_0_10px_rgba(233,69,96,0.5)]' : 'opacity-40 group-hover:opacity-80'}
                            `}
                          >
                            {m.emoji}
                          </span>
                          <span 
                            className={`text-[9px] font-headline font-bold uppercase tracking-wider transition-colors
                              ${isSelected ? 'text-[#E94560]' : 'text-gray-600'}
                            `}
                          >
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* CUSTOM SLIDER ROW AS COMPLEMENT */}
                  <div className="flex items-center gap-2 mt-2 bg-[#16213E]/50 p-2 rounded-xl border border-gray-800/20">
                    <span className="text-[10px] font-mono text-gray-500 font-bold">1</span>
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={selectedMood || 5}
                      onChange={(e) => setSelectedMood(parseInt(e.target.value))}
                      className="flex-1 accent-[#E94560] h-1 bg-[#1A1A2E] rounded-lg cursor-pointer appearance-none"
                    />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">10</span>
                  </div>
                </div>

                {/* 2. ENERGIE THERMOMETRE */}
                <div className="mb-4">
                  <h4 className="text-[10px] font-headline font-black text-[#8E8E93] tracking-widest uppercase mb-2">
                    Ton niveau d'énergie
                  </h4>

                  <div className="bg-[#1A1A2E] h-11 p-1 rounded-full flex gap-1 items-center">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                      const isActive = val <= selectedEnergy;
                      const activeColor = isActive ? getEnergyColor(selectedEnergy) : 'transparent';
                      return (
                        <button
                          key={val}
                          onClick={() => handleEnergySelect(val)}
                          className="flex-1 h-full rounded-full transition-all duration-200 cursor-pointer"
                          style={{ 
                            backgroundColor: isActive ? activeColor : '#0F0F1A',
                            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.03)'
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-1.5 px-1">
                    <span className="text-[9px] font-headline font-bold uppercase text-gray-500">
                      Thermètre : {selectedEnergy}/10
                    </span>
                    <span 
                      className="text-[10px] font-headline font-black uppercase"
                      style={{ color: getEnergyColor(selectedEnergy) }}
                    >
                      {getEnergyLabel(selectedEnergy)}
                    </span>
                  </div>
                </div>

                {/* 3. URGE/ENVIE */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[10px] font-headline font-black text-[#8E8E93] tracking-widest uppercase">
                      Envie / Urge aujourd'hui (0-10)
                    </h4>
                    <span className="text-[9px] font-headline text-gray-600 font-bold">0 = Aucune | 10 = Critique</span>
                  </div>

                  <div className="bg-[#1A1A2E] h-11 p-1 rounded-full flex gap-1 items-center">
                    {Array.from({ length: 11 }, (_, i) => i).map((val) => {
                      const isActive = val <= selectedUrge;
                      const activeColor = isActive ? getUrgeColor(selectedUrge) : 'transparent';
                      return (
                        <button
                          key={val}
                          onClick={() => handleUrgeSelect(val)}
                          className="flex-1 h-full rounded-full transition-all duration-200 cursor-pointer"
                          style={{ 
                            backgroundColor: isActive ? activeColor : '#0F0F1A',
                            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.03)'
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-1.5 px-1">
                    <span className="text-[9px] font-headline font-bold uppercase text-gray-500">
                      Niveau d'Urge : {selectedUrge}/10
                    </span>
                    <span 
                      className="text-[10px] font-headline font-black uppercase"
                      style={{ color: getUrgeColor(selectedUrge) }}
                    >
                      {getUrgeLabel(selectedUrge)}
                    </span>
                  </div>

                  {/* HIGH URGE WARNING POPUP */}
                  {selectedUrge >= 7 && (
                    <div className="mt-3 p-2.5 bg-[#FF2D55]/5 border border-[#FF2D55]/20 rounded-xl flex items-center gap-2 animate-[fade-in_0.2s_ease-out]">
                      <AlertTriangle className="w-4 h-4 text-[#FF2D55] flex-shrink-0 animate-bounce" />
                      <p className="text-[9px] font-headline text-[#FF2D55] font-bold leading-normal">
                        Niveau élevé détecté. Ton protocole d'urgence est prêt dans l'app.
                      </p>
                    </div>
                  )}
                </div>

                {/* ADAPTATIVE PROFILE EVALUATION */}
                {selectedMood !== null && (
                  <div className="mb-4 p-3 bg-[#00D9A5]/5 border border-[#00D9A5]/20 rounded-xl flex items-start gap-2.5 animate-[fade-in_0.2s_ease-out]">
                    <CheckCircle className="w-4 h-4 text-[#00D9A5] flex-shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[10px] font-headline text-[#00D9A5] font-bold leading-normal">
                      {getValidationMessage()}
                    </p>
                  </div>
                )}

                {/* ACTION TRIGGER GATE */}
                <div 
                  className={`w-full flex flex-col items-center gap-1.5
                    ${shakeTrigger ? 'animate-[shake_0.3s_ease-in-out]' : ''}
                  `}
                >
                  <button
                    onClick={handleNext}
                    className={`w-full h-11 rounded-xl font-headline font-extrabold text-xs uppercase text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer
                      ${selectedMood !== null
                        ? 'bg-[#E94560] shadow-[#E94560]/20 active:scale-97' 
                        : 'bg-gray-800 opacity-60'
                      }
                    `}
                  >
                    CONTINUER
                    {selectedMood !== null && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {selectedMood === null && (
                    <span className="text-[10px] font-headline text-gray-500 font-bold uppercase tracking-wider text-center animate-pulse">
                      Indique ton humeur et ton énergie pour continuer
                    </span>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: CALIBRATION INFORMATION AND PSYCHOLOGY */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Zap className="w-5 h-5 text-[#FF9500]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Synchronisation Journalière d'État (Step 4)
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Pour ajuster la tension d'entraînement recommandée, ALPHA MAN croise l'humeur psychologique avec la jauge thermométrique d'énergie. Un entraînement à pleine intensité n'est proposé qu'en cas d'énergie supérieure ou égale à 7.
            </p>

            <div className="bg-[#0A0A15] p-4 rounded-xl border border-gray-900 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">
                Règles de Calibration Planifiées :
              </span>
              
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-800/40">
                  <span className="text-gray-400 font-headline">Humeur & Énergie Élevées</span>
                  <span className="text-[#00D9A5] font-headline font-black">Force Maximale (Hypertrophie)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800/40">
                  <span className="text-gray-400 font-headline">Énergie Faible (1-3)</span>
                  <span className="text-[#FF9500] font-headline font-black">Régénération Passive (Relaxation)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400 font-headline">Urge Critique (≥ 7)</span>
                  <span className="text-[#FF2D55] font-headline font-black">Activation Mode SOS</span>
                </div>
              </div>
            </div>
          </AlphaCard>

          {/* SIMULATION CONTROLLERS */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Flame className="w-5 h-5 text-[#E94560]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Régulateurs de test clinique
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedMood(1);
                  setSelectedEnergy(1);
                  setSelectedUrge(0);
                  addToast('info', 'Calibré sur Épuisé & Vide.');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 cursor-pointer"
              >
                Simuler Fatigué (1/10)
              </button>

              <button
                onClick={() => {
                  setSelectedMood(10);
                  setSelectedEnergy(10);
                  setSelectedUrge(8);
                  addToast('success', 'Calibré sur Déterminé & Pic Urge.');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-[#E94560]/20 border border-[#E94560]/40 text-[#E94560] cursor-pointer"
              >
                Simuler Pic Envie (8/10)
              </button>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
