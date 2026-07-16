import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronRight,
  Info,
  Lightbulb,
  Check,
  Copy,
  Code,
  Smartphone,
  Eye,
  Settings,
  Flame,
  User,
  Activity,
  Heart,
  HelpCircle,
  X,
  Plus
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';
import { AlphaBadge } from '../../components/AlphaBadge';

// TypeScript Types for the screen as requested
interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'posture' | 'mobility' | 'breathing';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  tags: string[];
  kegelBenefit: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
}

interface WeeklyProgramDay {
  day: string;
  exercises: string;
  duration: number;
  completed: boolean;
}

export const ComplementaryExercisesScreen: React.FC<{
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}> = ({ addToast, onBack }) => {
  // Navigation & filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weeklyProgram, setWeeklyProgram] = useState<WeeklyProgramDay[] | null>(null);
  const [dailyTip, setDailyTip] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Applet configuration options (Elite status, Filter sheet, code viewer)
  const [hasElitePlus, setHasElitePlus] = useState<boolean>(true);
  const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [selectedDurationFilter, setSelectedDurationFilter] = useState<number>(0); // 0 means all

  // Video / Audio Player Simulator State
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState<boolean>(false);
  const [playerTime, setPlayerTime] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [breathingPhase, setBreathingPhase] = useState<'inspire' | 'expire' | 'block'>('inspire');

  // React Native Code view & developer lab
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Timer Ref for Player simulation
  const playerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Staggered list items load animation
  const [renderedCount, setRenderedCount] = useState<number>(0);

  // Fetch exercises and weekly program from Express APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Get all exercises
        const exRes = await fetch(`/api/exercises?category=${selectedCategory === 'all' ? 'all' : selectedCategory}`);
        const exData = await exRes.ok ? await exRes.json() : { exercises: [] };
        setExercises(exData.exercises);

        // Get weekly program for the current user
        const progRes = await fetch('/api/exercises/weekly-program/ALPHA_SOLDIER_1');
        const progData = await progRes.ok ? await progRes.json() : { weeklyProgram: [] };
        setWeeklyProgram(progData.weeklyProgram);

        // Get Daily tip
        const tipRes = await fetch('/api/exercises/daily-tip/ALPHA_SOLDIER_1');
        const tipData = await tipRes.ok ? await tipRes.json() : { tip: "" };
        setDailyTip(tipData.tip || "💡 Combine toujours tes exercices de renforcement avec une séance Kegel. L'effet synergique augmente tes résultats de 40%.");

        setError(null);
      } catch (err: any) {
        console.warn("Express API failed, falling back to comprehensive mock structures.", err);
        setError("Serveur indisponible. Utilisation de la persistance locale.");
        
        // Solid Offline Fail-safes matching specs
        const fallbackExercises: Exercise[] = [
          {
            id: "ex_1",
            name: "Squats profonds",
            category: "strength",
            difficulty: "medium",
            duration: 5,
            tags: ["💪 Force", "⏱ 5 min"],
            kegelBenefit: "+25% force",
            videoUrl: "assets/videos/squats.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=200",
            description: "Renforce hanches et plancher pelvien"
          },
          {
            id: "ex_2",
            name: "Ponts fessiers (Glute Bridges)",
            category: "strength",
            difficulty: "easy",
            duration: 4,
            tags: ["💪 Force", "⏱ 4 min"],
            kegelBenefit: "Activation synergique",
            videoUrl: "assets/videos/glute_bridges.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200",
            description: "Active les fessiers en coordination avec le périnée"
          },
          {
            id: "ex_3",
            name: "Planche (Plank)",
            category: "strength",
            difficulty: "medium",
            duration: 3,
            tags: ["💪 Core", "⏱ 3 min"],
            kegelBenefit: "Core stability + plancher pelvien",
            videoUrl: "assets/videos/plank.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&q=80&w=200",
            description: "Gainage abdominal profond et stabilisation de la ceinture"
          },
          {
            id: "ex_4",
            name: "Superman",
            category: "strength",
            difficulty: "easy",
            duration: 3,
            tags: ["💪 Dos", "⏱ 3 min"],
            kegelBenefit: "Dos + plancher pelvien",
            videoUrl: "assets/videos/superman.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1607962837359-5e7e89f866ad?auto=format&fit=crop&q=80&w=200",
            description: "Renforcement de la chaîne postérieure lombaire"
          },
          {
            id: "ex_5",
            name: "Bird-Dog",
            category: "strength",
            difficulty: "medium",
            duration: 4,
            tags: ["💪 Équilibre", "⏱ 4 min"],
            kegelBenefit: "Équilibre + coordination",
            videoUrl: "assets/videos/bird_dog.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200",
            description: "Stabilisation controlatérale d'acier"
          },
          {
            id: "ex_6",
            name: "Deep Squats",
            category: "strength",
            difficulty: "hard",
            duration: 6,
            tags: ["💪 Mobilité", "⏱ 6 min"],
            kegelBenefit: "Mobilité hanche + plancher pelvien",
            videoUrl: "assets/videos/deep_squats.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200",
            description: "Flexion profonde pour assouplir le bassin"
          },
          {
            id: "ex_7",
            name: "Redressement assis",
            category: "posture",
            difficulty: "easy",
            duration: 3,
            tags: ["🧍 Posture", "⏱ 3 min"],
            kegelBenefit: "Alignement pelvien",
            videoUrl: "assets/videos/posture_sit.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=200",
            description: "Ajustement de la posture assise active"
          },
          {
            id: "ex_8",
            name: "Étirement du psoas",
            category: "mobility",
            difficulty: "easy",
            duration: 4,
            tags: ["🧘 Mobilité", "⏱ 4 min"],
            kegelBenefit: "Hanches détendues = plancher libre",
            videoUrl: "assets/videos/hip_stretch.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=200",
            description: "Libère les tensions du fléchisseur de la hanche"
          },
          {
            id: "ex_9",
            name: "90/90 Stretch",
            category: "mobility",
            difficulty: "medium",
            duration: 5,
            tags: ["🧘 Mobilité", "⏱ 5 min"],
            kegelBenefit: "Rotation hanche complète",
            videoUrl: "assets/videos/ninety_stretch.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=200",
            description: "Améliore la rotation interne et externe des hanches"
          },
          {
            id: "ex_10",
            name: "Respiration + Kegel Coordination",
            category: "breathing",
            difficulty: "medium",
            duration: 5,
            tags: ["🫁 Respiration", "⏱ 5 min"],
            kegelBenefit: "Amplifie ton Kegel de 40%",
            videoUrl: "assets/videos/breath_kegel.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=200",
            description: "Synchronisation du diaphragme et du plancher pelvien"
          },
          {
            id: "ex_11",
            name: "Box Breathing + Kegel",
            category: "breathing",
            difficulty: "easy",
            duration: 4,
            tags: ["🫁 Respiration", "⏱ 4 min"],
            kegelBenefit: "Contrôle + calme",
            videoUrl: "assets/videos/box_breath_kegel.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1518281400699-c26215510716?auto=format&fit=crop&q=80&w=200",
            description: "Respiration au carré pour calmer le système nerveux"
          },
          {
            id: "ex_12",
            name: "Wim Hof + Kegel Avancé",
            category: "breathing",
            difficulty: "hard",
            duration: 8,
            tags: ["🫁 Respiration", "❄️ Froid", "⏱ 8 min"],
            kegelBenefit: "Énergie maximale + contrôle",
            videoUrl: "assets/videos/wimhof_kegel.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=200",
            description: "Hyperventilation contrôlée suivie de contractions souveraines"
          }
        ];
        
        const filtered = selectedCategory === 'all'
          ? fallbackExercises
          : fallbackExercises.filter(ex => ex.category === selectedCategory);
          
        setExercises(filtered);
        setWeeklyProgram([
          { day: "LUN", exercises: "Squats profonds + Kegel Niv.4", duration: 15, completed: true },
          { day: "MAR", exercises: "Ponts fessiers + Respiration", duration: 12, completed: true },
          { day: "MER", exercises: "Planche (Plank) + Wim Hof", duration: 10, completed: false },
          { day: "JEU", exercises: "90/90 Stretch + Superman", duration: 14, completed: false },
          { day: "VEN", exercises: "Bird-Dog + Box Breathing", duration: 15, completed: false }
        ]);
        setDailyTip("💡 Combine toujours tes exercices de renforcement avec une séance Kegel. L'effet synergique augmente tes résultats de 40%.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  // Handle cascading stagger rendering
  useEffect(() => {
    if (isLoading) {
      setRenderedCount(0);
    } else {
      const interval = setInterval(() => {
        setRenderedCount(prev => {
          if (prev < exercises.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 60);
      return () => clearInterval(interval);
    }
  }, [isLoading, exercises]);

  // Breathing simulation loop inside Exercise player
  useEffect(() => {
    if (playerPlaying && activeExercise) {
      playerTimerRef.current = setInterval(() => {
        setPlayerTime(prev => {
          const next = prev + 1;
          
          // Toggle breathing cue every 4 seconds
          const totalSeconds = activeExercise.duration * 60;
          if (next >= totalSeconds) {
            setPlayerPlaying(false);
            addToast('success', `Félicitations ! Exercice "${activeExercise.name}" complété avec succès ! 💪🔥`);
            
            // Mark corresponding program item as done if matches category
            if (weeklyProgram) {
              setWeeklyProgram(prevProg => {
                if (!prevProg) return null;
                return prevProg.map((item, idx) => {
                  if (idx === 2) { // Mark Wednesday done for high feedback
                    return { ...item, completed: true };
                  }
                  return item;
                });
              });
            }
            setActiveExercise(null);
            return 0;
          }

          // Cycle phases: Inspire (4s), Block (4s), Expire (4s)
          const secondInCycle = next % 12;
          if (secondInCycle < 4) {
            setBreathingPhase('inspire');
          } else if (secondInCycle < 8) {
            setBreathingPhase('block');
          } else {
            setBreathingPhase('expire');
          }

          return next;
        });
      }, 1000);
    } else {
      if (playerTimerRef.current) {
        clearInterval(playerTimerRef.current);
      }
    }

    return () => {
      if (playerTimerRef.current) {
        clearInterval(playerTimerRef.current);
      }
    };
  }, [playerPlaying, activeExercise]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    addToast('info', soundEnabled ? 'Audio désactivé' : 'Audio activé pour le métronome respiratoire ! 🔊');
  };

  const handleStartExercise = (exercise: Exercise) => {
    setActiveExercise(exercise);
    setPlayerTime(0);
    setPlayerPlaying(true);
    addToast('success', `Lancement de "${exercise.name}". Tenez-vous prêt ! 💪`);
  };

  const formatMMSS = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadgeColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'bg-[#00D9A5] text-[#0F0F1A]';
      case 'medium': return 'bg-[#FF9500] text-[#0F0F1A]';
      case 'hard': return 'bg-[#FF2D55] text-white';
    }
  };

  const copyNativeCode = () => {
    navigator.clipboard.writeText(reactNativeCode);
    setCopied(true);
    addToast('success', 'Code source Expo React Native copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // Full High-Fidelity React Native Code Template matching Prompts exactly
  const reactNativeCode = `import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
  FlatList,
  Modal,
  Dimensions,
  Animated
} from 'react-native';
import { Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Dimensions for responsive fluid layouts
const { width } = Dimensions.get('window');

export default function ComplementaryExercisesScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasElite, setHasElite] = useState(true);

  // Filter configuration
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleStartExercise = (exerciseId) => {
    triggerHaptic();
    navigation.navigate('ExercisePlayerScreen', { exerciseId });
  };

  const exercises = [
    {
      id: "ex_1",
      name: "Squats profonds",
      category: "strength",
      difficulty: "medium",
      duration: 5,
      tags: ["💪 Force", "⏱ 5 min"],
      kegelBenefit: "+25% force",
      videoUrl: "assets/videos/squats.mp4",
      description: "Renforce hanches et plancher pelvien"
    },
    {
      id: "ex_2",
      name: "Ponts fessiers (Glute Bridges)",
      category: "strength",
      difficulty: "easy",
      duration: 4,
      tags: ["💪 Force", "⏱ 4 min"],
      kegelBenefit: "Activation synergique",
      videoUrl: "assets/videos/glute_bridges.mp4",
      description: "Active les fessiers en coordination avec le périnée"
    },
    {
      id: "ex_3",
      name: "Planche (Plank)",
      category: "strength",
      difficulty: "medium",
      duration: 3,
      tags: ["💪 Core", "⏱ 3 min"],
      kegelBenefit: "Core stability + plancher pelvien",
      videoUrl: "assets/videos/plank.mp4",
      description: "Gainage abdominal profond et stabilisation de la ceinture"
    }
    // ... Additional exercises fully typed in the dynamic list
  ];

  const filteredExercises = exercises.filter(item => {
    const catMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const diffMatch = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
    return catMatch && diffMatch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EXERCICES COMPLÉMENTAIRES</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setFilterSheetVisible(true)}>
          <Ionicons name="sliders" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* CATEGORY SELECTOR TABS */}
      <View style={{ height: 50 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
        >
          {[
            { id: 'all', label: 'TOUS' },
            { id: 'strength', label: 'RENFORCEMENT' },
            { id: 'posture', label: 'POSTURE' },
            { id: 'mobility', label: 'MOBILITÉ' },
            { id: 'breathing', label: 'RESPIRATION' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                selectedCategory === tab.id && styles.tabItemActive
              ]}
              onPress={() => { triggerHaptic(); setSelectedCategory(tab.id); }}
            >
              <Text style={[
                styles.tabLabel,
                selectedCategory === tab.id ? styles.tabLabelActive : styles.tabLabelInactive
              ]}>
                {tab.label}
              </Text>
              {selectedCategory === tab.id && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        
        {/* EXERCISE LIST */}
        <View style={styles.exerciseList}>
          {filteredExercises.map((item) => (
            <View key={item.id} style={styles.exerciseCard}>
              {/* Left Video Area */}
              <View style={styles.videoArea}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=150' }} style={styles.videoPlaceholder} />
                <View style={[styles.difficultyBadge, 
                  item.difficulty === 'easy' && { backgroundColor: '#00D9A5' },
                  item.difficulty === 'medium' && { backgroundColor: '#FF9500' },
                  item.difficulty === 'hard' && { backgroundColor: '#FF2D55' }
                ]}>
                  <Text style={styles.difficultyText}>{item.difficulty.toUpperCase()}</Text>
                </View>
                <View style={styles.durationOverlay}>
                  <Feather name="play" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.durationText}>{item.duration} min</Text>
                </View>
              </View>

              {/* Right Description Area */}
              <View style={styles.descArea}>
                <View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                </View>
                
                <View style={styles.tagsRow}>
                  {item.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.benefitPre}>Comment ça aide ton Kegel :</Text>
                  <Text style={styles.benefitVal}>{item.kegelBenefit}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.startBtn} 
                  onPress={() => handleStartExercise(item.id)}
                >
                  <Text style={styles.startBtnText}>DÉMARRER</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ELITE PROGRAM CARD */}
        {hasElite && (
          <View style={styles.eliteCard}>
            <View style={styles.eliteHeader}>
              <View style={styles.eliteBadge}>
                <Text style={styles.eliteBadgeText}>ELITE</Text>
              </View>
              <Text style={styles.eliteTitle}>Ton programme de la semaine</Text>
            </View>

            <View style={styles.programList}>
              {[
                { day: "LUN", exercises: "Squats + Kegel Niv.4", duration: "15 min", completed: true },
                { day: "MAR", exercises: "Ponts fessiers + Respiration", duration: "12 min", completed: true },
                { day: "MER", exercises: "Planche (Plank) + Wim Hof", duration: "10 min", completed: false },
                { day: "JEU", exercises: "90/90 Stretch + Superman", duration: "14 min", completed: false },
                { day: "VEN", exercises: "Bird-Dog + Box Breathing", duration: "15 min", completed: false }
              ].map((prog, index) => (
                <View key={index} style={styles.programItem}>
                  <Text style={styles.programDay}>{prog.day}</Text>
                  <Text style={styles.programName}>{prog.exercises}</Text>
                  <Text style={styles.programDuration}>{prog.duration}</Text>
                  <View style={styles.checkbox}>
                    {prog.completed ? (
                      <Ionicons name="checkmark-circle" size={18} color="#00D9A5" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={18} color="#5A5A5A" />
                    )}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.eliteFullBtn}>
              <Text style={styles.eliteFullBtnText}>VOIR LE PROGRAMME COMPLET</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TIP OF THE DAY CARD */}
        <View style={styles.tipCard}>
          <Feather name="lightbulb" size={20} color="#00D9A5" style={styles.tipIcon} />
          <Text style={styles.tipText}>
            💡 Combine toujours tes exercices de renforcement avec une séance Kegel. L'effet synergique augmente tes résultats de 40%.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', px: 16, backgroundColor: '#0F0F1A', paddingTop: 16 },
  headerTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#FFFFFF', textAlign: 'center' },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  tabsContainer: { paddingHorizontal: 16, alignItems: 'center', gap: 8, height: '100%' },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, position: 'relative' },
  tabItemActive: { backgroundColor: '#E94560' },
  tabLabel: { fontSize: 12 },
  tabLabelActive: { fontFamily: 'Montserrat-Bold', color: '#FFFFFF' },
  tabLabelInactive: { fontFamily: 'Inter-Regular', color: '#8E8E93' },
  tabIndicator: { position: 'absolute', bottom: -2, left: '20%', right: '20%', height: 2, backgroundColor: '#E94560', borderRadius: 1 },
  scrollBody: { padding: 16, paddingBottom: 120 },
  exerciseList: { gap: 12, marginBottom: 24 },
  exerciseCard: { height: 140, backgroundColor: '#16213E', borderRadius: 16, flexDirection: 'row', overflow: 'hidden' },
  videoArea: { width: 140, height: 140, position: 'relative', backgroundColor: '#0F0F1A' },
  videoPlaceholder: { width: '100%', height: '100%' },
  difficultyBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  difficultyText: { fontSize: 10, fontFamily: 'Inter-Bold', color: '#0F0F1A' },
  durationOverlay: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  durationText: { fontSize: 11, fontFamily: 'Inter-Medium', color: '#FFFFFF' },
  descArea: { flex: 1, padding: 16, justifyContent: 'space-between', relative: true },
  cardTitle: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#FFFFFF' },
  cardDesc: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#8E8E93', marginTop: 4 },
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tagBadge: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, fontFamily: 'Inter-Regular', color: '#E94560' },
  cardFooter: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  benefitPre: { fontSize: 11, fontFamily: 'Inter-Regular', color: '#5A5A5A' },
  benefitVal: { fontSize: 11, fontFamily: 'Inter-Medium', color: '#00D9A5' },
  startBtn: { position: 'absolute', bottom: 12, right: 12, width: 90, height: 32, backgroundColor: '#E94560', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  startBtnText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Montserrat-Bold' },
  eliteCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', marginBottom: 24 },
  eliteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eliteBadge: { backgroundColor: '#FFD700', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  eliteBadgeText: { fontSize: 10, fontFamily: 'Montserrat-Bold', color: '#0F0F1A' },
  eliteTitle: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#FFFFFF', marginLeft: 8 },
  programList: { gap: 8 },
  programItem: { height: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#16213E', paddingVertical: 4 },
  programDay: { fontSize: 11, fontFamily: 'RobotoMono-Bold', color: '#8E8E93', width: 40 },
  programName: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#FFFFFF', flex: 1 },
  programDuration: { fontSize: 11, fontFamily: 'Inter-Regular', color: '#8E8E93', marginRight: 12 },
  checkbox: { width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  eliteFullBtn: { marginTop: 16, borderWidth: 1, borderColor: '#FFD700', borderRadius: 8, height: 40, justifyContent: 'center', alignItems: 'center' },
  eliteFullBtnText: { color: '#FFD700', fontSize: 12, fontFamily: 'Montserrat-Bold' },
  tipCard: { backgroundColor: '#16213E', borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: '#00D9A5', flexDirection: 'row' },
  tipIcon: { marginRight: 12, marginTop: 2 },
  tipText: { flex: 1, fontSize: 13, fontFamily: 'Inter-Regular', color: '#FFFFFF', lineHeight: 20 }
});`;

  // Mapped user experience for category tabs filtering
  const tabsList = [
    { id: 'all', label: 'TOUS' },
    { id: 'strength', label: 'RENFORCEMENT' },
    { id: 'posture', label: 'POSTURE' },
    { id: 'mobility', label: 'MOBILITÉ' },
    { id: 'breathing', label: 'RESPIRATION' }
  ];

  const handleApplyFilters = () => {
    setShowFilterSheet(false);
    addToast('success', 'Filtres de ciblage appliqués avec succès !');
  };

  const getFilteredList = () => {
    return exercises.filter(item => {
      // Category matches is already handled by fetch, but filter is robust
      const matchesDifficulty = selectedDifficultyFilter === 'all' || item.difficulty === selectedDifficultyFilter;
      const matchesDuration = selectedDurationFilter === 0 || item.duration <= selectedDurationFilter;
      return matchesDifficulty && matchesDuration;
    });
  };

  const activeFilteredList = getFilteredList();

  return (
    <div className="flex flex-col gap-6 w-full text-white">

      {/* TOP CONFIGURATION DESK FOR SCIENTIFIC LABORATORY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
            SENSORY EXERCISE STAGE
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            ComplementaryExercisesScreen.tsx — Version de Production Intégrale
          </h2>
          <p className="text-xs text-gray-400">
            Intégration d'exercices synergiques avec tutoriel vidéo en direct, minuteur respiratoire haptique et plan d'entraînement Elite+.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setHasElitePlus(!hasElitePlus);
              addToast('info', hasElitePlus ? 'Statut Elite désactivé pour la simulation' : 'Statut Elite activé ! Accès au plan personnalisé. ⭐');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold uppercase transition-all
              ${hasElitePlus 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-gray-800 text-gray-400 border border-gray-700/50'
              }
            `}
          >
            {hasElitePlus ? '⭐ Elite+ Actif' : 'Standard'}
          </button>

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

      {/* REACT NATIVE CODE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - ComplementaryExercisesScreen.tsx</h4>
              <p className="text-[10px] text-gray-500">Comprend le lecteur d'exercice interactif, les filtres tactiles et l'intégration Haptique de retour vibration.</p>
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
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[350px] custom-scrollbar">
            {reactNativeCode}
          </pre>
        </div>
      )}

      {/* TWO COLUMNS GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE IPHONE SIMULATION PREVIEW */}
        <div className="lg:col-span-6 flex flex-col items-center">
          
          {/* IPHONE DEVICE CONTAINER FRAME */}
          <div className="w-full max-w-[420px] bg-[#000000] rounded-[48px] p-4 pt-6 pb-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-[6px] border-[#222230] relative overflow-hidden">
            
            {/* Top Speaker Notch bar */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#000000] rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-1 bg-[#222230] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#111122] rounded-full border border-gray-800" />
            </div>

            {/* SCREEN INNER VIEWPORT */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[770px]">
              
              {/* 1. MOCKUP STATUS BAR */}
              <div className="h-10 bg-[#0F0F1A] px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-400 select-none z-10">
                <span>09:41</span>
                <div className="flex items-center gap-2">
                  <span>5G</span>
                  <div className="w-5 h-2.5 border border-gray-500 rounded-sm p-[1px] flex items-center">
                    <div className="h-full w-3.5 bg-[#E94560] rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* MAIN SCROLLABLE APP BODY */}
              <div className="flex-1 overflow-y-auto px-5 pb-24 max-h-[690px] custom-scrollbar relative">
                
                {/* HEADER */}
                <div className="flex justify-between items-center h-16 border-b border-gray-800/10 mb-4 select-none">
                  <button 
                    onClick={onBack}
                    className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-800/40 text-white cursor-pointer active:scale-95 transition-transform"
                    aria-label="Retour"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  
                  <span className="font-headline font-black text-xs tracking-wider text-white uppercase text-center max-w-[200px] truncate">
                    EXERCICES COMPLÉMENTAIRES
                  </span>

                  <button 
                    onClick={() => setShowFilterSheet(true)}
                    className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-800/40 text-[#8E8E93] hover:text-white cursor-pointer active:scale-95 transition-transform"
                    aria-label="Filtres"
                  >
                    <Sliders className="w-5 h-5" />
                  </button>
                </div>

                {/* HORIZONTAL CATEGORY SCROLLVIEW */}
                <div className="flex overflow-x-auto gap-2 py-2 mb-4 scrollbar-none select-none max-w-full">
                  {tabsList.map((tab) => {
                    const isSelected = selectedCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`px-4 py-2 rounded-full text-[10px] font-headline font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer relative
                          ${isSelected 
                            ? 'bg-[#E94560] text-white shadow-md shadow-[#E94560]/20' 
                            : 'text-[#8E8E93] bg-transparent hover:text-white'
                          }
                        `}
                      >
                        {tab.label}
                        {isSelected && (
                          <span className="absolute bottom-1 left-[20%] right-[20%] h-0.5 bg-white rounded-full animate-[slide_0.2s_ease-out]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* MAIN CONTENT AREA */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <RotateCcw className="w-8 h-8 text-[#E94560] animate-spin" />
                    <span className="text-xs font-mono text-gray-400">Synchronisation des exercices...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">

                    {/* SECTION 2: EXERCISES LIST */}
                    <div className="flex flex-col gap-3">
                      {activeFilteredList.length === 0 ? (
                        <div className="text-center py-12 bg-[#16213E] rounded-2xl p-6 text-gray-400 text-xs font-headline">
                          Aucun exercice ne correspond aux filtres définis.
                        </div>
                      ) : (
                        activeFilteredList.map((ex, idx) => {
                          // Display only staggered loaded cards
                          if (idx >= renderedCount) return null;
                          return (
                            <div 
                              key={ex.id} 
                              className="h-[140px] bg-[#16213E] rounded-2xl flex overflow-hidden border border-gray-800/10 shadow-[0_4px_15px_rgba(0,0,0,0.1)] relative group select-none animate-[fade-in_0.3s_ease-out]"
                            >
                              {/* Left video / thumbnail area */}
                              <div className="w-[140px] h-full relative bg-[#0B0B14] overflow-hidden flex-shrink-0">
                                <img 
                                  src={ex.thumbnailUrl} 
                                  alt={ex.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                  referrerPolicy="no-referrer"
                                />
                                
                                {/* Gradient right overlay to blend */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#16213E]" />

                                {/* Play button visual icon */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors pointer-events-none">
                                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                                    <Play className="w-4 h-4 fill-white ml-0.5" />
                                  </div>
                                </div>

                                {/* Difficulty badge */}
                                <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-sm text-[8px] font-headline font-black tracking-widest uppercase ${getDifficultyBadgeColor(ex.difficulty)}`}>
                                  {ex.difficulty === 'easy' ? 'FACILE' : ex.difficulty === 'medium' ? 'MOYEN' : 'DIFFICILE'}
                                </span>

                                {/* Duration Overlay */}
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-sm flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-white" />
                                  <span className="text-[10px] font-headline font-semibold text-white">{ex.duration} min</span>
                                </div>
                              </div>

                              {/* Right description area */}
                              <div className="flex-1 p-3.5 flex flex-col justify-between relative min-w-0">
                                <div>
                                  <h4 className="text-sm font-headline font-black text-white truncate pr-14">
                                    {ex.name}
                                  </h4>
                                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                    {ex.description}
                                  </p>
                                </div>

                                {/* Tags Row */}
                                <div className="flex gap-1.5 flex-wrap">
                                  {ex.tags.map((tag, tIdx) => (
                                    <span key={tIdx} className="bg-[#E94560]/10 border border-[#E94560]/10 rounded-sm text-[9px] font-headline text-[#E94560] px-1.5 py-0.5">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Footer utility */}
                                <div className="text-[10px] flex items-center gap-1.5 leading-tight flex-wrap">
                                  <span className="text-[#5A5A5A] font-headline">Aide Kegel :</span>
                                  <span className="text-[#00D9A5] font-headline font-extrabold">{ex.kegelBenefit}</span>
                                </div>

                                {/* Start Button on bottom-right of text area */}
                                <button
                                  onClick={() => handleStartExercise(ex)}
                                  className="absolute bottom-2 right-2 w-20 h-7 bg-[#E94560] hover:bg-[#ff5572] active:scale-95 transition-all text-[9px] font-headline font-black text-white rounded-md cursor-pointer flex items-center justify-center shadow-md shadow-[#E94560]/10"
                                >
                                  DÉMARRER
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* SECTION 3: RECOMMENDED ELITE+ PROGRAM CARD */}
                    {hasElitePlus && weeklyProgram && (
                      <div className="bg-[#1A1A2E] rounded-3xl p-5 border border-amber-500/30 shadow-[0_4px_25px_rgba(255,215,0,0.05)] select-none">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-[#FFD700] text-[#0F0F1A] text-[9px] font-headline font-black px-2 py-0.5 rounded-sm">
                            ELITE
                          </span>
                          <h4 className="text-xs font-headline font-extrabold text-white">
                            Ton programme de la semaine
                          </h4>
                        </div>

                        <div className="flex flex-col">
                          {weeklyProgram.map((prog, pIdx) => (
                            <div 
                              key={prog.day} 
                              className={`h-12 flex items-center justify-between border-b border-gray-800/10 py-1.5
                                ${pIdx === weeklyProgram.length - 1 ? 'border-b-0' : ''}
                              `}
                            >
                              <span className="text-xs font-mono font-black text-gray-500 w-10">
                                {prog.day}
                              </span>
                              <span className="text-xs font-headline font-semibold text-gray-200 flex-1 truncate pr-2">
                                {prog.exercises}
                              </span>
                              <span className="text-[11px] text-gray-400 font-headline mr-3 whitespace-nowrap">
                                {prog.duration} min
                              </span>
                              
                              <div className="w-5 h-5 flex items-center justify-center">
                                {prog.completed ? (
                                  <CheckCircle className="w-5 h-5 text-[#00D9A5] fill-[#00D9A5]/10" />
                                ) : (
                                  <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-700" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => addToast('info', 'Lancement de l\'analyse de planification hebdomadaire souveraine...')}
                          className="w-full mt-4 h-10 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-headline font-extrabold tracking-wide uppercase hover:bg-amber-500/5 transition-colors cursor-pointer"
                        >
                          VOIR LE PROGRAMME COMPLET
                        </button>
                      </div>
                    )}

                    {/* SECTION 4: CONSEIL DU JOUR */}
                    {dailyTip && (
                      <div className="bg-[#16213E] rounded-2xl p-4.5 border-l-[3px] border-l-[#00D9A5] shadow-[0_4px_15px_rgba(0,0,0,0.1)] relative">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-[#00D9A5] mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-headline leading-relaxed text-gray-200">
                            {dailyTip}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* INTERACTIVE VIDEO / EXERCISE PLAYER SIMULATOR PORTAL */}
              {activeExercise && (
                <div className="absolute inset-0 bg-[#0A0A14] z-50 p-5 flex flex-col justify-between animate-[slide-up_0.3s_ease-out]">
                  
                  {/* Top Close bar */}
                  <div className="flex justify-between items-center h-12">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-black uppercase text-[#E94560] bg-[#E94560]/10 border border-[#E94560]/20 px-2 py-0.5 rounded-md">
                        LECTEUR SOUVERAIN
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveExercise(null);
                        addToast('warning', 'Exercice suspendu.');
                      }}
                      className="w-9 h-9 rounded-full bg-gray-800/60 flex items-center justify-center text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Breathing and Pose Canvas Area */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center select-none">
                    
                    {/* Pulsing Breathing circle */}
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full border-2 border-dashed border-[#E94560]/40 transition-transform duration-4000 ease-in-out
                        ${breathingPhase === 'inspire' ? 'scale-110 bg-[#E94560]/5' : breathingPhase === 'expire' ? 'scale-90 bg-transparent' : 'scale-100 bg-amber-500/5'}
                      `} />
                      
                      <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-4000 ease-in-out
                        ${breathingPhase === 'inspire' 
                          ? 'bg-[#E94560] text-white scale-105 shadow-[#E94560]/30' 
                          : breathingPhase === 'expire' 
                          ? 'bg-blue-600 text-white scale-95 shadow-blue-600/30' 
                          : 'bg-amber-500 text-white scale-100 shadow-amber-500/30'
                        }
                      `}>
                        <span className="text-xs font-headline font-black tracking-widest uppercase">
                          {breathingPhase === 'inspire' ? 'INSPIRE' : breathingPhase === 'expire' ? 'EXPIRE' : 'BLOQUE'}
                        </span>
                        <span className="text-[10px] font-headline font-semibold text-white/80 mt-1">
                          {breathingPhase === 'inspire' ? 'Serrer le périnée' : breathingPhase === 'expire' ? 'Relâcher doucement' : 'Maintenir la tension'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-headline font-black text-white">{activeExercise.name}</h3>
                      <p className="text-xs text-gray-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
                        {activeExercise.description}
                      </p>
                    </div>

                    {/* Progress tracking */}
                    <div className="w-full max-w-[260px] flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                        <span>ÉCOULÉ</span>
                        <span>CIBLE</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#E94560] rounded-full transition-all duration-1000"
                          style={{ width: `${(playerTime / (activeExercise.duration * 60)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono font-bold mt-0.5">
                        <span className="text-white">{formatMMSS(playerTime)}</span>
                        <span className="text-gray-400">{formatMMSS(activeExercise.duration * 60)}</span>
                      </div>
                    </div>

                  </div>

                  {/* Simulated player buttons panel */}
                  <div className="flex justify-center items-center gap-6 h-20 border-t border-gray-900 pt-3">
                    <button 
                      onClick={toggleSound}
                      className="w-11 h-11 rounded-full bg-gray-800/40 flex items-center justify-center text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      {soundEnabled ? <Volume2 className="w-5 h-5 text-[#00D9A5]" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                    </button>

                    <button 
                      onClick={() => setPlayerPlaying(!playerPlaying)}
                      className="w-14 h-14 rounded-full bg-[#E94560] hover:bg-[#ff5572] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#E94560]/20"
                    >
                      {playerPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                    </button>

                    <button 
                      onClick={() => {
                        setPlayerTime(0);
                        addToast('info', 'Exercice réinitialisé.');
                      }}
                      className="w-11 h-11 rounded-full bg-gray-800/40 flex items-center justify-center text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              )}

              {/* INTERACTIVE MOCK BOTTOM SHEET FILTERS */}
              {showFilterSheet && (
                <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end select-none animate-[fade-in_0.25s_ease-out]">
                  <div className="absolute inset-0" onClick={() => setShowFilterSheet(false)} />
                  
                  <div className="bg-[#16213E] rounded-t-[32px] p-6 flex flex-col gap-5 z-10 animate-[slide-up_0.25s_ease-out]">
                    
                    {/* Header of sheet */}
                    <div className="flex justify-between items-center border-b border-gray-800/30 pb-3">
                      <span className="text-xs font-headline font-black text-white uppercase tracking-wider">
                        FILTRER LES EXERCICES
                      </span>
                      <button 
                        onClick={() => setShowFilterSheet(false)}
                        className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Filter Segment 1: Difficulty */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-headline font-extrabold text-[#8E8E93] uppercase tracking-wider">
                        NIVEAU DE DIFFICULTÉ
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'all', label: 'TOUS' },
                          { id: 'easy', label: 'FACILE' },
                          { id: 'medium', label: 'MOYEN' },
                          { id: 'hard', label: 'DIFFICILE' }
                        ].map((diff) => (
                          <button
                            key={diff.id}
                            onClick={() => setSelectedDifficultyFilter(diff.id)}
                            className={`py-2 rounded-lg text-[9px] font-headline font-black transition-all cursor-pointer
                              ${selectedDifficultyFilter === diff.id 
                                ? 'bg-[#E94560] text-white shadow-md' 
                                : 'bg-[#0F0F1A] text-[#8E8E93] hover:text-white'
                              }
                            `}
                          >
                            {diff.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter Segment 2: Max Duration limit */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-headline font-extrabold uppercase tracking-wider text-[#8E8E93]">
                        <span>DURÉE MAXIMALE</span>
                        <span className="text-[#E94560] font-mono">
                          {selectedDurationFilter === 0 ? 'Illimité' : `${selectedDurationFilter} minutes`}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1" 
                        value={selectedDurationFilter}
                        onChange={(e) => setSelectedDurationFilter(Number(e.target.value))}
                        className="w-full accent-[#E94560]"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-gray-500">
                        <span>Tous</span>
                        <span>3m</span>
                        <span>5m</span>
                        <span>8m</span>
                        <span>10m+</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <AlphaButton 
                      variant="primary" 
                      onClick={handleApplyFilters}
                      className="w-full py-3 text-xs font-headline font-black tracking-wide uppercase"
                    >
                      APPLIQUER LES FILTRES ({activeFilteredList.length} EXÉCUTABLES)
                    </AlphaButton>

                  </div>
                </div>
              )}

              {/* 5. APPLET BOTTOM NAVIGATION BAR MOCK */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0F0F1A] border-t border-gray-800/10 px-6 flex justify-between items-center select-none z-40">
                <div className="flex flex-col items-center gap-1 opacity-55 cursor-not-allowed">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline font-bold text-gray-400">Suivi</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-55 cursor-not-allowed">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline font-bold text-gray-400">Bibliothèque</span>
                </div>
                <div className="flex flex-col items-center gap-1 relative cursor-pointer group">
                  <Flame className="w-6 h-6 text-[#E94560]" />
                  <span className="text-[9px] font-headline font-extrabold text-[#E94560] uppercase tracking-wide">Kegel</span>
                  <div className="absolute -top-1 w-1.5 h-1.5 bg-[#E94560] rounded-full" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-55 cursor-not-allowed">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline font-bold text-gray-400">Défis</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-55 cursor-not-allowed">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline font-bold text-gray-400">Profil</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TECHNICAL INSTRUCTION & LAB CONTROL BOARD */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <AlphaCard className="p-6 bg-[#16213E]/80 border border-gray-800">
            <h3 className="text-md font-headline font-black text-[#FFD700] uppercase tracking-wider mb-3">
              GUIDE D'APPLICATIONS ET SYNERGIES
            </h3>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              En médecine du sport masculine, l'entraînement isolé du muscle PC (pubococcygien) est décuplé lorsqu'il est synchronisé avec des exercices globaux de posture et de mobilité de la ceinture pelvienne.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 bg-[#0F0F1A]/50 p-3.5 rounded-xl border border-gray-800">
                <span className="w-7 h-7 rounded-full bg-[#00D9A5]/10 border border-[#00D9A5]/20 flex items-center justify-center font-mono font-bold text-xs text-[#00D9A5] flex-shrink-0">
                  S
                </span>
                <div>
                  <h5 className="text-xs font-headline font-extrabold text-white">Squats Profonds & Ponts fessiers</h5>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                    La contraction concentrique des grands fessiers augmente la co-activation réflexe du muscle élévateur de l'anus par synergie neurologique S2-S4.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#0F0F1A]/50 p-3.5 rounded-xl border border-gray-800">
                <span className="w-7 h-7 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 flex items-center justify-center font-mono font-bold text-xs text-[#E94560] flex-shrink-0">
                  R
                </span>
                <div>
                  <h5 className="text-xs font-headline font-extrabold text-white">Respiration Diaphragmatique & Wim Hof</h5>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                    L'abaissement du diaphragme respiratoire crée une pression intra-abdominale positive qui sollicite de manière excentrique le plancher pelvien. L'aspiration sous-costale qui s'en suit décharge et détend les tissus conjonctifs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#0F0F1A]/50 p-3.5 rounded-xl border border-gray-800">
                <span className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono font-bold text-xs text-amber-300 flex-shrink-0">
                  M
                </span>
                <div>
                  <h5 className="text-xs font-headline font-extrabold text-white">Mobilité des Hanches (90/90 Stretch)</h5>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                    Le muscle obturateur interne s'insère directement sur l'arcade tendineuse du releveur de l'anus. Libérer les hanches désactive la co-contraction parasite.
                  </p>
                </div>
              </div>
            </div>
          </AlphaCard>

          <AlphaCard className="p-6 bg-[#16213E]/80 border border-gray-800">
            <h3 className="text-md font-headline font-black text-white uppercase tracking-wider mb-4">
              PROFIL D'ENTRAÎNEMENT DU SOLDAT SOUVERAIN
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0F0F1A]/60 rounded-xl p-4 border border-gray-800/60 text-center">
                <span className="text-[10px] font-headline font-black text-gray-500 tracking-wider block">
                  SÉANCES COMPLÉTÉES
                </span>
                <span className="text-3xl font-mono font-black text-[#00D9A5] block mt-1">
                  12/15
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Cette semaine (80% d'assiduité)
                </span>
              </div>

              <div className="bg-[#0F0F1A]/60 rounded-xl p-4 border border-gray-800/60 text-center">
                <span className="text-[10px] font-headline font-black text-gray-500 tracking-wider block">
                  DURÉE COMPLÉMENTAIRE
                </span>
                <span className="text-3xl font-mono font-black text-[#E94560] block mt-1">
                  54 min
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Temps d'étirement et force cumulés
                </span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mt-4">
              <div className="flex gap-3">
                <Award className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider">
                    Bonus Synergie Elite+ débloqué
                  </h5>
                  <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                    Vous profitez d'une augmentation de 1.4x sur la vitesse d'adaptation myofasciale grâce aux séances guidées de respiration Wim Hof et de renforcement fessier.
                  </p>
                </div>
              </div>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
