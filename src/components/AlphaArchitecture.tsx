import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  GitBranch,
  Terminal,
  Shield,
  Lock,
  Activity,
  FileText,
  ChevronRight,
  ChevronDown,
  Check,
  Copy,
  Network,
  Layers,
  RefreshCw,
  Send,
  HelpCircle,
  HardDrive,
  Share2,
  AlertTriangle,
  Code,
  Sparkles,
  Layers as LayersIcon
} from 'lucide-react';

import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';
import { AlphaPrismaExplorer } from './AlphaPrismaExplorer';

interface AlphaArchitectureProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export function AlphaArchitecture({ addToast, onBack }: AlphaArchitectureProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'c4' | 'erd' | 'api' | 'folders' | 'devops'>('c4');
  const [c4Level, setC4Level] = useState<'context' | 'container' | 'component'>('context');
  
  // Folders state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true,
    'apps': true,
    'apps/mobile': false,
    'apps/web': false,
    'services': true,
    'services/api': false,
    'services/ai': false,
    'packages': true,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    addToast('success', 'Contenu copié avec succès !');
  };

  // Static Data definitions
  const dockerComposeYaml = `version: '3.8'

services:
  # Database Relationnelle Principale
  postgres:
    image: postgres:15-alpine
    container_name: alphaman-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: alphaman_dev
      POSTGRES_USER: alpha_admin
      POSTGRES_PASSWORD: superSecretAlphaPassword2026
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - alpha-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U alpha_admin -d alphaman_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Cache & Broker de Messages Real-Time
  redis:
    image: redis:7-alpine
    container_name: alphaman-redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - alpha-network
    command: redis-server --appendonly yes --requirepass alphaRedisSecurePass2026

  # API Backend Node.js / Express
  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile.dev
    container_name: alphaman-api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
      - DATABASE_URL=postgresql://alpha_admin:superSecretAlphaPassword2026@postgres:5432/alphaman_dev?schema=public
      - REDIS_URL=redis://:alphaRedisSecurePass2026@redis:6379/0
      - JWT_ACCESS_SECRET=access_secret_alpha_warrior_2026_9999
      - JWT_REFRESH_SECRET=refresh_secret_alpha_god_mode_2026_8888
    volumes:
      - ./services/api:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - alpha-network

  # Microservice AI Python/FastAPI
  ai-service:
    build:
      context: ./services/ai-microservice
      dockerfile: Dockerfile.dev
    container_name: alphaman-ai-service
    ports:
      - "8000:8000"
    environment:
      - ENV=development
      - REDIS_URL=redis://:alphaRedisSecurePass2026@redis:6379/1
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - ./services/ai-microservice:/app
    depends_on:
      - redis
    networks:
      - alpha-network

volumes:
  pgdata:
    driver: local
  redisdata:
    driver: local

networks:
  alpha-network:
    driver: bridge`;

  const githubActionsYaml = `name: ALPHA MAN CI/CD Engine

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Étape 1 : Tests, Linters et Validation du Type Safety de la stack
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Monorepo Dependencies
        run: npm ci

      - name: Lint Codebase (ESLint + Prettier)
        run: npm run lint

      - name: Run Prisma Database Schema Validate
        run: npx prisma validate --schema=./packages/db-prisma/schema.prisma

      - name: Run Unit & Integration Tests (Vitest)
        run: npm run test:coverage

  # Étape 2 : Construction des conteneurs Docker & Push vers ECR / Cloud Registry
  build-and-push-images:
    needs: validate-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-3 # Paris Region (Proche Maroc)

      - name: Log in to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build & Push API Image
        uses: docker/build-push-action@v5
        with:
          context: ./services/api
          push: true
          tags: \${{ steps.login-ecr.outputs.registry }}/alphaman-api:\${{ github.sha }}, \${{ steps.login-ecr.outputs.registry }}/alphaman-api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & Push Python FastAPI AI Image
        uses: docker/build-push-action@v5
        with:
          context: ./services/ai-microservice
          push: true
          tags: \${{ steps.login-ecr.outputs.registry }}/alphaman-ai:\${{ github.sha }}, \${{ steps.login-ecr.outputs.registry }}/alphaman-ai:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Étape 3 : Déploiement Kubernetes sur EKS (Rolling Update Progressif)
  deploy-to-kubernetes:
    needs: build-and-push-images
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Helm Chart / Manifests
        uses: actions/checkout@v4

      - name: Setup Kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure Kubeconfig
        run: |
          echo "\${{ secrets.KUBE_CONFIG_DATA }}" | base64 --decode > ~/.kube/config

      - name: Helm Rollout Release
        run: |
          helm upgrade --install alphaman ./infra/helm/alphaman \\
            --set api.image.tag=\${{ github.sha }} \\
            --set ai.image.tag=\${{ github.sha }} \\
            --namespace production`;

  const envExampleContent = `# ==========================================
#  ALPHA MAN TECHNICAL ENVIRONMENT VARIABLES
#  Aesthetic Dark Theme • World-Class Security
# ==========================================

# SERVER RUNTIME CONFIG
PORT=3000
NODE_ENV=production
API_PREFIX=/api/v1
ALLOWED_ORIGINS=https://alphaman.app,https://pwa.alphaman.app,http://localhost:3000

# DATABASE PERSISTENCE (PostgreSQL sur AWS RDS ou Cloud SQL)
# Pool de connexions optimisé pour 100 requêtes/sec par nœud
DATABASE_URL="postgresql://alpha_db_admin:AES256SecurePass@alphaman-prod-cluster.eu-west-3.rds.amazonaws.com:5432/alphaman_prod?schema=public&connection_limit=20&pool_timeout=15"

# IN-MEMORY SESSION & CACHE LAYER (Redis Enterprise)
REDIS_URL="redis://:RedisSuperSecureToken2026@alphaman-cache.redis.cache.amazonaws.com:6379/0"
REDIS_SESSION_TTL=86400

# REAL-TIME SERVICE (Socket.io WebSocket configuration)
WS_HEARTBEAT_INTERVAL=25000
WS_HEARTBEAT_TIMEOUT=20000

# SECURITY - CRYPTOGRAPHY & AUTHENTICATION
# Clés asymétriques ou secrets JWT robustes (min 256-bit)
JWT_ACCESS_SECRET="alpha_guardian_access_key_256bit_minimum_must_be_random_string_2026_combat"
JWT_REFRESH_SECRET="alpha_emperor_refresh_key_512bit_minimum_must_be_extremely_complex_gold_xp"
JWT_ACCESS_EXPIRE_SECONDS=900 # 15 minutes (Recommandation OWASP)
JWT_REFRESH_EXPIRE_SECONDS=2592000 # 30 jours

# LOCALISATION & LOCALE
DEFAULT_LOCALE=fr
SUPPORTED_LOCALES=fr,ar,en
TIMEZONE=Africa/Casablanca
PRIMARY_CURRENCY=MAD
SECONDARY_CURRENCY=USD

# INTEGRATIONS & THIRD-PARTY SERVICES
# Firebase Admin SDK (Authentication)
FIREBASE_PROJECT_ID="alphaman-auth-prod"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC78...\\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@alphaman-auth-prod.iam.gserviceaccount.com"

# Twilio SMS verification Morocco gateway (MAD primary)
TWILIO_ACCOUNT_SID="ACalphaTwilioSidForMoroccoVerification2026"
TWILIO_AUTH_TOKEN="alphaTwilioSecureAuthTokenFromConsole"
TWILIO_VERIFY_SERVICE_SID="VAalphaVerifyServiceSidForPhoneMfa"

# AWS S3 / Cloudflare R2 Bucket (Photos de profil, Rapports hormonaux chiffrés)
AWS_ACCESS_KEY_ID="AKIA_ALPHA_PROD_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="alphaAwsSecretAccessKeyProtectedByKms"
AWS_S3_BUCKET_NAME="alphaman-user-assets-encrypted"
AWS_S3_REGION="eu-west-3" # Paris Region
CLOUDFLARE_R2_PUBLIC_URL="https://cdn.alphaman.app"

# SendGrid Email Marketing & Transactional Alerts
SENDGRID_API_KEY="SG.alphaSendGridApiKeyForWellnessAndOnboardingCampaigns"
SENDGRID_FROM_EMAIL="guerrier@alphaman.app"

# AI/ML FastAPI - Gemini Integration Secret
# Note: Ne jamais exposer au navigateur client-side !
GEMINI_API_KEY="AIzaSyAlphaManGeminiSecretSecureEngine_2026"`;

  const apiEndpoints = [
    {
      group: 'Authentification & Profil (Secured & Biometrics)',
      endpoints: [
        { method: 'POST', path: '/api/v1/auth/register', desc: "Inscription d'un nouvel ALPHA. Initialise l'arbre d'expérience.", auth: 'Public', reqBody: '{\n  "email": "warrior@alphaman.com",\n  "password": "SecurePass!123",\n  "phone": "+212612345678",\n  "username": "GuerrierSouss"\n}', resp: '{\n  "status": "success",\n  "token": "eyJhbGciOi...",\n  "user": { "id": "u42", "level": 1, "xp": 0 }\n}' },
        { method: 'POST', path: '/api/v1/auth/biometric-verify', desc: 'Active la vérification par empreinte/FaceID via Expo LocalAuthentication.', auth: 'JWT Access', reqBody: '{\n  "signature": "biometric_challenge_signed_by_hardware_key_secure_enclave",\n  "deviceId": "dev_mac_992"\n}', resp: '{\n  "authenticated": true,\n  "accessToken": "eyJhbGciOi..."\n}' },
        { method: 'GET', path: '/api/v1/user/profile', desc: 'Récupère le profil complet de l\'utilisateur avec ses ratios physiques.', auth: 'JWT Access', reqBody: 'None', resp: '{\n  "id": "u42",\n  "username": "GuerrierSouss",\n  "level": 42,\n  "xp": 1420,\n  "timezone": "Africa/Casablanca",\n  "streakDays": 15\n}' }
      ]
    },
    {
      group: 'Physio & Kegel Coach Laboratory',
      endpoints: [
        { method: 'POST', path: '/api/v1/kegel/session/log', desc: "Enregistre une session d'entraînement du muscle PC.", auth: 'JWT Access', reqBody: '{\n  "durationSeconds": 300,\n  "intensityLevel": 8,\n  "completedCycles": 10,\n  "deviceModel": "iPhone 15 Pro Max"\n}', resp: '{\n  "logged": true,\n  "pointsAwarded": 25,\n  "newStreak": 16,\n  "nextWorkoutRecommended": "2026-07-13T10:00:00Z"\n}' },
        { method: 'GET', path: '/api/v1/kegel/stats/weekly', desc: 'Graphiques Victory/Recharts hebdomadaires.', auth: 'JWT Access', reqBody: 'None', resp: '{\n  "days": ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],\n  "intensities": [6, 7, 5, 8, 8, 9, 8],\n  "durations": [240, 300, 180, 300, 300, 360, 300]\n}' }
      ]
    },
    {
      group: 'AI Microservice - FastAPI (Cognitive & Retention Analysis)',
      endpoints: [
        { method: 'POST', path: '/api/v1/ai/analyze-retention', desc: 'Analyse prédictive des rechutes basée sur la voix ou l\'humeur.', auth: 'FastAPI Internal / API Key', reqBody: '{\n  "userId": "u42",\n  "currentStreak": 15,\n  "stressLevel": 7,\n  "sleepHours": 5.5,\n  "vocalSampleUrl": "https://s3.alphaman.app/voice_u42_challenge.wav"\n}', resp: '{\n  "relapseRisk": "Élevé (72%)",\n  "coachingResponse": "Votre ton vocal indique un pic d\'adrénaline. Nous vous conseillons une session d\'apnée assistée (30s) immédiatement.",\n  "actions": ["respiration_30s", "lock_social_chat_1h"]\n}' }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8 animate-[fade-in_0.3s_ease-out]">
      {/* Title block */}
      <div className="tokens-banner p-6 bg-gradient-to-r from-[#16213E] to-[#1A1A2E] rounded-3xl border border-[#E94560]/10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#E94560]/10 border border-[#E94560]/30 text-[#E94560] font-headline font-bold uppercase tracking-widest">
            Architecture Systèmes & DevOps
          </span>
          <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-white mt-3 tracking-wide">
            Spécifications Techniques Officielles d'ALPHA MAN
          </h2>
          <p className="text-sm text-[#8E8E93] mt-2 leading-relaxed">
            Consultez le schéma de fonctionnement de notre infrastructure Cloud multi-plateforme. Conçu pour le déploiement sécurisé sur <strong className="text-white">AWS (EKS)</strong> ou <strong className="text-white">GCP (Cloud Run)</strong> avec une base hautement disponible PostgreSQL/Redis et un microservice d'IA prédictif FastAPI.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour
            </AlphaButton>
          )}
          <AlphaButton variant="secondary" onClick={() => handleCopy(envExampleContent, 'full-env')}>
            <Copy className="w-4 h-4 mr-1" /> Copier l'Env Template
          </AlphaButton>
        </div>
      </div>

      {/* Sub-tabs selection */}
      <div className="flex bg-[#16213E]/60 p-1 rounded-2xl border border-[#1A1A2E] self-start max-w-full overflow-x-auto gap-1">
        {[
          { id: 'c4', label: 'Modèle C4 Diagrammes', icon: <Network className="w-4 h-4" /> },
          { id: 'erd', label: 'Schéma de Base ERD', icon: <Database className="w-4 h-4" /> },
          { id: 'api', label: 'OpenAPI Documentation', icon: <Terminal className="w-4 h-4" /> },
          { id: 'folders', label: 'Arborescence Projet', icon: <GitBranch className="w-4 h-4" /> },
          { id: 'devops', label: 'CI/CD & Docker', icon: <Server className="w-4 h-4" /> },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-headline text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap
              ${activeSubTab === sub.id ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
            `}
          >
            {sub.icon}
            <span>{sub.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER CONTENT BASED ON ACTIVE SUB-TAB */}
      
      {/* 1. C4 MODEL */}
      {activeSubTab === 'c4' && (
        <div className="flex flex-col gap-6 animate-[fade-in_0.2s_ease-out]">
          <div className="flex justify-between items-center bg-[#16213E]/20 p-4 rounded-xl border border-[#1A1A2E]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E94560] animate-pulse" />
              <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#8E8E93]">
                Niveau d'Abstraction C4 :
              </h3>
            </div>
            <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1 rounded-lg">
              {[
                { id: 'context', label: '1. Contexte' },
                { id: 'container', label: '2. Conteneurs' },
                { id: 'component', label: '3. Composants' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setC4Level(lvl.id as any)}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer
                    ${c4Level === lvl.id ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                  `}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diagram Frame */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-6">
            
            {/* Level 1: Context */}
            {c4Level === 'context' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">C4 Level 1 — Diagramme de Contexte</h4>
                  <p className="text-xs text-[#8E8E93] mt-1">Comment les utilisateurs et les systèmes externes interagissent avec la plateforme globale ALPHA MAN.</p>
                </div>

                {/* SVG Visual Context diagram */}
                <div className="bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl p-6 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#16213E_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-4xl gap-8 relative z-10 items-center text-center">
                    
                    {/* User actor */}
                    <div className="flex flex-col items-center p-4 bg-[#16213E]/50 rounded-2xl border border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                      <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 border border-[#FFD700] flex items-center justify-center text-[#FFD700] mb-2">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <h5 className="font-headline font-bold text-xs text-white uppercase">Utilisateur ALPHA MAN</h5>
                      <p className="text-[10px] text-[#8E8E93] mt-1">Cherche à s'optimiser (PC-Muscle, retention séminale, respiration, productivité).</p>
                    </div>

                    {/* Central System */}
                    <div className="flex flex-col items-center p-6 bg-[#E94560]/10 rounded-2xl border border-[#E94560] shadow-[0_0_20px_rgba(233,69,96,0.2)]">
                      <div className="w-16 h-16 rounded-2xl bg-[#E94560] flex items-center justify-center text-white mb-3 shadow-[0_0_15px_#E94560]">
                        <Server className="w-8 h-8" />
                      </div>
                      <h5 className="font-headline font-extrabold text-sm text-white uppercase tracking-wider">ALPHA MAN Platform</h5>
                      <span className="text-[9px] font-mono bg-white/10 text-white rounded px-1.5 py-0.5 mt-1">Système Principal</span>
                      <p className="text-[10px] text-[#C0C0C0] mt-2">Permet aux hommes d'entraîner leur physio, d'analyser leur humeur avec l'IA, et de relever des défis collectifs.</p>
                    </div>

                    {/* External Integrations */}
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-[#16213E]/30 rounded-xl border border-[#1A1A2E] text-left flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <div>
                          <h6 className="font-headline font-bold text-[10px] text-white uppercase">Firebase Auth</h6>
                          <p className="text-[9px] text-[#8E8E93]">OAuth Google/Apple, biométrie.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#16213E]/30 rounded-xl border border-[#1A1A2E] text-left flex items-center gap-2.5">
                        <Send className="w-4 h-4 text-orange-400" />
                        <div>
                          <h6 className="font-headline font-bold text-[10px] text-white uppercase">OneSignal & Twilio</h6>
                          <p className="text-[9px] text-[#8E8E93]">Push push notifications & SMS Maroc.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#16213E]/30 rounded-xl border border-[#1A1A2E] text-left flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 text-[#FFD700]" />
                        <div>
                          <h6 className="font-headline font-bold text-[10px] text-white uppercase">Stripe / MAD gateway</h6>
                          <p className="text-[9px] text-[#8E8E93]">Achats d'abonnements premium.</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Visual Connection line labels */}
                  <div className="mt-8 text-[11px] text-[#5A5A5A] font-mono uppercase tracking-widest text-center">
                    Flux sécurisés en HTTPS/WSS • Chiffrement AES-256 au repos
                  </div>
                </div>
              </div>
            )}

            {/* Level 2: Container */}
            {c4Level === 'container' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">C4 Level 2 — Diagramme de Conteneurs</h4>
                  <p className="text-xs text-[#8E8E93] mt-1">Structure modulaire des technologies : du frontend mobile cross-platform aux serveurs de cache et bases SQL.</p>
                </div>

                <div className="bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl p-6 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#16213E_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
                  
                  {/* Container Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 w-full items-stretch">
                    
                    {/* CLIENT FRONTEND BLOCK */}
                    <div className="md:col-span-4 flex flex-col gap-4 p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl">
                      <span className="text-[9px] font-mono text-[#FFD700] font-bold uppercase tracking-widest text-center border-b border-[#1A1A2E] pb-2">FRONTEND CLIENT LAYER</span>
                      
                      <div className="p-3.5 bg-[#16213E]/80 rounded-xl border border-[#E94560]/30 relative">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        </div>
                        <h6 className="font-headline font-bold text-xs text-white uppercase">App Mobile React Native</h6>
                        <span className="text-[8px] font-mono bg-white/10 text-white rounded px-1">Expo SDK</span>
                        <p className="text-[9px] text-[#8E8E93] mt-2">Interface mobile native fluide pour iOS et Android. Gère AsyncStorage, MMKV, animations Reanimated 3.</p>
                      </div>

                      <div className="p-3.5 bg-[#16213E]/80 rounded-xl border border-blue-500/30">
                        <h6 className="font-headline font-bold text-xs text-white uppercase">App Web PWA Next.js 14</h6>
                        <span className="text-[8px] font-mono bg-blue-500/10 text-blue-400 rounded px-1">App Router</span>
                        <p className="text-[9px] text-[#8E8E93] mt-2">Next.js statique + PWA Service Worker pour compatibilité ordinateur et installations PWA directes.</p>
                      </div>
                    </div>

                    {/* GATEWAY / REVERSE PROXY */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#16213E]/10 to-[#1A1A2E]/20 border border-[#1A1A2E] rounded-2xl text-center">
                      <div className="w-10 h-10 rounded-full bg-[#E94560]/10 border border-[#E94560] flex items-center justify-center text-[#E94560] mb-2 shadow-[0_0_10px_rgba(233,69,96,0.3)]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h6 className="font-headline font-bold text-xs text-white uppercase">Cloudflare CDN</h6>
                      <p className="text-[9px] text-[#8E8E93] mt-1">WAF protection, SSL Termination, redirection geoloc & cache statique.</p>
                    </div>

                    {/* BACKEND CONTAINERS */}
                    <div className="md:col-span-6 flex flex-col gap-4 p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl">
                      <span className="text-[9px] font-mono text-[#00D9A5] font-bold uppercase tracking-widest text-center border-b border-[#1A1A2E] pb-2">BACKEND SERVICES LAYER</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 bg-[#0F0F1A] rounded-xl border border-indigo-500/30">
                          <h6 className="font-headline font-bold text-xs text-white uppercase">API Express.js (Node)</h6>
                          <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 rounded px-1">Main Engine</span>
                          <p className="text-[9px] text-[#8E8E93] mt-1.5">Gère l'auth, le logging de données, Socket.io et la logique d'entraînement physique.</p>
                        </div>

                        <div className="p-3.5 bg-[#0F0F1A] rounded-xl border border-[#FFD700]/30">
                          <h6 className="font-headline font-bold text-xs text-white uppercase">FastAPI (Python)</h6>
                          <span className="text-[8px] font-mono bg-yellow-500/10 text-yellow-500 rounded px-1">AI Agent</span>
                          <p className="text-[9px] text-[#8E8E93] mt-1.5">Moteur d'apprentissage prédictif (Gemini SDK/TensorFlow) pour l'évaluation de rechute.</p>
                        </div>
                      </div>

                      {/* DB CACHE BLOCK */}
                      <div className="grid grid-cols-2 gap-4 border-t border-[#1A1A2E] pt-3">
                        <div className="p-3 bg-[#16213E]/50 rounded-xl text-left flex items-center gap-2 border border-emerald-500/20">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <div>
                            <h6 className="font-headline font-bold text-[10px] text-white uppercase">PostgreSQL (Prisma)</h6>
                            <p className="text-[8px] text-[#8E8E93]">Données relationnelles SQL.</p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#16213E]/50 rounded-xl text-left flex items-center gap-2 border border-red-500/20">
                          <HardDrive className="w-4 h-4 text-red-400" />
                          <div>
                            <h6 className="font-headline font-bold text-[10px] text-white uppercase">Redis Enterprise</h6>
                            <p className="text-[8px] text-[#8E8E93]">Sessions express, ratelimit & live broker.</p>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Level 3: Component */}
            {c4Level === 'component' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">C4 Level 3 — Diagramme de Composants Internes</h4>
                  <p className="text-xs text-[#8E8E93] mt-1">Structure interne du serveur API principal d'Express.js et communication avec l'ORM Prisma.</p>
                </div>

                <div className="bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl p-6 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#16213E_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
                  
                  <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 relative z-10">
                    
                    {/* Routing */}
                    <div className="p-4 bg-[#16213E]/40 border border-[#E94560]/30 rounded-2xl text-center">
                      <span className="text-[8px] font-mono text-[#E94560] font-bold uppercase tracking-widest">Étape 1 : Entrée des Requêtes</span>
                      <h5 className="font-headline font-bold text-xs text-white uppercase mt-1">Express App & Helmet/Zod Validation</h5>
                      <p className="text-[10px] text-[#8E8E93] mt-1">Intercepte les requêtes HTTP, applique le rate-limiting par IP, valide les schémas d'entrée avec Zod.</p>
                    </div>

                    {/* Controllers/Services */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl">
                        <h6 className="font-headline font-bold text-xs text-[#FFD700] uppercase">Authentication Controller</h6>
                        <p className="text-[10px] text-[#8E8E93] mt-1">Gère les jetons JWT asymétriques, l'authentification OTP via Twilio et l'interaction Firebase.</p>
                      </div>
                      <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl">
                        <h6 className="font-headline font-bold text-xs text-blue-400 uppercase">Physio & Kegel Service</h6>
                        <p className="text-[10px] text-[#8E8E93] mt-1">Vérifie l'intensité, calcule le temps d'entraînement fractionné et génère les points d'XP.</p>
                      </div>
                      <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl">
                        <h6 className="font-headline font-bold text-xs text-emerald-400 uppercase">AI Orchestration Module</h6>
                        <p className="text-[10px] text-[#8E8E93] mt-1">Établit les requêtes gRPC avec le microservice Python FastAPI et formate la réponse.</p>
                      </div>
                    </div>

                    {/* Data Access */}
                    <div className="p-4 bg-[#16213E]/40 border border-indigo-500/20 rounded-2xl text-center">
                      <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-widest">Étape 3 : Accès aux Données</span>
                      <h5 className="font-headline font-bold text-xs text-white uppercase mt-1">Prisma ORM Client Layer</h5>
                      <p className="text-[10px] text-[#8E8E93] mt-1">Requêtes SQL typées vers PostgreSQL. Évite l'injection SQL et automatise les transactions robustes.</p>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </AlphaCard>
        </div>
      )}

      {/* 2. ERD SCHÉMA */}
      {activeSubTab === 'erd' && (
        <AlphaPrismaExplorer addToast={addToast} />
      )}

      {/* 3. API OPENAPI DOCUMENTATION */}
      {activeSubTab === 'api' && (
        <div className="flex flex-col gap-6 animate-[fade-in_0.2s_ease-out]">
          <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">Moteur d'API Interactif (Swagger Light)</h4>
              <p className="text-xs text-[#8E8E93] mt-1">Vérifiez les paramètres de requêtes et simulez des réponses serveurs en temps réel.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#00D9A5]/10 border border-[#00D9A5]/20 text-[#00D9A5] font-headline font-bold uppercase tracking-widest">
              HTTPS/WSS ACTIFS
            </span>
          </div>

          <div className="flex flex-col gap-8">
            {apiEndpoints.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-4">
                <h5 className="font-headline font-extrabold text-xs text-white uppercase tracking-widest border-b border-[#1A1A2E] pb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#E94560]" />
                  {group.group}
                </h5>

                <div className="grid grid-cols-1 gap-4">
                  {group.endpoints.map((ep, eIdx) => (
                    <div key={eIdx} className="bg-[#16213E]/30 border border-[#1A1A2E] rounded-2xl overflow-hidden">
                      {/* Endpoint header row */}
                      <div className="p-4 bg-[#16213E]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1A1A2E]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider
                            ${ep.method === 'POST' ? 'bg-[#00D9A5]/10 text-[#00D9A5] border border-[#00D9A5]/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}
                          `}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs text-white font-extrabold">{ep.path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase">Securité:</span>
                          <span className="text-[9px] font-mono bg-[#0F0F1A] border border-[#1A1A2E] px-2 py-0.5 rounded text-white">{ep.auth}</span>
                        </div>
                      </div>

                      {/* Details section */}
                      <div className="p-4 flex flex-col gap-4">
                        <p className="text-xs text-[#8E8E93]">{ep.desc}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Request Body example */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase">Request Payload</span>
                              <button 
                                onClick={() => handleCopy(ep.reqBody, `${ep.path}-req`)}
                                className="text-[9px] font-headline font-bold text-[#FFD700] hover:underline"
                              >
                                {copiedKey === `${ep.path}-req` ? 'Copié' : 'Copier'}
                              </button>
                            </div>
                            <pre className="p-3 bg-[#0F0F1A] border border-[#1A1A2E] rounded-xl font-mono text-[10px] text-[#8E8E93] overflow-x-auto">
                              <code>{ep.reqBody}</code>
                            </pre>
                          </div>

                          {/* Response example */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase">Expected Response (200 OK)</span>
                              <button 
                                onClick={() => handleCopy(ep.resp, `${ep.path}-resp`)}
                                className="text-[9px] font-headline font-bold text-[#FFD700] hover:underline"
                              >
                                {copiedKey === `${ep.path}-resp` ? 'Copié' : 'Copier'}
                              </button>
                            </div>
                            <pre className="p-3 bg-[#0F0F1A] border border-[#1A1A2E] rounded-xl font-mono text-[10px] text-[#8E8E93] overflow-x-auto">
                              <code>{ep.resp}</code>
                            </pre>
                          </div>
                        </div>

                        {/* Interactive testing button */}
                        <div className="flex justify-end pt-2">
                          <AlphaButton 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              addToast('success', `Requête émulée vers ${ep.path} reçue en 115ms (Status 200 OK)`);
                            }}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Simuler l'Endpoint
                          </AlphaButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FOLDERS STRUCTURE */}
      {activeSubTab === 'folders' && (
        <div className="flex flex-col gap-6 animate-[fade-in_0.2s_ease-out]">
          <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl">
            <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">Arborescence de Fichiers Monorepo</h4>
            <p className="text-xs text-[#8E8E93] mt-1">Explorez l'architecture technique complète du projet ALPHA MAN pour le mobile, le web, et les microservices.</p>
          </div>

          <AlphaCard variant="default" className="p-6">
            <div className="font-mono text-xs flex flex-col gap-1">
              
              {/* Root */}
              <div className="flex items-center gap-1.5 py-1 text-white">
                <ChevronDown className="w-4 h-4 text-[#FFD700]" />
                <span className="font-bold text-[#FFD700]">alphaman-monorepo/</span>
                <span className="text-[10px] text-[#5A5A5A]">(Root Workspace)</span>
              </div>

              {/* Apps Folder */}
              <div className="pl-4 flex flex-col gap-1">
                <div onClick={() => toggleFolder('apps')} className="flex items-center gap-1.5 py-1 text-[#8E8E93] hover:text-white cursor-pointer select-none">
                  {expandedFolders['apps'] ? <ChevronDown className="w-4 h-4 text-[#E94560]" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-bold text-white">apps/</span>
                  <span className="text-[10px] text-[#5A5A5A]">(Frontend Projects)</span>
                </div>

                {expandedFolders['apps'] && (
                  <div className="pl-6 flex flex-col gap-1 border-l border-[#16213E] ml-2">
                    
                    {/* apps/mobile */}
                    <div onClick={() => toggleFolder('apps/mobile')} className="flex items-center gap-1.5 py-1 text-[#8E8E93] hover:text-white cursor-pointer select-none">
                      {expandedFolders['apps/mobile'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span className="font-bold text-[#C0C0C0]">mobile/</span>
                      <span className="text-[10px] text-[#5A5A5A]">(Expo / React Native)</span>
                    </div>
                    {expandedFolders['apps/mobile'] && (
                      <div className="pl-6 flex flex-col gap-1 border-l border-[#16213E] ml-1.5 text-gray-500">
                        <div>├── App.tsx <span className="text-[10px] text-[#5A5A5A]">(Point d'entrée principal mobile)</span></div>
                        <div>├── app.json <span className="text-[10px] text-[#5A5A5A]">(Configuration d'Expo et permissions biométriques)</span></div>
                        <div>├── src/</div>
                        <div>│   ├── components/ <span className="text-[10px] text-[#5A5A5A]">(Composants UI Victory Native & Reanimated)</span></div>
                        <div>│   ├── hooks/ <span className="text-[10px] text-[#5A5A5A]">(State Zustand & React Query hooks)</span></div>
                        <div>│   └── navigation/ <span className="text-[10px] text-[#5A5A5A]">(React Navigation structures)</span></div>
                        <div>└── package.json</div>
                      </div>
                    )}

                    {/* apps/web */}
                    <div onClick={() => toggleFolder('apps/web')} className="flex items-center gap-1.5 py-1 text-[#8E8E93] hover:text-white cursor-pointer select-none">
                      {expandedFolders['apps/web'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span className="font-bold text-[#C0C0C0]">web/</span>
                      <span className="text-[10px] text-[#5A5A5A]">(Next.js 14 App Router / PWA)</span>
                    </div>
                    {expandedFolders['apps/web'] && (
                      <div className="pl-6 flex flex-col gap-1 border-l border-[#16213E] ml-1.5 text-gray-500">
                        <div>├── src/</div>
                        <div>│   ├── app/ <span className="text-[10px] text-[#5A5A5A]">(Pages layouts & routes Next.js)</span></div>
                        <div>│   ├── components/ <span className="text-[10px] text-[#5A5A5A]">(Composants Web Recharts)</span></div>
                        <div>│   └── styles/ <span className="text-[10px] text-[#5A5A5A]">(Tailwind CSS Config)</span></div>
                        <div>├── next.config.js <span className="text-[10px] text-[#5A5A5A]">(Export statique & service workers config)</span></div>
                        <div>└── package.json</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Services Folder */}
                <div onClick={() => toggleFolder('services')} className="flex items-center gap-1.5 py-1 text-[#8E8E93] hover:text-white cursor-pointer select-none">
                  {expandedFolders['services'] ? <ChevronDown className="w-4 h-4 text-[#E94560]" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-bold text-white">services/</span>
                  <span className="text-[10px] text-[#5A5A5A]">(Backend Microservices)</span>
                </div>

                {expandedFolders['services'] && (
                  <div className="pl-6 flex flex-col gap-1 border-l border-[#16213E] ml-2">
                    
                    {/* services/api */}
                    <div onClick={() => toggleFolder('services/api')} className="flex items-center gap-1.5 py-1 text-[#8E8E93] hover:text-white cursor-pointer select-none">
                      {expandedFolders['services/api'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span className="font-bold text-[#C0C0C0]">api/</span>
                      <span className="text-[10px] text-[#5A5A5A]">(Node.js Express / Socket.io)</span>
                    </div>
                    {expandedFolders['services/api'] && (
                      <div className="pl-6 flex flex-col gap-1 border-l border-[#16213E] ml-1.5 text-gray-500">
                        <div>├── server.ts <span className="text-[10px] text-[#5A5A5A]">(Boot et listeners WebSockets)</span></div>
                        <div>├── src/</div>
                        <div>│   ├── controllers/ <span className="text-[10px] text-[#5A5A5A]">(Validations Zod & Business Logic)</span></div>
                        <div>│   ├── middlewares/ <span className="text-[10px] text-[#5A5A5A]">(Ratelimit, Auth JWT Verify)</span></div>
                        <div>│   └── routes/ <span className="text-[10px] text-[#5A5A5A]">(Enregistrement Express Router)</span></div>
                        <div>├── Dockerfile.dev <span className="text-[10px] text-[#5A5A5A]">(Image Docker pour l'environnement local)</span></div>
                        <div>└── package.json</div>
                      </div>
                    )}

                    {/* services/ai */}
                    <div onClick={() => toggleFolder('services/ai')} className="flex items-center gap-1.5 py-1 text-[#8E8E93] hover:text-white cursor-pointer select-none">
                      {expandedFolders['services/ai'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span className="font-bold text-[#C0C0C0]">ai-microservice/</span>
                      <span className="text-[10px] text-[#5A5A5A]">(Python FastAPI & Gemini)</span>
                    </div>
                    {expandedFolders['services/ai'] && (
                      <div className="pl-6 flex flex-col gap-1 border-l border-[#16213E] ml-1.5 text-gray-500">
                        <div>├── main.py <span className="text-[10px] text-[#5A5A5A]">(Endpoints FastAPI d'IA)</span></div>
                        <div>├── requirements.txt <span className="text-[10px] text-[#5A5A5A]">(google-genai, fastapi, uvicorn)</span></div>
                        <div>├── Dockerfile.dev</div>
                        <div>└── app/</div>
                        <div>    ├── analysis.py <span className="text-[10px] text-[#5A5A5A]">(Modèles d'analyse de stress vocal)</span></div>
                        <div>    └── prompts.py <span className="text-[10px] text-[#5A5A5A]">(Contextes d'IA optimisés pour Gemini)</span></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Packages Folder */}
                <div onClick={() => toggleFolder('packages')} className="flex items-center gap-1.5 py-1 text-[#8E8E93] hover:text-white cursor-pointer select-none">
                  {expandedFolders['packages'] ? <ChevronDown className="w-4 h-4 text-[#E94560]" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-bold text-white">packages/</span>
                  <span className="text-[10px] text-[#5A5A5A]">(Shared Monorepo Packages)</span>
                </div>

                {expandedFolders['packages'] && (
                  <div className="pl-6 flex flex-col gap-1 border-l border-[#16213E] ml-2 text-gray-500">
                    <div>├── db-prisma/ <span className="text-[10px] text-[#5A5A5A]">(Modèle de base, migrations et client Prisma)</span></div>
                    <div>└── design-system-tokens/ <span className="text-[10px] text-[#5A5A5A]">(Couleurs, espacements et constantes partagées)</span></div>
                  </div>
                )}

                {/* DevOps / Roots files */}
                <div className="text-gray-500 mt-2">
                  <div>├── docker-compose.yml <span className="text-[10px] text-[#5A5A5A]">(Configuration du local dev orchestré)</span></div>
                  <div>├── .env.example <span className="text-[10px] text-[#5A5A5A]">(Gabarit d'environnement sécurisé)</span></div>
                  <div>├── .github/workflows/ci-cd.yml <span className="text-[10px] text-[#5A5A5A]">(Pipeline GitHub Actions)</span></div>
                  <div>└── package.json <span className="text-[10px] text-[#5A5A5A]">(Global Monorepo configuration)</span></div>
                </div>

              </div>

            </div>
          </AlphaCard>
        </div>
      )}

      {/* 5. DEVOPS & CI/CD */}
      {activeSubTab === 'devops' && (
        <div className="flex flex-col gap-8 animate-[fade-in_0.2s_ease-out]">
          
          {/* Docker Compose block */}
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">1. Docker Compose (Dev Environment)</h4>
                <p className="text-xs text-[#8E8E93] mt-1">Boot complet de l'environnement de développement local pour tous les développeurs de l'équipe.</p>
              </div>
              <button
                onClick={() => handleCopy(dockerComposeYaml, 'docker-compose')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-headline font-bold uppercase hover:bg-[#FFD700]/20 cursor-pointer"
              >
                {copiedKey === 'docker-compose' ? 'Copié !' : 'Copier le YAML'}
              </button>
            </div>

            <pre className="p-5 bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl font-mono text-xs text-[#8E8E93] overflow-x-auto max-h-[400px] leading-relaxed">
              <code>{dockerComposeYaml}</code>
            </pre>
          </div>

          {/* CI/CD block */}
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">2. Pipeline de CI/CD (GitHub Actions)</h4>
                <p className="text-xs text-[#8E8E93] mt-1">Validation automatique du type-safety, des tests unitaires et déploiement progressif sur Kubernetes (AWS EKS).</p>
              </div>
              <button
                onClick={() => handleCopy(githubActionsYaml, 'github-actions')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-headline font-bold uppercase hover:bg-[#FFD700]/20 cursor-pointer"
              >
                {copiedKey === 'github-actions' ? 'Copié !' : 'Copier le YAML'}
              </button>
            </div>

            <pre className="p-5 bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl font-mono text-xs text-[#8E8E93] overflow-x-auto max-h-[400px] leading-relaxed">
              <code>{githubActionsYaml}</code>
            </pre>
          </div>

          {/* Env Template Table */}
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl">
              <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">3. Fichier d'environnement (.env.example complet)</h4>
              <p className="text-xs text-[#8E8E93] mt-1">Variables de configuration sécurisées documentées pour l'activation des intégrations tierces et des bases SQL/Redis.</p>
            </div>

            <div className="bg-[#16213E]/40 border border-[#1A1A2E] rounded-3xl overflow-hidden flex flex-col">
              <div className="bg-[#16213E]/80 px-6 py-4 border-b border-[#1A1A2E] flex items-center justify-between">
                <span className="text-xs font-headline font-bold text-white uppercase">Template .env.example</span>
                <button 
                  onClick={() => handleCopy(envExampleContent, 'env-example')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#E94560]/10 border border-[#E94560]/30 text-[#E94560] font-headline font-bold uppercase hover:bg-[#E94560]/20 cursor-pointer"
                >
                  {copiedKey === 'env-example' ? 'Copié !' : 'Copier le texte'}
                </button>
              </div>
              <pre className="p-5 bg-[#0F0F1A] font-mono text-xs text-[#8E8E93] overflow-x-auto max-h-[500px] leading-relaxed">
                <code>{envExampleContent}</code>
              </pre>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
