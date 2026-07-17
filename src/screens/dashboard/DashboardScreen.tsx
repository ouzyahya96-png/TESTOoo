import React, { useState, useEffect } from 'react';
import {
  Sun,
  Snowflake,
  Wind,
  Book,
  Dumbbell,
  Bell,
  User,
  TrendingUp,
  Compass,
  ShieldAlert,
  Target,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Home,
  Users,
  Star,
  RefreshCw,
  Code,
  Copy,
  Flame,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Lock,
  Award
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface DashboardScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
  onNavigateToTab?: (tab: 'sleep_tracker' | 'sun_protocol' | 'nutrition' | 'cold_exposure' | 'breathing' | 'vitality') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ addToast, onBack, onNavigateToTab }) => {
  // Screen and simulation states
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'kegel' | 'breathing' | 'clan' | 'profile'>('home');
  const [activePlanPhase, setActivePlanPhase] = useState<number | null>(1); // Default to Phase 1 expanded
  const [selectedProtocolItem, setSelectedProtocolItem] = useState<string | null>(null);

  // Dynamic Simulator State
  const [firstName, setFirstName] = useState<string>('YAHYA');
  const [currentDay, setCurrentDay] = useState<number>(12);
  const [streakDays, setStreakDays] = useState<number>(12);
  const [percentile, setPercentile] = useState<number>(12);
  const [vitalityScore, setVitalityScore] = useState<number>(78);
  const [kegelForce, setKegelForce] = useState<number>(67);
  const [vitalityPoints, setVitalityPoints] = useState<number>(2340);
  const [patternRiskScore, setPatternRiskScore] = useState<number>(72); // >60 triggers conditional section
  const [challengeActive, setChallengeActive] = useState<boolean>(true);
  const [notificationsUnread, setNotificationsUnread] = useState<number>(2);

  // Interactive Checklist State
  const [checklist, setChecklist] = useState([
    { id: '1', name: 'Lever avec le soleil', time: '6:15', status: 'completed', icon: 'sun', duration: null },
    { id: '2', name: 'Cold shower', time: '6:30', status: 'completed', icon: 'snowflake', duration: '2 min' },
    { id: '3', name: 'Kegel (15 min)', time: '20:00', status: 'pending', icon: 'dumbbell', duration: '15 min', isNext: true },
    { id: '4', name: 'Respiration (5 min)', time: '21:00', status: 'scheduled', icon: 'wind', duration: '5 min' },
    { id: '5', name: 'Journal (3 min)', time: 'Avant de dormir', status: 'scheduled', icon: 'book', duration: '3 min' },
  ]);

  // Count calculated completed items dynamically
  const completedCount = checklist.filter(item => item.status === 'completed').length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  // Pull down simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (navigator.vibrate) navigator.vibrate(50);
    addToast('info', "Actualisation des bio-paramètres en cours... 🧬");
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('success', "Paramètres réactualisés avec succès !");
    }, 1500);
  };

  // Toggle item completion
  const handleToggleItem = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const nextStatus = item.status === 'completed' ? 'scheduled' : 'completed';
          if (nextStatus === 'completed') {
            if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
            addToast('success', `Félicitations pour l'activité "${item.name}" ! +50 Vitality Points 🔥`);
            setVitalityPoints(p => p + 50);
          }
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Copy code helper
  const copyNativeCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', 'Code source DashboardScreen copié ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // High Fidelity React Native / Expo Code matching the specifications exactly
  const expoNativeCode = `import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DashboardScreen() {
  const navigation = useNavigation();

  // Primary states
  const [user, setUser] = useState({
    firstName: "YAHYA",
    currentDay: 12,
    streakDays: 12,
    percentile: 12,
    vitalityScore: 78,
    vitalityTrend: 5,
    kegelForce: 67,
    kegelTrend: 12,
    vitalityPoints: 2340,
    currentLevel: "WARRIOR",
    patternRiskScore: 72,
    patternType: "STRESS DU SOIR",
    notificationsUnread: 2
  });

  const [todayProtocol, setTodayProtocol] = useState({
    phase: "PHASE 1",
    phaseName: "DETOX",
    completedCount: 3,
    totalCount: 5,
    items: [
      { id: '1', name: "Lever avec le soleil", icon: "sunny-outline", status: 'completed', time: "6:15", duration: null, isNext: false, screen: "MorningRoutineScreen" },
      { id: '2', name: "Cold shower", icon: "snow-outline", status: 'completed', time: "6:30", duration: "2 min", isNext: false, screen: "ColdExposureScreen" },
      { id: '3', name: "Kegel (15 min)", icon: "barbell-outline", status: 'pending', time: "20:00", duration: "15 min", isNext: true, screen: "KegelSessionScreen" },
      { id: '4', name: "Respiration (5 min)", icon: "wind-outline", status: 'scheduled', time: "21:00", duration: "5 min", isNext: false, screen: "BreathingScreen" },
      { id: '5', name: "Journal (3 min)", icon: "book-outline", status: 'scheduled', time: "Avant de dormir", duration: "3 min", isNext: false, screen: "JournalScreen" }
    ]
  });

  const [dailyTip] = useState("💡 Conseil : Quand tu résistes aujourd'hui, tu affaiblis le neurone. Chaque victoire compte.");
  const [activeChallenge] = useState({
    name: "Défi Clan : Collective Kegel",
    goal: "50,000 contractions collectives",
    progress: 87,
    remaining: 12247
  });

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animated values
  const countUpValue = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const fadeAnims = useRef(todayProtocol.items.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Run animations on mount
  useEffect(() => {
    // 1. Day CountUp
    Animated.timing(countUpValue, {
      toValue: user.currentDay,
      duration: 800,
      useNativeDriver: false
    }).start();

    // 2. Progress Bar
    const progressPercent = (todayProtocol.completedCount / todayProtocol.totalCount);
    Animated.timing(progressBarWidth, {
      toValue: progressPercent * (screenWidth - 72),
      duration: 800,
      useNativeDriver: false
    }).start();

    // 3. Checklist stagger fade-in
    const staggerAnimations = fadeAnims.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true
      });
    });
    Animated.parallel(staggerAnimations).start();

    // 4. Pulse pending item icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 750, useNativeDriver: true })
      ])
    ).start();

  }, []);

  // Pull-to-refresh implementation
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate API fetch delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleProtocolItemPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(item.screen);
  };

  const handleProtectPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    navigation.navigate('PatternKillerScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.salutationRow}>
            <Text style={styles.salutationText}>Bonjour {user.firstName}</Text>
            <Text style={styles.dateText}>— Lundi 13 Juillet</Text>
          </View>
          <View style={styles.dayRow}>
            <Animated.Text style={styles.dayNumber}>
              {user.currentDay}
            </Animated.Text>
            <Text style={styles.dayLabel}>DE TA TRANSFORMATION</Text>
          </View>
          <View style={styles.streakRow}>
            <MaterialCommunityIcons name="fire" size={16} color="#FF9500" />
            <Text style={styles.streakText}>{user.streakDays} jours de suite 🔥</Text>
            <Text style={styles.separatorDot}>•</Text>
            <Text style={styles.percentileText}>Top {user.percentile}% des Alphas</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIconBtn} 
            onPress={() => navigation.navigate('NotificationsScreen')}
          >
            <Ionicons name="notifications-outline" size={24} color="#8E8E93" />
            {user.notificationsUnread > 0 && (
              <View style={styles.unreadBadge} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.avatarBtn} 
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>A</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#00D9A5" 
            colors={["#00D9A5"]} 
            progressBackgroundColor="#16213E"
          />
        }
      >
        
        {/* CONDITIONAL PATTERN KILLER ALERT BANNER */}
        {user.patternRiskScore > 60 && (
          <View style={styles.alertCard}>
            <MaterialCommunityIcons name="alert-decagram" size={28} color="#FF2D55" style={styles.alertPulse} />
            <View style={styles.alertTextWrapper}>
              <Text style={styles.alertTitle}>Pattern détecté</Text>
              <Text style={styles.alertDesc}>
                Risque '{user.patternType}' à {user.patternRiskScore}%. Ton protocole d'urgence est prêt.
              </Text>
            </View>
            <TouchableOpacity style={styles.alertBtn} onPress={handleProtectPress}>
              <Text style={styles.alertBtnText}>PROTÉGER</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PROTOCOLE DU JOUR (CARD PRINCIPALE) */}
        <View style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <Text style={styles.protocolTitle}>PROTOCOLE AUJOURD'HUI</Text>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>{todayProtocol.phase} — {todayProtocol.phaseName}</Text>
            </View>
          </View>

          <Text style={styles.progressCounter}>
            {todayProtocol.completedCount}/{todayProtocol.totalCount} complétés
          </Text>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
          </View>

          {/* PROTOCOL CHECKLIST */}
          <View style={styles.checklistContainer}>
            {todayProtocol.items.map((item, index) => (
              <Animated.View 
                key={item.id} 
                style={[styles.checkItem, { opacity: fadeAnims[index] }]}
              >
                {/* Status Indicator Left */}
                {item.status === 'completed' ? (
                  <View style={styles.completedCircle}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                ) : item.isNext ? (
                  <Animated.View style={[styles.pendingCircle, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.pendingPoint} />
                  </Animated.View>
                ) : (
                  <View style={styles.emptyCircle} />
                )}

                {/* Left Icon and Labels */}
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={item.status === 'completed' ? "#8E8E93" : item.isNext ? "#E94560" : "#5A5A5A"} 
                  style={{ marginLeft: 12 }} 
                />
                
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={styles.itemClickableZone}
                  onPress={() => handleProtocolItemPress(item)}
                >
                  <Text style={[
                    styles.itemText,
                    item.status === 'completed' && styles.itemCompletedText,
                    item.isNext && styles.itemActiveText
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>

                {/* Next Badge Indicator */}
                {item.isNext && (
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>PROCHAIN</Text>
                  </View>
                )}

                {/* Time Stamp right */}
                <Text style={[
                  styles.itemTime,
                  item.isNext && { color: '#E94560', fontFamily: 'RobotoMono-Bold' }
                ]}>
                  {item.time}
                </Text>

              </Animated.View>
            ))}
          </View>

          {/* VIEW ALL BUTTON */}
          <TouchableOpacity 
            style={styles.viewAllBtn} 
            onPress={() => navigation.navigate('FullProtocolScreen')}
          >
            <Text style={styles.viewAllBtnText}>VOIR TOUT MON PROTOCOLE →</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS SCROLL HORIZONTAL */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
          >
            {/* ACTION 1 */}
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('PatternKillerScreen')}
            >
              <Ionicons name="shield-outline" size={28} color="#FF2D55" />
              <Text style={[styles.actionLabel, { color: '#FF2D55' }]}>Urgence</Text>
              <View style={styles.redActionBadge} />
            </TouchableOpacity>

            {/* ACTION 2 */}
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('BreathingScreen')}
            >
              <Ionicons name="leaf-outline" size={28} color="#00D9A5" />
              <Text style={[styles.actionLabel, { color: '#00D9A5' }]}>Respirer</Text>
            </TouchableOpacity>

            {/* ACTION 3 */}
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('KegelDashboardScreen')}
            >
              <Ionicons name="target-outline" size={28} color="#E94560" />
              <Text style={[styles.actionLabel, { color: '#E94560' }]}>Kegel</Text>
            </TouchableOpacity>

            {/* ACTION 4 */}
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('JournalScreen')}
            >
              <Ionicons name="book-outline" size={28} color="#FFD700" />
              <Text style={[styles.actionLabel, { color: '#FFD700' }]}>Journal</Text>
            </TouchableOpacity>

            {/* ACTION 5 */}
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('ColdExposureScreen')}
            >
              <Ionicons name="snow-outline" size={28} color="#4A90D9" />
              <Text style={[styles.actionLabel, { color: '#4A90D9' }]}>Froid</Text>
            </TouchableOpacity>

            {/* ACTION 6 */}
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('AIChatScreen')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#8E8E93" />
              <Text style={[styles.actionLabel, { color: '#8E8E93' }]}>Coach IA</Text>
              <View style={styles.newActionBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </TouchableOpacity>

          </ScrollView>
        </View>

        {/* VITAL STATISTICS ROW */}
        <View style={styles.statsRow}>
          {/* CARD 1 */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('VitalityDashboardScreen')}
          >
            <Ionicons name="pulse-outline" size={20} color="#00D9A5" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: '#00D9A5' }]}>{user.vitalityScore}%</Text>
            <Text style={styles.statLabel}>VITALITY</Text>
            <View style={styles.trendRow}>
              <Ionicons name="trending-up-outline" size={10} color="#00D9A5" />
              <Text style={styles.trendText}>↑ {user.vitalityTrend}%</Text>
            </View>
          </TouchableOpacity>

          {/* CARD 2 */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('KegelDashboardScreen')}
          >
            <Ionicons name="fitness-outline" size={20} color="#E94560" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: '#E94560' }]}>{user.kegelForce}%</Text>
            <Text style={styles.statLabel}>FORCE</Text>
            <View style={styles.trendRow}>
              <Ionicons name="trending-up-outline" size={10} color="#00D9A5" />
              <Text style={styles.trendText}>↑ {user.kegelTrend}%</Text>
            </View>
          </TouchableOpacity>

          {/* CARD 3 */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('PointsScreen')}
          >
            <Ionicons name="star-outline" size={20} color="#FFD700" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: '#FFD700' }]}>2,340</Text>
            <Text style={styles.statLabel}>POINTS</Text>
            <Text style={styles.warriorLabel}>{user.currentLevel}</Text>
          </TouchableOpacity>
        </View>

        {/* DAILY ADVICE CARD */}
        <View style={styles.adviceCard}>
          <Ionicons name="bulb-outline" size={20} color="#FFD700" />
          <Text style={styles.adviceText}>{dailyTip}</Text>
          <TouchableOpacity 
            style={styles.adviceCircleBtn}
            onPress={() => navigation.navigate('DailyTipScreen')}
          >
            <Ionicons name="chevron-forward" size={16} color="#FFD700" />
          </TouchableOpacity>
        </View>

        {/* COLLECTIVE CLAN CHALLENGE CARD */}
        {activeChallenge && (
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>DÉFI</Text>
              </View>
              <Text style={styles.challengeTitle}>{activeChallenge.name}</Text>
            </View>

            <Text style={styles.challengeGoal}>
              Objectif : {activeChallenge.goal}
            </Text>
            <View style={styles.challengeProgressBg}>
              <View style={[styles.challengeProgressFill, { width: '87%' }]} />
            </View>

            <Text style={styles.challengeFooterText}>
              {activeChallenge.progress}% • {activeChallenge.remaining} restantes
            </Text>

            <TouchableOpacity 
              style={styles.participateBtn} 
              onPress={() => navigation.navigate('ChallengeScreen')}
            >
              <Text style={styles.participateBtnText}>PARTICIPER</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: 100 }} />

      </ScrollView>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navTab} activeOpacity={0.8}>
          <Ionicons name="home" size={24} color="#E94560" />
          <Text style={[styles.navText, { color: '#E94560' }]}>Accueil</Text>
          <View style={styles.navActiveDot} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navTab} 
          onPress={() => navigation.navigate('KegelDashboardScreen')}
        >
          <Ionicons name="target" size={24} color="#5A5A5A" />
          <Text style={styles.navText}>Kegel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navTab} 
          onPress={() => navigation.navigate('BreathingScreen')}
        >
          <Ionicons name="wind" size={24} color="#5A5A5A" />
          <Text style={styles.navText}>Respirer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navTab} 
          onPress={() => navigation.navigate('CommunityScreen')}
        >
          <Ionicons name="people" size={24} color="#5A5A5A" />
          <Text style={styles.navText}>Clan</Text>
          <View style={styles.navRedDot} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navTab} 
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Ionicons name="person" size={24} color="#5A5A5A" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A'
  },
  header: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#0F0F1A'
  },
  headerLeft: {
    flex: 1
  },
  salutationRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  salutationText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#8E8E93'
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A',
    marginLeft: 8
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4
  },
  dayNumber: {
    fontSize: 48,
    fontFamily: 'RobotoMono-Bold',
    color: '#FFFFFF'
  },
  dayLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#E94560',
    letterSpacing: 4,
    marginLeft: 8
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  streakText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#FF9500',
    marginLeft: 4
  },
  separatorDot: {
    color: '#5A5A5A',
    marginHorizontal: 6
  },
  percentileText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#FFD700'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF2D55'
  },
  avatarBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E94560',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16213E'
  },
  avatarInitials: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8
  },
  alertCard: {
    backgroundColor: 'rgba(255,45,85,0.08)',
    borderColor: 'rgba(255,45,85,0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  alertPulse: {
    marginRight: 12
  },
  alertTextWrapper: {
    flex: 1
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FF2D55'
  },
  alertDesc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF2D55',
    lineHeight: 18,
    marginTop: 4
  },
  alertBtn: {
    backgroundColor: '#FF2D55',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  alertBtnText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF'
  },
  protocolCard: {
    backgroundColor: '#16213E',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E94560',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  protocolTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color: '#E94560',
    letterSpacing: 2
  },
  phaseBadge: {
    backgroundColor: 'rgba(255,45,85,0.15)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  phaseBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FF2D55'
  },
  progressCounter: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 12
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1A1A2E',
    borderRadius: 3,
    marginTop: 6,
    width: '100%'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D9A5',
    borderRadius: 3
  },
  checklistContainer: {
    marginTop: 16
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
    paddingVertical: 12,
    position: 'relative'
  },
  completedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00D9A5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E94560',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pendingPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E94560'
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5A5A5A'
  },
  itemClickableZone: {
    flex: 1,
    marginLeft: 12
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5A5A5A'
  },
  itemCompletedText: {
    color: '#8E8E93',
    textDecorationLine: 'line-through'
  },
  itemActiveText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF'
  },
  nextBadge: {
    backgroundColor: '#E94560',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8
  },
  nextBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF'
  },
  itemTime: {
    fontSize: 12,
    fontFamily: 'RobotoMono-Regular',
    color: '#5A5A5A'
  },
  viewAllBtn: {
    height: 44,
    borderColor: '#8E8E93',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  viewAllBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color: '#8E8E93'
  },
  quickActionsContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#FFD700',
    marginBottom: 12
  },
  horizontalScroll: {
    paddingRight: 16
  },
  actionCard: {
    width: 100,
    height: 100,
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginTop: 8
  },
  redActionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF2D55'
  },
  newActionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4
  },
  newBadgeText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#0F0F1A'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    height: 120,
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statIcon: {
    alignSelf: 'flex-start'
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'RobotoMono-Bold',
    textAlign: 'center'
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center'
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  trendText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#00D9A5'
  },
  warriorLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFD700'
  },
  adviceCard: {
    backgroundColor: '#16213E',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  adviceText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
    flex: 1,
    marginLeft: 12
  },
  adviceCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  challengeCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderColor: 'rgba(255,215,0,0.2)',
    borderWidth: 1,
    padding: 16,
    marginBottom: 24
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  challengeBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  challengeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#0F0F1A'
  },
  challengeTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8
  },
  challengeGoal: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 12
  },
  challengeProgressBg: {
    height: 8,
    backgroundColor: '#1A1A2E',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden'
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700'
  },
  challengeFooterText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#FFD700',
    marginTop: 4
  },
  participateBtn: {
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  participateBtnText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#FFD700'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#16213E',
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4
  },
  navTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    position: 'relative'
  },
  navText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#5A5A5A',
    marginTop: 2
  },
  navActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E94560',
    marginTop: 2
  },
  navRedDot: {
    position: 'absolute',
    top: 12,
    right: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF2D55'
  }
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLLER HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest bg-[#E94560]/10 border border-[#E94560]/20 px-2 rounded-md">
            Cœur de l'application (Dashboard) — Step #8.7
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Tableau de Bord Alpha — DashboardScreen
          </h2>
          <p className="text-xs text-gray-400">
            Affiche le jour de transformation, les actions prioritaires, la jauge d'urgence, la progression et les stats de force kegel.
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
              <h4 className="text-xs font-headline font-black text-white">Composant DashboardScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Implémente la barre de navigation personnalisée, le système de pull-to-refresh natif, la mise à l'échelle des icônes sous tension, le compteur de progression et le bandeau d'alerte contextuel.
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

      {/* WORKSPACE PREVIEW ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PHONE EMULATION CONTAINER */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[385px] bg-[#000] rounded-[48px] p-3 pt-5 pb-5 border-[6px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker & notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-10 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2 h-2 bg-[#101020] rounded-full" />
            </div>

            {/* Simulated app core screen */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[690px] text-left">
              
              {/* TOP NAVIGATION CHANNELS */}
              <div className="h-9 px-6 pt-2.5 flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 select-none z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-2.5 bg-[#E94560] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* COLLAPSIBLE MINIMAL HEADER */}
              <div className="px-5 pt-2 pb-3 flex justify-between items-start select-none z-10 border-b border-gray-900/40">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[13px] font-headline font-extrabold text-gray-400">
                      Bonjour {firstName}
                    </span>
                    <span className="text-[11px] font-headline text-gray-600">
                      — Lun 13 Juil.
                    </span>
                  </div>
                  
                  <div className="flex items-baseline mt-1">
                    <span className="text-4xl font-mono font-black text-white leading-none tracking-tighter">
                      JOUR {currentDay}
                    </span>
                    <span className="text-[10px] font-headline font-black text-[#E94560] tracking-widest ml-2">
                      TRANSFORMATION
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <Flame className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]/20" />
                    <span className="text-[11px] font-headline font-bold text-[#FF9500]">
                      {streakDays} jours de suite 🔥
                    </span>
                    <span className="text-gray-600 text-[10px]">•</span>
                    <span className="text-[11px] font-headline font-bold text-[#FFD700]">
                      Top {percentile}% des Alphas
                    </span>
                  </div>
                </div>

                {/* Right profile shortcuts */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setNotificationsUnread(0);
                      addToast('info', "Accès aux notifications de l'Alpha Club ! 🔔");
                    }}
                    className="w-9 h-9 rounded-full bg-gray-900/40 flex items-center justify-center border border-gray-800/20 hover:bg-gray-800/60 transition-all cursor-pointer relative"
                  >
                    <Bell className="w-4 h-4 text-gray-400" />
                    {notificationsUnread > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF2D55] rounded-full border-2 border-black" />
                    )}
                  </button>

                  <button 
                    onClick={() => addToast('info', "Écran profil de l'utilisateur actif 👤")}
                    className="w-10 h-10 rounded-full border-2 border-[#E94560] flex items-center justify-center bg-[#16213E] cursor-pointer"
                  >
                    <span className="text-xs font-headline font-black text-white">T</span>
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT BODY SCROLLER */}
              <div className="flex-1 overflow-y-auto max-h-[460px] px-4 py-3 space-y-4 custom-scrollbar relative">
                
                {/* CONDITIONAL EMERGENCY ALERT */}
                {patternRiskScore > 60 && (
                  <div className="bg-[#FF2D55]/5 border border-[#FF2D55]/20 rounded-2xl p-3 flex gap-3 items-center justify-between animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-[#FF2D55]/10 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5 text-[#FF2D55]" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-[11px] font-headline font-black text-[#FF2D55]">
                        Pattern à risque élevé
                      </h4>
                      <p className="text-[10px] text-[#FF2D55]/90 font-headline leading-tight mt-0.5">
                        Risque "STRESS DU SOIR" détecté à {patternRiskScore}%. Protocole d'urgence armé.
                      </p>
                    </div>
                    <button 
                      onClick={() => addToast('warning', "ALERTE URGENCE : Lancement immédiat de la séance d'urgence Pattern Killer ! 🛡️")}
                      className="px-2.5 py-1.5 bg-[#FF2D55] text-white rounded-lg text-[9px] font-headline font-black uppercase hover:bg-red-600 transition-all cursor-pointer"
                    >
                      PROTÉGER
                    </button>
                  </div>
                )}

                {/* TODAY PROTOCOL (MAIN CARD) */}
                <div className="bg-[#16213E] rounded-2xl p-4 border-l-4 border-[#E94560] shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-headline font-black text-[#E94560] tracking-wider uppercase">
                      PROTOCOLE AUJOURD'HUI
                    </span>
                    <span className="text-[9px] font-headline font-extrabold bg-[#FF2D55]/20 text-[#FF2D55] px-2 py-0.5 rounded">
                      PHASE 1 — DETOX
                    </span>
                  </div>

                  <div className="flex justify-between items-end mt-3 text-[10px] text-gray-400">
                    <span className="font-headline">{completedCount} sur 5 actions complétées</span>
                    <span className="font-mono font-bold text-[#00D9A5]">{progressPercent}%</span>
                  </div>

                  {/* Progress Line */}
                  <div className="h-1.5 w-full bg-[#1A1A2E] rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-[#00D9A5] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* PROTOCOL LIST */}
                  <div className="mt-4 space-y-1">
                    {checklist.map((item) => {
                      const isItemCompleted = item.status === 'completed';
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between py-2 border-b border-gray-800/20 last:border-b-0 group"
                        >
                          <div className="flex items-center gap-2.5 flex-1">
                            {/* Tap to toggle action */}
                            <button
                              onClick={() => handleToggleItem(item.id)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isItemCompleted 
                                  ? 'bg-[#00D9A5] text-white' 
                                  : item.isNext 
                                    ? 'border-2 border-[#E94560] ring-2 ring-[#E94560]/20 animate-pulse' 
                                    : 'border-2 border-gray-600'
                              }`}
                            >
                              {isItemCompleted && <span className="text-[10px] font-bold">✓</span>}
                              {!isItemCompleted && item.isNext && <div className="w-2 h-2 bg-[#E94560] rounded-full" />}
                            </button>

                            {/* Icon & Name clickable container */}
                            <div 
                              onClick={() => {
                                if (item.icon === 'sun') {
                                  onNavigateToTab?.('sun_protocol');
                                } else if (item.icon === 'snowflake') {
                                  onNavigateToTab?.('cold_exposure');
                                } else if (item.icon === 'wind') {
                                  onNavigateToTab?.('breathing');
                                } else {
                                  addToast('info', `Détails pour ${item.name}`);
                                }
                              }}
                              className="flex items-center gap-2.5 flex-1 cursor-pointer hover:text-white transition-colors"
                            >
                              {/* Icon decoration */}
                              {item.icon === 'sun' && <Sun className={`w-4 h-4 ${isItemCompleted ? 'text-gray-500' : 'text-yellow-500'}`} />}
                              {item.icon === 'snowflake' && <Snowflake className={`w-4 h-4 ${isItemCompleted ? 'text-gray-500' : 'text-cyan-400'}`} />}
                              {item.icon === 'dumbbell' && <Dumbbell className={`w-4 h-4 ${isItemCompleted ? 'text-gray-500' : 'text-[#E94560]'}`} />}
                              {item.icon === 'wind' && <Wind className={`w-4 h-4 ${isItemCompleted ? 'text-gray-500' : 'text-teal-400'}`} />}
                              {item.icon === 'book' && <Book className={`w-4 h-4 ${isItemCompleted ? 'text-gray-500' : 'text-amber-500'}`} />}

                              {/* Text label */}
                              <span 
                                className={`text-[11px] font-headline leading-tight transition-all ${
                                  isItemCompleted 
                                    ? 'text-gray-500 line-through' 
                                    : item.isNext 
                                      ? 'text-white font-extrabold' 
                                      : 'text-gray-400'
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.isNext && !isItemCompleted && (
                              <span className="text-[8px] font-headline font-black bg-[#E94560] text-white px-1.5 py-0.5 rounded uppercase">
                                Prochain
                              </span>
                            )}
                            <span className={`text-[10px] font-mono ${item.isNext && !isItemCompleted ? 'text-[#E94560] font-black' : 'text-gray-600'}`}>
                              {item.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* FOOTER BUTTON */}
                  <button 
                    onClick={() => addToast('info', 'Accès à l\'agenda de protocole complet !')}
                    className="w-full mt-4 h-10 border border-[#8E8E93]/30 rounded-lg text-[10px] font-headline font-black text-gray-400 hover:bg-gray-800/20 active:scale-98 transition-all cursor-pointer"
                  >
                    VOIR TOUT MON PROTOCOLE →
                  </button>
                </div>

                {/* HORIZONTAL QUICK ACTIONS */}
                <div>
                  <h4 className="text-[10px] font-headline font-black text-[#FFD700] tracking-widest uppercase mb-2">
                    ACTIONS RAPIDES
                  </h4>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                    
                    <button 
                      onClick={() => addToast('warning', 'Ouverture du module d\'Urgence Pattern Killer 🚨')}
                      className="w-20 h-20 bg-[#16213E] rounded-xl flex flex-col justify-center items-center flex-shrink-0 relative hover:bg-[#1f2d53] transition-all cursor-pointer"
                    >
                      <ShieldAlert className="w-6 h-6 text-[#FF2D55]" />
                      <span className="text-[9px] font-headline font-bold mt-1.5 text-[#FF2D55]">Urgence</span>
                      <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF2D55] rounded-full" />
                    </button>

                    <button 
                      onClick={() => addToast('info', 'Lancement de l\'exercice de respiration 🧘')}
                      className="w-20 h-20 bg-[#16213E] rounded-xl flex flex-col justify-center items-center flex-shrink-0 hover:bg-[#1f2d53] transition-all cursor-pointer"
                    >
                      <Wind className="w-6 h-6 text-[#00D9A5]" />
                      <span className="text-[9px] font-headline font-bold mt-1.5 text-[#00D9A5]">Respirer</span>
                    </button>

                    <button 
                      onClick={() => addToast('info', 'Redirection vers l\'espace d\'entraînement de Kegel 🎯')}
                      className="w-20 h-20 bg-[#16213E] rounded-xl flex flex-col justify-center items-center flex-shrink-0 hover:bg-[#1f2d53] transition-all cursor-pointer"
                    >
                      <Target className="w-6 h-6 text-[#E94560]" />
                      <span className="text-[9px] font-headline font-bold mt-1.5 text-[#E94560]">Kegel</span>
                    </button>

                    <button 
                      onClick={() => addToast('info', 'Rédaction du journal de sobriété 📒')}
                      className="w-20 h-20 bg-[#16213E] rounded-xl flex flex-col justify-center items-center flex-shrink-0 hover:bg-[#1f2d53] transition-all cursor-pointer"
                    >
                      <BookOpen className="w-6 h-6 text-[#FFD700]" />
                      <span className="text-[9px] font-headline font-bold mt-1.5 text-[#FFD700]">Journal</span>
                    </button>

                    <button 
                      onClick={() => {
                        if (onNavigateToTab) {
                          onNavigateToTab('cold_exposure');
                        } else {
                          addToast('info', 'Lancement du chrono d\'exposition au froid ❄️');
                        }
                      }}
                      className="w-20 h-20 bg-[#16213E] rounded-xl flex flex-col justify-center items-center flex-shrink-0 hover:bg-[#1f2d53] transition-all cursor-pointer"
                    >
                      <Snowflake className="w-6 h-6 text-[#4A90D9]" />
                      <span className="text-[9px] font-headline font-bold mt-1.5 text-[#4A90D9]">Froid</span>
                    </button>

                    <button 
                      onClick={() => {
                        if (onNavigateToTab) {
                          onNavigateToTab('ai_engine_spec');
                        } else {
                          addToast('info', 'Démarrage du tchat de soutien IA de l\'Alpha Coach 🤖');
                        }
                      }}
                      className="w-20 h-20 bg-[#16213E] rounded-xl flex flex-col justify-center items-center flex-shrink-0 relative hover:bg-[#1f2d53] transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-6 h-6 text-gray-400" />
                      <span className="text-[9px] font-headline font-bold mt-1.5 text-gray-400">Coach IA</span>
                      <span className="absolute top-1 right-1.5 bg-[#FFD700] text-[#0F0F1A] text-[7px] font-bold px-1 rounded">NEW</span>
                    </button>

                  </div>
                </div>

                {/* 3 STATISTICS CARDS */}
                <div className="grid grid-cols-3 gap-2">
                  
                  <div 
                    onClick={() => {
                      if (onNavigateToTab) {
                        onNavigateToTab('vitality');
                      } else {
                        addToast('info', 'Accès aux statistiques de Vitalité !');
                      }
                    }}
                    className="bg-[#16213E] rounded-xl p-2 flex flex-col justify-between items-center h-24 cursor-pointer hover:bg-gray-800/40"
                  >
                    <TrendingUp className="w-4 h-4 text-[#00D9A5] self-start" />
                    <span className="text-lg font-mono font-black text-[#00D9A5]">{vitalityScore}%</span>
                    <div className="text-center">
                      <p className="text-[8px] text-gray-500 font-headline uppercase">VITALITY</p>
                      <p className="text-[7px] text-[#00D9A5] font-headline">↑ 5%</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => addToast('info', 'Accès à l\'historique de force musculaire !')}
                    className="bg-[#16213E] rounded-xl p-2 flex flex-col justify-between items-center h-24 cursor-pointer hover:bg-gray-800/40"
                  >
                    <Dumbbell className="w-4 h-4 text-[#E94560] self-start" />
                    <span className="text-lg font-mono font-black text-[#E94560]">{kegelForce}%</span>
                    <div className="text-center">
                      <p className="text-[8px] text-gray-500 font-headline uppercase">FORCE</p>
                      <p className="text-[7px] text-[#00D9A5] font-headline">↑ 12%</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => addToast('info', 'Gestionnaire des Vitality Points accumulés 🪙')}
                    className="bg-[#16213E] rounded-xl p-2 flex flex-col justify-between items-center h-24 cursor-pointer hover:bg-gray-800/40"
                  >
                    <Star className="w-4 h-4 text-[#FFD700] self-start" />
                    <span className="text-sm font-mono font-black text-[#FFD700]">{vitalityPoints.toLocaleString()}</span>
                    <div className="text-center">
                      <p className="text-[8px] text-gray-500 font-headline uppercase">POINTS</p>
                      <p className="text-[7px] text-[#FFD700] font-headline uppercase font-bold">WARRIOR</p>
                    </div>
                  </div>

                </div>

                {/* DAILY TIP CARD */}
                <div className="bg-[#16213E] rounded-xl p-3.5 border-l-3 border-[#FFD700] flex items-center justify-between gap-3 shadow">
                  <Lightbulb className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <p className="text-[10.5px] font-headline leading-relaxed text-gray-300 flex-1">
                    Conseil : Quand tu résistes aujourd'hui, tu affaiblis le neurone d'urgence. Chaque petite victoire s'additionne.
                  </p>
                  <button 
                    onClick={() => addToast('info', 'Conseil du jour détaillé ouvert ! 💡')}
                    className="w-7 h-7 rounded-full bg-[#1A1A2E] flex items-center justify-center hover:bg-gray-800 cursor-pointer flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4 text-[#FFD700]" />
                  </button>
                </div>

                {/* COLLECTIVE CLAN CHALLENGE */}
                {challengeActive && (
                  <div className="bg-[#1A1A2E] rounded-xl p-3.5 border border-yellow-500/20 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-headline font-black bg-[#FFD700] text-[#0F0F1A] px-1.5 py-0.5 rounded tracking-wider uppercase">
                        DÉFI
                      </span>
                      <h5 className="text-[11px] font-headline font-extrabold text-white">
                        Défi Clan : Collective Kegel
                      </h5>
                    </div>
                    <p className="text-[10px] text-gray-400 font-headline mt-2">
                      Objectif : 50,000 contractions collectives
                    </p>

                    {/* Miniature ProgressBar */}
                    <div className="h-1.5 w-full bg-[#16213E] rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#FFD700] rounded-full" style={{ width: '87%' }} />
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-[#FFD700] mt-1.5 font-headline">
                      <span>87% complété</span>
                      <span>12,247 contractions restantes</span>
                    </div>

                    <button 
                      onClick={() => addToast('success', 'Tu as rejoint le Défi collectif ! Contractions additionnées 🤝')}
                      className="w-full mt-3 h-8 border border-[#FFD700]/30 hover:border-[#FFD700] text-[10px] text-[#FFD700] font-headline font-bold rounded-lg cursor-pointer transition-all"
                    >
                      PARTICIPER
                    </button>
                  </div>
                )}

              </div>

              {/* STICKY BOTTOM TAB NAVIGATION */}
              <div className="bg-[#16213E] border-t border-gray-900/60 h-[56px] flex justify-around items-center px-2">
                
                <button 
                  onClick={() => {
                    setActiveTab('home');
                    addToast('info', 'Onglet Accueil activé 🏠');
                  }}
                  className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer"
                >
                  <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#E94560]' : 'text-gray-500'}`} />
                  <span className={`text-[8px] font-headline mt-0.5 ${activeTab === 'home' ? 'text-[#E94560]' : 'text-gray-500'}`}>Accueil</span>
                  {activeTab === 'home' && <div className="w-1.5 h-1.5 rounded-full bg-[#E94560] mt-0.5" />}
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('kegel');
                    addToast('info', 'Onglet Entraînement Kegel activé 🎯');
                  }}
                  className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer"
                >
                  <Target className={`w-5 h-5 ${activeTab === 'kegel' ? 'text-[#E94560]' : 'text-gray-500'}`} />
                  <span className={`text-[8px] font-headline mt-0.5 ${activeTab === 'kegel' ? 'text-gray-400' : 'text-gray-500'}`}>Kegel</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('breathing');
                    addToast('info', 'Onglet Respiration activé 💨');
                  }}
                  className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer"
                >
                  <Wind className={`w-5 h-5 ${activeTab === 'breathing' ? 'text-[#E94560]' : 'text-gray-500'}`} />
                  <span className={`text-[8px] font-headline mt-0.5 ${activeTab === 'breathing' ? 'text-gray-400' : 'text-gray-500'}`}>Respirer</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('clan');
                    addToast('info', 'Onglet Clan & Communauté activé 👥');
                  }}
                  className="flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer"
                >
                  <Users className={`w-5 h-5 ${activeTab === 'clan' ? 'text-[#E94560]' : 'text-gray-500'}`} />
                  <span className={`text-[8px] font-headline mt-0.5 ${activeTab === 'clan' ? 'text-gray-400' : 'text-gray-500'}`}>Clan</span>
                  <span className="absolute top-1.5 right-6 w-2 h-2 bg-[#FF2D55] rounded-full" />
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    addToast('info', 'Onglet Paramètres Profil activé 👤');
                  }}
                  className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer"
                >
                  <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-[#E94560]' : 'text-gray-500'}`} />
                  <span className={`text-[8px] font-headline mt-0.5 ${activeTab === 'profile' ? 'text-gray-400' : 'text-gray-500'}`}>Profil</span>
                </button>

              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: SIMULATOR SETTINGS AND SCIENTIFIC REASONS */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Award className="w-5 h-5 text-[#FF9500]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Contrôles Dynamiques du Simulateur
              </h3>
            </div>
            
            <p className="text-xs text-gray-400">
              Modifiez à la volée les indicateurs biométriques ci-dessous pour apprécier la réponse réactive de l'interface en temps réel.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-black mb-1">
                  Prénom Utilisateur :
                </label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#0A0A15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E94560]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-black mb-1">
                  Jour de Transformation :
                </label>
                <input 
                  type="number" 
                  value={currentDay} 
                  onChange={(e) => {
                    setCurrentDay(Number(e.target.value));
                    setStreakDays(Number(e.target.value));
                  }}
                  className="w-full bg-[#0A0A15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E94560]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-black mb-1">
                  Indice de Risque d'Urgence (%) :
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="10" 
                    max="99" 
                    value={patternRiskScore} 
                    onChange={(e) => setPatternRiskScore(Number(e.target.value))}
                    className="flex-1 accent-[#FF2D55] h-1 bg-gray-800 rounded-lg cursor-pointer"
                  />
                  <span className={`text-xs font-mono font-bold ${patternRiskScore > 60 ? 'text-[#FF2D55]' : 'text-gray-400'}`}>
                    {patternRiskScore}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-black mb-1">
                  Points de Vitalité :
                </label>
                <input 
                  type="number" 
                  value={vitalityPoints} 
                  onChange={(e) => setVitalityPoints(Number(e.target.value))}
                  className="w-full bg-[#0A0A15] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E94560]"
                />
              </div>
            </div>

            <div className="h-[1px] bg-gray-800/20 my-2" />

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-bold bg-[#00D9A5]/10 border border-[#00D9A5]/20 text-[#00D9A5] hover:bg-[#00D9A5]/20 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Simuler Pull-to-Refresh'}
              </button>

              <button 
                onClick={() => {
                  setChecklist(prev => prev.map(item => ({ ...item, status: 'scheduled' })));
                  addToast('info', "Protocole réinitialisé pour la journée ⏳");
                }}
                className="py-2 px-4 rounded-xl text-xs font-headline font-bold bg-gray-900 border border-gray-800 text-gray-400 hover:text-white cursor-pointer"
              >
                Réinitialiser les tâches
              </button>
            </div>
          </AlphaCard>

          <AlphaCard variant="default" className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 border-b border-gray-800/20 pb-3">
              <Lock className="w-5 h-5 text-[#00D9A5]" />
              <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
                Règles Architecturales & UX
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Le tableau de bord centralise toutes les briques de l'application ALPHA MAN :
            </p>

            <ul className="text-xs text-gray-300 space-y-2">
              <li>
                <strong>1. Jour de Transformation en vedette :</strong> C'est la métrique clé de fierté. Le compteur compte en continu pour installer la persévérance.
              </li>
              <li>
                <strong>2. Protocole du Jour interactif :</strong> L'utilisateur peut cocher les tâches d'un simple clic pour mettre à jour la jauge dynamique et recevoir ses Vitality Points.
              </li>
              <li>
                <strong>3. Armement de l'Urgence Pattern Killer :</strong> S'affiche immédiatement au-dessus de tout le reste dès que l'algorithme détecte un risque critique (score &gt; 60), offrant un bouton "PROTÉGER" instantané pour briser la boucle d'addiction.
              </li>
            </ul>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
