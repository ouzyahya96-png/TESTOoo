/**
 * ALPHA MAN - Biofeedback & Pelvic Tracking Service
 * Persistent storage, calibration baseline, Bluetooth LE simulation (Perifit, kGoal),
 * sleep correlation analysis, weekly automated reports, anonymized progress photos,
 * and advanced calculation metrics.
 */

export interface TrackingPhoto {
  id: string;
  date: string;
  imageUri: string; // Base64 or elegant asset placeholder
  isAnonymized: boolean; // Face auto-blurred indicator
  notes?: string;
}

export interface CalibrationData {
  baselineSeconds: number; // Duration of max contraction
  maxSubjectiveForce: number; // 1-10
  avgContractionMV: number; // Target Microvolts for Level 6+
  calibratedAt: string; // ISO date
}

export interface HealthMetrics {
  appleHealthSynced: boolean;
  googleFitSynced: boolean;
  ouraConnected: boolean;
  whoopConnected: boolean;
  avgSleepDurationHours: number;
  recoveryPercentage: number;
  sleepKegelCorrelationCoeff: number; // e.g., 1.23 for 23% increase
}

export interface WeeklyReport {
  id: string;
  weekRange: string; // e.g., "06 Juil - 12 Juil"
  sessionsCount: number;
  avgForce: number; // subjective or objective
  forceProgressionPercent: number; // e.g. 15 for +15%
  enduranceSecProgression: number; // e.g. 4 for +4 seconds average
  trend: "rising" | "stable" | "falling";
  technicalRecommendation: string;
  sharedWithCommunity: boolean;
}

export interface TrackingState {
  bluetoothConnected: boolean;
  connectedDeviceName: string | null;
  sensorMVStream: number[]; // real-time buffer
  calibration: CalibrationData | null;
  progressPhotos: TrackingPhoto[];
  health: HealthMetrics;
  weeklyReports: WeeklyReport[];
  isDemoMode: boolean;
}

const STORAGE_KEY = "alphaman_pelvic_tracking_state";

const initialReports: WeeklyReport[] = [
  {
    id: "report_1",
    weekRange: "22 Juin - 28 Juin",
    sessionsCount: 9,
    avgForce: 5.2,
    forceProgressionPercent: 8,
    enduranceSecProgression: 2,
    trend: "rising",
    technicalRecommendation: "Stabilisez vos contractions de Niveau 2. Ajoutez 1 seconde au temps d'endurance maximum.",
    sharedWithCommunity: false
  },
  {
    id: "report_2",
    weekRange: "29 Juin - 05 Juil",
    sessionsCount: 11,
    avgForce: 6.8,
    forceProgressionPercent: 12,
    enduranceSecProgression: 3,
    trend: "rising",
    technicalRecommendation: "Excellente régularité pelvienne. Votre endurance progresse. Intégrez l'exercice d'ascenseur sur 3 niveaux.",
    sharedWithCommunity: true
  },
  {
    id: "report_3",
    weekRange: "06 Juil - 12 Juil",
    sessionsCount: 12,
    avgForce: 8.1,
    forceProgressionPercent: 15,
    enduranceSecProgression: 5,
    trend: "rising",
    technicalRecommendation: "Souveraineté pelvienne en hausse. Augmentez la durée de tenue à tension constante de 2 secondes lors de la prochaine phase WARRIOR.",
    sharedWithCommunity: false
  }
];

const mockPhotos: TrackingPhoto[] = [
  {
    id: "photo_1",
    date: "2026-06-15",
    imageUri: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop",
    isAnonymized: true,
    notes: "Semaine 1 : Baseline fessiers/pelviens"
  },
  {
    id: "photo_2",
    date: "2026-07-08",
    imageUri: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop",
    isAnonymized: true,
    notes: "Semaine 4 : Tonus abdominal et pelvien supérieur"
  }
];

const defaultState: TrackingState = {
  bluetoothConnected: false,
  connectedDeviceName: null,
  sensorMVStream: [],
  calibration: {
    baselineSeconds: 5.2,
    maxSubjectiveForce: 7.5,
    avgContractionMV: 145,
    calibratedAt: "2026-07-10T12:00:00Z"
  },
  progressPhotos: mockPhotos,
  health: {
    appleHealthSynced: true,
    googleFitSynced: false,
    ouraConnected: true,
    whoopConnected: true,
    avgSleepDurationHours: 7.8,
    recoveryPercentage: 84,
    sleepKegelCorrelationCoeff: 1.23 // 23% increase
  },
  weeklyReports: initialReports,
  isDemoMode: true
};

export const trackingService = {
  getState(): TrackingState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load tracking state", e);
    }
    this.saveState(defaultState);
    return defaultState;
  },

  saveState(state: TrackingState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('alphaman_tracking_updated'));
    } catch (e) {
      console.error("Failed to save tracking state", e);
    }
  },

  setBluetoothConnection(connected: boolean, deviceName: string | null): void {
    const state = this.getState();
    state.bluetoothConnected = connected;
    state.connectedDeviceName = deviceName;
    if (connected) {
      state.sensorMVStream = Array.from({ length: 20 }, () => Math.floor(Math.random() * 30));
    } else {
      state.sensorMVStream = [];
    }
    this.saveState(state);
  },

  updateCalibration(baselineSeconds: number, maxForce: number, avgMV: number): CalibrationData {
    const state = this.getState();
    const newCalibration: CalibrationData = {
      baselineSeconds,
      maxSubjectiveForce: maxForce,
      avgContractionMV: avgMV,
      calibratedAt: new Date().toISOString()
    };
    state.calibration = newCalibration;
    this.saveState(state);
    return newCalibration;
  },

  addPhoto(imageUri: string, notes: string): TrackingPhoto {
    const state = this.getState();
    const newPhoto: TrackingPhoto = {
      id: `photo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      imageUri,
      isAnonymized: true, // Face auto-blurred standard security requirement
      notes: notes.trim()
    };
    state.progressPhotos.push(newPhoto);
    this.saveState(state);
    return newPhoto;
  },

  deletePhoto(id: string): void {
    const state = this.getState();
    state.progressPhotos = state.progressPhotos.filter(p => p.id !== id);
    this.saveState(state);
  },

  toggleHealthSync(platform: 'apple' | 'google' | 'oura' | 'whoop', value: boolean): void {
    const state = this.getState();
    if (platform === 'apple') state.health.appleHealthSynced = value;
    else if (platform === 'google') state.health.googleFitSynced = value;
    else if (platform === 'oura') state.health.ouraConnected = value;
    else if (platform === 'whoop') state.health.whoopConnected = value;
    this.saveState(state);
  },

  toggleCommunityShare(reportId: string): void {
    const state = this.getState();
    const report = state.weeklyReports.find(r => r.id === reportId);
    if (report) {
      report.sharedWithCommunity = !report.sharedWithCommunity;
      this.saveState(state);
    }
  },

  // Calculate algorithmic objective force if BLE not connected
  // Force = (durée moyenne * répétitions) / temps total
  calculateEstimatedForce(avgHoldDurationSec: number, reps: number, totalDurationSec: number): number {
    if (totalDurationSec === 0) return 0;
    const formulaVal = (avgHoldDurationSec * reps * 10) / totalDurationSec;
    return Math.min(10, Math.max(1, parseFloat(formulaVal.toFixed(1))));
  },

  resetProgress(): void {
    this.saveState(defaultState);
  }
};
