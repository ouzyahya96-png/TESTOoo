import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { EDUCATION_LESSONS } from './src/pattern_killer/educationLessons';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-memory weights state simulating the ML model feedback loop
let serverWeights: Record<string, number> = {
  timeOfDay: 0.25,
  dayOfWeek: 0.15,
  sleepQuality: 0.15,
  stressLevel: 0.20,
  mood: 0.10,
  streak: 0.05,
  socialMedia: 0.05,
  location: 0.05,
};

// API Endpoint 1: Pattern Risk Prediction
app.post('/api/pattern/predict', (req, res) => {
  try {
    const { timeOfDay, dayOfWeek, sleepQuality, stressLevel, mood, streakDays, socialMedia, locationRisk } = req.body;

    const time = parseFloat(timeOfDay) ?? 12;
    const day = parseInt(dayOfWeek) ?? 1;
    const sleep = parseFloat(sleepQuality) ?? 7;
    const stress = parseFloat(stressLevel) ?? 5;
    const moodVal = parseFloat(mood) ?? 5;
    const streak = parseInt(streakDays) ?? 0;
    const social = parseFloat(socialMedia) ?? 30;
    const loc = parseFloat(locationRisk) ?? 0.5;

    // Normalization corresponding to Python FastAPI
    const timeNorm = (time >= 20 || time <= 4) ? 0.95 : (time >= 12 && time <= 14) ? 0.5 : 0.2;
    const dayNorm = (day === 6 || day === 7) ? 0.90 : 0.35;
    const sleepNorm = (10 - sleep) / 10;
    const stressNorm = stress / 10;
    const moodNorm = (10 - moodVal) / 10;

    let streakNorm = 0.3;
    if ([7, 14, 30].includes(streak)) {
      streakNorm = 0.95;
    } else if (streak < 3) {
      streakNorm = 0.80;
    } else {
      streakNorm = Math.max(0.1, 0.6 - (streak * 0.01));
    }

    const socialNorm = Math.min(1.0, social / 120);
    const locNorm = loc;

    // Linear weighted sum using local weights
    const weightedSum = (
      timeNorm * serverWeights.timeOfDay +
      dayNorm * serverWeights.dayOfWeek +
      sleepNorm * serverWeights.sleepQuality +
      stressNorm * serverWeights.stressLevel +
      moodNorm * serverWeights.mood +
      streakNorm * serverWeights.streak +
      socialNorm * serverWeights.socialMedia +
      locNorm * serverWeights.location
    );

    // Sigmoid function
    const x = (weightedSum - 0.5) * 6;
    const sigmoidValue = 1 / (1 + Math.exp(-x));
    const riskScore = Math.round(sigmoidValue * 100);

    let riskCategory: 'GREEN' | 'ORANGE' | 'RED' = 'GREEN';
    if (riskScore > 60) riskCategory = 'RED';
    else if (riskScore > 30) riskCategory = 'ORANGE';

    res.json({
      userId: 'ALPHA_SOLDIER_1',
      riskScore,
      riskCategory,
      weights: serverWeights,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to predict risk', message: error.message });
  }
});

// API Endpoint 2: ML Model Training Feedback
app.post('/api/pattern/feedback', (req, res) => {
  try {
    const { factors, resisted } = req.body;
    const learningRate = 0.05;

    const time = parseFloat(factors?.timeOfDay) ?? 12;
    const day = parseInt(factors?.dayOfWeek) ?? 1;
    const sleep = parseFloat(factors?.sleepQuality) ?? 7;
    const stress = parseFloat(factors?.stressLevel) ?? 5;
    const moodVal = parseFloat(factors?.mood) ?? 5;
    const streak = parseInt(factors?.streakDays) ?? 0;
    const social = parseFloat(factors?.socialMediaMinutes) ?? 30;
    const loc = parseFloat(factors?.locationRisk) ?? 0.5;

    const factorsNorm = {
      timeOfDay: (time >= 20 || time <= 4) ? 0.9 : 0.3,
      dayOfWeek: [6, 7].includes(day) ? 0.8 : 0.3,
      sleepQuality: (10 - sleep) / 10,
      stressLevel: stress / 10,
      mood: (10 - moodVal) / 10,
      streak: [7, 14, 30].includes(streak) ? 0.9 : 0.4,
      socialMedia: Math.min(1.0, social / 120),
      location: loc,
    };

    let totalChange = 0;
    Object.keys(serverWeights).forEach((key) => {
      const val = factorsNorm[key as keyof typeof factorsNorm] ?? 0.5;
      const currentW = serverWeights[key];
      let change = 0;

      if (!resisted) {
        change = learningRate * val * (1.0 - currentW);
      } else {
        change = -learningRate * val * currentW;
      }

      serverWeights[key] = Math.max(0.01, Math.min(0.95, currentW + change));
      totalChange += Math.abs(change);
    });

    const sum = Object.values(serverWeights).reduce((acc, v) => acc + v, 0);
    Object.keys(serverWeights).forEach((key) => {
      serverWeights[key] = Math.round((serverWeights[key] / sum) * 1000) / 1000;
    });

    res.json({
      status: 'success',
      message: `Réseau neuronal mis à jour (Delta: ${totalChange.toFixed(4)})`,
      newWeights: serverWeights,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update feedback model', message: error.message });
  }
});

// API Endpoint: Kegel Dashboard Data
app.get('/api/kegel/dashboard/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    res.json({
      userId,
      streak: 12,
      currentLevelId: 4,
      currentLevelName: "WARRIOR",
      levelProgressPercent: 67,
      sessionsNeeded: 12,
      stats: {
        force: 67,
        endurance: "4m30",
        contractions: 150
      },
      dailySession: {
        timer: "12:00",
        level: "Niveau 4 — WARRIOR",
        details: "15 contractions × 3 séries",
        timerDetails: "Tenue : 7 sec | Relâchement : 7 sec",
        nextTime: "Prochaine séance : 20h00"
      },
      recentHistory: [
        { id: "1", date: "Aujourd'hui", status: "completed", details: "15 min • Niveau 4 • 45 contractions" },
        { id: "2", date: "Hier", status: "completed", details: "15 min • Niveau 4 • 45 contractions" },
        { id: "3", date: "Sam 11 Juil", status: "completed", details: "15 min • Niveau 4 • 45 contractions" },
        { id: "4", date: "Ven 10 Juil", status: "missed", details: "Niveau 4 • Séance manquée" },
        { id: "5", date: "Jeu 9 Juil", status: "completed", details: "12 min • Niveau 3 • 30 contractions" }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve Kegel dashboard', message: error.message });
  }
});

// API Endpoint: Kegel Biofeedback History Data
app.get('/api/kegel/biofeedback/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const period = (req.query.period as string) || '7d';
    
    // Generate dates & values depending on selected period
    let forceData: any[] = [];
    if (period === '7d' || period === '7J') {
      forceData = [
        { date: "07/07", value: 65 },
        { date: "08/07", value: 68 },
        { date: "09/07", value: 67 },
        { date: "10/07", value: 72 },
        { date: "11/07", value: 70 },
        { date: "12/07", value: 75 },
        { date: "Aujourd'hui", value: 78 }
      ];
    } else if (period === '30d' || period === '30J') {
      forceData = [
        { date: "15/06", value: 55 },
        { date: "20/06", value: 58 },
        { date: "25/06", value: 62 },
        { date: "30/06", value: 65 },
        { date: "05/07", value: 70 },
        { date: "10/07", value: 74 },
        { date: "Aujourd'hui", value: 78 }
      ];
    } else {
      forceData = [
        { date: "Jan", value: 45 },
        { date: "Fév", value: 50 },
        { date: "Mar", value: 58 },
        { date: "Avr", value: 64 },
        { date: "Mai", value: 70 },
        { date: "Juin", value: 74 },
        { date: "Juil", value: 78 }
      ];
    }

    const enduranceData = [
      { day: "Lun", value: 210, goal: 300 },
      { day: "Mar", value: 240, goal: 300 },
      { day: "Mer", value: 220, goal: 300 },
      { day: "Jeu", value: 250, goal: 300 },
      { day: "Ven", value: 270, goal: 300 },
      { day: "Sam", value: 260, goal: 300 },
      { day: "Dim", value: 280, goal: 300 }
    ];

    res.json({
      userId,
      globalScore: 78,
      scorePercentile: 78,
      scoreTrend: 12,
      selectedPeriod: period,
      forceData,
      enduranceData
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve biofeedback data', message: error.message });
  }
});

// API Endpoint: Kegel Skill Radar Data
app.get('/api/kegel/radar/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    res.json({
      userId,
      radarData: {
        current: { force: 78, endurance: 72, speed: 80, control: 65, consistency: 85 },
        previous: { force: 70, endurance: 68, speed: 75, control: 60, consistency: 80 }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve radar data', message: error.message });
  }
});

// API Endpoint: Detailed Stats List
app.get('/api/kegel/stats/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    res.json({
      userId,
      detailedStats: {
        totalContractions: 1247,
        contractionsTrend: 340,
        totalTrainingTime: "18h 42m",
        trainingTimeTrend: "+2h 15m",
        completedSessions: 89,
        completedTrend: 12,
        missedSessions: 7,
        missedTrend: -3,
        streakDays: 12,
        streakRecord: 23,
        maxForce: 87,
        maxForceDate: "Le 10 Juillet"
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve detailed stats', message: error.message });
  }
});

// API Endpoint: Weekly Report Summary
app.get('/api/kegel/weekly-report/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    res.json({
      userId,
      weeklyReport: {
        summary: "Cette semaine : 12 séances, +15% force, +45s endurance. Tu progresses plus vite que 82% des utilisateurs.",
        suggestion: "💡 Suggestion : Augmente la durée de tenue de 2 secondes la semaine prochaine."
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve weekly report', message: error.message });
  }
});

// API Endpoint: Bluetooth Devices Scan List
app.get('/api/biofeedback/devices', (req, res) => {
  try {
    res.json({
      devices: [
        { id: "dev_1", name: "Perifit Pro", battery: 92, supported: true },
        { id: "dev_2", name: "kGoal Boost", battery: 74, supported: true },
        { id: "dev_3", name: "Elvie Trainer", battery: 85, supported: true },
        { id: "dev_4", name: "MyKegel Smart Sensor", battery: 100, supported: true }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list biofeedback devices', message: error.message });
  }
});

// API Endpoint: Connect Device
let connectedDevice: any = null;
app.post('/api/biofeedback/connect', express.json(), (req, res) => {
  try {
    const { deviceId, name } = req.body;
    connectedDevice = {
      connected: true,
      id: deviceId || "dev_1",
      name: name || "Perifit Pro",
      battery: 88,
      lastReading: 45 // 45mV baseline
    };
    res.json({ success: true, device: connectedDevice });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to connect device', message: error.message });
  }
});

// API Endpoint: Disconnect Device
app.post('/api/biofeedback/disconnect', (req, res) => {
  try {
    connectedDevice = null;
    res.json({ success: true, device: { connected: false, name: null, battery: null, lastReading: null } });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to disconnect device', message: error.message });
  }
});

// API Endpoint: Get Complementary Exercises List
app.get('/api/exercises', (req, res) => {
  try {
    const category = req.query.category as string || 'all';
    
    const allExercises = [
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

    const filtered = category === 'all' 
      ? allExercises 
      : allExercises.filter(ex => ex.category === category);

    res.json({ exercises: filtered });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve exercises', message: error.message });
  }
});

// API Endpoint: Get Weekly Program (Elite+)
app.get('/api/exercises/weekly-program/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    res.json({
      userId,
      weeklyProgram: [
        { day: "LUN", exercises: "Squats profonds + Kegel Niv.4", duration: 15, completed: true },
        { day: "MAR", exercises: "Ponts fessiers + Respiration", duration: 12, completed: true },
        { day: "MER", exercises: "Planche (Plank) + Wim Hof", duration: 10, completed: false },
        { day: "JEU", exercises: "90/90 Stretch + Superman", duration: 14, completed: false },
        { day: "VEN", exercises: "Bird-Dog + Box Breathing", duration: 15, completed: false }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve weekly program', message: error.message });
  }
});

// API Endpoint: Get Daily Tip
app.get('/api/exercises/daily-tip/:userId', (req, res) => {
  try {
    res.json({
      tip: "💡 Combine toujours tes exercices de renforcement avec une séance Kegel. L'effet synergique augmente tes résultats de 40%."
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve daily tip', message: error.message });
  }
});

// In-memory store for Progress Photos metadata (simulating cloud backup)
let progressPhotosStore: Record<string, any[]> = {
  'ALPHA_SOLDIER_1': [
    {
      id: "photo_before_1",
      uri: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
      date: "2026-05-29T08:00:00.000Z",
      type: "before",
      levelAtCapture: 4,
      faceBlurred: true
    },
    {
      id: "photo_after_1",
      uri: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
      date: "2026-07-13T08:00:00.000Z",
      type: "after",
      levelAtCapture: 5,
      faceBlurred: true
    }
  ]
};

// API Endpoint: Get Progress Photos Metadata
app.get('/api/photos/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const photos = progressPhotosStore[userId] || [];
    res.json({ photos });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve photos metadata', message: error.message });
  }
});

// API Endpoint: Add Progress Photo Metadata
app.post('/api/photos/:userId', express.json(), (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const { id, uri, date, type, levelAtCapture, faceBlurred } = req.body;
    
    if (!id || !uri) {
      return res.status(400).json({ error: 'Missing photo id or uri' });
    }

    if (!progressPhotosStore[userId]) {
      progressPhotosStore[userId] = [];
    }

    const newPhoto = {
      id,
      uri,
      date: date || new Date().toISOString(),
      type: type || 'progress',
      levelAtCapture: levelAtCapture || 1,
      faceBlurred: faceBlurred !== undefined ? faceBlurred : true
    };

    progressPhotosStore[userId].push(newPhoto);
    res.status(201).json({ success: true, photo: newPhoto });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save photo metadata', message: error.message });
  }
});

// API Endpoint: Delete All Photos
app.delete('/api/photos/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    progressPhotosStore[userId] = [];
    res.json({ success: true, message: 'All photos deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete photos', message: error.message });
  }
});


// API Endpoints for AI Engine (Specification 7.1)
let activatedRecommendations: Record<string, boolean> = {};

let serverSettings: Record<string, any> = {
  'ALPHA_SOLDIER_1': {
    coachTone: 'spartan',
    notificationFrequency: 'smart',
    sensitivity: 'moderate',
    urgeSurfDurationSeconds: 90,
    permissions: {
      contractile: true,
      sleep: true,
      stress: true,
      screenTime: true,
      urges: true,
      coldExposure: true
    }
  }
};

app.get('/api/ai-engine/:userId/settings', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const settings = serverSettings[userId] || {
      coachTone: 'spartan',
      notificationFrequency: 'smart',
      sensitivity: 'moderate',
      urgeSurfDurationSeconds: 90,
      permissions: {
        contractile: true,
        sleep: true,
        stress: true,
        screenTime: true,
        urges: true,
        coldExposure: true
      }
    };
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve settings', message: error.message });
  }
});

app.put('/api/ai-engine/:userId/settings', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const { settings } = req.body;
    if (settings) {
      serverSettings[userId] = settings;
      
      // Dynamic weight modulation: if permission is disabled, set its weight to 0 and normalize remaining weights
      const defaultWeights = {
        timeOfDay: 0.25,
        dayOfWeek: 0.15,
        sleepQuality: 0.15,
        stressLevel: 0.20,
        mood: 0.10,
        streak: 0.05,
        socialMedia: 0.05,
        location: 0.05,
      };

      const activeWeights = { ...defaultWeights };
      
      // Adjust weights based on permissions toggled in AISettingsScreen
      if (!settings.permissions.sleep) activeWeights.sleepQuality = 0;
      if (!settings.permissions.stress) {
        activeWeights.stressLevel = 0;
        activeWeights.mood = 0;
      }
      if (!settings.permissions.screenTime) activeWeights.socialMedia = 0;
      
      // Normalize remaining weights
      const totalActive = Object.values(activeWeights).reduce((a, b) => a + b, 0);
      if (totalActive > 0) {
        Object.keys(activeWeights).forEach((key) => {
          serverWeights[key] = Math.round((activeWeights[key as keyof typeof activeWeights] / totalActive) * 1000) / 1000;
        });
      }
    }
    res.json({ success: true, settings: serverSettings[userId] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update settings', message: error.message });
  }
});

app.post('/api/ai-engine/:userId/reset', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    
    // Reset weights
    serverWeights = {
      timeOfDay: 0.25,
      dayOfWeek: 0.15,
      sleepQuality: 0.15,
      stressLevel: 0.20,
      mood: 0.10,
      streak: 0.05,
      socialMedia: 0.05,
      location: 0.05,
    };

    // Clear photos
    progressPhotosStore[userId] = [];

    // Reset recommendations
    activatedRecommendations = {};

    // Reset settings
    serverSettings[userId] = {
      coachTone: 'spartan',
      notificationFrequency: 'smart',
      sensitivity: 'moderate',
      urgeSurfDurationSeconds: 90,
      permissions: {
        contractile: true,
        sleep: true,
        stress: true,
        screenTime: true,
        urges: true,
        coldExposure: true
      }
    };

    res.json({ success: true, message: 'Confidentiality reset completed. Sovereign state restored.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset sovereign state', message: error.message });
  }
});

app.get('/api/ai-engine/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    
    // Simulating rich analysis results mapped with realistic user stats (Kegel, sleep, cold exposure, etc.)
    res.json({
      userId,
      globalScore: 84,
      scoreTrend: "+6%",
      priorityRecommendation: {
        id: "rec_sleep_1",
        title: "Dors avant 23:00 ce soir",
        reason: "Tes 3 dernières alertes de surcharge de stress (urges) coïncident statistiquement avec des nuits de moins de 6h15.",
        actionLabel: "Activer le rappel Sommeil",
        activated: activatedRecommendations["rec_sleep_1"] || false
      },
      insights: [
        {
          id: "insight_1",
          type: "correlation",
          title: "Sommeil ↔ Force Kegel",
          description: "Les jours après une nuit de sommeil profond ≥ 85%, ta force d'amplitude musculaire augmente de 18%. Le repos nourrit le système nerveux pelvien.",
          metric: "7h42 moyen",
          status: "optimal"
        },
        {
          id: "insight_2",
          type: "prediction",
          title: "Fenêtre à risque prévue",
          description: "Modèle prédictif : risque d'impulsion comportementale estimé à 74% demain entre 21h30 et 23h00 (fatigue + heure tardive). Reste sur tes gardes.",
          metric: "Dimanche soir",
          status: "warning"
        },
        {
          id: "insight_3",
          type: "alert",
          title: "Surcharge cognitive détectée",
          description: "Ton temps d'écran cumulé hier a dépassé 4h20, augmentant ton stress mental de 25%. Ce soir, privilégie 10min de Respiration Wim Hof.",
          metric: "+25% cortisol",
          status: "alert"
        },
        {
          id: "insight_4",
          type: "synergy",
          title: "Synergie Froid ↔ Testostérone",
          description: "La combinaison de l'exposition au froid à 12°C et de ta séance de Kegel matinale crée un pic d'énergie durable mesuré à +35%.",
          metric: "+35% énergie",
          status: "success"
        }
      ],
      weeklyReport: {
        summary: "Semaine d'excellence globale, soldée par un streak Kegel de 12 jours consécutifs et une régularité de sommeil en hausse de 5%. Ton système d'auto-discipline neuro-comportementale s'est renforcé.",
        streakDays: 12,
        avgMood: 7.8,
        avgSleepQuality: 85,
        sessionsCompleted: 11,
        sessionsTotal: 12,
        activeUrgesResisted: 9
      },
      modelTransparency: {
        dataPoints: [
          { name: "Force & amplitude contractile", source: "Capteur Perifit / kGoal", weight: "25%" },
          { name: "Qualité & régularité du sommeil", source: "Clinique du Sommeil / Capteurs", weight: "20%" },
          { name: "Stress & humeur auto-déclarés", source: "Journal de bord", weight: "15%" },
          { name: "Temps d'écran & médias sociaux", source: "Données locales de l'appareil", weight: "15%" },
          { name: "Fréquence & historique des urges", source: "Pattern Killer", weight: "15%" },
          { name: "Température d'exposition au froid", source: "Protocole Glace", weight: "10%" }
        ],
        note: "Le calcul de synergie s'effectue localement via un réseau de neurones de régression bayésienne. Aucune donnée d'évaluation brute ou comportementale ne quitte ton espace privé.",
        version: "AlphaEngine v2.4 (CJS-Hybrid)"
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve AI Engine report', message: error.message });
  }
});

app.post('/api/ai-engine/:userId/recommendation/activate', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const { id } = req.body;
    
    if (id) {
      activatedRecommendations[id] = true;
    }
    
    res.json({
      success: true,
      message: "Recommandation d'optimisation activée avec succès ! Rappel synchronisé.",
      id
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to activate recommendation', message: error.message });
  }
});


// API Endpoints for Retrospective Weekly Report (Specification 4.3)
app.get('/api/ai-engine/:userId/weekly-report', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const weekOffset = parseInt(req.query.weekOffset as string) || 0;

    // Return empty state if offset is in the future or too far in the past
    if (weekOffset > 0 || weekOffset < -3) {
      return res.json({ success: true, weeklyData: null });
    }

    const reports: Record<number, any> = {
      0: {
        weekLabel: "13 - 19 Juillet 2026",
        avgScore: 78,
        dailyScores: [
          { day: "Lun", score: 72 },
          { day: "Mar", score: 60 },
          { day: "Mer", score: 85 },
          { day: "Jeu", score: 78 },
          { day: "Ven", score: 90 },
          { day: "Sam", score: 82 },
          { day: "Dim", score: 79 }
        ],
        bestDay: { day: "Ven", score: 90 },
        worstDay: { day: "Mar", score: 60 },
        comparison: {
          streak: { value: 12, delta: "+2j", trend: "up" },
          avgMood: { value: 7.8, delta: "+0.5", trend: "up" },
          avgEnergy: { value: "85%", delta: "+5%", trend: "up" },
          sessionsCompleted: { value: "11 / 12", delta: "+1", trend: "up" }
        },
        pillarBreakdown: [
          { pillar: "pattern", percentage: 92, color: "#FF2D55", label: "Pattern Killer" },
          { pillar: "kegel", percentage: 85, color: "#00D9A5", label: "Kegel Coach" },
          { pillar: "sleep", percentage: 78, color: "#4A90D9", label: "Sommeil" },
          { pillar: "nutrition", percentage: 70, color: "#FFD700", label: "Nutrition" },
          { pillar: "journal", percentage: 60, color: "#8E8E93", label: "Journal" }
        ],
        correlations: [
          { id: "corr_0_1", text: "Les jours où tu dors moins de 6h, ton risque de pré-impulsion (urge) double le lendemain soir.", strength: "forte" },
          { id: "corr_0_2", text: "Une douche froide d'au moins 2 minutes réduit de 40% l'apparition des crises de stress en soirée.", strength: "forte" },
          { id: "corr_0_3", text: "Ta force de contraction Kegel maximale montre un gain relatif de 18% les jours post-sommeil profond.", strength: "modérée" }
        ],
        bestMoment: "Mercredi, tu as résisté à une urge à 22h après une journée de 9h de sommeil.",
        watchPoint: "Les dimanches soirs restent ton moment le plus fragile, 3 semaines de suite.",
        nextWeekFocus: {
          title: "Programme ton rappel Sommeil 30 minutes plus tôt",
          reason: "C'est la variable qui a eu le plus d'impact sur ton score de transformation cette semaine."
        }
      },
      [-1]: {
        weekLabel: "06 - 12 Juillet 2026",
        avgScore: 74,
        dailyScores: [
          { day: "Lun", score: 80 },
          { day: "Mar", score: 71 },
          { day: "Mer", score: 65 },
          { day: "Jeu", score: 73 },
          { day: "Ven", score: 75 },
          { day: "Sam", score: 85 },
          { day: "Dim", score: 69 }
        ],
        bestDay: { day: "Sam", score: 85 },
        worstDay: { day: "Mer", score: 65 },
        comparison: {
          streak: { value: 10, delta: "+3j", trend: "up" },
          avgMood: { value: 7.3, delta: "+0.2", trend: "up" },
          avgEnergy: { value: "80%", delta: "-2%", trend: "down" },
          sessionsCompleted: { value: "10 / 12", delta: "+2", trend: "up" }
        },
        pillarBreakdown: [
          { pillar: "pattern", percentage: 88, color: "#FF2D55", label: "Pattern Killer" },
          { pillar: "kegel", percentage: 80, color: "#00D9A5", label: "Kegel Coach" },
          { pillar: "sleep", percentage: 70, color: "#4A90D9", label: "Sommeil" },
          { pillar: "nutrition", percentage: 75, color: "#FFD700", label: "Nutrition" },
          { pillar: "journal", percentage: 55, color: "#8E8E93", label: "Journal" }
        ],
        correlations: [
          { id: "corr_1_1", text: "L'absence de séances de respiration Wim Hof augmente ton anxiété latente de 25% les vendredis.", strength: "forte" },
          { id: "corr_1_2", text: "Chaque session d'apnée réussie décale l'envie impulsive moyenne de 4 heures.", strength: "modérée" }
        ],
        bestMoment: "Samedi, record d'exposition au froid à 11°C pendant 4 minutes d'affilée.",
        watchPoint: "Sommeil irrégulier durant le milieu de semaine (couchers tardifs après minuit).",
        nextWeekFocus: {
          title: "Intègre 5 minutes d'apnée guidée avant d'ouvrir les écrans",
          reason: "Le calme matinal régule ta tension et renforce ton cortex préfrontal pour la journée."
        }
      },
      [-2]: {
        weekLabel: "29 Juin - 05 Juillet 2026",
        avgScore: 81,
        dailyScores: [
          { day: "Lun", score: 75 },
          { day: "Mar", score: 82 },
          { day: "Mer", score: 88 },
          { day: "Jeu", score: 80 },
          { day: "Ven", score: 84 },
          { day: "Sam", score: 79 },
          { day: "Dim", score: 78 }
        ],
        bestDay: { day: "Mer", score: 88 },
        worstDay: { day: "Lun", score: 75 },
        comparison: {
          streak: { value: 7, delta: "-4j", trend: "down" },
          avgMood: { value: 7.1, delta: "-0.5", trend: "down" },
          avgEnergy: { value: "82%", delta: "+1%", trend: "up" },
          sessionsCompleted: { value: "8 / 12", delta: "-3", trend: "down" }
        },
        pillarBreakdown: [
          { pillar: "pattern", percentage: 85, color: "#FF2D55", label: "Pattern Killer" },
          { pillar: "kegel", percentage: 75, color: "#00D9A5", label: "Kegel Coach" },
          { pillar: "sleep", percentage: 82, color: "#4A90D9", label: "Sommeil" },
          { pillar: "nutrition", percentage: 80, color: "#FFD700", label: "Nutrition" },
          { pillar: "journal", percentage: 65, color: "#8E8E93", label: "Journal" }
        ],
        correlations: [
          { id: "corr_2_1", text: "Surcharges de travail cumulées corrélées à une baisse immédiate de la rigueur nutritionnelle.", strength: "forte" }
        ],
        bestMoment: "Mardi, séance de Kegel parfaite avec un score de contraction évalué à 95% d'amplitude.",
        watchPoint: "Un relâchement de discipline le dimanche soir lié à l'anxiété de début de semaine.",
        nextWeekFocus: {
          title: "Écris 3 lignes dans ton journal de bord chaque soir avant 22h",
          reason: "L'extériorisation écrite de tes pensées de combat soulage immédiatement le système nerveux."
        }
      },
      [-3]: {
        weekLabel: "22 - 28 Juin 2026",
        avgScore: 68,
        dailyScores: [
          { day: "Lun", score: 60 },
          { day: "Mar", score: 62 },
          { day: "Mer", score: 70 },
          { day: "Jeu", score: 65 },
          { day: "Ven", score: 68 },
          { day: "Sam", score: 72 },
          { day: "Dim", score: 79 }
        ],
        bestDay: { day: "Dim", score: 79 },
        worstDay: { day: "Lun", score: 60 },
        comparison: {
          streak: { value: 11, delta: "Stable", trend: "stable" },
          avgMood: { value: 7.6, delta: "+0.1", trend: "up" },
          avgEnergy: { value: "81%", delta: "Stable", trend: "stable" },
          sessionsCompleted: { value: "11 / 12", delta: "Stable", trend: "stable" }
        },
        pillarBreakdown: [
          { pillar: "pattern", percentage: 75, color: "#FF2D55", label: "Pattern Killer" },
          { pillar: "kegel", percentage: 68, color: "#00D9A5", label: "Kegel Coach" },
          { pillar: "sleep", percentage: 72, color: "#4A90D9", label: "Sommeil" },
          { pillar: "nutrition", percentage: 65, color: "#FFD700", label: "Nutrition" },
          { pillar: "journal", percentage: 60, color: "#8E8E93", label: "Journal" }
        ],
        correlations: [
          { id: "corr_3_1", text: "Tes journées à faible hydratation augmentent la sensation physique de fatigue de 30%.", strength: "modérée" }
        ],
        bestMoment: "Vendredi soir, résistance héroïque face à une urge massive après l'entraînement de musculation.",
        watchPoint: "Insuffisance d'hydratation hydrique sur le début de semaine (seulement 3 verres par jour).",
        nextWeekFocus: {
          title: "Valide tes 8 verres d'eau pure quotidiennement sans faute",
          reason: "Une hydratation cellulaire active permet d'accélérer l'élimination des toxines et le focus."
        }
      }
    };

    res.json({ success: true, weeklyData: reports[weekOffset] || null });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve weekly report', message: error.message });
  }
});

app.post('/api/ai-engine/:userId/weekly-report/apply-focus', (req, res) => {
  try {
    const { focus, weekOffset } = req.body;
    res.json({ success: true, message: "Focus d'Habitude enregistré avec succès.", focus, weekOffset });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to apply weekly focus', message: error.message });
  }
});

app.get('/api/ai-engine/:userId/weekly-report/export', (req, res) => {
  try {
    const weekOffset = parseInt(req.query.weekOffset as string) || 0;
    const weekLabels: Record<number, string> = {
      0: "13 - 19 Juillet 2026",
      [-1]: "06 - 12 Juillet 2026",
      [-2]: "29 Juin - 05 Juillet 2026",
      [-3]: "22 - 28 Juin 2026"
    };
    const label = weekLabels[weekOffset] || "Période Inconnue";

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Rapport_Hebdomadaire_AlphaMan_Offset_${weekOffset}.pdf`);

    // We output a clean, simulated text-based PDF content representing the retrieved metrics
    const pdfData = 
      `%PDF-1.4\n` +
      `%ALPHA MAN Retrospective report\n` +
      `1 0 obj <\n` +
      `/Type /Catalog\n` +
      `/Pages 2 0 R\n` +
      `>> endobj\n` +
      `2 0 obj <\n` +
      `/Type /Pages\n` +
      `/Kids [3 0 R]\n` +
      `/Count 1\n` +
      `>> endobj\n` +
      `3 0 obj <\n` +
      `/Type /Page\n` +
      `/Parent 2 0 R\n` +
      `/Resources << /Font << /F1 4 0 R >> >>\n` +
      `/MediaBox [0 0 595 842]\n` +
      `/Contents 5 0 R\n` +
      `>> endobj\n` +
      `4 0 obj <\n` +
      `/Type /Font\n` +
      `/Subtype /Type1\n` +
      `/BaseFont /Helvetica-Bold\n` +
      `>> endobj\n` +
      `5 0 obj <\n` +
      `/Length 400\n` +
      `>> stream\n` +
      `BT\n` +
      `/F1 18 Tf\n` +
      `50 780 Td (RAPPORT RETROSPECTIF HEBDOMADAIRE - ALPHA MAN) Tj\n` +
      `/F1 12 Tf\n` +
      `0 -40 Td (Utilisateur: ALPHA_SOLDIER_1) Tj\n` +
      `0 -20 Td (Semaine: ${label}) Tj\n` +
      `0 -40 Td (SCORE GLOBAL DE SYNERGIE DE VIE: 78/100) Tj\n` +
      `0 -20 Td (Optimisation Souveraine des Piliers de Force) Tj\n` +
      `0 -40 Td (- Streak de combat: 12 Jours (+2j vs semaine derniere)) Tj\n` +
      `0 -20 Td (- Sommeil moyen de recuperation: 85%) Tj\n` +
      `0 -20 Td (- Seances d'entrainement pelvienne Kegel accomplies: 11 / 12) Tj\n` +
      `0 -20 Td (- Resistance active aux impulsions (Pattern Killer): 9 urges evitees) Tj\n` +
      `0 -40 Td (CORRELATIONS SIGNIFICATIVES DE COHERENCE LOCALES:) Tj\n` +
      `0 -20 Td (1. Un sommeil de qualite < 6h double le risque de pre-impulsion le lendemain soir.) Tj\n` +
      `0 -20 Td (2. L'exposition au froid diminue l'intensite des urges de 15%.) Tj\n` +
      `0 -40 Td (FOCUS D'ACTION RECOMMANDATION UNIQUE POUR LA SEMAINE PROCHAINE:) Tj\n` +
      `0 -20 Td (Focus: Programme ton rappel Sommeil 30 minutes plus tot.) Tj\n` +
      `0 -20 Td (Raison: Optimiser la recuperation pour immuniser le cortex contre les impulsions tardives.) Tj\n` +
      `ET\n` +
      `endstream\n` +
      `endobj\n` +
      `xref\n` +
      `0 6\n` +
      `0000000000 65535 f\n` +
      `0000000015 00000 n\n` +
      `0000000074 00000 n\n` +
      `0000000134 00000 n\n` +
      `0000000244 00000 n\n` +
      `0000000311 00000 n\n` +
      `trailer <<\n` +
      `/Size 6\n` +
      `/Root 1 0 R\n` +
      `>>\n` +
      `startxref\n` +
      `795\n` +
      `%%EOF\n`;

    res.send(Buffer.from(pdfData, 'utf-8'));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export PDF weekly report', message: error.message });
  }
});


// State store for preventive action commitments
const preventiveActionStatus: Record<string, 'pending' | 'committed' | 'snoozed'> = {
  "rec_action_1": "pending",
  "rec_action_2": "pending",
  "rec_action_3": "pending"
};

// API Endpoints for AI Predictions Screen (Specification 4.4)
app.get('/api/ai-engine/:userId/predictions/today', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    const settings = serverSettings[userId] || { sensitivity: 'moderate' };
    
    // Map sensitivity
    let sensitivityLabel: 'cautious' | 'balanced' | 'precise' = 'balanced';
    if (settings.sensitivity === 'low') sensitivityLabel = 'precise';
    if (settings.sensitivity === 'high') sensitivityLabel = 'cautious';

    // Generates hourly risk curve for today (24 hours)
    const hourlyRisk = Array.from({ length: 24 }, (_, hour) => {
      let riskPercent = 12; // default low
      let reason = "Indice de base - Activités habituelles stables";

      if (hour >= 21 && hour <= 23) {
        riskPercent = 72;
        reason = "Créneau historique de vulnérabilité tardive + fatigue cognitive accumulée";
      } else if (hour === 15 || hour === 16) {
        riskPercent = 45;
        reason = "Baisse de vigilance post-déjeuner + hausse de temps d'écran";
      } else if (hour >= 22) {
        riskPercent = 68;
        reason = "Fin de journée, fatigue cumulée et baisse d'auto-discipline";
      } else if (hour >= 0 && hour <= 4) {
        riskPercent = 35;
        reason = "Sommeil perturbé ou réveil nocturne impulsif";
      }

      // Adjust risk slightly based on sensitivity setting
      if (settings.sensitivity === 'high') {
        riskPercent = Math.min(100, Math.round(riskPercent * 1.25));
      } else if (settings.sensitivity === 'low') {
        riskPercent = Math.max(5, Math.round(riskPercent * 0.75));
      }

      return { hour, riskPercent, reason };
    });

    res.json({
      success: true,
      predictionSensitivity: sensitivityLabel,
      todayHourlyRisk: hourlyRisk
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve daily prediction', message: error.message });
  }
});

app.get('/api/ai-engine/:userId/predictions/week', (req, res) => {
  try {
    const userId = req.params.userId || 'ALPHA_SOLDIER_1';
    
    // Simulating 7-day forecast
    const weekForecast = [
      { date: "19", dayLabel: "DIM", maxRisk: 78, riskHour: "22h" },
      { date: "20", dayLabel: "LUN", maxRisk: 35, riskHour: "15h" },
      { date: "21", dayLabel: "MAR", maxRisk: 22, riskHour: "23h" },
      { date: "22", dayLabel: "MER", maxRisk: 81, riskHour: "21h" },
      { date: "23", dayLabel: "JEU", maxRisk: 44, riskHour: "16h" },
      { date: "24", dayLabel: "VEN", maxRisk: 52, riskHour: "22h" },
      { date: "25", dayLabel: "SAM", maxRisk: 65, riskHour: "23h" }
    ];

    const recommendations = [
      {
        id: "rec_action_1",
        windowLabel: "Ce soir, 21h-23h",
        riskPercent: 72,
        suggestedAction: "Planifie un appel avec un ami ce soir-là, ou programme une session Kegel à 21h pile.",
        status: preventiveActionStatus["rec_action_1"] || "pending"
      },
      {
        id: "rec_action_2",
        windowLabel: "Mercredi, 20h-22h",
        riskPercent: 81,
        suggestedAction: "Laisse ton téléphone hors de la chambre dès 20h et lance une séance d'Apnée guidée avant d'éteindre les lumières.",
        status: preventiveActionStatus["rec_action_2"] || "pending"
      },
      {
        id: "rec_action_3",
        windowLabel: "Samedi, 22h-00h",
        riskPercent: 65,
        suggestedAction: "Planifie une douche froide impérative ou prépare une session d'écriture créative pour canaliser l'afflux de dopamine.",
        status: preventiveActionStatus["rec_action_3"] || "pending"
      }
    ];

    // Simulate "hasEnoughData": true unless requested otherwise. Can toggle or mock based on user or query params
    const hasEnoughData = req.query.lowData !== 'true';

    res.json({
      success: true,
      hasEnoughData,
      weekForecast,
      preventiveRecommendations: recommendations
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve weekly predictions', message: error.message });
  }
});

app.get('/api/ai-engine/:userId/predictions/accuracy', (req, res) => {
  try {
    res.json({
      success: true,
      modelAccuracy: {
        percentConfirmed: 78,
        confirmedCount: 42,
        falseAlarmCount: 12
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve model accuracy', message: error.message });
  }
});

app.post('/api/ai-engine/:userId/predictions/:recommendationId/commit', (req, res) => {
  try {
    const { recommendationId } = req.params;
    preventiveActionStatus[recommendationId] = 'committed';
    res.json({
      success: true,
      message: "Recommandation d'action préventive engagée !"
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to commit to preventive action', message: error.message });
  }
});

app.post('/api/ai-engine/:userId/predictions/:recommendationId/snooze', (req, res) => {
  try {
    const { recommendationId } = req.params;
    preventiveActionStatus[recommendationId] = 'snoozed';
    res.json({
      success: true,
      message: "Recommandation reportée."
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to snooze preventive action', message: error.message });
  }
});


app.post('/api/ai-engine/:userId/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // High-quality offline fallback in case the API Key is not set yet in the environment
      return res.json({
        reply: "Salut guerrier, je suis ton Moteur d'Analyse Alpha. Bien que ma clé de communication externe (Gemini) soit déconnectée pour l'instant, mon algorithme local te conseille ceci : concentre-toi sur tes séances de Kegel et garde un sommeil régulier. Pour rappel, ta force d'amplitude est corrélée à ton repos à hauteur de 25%. Des questions sur tes métriques ?"
      });
    }

    const systemInstruction = 
      "Tu es le Moteur d'Analyse IA (AlphaEngine) de l'application ALPHA MAN, un système d'analyse prédictif et d'optimisation de haut niveau. " +
      "Ton style est direct, scientifique, rigoureux, fraternel, digne d'un mentor d'élite qui s'appuie sur des données réelles. " +
      "Tu n'es pas seulement un chatbot, tu es une intelligence qui corrèle la force pelvienne (Kegel), la qualité du sommeil, le stress, le temps d'écran et la résistance aux impulsions (Pattern Killer). " +
      "Tes réponses doivent être structurées, basées sur la synergie de vie, percutantes et rédigées en français (Maximum 4-5 phrases). " +
      "Ne parle jamais de code ou d'API. Parle de données d'amplitude musculaire, d'activation parasympathique et d'ondes lentes du sommeil.";

    // Call Gemini using the official @google/genai syntax (gemini-3.5-flash as default)
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...(history || []).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user', // standard sdk role mapping
          parts: [{ text: h.parts?.[0]?.text || h.text || '' }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('AI Engine Gemini call failure:', error);
    res.status(500).json({ error: 'AI Engine conversation failed', message: error.message });
  }
});


// --- Stories & Community Module ---

interface StoryCardData {
  id: string;
  authorPseudo: string;
  authorLevel: number;
  milestoneDay: number;
  milestoneLabel: string;
  answers: { hardest: string; whatChanged: string; advice: string };
  helpedCount: number;
  userHasReactedHelped: boolean;
  commentCount: number;
  status: 'pending' | 'approved' | 'featured' | 'needs_review';
  createdAt: string;
  clanId: string;
}

interface CommentData {
  id: string;
  storyId: string;
  authorPseudo: string;
  authorLevel: number;
  text: string;
  createdAt: string;
}

let storiesDb: StoryCardData[] = [
  {
    id: 'story-1',
    authorPseudo: 'Souverain77',
    authorLevel: 14,
    milestoneDay: 30,
    milestoneLabel: '🏆 JOUR 30',
    answers: {
      hardest: "Le plus dur, c'est de casser la routine mécanique d'allumer l'écran tard le soir quand la fatigue diminue notre volonté.",
      whatChanged: "J'ai retrouvé une énergie incroyable au réveil, mes yeux ne sont plus cernés et ma voix a gagné en assurance physique.",
      advice: "Coupe ton smartphone dès 21h, mets-le dans une autre pièce et remplace-le par un rituel de lecture ou d'étirements."
    },
    helpedCount: 38,
    userHasReactedHelped: false,
    commentCount: 4,
    status: 'featured',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    clanId: 'clan-1'
  },
  {
    id: 'story-2',
    authorPseudo: 'GuerrierDeLumiere',
    authorLevel: 19,
    milestoneDay: 90,
    milestoneLabel: '🏆 JOUR 90',
    answers: {
      hardest: "Le cap des 7 jours puis des 21 jours, où l'énergie accumulée est si forte qu'on a l'impression de saturer neurologiquement.",
      whatChanged: "Une concentration au laser. Je peux travailler 4 heures d'affilée sans aucune distraction mentale ou baisse de régime.",
      advice: "Oriente cette tension brute immédiatement dans le sport ou un projet créatif. Ne la laisse pas stagner de manière oisive."
    },
    helpedCount: 64,
    userHasReactedHelped: false,
    commentCount: 2,
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    clanId: 'clan-1'
  },
  {
    id: 'story-3',
    authorPseudo: 'IronWill',
    authorLevel: 8,
    milestoneDay: 7,
    milestoneLabel: '🏆 JOUR 7',
    answers: {
      hardest: "Gérer l'insomnie des trois premières nuits quand le cerveau réclame sa dose habituelle de dopamine rapide.",
      whatChanged: "Une sensation de clarté dans le regard et une motivation renouvelée pour reprendre l'entraînement physique.",
      advice: "Les 3 premiers jours sont une tempête, mais n'oublie pas : une impulsion dure moins de 10 minutes si tu ne la nourris pas de pensées."
    },
    helpedCount: 19,
    userHasReactedHelped: false,
    commentCount: 0,
    status: 'approved',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    clanId: 'clan-1'
  },
  {
    id: 'story-4',
    authorPseudo: 'SpartanShield',
    authorLevel: 12,
    milestoneDay: 30,
    milestoneLabel: '🏆 JOUR 30',
    answers: {
      hardest: "Le sentiment d'isolement social quand on décide de rompre avec les habitudes faciles de ses anciens cercles.",
      whatChanged: "J'ai rejoint un clan d'élite et je ressens enfin la force d'une fraternité d'hommes qui partagent le même idéal.",
      advice: "Ne combats pas seul dans l'ombre. Rends des comptes à tes frères d'armes et sois transparent lors de tes moments de doute."
    },
    helpedCount: 27,
    userHasReactedHelped: false,
    commentCount: 1,
    status: 'approved',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    clanId: 'clan-2'
  }
];

let commentsDb: CommentData[] = [
  {
    id: 'comment-1',
    storyId: 'story-1',
    authorPseudo: 'VikingSpirit',
    authorLevel: 9,
    text: "Exactement frère ! Le rituel du soir est le plus redoutable. Merci pour le rappel.",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'comment-2',
    storyId: 'story-1',
    authorPseudo: 'AlphaMind',
    authorLevel: 11,
    text: "Le coup du téléphone hors de la chambre a littéralement sauvé mon streak de 45 jours.",
    createdAt: new Date(Date.now() - 1.5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'comment-3',
    storyId: 'story-2',
    authorPseudo: 'Souverain77',
    authorLevel: 14,
    text: "Respect pour les 90 jours ! Tu es un phare pour nous tous qui débutons.",
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  }
];

// Helper to filter words for acute distress
function detectAcuteDistress(text: string): boolean {
  if (!text) return false;
  const distressKeywords = [
    'suicide', 'suicider', 'mutiler', 'mutilation', 'finir mes jours', 'en finir', 'mourir',
    'veux crever', 'veux mourir', 'auto-mutiler', 'tuer moi', 'me tuer', 'plus envie de vivre'
  ];
  const normalized = text.toLowerCase();
  return distressKeywords.some(keyword => normalized.includes(keyword));
}

// GET all stories
app.get('/api/community/:userId/stories', (req, res) => {
  try {
    const { scope, clanId } = req.query;
    let filtered = [...storiesDb];

    if (scope === 'discover') {
      // Discover tab: only approved/featured stories cross-clan
      filtered = filtered.filter(s => s.status === 'featured' || s.status === 'approved');
    } else {
      // Clan tab: stories of user's clan that are approved or featured
      // (For this mock/prototype, let's filter by the clanId provided)
      const targetClanId = clanId && clanId !== 'undefined' ? clanId : 'clan-1';
      filtered = filtered.filter(s => s.clanId === targetClanId && (s.status === 'approved' || s.status === 'featured'));
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch stories', message: error.message });
  }
});

// GET user's pending story
app.get('/api/community/:userId/stories/mine/pending', (req, res) => {
  try {
    // Return a pending story if exists (hardcoded check or match)
    const pending = storiesDb.find(s => s.authorPseudo === 'Moi' && (s.status === 'pending' || s.status === 'needs_review'));
    res.json(pending || null);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch pending story', message: error.message });
  }
});

// GET story of the week
app.get('/api/community/:userId/stories/featured', (req, res) => {
  try {
    const featured = storiesDb.find(s => s.status === 'featured') || storiesDb[0];
    res.json(featured);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch featured story', message: error.message });
  }
});

// POST a new story
app.post('/api/community/:userId/stories', (req, res) => {
  try {
    const { userId } = req.params;
    const { milestoneDay, answers, clientSafetyFlag } = req.body;

    if (!answers || !answers.hardest || !answers.whatChanged || !answers.advice) {
      return res.status(400).json({ error: 'Missing story content fields' });
    }

    // Server-side safety filter
    const distressInHardest = detectAcuteDistress(answers.hardest);
    const distressInChanged = detectAcuteDistress(answers.whatChanged);
    const distressInAdvice = detectAcuteDistress(answers.advice);
    const hasDistress = distressInHardest || distressInChanged || distressInAdvice || !!clientSafetyFlag;

    const newStory: StoryCardData = {
      id: `story-${Date.now()}`,
      authorPseudo: 'Moi',
      authorLevel: 12, // default simulated level
      milestoneDay: parseInt(milestoneDay) || 30,
      milestoneLabel: `🏆 JOUR ${milestoneDay || 30}`,
      answers: {
        hardest: answers.hardest,
        whatChanged: answers.whatChanged,
        advice: answers.advice
      },
      helpedCount: 0,
      userHasReactedHelped: false,
      commentCount: 0,
      status: hasDistress ? 'needs_review' : 'pending',
      createdAt: new Date().toISOString(),
      clanId: 'clan-1'
    };

    storiesDb.push(newStory);

    res.json({
      success: true,
      story: newStory,
      safetyTriggered: hasDistress
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create story', message: error.message });
  }
});

// POST toggle helped reaction
app.post('/api/community/:userId/stories/:storyId/react', (req, res) => {
  try {
    const { storyId } = req.params;
    const story = storiesDb.find(s => s.id === storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    story.userHasReactedHelped = !story.userHasReactedHelped;
    story.helpedCount += story.userHasReactedHelped ? 1 : -1;

    res.json({
      success: true,
      helpedCount: story.helpedCount,
      userHasReactedHelped: story.userHasReactedHelped
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to react to story', message: error.message });
  }
});

// GET comments for story
app.get('/api/community/:userId/stories/:storyId/comments', (req, res) => {
  try {
    const { storyId } = req.params;
    const comments = commentsDb.filter(c => c.storyId === storyId);
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch comments', message: error.message });
  }
});

// POST comment
app.post('/api/community/:userId/stories/:storyId/comments', (req, res) => {
  try {
    const { storyId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Le commentaire doit faire au moins 20 caractères.' });
    }

    const hasDistress = detectAcuteDistress(text);

    const newComment: CommentData = {
      id: `comment-${Date.now()}`,
      storyId,
      authorPseudo: 'Moi',
      authorLevel: 12,
      text,
      createdAt: new Date().toISOString()
    };

    commentsDb.push(newComment);

    // Increment comment count on the story if found
    const story = storiesDb.find(s => s.id === storyId);
    if (story) {
      story.commentCount += 1;
    }

    res.json({
      success: true,
      comment: newComment,
      safetyTriggered: hasDistress
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add comment', message: error.message });
  }
});

// POST report story
app.post('/api/community/:userId/stories/:storyId/report', (req, res) => {
  try {
    const { storyId } = req.params;
    const { reason } = req.body;

    // Simulate reporting by flagging status
    const story = storiesDb.find(s => s.id === storyId);
    if (story) {
      story.status = 'needs_review';
    }

    res.json({
      success: true,
      message: 'Contenu signalé avec succès pour vérification humaine.'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to report story', message: error.message });
  }
});


// --- ChatClan Module ---

interface ClanMessage {
  id: string;
  senderId: string;
  senderPseudo: string;
  senderLevel: number;
  text: string;
  isSystemMessage: boolean;
  createdAt: string;
}

let clanMessagesDb: { [clanId: string]: ClanMessage[] } = {
  'clan-1': [
    {
      id: 'msg-1',
      senderId: 'user-888',
      senderPseudo: 'Rachid',
      senderLevel: 15,
      text: 'Bonne chance à tous ce soir 💪 La tentation était forte en rentrant du boulot mais la douche froide m\'a totalement sauvé.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: 'msg-2',
      senderId: 'user-system-1',
      senderPseudo: 'Système',
      senderLevel: 0,
      text: 'Rachid a franchi le palier exceptionnel de 30 jours de souveraineté ! 🏆',
      isSystemMessage: true,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000 + 1000).toISOString()
    },
    {
      id: 'msg-3',
      senderId: 'user-999',
      senderPseudo: 'Thomas',
      senderLevel: 8,
      text: 'Franchement merci pour le partage Rachid, j\'allais flancher en scrollant oisivement. Je ferme tout et je sors faire 50 pompes ! 🔥',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    },
    {
      id: 'msg-4',
      senderId: 'user-444',
      senderPseudo: 'Karim',
      senderLevel: 22,
      text: 'Rappelez-vous les frères : la douleur de la discipline est temporaire, celle du regret dure éternellement. On reste soudés.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 'msg-5',
      senderId: 'user-333',
      senderPseudo: 'Sébastien',
      senderLevel: 11,
      text: 'Qui est chaud pour qu\'on termine à 100% notre défi de clan de cette semaine ? Il ne reste plus que quelques entraînements à valider ! ⚡',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ],
  'clan-2': [
    {
      id: 'msg-b1',
      senderId: 'user-555',
      senderPseudo: 'Spartiate12',
      senderLevel: 9,
      text: 'Bienvenue dans le clan des Lions de l\'Atlas ! Ici pas de compromis, on s\'entraide chaque jour.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    }
  ]
};

// GET messages
app.get('/api/community/:userId/clan/:clanId/messages', (req, res) => {
  try {
    const { clanId } = req.params;
    const { before } = req.query;
    const targetClanId = clanId && clanId !== 'undefined' ? clanId : 'clan-1';
    
    let messages = clanMessagesDb[targetClanId] || [];
    
    // Sort by creation date (newest first for cursor/pagination, though client renders in scroll)
    let sorted = [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (before) {
      const beforeTime = new Date(before as string).getTime();
      sorted = sorted.filter(m => new Date(m.createdAt).getTime() < beforeTime);
    }

    // Paginate: take last 30 messages
    const paginated = sorted.slice(-30);

    res.json(paginated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch clan messages', message: error.message });
  }
});

// POST a message
app.post('/api/community/:userId/clan/:clanId/messages', (req, res) => {
  try {
    const { clanId, userId } = req.params;
    const { text, clientSafetyFlag } = req.body;
    const targetClanId = clanId && clanId !== 'undefined' ? clanId : 'clan-1';

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const hasDistress = detectAcuteDistress(text) || !!clientSafetyFlag;

    // Default sender info
    let senderPseudo = 'Moi';
    let senderLevel = 12;

    // Try to matches user info if known (simulated)
    if (userId === 'user-777') {
      senderPseudo = 'Moi';
      senderLevel = 12;
    }

    const newMessage: ClanMessage = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderPseudo,
      senderLevel,
      text,
      isSystemMessage: false,
      createdAt: new Date().toISOString()
    };

    if (!clanMessagesDb[targetClanId]) {
      clanMessagesDb[targetClanId] = [];
    }

    clanMessagesDb[targetClanId].push(newMessage);

    res.json({
      success: true,
      message: newMessage,
      safetyTriggered: hasDistress
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send clan message', message: error.message });
  }
});

// GET active members count today
app.get('/api/community/:userId/clan/:clanId/active-count', (req, res) => {
  try {
    // Return a realistic, dynamic simulated member count (e.g. between 8 and 14)
    const baseHour = new Date().getHours();
    const activeCount = Math.max(4, 6 + (baseHour % 7));
    res.json({ activeCount });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch active member count', message: error.message });
  }
});

// POST report clan message
app.post('/api/community/:userId/clan/:clanId/messages/:messageId/report', (req, res) => {
  try {
    const { clanId, messageId } = req.params;
    const targetClanId = clanId && clanId !== 'undefined' ? clanId : 'clan-1';

    const messages = clanMessagesDb[targetClanId] || [];
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      // Simulate moderation by keeping the message but attaching a flag, or removing it
      // Let's remove it from history for visual feedback on successful report
      messages.splice(index, 1);
    }

    res.json({
      success: true,
      message: 'Message signalé et retiré pour vérification immédiate.'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to report clan message', message: error.message });
  }
});


// --- Mentorship Module ---

interface MentorProfile {
  id: string;
  pseudo: string;
  level: number;
  streak: number;
  sharedTriggers: string[];
  allTriggers: string[];
  menteesHelpedCount: number;
  storyExcerpt: string | null;
}

interface MenteeProfile {
  id: string;
  pseudo: string;
  level: number;
  streak: number;
  sharedTriggers: string[];
  allTriggers: string[];
  lastActive: string;
}

// Global state in-memory for mentorship (seeded for userId: user-777)
let userMentorshipStatus = {
  currentMentor: null as MentorProfile | null,
  isMentorActive: false,
  isEligibleToMentor: true,
  currentStreak: 65,
  threshold: 60,
  selectedTriggers: [] as string[]
};

let suggestedMentorsDb: MentorProfile[] = [
  {
    id: 'mentor-1',
    pseudo: 'Kader',
    level: 25,
    streak: 342,
    sharedTriggers: ['Stress', 'Soir seul'],
    allTriggers: ['Stress', 'Soir seul', 'Fatigue'],
    menteesHelpedCount: 14,
    storyExcerpt: "La douche froide m'a sauvé du gouffre, j'aide aujourd'hui mes frères à tenir bon."
  },
  {
    id: 'mentor-2',
    pseudo: 'Julien',
    level: 18,
    streak: 124,
    sharedTriggers: ['Ennui', 'Réseaux sociaux'],
    allTriggers: ['Ennui', 'Réseaux sociaux', 'Frustration'],
    menteesHelpedCount: 5,
    storyExcerpt: "Remplacer le doom-scrolling par la musculation à haute intensité."
  },
  {
    id: 'mentor-3',
    pseudo: 'Yassine',
    level: 30,
    streak: 412,
    sharedTriggers: ['Stress', 'Fatigue'],
    allTriggers: ['Stress', 'Fatigue', 'Soir seul'],
    menteesHelpedCount: 22,
    storyExcerpt: "Chaque respiration est un combat conscient. Ne plie jamais l'échine face à l'illusion."
  }
];

let pendingRequestsDb = [
  {
    requestId: 'req-1',
    requesterId: 'user-101',
    pseudo: 'Sofiane',
    level: 7,
    sharedTriggers: ['Soir seul', 'Stress']
  },
  {
    requestId: 'req-2',
    requesterId: 'user-102',
    pseudo: 'Maxime',
    level: 4,
    sharedTriggers: ['Ennui']
  }
];

let currentMenteesDb: MenteeProfile[] = [
  {
    id: 'mentee-sub-1',
    pseudo: 'Lucas',
    level: 9,
    streak: 18,
    sharedTriggers: ['Stress'],
    allTriggers: ['Stress', 'Fatigue'],
    lastActive: 'Actif il y a 2h'
  }
];

let mentorshipChatsDb: { 
  [convId: string]: Array<{ 
    id: string; 
    senderId: string; 
    senderPseudo: string; 
    senderLevel: number; 
    text: string; 
    isSystemMessage: boolean; 
    createdAt: string; 
  }> 
} = {
  'chat-mentor-1': [
    {
      id: 'm-msg-1',
      senderId: 'mentor-1',
      senderPseudo: 'Kader',
      senderLevel: 25,
      text: "Salut mon frère ! Félicitations pour ton engagement. Je suis là pour t'épauler au quotidien. Quel a été ton plus grand défi aujourd'hui ?",
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'm-msg-2',
      senderId: 'user-777',
      senderPseudo: 'Moi',
      senderLevel: 12,
      text: "Salut Kader, merci de m'accompagner ! Surtout le soir quand je me retrouve seul face à mes écrans, c'est là que la tension monte.",
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
    },
    {
      id: 'm-msg-3',
      senderId: 'mentor-1',
      senderPseudo: 'Kader',
      senderLevel: 25,
      text: "Je connais ça par cœur. Règle numéro 1 : aucun écran dans la chambre après 22h. Laisse ton téléphone au salon. Qu'en penses-tu ?",
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString()
    }
  ]
};

// GET mentorship status
app.get('/api/community/:userId/mentorship/status', (req, res) => {
  res.json({
    currentMentor: userMentorshipStatus.currentMentor,
    isMentorActive: userMentorshipStatus.isMentorActive,
    isEligibleToMentor: userMentorshipStatus.isEligibleToMentor,
    currentStreak: userMentorshipStatus.currentStreak,
    threshold: userMentorshipStatus.threshold
  });
});

// GET suggested mentors
app.get('/api/community/:userId/mentorship/suggested', (req, res) => {
  // If user already has a mentor, return empty list or mock list
  res.json(suggestedMentorsDb);
});

// POST request a mentor
app.post('/api/community/:userId/mentorship/request', (req, res) => {
  const { mentorId } = req.body;
  const selectedMentor = suggestedMentorsDb.find(m => m.id === mentorId);
  if (!selectedMentor) {
    return res.status(404).json({ error: 'Mentor not found' });
  }

  // Simulate accepting after 3 seconds, or set as current mentor directly for instant feedback
  userMentorshipStatus.currentMentor = selectedMentor;
  
  res.json({ 
    success: true, 
    message: `Demande envoyée avec succès à ${selectedMentor.pseudo}.`,
    currentMentor: selectedMentor
  });
});

// POST activate mentor status
app.post('/api/community/:userId/mentorship/activate', (req, res) => {
  const { triggers } = req.body;
  userMentorshipStatus.isMentorActive = true;
  userMentorshipStatus.selectedTriggers = triggers || [];
  res.json({ 
    success: true, 
    message: "Félicitations, vous êtes désormais actif en tant que Mentor officiel ! 🎖️",
    isMentorActive: true 
  });
});

// GET pending requests for current mentor user
app.get('/api/community/:userId/mentorship/requests', (req, res) => {
  res.json(pendingRequestsDb);
});

// POST accept a request
app.post('/api/community/:userId/mentorship/requests/:requestId/accept', (req, res) => {
  const { requestId } = req.params;
  const foundReq = pendingRequestsDb.find(r => r.requestId === requestId);
  if (foundReq) {
    // Add to current mentees
    const newMentee: MenteeProfile = {
      id: foundReq.requesterId,
      pseudo: foundReq.pseudo,
      level: foundReq.level,
      streak: 5, // starting
      sharedTriggers: foundReq.sharedTriggers,
      allTriggers: foundReq.sharedTriggers,
      lastActive: 'Actif à l\'instant'
    };
    currentMenteesDb.push(newMentee);
    
    // Create custom welcome message for their chat
    const convId = `chat-${foundReq.requesterId}`;
    mentorshipChatsDb[convId] = [
      {
        id: `m-msg-sys-${Date.now()}`,
        senderId: 'system',
        senderPseudo: 'Système',
        senderLevel: 0,
        text: `Félicitations ! Vous accompagnez désormais ${foundReq.pseudo} dans son parcours de souveraineté.`,
        isSystemMessage: true,
        createdAt: new Date().toISOString()
      },
      {
        id: `m-msg-first-${Date.now()}`,
        senderId: 'user-777',
        senderPseudo: 'Moi (Mentor)',
        senderLevel: 12,
        text: `Salut ${foundReq.pseudo} ! Ravi d'être ton mentor. N'hésite pas à m'écrire dès que tu ressens le moindre déclencheur. Ensemble on est invincibles ! 💪`,
        isSystemMessage: false,
        createdAt: new Date().toISOString()
      }
    ];

    // Remove from pending
    pendingRequestsDb = pendingRequestsDb.filter(r => r.requestId !== requestId);
  }
  res.json({ success: true, mentees: currentMenteesDb });
});

// POST decline a request (discreet, never notifies the requester directly)
app.post('/api/community/:userId/mentorship/requests/:requestId/decline', (req, res) => {
  const { requestId } = req.params;
  pendingRequestsDb = pendingRequestsDb.filter(r => r.requestId !== requestId);
  res.json({ success: true, message: "Demande déclinée discrètement." });
});

// POST end mentorship relationship
app.post('/api/community/:userId/mentorship/end', (req, res) => {
  userMentorshipStatus.currentMentor = null;
  res.json({ success: true, message: "Relation de mentorat terminée." });
});

// GET current mentees
app.get('/api/community/:userId/mentorship/mentees', (req, res) => {
  res.json(currentMenteesDb);
});

// GET 1-to-1 mentorship chat messages
app.get('/api/community/:userId/mentorship/chat/:conversationId/messages', (req, res) => {
  const { conversationId } = req.params;
  const messages = mentorshipChatsDb[conversationId] || [];
  res.json(messages);
});

// POST 1-to-1 mentorship chat message
app.post('/api/community/:userId/mentorship/chat/:conversationId/messages', (req, res) => {
  const { conversationId, userId } = req.params;
  const { text, clientSafetyFlag } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const hasDistress = detectAcuteDistress(text) || !!clientSafetyFlag;

  const newMessage = {
    id: `m-msg-${Date.now()}`,
    senderId: userId,
    senderPseudo: userId === 'user-777' ? 'Moi' : 'Partenaire',
    senderLevel: 12,
    text,
    isSystemMessage: false,
    createdAt: new Date().toISOString()
  };

  if (!mentorshipChatsDb[conversationId]) {
    mentorshipChatsDb[conversationId] = [];
  }

  mentorshipChatsDb[conversationId].push(newMessage);

  res.json({
    success: true,
    message: newMessage,
    safetyTriggered: hasDistress
  });
});


// --- Experts Live Module ---

interface SessionData {
  id: string;
  expertName: string;
  expertTitle: string;
  expertSpecialty: 'urologie' | 'sexologie' | 'andrologie' | 'psychiatrie' | 'nutrition';
  topic: string;
  scheduledAt: string;
  requiredTier: string | null;
  registeredCount: number;
  isUserRegistered: boolean;
  isLiveNow: boolean;
  streamUrl: string | null;
}

interface ReplayData {
  id: string;
  expertName: string;
  topic: string;
  category: string;
  durationSeconds: number;
  videoUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt: string;
  requiredTier: string | null;
  submittedQuestions: Array<{ question: string; isAnonymous: boolean; answer: string | null }>;
}

let liveSessionNowDb: SessionData | null = {
  id: 'session-live-1',
  expertName: 'Dr. Marc-Antoine Perrin',
  expertTitle: 'Sexologue clinicien & Andrologue',
  expertSpecialty: 'sexologie',
  topic: 'Maîtriser la réactivité sexuelle : l\'art d\'entraîner l\'esprit et le corps',
  scheduledAt: new Date().toISOString(),
  requiredTier: null,
  registeredCount: 342,
  isUserRegistered: true,
  isLiveNow: true,
  streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // placeholder URL
};

let upcomingSessionsDb: SessionData[] = [
  {
    id: 'session-up-1',
    expertName: 'Dr. Amine El Mansouri',
    expertTitle: 'Chirurgien Urologue',
    expertSpecialty: 'urologie',
    topic: 'Congestion pelvienne et abstinence active : Les vérités médicales',
    scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), // 2 days later
    requiredTier: 'ELITE',
    registeredCount: 184,
    isUserRegistered: false,
    isLiveNow: false,
    streamUrl: null
  },
  {
    id: 'session-up-2',
    expertName: 'Pr. Karim Benyahia',
    expertTitle: 'Neuro-Psychiatre',
    expertSpecialty: 'psychiatrie',
    topic: 'Le circuit de la dopamine : Reconfigurer son cerveau après l\'addiction aux écrans',
    scheduledAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), // 5 days later
    requiredTier: null,
    registeredCount: 512,
    isUserRegistered: true,
    isLiveNow: false,
    streamUrl: null
  },
  {
    id: 'session-up-3',
    expertName: 'Jean-Laurent Clavier',
    expertTitle: 'Nutritionniste & Expert en endocrinologie comportementale',
    expertSpecialty: 'nutrition',
    topic: 'Optimiser sa testostérone naturelle : Nutrition sacrée et micronutriments de force',
    scheduledAt: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(), // 8 days later
    requiredTier: 'ELITE',
    registeredCount: 295,
    isUserRegistered: false,
    isLiveNow: false,
    streamUrl: null
  }
];

let replaysDb: ReplayData[] = [
  {
    id: 'replay-1',
    expertName: 'Dr. Marc-Antoine Perrin',
    topic: 'Le redémarrage neurologique complet (Reset Phase) : Ce qui se passe en 90 jours',
    category: 'sexologie',
    durationSeconds: 2535, // 42:15
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-smartphone-in-his-hand-40557-large.mp4', // beautiful high quality stock video placeholder
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
    viewCount: 2340,
    publishedAt: 'Il y a 2 semaines',
    requiredTier: null,
    submittedQuestions: [
      {
        question: "La baisse de libido au jour 15 est-elle normale ?",
        isAnonymous: true,
        answer: "Absolument. C'est la phase de flatline neurologique. Le cerveau s'habitue à l'absence de stimuli artificiels extrêmes. Elle dure en général de 10 à 30 jours, puis l'énergie sexuelle saine revient multipliée."
      },
      {
        question: "Combien de temps faut-il pour rétablir la sensibilité à la dopamine ?",
        isAnonymous: false,
        answer: "Le pic de sensibilité commence à remonter dès le 21ème jour, mais le reset complet des récepteurs D2 prend environ 90 jours de sobriété absolue."
      }
    ]
  },
  {
    id: 'replay-2',
    expertName: 'Dr. Amine El Mansouri',
    topic: 'La santé prostatique chez l\'homme jeune et l\'impact de la rétention séminale',
    category: 'urologie',
    durationSeconds: 3120, // 52:00
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-writing-on-a-notebook-40556-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=600&auto=format&fit=crop',
    viewCount: 1890,
    publishedAt: 'Il y a 1 mois',
    requiredTier: 'ELITE',
    submittedQuestions: [
      {
        question: "La rétention séminale prolongée présente-t-elle des risques ?",
        isAnonymous: true,
        answer: "Médicalement, le corps recycle naturellement le liquide séminal non évacué. Il n'y a aucun risque de congestion si vous pratiquez l'exercice physique de haute intensité et les respirations pelviennes."
      }
    ]
  },
  {
    id: 'replay-3',
    expertName: 'Pr. Karim Benyahia',
    topic: 'La gestion de la solitude émotionnelle lors des premiers jalons de rupture',
    category: 'psychiatrie',
    durationSeconds: 1980, // 33:00
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-sitting-by-the-window-staring-outside-40559-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop',
    viewCount: 3410,
    publishedAt: 'Il y a 3 semaines',
    requiredTier: null,
    submittedQuestions: [
      {
        question: "Comment lutter contre le déclencheur du dimanche soir seul ?",
        isAnonymous: false,
        answer: "Le dimanche soir est un pic d'anxiété de transition. Planifiez une séance de sport ou un appel de clan à 18h en amont. Ne laissez jamais ce créneau vide."
      }
    ]
  }
];

// GET status of live session currently happening
app.get('/api/community/:userId/experts/live-now', (req, res) => {
  res.json(liveSessionNowDb);
});

// GET list of upcoming sessions, optionally filtered by category
app.get('/api/community/:userId/experts/upcoming', (req, res) => {
  const { category } = req.query;
  if (!category || category === 'all') {
    return res.json(upcomingSessionsDb);
  }
  const filtered = upcomingSessionsDb.filter(s => s.expertSpecialty === category);
  res.json(filtered);
});

// GET list of replays, optionally filtered by category
app.get('/api/community/:userId/experts/replays', (req, res) => {
  const { category } = req.query;
  if (!category || category === 'all') {
    return res.json(replaysDb);
  }
  const filtered = replaysDb.filter(r => r.category === category);
  res.json(filtered);
});

// POST register for upcoming session
app.post('/api/community/:userId/experts/sessions/:sessionId/register', (req, res) => {
  const { sessionId } = req.params;
  const session = upcomingSessionsDb.find(s => s.id === sessionId);
  if (session) {
    session.isUserRegistered = !session.isUserRegistered;
    if (session.isUserRegistered) {
      session.registeredCount += 1;
    } else {
      session.registeredCount -= 1;
    }
    return res.json({ success: true, session });
  }
  res.status(404).json({ error: 'Session not found' });
});

// POST submit a question for upcoming session
app.post('/api/community/:userId/experts/sessions/:sessionId/questions', (req, res) => {
  const { sessionId } = req.params;
  const { text, isAnonymous, safetyFlag } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Question content cannot be empty' });
  }

  // We can push to submittedQuestions of a simulated replay or session detail
  // For simplicity and immediate testing, let's log the submitted question and return success.
  console.log(`[EXPERT QUESTION] Session: ${sessionId}, text: "${text}", Anonymous: ${isAnonymous}, Distress Safety Flag: ${safetyFlag}`);

  res.json({
    success: true,
    message: "Votre question a été soumise avec succès au comité de l'expert 🎖️",
    safetyTriggered: !!safetyFlag
  });
});

// GET replay detail by ID with questions/answers
app.get('/api/community/:userId/experts/replays/:replayId', (req, res) => {
  const { replayId } = req.params;
  const replay = replaysDb.find(r => r.id === replayId);
  if (replay) {
    return res.json(replay);
  }
  res.status(404).json({ error: 'Replay not found' });
});


// --- Forum Module ---

app.get('/api/community/crisis-resources', (req, res) => {
  // IMPORTANT : ces valeurs sont des PLACEHOLDERS. Elles doivent être
  // vérifiées et remplacées par une personne de confiance avec des
  // numéros confirmés et actuellement en service pour le Maroc avant
  // toute mise en production. Ne jamais publier cette app avec des
  // numéros non vérifiés dans un contexte de détresse psychologique.
  res.json({
    resources: [
      {
        label: "Services d'urgence de ton pays",
        value: "Compose le numéro d'urgence local depuis ton téléphone",
        verified: false
      }
    ],
    lastVerifiedAt: null,
    note: "Ressources à compléter par l'équipe avant lancement public."
  });
});

interface ThreadData {
  id: string;
  category: string;
  scope: 'clan' | 'all';
  authorPseudo: string;
  authorLevel: number;
  authorReputationPoints: number;
  title: string;
  bodyPreview: string;
  body: string;
  createdAt: string;
  voteCount: number;
  userHasVoted: boolean;
  replyCount: number;
  isPinned: boolean;
  hasSolution?: boolean;
  solutionReplyId?: string | null;
  moderationStatus?: 'approved' | 'needs_review' | 'removed';
  reportCount?: number;
  distressFlagged?: boolean;
}

interface ReplyData {
  id: string;
  threadId: string;
  authorPseudo: string;
  authorLevel: number;
  authorReputationPoints: number;
  text: string;
  createdAt: string;
  voteCount: number;
  userHasVoted: boolean;
  isExpertReply?: boolean;
  expertName?: string;
  expertSpecialty?: 'urologie' | 'sexologie' | 'andrologie' | 'psychiatrie' | 'nutrition' | null;
  isMarkedBest?: boolean;
  moderationStatus?: 'approved' | 'needs_review' | 'removed';
  reportCount?: number;
  distressFlagged?: boolean;
}

// Global reputation updating helper
function updateAuthorReputation(pseudo: string, pointsToAdd: number) {
  threadsDb.forEach(t => {
    if (t.authorPseudo === pseudo) {
      t.authorReputationPoints = (t.authorReputationPoints || 0) + pointsToAdd;
    }
  });
  repliesDb.forEach(r => {
    if (r.authorPseudo === pseudo) {
      r.authorReputationPoints = (r.authorReputationPoints || 0) + pointsToAdd;
    }
  });
}

let threadsDb: ThreadData[] = [
  {
    id: 'thread-pinned-1',
    category: 'victoires', // "Victoires & Paliers"
    scope: 'all',
    authorPseudo: 'Guerrier_Souverain',
    authorLevel: 14,
    authorReputationPoints: 350,
    title: '👑 Guide de la Souveraineté : Atteindre les 90 jours sans faillir',
    bodyPreview: 'Ce protocole récapitule les habitudes fondamentales à installer dès le premier jour : douches froides, méditation, suppression des triggers...',
    body: 'Frères d\'armes, ce protocole récapitule les habitudes fondamentales à installer dès le premier jour de votre renaissance :\n\n1. Douches froides quotidiennes pour dompter l\'esprit.\n2. Journaling tous les matins pour clarifier ses intentions.\n3. Exercices Kegel et respiration pelvienne pour faire circuler l\'énergie sexuelle.\n4. Bannissement absolu des réseaux déclencheurs.\n\nSuivez ce guide et votre vie sera transfigurée.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    voteCount: 154,
    userHasVoted: true,
    replyCount: 3,
    isPinned: true,
    hasSolution: false,
    solutionReplyId: null
  },
  {
    id: 'thread-pinned-2',
    category: 'pattern_killer',
    scope: 'clan',
    authorPseudo: 'Modérateur_Alpha',
    authorLevel: 18,
    authorReputationPoints: 580,
    title: '📌 Règles d\'Or du Clan : Soutien radical, Zéro jugement',
    bodyPreview: 'Ici, chaque rechute est un apprentissage. Pas de culpabilisation, nous sommes là pour nous relever...',
    body: 'Frères, rappelez-vous que ce canal de clan est sacré. Nous ne tolérons aucun jugement ni rabaissement. Nous sommes des bâtisseurs d\'hommes. Si vous trébuchez, avouez-le dignement, et laissez la fraternité vous hisser.',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    voteCount: 88,
    userHasVoted: false,
    replyCount: 0,
    isPinned: true,
    hasSolution: false,
    solutionReplyId: null
  },
  {
    id: 'thread-1',
    category: 'pattern_killer', // "🔥 Pattern Killer"
    scope: 'clan',
    authorPseudo: 'Max_La_Force',
    authorLevel: 6,
    authorReputationPoints: 25,
    title: '⚠️ Crise intense au jour 12 : besoin de soutien immédiat !',
    bodyPreview: 'Le dimanche après-midi est toujours mon plus grand piège. L\'ennui s\'installe et mon cerveau commence à négocier...',
    body: 'Le dimanche après-midi est toujours mon plus grand piège. L\'ennui s\'installe et mon cerveau commence à négocier. Il me dit "juste un coup d\'œil, ça ne fera rien". J\'ai besoin de votre force pour ne pas fléchir.',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    voteCount: 18,
    userHasVoted: false,
    replyCount: 2,
    isPinned: false,
    hasSolution: false,
    solutionReplyId: null
  },
  {
    id: 'thread-2',
    category: 'kegel_physique', // "💪 Kegel & Physique"
    scope: 'all',
    authorPseudo: 'Alpha_Pro_kegel',
    authorLevel: 10,
    authorReputationPoints: 120,
    title: '💪 Entraînement Kegel : Quels résultats après 30 jours de pratique régulière ?',
    bodyPreview: 'Je voulais partager mon retour d\'expérience sur les entraînements Alpha Kegel quotidiens. Mon contrôle s\'est incroyablement amélioré...',
    body: 'Je voulais partager mon retour d\'expérience sur les entraînements Alpha Kegel quotidiens. Mon contrôle s\'est incroyablement amélioré, ainsi que ma posture et mon énergie physique générale. Ne négligez pas cette routine !',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
    voteCount: 42,
    userHasVoted: false,
    replyCount: 1,
    isPinned: false,
    hasSolution: false,
    solutionReplyId: null
  },
  {
    id: 'thread-3',
    category: 'vitalite_energie', // "⚡ Vitalité & Énergie"
    scope: 'clan',
    authorPseudo: 'Vital_Nourish',
    authorLevel: 4,
    authorReputationPoints: 45,
    title: '⚡ Le jeûne intermittent et son effet sur la clarté mentale',
    bodyPreview: 'Est-ce que certains d\'entre vous ont combiné la rétention séminale avec le jeûne de 16h ? J\'ai l\'impression que l\'effet est décuplé...',
    body: 'Est-ce que certains d\'entre vous ont combiné la rétention séminale avec le jeûne de 16h ? J\'ai l\'impression que l\'effet de focalisation mentale est décuplé de manière spectaculaire.',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
    voteCount: 23,
    userHasVoted: false,
    replyCount: 0, // unanswered!
    isPinned: false,
    hasSolution: false,
    solutionReplyId: null
  },
  {
    id: 'thread-4',
    category: 'confiance_relations', // "🧠 Confiance & Relations"
    scope: 'all',
    authorPseudo: 'Phoenix_Arise',
    authorLevel: 8,
    authorReputationPoints: 210,
    title: '🧠 Comment reconstruire une relation saine après l\'addiction ?',
    bodyPreview: 'Le plus dur n\'est pas seulement d\'arrêter, c\'est de réapprendre à aimer et à se connecter authentiquement sans fantasme...',
    body: 'Le plus dur n\'est pas seulement d\'arrêter, c\'est de réapprendre à aimer et à se connecter authentiquement sans fantasme artificiel. Partageons nos victoires et nos doutes ici.',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago
    voteCount: 37,
    userHasVoted: false,
    replyCount: 4,
    isPinned: false,
    hasSolution: true,
    solutionReplyId: 'reply-4-1'
  }
];

let repliesDb: ReplyData[] = [
  {
    id: 'reply-1-1',
    threadId: 'thread-pinned-1',
    authorPseudo: 'Viktor_Nord',
    authorLevel: 11,
    authorReputationPoints: 75,
    text: 'C\'est exactement le socle qu\'il me manquait. Les douches froides ont changé ma réactivité au stress.',
    createdAt: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString(),
    voteCount: 15,
    userHasVoted: false,
    isExpertReply: false,
    isMarkedBest: false
  },
  {
    id: 'reply-1-2',
    threadId: 'thread-pinned-1',
    authorPseudo: 'Yannick_K',
    authorLevel: 7,
    authorReputationPoints: 15,
    text: 'Merci pour ce guide, je l\'imprime pour le coller sur mon miroir !',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    voteCount: 8,
    userHasVoted: false,
    isExpertReply: false,
    isMarkedBest: false
  },
  {
    id: 'reply-1-3',
    threadId: 'thread-pinned-1',
    authorPseudo: 'Coach_Alpha',
    authorLevel: 25,
    authorReputationPoints: 620,
    text: 'Excellent travail de synthèse Guerrier_Souverain. La rigueur engendre la souveraineté.',
    createdAt: new Date(Date.now() - 1.5 * 24 * 3600 * 1000).toISOString(),
    voteCount: 22,
    userHasVoted: true,
    isExpertReply: true,
    expertName: 'Coach Alpha',
    expertSpecialty: 'psychiatrie',
    isMarkedBest: false
  },
  {
    id: 'reply-2-1',
    threadId: 'thread-1',
    authorPseudo: 'Alex_Vigilant',
    authorLevel: 5,
    authorReputationPoints: 35,
    text: 'Pose ton téléphone immédiatement ! Fais 30 pompes ou sors marcher sans aucun écran. Ne reste pas seul dans ta chambre ! On est avec toi.',
    createdAt: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
    voteCount: 9,
    userHasVoted: true,
    isExpertReply: false,
    isMarkedBest: false
  },
  {
    id: 'reply-2-2',
    threadId: 'thread-1',
    authorPseudo: 'Loup_Solitaire',
    authorLevel: 9,
    authorReputationPoints: 90,
    text: 'Je traverse la même chose en ce moment frère. J\'ai mis mes baskets et je cours. Fais de même, canalise cette force brute !',
    createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    voteCount: 6,
    userHasVoted: false,
    isExpertReply: false,
    isMarkedBest: false
  },
  {
    id: 'reply-3-1',
    threadId: 'thread-2',
    authorPseudo: 'Socrates_Mind',
    authorLevel: 12,
    authorReputationPoints: 140,
    text: 'Je confirme, l\'effet sur le fascia pelvien est énorme. Meilleure endurance et sensation de plénitude physique.',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    voteCount: 12,
    userHasVoted: false,
    isExpertReply: false,
    isMarkedBest: false
  },
  {
    id: 'reply-4-1',
    threadId: 'thread-4',
    authorPseudo: 'Coach_Alpha',
    authorLevel: 25,
    authorReputationPoints: 620,
    text: 'C\'est l\'une des questions les plus profondes. Reconstruire une relation exige de passer d\'une sexualité de consommation mentale à une présence de coeur, de souffle et d\'écoute authentique. Ralentissez vos rapports, privilégiez le regard et la respiration partagée.',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    voteCount: 45,
    userHasVoted: true,
    isExpertReply: true,
    expertName: 'Dr. Marc-Antoine Perrin',
    expertSpecialty: 'sexologie',
    isMarkedBest: true
  }
];

// Helper to calculate trending score based on activity in the last 48 hours
function getTrendingScore(thread: ThreadData): number {
  let score = 0;
  const now = Date.now();
  const threadAgeHrs = (now - new Date(thread.createdAt).getTime()) / (3600 * 1000);

  // If thread is less than 48 hours old, all its upvotes contribute points
  if (threadAgeHrs <= 48) {
    score += thread.voteCount * 2;
  } else {
    // A smaller fraction of its upvotes are simulated as recent for older threads
    score += Math.floor(thread.voteCount * 0.15) * 2;
  }

  // Count recent replies in the last 48 hours
  const recentRepliesCount = repliesDb.filter(r => r.threadId === thread.id && (now - new Date(r.createdAt).getTime()) / (3600 * 1000) <= 48).length;
  score += recentRepliesCount * 5;

  return score;
}

// Helper to enrich thread with extra calculated fields like hasExpertReply
function enrichThread(t: ThreadData) {
  return {
    ...t,
    hasExpertReply: repliesDb.some(r => r.threadId === t.id && r.isExpertReply)
  };
}

// GET list of unpinned threads, scoped, filtered, sorted
app.get('/api/community/:userId/forum/threads', (req, res) => {
  const { scope, category, sort } = req.query;

  let result = threadsDb.filter(t => !t.isPinned);

  // Filter by scope
  if (scope === 'clan') {
    result = result.filter(t => t.scope === 'clan');
  }

  // Filter by category
  if (category && category !== 'all' && category !== 'TOUT') {
    result = result.filter(t => t.category === category);
  }

  // Sorting
  if (sort === 'popular') {
    result.sort((a, b) => b.voteCount - a.voteCount);
  } else if (sort === 'unanswered') {
    result = result.filter(t => t.replyCount === 0);
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // 'recent' by default
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(result.map(enrichThread));
});

// GET pinned threads for specific scope
app.get('/api/community/:userId/forum/threads/pinned', (req, res) => {
  const { scope } = req.query;
  let result = threadsDb.filter(t => t.isPinned);
  if (scope === 'clan') {
    result = result.filter(t => t.scope === 'clan');
  }
  res.json(result.map(enrichThread));
});

// GET list of trending threads
app.get('/api/community/:userId/forum/trending', (req, res) => {
  const { scope } = req.query;
  let result = threadsDb.filter(t => !t.isPinned);

  if (scope === 'clan') {
    result = result.filter(t => t.scope === 'clan');
  }

  // Calculate trending scores, filter and sort
  const scored = result.map(t => ({
    thread: t,
    score: getTrendingScore(t)
  }))
  .filter(item => item.score >= 3) // Threshold for trending
  .sort((a, b) => b.score - a.score);

  const topTrending = scored.slice(0, 5).map(item => item.thread);
  res.json(topTrending.map(enrichThread));
});

// GET search threads
app.get('/api/community/:userId/forum/search', (req, res) => {
  const { scope, q } = req.query;
  const term = typeof q === 'string' ? q.toLowerCase().trim() : '';

  if (!term) {
    return res.json([]);
  }

  let result = threadsDb.filter(t => {
    const matchTerm = t.title.toLowerCase().includes(term) || t.body.toLowerCase().includes(term);
    if (scope === 'clan') {
      return matchTerm && t.scope === 'clan';
    }
    return matchTerm;
  });

  res.json(result.map(enrichThread));
});

// GET single thread detail
app.get('/api/community/:userId/forum/threads/:threadId', (req, res) => {
  const { threadId } = req.params;
  const thread = threadsDb.find(t => t.id === threadId);
  if (thread) {
    res.json(enrichThread(thread));
  } else {
    res.status(404).json({ error: 'Thread not found' });
  }
});

// GET replies of a thread
app.get('/api/community/:userId/forum/threads/:threadId/replies', (req, res) => {
  const { threadId } = req.params;
  const filteredReplies = repliesDb.filter(r => r.threadId === threadId);
  
  // Sort replies using the required logic:
  // 1. Solution/Best Answer first
  // 2. Expert replies next
  // 3. Normal replies sorted by voteCount desc, then createdAt desc
  filteredReplies.sort((a, b) => {
    if (a.isMarkedBest && !b.isMarkedBest) return -1;
    if (!a.isMarkedBest && b.isMarkedBest) return 1;

    if (a.isExpertReply && !b.isExpertReply) return -1;
    if (!a.isExpertReply && b.isExpertReply) return 1;

    if (b.voteCount !== a.voteCount) {
      return b.voteCount - a.voteCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(filteredReplies);
});

// POST create a new thread
app.post('/api/community/:userId/forum/threads', (req, res) => {
  const { category, title, body, scope, moderationStatus, distressFlagged } = req.body;

  if (!category || !title || !body) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  const newThread: ThreadData = {
    id: `thread-${Date.now()}`,
    category,
    scope: scope || 'all',
    authorPseudo: 'Guerrier_Novice',
    authorLevel: 3,
    authorReputationPoints: 8,
    title,
    bodyPreview: body.length > 100 ? body.substring(0, 100) + '...' : body,
    body,
    createdAt: new Date().toISOString(),
    voteCount: 1,
    userHasVoted: true,
    replyCount: 0,
    isPinned: false,
    hasSolution: false,
    solutionReplyId: null,
    moderationStatus: moderationStatus || 'approved',
    reportCount: 0,
    distressFlagged: !!distressFlagged
  };

  threadsDb.unshift(newThread);
  res.status(201).json(newThread);
});

// POST post a reply to a thread
app.post('/api/community/:userId/forum/threads/:threadId/replies', (req, res) => {
  const { threadId } = req.params;
  const { text, isExpert, expertName, expertSpecialty, moderationStatus, distressFlagged } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Le texte de la réponse ne peut pas être vide' });
  }

  const thread = threadsDb.find(t => t.id === threadId);
  if (!thread) {
    return res.status(404).json({ error: 'Sujet introuvable' });
  }

  const newReply: ReplyData = {
    id: `reply-${Date.now()}`,
    threadId,
    authorPseudo: isExpert ? (expertName || 'Expert_Souverain') : 'Guerrier_Novice',
    authorLevel: isExpert ? 25 : 3,
    authorReputationPoints: isExpert ? 650 : 8,
    text,
    createdAt: new Date().toISOString(),
    voteCount: 0,
    userHasVoted: false,
    isExpertReply: !!isExpert,
    expertName: isExpert ? (expertName || 'Expert_Souverain') : undefined,
    expertSpecialty: isExpert ? (expertSpecialty || 'urologie') : undefined,
    isMarkedBest: false,
    moderationStatus: moderationStatus || 'approved',
    reportCount: 0,
    distressFlagged: !!distressFlagged
  };

  repliesDb.push(newReply);
  thread.replyCount += 1;

  // Rule: +5 bonus points to the thread author if thread replyCount reaches exactly 3
  if (thread.replyCount === 3) {
    updateAuthorReputation(thread.authorPseudo, 5);
  }

  res.status(201).json(newReply);
});

// POST upvote a thread
app.post('/api/community/:userId/forum/threads/:threadId/vote', (req, res) => {
  const { threadId } = req.params;
  const thread = threadsDb.find(t => t.id === threadId);
  if (!thread) {
    return res.status(404).json({ error: 'Sujet introuvable' });
  }

  thread.userHasVoted = !thread.userHasVoted;
  if (thread.userHasVoted) {
    thread.voteCount += 1;
    // Rule: +3 points on thread upvote
    updateAuthorReputation(thread.authorPseudo, 3);
  } else {
    thread.voteCount -= 1;
    updateAuthorReputation(thread.authorPseudo, -3);
  }

  res.json({ 
    success: true, 
    voteCount: thread.voteCount, 
    userHasVoted: thread.userHasVoted,
    authorReputationPoints: thread.authorReputationPoints
  });
});

// POST upvote a reply
app.post('/api/community/:userId/forum/replies/:replyId/vote', (req, res) => {
  const { replyId } = req.params;
  const reply = repliesDb.find(r => r.id === replyId);
  if (!reply) {
    return res.status(404).json({ error: 'Réponse introuvable' });
  }

  reply.userHasVoted = !reply.userHasVoted;
  if (reply.userHasVoted) {
    reply.voteCount += 1;
    // Rule: +2 points on reply upvote
    updateAuthorReputation(reply.authorPseudo, 2);
  } else {
    reply.voteCount -= 1;
    updateAuthorReputation(reply.authorPseudo, -2);
  }

  res.json({ 
    success: true, 
    voteCount: reply.voteCount, 
    userHasVoted: reply.userHasVoted,
    authorReputationPoints: reply.authorReputationPoints
  });
});

// POST mark best answer
app.post('/api/community/:userId/forum/threads/:threadId/replies/:replyId/mark-best', (req, res) => {
  const { threadId, replyId } = req.params;
  const thread = threadsDb.find(t => t.id === threadId);
  const reply = repliesDb.find(r => r.id === replyId);

  if (!thread || !reply) {
    return res.status(404).json({ error: 'Sujet ou réponse introuvable' });
  }

  if (thread.hasSolution) {
    return res.status(400).json({ error: 'Ce sujet a déjà une meilleure réponse' });
  }

  thread.hasSolution = true;
  thread.solutionReplyId = replyId;
  reply.isMarkedBest = true;

  // Rule: +15 points on Best Answer marked
  updateAuthorReputation(reply.authorPseudo, 15);

  res.json({ 
    success: true, 
    thread, 
    reply 
  });
});

// POST simulate expert reply on thread
app.post('/api/community/:userId/forum/threads/:threadId/simulate-expert', (req, res) => {
  const { threadId } = req.params;
  const thread = threadsDb.find(t => t.id === threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  
  const experts = [
    { name: 'Dr. Amine El Mansouri', specialty: 'urologie' },
    { name: 'Dr. Marc-Antoine Perrin', specialty: 'sexologie' },
    { name: 'Pr. Karim Benyahia', specialty: 'psychiatrie' },
    { name: 'Jean-Laurent Clavier', specialty: 'nutrition' }
  ];
  
  const randomExpert = experts[Math.floor(Math.random() * experts.length)];
  
  // Find last reply of this thread
  const threadReplies = repliesDb.filter(r => r.threadId === threadId);
  let replyToTransform;
  if (threadReplies.length > 0) {
    // Find the latest one created
    threadReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastReply = threadReplies[0];
    replyToTransform = repliesDb.find(r => r.id === lastReply.id);
  }
  
  if (replyToTransform) {
    replyToTransform.isExpertReply = true;
    replyToTransform.expertName = randomExpert.name;
    replyToTransform.expertSpecialty = randomExpert.specialty as any;
    replyToTransform.authorPseudo = randomExpert.name;
    replyToTransform.authorLevel = 25;
    replyToTransform.authorReputationPoints = 650;
  } else {
    // Create a new expert reply
    const newReply: ReplyData = {
      id: `reply-${Date.now()}`,
      threadId,
      authorPseudo: randomExpert.name,
      authorLevel: 25,
      authorReputationPoints: 650,
      text: `En tant qu'expert en ${randomExpert.specialty}, je vous conseille de rester rigoureux sur vos habitudes de vie. C'est la clé de voûte de votre transformation physique et mentale.`,
      createdAt: new Date().toISOString(),
      voteCount: 5,
      userHasVoted: false,
      isExpertReply: true,
      expertName: randomExpert.name,
      expertSpecialty: randomExpert.specialty as any,
      isMarkedBest: false
    };
    repliesDb.push(newReply);
    thread.replyCount += 1;
    replyToTransform = newReply;
  }
  
  res.json({ success: true, reply: replyToTransform });
});

// POST report thread
app.post('/api/community/:userId/forum/threads/:threadId/report', (req, res) => {
  const { threadId } = req.params;
  const { reason } = req.body;
  const thread = threadsDb.find(t => t.id === threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  thread.reportCount = (thread.reportCount || 0) + 1;
  if (thread.reportCount >= 3) {
    thread.moderationStatus = 'needs_review';
  }
  res.json({ success: true, reportCount: thread.reportCount, moderationStatus: thread.moderationStatus });
});

// POST report reply
app.post('/api/community/:userId/forum/replies/:replyId/report', (req, res) => {
  const { replyId } = req.params;
  const { reason } = req.body;
  const reply = repliesDb.find(r => r.id === replyId);
  if (!reply) return res.status(404).json({ error: 'Reply not found' });

  reply.reportCount = (reply.reportCount || 0) + 1;
  if (reply.reportCount >= 3) {
    reply.moderationStatus = 'needs_review';
  }
  res.json({ success: true, reportCount: reply.reportCount, moderationStatus: reply.moderationStatus });
});


// API Endpoint 3: Proxy secure Gemini API calls
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API Key missing', reply: 'Clé API Gemini non configurée dans les variables d\'environnement.' });
    }

    // Set up default system instructions context for Alpha Man sovereign warrior coach
    const systemInstruction = 
      "Tu es le Coach Souverain d'ALPHA MAN, une application mondiale d'accompagnement de bien-être masculin de haut niveau. " +
      "Ton ton est direct, noble, discipliné, fraternel, digne d'un général spartiate ou d'un mentor d'élite. Tu ne plaisantes pas avec la faiblesse, " +
      "mais tu as une immense empathie pour l'effort et la lutte de l'esprit. L'utilisateur fait face à une urgence ou un stress comportemental intense (voulant rompre son streak). " +
      "Tes objectifs : 1) Ancrer l'utilisateur dans le moment présent, 2) Lui rappeler son serment souverain et l'homme fort qu'il bâtit, " +
      "3) Lui ordonner gentiment mais fermement de canaliser cette énergie brute dans un choc physique immédiat (comme des pompes ou de l'eau froide), " +
      "4) Expliquer calmement qu'une impulsion n'est qu'une surcharge électrique neurologique transitoire de 10 minutes maximum si on ne la nourrit pas de pensées. " +
      "Garde des réponses percutantes, courtes (maximum 3-4 phrases), et hautement galvanisantes. Utilise un langage guerrier mais respectueux.";

    // Call Gemini with the history structure format of the SDK
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...(history || []).map((h: any) => ({
          role: h.role,
          parts: [{ text: h.parts?.[0]?.text || '' }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini call failure:', error);
    res.status(500).json({ error: 'Gemini API call failed', message: error.message });
  }
});

// --- ADMIN DASHBOARD BACKEND API ENDPOINTS ---

// GET /api/admin/stats?period={period}
app.get('/api/admin/stats', (req, res) => {
  try {
    const period = req.query.period || '7d';
    
    // Base values that fluctuate depending on the period selected
    let multiplier = 1.0;
    if (period === 'today') multiplier = 0.98;
    if (period === '30d') multiplier = 1.05;
    if (period === 'all') multiplier = 1.15;

    const stats = {
      totalUsers: Math.round(24152 * multiplier),
      totalUsersDelta: +(12.4 * multiplier).toFixed(1),
      mrr: Math.round(290450 * multiplier),
      mrrDelta: +(8.2 * multiplier).toFixed(1),
      activeToday: Math.round(4812 * (period === 'today' ? 1.0 : multiplier)),
      activeTodayDelta: +(15.1 * (period === 'today' ? 0.8 : multiplier)).toFixed(1),
      conversionRate: +(8.4 * (period === 'today' ? 0.95 : 1.0)).toFixed(1),
      conversionRateDelta: -1.2
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve admin stats', message: error.message });
  }
});

// GET /api/admin/subscriptions/breakdown
app.get('/api/admin/subscriptions/breakdown', (req, res) => {
  try {
    // Return standard representation of the 5 tiers
    const breakdown = [
      { tier: 'FREE', label: 'Accès Libre', count: 10868, percentage: 45, color: 'bg-gray-400' },
      { tier: 'BASIC', label: 'Guerrier Novice', count: 4830, percentage: 20, color: 'bg-blue-400' },
      { tier: 'PREMIUM', label: 'Souverain d\'Élite', count: 5554, percentage: 23, color: 'bg-purple-500' },
      { tier: 'ELITE', label: 'Confrère de l\'Ombre', count: 2173, percentage: 9, color: 'bg-yellow-400' },
      { tier: 'ALPHA', label: 'Légende Absolue', count: 727, percentage: 3, color: 'bg-emerald-400' }
    ];
    res.json(breakdown);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve subscriptions breakdown', message: error.message });
  }
});

// GET /api/admin/streaks/distribution
app.get('/api/admin/streaks/distribution', (req, res) => {
  try {
    const distribution = [
      { range: '0-7j', count: 12450 },
      { range: '8-30j', count: 6820 },
      { range: '31-90j', count: 3120 },
      { range: '91-365j', count: 1320 },
      { range: '365j+', count: 442 }
    ];
    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve streak distribution', message: error.message });
  }
});

interface ModerationItem {
  id: string;
  source: 'stories' | 'forum' | 'chat' | 'experts';
  contentType: 'thread' | 'reply' | 'message' | 'story' | 'question';
  status: 'pending' | 'needs_review' | 'approved' | 'removed' | 'featured';
  authorPseudo: string;
  authorLevel: number;
  authorStreak: number;
  contentPreview: string;
  contentFull: string;
  reportCount: number;
  reportReasons: Array<{ reason: string; count: number }>;
  distressFlagged: boolean;
  followedUpAt: string | null;
  followedUpBy: string | null;
  createdAt: string;
  followUpNote?: string;
}

let moderationQueueDb: ModerationItem[] = [
  {
    id: 'mod-story-1',
    source: 'stories',
    contentType: 'story',
    status: 'pending',
    authorPseudo: 'Rachid_K',
    authorLevel: 3,
    authorStreak: 12,
    contentPreview: "Jour 10 franchi ! J'ai ressenti une pulsion intense hier soir en rentrant du boulot, mais j'ai fait une séance de respiration Kegel guidée et c'est passé...",
    contentFull: "Jour 10 franchi ! J'ai ressenti une pulsion intense hier soir en rentrant du boulot, mais j'ai fait une séance de respiration Kegel guidée et c'est passé. Mon conseil : l'application est un bouclier mental.",
    reportCount: 0,
    reportReasons: [],
    distressFlagged: false,
    followedUpAt: null,
    followedUpBy: null,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: 'mod-forum-1',
    source: 'forum',
    contentType: 'thread',
    status: 'needs_review',
    authorPseudo: 'Loup_Solitaire',
    authorLevel: 1,
    authorStreak: 1,
    contentPreview: "Sujet: REGARDEZ CETTE VIDÉO POUR GUÉRIR IMMEDIATEMENT !!! Salut les gars, cliquez sur mon lien crypto-méditation pour guérir en 24h...",
    contentFull: "Sujet: REGARDEZ CETTE VIDÉO POUR GUÉRIR IMMEDIATEMENT !!! Salut les gars, cliquez sur mon lien crypto-méditation pour guérir en 24h sans aucun effort, c'est gratuit mais vous devez vous inscrire sur le canal telegram du gourou.",
    reportCount: 4,
    reportReasons: [
      { reason: 'Spam / Publicité', count: 3 },
      { reason: 'Contenu suspect', count: 1 }
    ],
    distressFlagged: false,
    followedUpAt: null,
    followedUpBy: null,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'mod-chat-1',
    source: 'chat',
    contentType: 'message',
    status: 'needs_review',
    authorPseudo: 'Novice_Fache',
    authorLevel: 2,
    authorStreak: 0,
    contentPreview: "De toute façon ce programme sert à rien, vous êtes tous des faibles à essayer de contrôler vos corps, allez vous faire voir.",
    contentFull: "De toute façon ce programme sert à rien, vous êtes tous des faibles à essayer de contrôler vos corps, allez vous faire voir.",
    reportCount: 2,
    reportReasons: [
      { reason: 'Insultes / Toxicité', count: 2 }
    ],
    distressFlagged: false,
    followedUpAt: null,
    followedUpBy: null,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'mod-forum-2',
    source: 'forum',
    contentType: 'reply',
    status: 'needs_review',
    authorPseudo: 'Perdu_Dans_Le_Noir',
    authorLevel: 2,
    authorStreak: 3,
    contentPreview: "En réponse au guide des douches froides : C'est n'importe quoi vos douches froides ça détruit la santé et ça sert qu'aux masochistes...",
    contentFull: "En réponse au guide des douches froides : C'est n'importe quoi vos douches froides ça détruit la santé et ça sert qu'aux masochistes. Allez plutôt acheter des pilules.",
    reportCount: 3,
    reportReasons: [
      { reason: 'Harcèlement / Non respect', count: 3 }
    ],
    distressFlagged: false,
    followedUpAt: null,
    followedUpBy: null,
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  },
  {
    id: 'mod-experts-1',
    source: 'experts',
    contentType: 'question',
    status: 'approved',
    authorPseudo: 'Espoir_Brise',
    authorLevel: 4,
    authorStreak: 45,
    contentPreview: "Je viens de rechuter après 45 jours de combat acharné... Je me sens tellement misérable, j'ai l'impression que je n'y arriverai jamais...",
    contentFull: "Je viens de rechuter après 45 jours de combat acharné... Je me sens tellement misérable, j'ai l'impression que je n'y arriverai jamais. J'ai des idées très sombres ce soir, je ne vois plus l'intérêt de continuer à me battre si c'est pour toujours échouer.",
    reportCount: 0,
    reportReasons: [],
    distressFlagged: true,
    followedUpAt: null,
    followedUpBy: null,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'mod-forum-3',
    source: 'forum',
    contentType: 'thread',
    status: 'approved',
    authorPseudo: 'Guerrier_Fatigue',
    authorLevel: 5,
    authorStreak: 120,
    contentPreview: "Sujet: À bout de forces physiques et mentales... Mes frères, après 120 jours de pure abstinence, je traverse une phase de dépression extrême...",
    contentFull: "Sujet: À bout de forces physiques et mentales... Mes frères, après 120 jours de pure abstinence, je traverse une phase de dépression extrême (flatline). Je pleure sans raison, j'ai envie de tout abandonner. J'ai besoin d'aide s'il vous plaît...",
    reportCount: 0,
    reportReasons: [],
    distressFlagged: true,
    followedUpAt: null,
    followedUpBy: null,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'mod-chat-2',
    source: 'chat',
    contentType: 'message',
    status: 'approved',
    authorPseudo: 'Frere_En_Detresse',
    authorLevel: 1,
    authorStreak: 2,
    contentPreview: "Je suis au bord du gouffre les gars. Ma vie est un échec complet, je gâche tout ce que je touche.",
    contentFull: "Je suis au bord du gouffre les gars. Ma vie est un échec complet, je gâche tout ce que je touche.",
    reportCount: 0,
    reportReasons: [],
    distressFlagged: true,
    followedUpAt: null,
    followedUpBy: null,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  }
];

let recentActionsDb = [
  { id: 'act-mod-1', type: 'approve', text: 'Récit de Rachid_K approuvé', timestamp: 'Il y a 2 min' },
  { id: 'act-mod-2', type: 'remove', text: 'Sujet de Loup_Solitaire retiré', timestamp: 'Il y a 10 min' }
];

// GET /api/admin/moderation/queue
app.get('/api/admin/moderation/queue', (req, res) => {
  try {
    const { view, source } = req.query;
    let filtered = [...moderationQueueDb];

    if (view === 'standard') {
      filtered = filtered.filter(item => !item.distressFlagged && (item.status === 'pending' || item.status === 'needs_review'));
    } else if (view === 'distress') {
      filtered = filtered.filter(item => item.distressFlagged);
    }

    if (source && source !== 'all') {
      filtered = filtered.filter(item => item.source === source);
    }

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve moderation queue', message: error.message });
  }
});

// GET /api/admin/moderation/recent-actions
app.get('/api/admin/moderation/recent-actions', (req, res) => {
  res.json(recentActionsDb);
});

// POST /api/admin/moderation/:itemId/approve
app.post('/api/admin/moderation/:itemId/approve', (req, res) => {
  try {
    const { itemId } = req.params;
    const item = moderationQueueDb.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Moderation item not found' });
    }

    item.status = 'approved';

    // Propagate to stories database
    if (item.source === 'stories') {
      const story = storiesDb.find(s => s.id === item.id || s.id === itemId.replace('mod-', ''));
      if (story) {
        story.status = 'approved';
      }
    }

    // Propagate to forum
    if (item.source === 'forum') {
      if (item.contentType === 'thread') {
        const thread = threadsDb.find(t => t.id === item.id || t.id === itemId.replace('mod-', ''));
        if (thread) {
          thread.moderationStatus = 'approved';
        }
      } else if (item.contentType === 'reply') {
        const reply = repliesDb.find(r => r.id === item.id || r.id === itemId.replace('mod-', ''));
        if (reply) {
          reply.moderationStatus = 'approved';
        }
      }
    }

    recentActionsDb.unshift({
      id: 'act-' + Date.now(),
      type: 'approve',
      text: `${item.contentType === 'story' ? 'Récit' : item.contentType === 'thread' ? 'Sujet' : item.contentType === 'reply' ? 'Réponse' : 'Message'} de @${item.authorPseudo} approuvé`,
      timestamp: 'À l\'instant'
    });
    if (recentActionsDb.length > 10) recentActionsDb.pop();

    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve moderation item', message: error.message });
  }
});

// POST /api/admin/moderation/:itemId/feature
app.post('/api/admin/moderation/:itemId/feature', (req, res) => {
  try {
    const { itemId } = req.params;
    const item = moderationQueueDb.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Moderation item not found' });
    }

    item.status = 'featured';

    if (item.source === 'stories') {
      const story = storiesDb.find(s => s.id === item.id || s.id === itemId.replace('mod-', ''));
      if (story) {
        story.status = 'featured';
      }
    }

    recentActionsDb.unshift({
      id: 'act-' + Date.now(),
      type: 'feature',
      text: `Récit de @${item.authorPseudo} mis en vedette ⭐`,
      timestamp: 'À l\'instant'
    });
    if (recentActionsDb.length > 10) recentActionsDb.pop();

    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to feature moderation item', message: error.message });
  }
});

// POST /api/admin/moderation/:itemId/remove
app.post('/api/admin/moderation/:itemId/remove', (req, res) => {
  try {
    const { itemId } = req.params;
    const { reason } = req.body;
    const item = moderationQueueDb.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Moderation item not found' });
    }

    item.status = 'removed';

    // Propagate to stories database
    if (item.source === 'stories') {
      const story = storiesDb.find(s => s.id === item.id || s.id === itemId.replace('mod-', ''));
      if (story) {
        story.status = 'needs_review'; // hide or mark removed
      }
    }

    // Propagate to forum
    if (item.source === 'forum') {
      if (item.contentType === 'thread') {
        const thread = threadsDb.find(t => t.id === item.id || t.id === itemId.replace('mod-', ''));
        if (thread) {
          thread.moderationStatus = 'removed';
        }
      } else if (item.contentType === 'reply') {
        const reply = repliesDb.find(r => r.id === item.id || r.id === itemId.replace('mod-', ''));
        if (reply) {
          reply.moderationStatus = 'removed';
        }
      }
    }

    recentActionsDb.unshift({
      id: 'act-' + Date.now(),
      type: 'remove',
      text: `${item.contentType === 'story' ? 'Récit' : item.contentType === 'thread' ? 'Sujet' : item.contentType === 'reply' ? 'Réponse' : 'Message'} de @${item.authorPseudo} retiré: ${reason || 'Infraction à la charte'}`,
      timestamp: 'À l\'instant'
    });
    if (recentActionsDb.length > 10) recentActionsDb.pop();

    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove moderation item', message: error.message });
  }
});

// POST /api/admin/moderation/:itemId/follow-up
app.post('/api/admin/moderation/:itemId/follow-up', (req, res) => {
  try {
    const { itemId } = req.params;
    const { note } = req.body;
    const item = moderationQueueDb.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Moderation item not found' });
    }

    item.followedUpAt = new Date().toISOString();
    item.followedUpBy = 'Général HQ';
    item.followUpNote = note || '';

    recentActionsDb.unshift({
      id: 'act-' + Date.now(),
      type: 'follow_up',
      text: `Suivi détresse validé pour @${item.authorPseudo}`,
      timestamp: 'À l\'instant'
    });
    if (recentActionsDb.length > 10) recentActionsDb.pop();

    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to follow-up on distress signal', message: error.message });
  }
});

// GET /api/admin/moderation/queue-summary
app.get('/api/admin/moderation/queue-summary', (req, res) => {
  try {
    // Dynamic counts from the moderation database
    const storiesCount = moderationQueueDb.filter(i => i.source === 'stories' && !i.distressFlagged && (i.status === 'pending' || i.status === 'needs_review')).length;
    const forumThreadsCount = moderationQueueDb.filter(i => i.source === 'forum' && !i.distressFlagged && (i.status === 'pending' || i.status === 'needs_review')).length;
    const chatReportsCount = moderationQueueDb.filter(i => i.source === 'chat' && !i.distressFlagged && (i.status === 'pending' || i.status === 'needs_review')).length;
    const expertQuestionsCount = moderationQueueDb.filter(i => i.distressFlagged && !i.followedUpAt).length;

    const total = storiesCount + forumThreadsCount + chatReportsCount + expertQuestionsCount;

    res.json({
      stories: storiesCount,
      forumThreads: forumThreadsCount,
      chatReports: chatReportsCount,
      expertQuestions: expertQuestionsCount,
      total: total
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve moderation queue summary', message: error.message });
  }
});

// GET /api/admin/activity/recent?period={period}
app.get('/api/admin/activity/recent', (req, res) => {
  try {
    const period = req.query.period || '7d';
    
    // Return different timestamp names or labels for variance
    const prefix = period === 'today' ? 'Aujourd\'hui, il y a ' : 'Il y a ';
    
    const activities = [
      { id: 'act-1', type: 'user-plus', text: 'Nouveau guerrier souverain inscrit depuis Casablanca', timestamp: `${prefix}5 min` },
      { id: 'act-2', type: 'credit-card', text: 'Abonnement PREMIUM activé par un membre de la Confrérie', timestamp: `${prefix}12 min` },
      { id: 'act-3', type: 'flag', text: 'Message signalé pour révision dans le chat du Clan Alpha', timestamp: `${prefix}24 min` },
      { id: 'act-4', type: 'award', text: 'Palier légendaire de 90 jours validé par @Guerrier_Elite', timestamp: `${prefix}45 min` },
      { id: 'act-5', type: 'user-plus', text: 'Nouveau guerrier souverain inscrit depuis Marrakech', timestamp: `${prefix}1h` },
      { id: 'act-6', type: 'credit-card', text: 'Mise à niveau vers le Tier ALPHA (Légende Absolue) par @Souverain77', timestamp: `${prefix}1h 30` },
      { id: 'act-7', type: 'flag', text: 'Sujet du forum mis en attente suite à 3 signalements', timestamp: `${prefix}2h` },
      { id: 'act-8', type: 'award', text: 'Niveau d\'Honneur 10 atteint par @Confrere_Spartiate', timestamp: `${prefix}3h` }
    ];

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve recent activities', message: error.message });
  }
});

// ==========================================
// IN-MEMORY DATABASES FOR CONTENT MANAGEMENT
// ==========================================
let lessonsAdminDb: any[] = [];
let challengesAdminDb: any[] = [
  {
    id: 'chall-1',
    title: 'Défi du Moine Solitaire',
    description: "30 jours d'abstinence sexuelle totale et de reconconnexion mentale saine. Reconnectez-vous à l'essentiel.",
    type: 'individual',
    rewardPoints: 100,
    durationDays: 30,
    startDate: new Date().toISOString().split('T')[0],
    active: true
  },
  {
    id: 'chall-2',
    title: 'Bataille de Respiration du Clan',
    description: 'Atteindre collectivement 500 minutes de respiration de combat au sein du clan pour libérer l\'énergie sacrée.',
    type: 'clan',
    rewardPoints: 150,
    durationDays: 7,
    startDate: new Date().toISOString().split('T')[0],
    active: true
  },
  {
    id: 'chall-3',
    title: 'Douche Froide d\'Acier',
    description: 'Prendre une douche froide de 3 minutes chaque matin au réveil pour endurcir l\'esprit et le corps.',
    type: 'individual',
    rewardPoints: 50,
    durationDays: 5,
    startDate: new Date().toISOString().split('T')[0],
    active: false
  }
];

let expertsAdminDb: any[] = [
  {
    id: 'exp-1',
    name: 'Dr. Marc-Antoine Perrin',
    title: 'Sexologue clinicien & Andrologue',
    specialty: 'sexologie',
    bio: 'Sexologue clinicien & Andrologue. Spécialiste de la réactivité neuro-sexuelle.',
    isActive: true,
    sessionCount: 42,
    questionCount: 156
  },
  {
    id: 'exp-2',
    name: 'Dr. Amine El Mansouri',
    title: 'Chirurgien Urologue',
    specialty: 'urologie',
    bio: 'Chirurgien Urologue spécialisé en physiologie pelvienne et abstinence active.',
    isActive: true,
    sessionCount: 18,
    questionCount: 92
  },
  {
    id: 'exp-3',
    name: 'Pr. Karim Benyahia',
    title: 'Neuro-Psychiatre',
    specialty: 'psychiatrie',
    bio: 'Neuro-Psychiatre, chercheur sur la reconfiguration des circuits dopaminergiques.',
    isActive: true,
    sessionCount: 56,
    questionCount: 312
  },
  {
    id: 'exp-4',
    name: 'Jean-Laurent Clavier',
    title: 'Nutritionniste & Expert en endocrinologie',
    specialty: 'nutrition',
    bio: 'Nutritionniste & Expert en endocrinologie comportementale et optimisation hormonale.',
    isActive: true,
    sessionCount: 12,
    questionCount: 45
  }
];

// Helper to initialize lessons admin database
function ensureLessonsInitialized() {
  if (lessonsAdminDb.length === 0) {
    lessonsAdminDb = EDUCATION_LESSONS.map(l => ({
      id: l.id,
      category: l.category,
      categoryLabel: l.categoryLabel,
      level: l.level,
      title: l.title,
      subtitle: l.subtitle,
      durationMinutes: l.durationMinutes,
      requiredTier: l.requiredTier,
      rewardPoints: l.rewardPoints,
      unlockCondition: l.unlockCondition,
      content: l.content,
      status: 'published'
    }));
  }
}

// GET /api/admin/content/lessons
app.get('/api/admin/content/lessons', (req, res) => {
  try {
    ensureLessonsInitialized();
    const { category, q } = req.query;
    let filtered = [...lessonsAdminDb];

    if (category && category !== 'all') {
      const categoryMap: Record<string, string> = {
        'Neuroscience': 'NEUROSCIENCE',
        'Addiction': 'PATTERN_ADDICTION',
        'Physiologie Kegel': 'KEGEL_PHYSIOLOGY',
        'Vitalité': 'VITALITY_ENERGY',
        'Confiance & Intimité': 'CONFIDENCE_INTIMACY'
      };
      const dbCat = categoryMap[category as string];
      if (dbCat) {
        filtered = filtered.filter(l => l.category === dbCat);
      }
    }

    if (q) {
      const searchStr = (q as string).toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchStr) || 
        l.subtitle.toLowerCase().includes(searchStr)
      );
    }

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve lessons', message: error.message });
  }
});

// POST /api/admin/content/lessons
app.post('/api/admin/content/lessons', (req, res) => {
  try {
    ensureLessonsInitialized();
    const { title, category, level, contentText, status, durationMinutes, rewardPoints } = req.body;
    
    const newLesson = {
      id: `lesson-${Date.now()}`,
      category: category || 'NEUROSCIENCE',
      categoryLabel: category === 'NEUROSCIENCE' ? 'Neuroscience Fondamentale' : 
                     category === 'PATTERN_ADDICTION' ? 'Addiction & Habitudes' :
                     category === 'KEGEL_PHYSIOLOGY' ? 'Physiologie Kegel' :
                     category === 'VITALITY_ENERGY' ? 'Vitalité & Énergie' : 'Confiance & Intimité',
      level: Number(level) || 1,
      title: title || 'Nouvelle Leçon',
      subtitle: 'Créé via le poste de gestion de contenu',
      durationMinutes: Number(durationMinutes) || 5,
      requiredTier: 'FREE',
      rewardPoints: Number(rewardPoints) || 50,
      unlockCondition: 'none',
      content: [
        { type: 'header', text: title },
        { type: 'text', text: contentText || '' }
      ],
      status: status || 'draft'
    };

    lessonsAdminDb.unshift(newLesson);
    res.json({ success: true, lesson: newLesson });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create lesson', message: error.message });
  }
});

// PUT /api/admin/content/lessons/:id
app.put('/api/admin/content/lessons/:id', (req, res) => {
  try {
    ensureLessonsInitialized();
    const { id } = req.params;
    const { title, category, level, contentText, status, durationMinutes, rewardPoints } = req.body;

    const lesson = lessonsAdminDb.find(l => l.id === id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (title !== undefined) lesson.title = title;
    if (category !== undefined) {
      lesson.category = category;
      lesson.categoryLabel = category === 'NEUROSCIENCE' ? 'Neuroscience Fondamentale' : 
                             category === 'PATTERN_ADDICTION' ? 'Addiction & Habitudes' :
                             category === 'KEGEL_PHYSIOLOGY' ? 'Physiologie Kegel' :
                             category === 'VITALITY_ENERGY' ? 'Vitalité & Énergie' : 'Confiance & Intimité';
    }
    if (level !== undefined) lesson.level = Number(level);
    if (durationMinutes !== undefined) lesson.durationMinutes = Number(durationMinutes);
    if (rewardPoints !== undefined) lesson.rewardPoints = Number(rewardPoints);
    if (contentText !== undefined) {
      lesson.content = [
        { type: 'header', text: lesson.title },
        { type: 'text', text: contentText }
      ];
    }
    if (status !== undefined) lesson.status = status;

    res.json({ success: true, lesson });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update lesson', message: error.message });
  }
});

// DELETE /api/admin/content/lessons/:id
app.delete('/api/admin/content/lessons/:id', (req, res) => {
  try {
    ensureLessonsInitialized();
    const { id } = req.params;
    const index = lessonsAdminDb.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    lessonsAdminDb.splice(index, 1);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete lesson', message: error.message });
  }
});

// GET /api/admin/content/challenges
app.get('/api/admin/content/challenges', (req, res) => {
  try {
    const { type, q } = req.query;
    let filtered = [...challengesAdminDb];

    if (type && type !== 'all') {
      filtered = filtered.filter(c => c.type === type);
    }

    if (q) {
      const searchStr = (q as string).toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchStr) || 
        c.description.toLowerCase().includes(searchStr)
      );
    }

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve challenges', message: error.message });
  }
});

// POST /api/admin/content/challenges
app.post('/api/admin/content/challenges', (req, res) => {
  try {
    const { title, description, type, rewardPoints, durationDays, startDate, active } = req.body;
    
    const newChallenge = {
      id: `chall-${Date.now()}`,
      title: title || 'Nouveau Défi',
      description: description || '',
      type: type || 'individual',
      rewardPoints: Number(rewardPoints) || 50,
      durationDays: Number(durationDays) || 7,
      startDate: startDate || new Date().toISOString().split('T')[0],
      active: active !== undefined ? active : true
    };

    challengesAdminDb.unshift(newChallenge);
    res.json({ success: true, challenge: newChallenge });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create challenge', message: error.message });
  }
});

// PUT /api/admin/content/challenges/:id
app.put('/api/admin/content/challenges/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, rewardPoints, durationDays, startDate, active } = req.body;

    const challenge = challengesAdminDb.find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (title !== undefined) challenge.title = title;
    if (description !== undefined) challenge.description = description;
    if (type !== undefined) challenge.type = type;
    if (rewardPoints !== undefined) challenge.rewardPoints = Number(rewardPoints);
    if (durationDays !== undefined) challenge.durationDays = Number(durationDays);
    if (startDate !== undefined) challenge.startDate = startDate;
    if (active !== undefined) challenge.active = active;

    res.json({ success: true, challenge });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update challenge', message: error.message });
  }
});

// DELETE /api/admin/content/challenges/:id
app.delete('/api/admin/content/challenges/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = challengesAdminDb.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    challengesAdminDb.splice(index, 1);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete challenge', message: error.message });
  }
});

// GET /api/admin/content/experts
app.get('/api/admin/content/experts', (req, res) => {
  try {
    const { q } = req.query;
    let filtered = [...expertsAdminDb];

    if (q) {
      const searchStr = (q as string).toLowerCase();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(searchStr) || 
        e.title.toLowerCase().includes(searchStr) || 
        e.bio.toLowerCase().includes(searchStr)
      );
    }

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve experts', message: error.message });
  }
});

// POST /api/admin/content/experts
app.post('/api/admin/content/experts', (req, res) => {
  try {
    const { name, title, specialty, bio, isActive } = req.body;
    
    const newExpert = {
      id: `exp-${Date.now()}`,
      name: name || 'Nouvel Expert',
      title: title || 'Médecin Praticien',
      specialty: specialty || 'urologie',
      bio: bio || '',
      isActive: isActive !== undefined ? isActive : true,
      sessionCount: 0,
      questionCount: 0
    };

    expertsAdminDb.unshift(newExpert);
    res.json({ success: true, expert: newExpert });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create expert', message: error.message });
  }
});

// PUT /api/admin/content/experts/:id
app.put('/api/admin/content/experts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, specialty, bio, isActive } = req.body;

    const expert = expertsAdminDb.find(e => e.id === id);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    if (name !== undefined) expert.name = name;
    if (title !== undefined) expert.title = title;
    if (specialty !== undefined) expert.specialty = specialty;
    if (bio !== undefined) expert.bio = bio;
    if (isActive !== undefined) expert.isActive = isActive;

    res.json({ success: true, expert });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update expert', message: error.message });
  }
});

// DELETE /api/admin/content/experts/:id
app.delete('/api/admin/content/experts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = expertsAdminDb.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Expert not found' });
    }
    expertsAdminDb.splice(index, 1);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete expert', message: error.message });
  }
});

// ==========================================
// ADMIN ANALYTICS ENDPOINTS
// ==========================================

app.get('/api/admin/analytics/retention', (req, res) => {
  try {
    const period = (req.query.period as string) || '30d';
    
    // Scale factor based on period
    const factor = period === '12m' ? 1.15 : period === '90d' ? 1.05 : 1.0;
    
    const d1 = Math.round(84 * factor * 10) / 10;
    const d7 = Math.round(56 * factor * 10) / 10;
    const d30 = Math.round(41 * factor * 10) / 10;
    
    // Cohort retention curves (days 0 to 30)
    const cohortCurves = [
      {
        cohortLabel: "Cohorte 13 Juil 2026",
        points: Array.from({ length: 31 }, (_, day) => {
          let percent = 100 - Math.pow(day, 0.6) * 11;
          if (day > 0) percent -= 5;
          return { day, percentActive: Math.max(10, Math.round(percent * 10) / 10) };
        })
      },
      {
        cohortLabel: "Cohorte 06 Juil 2026",
        points: Array.from({ length: 31 }, (_, day) => {
          let percent = 100 - Math.pow(day, 0.6) * 11.8;
          if (day > 0) percent -= 6;
          return { day, percentActive: Math.max(8, Math.round(percent * 10) / 10) };
        })
      },
      {
        cohortLabel: "Cohorte 29 Juin 2026",
        points: Array.from({ length: 31 }, (_, day) => {
          let percent = 100 - Math.pow(day, 0.6) * 10.5;
          if (day > 0) percent -= 4;
          return { day, percentActive: Math.max(12, Math.round(percent * 10) / 10) };
        })
      }
    ];

    const pillarRetention = [
      { pillar: 'Pattern Killer', retentionD30: 58 },
      { pillar: 'Kegel', retentionD30: 49 },
      { pillar: 'Communauté', retentionD30: 74 },
      { pillar: 'Vitalité seule', retentionD30: 31 }
    ];

    const churnReasons = [
      { reason: 'Prix trop élevé', percentage: 38, count: Math.round(45 * (period === '12m' ? 12 : period === '90d' ? 3 : 1)) },
      { reason: 'Pas assez utilisé', percentage: 28, count: Math.round(33 * (period === '12m' ? 12 : period === '90d' ? 3 : 1)) },
      { reason: 'Objectif atteint', percentage: 18, count: Math.round(21 * (period === '12m' ? 12 : period === '90d' ? 3 : 1)) },
      { reason: 'Manque de fonctionnalités', percentage: 11, count: Math.round(13 * (period === '12m' ? 12 : period === '90d' ? 3 : 1)) },
      { reason: 'Autre', percentage: 5, count: Math.round(6 * (period === '12m' ? 12 : period === '90d' ? 3 : 1)) }
    ];

    res.json({
      d1,
      d1Delta: 1.2,
      d7,
      d7Delta: 2.4,
      d30,
      d30Delta: 4.8,
      cohortCurves,
      pillarRetention,
      churnReasons
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch retention analytics', message: error.message });
  }
});

app.get('/api/admin/analytics/funnel', (req, res) => {
  try {
    const period = (req.query.period as string) || '30d';
    const mult = period === '12m' ? 12 : period === '90d' ? 3 : 1;

    const baseDownloads = 1200 * mult;
    const onboardingCompleted = Math.round(baseDownloads * 0.82);
    const accountCreated = Math.round(onboardingCompleted * 0.83);
    const freeTrialActive = Math.round(accountCreated * 0.515);
    const convertedPayant = Math.round(freeTrialActive * 0.24);

    const steps = [
      { label: 'Téléchargement', percentage: 100, count: baseDownloads },
      { label: 'Onboarding complété', percentage: Math.round((onboardingCompleted / baseDownloads) * 100), count: onboardingCompleted },
      { label: 'Compte créé', percentage: Math.round((accountCreated / baseDownloads) * 100), count: accountCreated },
      { label: 'Essai/FREE actif 7 jours', percentage: Math.round((freeTrialActive / baseDownloads) * 100), count: freeTrialActive },
      { label: 'Converti en payant', percentage: Math.round((convertedPayant / baseDownloads) * 1000) / 10, count: convertedPayant }
    ];

    const acquisitionSources = [
      { source: 'Parrainage', percentage: 28, count: Math.round(baseDownloads * 0.28), conversionRate: 14.5 },
      { source: 'Recherche organique', percentage: 42, count: Math.round(baseDownloads * 0.42), conversionRate: 6.2 },
      { source: 'Réseaux sociaux', percentage: 22, count: Math.round(baseDownloads * 0.22), conversionRate: 4.8 },
      { source: 'Autre', percentage: 8, count: Math.round(baseDownloads * 0.08), conversionRate: 3.1 }
    ];

    res.json({
      steps,
      acquisitionSources
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch funnel analytics', message: error.message });
  }
});

app.get('/api/admin/analytics/revenue', (req, res) => {
  try {
    const period = (req.query.period as string) || '30d';
    
    let mrr = 18450;
    let arpu = 185;
    let ltv = 1110;
    let churnRate = 4.2;

    if (period === '90d') {
      mrr = 19600;
      arpu = 188;
      ltv = 1140;
      churnRate = 4.1;
    } else if (period === '12m') {
      mrr = 24100;
      arpu = 195;
      ltv = 1250;
      churnRate = 3.8;
    }

    let mrrTrend: any[] = [];
    if (period === '12m') {
      const months = ['Août 25', 'Sept 25', 'Oct 25', 'Nov 25', 'Déc 25', 'Jan 26', 'Fév 26', 'Mar 26', 'Avr 26', 'Mai 26', 'Juin 26', 'Juil 26'];
      let base = 12000;
      mrrTrend = months.map((m, i) => {
        base += 1000 + Math.sin(i) * 300;
        return {
          month: m,
          mrr: Math.round(base),
          mrrWithoutChurn: Math.round(base * (1 + (i * 0.015)))
        };
      });
    } else if (period === '90d') {
      const months = ['Mai 26', 'Juin 26', 'Juil 26'];
      let base = 16000;
      mrrTrend = months.map((m, i) => {
        base += 1200 + Math.sin(i) * 200;
        return {
          month: m,
          mrr: Math.round(base),
          mrrWithoutChurn: Math.round(base * (1 + (i * 0.02)))
        };
      });
    } else {
      const months = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
      let base = 17200;
      mrrTrend = months.map((m, i) => {
        base += 300 + Math.sin(i) * 100;
        return {
          month: m,
          mrr: Math.round(base),
          mrrWithoutChurn: Math.round(base * (1 + (i * 0.008)))
        };
      });
    }

    const subscriberMult = period === '12m' ? 1.5 : period === '90d' ? 1.1 : 1.0;
    const tierBreakdown = [
      { tier: 'BASIC', subscriberCount: Math.round(52 * subscriberMult), mrrContribution: Math.round(2548 * subscriberMult), percentage: 13.8 },
      { tier: 'PREMIUM', subscriberCount: Math.round(34 * subscriberMult), mrrContribution: Math.round(5066 * subscriberMult), percentage: 27.5 },
      { tier: 'ELITE', subscriberCount: Math.round(18 * subscriberMult), mrrContribution: Math.round(5382 * subscriberMult), percentage: 29.2 },
      { tier: 'ALPHA', subscriberCount: Math.round(11 * subscriberMult), mrrContribution: Math.round(5454 * subscriberMult), percentage: 29.5 }
    ];

    res.json({
      mrr,
      mrrDelta: 12.4,
      arpu,
      arpuDelta: 2.1,
      ltv,
      ltvDelta: 4.5,
      churnRate,
      churnRateDelta: -0.8,
      mrrTrend,
      tierBreakdown
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch revenue analytics', message: error.message });
  }
});

app.get('/api/admin/analytics/community', (req, res) => {
  try {
    const period = (req.query.period as string) || '30d';
    const mult = period === '12m' ? 12 : period === '90d' ? 3 : 1;

    // Read real databases!
    const baseStories = storiesDb.length;
    const baseThreads = threadsDb.length;
    const baseMentors = currentMenteesDb.length;
    
    let baseChat = 0;
    Object.values(clanMessagesDb).forEach(messages => {
      baseChat += messages.length;
    });
    if (baseChat === 0) {
      baseChat = 42;
    }

    const storiesPublished = baseStories * mult;
    const forumThreadsCreated = baseThreads * mult;
    const mentorshipMatches = Math.max(1, baseMentors) * mult;
    const chatMessages = baseChat * mult;

    const retentionWithCommunity = Math.min(95, 76 + (baseStories % 5));
    const retentionWithoutCommunity = Math.max(15, 29 - (baseThreads % 4));

    let moderationTrend: any[] = [];
    if (period === '12m') {
      const months = ['Août 25', 'Sept 25', 'Oct 25', 'Nov 25', 'Déc 25', 'Jan 26', 'Fév 26', 'Mar 26', 'Avr 26', 'Mai 26', 'Juin 26', 'Juil 26'];
      moderationTrend = months.map((m, i) => ({
        week: m,
        created: Math.round(15 + Math.sin(i) * 5 + i * 0.5),
        resolved: Math.round(14 + Math.sin(i) * 4.8 + i * 0.5)
      }));
    } else if (period === '90d') {
      const weeks = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5', 'Semaine 6', 'Semaine 7', 'Semaine 8', 'Semaine 9', 'Semaine 10', 'Semaine 11', 'Semaine 12'];
      moderationTrend = weeks.map((w, i) => ({
        week: w,
        created: Math.round(8 + Math.cos(i) * 3),
        resolved: Math.round(7 + Math.cos(i) * 2.8)
      }));
    } else {
      const weeks = ['Semaine -3', 'Semaine -2', 'Semaine -1', 'Semaine Actuelle'];
      moderationTrend = weeks.map((w, i) => ({
        week: w,
        created: Math.round(6 + i * 2),
        resolved: Math.round(5 + i * 2.1)
      }));
    }

    res.json({
      storiesPublished,
      storiesDelta: 14,
      forumThreadsCreated,
      forumDelta: 8,
      mentorshipMatches,
      mentorshipDelta: 22,
      chatMessages,
      chatDelta: 35,
      retentionWithCommunity,
      retentionWithoutCommunity,
      moderationTrend
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch community analytics', message: error.message });
  }
});

app.get('/api/admin/analytics/export', (req, res) => {
  try {
    const tab = (req.query.tab as string) || 'retention';
    const period = (req.query.period as string) || '30d';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics_${tab}_${period}.csv`);

    let csvContent = '';

    if (tab === 'retention') {
      csvContent = `Metrique,Valeur,Delta\nRetention J1,84%,+1.2%\nRetention J7,56%,+2.4%\nRetention J30,41%,+4.8%\n\n`;
      csvContent += `Pilier,Retention J30\nPattern Killer,58%\nKegel,49%\nCommunaute,74%\nVitalite seule,31%\n`;
    } else if (tab === 'funnel') {
      csvContent = `Etape,Pourcentage,Nombre Absolu\nTéléchargement,100%,1200\nOnboarding complet,82%,984\nCompte cree,68%,816\nEssai FREE 7 jours,35%,420\nConverti en payant,8.4%,101\n`;
    } else if (tab === 'revenue') {
      csvContent = `Indicateur,Valeur,Delta\nMRR,18450 DH,+12.4%\nARPU,185 DH,+2.1%\nLTV estimee,1110 DH,+4.5%\nTaux de Churn,4.2%,-0.8%\n`;
    } else {
      csvContent = `Metrique,Valeur,Delta\nRecits publies,${storiesDb.length},+14%\nFils Forum crees,${threadsDb.length},+8%\nMises en relation Mentorat,${currentMenteesDb.length},+22%\n`;
    }

    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export analytics', message: error.message });
  }
});

// ==========================================
// ADMIN AD MANAGEMENT DATA & ENDPOINTS
// ==========================================

interface PlacementData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  type: 'RÉCOMPENSÉ' | 'INTERSTITIEL';
  ecpm: number;
  viewsPerDay: number;
  fillRate: number;
  maxDailyFrequency: number;
  priorityNetwork: string;
}

interface NetworkData {
  id: string;
  name: string;
  isActive: boolean;
  ecpm: number;
  fillRate: number;
  rank: number;
}

interface RewardSettings {
  pointsPerAd: number;
  dailyLimit: number;
  weekendMultiplierActive: boolean;
  weekendMultiplierPercent: number;
}

interface ProtectedZone {
  id: string;
  name: string;
  description: string;
  isLocked: boolean;
  isPermanent: boolean;
}

let adPlacementsDb: PlacementData[] = [
  {
    id: 'rewarded_video_rewards',
    name: 'Récompense Vidéo (AdRewardsScreen)',
    description: 'Vidéo complète, opt-in utilisateur',
    isActive: true,
    type: 'RÉCOMPENSÉ',
    ecpm: 18,
    viewsPerDay: 2300,
    fillRate: 94,
    maxDailyFrequency: 5,
    priorityNetwork: 'admob'
  },
  {
    id: 'interstitial_kegel_end',
    name: 'Interstitiel Fin de Session Kegel',
    description: 'Affiché à la complétion d\'une session d\'exercices Kegel',
    isActive: true,
    type: 'INTERSTITIEL',
    ecpm: 12,
    viewsPerDay: 1400,
    fillRate: 89,
    maxDailyFrequency: 3,
    priorityNetwork: 'unity_ads'
  },
  {
    id: 'interstitial_back_dashboard',
    name: 'Interstitiel Retour Dashboard',
    description: 'Désactivé par défaut (fréquence trop intrusive si actif par défaut)',
    isActive: false,
    type: 'INTERSTITIEL',
    ecpm: 9,
    viewsPerDay: 0,
    fillRate: 85,
    maxDailyFrequency: 2,
    priorityNetwork: 'ironsource'
  }
];

let adNetworksDb: NetworkData[] = [
  { id: 'admob', name: 'AdMob', isActive: true, ecpm: 22, fillRate: 96, rank: 1 },
  { id: 'unity_ads', name: 'Unity Ads', isActive: true, ecpm: 16, fillRate: 92, rank: 2 },
  { id: 'ironsource', name: 'IronSource', isActive: true, ecpm: 14, fillRate: 88, rank: 3 }
];

let adRewardSettingsDb: RewardSettings = {
  pointsPerAd: 50,
  dailyLimit: 4,
  weekendMultiplierActive: false,
  weekendMultiplierPercent: 50
};

let adProtectedZonesDb: ProtectedZone[] = [
  {
    id: 'crisis_mode',
    name: 'Mode Crise Pattern Killer',
    description: 'CircuitObserverDiagram en context=crisis',
    isLocked: true,
    isPermanent: true
  },
  {
    id: 'distress_overlay',
    name: 'Overlay de détresse (Forum, Stories, Chat, Experts)',
    description: 'Filtre de détresse identifié de la Phase 6',
    isLocked: true,
    isPermanent: true
  },
  {
    id: 'story_composer',
    name: 'Composer de Story pendant rédaction',
    description: 'Évite l\'interruption cognitive en cours de rédaction d\'un récit intime',
    isLocked: true,
    isPermanent: false
  },
  {
    id: 'mentorship_chat',
    name: 'Chat Mentorat 1-à-1',
    description: 'Espace d\'accompagnement confidentiel et sécurisant',
    isLocked: true,
    isPermanent: false
  },
  {
    id: 'onboarding_first_steps',
    name: 'Onboarding (5 premières étapes)',
    description: 'Garantit que le nouveau guerrier comprend la proposition de valeur sans distraction',
    isLocked: true,
    isPermanent: false
  }
];

// PLACEMENTS API
app.get('/api/admin/ads/placements', (req, res) => {
  res.json(adPlacementsDb);
});

app.put('/api/admin/ads/placements/:id', (req, res) => {
  const { id } = req.params;
  const placement = adPlacementsDb.find(p => p.id === id);
  if (!placement) {
    return res.status(404).json({ error: 'Placement not found' });
  }
  const { isActive, maxDailyFrequency, priorityNetwork, name, type } = req.body;
  if (isActive !== undefined) placement.isActive = isActive;
  if (maxDailyFrequency !== undefined) placement.maxDailyFrequency = Number(maxDailyFrequency);
  if (priorityNetwork !== undefined) placement.priorityNetwork = priorityNetwork;
  if (name !== undefined) placement.name = name;
  if (type !== undefined) placement.type = type;
  res.json({ success: true, placement });
});

// NETWORKS API
app.get('/api/admin/ads/networks', (req, res) => {
  res.json(adNetworksDb.sort((a, b) => a.rank - b.rank));
});

app.put('/api/admin/ads/networks/reorder', (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds must be an array' });
  }
  orderedIds.forEach((id: string, index: number) => {
    const net = adNetworksDb.find(n => n.id === id);
    if (net) {
      net.rank = index + 1;
    }
  });
  res.json({ success: true, networks: adNetworksDb.sort((a, b) => a.rank - b.rank) });
});

app.get('/api/admin/ads/networks/performance', (req, res) => {
  res.json([
    { network: 'AdMob', ecpm: 22, fillRate: 96 },
    { network: 'Unity Ads', ecpm: 16, fillRate: 92 },
    { network: 'IronSource', ecpm: 14, fillRate: 88 }
  ]);
});

// REWARDS API
app.get('/api/admin/ads/rewards/settings', (req, res) => {
  res.json(adRewardSettingsDb);
});

app.put('/api/admin/ads/rewards/settings', (req, res) => {
  const { pointsPerAd, dailyLimit, weekendMultiplierActive, weekendMultiplierPercent } = req.body;
  if (pointsPerAd !== undefined) adRewardSettingsDb.pointsPerAd = Number(pointsPerAd);
  if (dailyLimit !== undefined) adRewardSettingsDb.dailyLimit = Number(dailyLimit);
  if (weekendMultiplierActive !== undefined) adRewardSettingsDb.weekendMultiplierActive = Boolean(weekendMultiplierActive);
  if (weekendMultiplierPercent !== undefined) adRewardSettingsDb.weekendMultiplierPercent = Number(weekendMultiplierPercent);
  res.json({ success: true, settings: adRewardSettingsDb });
});

app.get('/api/admin/ads/rewards/usage', (req, res) => {
  res.json({
    adsWatchedToday: 1430,
    pointsDistributedToday: 1430 * adRewardSettingsDb.pointsPerAd,
    completionRate: 88
  });
});

// PROTECTED ZONES API
app.get('/api/admin/ads/protected-zones', (req, res) => {
  res.json(adProtectedZonesDb);
});

app.put('/api/admin/ads/protected-zones/:id', (req, res) => {
  const { id } = req.params;
  const zone = adProtectedZonesDb.find(z => z.id === id);
  if (!zone) {
    return res.status(404).json({ error: 'Protected zone not found' });
  }
  if (zone.isPermanent) {
    return res.status(400).json({ error: 'Protection permanente non désactivable pour préserver les personnes vulnérables' });
  }
  const { isLocked } = req.body;
  if (isLocked !== undefined) {
    zone.isLocked = Boolean(isLocked);
  }
  res.json({ success: true, zone });
});

// Integrate Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ALPHA MAN Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
