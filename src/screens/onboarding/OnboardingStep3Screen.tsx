import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Moon,
  Sunrise,
  Zap,
  Clock,
  Smartphone,
  Calendar,
  Home,
  Frown,
  Shield,
  X,
  Code,
  Copy,
  Check,
  Award
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface OnboardingStep3ScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNext?: (selectedTriggers: string[]) => void;
}

export const OnboardingStep3Screen: React.FC<OnboardingStep3ScreenProps> = ({
  addToast,
  onBack,
  onNext
}) => {
  // Screen States
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);

  // Trigger Items static data
  const triggersList = [
    {
      id: 'evening_alone',
      icon: <Moon className="w-5 h-5 text-[#4A90D9]" />,
      title: "Le soir",
      subtitle: "Seul, avant de dormir"
    },
    {
      id: 'morning_wake',
      icon: <Sunrise className="w-5 h-5 text-[#FF9500]" />,
      title: "Le matin",
      subtitle: "Au réveil, au lit"
    },
    {
      id: 'stress',
      icon: <Zap className="w-5 h-5 text-[#E94560]" />,
      title: "Le stress",
      subtitle: "Travail, anxiété, pression"
    },
    {
      id: 'boredom',
      icon: <Clock className="w-5 h-5 text-[#5A5A5A]" />,
      title: "L'ennui",
      subtitle: "Rien à faire, scrolling"
    },
    {
      id: 'social_media',
      icon: <Smartphone className="w-5 h-5 text-[#FF2D55]" />,
      title: "Réseaux sociaux",
      subtitle: "Instagram, TikTok, Twitter"
    },
    {
      id: 'weekend',
      icon: <Calendar className="w-5 h-5 text-[#00D9A5]" />,
      title: "Le week-end",
      subtitle: "Plus de temps libre"
    },
    {
      id: 'home_alone',
      icon: <Home className="w-5 h-5 text-[#FFD700]" />,
      title: "Seul à la maison",
      subtitle: "Personne ne regarde"
    },
    {
      id: 'after_conflict',
      icon: <Frown className="w-5 h-5 text-[#8E8E93]" />,
      title: "Après un conflit",
      subtitle: "Dispute, rupture, émotion"
    }
  ];

  const handleToggleTrigger = (triggerId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate([15]); // Light tap
    }

    if (selectedTriggers.includes(triggerId)) {
      setSelectedTriggers(prev => prev.filter(id => id !== triggerId));
      addToast('info', `Trigger retiré : ${triggerId}`);
    } else {
      setSelectedTriggers(prev => [...prev, triggerId]);
      addToast('success', `Trigger ajouté : ${triggerId}`);
    }
  };

  const handleNext = () => {
    if (selectedTriggers.length === 0) {
      setShakeTrigger(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); // Error rumble
      }
      addToast('error', "Sélectionne au moins un trigger pour continuer !");
      setTimeout(() => setShakeTrigger(false), 500);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate([35]); // Medium tap
    }
    addToast('success', `Triggers enregistrés : [${selectedTriggers.join(', ')}] !`);
    if (onNext) {
      onNext(selectedTriggers);
    }
  };

  const copyNativeCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source OnboardingStep3Screen copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // High Fidelity Expo React Native TypeScript Code matching specifications
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
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

type TriggerId = 'evening_alone' | 'morning_wake' | 'stress' | 'boredom' | 'social_media' | 'weekend' | 'home_alone' | 'after_conflict';

interface TriggerItem {
  id: TriggerId;
  iconName: string;
  iconType: 'ionicons' | 'mcommunity' | 'font-awesome';
  iconColor: string;
  title: string;
  subtitle: string;
}

export default function OnboardingStep3Screen() {
  const navigation = useNavigation();

  // Selected triggers state
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerId[]>([]);

  // Animated values
  const progressWidth = useRef(new Animated.Value(screenWidth * 0.40)).current; // starts at 40%
  const title1Opacity = useRef(new Animated.Value(0)).current;
  const title1TranslateY = useRef(new Animated.Value(20)).current;
  const title2Opacity = useRef(new Animated.Value(0)).current;
  const title2TranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Grid Stagger Anims
  const gridAnims = useRef(
    [0, 1, 2, 3, 4, 5, 6, 7].map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.9)
    }))
  ).current;

  // Summary card translation & fade
  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryTranslateY = useRef(new Animated.Value(10)).current;

  // Shake actuator
  const shakeTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Progress width animation: 40% to 60%
    Animated.timing(progressWidth, {
      toValue: screenWidth * 0.60,
      duration: 400,
      useNativeDriver: false
    }).start();

    // 2. Headings transition
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

    // 3. Staggered grid entrance
    const gridEntranceAnimations = gridAnims.map((anim) => {
      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(anim.scale, {
          toValue: 1.0,
          duration: 250,
          useNativeDriver: true
        })
      ]);
    });

    Animated.sequence([
      Animated.delay(600),
      Animated.stagger(60, gridEntranceAnimations)
    ]).start();
  }, []);

  // Animate summary box when selectedTriggers count changes
  useEffect(() => {
    if (selectedTriggers.length > 0) {
      summaryOpacity.setValue(0);
      summaryTranslateY.setValue(10);
      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(summaryTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.timing(summaryOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [selectedTriggers.length]);

  const handleToggleTrigger = (id: TriggerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedTriggers.includes(id)) {
      setSelectedTriggers(prev => prev.filter(t => t !== id));
    } else {
      setSelectedTriggers(prev => [...prev, id]);
    }
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
    if (selectedTriggers.length === 0) {
      triggerShake();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // saveToState('primaryTriggers', selectedTriggers);
    navigation.navigate('OnboardingStep4Screen');
  };

  const triggersData: TriggerItem[] = [
    {
      id: 'evening_alone',
      iconName: 'weather-night',
      iconType: 'mcommunity',
      iconColor: '#4A90D9',
      title: "Le soir",
      subtitle: "Seul, avant de dormir"
    },
    {
      id: 'morning_wake',
      iconName: 'weather-sunset-up',
      iconType: 'mcommunity',
      iconColor: '#FF9500',
      title: "Le matin",
      subtitle: "Au réveil, au lit"
    },
    {
      id: 'stress',
      iconName: 'flash',
      iconType: 'ionicons',
      iconColor: '#E94560',
      title: "Le stress",
      subtitle: "Travail, anxiété, pression"
    },
    {
      id: 'boredom',
      iconName: 'clock-outline',
      iconType: 'mcommunity',
      iconColor: '#5A5A5A',
      title: "L'ennui",
      subtitle: "Rien à faire, scrolling"
    },
    {
      id: 'social_media',
      iconName: 'cellphone',
      iconType: 'mcommunity',
      iconColor: '#FF2D55',
      title: "Réseaux sociaux",
      subtitle: "Instagram, TikTok, Twitter"
    },
    {
      id: 'weekend',
      iconName: 'calendar',
      iconType: 'ionicons',
      iconColor: '#00D9A5',
      title: "Le week-end",
      subtitle: "Plus de temps libre"
    },
    {
      id: 'home_alone',
      iconName: 'home-variant-outline',
      iconType: 'mcommunity',
      iconColor: '#FFD700',
      title: "Seul à la maison",
      subtitle: "Personne ne regarde"
    },
    {
      id: 'after_conflict',
      iconName: 'frown-o',
      iconType: 'font-awesome',
      iconColor: '#8E8E93',
      title: "Après un conflit",
      subtitle: "Dispute, rupture, émotion"
    }
  ];

  // Helper to translate key names for tags
  const getTriggerLabel = (id: TriggerId) => {
    const found = triggersData.find(t => t.id === id);
    return found ? found.title : id;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      {/* TOP PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* MINIMAL HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.headerStepText}>3 sur 5</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* INNER SCROLL BODY */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TITLES */}
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.titleLine1, { opacity: title1Opacity, transform: [{ translateY: title1TranslateY }] }]}>
            Quand est-ce que
          </Animated.Text>
          <Animated.Text style={[styles.titleLine2, { opacity: title2Opacity, transform: [{ translateY: title2TranslateY }] }]}>
            c'est le plus difficile ?
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Sélectionne TOUT ce qui s'applique à toi. On utilisera ça pour te protéger.
          </Animated.Text>
        </View>

        {/* 2X2 MULTI-SELECTABLE GRID */}
        <View style={styles.gridContainer}>
          {triggersData.map((item, idx) => {
            const isSelected = selectedTriggers.includes(item.id);
            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.gridItemWrapper,
                  {
                    opacity: gridAnims[idx].opacity,
                    transform: [{ scale: gridAnims[idx].scale }]
                  }
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleToggleTrigger(item.id)}
                  style={[
                    styles.gridCard,
                    isSelected && styles.gridCardSelected
                  ]}
                >
                  <View style={styles.cardHeader}>
                    {item.iconType === 'ionicons' && <Ionicons name={item.iconName as any} size={28} color={item.iconColor} />}
                    {item.iconType === 'mcommunity' && <MaterialCommunityIcons name={item.iconName as any} size={28} color={item.iconColor} />}
                    {item.iconType === 'font-awesome' && <FontAwesome name={item.iconName as any} size={26} color={item.iconColor} />}

                    {/* SELECT CHECKMARK PIN */}
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  <View style={styles.cardTexts}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* ADAPTATIVE PATTERN SUMMARY */}
        {selectedTriggers.length > 0 && (
          <Animated.View style={[
            styles.summaryCard,
            { 
              opacity: summaryOpacity, 
              transform: [{ translateY: summaryTranslateY }] 
            }
          ]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#E94560" />
              <Text style={styles.summaryTitle}>Ton Pattern Killer est prêt</Text>
            </View>

            <View style={styles.tagsContainer}>
              {selectedTriggers.map((id) => (
                <TouchableOpacity 
                  key={id} 
                  style={styles.tagBadge} 
                  onPress={() => handleToggleTrigger(id)}
                >
                  <Text style={styles.tagText}>{getTriggerLabel(id)}</Text>
                  <Ionicons name="close-circle" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.summaryFooterText}>
              On t'alertera AVANT que ces moments n'arrivent. Prépare ton protocole d'urgence.
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 100 }} /> {/* Safe scroll clearance */}
      </ScrollView>

      {/* FIXED CONTINUATION ACTUATOR */}
      <Animated.View style={[styles.footer, { transform: [{ translateX: shakeTranslateX }] }]}>
        <TouchableOpacity
          activeOpacity={selectedTriggers.length > 0 ? 0.8 : 1}
          style={[styles.continueBtn, selectedTriggers.length > 0 ? styles.continueBtnActive : styles.continueBtnDisabled]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>CONTINUER</Text>
          {selectedTriggers.length > 0 && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        {selectedTriggers.length === 0 && (
          <Text style={styles.missingSelectionHint}>
            Sélectionne au moins un trigger
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
    marginBottom: 24
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  gridItemWrapper: {
    width: (screenWidth - 52) / 2 // dynamic 2 columns width
  },
  gridCard: {
    height: 120,
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  gridCardSelected: {
    borderColor: '#E94560'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  checkmarkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E94560',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTexts: {
    marginTop: 10
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF'
  },
  cardSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 12
  },
  summaryCard: {
    backgroundColor: 'rgba(233,69,96,0.08)',
    borderColor: 'rgba(233,69,96,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 24
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#E94560',
    marginLeft: 8
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E94560',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF'
  },
  summaryFooterText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
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
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A',
    textAlign: 'center',
    marginTop: 12
  }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      
      {/* HEADER SPECS AND ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
            Onboarding Step 3/5
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Grille de Triggers Scientifiques — OnboardingStep3Screen
          </h2>
          <p className="text-xs text-gray-400">
            Identifiez les facteurs déclencheurs d'activité pelvienne involontaire ou de rechutes stress.
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
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - OnboardingStep3Screen.tsx</h4>
              <p className="text-[10px] text-gray-500">
                Gère l'affichage à deux colonnes réactives de la grille d'options, la multi-sélection, le filtre de badges rétractables et la validation minimum.
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

      {/* PLAYGROUND DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SIMULATOR PHONE SHELL */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          <div className="w-full max-w-[385px] bg-[#000] rounded-[48px] p-3 pt-5 pb-5 border-[6px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker element notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-10 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2 h-2 bg-[#101020] rounded-full" />
            </div>

            {/* CORE MOBILE CANVAS */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[660px]">
              
              {/* TOP 60% PROGRESS BAR */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A2E] z-30">
                <div 
                  className="h-full bg-[#E94560] transition-all duration-500 ease-out"
                  style={{ width: '60%' }}
                />
              </div>

              {/* TIMING TOP HUD */}
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
                  3 sur 5
                </span>
                <div className="w-10" />
              </div>

              {/* INNER BODY CONSOLE */}
              <div className="flex-1 flex flex-col justify-between px-5 py-4 overflow-y-auto max-h-[500px] custom-scrollbar">
                
                {/* TITLES */}
                <div className="flex flex-col text-left">
                  <h2 className="font-headline font-black text-2xl text-white leading-tight">
                    Quand est-ce que
                  </h2>
                  <h2 className="font-headline font-black text-2xl text-[#E94560] leading-tight">
                    c'est le plus difficile ?
                  </h2>
                  <p className="text-[11px] text-[#8E8E93] font-headline mt-2 leading-relaxed">
                    Sélectionne TOUT ce qui s'applique à toi. On utilisera ça pour te protéger.
                  </p>
                </div>

                {/* TWO COLUMN GRID */}
                <div className="grid grid-cols-2 gap-2.5 my-4">
                  {triggersList.map((item) => {
                    const isSelected = selectedTriggers.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggleTrigger(item.id)}
                        className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between h-[110px] transition-all cursor-pointer relative
                          ${isSelected 
                            ? 'bg-[#16213E] border-[#E94560] shadow-md' 
                            : 'bg-[#16213E]/80 border-transparent hover:bg-[#16213E]'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div className="p-1.5 bg-black/15 rounded-lg flex items-center justify-center">
                            {item.icon}
                          </div>

                          {/* Selected checkmark indicator */}
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#E94560] flex items-center justify-center animate-[scale-in_0.2s_ease-out]">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-headline font-black text-white leading-none mb-1">
                            {item.title}
                          </h4>
                          <p className="text-[9px] text-gray-400 font-headline font-medium leading-tight">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ADAPTATIVE PATTERN SUMMARY */}
                {selectedTriggers.length > 0 && (
                  <div className="p-3 bg-[#E94560]/5 border border-[#E94560]/20 rounded-xl flex flex-col gap-2 animate-[fade-in_0.2s_ease-out] mb-4">
                    <div className="flex items-center gap-1.5 text-[#E94560]">
                      <Shield className="w-4 h-4 animate-pulse" />
                      <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
                        Pattern Killer Activé
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {selectedTriggers.map((id) => {
                        const triggerItem = triggersList.find(t => t.id === id);
                        return (
                          <div 
                            key={id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTrigger(id);
                            }}
                            className="bg-[#E94560] text-white px-2 py-0.5 rounded-md text-[8px] font-headline font-bold flex items-center gap-1 cursor-pointer hover:bg-red-700 transition-colors"
                          >
                            {triggerItem?.title}
                            <X className="w-2 h-2" />
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[9px] font-headline text-gray-500 leading-normal mt-0.5">
                      On t'alertera AVANT que ces moments n'arrivent. Prépare ton protocole.
                    </p>
                  </div>
                )}

                {/* CONTINUE ACTION GATE */}
                <div 
                  className={`w-full flex flex-col items-center gap-1.5
                    ${shakeTrigger ? 'animate-[shake_0.3s_ease-in-out]' : ''}
                  `}
                >
                  <button
                    onClick={handleNext}
                    className={`w-full h-11 rounded-xl font-headline font-extrabold text-xs uppercase text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer
                      ${selectedTriggers.length > 0
                        ? 'bg-[#E94560] shadow-[#E94560]/20 active:scale-97' 
                        : 'bg-gray-800 opacity-60'
                      }
                    `}
                  >
                    CONTINUER
                    {selectedTriggers.length > 0 && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {selectedTriggers.length === 0 && (
                    <span className="text-[10px] font-headline text-gray-500 font-bold uppercase tracking-wider animate-pulse">
                      Sélectionne au moins un trigger
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
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Shield className="w-5 h-5 text-[#E94560]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Branchement Pattern Killer Engine
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Ces triggers alimentent directement le <strong className="text-[#FFD700]">Pattern Killer Engine (Spécification #1.1)</strong>. En cartographiant précisément les habitudes et moments de vulnérabilité, le système configure des alarmes silencieuses et des protocoles d'urgence personnalisés.
            </p>

            <div className="p-4 bg-[#16213E]/30 border border-gray-800 rounded-xl">
              <h5 className="text-xs font-headline font-black text-[#E94560]">CRITICITÉ DES TRIGGERS</h5>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Le soir seul (47%) et le stress professionnel (38%) sont statistiquement les déclencheurs les plus signalés par les Alphas durant leur première semaine de désintoxication/relaxation pelvienne.
              </p>
            </div>
          </AlphaCard>

          {/* SIMULATOR QUICK RE-RUN HELPER */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Award className="w-5 h-5 text-[#FFD700]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Statut de la Séquence d'Onboarding
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTriggers([]);
                  addToast('info', 'Réinitialisation complète des filtres.');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 cursor-pointer"
              >
                Tout Effacer
              </button>
              <button
                onClick={() => {
                  setSelectedTriggers(['evening_alone', 'stress', 'home_alone']);
                  addToast('success', 'Sélection recommandée appliquée !');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-headline font-bold uppercase bg-[#E94560]/20 border border-[#E94560]/40 text-[#E94560] cursor-pointer"
              >
                Sélection Cible Demo
              </button>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
