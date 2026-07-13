/**
 * ALPHA MAN - Pattern Killer Engine Service
 * Proactive Prediction & Neural Feedback Loop
 */

export interface PatternFactors {
  timeOfDay: number; // 0-24
  dayOfWeek: number; // 1-7 (1=Mon, 7=Sun)
  sleepQuality: number; // 1-10
  stressLevel: number; // 1-10
  mood: number; // 1-10
  streakDays: number;
  socialMediaMinutes: number;
  locationRisk: number; // 0-1
}

export interface PredictionResult {
  userId: string;
  riskScore: number; // 0-100
  riskCategory: 'GREEN' | 'ORANGE' | 'RED';
  weights: Record<string, number>;
}

// In-Memory Local Weights as baseline to simulate ML feedback on client when server isn't available
let LOCAL_WEIGHTS: Record<string, number> = {
  timeOfDay: 0.25,
  dayOfWeek: 0.15,
  sleepQuality: 0.15,
  stressLevel: 0.20,
  mood: 0.10,
  streak: 0.05,
  socialMedia: 0.05,
  location: 0.05,
};

/**
 * Calcul local heuristique de secours du Score de Risque (Fidèle à l'algorithme python)
 */
export function calculateLocalRiskScore(factors: PatternFactors): PredictionResult {
  const time = factors.timeOfDay;
  const day = factors.dayOfWeek;
  const sleep = factors.sleepQuality;
  const stress = factors.stressLevel;
  const mood = factors.mood;
  const streak = factors.streakDays;
  const social = factors.socialMediaMinutes;
  const loc = factors.locationRisk;

  // Transform each factor to normalized risk (0 to 1)
  // 1. Time of day: Risk higher late evening/night (20h - 4h)
  const timeRisk = (time >= 20 || time <= 4) ? 0.95 : (time >= 12 && time <= 14) ? 0.5 : 0.2;
  
  // 2. Day of week: Weekend is higher risk
  const dayRisk = (day === 6 || day === 7) ? 0.85 : 0.35;
  
  // 3. Sleep quality: Lower quality -> Higher risk
  const sleepRisk = (10 - sleep) / 10;
  
  // 4. Stress: Higher -> Higher risk
  const stressRisk = stress / 10;
  
  // 5. Mood: Lower -> Higher risk
  const moodRisk = (10 - mood) / 10;
  
  // 6. Streak risk: Day 7, 14, 30 are critical hormonal/sevrage triggers
  let streakRisk = 0.3;
  if ([7, 8, 14, 15, 30].includes(streak)) {
    streakRisk = 0.9;
  } else if (streak < 3) {
    streakRisk = 0.8; // Early critical relapse phase
  } else {
    streakRisk = Math.max(0.1, 0.6 - (streak * 0.01));
  }

  // 7. Social media screen time: >60 mins is risky
  const socialRisk = Math.min(1.0, social / 120);

  // 8. Location: User declared risk of current spot
  const locRisk = loc;

  // Sum factors weighted
  const weightedSum = (
    timeRisk * (LOCAL_WEIGHTS.timeOfDay || 0.25) +
    dayRisk * (LOCAL_WEIGHTS.dayOfWeek || 0.15) +
    sleepRisk * (LOCAL_WEIGHTS.sleepQuality || 0.15) +
    stressRisk * (LOCAL_WEIGHTS.stressLevel || 0.20) +
    moodRisk * (LOCAL_WEIGHTS.mood || 0.10) +
    streakRisk * (LOCAL_WEIGHTS.streak || 0.05) +
    socialRisk * (LOCAL_WEIGHTS.socialMedia || 0.05) +
    locRisk * (LOCAL_WEIGHTS.location || 0.05)
  );

  // Sigmoid activation mapping: maps (-2.5 to 2.5) approximately to (0 to 1)
  const x = (weightedSum - 0.5) * 6;
  const sigmoidValue = 1 / (1 + Math.exp(-x));
  const riskScore = Math.round(sigmoidValue * 100);

  let riskCategory: 'GREEN' | 'ORANGE' | 'RED' = 'GREEN';
  if (riskScore > 60) riskCategory = 'RED';
  else if (riskScore > 30) riskCategory = 'ORANGE';

  return {
    userId: 'ALPHA_SOLDIER_1',
    riskScore,
    riskCategory,
    weights: { ...LOCAL_WEIGHTS },
  };
}

/**
 * Ajuste les poids locaux d'apprentissage en fonction du succès (résistance) ou échec (relapse)
 */
export function trainLocalFeedback(factors: PatternFactors, resisted: boolean): Record<string, number> {
  const learningRate = 0.05;
  
  const factorsNorm = {
    timeOfDay: (factors.timeOfDay >= 20 || factors.timeOfDay <= 4) ? 0.9 : 0.3,
    dayOfWeek: [6, 7].includes(factors.dayOfWeek) ? 0.8 : 0.3,
    sleepQuality: (10 - factors.sleepQuality) / 10,
    stressLevel: factors.stressLevel / 10,
    mood: (10 - factors.mood) / 10,
    streak: [7, 14, 30].includes(factors.streakDays) ? 0.9 : 0.4,
    socialMedia: Math.min(1.0, factors.socialMediaMinutes / 120),
    location: factors.locationRisk,
  };

  let totalChange = 0;
  const keys = Object.keys(LOCAL_WEIGHTS);
  
  keys.forEach((key) => {
    const val = factorsNorm[key as keyof typeof factorsNorm] || 0.5;
    const currentWeight = LOCAL_WEIGHTS[key] || 0.1;
    let change = 0;
    
    if (!resisted) {
      // Relapsed -> reinforcement of active trigger weight
      change = learningRate * val * (1.0 - currentWeight);
    } else {
      // Resisted -> decrement of active trigger weight (weakening the neurological pattern!)
      change = -learningRate * val * currentWeight;
    }
    
    LOCAL_WEIGHTS[key] = Math.max(0.01, Math.min(0.95, currentWeight + change));
    totalChange += Math.abs(change);
  });

  // Renormalize weights to sum up to 1.0
  const sum = Object.values(LOCAL_WEIGHTS).reduce((acc, v) => acc + v, 0);
  keys.forEach((key) => {
    LOCAL_WEIGHTS[key] = Math.round((LOCAL_WEIGHTS[key] / sum) * 1000) / 1000;
  });

  return { ...LOCAL_WEIGHTS };
}

export class PatternService {
  /**
   * Envoie les facteurs au backend de prédiction ou utilise le fallback local hautement précis
   */
  static async predict(factors: PatternFactors): Promise<PredictionResult> {
    try {
      const response = await fetch('/api/pattern/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factors),
      });
      if (!response.ok) {
        throw new Error('Server returned error status');
      }
      return await response.json();
    } catch (e) {
      // Fallback local en cas de serveur non disponible
      return calculateLocalRiskScore(factors);
    }
  }

  /**
   * Envoie le feedback d'entraînement
   */
  static async sendFeedback(factors: PatternFactors, resisted: boolean): Promise<Record<string, number>> {
    try {
      const response = await fetch('/api/pattern/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factors, resisted }),
      });
      if (!response.ok) {
        throw new Error('Server returned error status');
      }
      const data = await response.json();
      // Sync local weights with server response weights
      if (data.newWeights) {
        LOCAL_WEIGHTS = { ...data.newWeights };
      }
      return LOCAL_WEIGHTS;
    } catch (e) {
      // Fallback local
      return trainLocalFeedback(factors, resisted);
    }
  }

  /**
   * Déclenche une notification push simulée sur le client
   */
  static simulatePushNotification(score: number, triggerName: string): { title: string; body: string; date: Date } {
    return {
      title: '🚨 PATTERN DETECTED',
      body: `Alerte: Pattern '${triggerName.toUpperCase()}' identifié à ${score}%. Amorcez le protocole d'urgence immédiatement !`,
      date: new Date(),
    };
  }
}
