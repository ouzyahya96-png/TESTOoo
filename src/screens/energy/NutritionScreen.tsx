import React, { useState } from 'react';
import { 
  ArrowLeft,
  Share2,
  Calendar,
  Trophy,
  Info,
  Check,
  Plus,
  Coffee,
  Apple,
  Beef,
  Cookie,
  Moon,
  Pill,
  Droplet,
  Sun,
  Zap,
  Leaf,
  XCircle,
  AlertTriangle,
  Shield,
  Brain,
  ChevronLeft,
  Settings,
  Code,
  Copy,
  Clock,
  UtensilsCrossed
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface NutritionScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const NutritionScreen: React.FC<NutritionScreenProps> = ({ addToast, onBack }) => {
  // Simulator View Settings
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("Aujourd'hui");

  // Core Nutrition Parameters State
  const [nutritionScore, setNutritionScore] = useState<number>(65);
  const [mealsTracked, setMealsTracked] = useState<number>(3);
  const [mealsTarget] = useState<number>(5);

  // Macros state
  const [proteinCurrent, setProteinCurrent] = useState<number>(120);
  const [proteinTarget] = useState<number>(160);
  const [carbsCurrent, setCarbsCurrent] = useState<number>(180);
  const [carbsTarget] = useState<number>(250);
  const [fatsCurrent, setFatsCurrent] = useState<number>(65);
  const [fatsTarget] = useState<number>(80);
  const [caloriesCurrent, setCaloriesCurrent] = useState<number>(2150);
  const [caloriesTarget] = useState<number>(2800);

  // Meals state
  const [meals, setMeals] = useState([
    {
      id: 'meal-1',
      type: 'breakfast' as const,
      title: "Petit-déjeuner",
      description: "Œufs + avocat + pain complet",
      time: "07:30",
      macros: { protein: 25, carbs: 30, fats: 15, calories: 350 },
      status: 'completed' as 'completed' | 'pending',
      icon: 'coffee'
    },
    {
      id: 'meal-2',
      type: 'snack' as const,
      title: "Collation Matin",
      description: "Noix + fruits rouges",
      time: "10:00",
      macros: { protein: 8, carbs: 15, fats: 12, calories: 200 },
      status: 'completed' as 'completed' | 'pending',
      icon: 'apple'
    },
    {
      id: 'meal-3',
      type: 'lunch' as const,
      title: "Déjeuner",
      description: "Poulet + riz + légumes",
      time: "13:00",
      macros: { protein: 45, carbs: 60, fats: 20, calories: 600 },
      status: 'completed' as 'completed' | 'pending',
      icon: 'beef'
    },
    {
      id: 'meal-4',
      type: 'snack2' as const,
      title: "Goûter",
      description: "Shake protéine + banane",
      time: "16:00",
      macros: { protein: 30, carbs: 25, fats: 5, calories: 270 },
      status: 'pending' as 'completed' | 'pending',
      icon: 'cookie'
    },
    {
      id: 'meal-5',
      type: 'dinner' as const,
      title: "Dîner",
      description: "Saumon + quinoa + brocoli",
      time: "20:00",
      macros: { protein: 35, carbs: 40, fats: 18, calories: 730 },
      status: 'pending' as 'completed' | 'pending',
      icon: 'moon'
    }
  ]);

  // Supplements State (Interactive)
  const [supplements, setSupplements] = useState([
    { id: 'supp-1', name: "Zinc (15mg)", dosage: "15mg", description: "Testostérone & immunité", time: "08:00", taken: true, icon: "pill", color: "#FFD700" },
    { id: 'supp-2', name: "Magnésium (400mg)", dosage: "400mg", description: "Sommeil & récupération", time: "21:00", taken: false, icon: "pill", color: "#4A90D9" },
    { id: 'supp-3', name: "Oméga-3 (2g)", dosage: "2g", description: "Cerveau & hormones", time: "12:00", taken: true, icon: "droplet", color: "#00D9A5" },
    { id: 'supp-4', name: "Vitamine D3 (4000 UI)", dosage: "4000 UI", description: "Testostérone & os", time: "08:00", taken: true, icon: "sun", color: "#FFD700" },
    { id: 'supp-5', name: "Créatine (5g)", dosage: "5g", description: "Force & cognition", time: "Post-workout", taken: true, icon: "zap", color: "#00D9A5" },
    { id: 'supp-6', name: "Ashwagandha (600mg)", dosage: "600mg", description: "Cortisol & stress", time: "20:00", taken: false, icon: "leaf", color: "#00D9A5" }
  ]);

  // Add meal modal state
  const [showAddMealModal, setShowAddMealModal] = useState<boolean>(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('custom');
  const [customMealTitle, setCustomMealTitle] = useState<string>('');
  const [customMealDesc, setCustomMealDesc] = useState<string>('');
  const [customMealProt, setCustomMealProt] = useState<number>(30);
  const [customMealCarb, setCustomMealCarb] = useState<number>(40);
  const [customMealFat, setCustomMealFat] = useState<number>(10);
  const [customMealKcal, setCustomMealKcal] = useState<number>(450);

  // Bottom info sheets
  const [showScienceSheet, setShowScienceSheet] = useState<boolean>(false);

  // Red list definitions
  const redList = [
    { name: "Sucre raffiné", impact: "↓ Testo -25%", severity: 'high' as const, icon: "x-circle" },
    { name: "Alcool", impact: "↓ Testo -20%", severity: 'high' as const, icon: "x-circle" },
    { name: "Gras trans / friture", impact: "↓ Testo -15%", severity: 'high' as const, icon: "x-circle" },
    { name: "Soja excessif (phyto-œstrogènes)", impact: "⚠️ Modéré", severity: 'medium' as const, icon: "alert-triangle" }
  ];

  // 7 days historical macros representation
  const weeklyData = [
    { day: "Lun", protein: 140, carbs: 220, fats: 70, calories: 2400, score: 85 },
    { day: "Mar", protein: 110, carbs: 190, fats: 60, calories: 2100, score: 60 },
    { day: "Mer", protein: 155, carbs: 240, fats: 78, calories: 2750, score: 95 },
    { day: "Jeu", protein: 120, carbs: 180, fats: 65, calories: 2150, score: 65 },
    { day: "Ven", protein: 95, carbs: 150, fats: 50, calories: 1700, score: 45 },
    { day: "Sam", protein: 160, carbs: 260, fats: 85, calories: 2900, score: 100 },
    { day: "Dim", protein: 145, carbs: 210, fats: 72, calories: 2350, score: 88 }
  ];

  const getScoreLabelAndColor = (score: number) => {
    if (score >= 90) return { label: "PARFAIT", color: "text-[#00D9A5]", border: "border-[#00D9A5]" };
    if (score >= 80) return { label: "EXCELLENT", color: "text-[#00D9A5]", border: "border-[#00D9A5]" };
    if (score >= 70) return { label: "BIEN", color: "text-[#FFD700]", border: "border-[#FFD700]" };
    if (score >= 60) return { label: "À TRAVAILLER", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    if (score >= 40) return { label: "INSUFFISANT", color: "text-[#FF9500]", border: "border-[#FF9500]" };
    return { label: "CRITIQUE", color: "text-[#FF2D55]", border: "border-[#FF2D55]" };
  };

  const scoreConfig = getScoreLabelAndColor(nutritionScore);

  // Toggle meal status
  const handleToggleMeal = (id: string) => {
    setMeals(prev => 
      prev.map(m => {
        if (m.id === id) {
          const updatedStatus = m.status === 'completed' ? 'pending' : 'completed';
          if (updatedStatus === 'completed') {
            addToast('success', `Repas validé : ${m.title} 🍖`);
            // Add macros
            setProteinCurrent(p => p + m.macros.protein);
            setCarbsCurrent(c => c + m.macros.carbs);
            setFatsCurrent(f => f + m.macros.fats);
            setCaloriesCurrent(cal => cal + m.macros.calories);
          } else {
            addToast('info', `Repas annulé : ${m.title}`);
            setProteinCurrent(p => Math.max(0, p - m.macros.protein));
            setCarbsCurrent(c => Math.max(0, c - m.macros.carbs));
            setFatsCurrent(f => Math.max(0, f - m.macros.fats));
            setCaloriesCurrent(cal => Math.max(0, cal - m.macros.calories));
          }
          return { ...m, status: updatedStatus };
        }
        return m;
      })
    );
  };

  // Supplement toggle taken
  const handleToggleSupplement = (id: string) => {
    setSupplements(prev => 
      prev.map(s => {
        if (s.id === id) {
          const nextState = !s.taken;
          if (nextState) {
            addToast('success', `Supplément pris : ${s.name} 💊`);
          } else {
            addToast('info', `Supplément annulé : ${s.name}`);
          }
          return { ...s, taken: nextState };
        }
        return s;
      })
    );
  };

  // Open Add Meal Modal preset
  const openAddMealModal = (type: string) => {
    setSelectedMealType(type);
    if (type === 'snack') {
      setCustomMealTitle("Goûter Protéiné");
      setCustomMealDesc("Shake Whey + Banane + Amandes");
      setCustomMealProt(30);
      setCustomMealCarb(25);
      setCustomMealFat(5);
      setCustomMealKcal(270);
    } else if (type === 'dinner') {
      setCustomMealTitle("Dîner Alpha");
      setCustomMealDesc("Pavé de Saumon + Quinoa sauvage + Brocoli");
      setCustomMealProt(40);
      setCustomMealCarb(45);
      setCustomMealFat(22);
      setCustomMealKcal(580);
    } else {
      setCustomMealTitle("Nouveau Repas");
      setCustomMealDesc("Protéine noble + légumes croquants");
      setCustomMealProt(35);
      setCustomMealCarb(40);
      setCustomMealFat(15);
      setCustomMealKcal(450);
    }
    setShowAddMealModal(true);
  };

  // Save new meal
  const handleSaveMeal = () => {
    if (!customMealTitle.trim()) {
      addToast('error', "Le titre du repas ne peut pas être vide.");
      return;
    }

    const newMeal = {
      id: `meal-${Date.now()}`,
      type: 'custom' as const,
      title: customMealTitle,
      description: customMealDesc,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      macros: { protein: customMealProt, carbs: customMealCarb, fats: customMealFat, calories: customMealKcal },
      status: 'completed' as const,
      icon: 'beef'
    };

    setMeals(prev => [...prev.filter(m => m.id !== 'meal-4' && m.id !== 'meal-5' || m.type !== selectedMealType), newMeal]);
    setProteinCurrent(p => p + customMealProt);
    setCarbsCurrent(c => c + customMealCarb);
    setFatsCurrent(f => f + customMealFat);
    setCaloriesCurrent(cal => cal + customMealKcal);
    
    // Recalculate score dynamically
    const nextTracked = mealsTracked + 1;
    setMealsTracked(nextTracked);
    setNutritionScore(Math.min(100, Math.round((nextTracked / mealsTarget) * 100)));

    setShowAddMealModal(false);
    addToast('success', `Repas "${customMealTitle}" ajouté et consommé ! 🍖`);
  };

  const handleShare = () => {
    const summary = `Suivi Nutritionnel ALPHA : Score ${nutritionScore}/100, Protéines : ${proteinCurrent}g/${proteinTarget}g, Calories : ${caloriesCurrent} Kcal. Mon corps est ma forteresse ! ⚡`;
    if (navigator.share) {
      navigator.share({
        title: 'ALPHA MAN - Nutrition',
        text: summary,
        url: window.location.href
      }).then(() => {
        addToast('success', "Score nutritionnel partagé !");
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(summary);
      addToast('success', "Fiche nutritionnelle copiée ! 📋");
    }
  };

  const handleDateChange = () => {
    const dates = ["Aujourd'hui", "Hier", "13 Juillet", "12 Juillet"];
    const currIdx = dates.indexOf(selectedDate);
    const nextIdx = (currIdx + 1) % dates.length;
    setSelectedDate(dates[nextIdx]);

    if (nextIdx === 1) { // Hier
      setNutritionScore(85);
      setMealsTracked(4);
      setProteinCurrent(140);
      setCarbsCurrent(210);
      setFatsCurrent(72);
      setCaloriesCurrent(2450);
    } else if (nextIdx === 2) { // 13 Juillet
      setNutritionScore(100);
      setMealsTracked(5);
      setProteinCurrent(165);
      setCarbsCurrent(245);
      setFatsCurrent(79);
      setCaloriesCurrent(2780);
    } else { // Reset
      setNutritionScore(65);
      setMealsTracked(3);
      setProteinCurrent(120);
      setCarbsCurrent(180);
      setFatsCurrent(65);
      setCaloriesCurrent(2150);
    }
    addToast('info', `Historique nutritionnel chargé pour : ${dates[nextIdx]}`);
  };

  const numSupplementsTaken = supplements.filter(s => s.taken).length;

  // React Native Expo representation code according to the exact spec
  const expoNativeCode = `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Dimensions, 
  Share, 
  Animated 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function NutritionScreen({ navigation }) {
  const [nutritionScore, setNutritionScore] = useState(65);
  const [mealsTracked, setMealsTracked] = useState(3);
  const [protein, setProtein] = useState(120);
  const [carbs, setCarbs] = useState(180);
  const [fats, setFats] = useState(65);

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Mon score Nutritionnel ALPHA est de \${nutritionScore}/100. Protéines: \${protein}g. Nutrition au garde-à-vous ! 🍖\`
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log(e);
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
        <Text style={styles.headerTitle}>NUTRITION</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.touchTarget}>
            <Feather name="calendar" size={22} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchTarget} onPress={handleShare}>
            <Feather name="share-2" size={22} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* SCORE PRINCIPAL */}
        <View style={[styles.mainScoreCard, nutritionScore >= 80 ? styles.borderGreen : styles.borderOrange]}>
          <Text style={styles.scoreTitle}>SCORE NUTRITION AUJOURD'HUI</Text>
          <Text style={styles.scoreText}>{nutritionScore}</Text>
          <Text style={styles.scoreLabel}>À TRAVAILLER</Text>
          <Text style={styles.repasLabel}>🍖 {mealsTracked}/5 REPAS</Text>
          <Text style={styles.comparativeLabel}>Objectif : 5/5 • Manque : 2 repas</Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>↓ -8% vs hier</Text>
          </View>
        </View>

        {/* NATIVE REPRESENTATION FOR MACRO PROGRESS RINGS */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#00D9A5', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  mainScoreCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, alignItems: 'center', borderWidth: 2 },
  borderGreen: { borderColor: '#00D9A5' },
  borderOrange: { borderColor: '#FF9500' },
  scoreTitle: { fontSize: 12, color: '#8E8E93', letterSpacing: 3, fontWeight: '600' },
  scoreText: { fontSize: 72, fontWeight: 'bold', color: '#FF9500' },
  scoreLabel: { fontSize: 16, color: '#FF9500', fontWeight: 'bold', marginTop: 8 },
  repasLabel: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold', marginTop: 12 },
  comparativeLabel: { fontSize: 13, color: '#8E8E93', marginTop: 8 },
  trendBadge: { backgroundColor: 'rgba(255, 45, 85, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
  trendText: { color: '#FF2D55', fontSize: 14, fontWeight: '500' }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source Expo de Nutrition copié ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-widest bg-[#00D9A5]/10 border border-[#00D9A5]/20 px-2 rounded-md">
            Pilier Vitalité #3 — Nutrition (3.3)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Optimisation Hormonale Nutritionnelle — NutritionScreen
          </h2>
          <p className="text-xs text-gray-400">
            Cible la testostérone libre, régule la charge glycémique et suit les micronutriments protecteurs (Zinc, D3, Oméga-3).
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
              <h4 className="text-xs font-headline font-black text-white">NutritionScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Gère la distribution des macronutriments, la validation tactile des repas et le blocage des alertes endocriniennes.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyExpoCode}
              className="flex items-center gap-2 text-[10px] font-headline"
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

      {/* DOUBLE GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: MACRO CONTROL ADJUSTER */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Calibreur de Macronutriments
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Ajustez l'apport en direct pour observer la complétion des anneaux métaboliques.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Prot slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Protéines (Anabolisme)</span>
                <span className="text-[#00D9A5] font-bold">{proteinCurrent}g / {proteinTarget}g</span>
              </div>
              <input 
                type="range" min="0" max="250" value={proteinCurrent} 
                onChange={(e) => setProteinCurrent(parseInt(e.target.value))}
                className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Carb slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Glucides (Glycogène)</span>
                <span className="text-[#FFD700] font-bold">{carbsCurrent}g / {carbsTarget}g</span>
              </div>
              <input 
                type="range" min="0" max="400" value={carbsCurrent} 
                onChange={(e) => setCarbsCurrent(parseInt(e.target.value))}
                className="w-full accent-[#FFD700] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fat slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Lipides (Précurseurs Testo)</span>
                <span className="text-[#4A90D9] font-bold">{fatsCurrent}g / {fatsTarget}g</span>
              </div>
              <input 
                type="range" min="0" max="150" value={fatsCurrent} 
                onChange={(e) => setFatsCurrent(parseInt(e.target.value))}
                className="w-full accent-[#4A90D9] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Calories calculator input */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-headline">
                <span className="text-gray-400">Calories Totales</span>
                <span className="text-white font-bold">{caloriesCurrent} Kcal / {caloriesTarget} Kcal</span>
              </div>
              <input 
                type="range" min="500" max="4000" value={caloriesCurrent} 
                onChange={(e) => setCaloriesCurrent(parseInt(e.target.value))}
                className="w-full accent-white h-1.5 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setProteinCurrent(162);
                  setCarbsCurrent(248);
                  setFatsCurrent(82);
                  setCaloriesCurrent(2790);
                  setNutritionScore(100);
                  setMealsTracked(5);
                  addToast('success', "Objectifs nutritionnels 100% atteints ! Hormones au max. 🍖");
                }}
                className="w-full py-1.5 px-3 bg-[#00D9A5]/10 border border-[#00D9A5]/25 hover:bg-[#00D9A5]/20 text-[#00D9A5] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Macros Parfaits (100%)
              </button>
              <button 
                onClick={() => {
                  setProteinCurrent(60);
                  setCarbsCurrent(350);
                  setFatsCurrent(110);
                  setCaloriesCurrent(2900);
                  setNutritionScore(35);
                  setMealsTracked(2);
                  addToast('error', "Simulé : Trop de glucides/lipides friture. Alerte catabolisme. ⚠️");
                }}
                className="w-full py-1.5 px-3 bg-[#FF2D55]/10 border border-[#FF2D55]/25 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-bold transition-all"
              >
                Simuler Alerte Catabolisme (35%)
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW SIMULATOR */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Speaker & Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN INNER CONTAINER */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* STATUS BAR */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>12:00</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#00D9A5] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER CONTAINER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-950 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-md font-headline font-black tracking-widest text-[#00D9A5] uppercase">
                  Nutrition
                </h1>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={handleDateChange}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowScienceSheet(true)}
                    className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* DYNAMIC SCROLL VIEWER */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* DATE SELECTOR BAR */}
                <div className="flex justify-between items-center bg-[#16213E]/40 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-headline">
                  <span className="text-gray-400">Date d'analyse</span>
                  <button 
                    onClick={handleDateChange}
                    className="text-[#00D9A5] font-black hover:underline cursor-pointer"
                  >
                    {selectedDate} • Modifier ↻
                  </button>
                </div>

                {/* SECTION 1: SCORE NUTRITION DU JOUR (CARD PRINCIPALE) */}
                <div className={`bg-[#16213E] rounded-[24px] p-6 text-center border-2 ${scoreConfig.border} shadow-2xl relative overflow-hidden transition-all duration-300`}>
                  
                  <span className="text-[10px] font-headline font-black text-[#8E8E93] tracking-[3px] block">
                    SCORE NUTRITION AUJOURD'HUI
                  </span>

                  {/* Main score digits */}
                  <div className="my-4 block relative">
                    <span className="text-6xl font-mono font-black text-[#FF9500] tracking-tighter drop-shadow-[0_0_20px_rgba(255,149,0,0.3)] block">
                      {nutritionScore}
                    </span>
                  </div>

                  <span className={`text-sm font-headline font-black tracking-widest block uppercase ${scoreConfig.color}`}>
                    {scoreConfig.label}
                  </span>

                  {/* Repas suivis info */}
                  <div className="flex items-center justify-center gap-1.5 text-md font-mono font-black text-white mt-3">
                    <UtensilsCrossed className="w-5 h-5 text-[#00D9A5]" />
                    <span>{mealsTracked}/5 repas</span>
                  </div>

                  {/* Objective comparative */}
                  <p className="text-xs text-gray-400 font-headline mt-1.5">
                    Objectif : 5/5 • Manque : {Math.max(0, 5 - mealsTracked)} repas
                  </p>

                  {/* Trend Badge */}
                  <div className="mt-4 inline-flex bg-[#FF2D55]/10 border border-[#FF2D55]/25 text-[#FF2D55] rounded-xl py-1 px-4 text-xs font-bold">
                    <span>↓ -8% vs hier</span>
                  </div>

                  {/* Macros quick view row */}
                  <div className="grid grid-cols-4 gap-1 mt-6 pt-4 border-t border-white/5 text-center">
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline block">Protéines</span>
                      <span className="text-xs font-mono font-black text-[#00D9A5]">{proteinCurrent}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline block">Glucides</span>
                      <span className="text-xs font-mono font-black text-[#FFD700]">{carbsCurrent}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline block">Lipides</span>
                      <span className="text-xs font-mono font-black text-[#4A90D9]">{fatsCurrent}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline block">Kcal</span>
                      <span className="text-xs font-mono font-black text-white">{caloriesCurrent}</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: REPAS DU JOUR (TRACKING LIST) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Tes Repas Aujourd'hui
                  </h3>

                  <div className="space-y-2.5">
                    {meals.map((meal) => (
                      <div 
                        key={meal.id}
                        className={`bg-[#16213E] rounded-2xl p-4 flex items-center justify-between border-l-3 transition-all relative overflow-hidden
                          ${meal.status === 'completed' ? 'border-[#00D9A5]' : 'border-[#FF9500]'}`}
                      >
                        <div className="flex gap-3 items-center flex-1 pr-2">
                          {/* Left icon wrapper */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/20`}>
                            {meal.icon === 'coffee' && <Coffee className="w-5 h-5 text-[#00D9A5]" />}
                            {meal.icon === 'apple' && <Apple className="w-5 h-5 text-[#00D9A5]" />}
                            {meal.icon === 'beef' && <Beef className="w-5 h-5 text-[#00D9A5]" />}
                            {meal.icon === 'cookie' && <Cookie className="w-5 h-5 text-[#FF9500]" />}
                            {meal.icon === 'moon' && <Moon className="w-5 h-5 text-[#FF2D55]" />}
                          </div>

                          <div className="text-left">
                            <h4 className="text-xs font-headline font-black text-white">{meal.title}</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{meal.description}</p>
                            <span className="text-[9px] font-mono text-gray-500 block mt-1">
                              P:{meal.macros.protein}g C:{meal.macros.carbs}g L:{meal.macros.fats}g • {meal.macros.calories} Kcal
                            </span>
                          </div>
                        </div>

                        {/* Status controls */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] font-mono text-gray-500">{meal.time}</span>
                          {meal.status === 'completed' ? (
                            <button 
                              onClick={() => handleToggleMeal(meal.id)}
                              className="w-7 h-7 rounded-full bg-[#00D9A5]/20 hover:bg-[#00D9A5]/30 flex items-center justify-center text-[#00D9A5] border border-[#00D9A5]/30 cursor-pointer"
                              title="Décocher"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => openAddMealModal(meal.type)}
                              className="h-8 px-3 bg-[#FF9500] hover:bg-[#FF9500]/90 text-[#0F0F1A] rounded-lg text-[10px] font-headline font-black uppercase tracking-wider cursor-pointer"
                            >
                              + AJOUTER
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Custom Add meal dotted trigger button */}
                    <button 
                      onClick={() => openAddMealModal('custom')}
                      className="w-full py-3.5 border border-dashed border-gray-600 rounded-2xl text-xs font-headline font-bold text-gray-400 hover:text-white hover:border-gray-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      AJOUTER UN REPAS PERSONNALISÉ
                    </button>
                  </div>
                </div>

                {/* SECTION 3: MACRONUTRIMENTS (PROGRESS RINGS) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Tes Macros
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-4 border border-white/5 grid grid-cols-4 gap-1.5 text-center">
                    
                    {/* Ring 1: Proteins */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="3.5" />
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" stroke="#00D9A5" strokeWidth="3.5" 
                            strokeDasharray={`${Math.min(100, Math.round((proteinCurrent / proteinTarget) * 100))} 100`} 
                          />
                        </svg>
                        <span className="absolute text-[10px] font-mono font-bold text-[#00D9A5]">{proteinCurrent}g</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-headline font-bold mt-1.5 block">Protéines</span>
                      <span className="text-[8px] text-gray-600 font-mono">{proteinTarget}g obj.</span>
                    </div>

                    {/* Ring 2: Carbs */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="3.5" />
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" stroke="#FFD700" strokeWidth="3.5" 
                            strokeDasharray={`${Math.min(100, Math.round((carbsCurrent / carbsTarget) * 100))} 100`} 
                          />
                        </svg>
                        <span className="absolute text-[10px] font-mono font-bold text-[#FFD700]">{carbsCurrent}g</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-headline font-bold mt-1.5 block">Glucides</span>
                      <span className="text-[8px] text-gray-600 font-mono">{carbsTarget}g obj.</span>
                    </div>

                    {/* Ring 3: Fats */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="3.5" />
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" stroke="#4A90D9" strokeWidth="3.5" 
                            strokeDasharray={`${Math.min(100, Math.round((fatsCurrent / fatsTarget) * 100))} 100`} 
                          />
                        </svg>
                        <span className="absolute text-[10px] font-mono font-bold text-[#4A90D9]">{fatsCurrent}g</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-headline font-bold mt-1.5 block">Lipides</span>
                      <span className="text-[8px] text-gray-600 font-mono">{fatsTarget}g obj.</span>
                    </div>

                    {/* Ring 4: Calories */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1A1A2E" strokeWidth="3.5" />
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" stroke="#FFFFFF" strokeWidth="3.5" 
                            strokeDasharray={`${Math.min(100, Math.round((caloriesCurrent / caloriesTarget) * 100))} 100`} 
                          />
                        </svg>
                        <span className="absolute text-[9px] font-mono font-bold text-white">{caloriesCurrent}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-headline font-bold mt-1.5 block">Kcal</span>
                      <span className="text-[8px] text-gray-600 font-mono">{caloriesTarget} obj.</span>
                    </div>

                  </div>
                </div>

                {/* SECTION 4: SUPPLÉMENTS (PROTOCOLE ALPHA) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Tes Suppléments
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 border border-white/5 space-y-4">
                    
                    <div className="space-y-1">
                      {supplements.map((s) => (
                        <div 
                          key={s.id}
                          onClick={() => handleToggleSupplement(s.id)}
                          className="flex items-center justify-between py-2 border-b border-[#1A1A2E] last:border-0 cursor-pointer hover:bg-white/2 px-1 transition-colors rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center flex-shrink-0">
                              {s.icon === 'pill' && <Pill className="w-4 h-4" style={{ color: s.color }} />}
                              {s.icon === 'droplet' && <Droplet className="w-4 h-4" style={{ color: s.color }} />}
                              {s.icon === 'sun' && <Sun className="w-4 h-4" style={{ color: s.color }} />}
                              {s.icon === 'zap' && <Zap className="w-4 h-4" style={{ color: s.color }} />}
                              {s.icon === 'leaf' && <Leaf className="w-4 h-4" style={{ color: s.color }} />}
                            </div>

                            <div className="text-left">
                              <h4 className="text-xs font-headline font-black text-white">{s.name}</h4>
                              <p className="text-[10px] text-gray-400 font-headline leading-none mt-0.5">{s.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[9px] font-mono text-gray-500">{s.time}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${s.taken ? 'bg-[#00D9A5] border-[#00D9A5]' : 'border-gray-500 bg-transparent'}`}>
                              {s.taken && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Supplements progress bar */}
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-[11px] text-[#8E8E93] font-headline">
                        <span>{numSupplementsTaken}/6 pris aujourd'hui</span>
                        <span className="font-bold text-[#00D9A5]">{Math.round((numSupplementsTaken / 6) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#00D9A5] rounded-full transition-all duration-500" 
                          style={{ width: `${(numSupplementsTaken / 6) * 100}%` }} 
                        />
                      </div>
                    </div>

                    {/* Modifier supps button */}
                    <button 
                      onClick={() => addToast('info', "Accès à l'éditeur de protocole de supplémentation...")}
                      className="w-full h-10 border border-[#00D9A5]/40 hover:bg-[#00D9A5]/10 text-[#00D9A5] rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
                    >
                      MODIFIER LE PROTOCOLE
                    </button>
                  </div>
                </div>

                {/* SECTION 5: ALIMENTS À ÉVITER (RED LIST) */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FF2D55] uppercase tracking-wider px-1">
                    Alertes Nutrition
                  </h3>

                  <div className="bg-[#FF2D55]/5 border border-[#FF2D55]/20 rounded-2xl p-5 space-y-4">
                    
                    <div className="space-y-2">
                      {redList.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2 text-left">
                            {item.icon === 'x-circle' ? (
                              <XCircle className="w-4.5 h-4.5 text-[#FF2D55]" />
                            ) : (
                              <AlertTriangle className="w-4.5 h-4.5 text-[#FF9500]" />
                            )}
                            <span className="text-xs font-headline text-white">{item.name}</span>
                          </div>
                          <span className={`text-[11px] font-mono font-bold ${item.severity === 'high' ? 'text-[#FF2D55]' : 'text-[#FF9500]'}`}>
                            {item.impact}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#FF2D55]/10 pt-3 text-center">
                      <p className="text-[11px] text-gray-400 font-headline flex items-center justify-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#FF2D55] fill-[#FF2D55]/10" />
                        <span>Ces aliments sabotent ta testostérone. Évite-les 90% du temps.</span>
                      </p>
                    </div>

                  </div>
                </div>

                {/* SECTION 6: GRAPHIQUE 7 JOURS */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    7 Derniers Jours
                  </h3>

                  <div className="bg-[#16213E] rounded-2xl p-5 shadow-lg border border-white/5 space-y-4">
                    
                    {/* Stacked representation graph */}
                    <div className="h-32 w-full relative flex items-end justify-between px-2 pt-6">
                      
                      {/* y=2800 kcal line */}
                      <div className="absolute left-0 right-0 border-t border-dashed border-[#00D9A5]/40" style={{ bottom: '75%' }}>
                        <span className="absolute -top-3 right-0 text-[8px] text-[#00D9A5] font-mono font-bold bg-[#16213E] px-1">Cible 2800 Kcal</span>
                      </div>

                      {weeklyData.map((d, i) => {
                        const protPct = (d.protein / 200) * 100;
                        const carbPct = (d.carbs / 300) * 100;
                        const fatPct = (d.fats / 100) * 100;
                        const totalHeight = `${Math.min(100, Math.round((d.calories / caloriesTarget) * 100))}%`;
                        
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                            <div className="h-24 w-full flex items-end justify-center relative">
                              <div 
                                className="w-6 rounded-t-sm transition-all group-hover:brightness-110 flex flex-col justify-end overflow-hidden"
                                style={{ height: totalHeight }}
                              >
                                <div className="w-full bg-[#4A90D9]" style={{ height: `${fatPct}%` }} title="Lipides" />
                                <div className="w-full bg-[#FFD700]" style={{ height: `${carbPct}%` }} title="Glucides" />
                                <div className="w-full bg-[#00D9A5]" style={{ height: `${protPct}%` }} title="Protéines" />
                              </div>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#0F0F1A] border border-white/10 rounded p-1.5 text-[8px] font-mono text-white whitespace-nowrap z-20">
                                P:{d.protein}g C:{d.carbs}g • {d.calories} Kcal
                              </div>
                            </div>
                            <span className="text-[9px] text-gray-500 font-headline mt-2">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legends for Stacked components */}
                    <div className="flex gap-4 justify-center mt-2 text-[9px] text-gray-400 font-headline">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#00D9A5] rounded-xs" />
                        <span>Protéines</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#FFD700] rounded-xs" />
                        <span>Glucides</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#4A90D9] rounded-xs" />
                        <span>Lipides</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 text-xs font-headline">
                      <span className="text-gray-400">Moyenne : <strong className="text-white">68% objectif</strong></span>
                      <span className="text-[#00D9A5] font-black">📈 En hausse cette semaine</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 7: CONSEIL SCIENTIFIQUE */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#00D9A5] rounded-r-xl p-4 space-y-2">
                  <div className="flex gap-3 items-start">
                    <Brain className="w-5 h-5 text-[#00D9A5] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Le zinc et le magnésium sont les 2 minéraux clés pour la testostérone. 30% des hommes sont carencés en zinc. Supplémente si ton alimentation ne couvre pas 15mg/jour.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Prasad AS. (2013). Zinc & Testosterone. Journal of Trace Elements in Medicine.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

              {/* SIMULATED BOTTOM TAB BAR */}
              <div className="h-16 border-t border-gray-950 bg-[#16213E] flex items-center justify-around px-4 z-10 select-none">
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#00D9A5] cursor-pointer">
                  <Beef className="w-5 h-5 text-[#00D9A5]" />
                  <span className="text-[9px] font-headline text-[#00D9A5]">Nutrition</span>
                  <div className="w-1 h-1 bg-[#00D9A5] rounded-full mt-0.5" />
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <span className="text-[9px] font-headline text-gray-400">Vitalité</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* SCIENCE SHEET MODAL */}
      {showScienceSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-md font-headline font-black text-[#00D9A5] uppercase tracking-wider">
                🔬 Science & Hormonothérapie
              </h3>
              <button 
                onClick={() => setShowScienceSheet(false)}
                className="text-gray-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-headline">
              La distribution nutritionnelle influence directement les taux d'androgènes circulants :
            </p>

            <ul className="space-y-2 text-xs text-gray-400 font-headline list-disc pl-4">
              <li>
                <strong className="text-white">Zinc & Magnésium :</strong> Co-facteurs indispensables à la biosynthèse de la testostérone libre et à la liaison SHBG.
              </li>
              <li>
                <strong className="text-white">Lipides saturés & monoinsaturés :</strong> Le cholestérol est le précurseur de base de toutes les hormones androgéniques. Un régime trop bas en gras réduit le taux de testo.
              </li>
              <li>
                <strong className="text-white">Phyto-œstrogènes & Alcool :</strong> Augmentent l'activité de l'aromatase, l'enzyme qui convertit la testostérone en œstrogènes.
              </li>
            </ul>

            <AlphaButton 
              variant="primary" 
              className="w-full h-10" 
              onClick={() => setShowScienceSheet(false)}
            >
              Compris, Chef
            </AlphaButton>
          </div>
        </div>
      )}

      {/* ADD MEAL MODAL */}
      {showAddMealModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <h3 className="text-md font-headline font-black text-[#FFD700] uppercase tracking-wider">
                🍳 Enregistrer un repas ({selectedMealType})
              </h3>
              <button 
                onClick={() => setShowAddMealModal(false)}
                className="text-gray-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-headline text-xs">
              <div>
                <label className="text-gray-400 uppercase tracking-wider block mb-1">Titre du Repas</label>
                <input 
                  type="text" 
                  value={customMealTitle}
                  onChange={(e) => setCustomMealTitle(e.target.value)}
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 uppercase tracking-wider block mb-1">Description / Contenu</label>
                <input 
                  type="text" 
                  value={customMealDesc}
                  onChange={(e) => setCustomMealDesc(e.target.value)}
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Protéines (g)</label>
                  <input 
                    type="number" 
                    value={customMealProt}
                    onChange={(e) => setCustomMealProt(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Glucides (g)</label>
                  <input 
                    type="number" 
                    value={customMealCarb}
                    onChange={(e) => setCustomMealCarb(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Lipides (g)</label>
                  <input 
                    type="number" 
                    value={customMealFat}
                    onChange={(e) => setCustomMealFat(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 uppercase tracking-wider block mb-1">Calories estimées (Kcal)</label>
                <input 
                  type="number" 
                  value={customMealKcal}
                  onChange={(e) => setCustomMealKcal(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#16213E] border border-[#1C1C3A] rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <AlphaButton 
                variant="secondary" 
                className="flex-1 h-10" 
                onClick={() => setShowAddMealModal(false)}
              >
                Annuler
              </AlphaButton>
              <AlphaButton 
                variant="primary" 
                className="flex-1 h-10" 
                onClick={handleSaveMeal}
              >
                Consommer Repas
              </AlphaButton>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
