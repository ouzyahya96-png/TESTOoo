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
