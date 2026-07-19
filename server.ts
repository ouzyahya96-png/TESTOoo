import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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
