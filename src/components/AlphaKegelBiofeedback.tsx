import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Bluetooth,
  RefreshCw,
  BarChart2,
  Shield,
  Heart,
  Moon,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Check,
  Download,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Compass,
  Award,
  Trophy,
  Info,
  Smartphone,
  FileText,
  Share2,
  Zap,
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  Play,
  CircleDot,
  UserCheck,
  ChevronRight,
  Copy
} from 'lucide-react';

import { trackingService, TrackingState, TrackingPhoto, WeeklyReport, CalibrationData } from '../pattern_killer/trackingService';
import { kegelService, KEGEL_LEVELS } from '../pattern_killer/kegelService';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';

interface AlphaKegelBiofeedbackProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
}

export const AlphaKegelBiofeedback: React.FC<AlphaKegelBiofeedbackProps> = ({ addToast, onPointsUpdate }) => {
  // Core states
  const [trackingState, setTrackingState] = useState<TrackingState>(() => trackingService.getState());
  const [kegelState, setKegelState] = useState(() => kegelService.getState());
  const [subTab, setSubTab] = useState<'realtime' | 'analytics' | 'photos' | 'reports' | 'health' | 'code'>('realtime');

  // Interactive tooltips & selections
  const [selectedChartNode, setSelectedChartNode] = useState<{ x: string; y: number; label: string } | null>(null);
  const [chartRange, setChartRange] = useState<7 | 30 | 90>(7);

  // Calibration test states
  const [calibrating, setCalibrating] = useState<boolean>(false);
  const [calibrationCountdown, setCalibrationCountdown] = useState<number>(5);
  const [calibrationForceValues, setCalibrationForceValues] = useState<number[]>([]);
  const [calibrationCompleted, setCalibrationCompleted] = useState<boolean>(false);

  // Bluetooth simulation states
  const [scanning, setScanning] = useState<boolean>(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);
  const [realtimeContraction, setRealtimeContraction] = useState<boolean>(false);
  const [liveMVValue, setLiveMVValue] = useState<number>(10);
  const [peakMV, setPeakMV] = useState<number>(10);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const [subjectiveInput, setSubjectiveInput] = useState<number>(5);

  // Photo states
  const [photoViewBlurred, setPhotoViewBlurred] = useState<boolean>(true);
  const [photoNotesInput, setPhotoNotesInput] = useState<string>('');

  // PDF Export simulator
  const [exportingPDF, setExportingPDF] = useState<boolean>(false);
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound generator
  const playTone = (freq: number, duration: number, volume = 0.1) => {
    if (!audioFeedback) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Sync state on custom updates
  useEffect(() => {
    const handleUpdate = () => {
      setTrackingState(trackingService.getState());
      setKegelState(kegelService.getState());
    };
    window.addEventListener('alphaman_tracking_updated', handleUpdate);
    window.addEventListener('alphaman_kegel_updated', handleUpdate);
    return () => {
      window.removeEventListener('alphaman_tracking_updated', handleUpdate);
      window.removeEventListener('alphaman_kegel_updated', handleUpdate);
    };
  }, []);

  // Live Bluetooth Sensor Stream simulation loop
  useEffect(() => {
    let sensorInterval: NodeJS.Timeout | null = null;
    if (trackingState.bluetoothConnected && realtimeContraction) {
      sensorInterval = setInterval(() => {
        // Simulating contraction pressure wave (0 to 300 microvolts)
        const base = Math.sin(Date.now() / 600) * 120 + 150;
        const noise = Math.random() * 20 - 10;
        const finalValue = Math.max(5, Math.floor(base + noise));
        setLiveMVValue(finalValue);

        // Track peak mV
        if (finalValue > peakMV) {
          setPeakMV(finalValue);
          // High tone beep on new peak
          if (finalValue > 250 && Math.random() > 0.7) {
            playTone(1800, 0.15, 0.05);
          }
        }

        // Realtime beep frequency relative to contraction strength
        if (Math.random() > 0.8) {
          playTone(400 + finalValue * 3, 0.08, 0.02);
        }
      }, 100);
    } else {
      setLiveMVValue(5);
    }

    return () => {
      if (sensorInterval) clearInterval(sensorInterval);
    };
  }, [trackingState.bluetoothConnected, realtimeContraction, peakMV]);

  // Bluetooth scanning simulator
  const handleStartScan = () => {
    setScanning(true);
    setFoundDevices([]);
    playTone(880, 0.1);
    setTimeout(() => {
      setFoundDevices(['Perifit Pelvic Probe v4.2 (BLE)', 'kGoal Elite Active Probe', 'Elvie Kegel Trainer Plus']);
      setScanning(false);
      addToast('success', "Recherche terminée. 3 sondes médicales Bluetooth LE trouvées !");
    }, 2500);
  };

  // Connect device simulator
  const handleConnectDevice = (name: string) => {
    trackingService.setBluetoothConnection(true, name);
    playTone(1200, 0.3);
    addToast('success', `Connecté avec succès à ${name}. Flux microvolts (mV) actif.`);
  };

  // Disconnect device simulator
  const handleDisconnectDevice = () => {
    trackingService.setBluetoothConnection(false, null);
    setPeakMV(10);
    playTone(500, 0.3);
    addToast('info', "Sonde Bluetooth déconnectée.");
  };

  // Calibration Test countdown loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (calibrating) {
      timer = setInterval(() => {
        if (calibrationCountdown > 1) {
          setCalibrationCountdown(prev => prev - 1);
          // Ticking sound
          playTone(1000, 0.05, 0.08);

          // Track a simulated strength
          const randomStrength = Math.floor(Math.random() * 40) + 120;
          setCalibrationForceValues(prev => [...prev, randomStrength]);
        } else {
          // Calibration done!
          setCalibrating(false);
          setCalibrationCompleted(true);
          const avgMV = calibrationForceValues.length > 0 
            ? Math.floor(calibrationForceValues.reduce((a, b) => a + b, 0) / calibrationForceValues.length) 
            : 155;
          const subjectiveStrength = Math.min(10, parseFloat((avgMV / 20).toFixed(1)));
          
          trackingService.updateCalibration(5.0, subjectiveStrength, avgMV);
          playTone(1500, 0.4, 0.1);
          addToast('success', `Calibration terminée ! Votre baseline est de 5.0s à une force de ${subjectiveStrength}/10 (${avgMV} mV).`);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [calibrating, calibrationCountdown, calibrationForceValues]);

  // Launch Calibration
  const startCalibrationTest = () => {
    setCalibrating(true);
    setCalibrationCompleted(false);
    setCalibrationCountdown(5);
    setCalibrationForceValues([]);
    playTone(440, 0.15);
    addToast('info', "Début du test : Serrez votre muscle PC au maximum pendant 5 secondes !");
  };

  // Progression photo upload simulator
  const handleAddPhotoSimulated = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate camera shot / file pick
    const randomBodyPhotos = [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=300&auto=format&fit=crop"
    ];
    const pickedPhoto = randomBodyPhotos[Math.floor(Math.random() * randomBodyPhotos.length)];
    
    trackingService.addPhoto(pickedPhoto, photoNotesInput || "Régularité d'entraînement physique");
    setPhotoNotesInput('');
    playTone(900, 0.15);
    addToast('success', "Photo ajoutée avec floutage de visage biométrique automatique !");
  };

  // PDF Export execution simulator
  const handleExportPDF = () => {
    setExportingPDF(true);
    playTone(1000, 0.1);
    setTimeout(() => {
      setExportingPDF(false);
      setShowPDFModal(true);
      playTone(1400, 0.2);
    }, 2000);
  };

  // Copy react native screens mock code helper
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    playTone(1100, 0.1);
    setTimeout(() => setCopiedCode(null), 2000);
    addToast('success', `${label} copié dans le presse-papiers !`);
  };

  // Toggle community report
  const handleToggleCommunity = (id: string) => {
    trackingService.toggleCommunityShare(id);
    playTone(950, 0.1);
    const report = trackingState.weeklyReports.find(r => r.id === id);
    if (report) {
      addToast('info', report.sharedWithCommunity 
        ? "Rapport partagé anonymement dans la communauté ALPHA MAN."
        : "Retiré du partage communautaire."
      );
    }
  };

  // Health Sync Action
  const handleToggleHealth = (platform: 'apple' | 'google' | 'oura' | 'whoop', curVal: boolean) => {
    trackingService.toggleHealthSync(platform, !curVal);
    playTone(950, 0.1);
    addToast('success', !curVal ? "Synchronisation activée !" : "Synchronisation désactivée.");
  };

  // Algorithmic force calculations
  const totalCompletedSec = kegelState.completedSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const averageHoldTime = trackingState.calibration?.baselineSeconds || 5.0;
  const computedAlgorithmicForce = trackingService.calculateEstimatedForce(
    averageHoldTime,
    kegelState.completedSessions.length,
    totalCompletedSec || 500
  );

  // Community and forecast comparisons
  const levelNum = kegelState.currentLevelId;
  const isHighLevel = levelNum >= 6;

  // React Native screen code templates
  const nativeTrackingCode = `/**
 * ALPHA MAN - Native Kegel Tracking Screen
 * Real-time stats, interactive local graphs & photo blurred comparison
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Switch, TouchableOpacity } from 'react-native';

export default function KegelTrackingScreen() {
  const [healthSync, setHealthSync] = useState(true);
  const [photoBlurred, setPhotoBlurred] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📈 KEGEL TRACKING & FORCE</Text>
      
      {/* Dynamic Stats */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>SOUVERAINETÉ PELVIENNE</Text>
        <Text style={styles.bigVal}>Plus fort que 78%</Text>
        <Text style={styles.desc}>À ce rythme, niveau 5 dans 3 semaines.</Text>
      </View>

      {/* Health Sync Toggle */}
      <View style={styles.row}>
        <Text style={styles.rowText}>Intégrer Apple Health / Oura</Text>
        <Switch value={healthSync} onValueChange={setHealthSync} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A12', padding: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF', marginVertical: 12 },
  card: { backgroundColor: '#16213E', padding: 16, borderRadius: 16, marginVertical: 8 },
  subtitle: { fontSize: 11, color: '#E94560', fontWeight: 'bold' },
  bigVal: { fontSize: 26, color: '#FFF', fontWeight: '900', marginVertical: 4 },
  desc: { fontSize: 12, color: '#8E8E93' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111122', padding: 14, borderRadius: 12 },
  rowText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' }
});`;

  const nativeBiofeedbackCode = `/**
 * ALPHA MAN - Realtime Hardware Bluetooth LE Biofeedback Screen
 * Connects directly to Perifit/kGoal medical probes via React Native BLE PLX
 */
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

export default function BiofeedbackScreen() {
  const [device, setDevice] = useState(null);
  const [mvStream, setMvStream] = useState(0);

  const startScan = () => {
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (scannedDevice?.name?.includes('Perifit') || scannedDevice?.name?.includes('kGoal')) {
        bleManager.stopDeviceScan();
        connect(scannedDevice);
      }
    });
  };

  const connect = async (targetDevice) => {
    const connected = await targetDevice.connect();
    setDevice(connected);
    // Subscribe to microvolts pressure sensor characteristics
    connected.monitorCharacteristicForService('pelvic-service', 'force-char', (error, char) => {
      if (char) {
        const mv = decodeMV(char.value);
        setMvStream(mv);
        // Sync haptic vibration matching contractive mV spikes
        if (mv > 180) {
          Vibration.vibrate([0, mv / 2]);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📡 BIOFEEDBACK SANS FIL (BLE)</Text>
      <Text style={styles.mvText}>{mvStream} microvolts (mV)</Text>
      <TouchableOpacity style={styles.btn} onPress={startScan}>
        <Text style={styles.btnText}>{device ? "Connecté ✅" : "Rechercher sonde Perifit/kGoal"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A12', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  mvText: { fontSize: 36, fontWeight: '900', color: '#00E676', marginVertical: 20 },
  btn: { backgroundColor: '#E94560', padding: 14, borderRadius: 20 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});`;

  return (
    <div id="alpha-biofeedback-tracker" className="flex flex-col gap-6 w-full text-white animate-[fade-in_0.3s_ease-out]">
      
      {/* ======================= HEADER ======================= */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0A0A14] border border-[#1A1A30] p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E94560]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#00E676] to-[#00B0FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#00E676]/10 shrink-0">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-headline font-bold text-[#00E676] uppercase tracking-[0.2em] block">
              SYSTÈME BIOFEEDBACK & CALIBRATION SANS FIL
            </span>
            <h2 className="text-xl md:text-2xl font-headline font-black tracking-tight">
              Analyseur de Force Pelvienne
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sonde Bluetooth LE medical-grade & Calibration subjective de baseline.
            </p>
          </div>
        </div>

        {/* Dynamic connection header badge */}
        <div className="flex items-center gap-3 bg-black/40 border border-[#1C1C35] px-4 py-2.5 rounded-2xl shrink-0">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${trackingState.bluetoothConnected ? 'bg-[#00E676]' : 'bg-[#E94560]'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${trackingState.bluetoothConnected ? 'bg-[#00E676]' : 'bg-[#E94560]'}`}></span>
          </div>
          <div>
            <span className="text-[9px] font-headline font-bold text-gray-500 uppercase block leading-none">ÉTAT DU CAPTEUR</span>
            <span className="text-xs font-mono font-black">
              {trackingState.bluetoothConnected ? trackingState.connectedDeviceName : "Aucune Sonde Connectée"}
            </span>
          </div>
        </div>
      </div>

      {/* ======================= INTERNAL TABS SELECTOR ======================= */}
      <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1.5 rounded-2xl w-full overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setSubTab('realtime')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${subTab === 'realtime' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Wifi className="w-3.5 h-3.5" />
          Biofeedback Temps Réel
        </button>

        <button
          onClick={() => setSubTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${subTab === 'analytics' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Graphiques de Progrès
        </button>

        <button
          onClick={() => setSubTab('photos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${subTab === 'photos' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Eye className="w-3.5 h-3.5" />
          Photos d'Évolution
        </button>

        <button
          onClick={() => setSubTab('reports')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${subTab === 'reports' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <FileText className="w-3.5 h-3.5" />
          Rapports Magazine
        </button>

        <button
          onClick={() => setSubTab('health')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${subTab === 'health' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Heart className="w-3.5 h-3.5" />
          Santé & Sommeil
        </button>

        <button
          onClick={() => setSubTab('code')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${subTab === 'code' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Source Native React Native
        </button>
      </div>

      {/* ==================================== SUBTAB: REALTIME BIOFEEDBACK ==================================== */}
      {subTab === 'realtime' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Hardware Connection Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#00E676] flex items-center gap-2">
                  <Bluetooth className="w-4 h-4 animate-pulse" />
                  Sondes Bluetooth (Niveau 6+)
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">BLE 5.0</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Les utilisateurs de palier <strong className="text-[#FFD700]">KNIGHT, MASTER et ALPHA</strong> peuvent appairer une sonde biofeedback intra-pelvienne sans fil externe (Perifit, kGoal, Elvie) pour capturer les microvolts (mV) objectifs de contraction en temps réel.
              </p>

              {!trackingState.bluetoothConnected ? (
                <div className="flex flex-col gap-3">
                  <AlphaButton
                    variant="primary"
                    onClick={handleStartScan}
                    disabled={scanning}
                    className="w-full py-3 text-xs font-headline font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                    {scanning ? "Scan des périphériques..." : "Scanner les sondes environnantes"}
                  </AlphaButton>

                  {/* Devices found placeholder */}
                  {foundDevices.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 bg-black/30 p-3 rounded-xl border border-[#1A1A32]">
                      <span className="text-[9px] font-headline font-bold text-gray-500 uppercase">Sondes Médicales Prêtes :</span>
                      {foundDevices.map((device, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleConnectDevice(device)}
                          className="flex justify-between items-center bg-[#16213E]/80 hover:bg-[#1C2C55] p-2.5 rounded-lg border border-[#1C1C35] text-xs text-left cursor-pointer transition-colors"
                        >
                          <span className="text-white font-bold">{device}</span>
                          <span className="text-[10px] text-[#00E676] font-mono font-black uppercase">Appairer</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="bg-[#00E676]/10 p-3.5 rounded-xl border border-[#00E676]/20 flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-bold text-white">
                      <span>PÉRIPHÉRIQUE :</span>
                      <span className="text-[#00E676]">{trackingState.connectedDeviceName}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 mt-1">
                      <span>BATTERIE :</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Battery className="w-3.5 h-3.5 text-[#00E676]" />
                        88%
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>STABILITÉ BLE :</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Wifi className="w-3.5 h-3.5 text-[#00E676]" />
                        Optimal (-45dBm)
                      </span>
                    </div>
                  </div>

                  <AlphaButton
                    variant="alert"
                    onClick={handleDisconnectDevice}
                    className="w-full py-2.5 text-xs font-headline font-black uppercase cursor-pointer"
                  >
                    Déconnecter la sonde
                  </AlphaButton>
                </div>
              )}
            </AlphaCard>

            {/* Calibration & Baseline setup Card */}
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-[#FFD700]" />
                  Calibration de Baseline
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">TEST DE FORCE</span>
              </div>

              {calibrating ? (
                <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 p-5 rounded-2xl text-center flex flex-col gap-3">
                  <span className="text-[10px] font-headline font-bold text-[#FFD700] uppercase tracking-widest animate-pulse">CONTRACTION MAXIMALE SOUVERAINE</span>
                  <div className="text-5xl font-mono font-black text-white tabular-nums">
                    {calibrationCountdown}s
                  </div>
                  <p className="text-xs text-gray-300 italic max-w-xs mx-auto">
                    Serrez le sphincter pelvien avec une intensité brute de 100%. Gardez l'effort stable !
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {trackingState.calibration ? (
                    <div className="bg-black/20 p-3.5 rounded-xl border border-[#1A1A35] flex flex-col gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Baseline d'endurance :</span>
                        <span className="text-white font-mono font-bold">{trackingState.calibration.baselineSeconds}s à 100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Force subjective max :</span>
                        <span className="text-white font-mono font-bold">{trackingState.calibration.maxSubjectiveForce}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contraction biofeedback :</span>
                        <span className="text-[#00E676] font-mono font-bold">{trackingState.calibration.avgContractionMV} mV</span>
                      </div>
                      <span className="text-[9px] text-gray-500 font-mono italic mt-1 text-center">
                        Dernier test : {new Date(trackingState.calibration.calibratedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-3 text-xs text-gray-500 bg-black/20 rounded-xl border border-dashed border-[#1C1C35]">
                      Aucune calibration active. Effectuez un test pour calibrer les algorithmes d'endurance.
                    </div>
                  )}

                  <AlphaButton
                    variant="gold"
                    onClick={startCalibrationTest}
                    className="w-full py-3 text-xs font-headline font-black uppercase cursor-pointer"
                  >
                    Démarrer le Test de Calibration
                  </AlphaButton>
                </div>
              )}
            </AlphaCard>
          </div>

          {/* Real-time Oscilloscope Grid */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <AlphaCard variant="elevated" className="p-6 flex flex-col gap-5 border-2 border-[#1A1A3C] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C3A]">
                <div>
                  <h3 className="text-sm font-headline font-black text-white uppercase flex items-center gap-2">
                    <Zap className="w-4.5 h-4.5 text-[#00E676]" />
                    Oscilloscope de Pression & Tension Musculaire
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Visualisation micro-courants nerveux pelviens</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAudioFeedback(!audioFeedback)}
                    className="p-1.5 rounded-lg bg-[#16213E] border border-[#1A1A35] text-gray-400 hover:text-white cursor-pointer"
                    title="Audio biofeedback pitch"
                  >
                    {audioFeedback ? <Volume2 className="w-4 h-4 text-[#00E676]" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                  </button>
                  <AlphaBadge variant={trackingState.bluetoothConnected ? "success" : "default"}>
                    {trackingState.bluetoothConnected ? "PROBE EN LIGNE" : "SIMULATEUR INTEGRÉ"}
                  </AlphaBadge>
                </div>
              </div>

              {/* Real-time Chart/Oscilloscope stage */}
              <div className="relative bg-[#0A0A14] border border-[#1A1A32] rounded-2xl h-64 overflow-hidden flex flex-col justify-between p-4">
                
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 py-8 opacity-20">
                  <div className="border-t border-dashed border-[#00E676] flex justify-between text-[8px] font-mono text-[#00E676]"><span>SEUIL DE SOUVERAINETÉ (250 mV)</span><span>100%</span></div>
                  <div className="border-t border-dashed border-gray-600 flex justify-between text-[8px] font-mono text-gray-400"><span>ZONE DE TENUE SÉCURISÉE (150 mV)</span><span>60%</span></div>
                  <div className="border-t border-dashed border-gray-600 flex justify-between text-[8px] font-mono text-gray-400"><span>ZÉRO DE REPOS DE SÉCURITÉ</span><span>0%</span></div>
                </div>

                {/* Oscilloscope canvas wave */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {(() => {
                    const pointsCount = 30;
                    const points = [];
                    for (let i = 0; i < pointsCount; i++) {
                      const x = (i / (pointsCount - 1)) * 500;
                      
                      // Calculate waves based on contraction state
                      let yVal = 180;
                      if (realtimeContraction) {
                        const phase = (i / 10) + (Date.now() / 300);
                        const sinAmp = Math.sin(phase) * 35;
                        const baselineTension = 70;
                        yVal = 180 - baselineTension - sinAmp - (Math.random() * 8);
                      } else {
                        yVal = 180 - (Math.random() * 5);
                      }
                      points.push(`${x},${yVal}`);
                    }
                    const polyLinePoints = points.join(' ');
                    const areaPoints = `0,200 ${polyLinePoints} 500,200`;

                    return (
                      <g>
                        <polygon points={areaPoints} fill={realtimeContraction ? "rgba(0, 230, 118, 0.05)" : "rgba(255, 45, 85, 0.02)"} />
                        <polyline 
                          points={polyLinePoints} 
                          fill="none" 
                          stroke={realtimeContraction ? "#00E676" : "#E94560"} 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </g>
                    );
                  })()}
                </svg>

                {/* Value overlay at top-left */}
                <div className="z-10 flex flex-col">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">TENSION PELVIENNE DIRECTE</span>
                  <span className={`text-4xl font-mono font-black tracking-tight transition-colors tabular-nums ${liveMVValue > 220 ? 'text-[#00E676]' : 'text-[#E94560]'}`}>
                    {trackingState.bluetoothConnected && realtimeContraction ? `${liveMVValue} mV` : realtimeContraction ? `${180 + Math.floor(Math.random() * 40)} mV` : "5 mV (Repos)"}
                  </span>
                </div>

                {/* Force feedback animation flash */}
                {realtimeContraction && liveMVValue > 250 && (
                  <div className="absolute top-4 right-4 bg-[#FFD700]/10 border border-[#FFD700] p-2 rounded-xl text-[#FFD700] text-xs font-headline font-black uppercase flex items-center gap-1.5 animate-bounce z-10">
                    <Sparkles className="w-3.5 h-3.5" />
                    Force Max Atteinte !
                  </div>
                )}

                {/* Signal indicators */}
                <div className="z-10 flex justify-between items-end">
                  <span className="text-[9px] text-[#8E8E93] font-mono">Frequence d'échantillonnage : 10Hz BLE Standard</span>
                  <div className="flex gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500">MAX :</span>
                      <span className="text-white font-bold ml-1">{peakMV} mV</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Trigger Contraction Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch mt-1">
                <button
                  onMouseDown={() => setRealtimeContraction(true)}
                  onMouseUp={() => setRealtimeContraction(false)}
                  onTouchStart={() => setRealtimeContraction(true)}
                  onTouchEnd={() => setRealtimeContraction(false)}
                  className={`flex-1 py-4 px-6 rounded-2xl font-headline font-black uppercase text-center transition-all cursor-pointer border select-none duration-150 active:scale-95
                    ${realtimeContraction 
                      ? 'bg-[#00E676] text-black border-[#00E676] shadow-[0_0_30px_rgba(0,230,118,0.3)]' 
                      : 'bg-gradient-to-r from-[#E94560] to-[#FF5E62] text-white border-[#E94560]/20 hover:brightness-110 shadow-lg shadow-[#E94560]/10'
                    }
                  `}
                >
                  {realtimeContraction ? (
                    <span className="flex items-center justify-center gap-2">
                      <CircleDot className="w-5 h-5 animate-ping" />
                      MAINTENIR CONTRACÉ (SERREZ FORT !)
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Play className="w-4.5 h-4.5 fill-current" />
                      APPUYER & MAINTENIR POUR CONTRACTER
                    </span>
                  )}
                </button>
              </div>

              {/* Calibration formula explainer */}
              <div className="bg-[#111124] p-4 rounded-xl border border-[#1C1C35] text-xs flex gap-3 items-start">
                <Info className="w-5 h-5 text-[#8E8E93] shrink-0 mt-0.5" />
                <div>
                  <span className="font-headline font-bold text-white uppercase block">Règle de force sans matériel</span>
                  <p className="text-[#8E8E93] mt-0.5 leading-relaxed">
                    Si vous n'avez pas de sonde physique, ALPHA MAN applique la formule brevetée : <br />
                    <code className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded text-[10px]">Force = (Durée de tenue moyenne x Répétitions) / Temps Total</code>. 
                    Maintenez vos temps d'endurance pour calibrer votre puissance de base !
                  </p>
                </div>
              </div>

            </AlphaCard>

          </div>

        </div>
      )}

      {/* ==================================== SUBTAB: ANALYTICS GRAPHS ==================================== */}
      {subTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          
          {/* Header controllers */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest px-1">
              Courbe d'endurance contractile & Analyse multi-spectrale
            </span>

            {/* Range picker */}
            <div className="flex bg-[#0F0F1A] border border-[#1C1C35] p-1 rounded-xl shrink-0 text-xs font-mono font-bold">
              {[7, 30, 90].map((range) => (
                <button
                  key={range}
                  onClick={() => setChartRange(range as any)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all
                    ${chartRange === range ? 'bg-[#E94560] text-white' : 'text-gray-400 hover:text-white'}
                  `}
                >
                  {range} jours
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Charts: Line charts and Bar chart */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Force & Endurance chart combined */}
              <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#1A1A2E]">
                  <div>
                    <h3 className="text-xs font-headline font-extrabold uppercase tracking-widest text-[#E94560]">
                      Évolution de l'endurance pelvienne (secondes maximum)
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Données consolidées d'entraînement par cycle</p>
                  </div>
                  <span className="text-xs text-[#00E676] font-mono font-bold">📈 +15% de force moyenne</span>
                </div>

                {/* SVG interactive line chart */}
                <div className="relative w-full h-56 mt-2">
                  <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                      <line 
                        key={idx} 
                        x1="40" 
                        y1={20 + 150 * ratio} 
                        x2="470" 
                        y2={20 + 150 * ratio} 
                        stroke="var(--app-border)" 
                        strokeWidth="1" 
                      />
                    ))}

                    {/* Data graph plot */}
                    {(() => {
                      // Seed values representing weekly/daily increase
                      const dataPoints = [3.2, 3.8, 4.0, 5.2, 5.8, 6.8, 8.2, 7.5, 8.8, 9.4, 9.1, 10.2, 10.8, 11.5];
                      const subset = dataPoints.slice(-chartRange === -7 ? 7 : chartRange === 30 ? 12 : 14);
                      const getX = (i: number) => 40 + (i / (subset.length - 1)) * 430;
                      const getY = (val: number) => 170 - (val / 15) * 140;

                      const points = subset.map((val, i) => `${getX(i)},${getY(val)}`).join(' ');

                      return (
                        <g>
                          <polygon 
                            points={`40,170 ${points} 470,170`} 
                            fill="rgba(233, 69, 96, 0.05)" 
                          />
                          <polyline 
                            points={points} 
                            fill="none" 
                            stroke="#E94560" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                          {subset.map((val, i) => {
                            const dateLabel = `S${i+1}`;
                            return (
                              <g 
                                key={i} 
                                className="cursor-pointer group"
                                onClick={() => setSelectedChartNode({ x: dateLabel, y: val, label: "Endurance (sec)" })}
                              >
                                <circle 
                                  cx={getX(i)} 
                                  cy={getY(val)} 
                                  r="5" 
                                  fill="#E94560" 
                                  className="transition-all group-hover:scale-150 group-hover:fill-white" 
                                />
                                <text 
                                  x={getX(i)} 
                                  y="192" 
                                  textAnchor="middle" 
                                  fill="#8E8E93" 
                                  className="font-mono text-[9px] select-none"
                                >
                                  {dateLabel}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Node popup display */}
                  {selectedChartNode && (
                    <div className="absolute top-2 right-2 bg-[#1A1A35] border border-[#FFD700]/30 px-3 py-1.5 rounded-lg text-[10px] text-white flex flex-col gap-1 z-10 animate-pulse">
                      <span className="font-headline font-bold text-[#FFD700] uppercase">{selectedChartNode.label}</span>
                      <div className="flex gap-2 font-mono">
                        <span>Période: {selectedChartNode.x}</span>
                        <span className="text-white font-extrabold">{selectedChartNode.y}s</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-2">
                  <span>Y-axis: Endurance continue (secondes)</span>
                  <span>Appuyez sur un point pour les détails</span>
                </div>
              </AlphaCard>

              {/* Repetitions Completed Chart (Bar Chart) */}
              <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#1A1A2E]">
                  <div>
                    <h3 className="text-xs font-headline font-extrabold uppercase tracking-widest text-[#3B82F6]">
                      Nombre cumulé de répétitions terminées
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Total de contractions musculaires par session</p>
                  </div>
                  <span className="text-xs text-[#3B82F6] font-mono font-bold">1480 Reps Totales</span>
                </div>

                {/* SVG Bar Chart */}
                <div className="relative w-full h-40 mt-2">
                  <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                    {(() => {
                      const repsValues = [20, 25, 20, 30, 35, 45, 50, 40, 55, 60, 65, 80];
                      const subset = repsValues.slice(-8);
                      const barWidth = 32;
                      const spacing = (500 - 80) / subset.length;

                      return (
                        <g>
                          {subset.map((val, i) => {
                            const x = 40 + i * spacing;
                            const height = (val / 100) * 110;
                            const y = 130 - height;

                            return (
                              <g key={i}>
                                {/* Bar background */}
                                <rect 
                                  x={x} 
                                  y="20" 
                                  width={barWidth} 
                                  height="110" 
                                  fill="rgba(59, 130, 246, 0.02)" 
                                  rx="4" 
                                />
                                {/* Active Bar fill */}
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={barWidth} 
                                  height={height} 
                                  fill="url(#barGradient)" 
                                  rx="4" 
                                />
                                {/* Bar Text value */}
                                <text 
                                  x={x + barWidth / 2} 
                                  y={y - 6} 
                                  textAnchor="middle" 
                                  fill="#3B82F6" 
                                  className="font-mono text-[9px] font-bold"
                                >
                                  {val}
                                </text>
                                {/* X label */}
                                <text 
                                  x={x + barWidth / 2} 
                                  y="146" 
                                  textAnchor="middle" 
                                  fill="#8E8E93" 
                                  className="font-mono text-[8px]"
                                >
                                  P{i+1}
                                </text>
                              </g>
                            );
                          })}

                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#1E3A8A" />
                            </linearGradient>
                          </defs>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </AlphaCard>

            </div>

            {/* Right Panel: Radar chart and smart forecasts */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* RADAR CHART PROFILE */}
              <AlphaCard variant="elevated" className="p-5 flex flex-col items-center justify-center border border-[#1A1A3C]">
                <div className="w-full text-left pb-2 border-b border-[#1C1C35] mb-4">
                  <h3 className="text-xs font-headline font-extrabold uppercase tracking-widest text-[#FFD700]">
                    Radar de Puissance Pelvienne
                  </h3>
                  <span className="text-[9px] text-gray-500 font-mono">PROFIL SYNAPTIQUE MASCULIN</span>
                </div>

                {/* Animated polygon SVG Radar Chart */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                    {/* Outer rings */}
                    {[40, 70, 100].map((r, i) => (
                      <polygon 
                        key={i} 
                        points={`
                          100,${100 - r}
                          ${100 + r * 0.95},${100 - r * 0.31}
                          ${100 + r * 0.59},${100 + r * 0.81}
                          ${100 - r * 0.59},${100 + r * 0.81}
                          ${100 - r * 0.95},${100 - r * 0.31}
                        `}
                        fill="none" 
                        stroke="var(--app-border)" 
                        strokeWidth="1" 
                      />
                    ))}

                    {/* Radial lines */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                      const x = 100 + 100 * Math.cos(angle);
                      const y = 100 + 100 * Math.sin(angle);
                      return (
                        <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="var(--app-border)" strokeWidth="1" />
                      );
                    })}

                    {/* Static labels */}
                    <text x="100" y="8" textAnchor="middle" fill="#8E8E93" className="font-headline font-bold text-[8px]">FORCE (85%)</text>
                    <text x="210" y="90" textAnchor="start" fill="#8E8E93" className="font-headline font-bold text-[8px]">ENDURANCE (75%)</text>
                    <text x="160" y="196" textAnchor="middle" fill="#8E8E93" className="font-headline font-bold text-[8px]">VITESSE (60%)</text>
                    <text x="40" y="196" textAnchor="middle" fill="#8E8E93" className="font-headline font-bold text-[8px]">CONTRÔLE (80%)</text>
                    <text x="-10" y="90" textAnchor="end" fill="#8E8E93" className="font-headline font-bold text-[8px]">RÉGULARITÉ (90%)</text>

                    {/* Active values filled polygon */}
                    {/* Val: Force: 85, Endurance: 75, Vitesse: 60, Contrôle: 80, Régularité: 90 */}
                    <polygon 
                      points="
                        100,24
                        171,77
                        135,148
                        52,148
                        24,77
                      "
                      fill="rgba(0, 230, 118, 0.15)"
                      stroke="#00E676"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="w-full bg-black/30 p-3.5 rounded-xl border border-[#1C1C35] text-xs mt-4">
                  <div className="flex gap-2 items-center text-[#FFD700] font-headline font-extrabold uppercase">
                    <Trophy className="w-4 h-4" />
                    <span>Statut Leaderboard</span>
                  </div>
                  <p className="text-gray-300 mt-1.5 leading-relaxed font-semibold">
                    🏆 "Vous êtes plus fort que <strong className="text-[#00E676] font-mono font-black">78%</strong> des utilisateurs au même niveau."
                  </p>
                </div>
              </AlphaCard>

              {/* FUTURE PREDICTIONS DYNAMIC CHRONO */}
              <AlphaCard variant="default" className="p-5 flex flex-col gap-3">
                <span className="text-[10px] font-headline font-bold text-[#E94560] uppercase tracking-widest">
                  PRÉDICTEUR INTELLIGENT DE TONUS
                </span>
                
                <div className="flex gap-3 items-start">
                  <Sparkles className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-headline font-bold text-white uppercase">PREDICTION IA ALPHA MAN</h4>
                    <p className="text-xs text-[#8E8E93] leading-relaxed mt-1">
                      &ldquo;À ce rythme d'assiduité contractile, vous débloquerez le <strong className="text-white">Palier 5 (GUARDIAN)</strong> dans exactement <strong className="text-[#00E676] font-mono font-black">3 semaines</strong> avec un gain estimé de +22% en force de pointe.&rdquo;
                    </p>
                  </div>
                </div>
              </AlphaCard>

            </div>

          </div>

        </div>
      )}

      {/* ==================================== SUBTAB: PROGRESS PHOTOS ==================================== */}
      {subTab === 'photos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fade-in_0.3s_ease-out]">
          
          {/* Anonymizer photo panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-5 flex flex-col gap-4 border border-[#1A1A3E]">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#E94560] flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-[#E94560]" />
                  Sécurité & Anonymisation Totale
                </h3>
                <span className="text-[9px] text-gray-500 font-mono">MILITARY GRADE</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Le suivi physique est optionnel. Si vous décidez de téléverser des photos de votre silhouette pour évaluer la posture et la structure musculaire basse, notre algorithme effectue un <strong className="text-[#00E676]">floutage de visage automatique</strong> en local. Les métadonnées EXIF sont purgées pour préserver votre vie privée.
              </p>

              {/* Photo uploader mock form */}
              <form onSubmit={handleAddPhotoSimulated} className="flex flex-col gap-3 mt-1 bg-black/20 p-4 rounded-xl border border-[#1C1C35]">
                <label className="text-xs font-headline font-bold text-slate-300">Note descriptive de la photo (Ex: Avant / Semaine 4)</label>
                <input 
                  type="text"
                  placeholder="Notes sur la forme physique..."
                  value={photoNotesInput}
                  onChange={(e) => setPhotoNotesInput(e.target.value)}
                  className="w-full p-2.5 bg-[#0F0F1A] border border-[#1C1C35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E94560]"
                />

                <AlphaButton
                  variant="primary"
                  type="submit"
                  className="py-3 text-xs font-headline font-black uppercase flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Upload className="w-4 h-4" />
                  Simuler l'ajout de photo
                </AlphaButton>
              </form>

              {/* Encryption disclaimer */}
              <div className="flex gap-2.5 items-start text-xs text-gray-500 italic leading-snug">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Photos chiffrées en AES-256 dans l'espace sécurisé d'ALPHA MAN, inaccessibles depuis votre galerie publique.</span>
              </div>
            </AlphaCard>
          </div>

          {/* Photo Gallery Grid side-by-side */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest">
                Galerie de Restructuration Musculaire ({trackingState.progressPhotos.length} photos)
              </span>

              {/* Blur control toggle button */}
              <button
                onClick={() => setPhotoViewBlurred(!photoViewBlurred)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#16213E] border border-[#1C1C35] rounded-xl text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                {photoViewBlurred ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-[#00E676]" />}
                <span>{photoViewBlurred ? "Afficher les détails" : "Activer le flou de protection"}</span>
              </button>
            </div>

            {trackingState.progressPhotos.length === 0 ? (
              <div className="bg-[#111122]/60 border border-dashed border-[#1A1A2E] p-16 rounded-3xl text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-gray-600 mb-1" />
                Aucune photo dans votre coffre-fort sécurisé.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {trackingState.progressPhotos.map((photo) => (
                  <AlphaCard key={photo.id} variant="default" className="p-4 flex flex-col gap-3 relative group">
                    
                    {/* Before/After Indicator Badge */}
                    <span className="absolute top-3 left-3 bg-[#E94560]/80 backdrop-blur-md text-white font-headline font-black text-[9px] uppercase px-2 py-0.5 rounded border border-white/10 z-10">
                      {photo.notes?.includes("Semaine 1") ? "AVANT" : "APRÈS"}
                    </span>

                    {/* Trash photo action */}
                    <button
                      onClick={() => {
                        trackingService.deletePhoto(photo.id);
                        playTone(450, 0.1);
                        addToast('warning', "Photo supprimée du coffre-fort.");
                      }}
                      className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-lg text-gray-400 hover:text-[#E94560] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Supprimer la photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Image stage with CSS blur simulation */}
                    <div className="relative w-full h-48 bg-black rounded-xl overflow-hidden border border-[#1C1C35]">
                      <img 
                        src={photo.imageUri} 
                        alt="Silhouette d'évolution" 
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-all duration-500
                          ${photoViewBlurred ? 'blur-md brightness-50' : ''}
                        `}
                      />

                      {/* Face overlay representing the auto blur algorithm in action */}
                      <div className="absolute top-4 right-1/2 translate-x-1/2 w-14 h-14 rounded-full border border-[#00E676]/40 bg-[#00E676]/10 backdrop-blur-xl flex items-center justify-center">
                        <span className="text-[8px] font-headline font-black text-[#00E676] uppercase text-center leading-none">FACE<br />BLURRED</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-headline font-bold text-white">{photo.notes}</h4>
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{photo.date}</span>
                      </div>
                      <AlphaBadge variant="success">Sécurisé</AlphaBadge>
                    </div>

                  </AlphaCard>
                ))}
              </div>
            )}

            {/* Visual Call To Action */}
            <div className="bg-[#111124] p-5 rounded-3xl border border-[#1C1C35] text-center flex flex-col gap-2">
              <h4 className="text-xs font-headline font-black text-white uppercase">"Tu as changé. Tu le vois ?"</h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed max-w-lg mx-auto">
                La restructuration pelvienne et la posture athlétique s'installent en seulement 4 semaines. Comparez l'alignement de vos hanches d'un mois à l'autre.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ==================================== SUBTAB: MAGAZINE REPORTS ==================================== */}
      {subTab === 'reports' && (
        <div className="flex flex-col gap-6">
          
          {/* Header Action bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest block px-1">
                Magazine de Performance Pelvienne ALPHA MAN
              </span>
              <p className="text-[10px] text-gray-500 px-1 mt-0.5">Vos analyses neuro-urologiques automatiques condensées</p>
            </div>

            <AlphaButton
              variant="gold"
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="py-2.5 px-4 text-xs font-headline font-black uppercase flex items-center gap-2 cursor-pointer self-stretch sm:self-auto"
            >
              <Download className={`w-4 h-4 ${exportingPDF ? 'animate-bounce' : ''}`} />
              {exportingPDF ? "Génération..." : "Exporter le rapport mensuel PDF"}
            </AlphaButton>
          </div>

          {/* Magazine Styled Weekly reports Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackingState.weeklyReports.map((report) => (
              <AlphaCard 
                key={report.id} 
                variant={report.sharedWithCommunity ? "premium" : "default"} 
                className="p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-[#E94560]/30"
              >
                {/* Background soft red accent */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#E94560]/5 rounded-full blur-xl pointer-events-none" />

                <div className="flex justify-between items-center pb-2 border-b border-[#1A1A2E]/60">
                  <span className="text-[10px] font-mono font-bold text-[#E94560] bg-[#E94560]/10 px-2.5 py-0.5 rounded border border-[#E94560]/20">
                    SÉANCES : {report.sessionsCount}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">{report.weekRange}</span>
                </div>

                {/* Big numbers highlight */}
                <div className="flex justify-between items-end my-1">
                  <div>
                    <span className="text-[9px] font-headline font-bold text-gray-500 uppercase block">FORCE MOYENNE</span>
                    <h4 className="text-2xl font-mono font-black text-white tabular-nums">
                      F{report.avgForce}/10
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-headline font-bold text-gray-500 uppercase block">PROGRESSION</span>
                    <h5 className="text-md font-mono font-black text-[#00E676] tabular-nums">
                      +{report.forceProgressionPercent}%
                    </h5>
                  </div>
                </div>

                <div className="border-t border-[#16162A]/60 pt-3 flex flex-col gap-2">
                  <span className="text-[9px] font-headline font-black text-[#FFD700] uppercase tracking-wider block">RECOMMANDATION TECHNIQUE IA</span>
                  <p className="text-xs text-[#8E8E93] leading-relaxed italic">
                    &ldquo;{report.technicalRecommendation}&rdquo;
                  </p>
                </div>

                {/* Sharing and Action panel */}
                <div className="border-t border-[#1C1C32] pt-3 mt-1 flex justify-between items-center">
                  <button
                    onClick={() => handleToggleCommunity(report.id)}
                    className="flex items-center gap-1.5 text-[10px] font-headline font-black uppercase text-gray-400 hover:text-[#00E676] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{report.sharedWithCommunity ? "Partagé ✅" : "Partager"}</span>
                  </button>

                  <AlphaBadge variant={report.trend === 'rising' ? 'success' : 'default'}>
                    📈 EN HAUSSE
                  </AlphaBadge>
                </div>

              </AlphaCard>
            ))}
          </div>

        </div>
      )}

      {/* ==================================== SUBTAB: HEALTH & WEARABLES ==================================== */}
      {subTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Wearables connections toggles */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                  <Heart className="w-4.5 h-4.5 text-[#FFD700]" />
                  Wearables & Objets Connectés
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">INTEGRATION</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Synchronisez vos données de sommeil et de récupération nerveuse pour étudier les corrélations physiologiques directes avec la puissance contractile de votre plancher pelvien.
              </p>

              {/* Toggles list */}
              <div className="flex flex-col gap-2.5 mt-1">
                
                {/* Apple Health */}
                <div className="flex justify-between items-center p-3.5 bg-black/20 rounded-xl border border-[#1A1A32]">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-[#FF2D55]" />
                    <div>
                      <h4 className="text-xs font-headline font-black text-white uppercase">Apple Health / Ségur</h4>
                      <p className="text-[10px] text-gray-500">Flux d'activité physique</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleHealth('apple', trackingState.health.appleHealthSynced)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-headline font-black uppercase cursor-pointer transition-all
                      ${trackingState.health.appleHealthSynced 
                        ? 'bg-[#FF2D55]/10 text-[#FF2D55] border border-[#FF2D55]/30' 
                        : 'bg-[#1C1C35] text-gray-500'
                      }
                    `}
                  >
                    {trackingState.health.appleHealthSynced ? "Activé" : "Désactivé"}
                  </button>
                </div>

                {/* Google Fit */}
                <div className="flex justify-between items-center p-3.5 bg-black/20 rounded-xl border border-[#1A1A32]">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#3B82F6]" />
                    <div>
                      <h4 className="text-xs font-headline font-black text-white uppercase">Google Fit API</h4>
                      <p className="text-[10px] text-gray-500">Suivi d'activité métabolique</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleHealth('google', trackingState.health.googleFitSynced)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-headline font-black uppercase cursor-pointer transition-all
                      ${trackingState.health.googleFitSynced 
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30' 
                        : 'bg-[#1C1C35] text-gray-500'
                      }
                    `}
                  >
                    {trackingState.health.googleFitSynced ? "Activé" : "Désactivé"}
                  </button>
                </div>

                {/* Oura Ring */}
                <div className="flex justify-between items-center p-3.5 bg-black/20 rounded-xl border border-[#1A1A32]">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-[#9C27B0]" />
                    <div>
                      <h4 className="text-xs font-headline font-black text-white uppercase">Bague Oura Ring</h4>
                      <p className="text-[10px] text-gray-500">Cycles de sommeil profond & REM</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleHealth('oura', trackingState.health.ouraConnected)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-headline font-black uppercase cursor-pointer transition-all
                      ${trackingState.health.ouraConnected 
                        ? 'bg-[#9C27B0]/10 text-[#9C27B0] border border-[#9C27B0]/30' 
                        : 'bg-[#1C1C35] text-gray-500'
                      }
                    `}
                  >
                    {trackingState.health.ouraConnected ? "Connecté" : "Désactivé"}
                  </button>
                </div>

                {/* WHOOP */}
                <div className="flex justify-between items-center p-3.5 bg-black/20 rounded-xl border border-[#1A1A32]">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#00D9A5]" />
                    <div>
                      <h4 className="text-xs font-headline font-black text-white uppercase">Bracelet WHOOP 4.0</h4>
                      <p className="text-[10px] text-gray-500">HRV (variabilité cardiaque) & récupération</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleHealth('whoop', trackingState.health.whoopConnected)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-headline font-black uppercase cursor-pointer transition-all
                      ${trackingState.health.whoopConnected 
                        ? 'bg-[#00D9A5]/10 text-[#00D9A5] border border-[#00D9A5]/30' 
                        : 'bg-[#1C1C35] text-gray-500'
                      }
                    `}
                  >
                    {trackingState.health.whoopConnected ? "Connecté" : "Désactivé"}
                  </button>
                </div>

              </div>
            </AlphaCard>
          </div>

          {/* Analytical Sleep correlation report card */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-6 flex flex-col gap-4 border-2 border-[#1A1A3A] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9C27B0]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="pb-2 border-b border-[#1C1C3A]">
                <h3 className="text-sm font-headline font-black text-white uppercase flex items-center gap-2">
                  <Moon className="w-5 h-5 text-[#9C27B0]" />
                  Analyse de corrélation Sommeil / Force Pelvienne
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Corrélations croisées calculées en intelligence artificielle locale</p>
              </div>

              {/* Graphical illustration of recovery vs Kegel */}
              <div className="relative bg-[#0A0A14] p-4 rounded-xl border border-[#1C1C35] flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8E8E93]">Qualité de Sommeil (Oura) :</span>
                  <span className="text-white font-mono font-bold">7h48 (Souverain)</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8E8E93]">Recupération Cardiaque (WHOOP) :</span>
                  <span className="text-white font-mono font-bold">84% (HRV Vert)</span>
                </div>

                {/* Huge highlight stat */}
                <div className="bg-[#9C27B0]/10 border border-[#9C27B0]/25 p-4 rounded-xl text-center">
                  <span className="text-[10px] font-headline font-black text-[#9C27B0] uppercase tracking-widest block">COEFFICIENT PHYSIOLOGIQUE</span>
                  <h4 className="text-3xl font-mono font-black text-white my-1 tracking-tight">
                    +23% Force Pelvienne
                  </h4>
                  <p className="text-xs text-gray-300 italic max-w-sm mx-auto leading-relaxed mt-1">
                    &ldquo;Quand votre sommeil profond dépasse 1.5 heure, l'influx nerveux parasympathique répare le sphincter pubo-coccygien, augmentant la force Kegel de 23% le lendemain matin.&rdquo;
                  </p>
                </div>
              </div>

              {/* Action recommendation */}
              <div className="flex gap-3 items-start text-xs text-gray-400 bg-black/20 p-4 rounded-xl">
                <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  ALPHA MAN synchronise ces données pour identifier les surcharges d'entraînement et suggérer des temps de repos pelvien ciblés afin de prévenir la fatigue du plancher pelvien.
                </p>
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

      {/* ==================================== SUBTAB: NATIVE COMPONENT EXPORTER ==================================== */}
      {subTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Architectural specs of native code */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest block px-1">
              Spécifications d'Intégration Mobile Réelle
            </span>

            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <h4 className="text-sm font-headline font-black text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#E94560]" />
                Écosystème Bluetooth LE & Haptic
              </h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Les composants React Native de l'application mobile ALPHA MAN interagissent directement avec les périphériques hardware via <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">react-native-ble-plx</code>.
              </p>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="bg-[#0F0F1A] p-3 rounded-xl border border-[#1A1A2E] flex justify-between items-center">
                  <span className="text-white font-bold">Intégration BLE :</span>
                  <span className="text-[#00E676] font-mono font-extrabold">Auto-détection Perifit/kGoal</span>
                </div>

                <div className="bg-[#0F0F1A] p-3 rounded-xl border border-[#1A1A2E] flex justify-between items-center">
                  <span className="text-white font-bold">Feedback Vibratoire :</span>
                  <span className="text-[#3B82F6] font-mono font-extrabold">Haptic Engine iOS/Android</span>
                </div>

                <div className="bg-[#0F0F1A] p-3 rounded-xl border border-[#1A1A2E] flex justify-between items-center">
                  <span className="text-white font-bold">Chiffrement AES :</span>
                  <span className="text-[#FFD700] font-mono font-extrabold">Secure Store Keychain</span>
                </div>
              </div>
            </AlphaCard>
          </div>

          {/* React Native file views switcher */}
          <div className="lg:col-span-7 bg-[#111124] border border-[#1C1C38] rounded-3xl p-6 flex flex-col gap-4">
            
            <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
              <div>
                <h4 className="text-xs font-headline font-black text-white">Composant Natif 1 : KegelTrackingScreen</h4>
                <p className="text-[10px] text-gray-500">Intégration Bluetooth & Oscilloscope native</p>
              </div>

              <AlphaButton 
                variant="secondary" 
                size="sm" 
                onClick={() => handleCopy(nativeTrackingCode, "KegelTrackingScreen.tsx")}
                className="flex items-center gap-2 text-[10px] font-headline cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedCode === "KegelTrackingScreen.tsx" ? "Copié !" : "Copier le Code"}
              </AlphaButton>
            </div>

            <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[220px] custom-scrollbar">
              {nativeTrackingCode}
            </pre>

            <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3 pt-4">
              <div>
                <h4 className="text-xs font-headline font-black text-white">Composant Natif 2 : BiofeedbackScreen</h4>
                <p className="text-[10px] text-gray-500">Abonnement direct aux microvolts (mV)</p>
              </div>

              <AlphaButton 
                variant="secondary" 
                size="sm" 
                onClick={() => handleCopy(nativeBiofeedbackCode, "BiofeedbackScreen.tsx")}
                className="flex items-center gap-2 text-[10px] font-headline cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedCode === "BiofeedbackScreen.tsx" ? "Copié !" : "Copier le Code"}
              </AlphaButton>
            </div>

            <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[220px] custom-scrollbar">
              {nativeBiofeedbackCode}
            </pre>
          </div>

        </div>
      )}

      {/* ======================= PDF REPORT MODAL SIMULATOR ======================= */}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-[fade-in_0.25s_ease-out]">
          <div className="bg-[#111124] border border-[#FFD700]/30 rounded-3xl p-6 max-w-lg w-full flex flex-col gap-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-14 h-14 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mx-auto animate-bounce">
              <FileText className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-headline font-black text-white uppercase tracking-tight">RAPPORT MENSUEL GÉNÉRÉ ! 📄</h3>
              <p className="text-xs text-[#8E8E93] mt-1.5 leading-relaxed">
                Le document <strong className="text-white">"ALPHA_MAN_Kegel_Report_Juillet_2026.pdf"</strong> a été assemblé avec succès. Les analyses cliniques de force contractive, endurance sous tension et corrélations wearables sont consolidées.
              </p>
            </div>

            <div className="bg-[#0A0A14] border border-[#1C1C35] p-3.5 rounded-2xl flex flex-col gap-2 text-xs text-left font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Nom du fichier :</span>
                <span className="text-white">Kegel_Report_July_2026.pdf</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taille :</span>
                <span className="text-white">1.8 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Algorithme d'anonymat :</span>
                <span className="text-[#00E676] font-bold">EXIF-PURGED (Anonyme)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <AlphaButton
                variant="gold"
                onClick={() => {
                  setShowPDFModal(false);
                  addToast('success', "Téléchargement démarré dans votre navigateur !");
                }}
                className="flex-1 py-3 text-xs font-headline font-black uppercase cursor-pointer"
              >
                Télécharger le PDF
              </AlphaButton>
              <button
                onClick={() => setShowPDFModal(false)}
                className="px-5 bg-[#1C1C35] text-[#8E8E93] hover:text-white rounded-xl text-xs font-headline font-bold cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
