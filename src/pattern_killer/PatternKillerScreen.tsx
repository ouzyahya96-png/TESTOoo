/**
 * ALPHA MAN - Pattern Killer Screen (React Native)
 * Production-ready mobile interface code for iOS & Android
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Vibration,
  Alert,
  Platform,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CircuitObserverDiagram } from '../components/CircuitObserverDiagram';

// Dimensions for responsive UI
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Interfaces
interface PatternFactors {
  timeOfDay: number;
  dayOfWeek: number;
  sleepQuality: number;
  stressLevel: number;
  mood: number;
  streakDays: number;
  socialMediaMinutes: number;
  locationRisk: number;
}

export default function PatternKillerScreen() {
  // 1. Factors State
  const [factors, setFactors] = useState<PatternFactors>({
    timeOfDay: 21, // 9 PM
    dayOfWeek: 6,  // Saturday (high risk)
    sleepQuality: 5, // Poor sleep
    stressLevel: 8,  // High stress
    mood: 4,         // Anxious/bored
    streakDays: 7,   // Critical 7 days streak
    socialMediaMinutes: 85, // Excess screen time
    locationRisk: 0.8, // Alone at home
  });

  // 2. Engine and UI State
  const [riskScore, setRiskScore] = useState<number>(87);
  const [isCrisisMode, setIsCrisisMode] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null); // null = not in emergency protocol, 1-5 = step active
  const [stepTimer, setStepTimer] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [vitalityPoints, setVitalityPoints] = useState<number>(1420);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'coach'; text: string }>>([
    { id: '1', sender: 'coach', text: "Guerrier. Ton esprit vacille mais ta volonté est de fer. Je suis là. Que se passe-t-il ?" }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [hasResisted, setHasResisted] = useState<boolean>(false);
  const [showCrisisDiagram, setShowCrisisDiagram] = useState<boolean>(false);

  // 3. Animations refs
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerIntervalRef = useRef<any>(null);

  // 4. Calculate Risk Score dynamically (Client-side heuristic corresponding to server ML logic)
  useEffect(() => {
    // Dynamic calculate weights
    const weights = {
      timeOfDay: 0.25,
      dayOfWeek: 0.15,
      sleepQuality: 0.15,
      stressLevel: 0.20,
      mood: 0.10,
      streak: 0.05,
      socialMedia: 0.05,
      location: 0.05,
    };

    const timeRisk = (factors.timeOfDay >= 20 || factors.timeOfDay <= 4) ? 0.95 : 0.3;
    const dayRisk = (factors.dayOfWeek === 6 || factors.dayOfWeek === 7) ? 0.9 : 0.4;
    const sleepRisk = (10 - factors.sleepQuality) / 10;
    const stressRisk = factors.stressLevel / 10;
    const moodRisk = (10 - factors.mood) / 10;
    const streakRisk = [7, 14, 30].includes(factors.streakDays) ? 0.95 : factors.streakDays < 3 ? 0.8 : 0.25;
    const socialRisk = Math.min(1.0, factors.socialMediaMinutes / 120);
    const locRisk = factors.locationRisk;

    const weightedSum = (
      timeRisk * weights.timeOfDay +
      dayRisk * weights.dayOfWeek +
      sleepRisk * weights.sleepQuality +
      stressRisk * weights.stressLevel +
      moodRisk * weights.mood +
      streakRisk * weights.streak +
      socialRisk * weights.socialMedia +
      locRisk * weights.location
    );

    const score = Math.round((1 / (1 + Math.exp(-(weightedSum - 0.5) * 6))) * 100);
    setRiskScore(score);

    // If score is high (RED), trigger vibrating pulse alert
    if (score >= 61) {
      triggerPulseAnimation();
      triggerShakeAnimation();
      Vibration.vibrate([100, 200, 100]);
    }
  }, [factors]);

  // 5. Alert Animations
  const triggerShakeAnimation = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const triggerPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  };

  // 6. Emergency protocol lifecycle
  const startProtocol = () => {
    setCurrentStep(1);
    setStepTimer(60);
    setIsTimerActive(true);
  };

  useEffect(() => {
    if (isTimerActive && stepTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setStepTimer((prev) => prev - 1);
      }, 1000);
    } else if (stepTimer === 0 && isTimerActive) {
      clearInterval(timerIntervalRef.current);
      handleNextStep();
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [stepTimer, isTimerActive]);

  const handleNextStep = () => {
    if (currentStep !== null && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setStepTimer(60);
      setIsTimerActive(true);
    } else if (currentStep === 5) {
      // Completed protocol successfully!
      handleResisted();
    }
  };

  const handleResisted = () => {
    setIsTimerActive(false);
    setCurrentStep(null);
    setIsCrisisMode(false);
    setHasResisted(true);
    setVitalityPoints((v) => v + 50);
    Alert.alert(
      "⚔️ VICTOIRE !",
      "Vous avez maté le pattern ! Votre force de caractère augmente de +50 POINTS DE VITALITÉ.",
      [{ text: "DOMINER L'ESPRIT" }]
    );
  };

  const handleAbandon = () => {
    setIsTimerActive(false);
    setCurrentStep(null);
    setIsCrisisMode(false);
    setVitalityPoints((v) => v + 10);
    Alert.alert(
      "🤝 COMPATISSANCE",
      "C'est OK, guerrier. Demain est un nouveau jour de combat. +10 pts pour avoir essayé.",
      [{ text: "SE RELEVER" }]
    );
  };

  // 7. Simulated AI Coach chat
  const sendChatMessage = () => {
    if (chatInput.trim() === '') return;
    
    const userMsg = { id: Date.now().toString(), sender: 'user' as const, text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulated AI Response tailored to Alpha Man theme
    setTimeout(() => {
      const responses = [
        "Sache qu'une envie ne dure que 10 minutes maximum si tu ne la nourris pas de pensées. Ferme les yeux et respire.",
        "Rappelle-toi pourquoi tu as commencé. Qui veux-tu être dans un an? Un homme libre ou un esclave de ses impulsions?",
        "Chaque seconde de résistance crée de nouvelles connexions neuronales. Tu es en train de réécrire ton cerveau en ce moment même.",
        "Va faire tes pompes maintenant. Libère cet afflux d'énergie de façon saine !"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'coach', text: randomResponse }]);
    }, 1200);
  };

  // 8. Protocol definitions
  const protocolSteps = [
    { title: "Étape 1 : Respiration Cohérence Cardiaque 4-7-8", desc: "Inspirez par le nez (4s), retenez votre souffle (7s), expirez lentement par la bouche (8s). Calme le système nerveux instantanément." },
    { title: "Étape 2 : Activation Physique de Surcharge", desc: "Faites immédiatement 20 squats ou 10 pompes explosives pour rediriger l'afflux sanguin et l'énergie." },
    { title: "Étape 3 : Choc Thermique Cutané", desc: "Aspergez votre visage d'eau glacée ou entrez sous une douche froide pendant 1 minute complète." },
    { title: "Étape 4 : Journaling d'Engagement Strict", desc: "Rédigez ou lisez votre déclaration: 'Pourquoi je refuse d'abandonner aujourd'hui et ce que je préserve.'" },
    { title: "Étape 5 : Visualisation Alpha Futur", desc: "Fermez les yeux et visualisez l'homme fort, respecté et focalisé que vous devenez si vous passez cette barrière." }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>ALPHA MAN</Text>
        <Text style={styles.title}>PATTERN KILLER ENGINE</Text>
        <Text style={styles.subtitle}>Prédiction proactive & Protection Neurologique</Text>
      </View>

      {/* 2. Vitality points */}
      <View style={styles.vitalityCard}>
        <Text style={styles.vitalityTitle}>RÉSERVE DE VITALITÉ</Text>
        <Text style={styles.vitalityScore}>{vitalityPoints} VP</Text>
      </View>

      {/* 3. Live risk score tracker */}
      <Animated.View 
        style={[
          styles.riskCard, 
          riskScore >= 61 ? { borderColor: '#E94560', borderWidth: 2, transform: [{ translateX: shakeAnimation }] } : null
        ]}
      >
        <Text style={styles.cardHeader}>ALGORITHME DE SCORE DE RISQUE</Text>
        
        <View style={styles.scoreRow}>
          <Text style={[
            styles.scoreValue,
            riskScore <= 30 ? styles.green : riskScore <= 60 ? styles.orange : styles.red
          ]}>
            {riskScore}%
          </Text>
          <View style={styles.statusBadge}>
            <Text style={[
              styles.statusText,
              riskScore <= 30 ? styles.bgGreen : riskScore <= 60 ? styles.bgOrange : styles.bgRed
            ]}>
              {riskScore <= 30 ? 'NORMAL' : riskScore <= 60 ? 'RISQUE MODÉRÉ' : 'RECHUTE IMMINENTE'}
            </Text>
          </View>
        </View>

        <Text style={styles.riskDesc}>
          {riskScore >= 61 
            ? "⚠️ Alerte critique ! Vos facteurs accumulés indiquent un risque extrême de relapse. Activez immédiatement le protocole." 
            : "Votre état neurologique est actuellement stable. Restez vigilant."
          }
        </Text>

        {riskScore >= 61 && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={startProtocol}>
              <Text style={styles.actionBtnText}>DÉCLENCHER LE PROTOCOLE D'URGENCE (5 MIN)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.observeBtn} onPress={() => setShowCrisisDiagram(true)}>
              <Ionicons name="compass" size={16} color="#00D9A5" />
              <Text style={styles.observeBtnText}>Observer cette envie maintenant (Surfing Respiratoire)</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* 4. Trigger inputs controllers */}
      <View style={styles.factorsCard}>
        <Text style={styles.sectionTitle}>FACTEURS DE PATTERNS DE VIE</Text>
        <Text style={styles.factorsDesc}>Ajustez les curseurs pour voir l'impact en temps réel sur le réseau neuronal :</Text>

        {/* Stress slider */}
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Stress du Jour : {factors.stressLevel}/10</Text>
          <TextInput 
            style={styles.inputMock}
            placeholder="Ajuster stress (1-10)" 
            keyboardType="numeric"
            value={factors.stressLevel.toString()}
            onChangeText={(v) => setFactors(f => ({ ...f, stressLevel: Math.min(10, Math.max(1, parseInt(v) || 0)) }))}
          />
        </View>

        {/* Sleep slider */}
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Qualité du Sommeil : {factors.sleepQuality}/10</Text>
          <TextInput 
            style={styles.inputMock}
            placeholder="Ajuster sommeil (1-10)" 
            keyboardType="numeric"
            value={factors.sleepQuality.toString()}
            onChangeText={(v) => setFactors(f => ({ ...f, sleepQuality: Math.min(10, Math.max(1, parseInt(v) || 0)) }))}
          />
        </View>

        {/* Screen time slider */}
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Réseaux Sociaux : {factors.socialMediaMinutes} mins</Text>
          <TextInput 
            style={styles.inputMock}
            placeholder="Minutes d'écran" 
            keyboardType="numeric"
            value={factors.socialMediaMinutes.toString()}
            onChangeText={(v) => setFactors(f => ({ ...f, socialMediaMinutes: Math.max(0, parseInt(v) || 0) }))}
          />
        </View>
      </View>

      {/* 5. Protocol visual modal takeover mockup */}
      {currentStep !== null && (
        <View style={styles.takeoverContainer}>
          <View style={styles.takeoverHeader}>
            <Text style={styles.takeoverTitle}>🚨 PROTOCOLE DE SAUVETAGE NEURONAL 🚨</Text>
            <Text style={styles.takeoverSubtitle}>Votre cerveau vous ment. Ne cédez pas.</Text>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>{protocolSteps[currentStep - 1].title}</Text>
            <Text style={styles.stepText}>{protocolSteps[currentStep - 1].desc}</Text>
            
            {/* BIG TIMER */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerValue}>{stepTimer}s</Text>
              <Text style={styles.timerSub}>Compte à rebours de l'étape active</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.abortBtn} onPress={handleAbandon}>
                <Text style={styles.abortText}>ABANDONNER</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
                <Text style={styles.nextText}>
                  {currentStep === 5 ? "J'AI SURMONTÉ ⚔️" : "ÉTAPE SUIVANTE ➡️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 6. AI Coach chat widget */}
      <View style={styles.coachCard}>
        <Text style={styles.sectionTitle}>COACH D'URGENCE INTÉGRÉ (GEMINI AI)</Text>
        
        <ScrollView style={styles.chatBox}>
          {chatMessages.map((msg) => (
            <View key={msg.id} style={[
              styles.chatBubble,
              msg.sender === 'user' ? styles.bubbleUser : styles.bubbleCoach
            ]}>
              <Text style={styles.bubbleText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Répondez au coach..."
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendChatMessage}>
            <Text style={styles.sendText}>ENVOYER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

    {showCrisisDiagram && (
      <Modal visible={showCrisisDiagram} animationType="fade" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F1A' }}>
          <TouchableOpacity
            onPress={() => setShowCrisisDiagram(false)}
            style={{ padding: 16, alignSelf: 'flex-end' }}
          >
            <Text style={{ color: '#8E8E93', fontSize: 12 }}>Retour à la crise</Text>
          </TouchableOpacity>
          <CircuitObserverDiagram
            mode="personal"
            context="crisis"
            embedded={true}
            urgeSurfDurationSeconds={90}
            onUrgeSurfComplete={(outcome) => {
              if (outcome === 'resisted') {
                handleResisted();
                setShowCrisisDiagram(false);
              } else {
                setShowCrisisDiagram(false);
              }
            }}
            onRequestCoachChat={() => {
              setShowCrisisDiagram(false);
              Alert.alert(
                "💬 COACH D'URGENCE",
                "Utilisez la section 'Coach d'urgence intégré' en bas de l'écran pour discuter avec l'IA.",
                [{ text: "OK" }]
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    )}
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: Platform.OS === 'ios' ? 40 : 10,
  },
  brand: {
    color: '#FFD700',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vitalityCard: {
    backgroundColor: '#16213E',
    borderColor: '#FFD700',
    borderWidth: 1,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  vitalityTitle: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  vitalityScore: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  riskCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 20,
    borderColor: '#1A1A2E',
    borderWidth: 1,
    marginBottom: 20,
  },
  cardHeader: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  riskDesc: {
    color: '#8E8E93',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 15,
  },
  actionBtn: {
    backgroundColor: '#E94560',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  observeBtn: {
    backgroundColor: '#1F4068',
    borderColor: '#00D9A5',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  observeBtnText: {
    color: '#00D9A5',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  factorsCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 20,
    borderColor: '#1A1A2E',
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  factorsDesc: {
    color: '#8E8E93',
    fontSize: 11,
    marginBottom: 15,
  },
  sliderGroup: {
    marginBottom: 15,
  },
  sliderLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 8,
  },
  inputMock: {
    backgroundColor: '#0F0F1A',
    borderColor: '#1A1A2E',
    borderWidth: 1,
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
  },
  takeoverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F1A',
    zIndex: 999,
    padding: 20,
    justifyContent: 'center',
  },
  takeoverHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  takeoverTitle: {
    color: '#E94560',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  takeoverSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 8,
  },
  stepCard: {
    backgroundColor: '#16213E',
    borderColor: '#E94560',
    borderWidth: 1,
    borderRadius: 24,
    padding: 25,
    shadowColor: '#E94560',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  stepText: {
    color: '#8E8E93',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 25,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerValue: {
    color: '#FFD700',
    fontSize: 60,
    fontWeight: 'bold',
  },
  timerSub: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  abortBtn: {
    borderColor: '#FF2D55',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
  },
  abortText: {
    color: '#FF2D55',
    fontSize: 11,
    fontWeight: 'bold',
  },
  nextBtn: {
    backgroundColor: '#00D9A5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
  },
  nextText: {
    color: '#0F0F1A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  coachCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 20,
    borderColor: '#1A1A2E',
    borderWidth: 1,
    marginBottom: 30,
  },
  chatBox: {
    height: 180,
    borderColor: '#1A1A2E',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#0F0F1A',
    padding: 10,
    marginBottom: 10,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '85%',
  },
  bubbleUser: {
    backgroundColor: '#E94560',
    alignSelf: 'flex-end',
  },
  bubbleCoach: {
    backgroundColor: '#1A1A2E',
    alignSelf: 'flex-start',
    borderLeftColor: '#FFD700',
    borderLeftWidth: 2,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    borderColor: '#1A1A2E',
    borderWidth: 1,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 12,
  },
  sendBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sendText: {
    color: '#0F0F1A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  green: { color: '#00D9A5' },
  orange: { color: '#FFD700' },
  red: { color: '#E94560' },
  bgGreen: { backgroundColor: '#00D9A5/20', color: '#00D9A5' },
  bgOrange: { backgroundColor: '#FFD700/20', color: '#FFD700' },
  bgRed: { backgroundColor: '#E94560/20', color: '#E94560' }
});
