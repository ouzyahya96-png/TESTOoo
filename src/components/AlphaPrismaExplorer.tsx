import React, { useState, useMemo } from 'react';
import {
  Database,
  FileText,
  Terminal,
  Search,
  Copy,
  Check,
  ChevronRight,
  GitFork,
  Layers,
  Key,
  ShieldAlert,
  ArrowRight,
  ListFilter,
  User,
  Heart,
  Calendar,
  DollarSign,
  Award,
  Users,
  Trophy,
  BookOpen,
  Bell,
  Tv,
  CheckSquare,
  Settings as SettingsIcon,
  HelpCircle,
  Eye,
  BookMarked
} from 'lucide-react';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';

interface AlphaPrismaExplorerProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export function AlphaPrismaExplorer({ addToast }: AlphaPrismaExplorerProps) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'prisma' | 'seed' | 'sql'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('USER');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    addToast('success', 'Contenu copié avec succès !');
  };

  // Full 20 Entities Metadata for Interactive Tab
  const entities = useMemo(() => [
    {
      name: 'USER',
      icon: <User className="w-4 h-4 text-[#FFD700]" />,
      desc: 'Entité pivot de la plateforme. Stocke l\'identité, l\'état d\'authentification, le niveau actuel, l\'historique des streaks et le parrainage.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Généré par default (UUID)', desc: 'Identifiant unique de l\'utilisateur.' },
        { name: 'email', type: 'String', details: 'Unique, Indexé', desc: 'Adresse email de connexion unique.' },
        { name: 'passwordHash', type: 'String', details: 'Bcrypt Hashed', desc: 'Mot de passe sécurisé.' },
        { name: 'phoneNumber', type: 'String?', details: 'Unique, Optionnel', desc: 'Numéro de téléphone vérifié (OTP).' },
        { name: 'displayName', type: 'String(30)', details: 'Max 30 chars', desc: 'Nom d\'affichage public de l\'utilisateur.' },
        { name: 'avatarUrl', type: 'String?', details: 'S3 URL, Optionnel', desc: 'Photo de profil stockée sur AWS S3.' },
        { name: 'dateOfBirth', type: 'DateTime?', details: 'Optionnel', desc: 'Date de naissance pour validation de l\'âge (18+).' },
        { name: 'gender', type: 'Enum', details: 'MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY', desc: 'Genre déclaré.' },
        { name: 'country', type: 'String', details: 'Default: "MA"', desc: 'Code pays ISO-2 (Maroc par défaut).' },
        { name: 'language', type: 'String', details: 'Default: "fr"', desc: 'Code de langue d\'affichage (fr, ar, en).' },
        { name: 'timezone', type: 'String', details: 'Default: "Africa/Casablanca"', desc: 'Fuseau horaire pour le planning des notifications.' },
        { name: 'subscriptionTier', type: 'Enum', details: 'FREE, PREMIUM, ELITE, ELITE_PREMIUM, ALPHA_ULTIMATE', desc: 'Niveau d\'abonnement actif.' },
        { name: 'subscriptionExpiresAt', type: 'DateTime?', details: 'Optionnel', desc: 'Date de fin de validité de l\'abonnement.' },
        { name: 'vitalityPoints', type: 'Int', details: 'Default: 0, Indexé', desc: 'Total des points d\'expérience de vitalité cumulés.' },
        { name: 'currentLevel', type: 'Int', details: 'Default: 1', desc: 'Niveau d\'expérience actif (1-8).' },
        { name: 'currentStreak', type: 'Int', details: 'Default: 0', desc: 'Nombre de jours consécutifs sans rechute.' },
        { name: 'longestStreak', type: 'Int', details: 'Default: 0', desc: 'Record historique de jours de discipline.' },
        { name: 'lastActiveAt', type: 'DateTime', details: 'Default: now()', desc: 'Date de dernière activité détectée.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default: now(), Indexé', desc: 'Date d\'inscription.' },
        { name: 'isActive', type: 'Boolean', details: 'Default: true', desc: 'Indique si le compte est actif.' },
        { name: 'isVerified', type: 'Boolean', details: 'Default: false', desc: 'Indique si l\'email a été vérifié.' },
        { name: 'referralCode', type: 'String', details: 'Unique', desc: 'Code unique de parrainage généré.' },
        { name: 'referredById', type: 'UUID?', details: 'Optionnel, FK', desc: 'Identifiant du parrain qui a référé cet utilisateur.' }
      ],
      indexes: ['email (unique)', 'subscriptionTier (indexé)', 'vitalityPoints (indexé)', 'createdAt (indexé)'],
      relations: [
        '1:1 UserProfile (Cascade)',
        '1:1 Settings (Cascade)',
        '1:N PatternTracker (Cascade)',
        '1:N KegelSession (Cascade)',
        '1:N VitalityLog (Cascade)',
        '1:N VitalityTransaction (Cascade)',
        '1:N JournalEntry (Cascade)',
        '1:N Notification (Cascade)',
        '1:N AdReward (Cascade)',
        '1:N SubscriptionTransaction (Cascade)',
        'N:1 Clan (via ClanMembership)',
        'N:N Challenge (via ChallengeParticipation)',
        'N:N EducationModule (via UserEducationProgress)',
        '1:N Referrals (Self-relation Cascade Null)'
      ]
    },
    {
      name: 'USER_PROFILE',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      desc: 'Contient l\'état d\'onboarding, les objectifs principaux, l\'historique des addictions et les scores physiologiques de base.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID de profil unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Unique, Cascade Delete', desc: 'Référence unique vers User.' },
        { name: 'goal', type: 'Enum', details: 'BRAIN_REWIRE, PERFORMANCE, CONFIDENCE, ALL', desc: 'Objectif choisi lors de l\'onboarding.' },
        { name: 'struggleDuration', type: 'Enum', details: 'LESS_THAN_1_YEAR, ONE_TO_THREE, THREE_TO_FIVE, FIVE_PLUS', desc: 'Durée du combat personnel.' },
        { name: 'primaryTriggers', type: 'Enum[]', details: 'Array of TriggerType', desc: 'Liste des déclencheurs récurrents identifiés.' },
        { name: 'currentMood', type: 'Enum', details: 'EXHAUSTED, ANXIOUS, MOTIVATED, HOPELESS, DETERMINED', desc: 'Humeur actuelle sélectionnée.' },
        { name: 'sleepQuality', type: 'Enum', details: 'POOR, FAIR, GOOD, EXCELLENT', desc: 'Qualité globale du sommeil.' },
        { name: 'stressLevel', type: 'Int', details: 'Range 1-10', desc: 'Niveau de stress déclaré de l\'utilisateur.' },
        { name: 'currentKegelLevel', type: 'Int', details: 'Default 1', desc: 'Niveau d\'exercice Kegel attribué.' },
        { name: 'kegelForceScore', type: 'Int', details: 'Default 0', desc: 'Score de puissance de contraction (PC Muscle).' },
        { name: 'kegelEnduranceSeconds', type: 'Int', details: 'Default 0', desc: 'Durée maximale d\'endurance en secondes.' },
        { name: 'vitalityScore', type: 'Int', details: 'Default 0', desc: 'Score de vitalité calculé par jour.' },
        { name: 'patternRiskScore', type: 'Int', details: 'Default 50 (0-100)', desc: 'Score de risque de rechute estimé par le moteur IA.' },
        { name: 'onboardingCompleted', type: 'Boolean', details: 'Default false', desc: 'Vrai si l\'onboarding initial est finalisé.' },
        { name: 'onboardingStep', type: 'Int', details: 'Default 1', desc: 'Étape courante d\'onboarding de l\'utilisateur.' }
      ],
      indexes: ['userId (unique)'],
      relations: ['1:1 User (Belongs to)']
    },
    {
      name: 'PATTERN_TRACKER',
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      desc: 'Moteur d\'analyse comportementale. Enregistre les pics de déclencheurs, évalue le niveau de risque et trace les interventions IA envoyées.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID d\'historique unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'L\'utilisateur concerné.' },
        { name: 'patternType', type: 'Enum', details: 'STRESS, BOREDOM, LONELINESS, EVENING, MORNING, SOCIAL_MEDIA, WEEKEND, OTHER', desc: 'Type de pattern comportemental détecté.' },
        { name: 'triggerDetectedAt', type: 'DateTime', details: 'Required', desc: 'Date et heure du déclencheur.' },
        { name: 'riskScore', type: 'Int', details: '0-100', desc: 'Score de risque quantifié par l\'algorithme.' },
        { name: 'contextData', type: 'Json', details: 'Required', desc: 'Métadonnées contextuelles (coordonnées, sommeil, stress, appli).' },
        { name: 'interventionSent', type: 'Boolean', details: 'Default false', desc: 'Indique si une notification d\'urgence a été transmise.' },
        { name: 'interventionType', type: 'Enum', details: 'BREATHING, COLD_SHOWER, EXERCISE, CALL_BUDDY, JOURNAL, OTHER', desc: 'Type d\'activité d\'évitement proposé.' },
        { name: 'userResponded', type: 'Boolean', details: 'Default false', desc: 'Vrai si l\'utilisateur a interagi avec l\'intervention.' },
        { name: 'relapseOccurred', type: 'Boolean', details: 'Default false', desc: 'Indique si un dérapage a quand même eu lieu.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date d\'enregistrement du log.' }
      ],
      indexes: ['userId + createdAt', 'userId + patternType'],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'KEGEL_SESSION',
      icon: <Heart className="w-4 h-4 text-[#E94560]" />,
      desc: 'Historique d\'entraînement du muscle pubo-coccygien (PC). Enregistre la durée, les contractions, la force et le planning des exercices de rééducation pelvienne.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID de session unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'L\'utilisateur qui a complété l\'exercice.' },
        { name: 'level', type: 'Int', details: 'Range 1-10', desc: 'Niveau de difficulté de la session.' },
        { name: 'durationSeconds', type: 'Int', details: 'Required', desc: 'Durée totale entraînée en secondes.' },
        { name: 'contractionsCount', type: 'Int', details: 'Required', desc: 'Nombre total de contractions effectuées.' },
        { name: 'averageHoldSeconds', type: 'Int', details: 'Required', desc: 'Temps moyen de maintien de la contraction.' },
        { name: 'maxHoldSeconds', type: 'Int', details: 'Required', desc: 'Temps maximum de maintien sans relâcher.' },
        { name: 'forceScore', type: 'Int', details: '0-100', desc: 'Indice de force mesuré via accéléromètre/tactile.' },
        { name: 'completed', type: 'Boolean', details: 'Required', desc: 'Vrai si la session est allée jusqu\'au bout.' },
        { name: 'skipped', type: 'Boolean', details: 'Default false', desc: 'Vrai si la session planifiée a été ignorée.' },
        { name: 'notes', type: 'String?', details: 'Optionnel, Text', desc: 'Commentaires personnels de l\'utilisateur.' },
        { name: 'scheduledAt', type: 'DateTime', details: 'Required', desc: 'Heure de planification de la session.' },
        { name: 'completedAt', type: 'DateTime?', details: 'Optionnel', desc: 'Date et heure réelles de fin.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date d\'enregistrement système.' }
      ],
      indexes: ['userId + completedAt', 'userId + level'],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'VITALITY_LOG',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      desc: 'Journal quotidien de biohacking de la vitalité (Soleil, Sommeil, Froid, Respiration, Suppléments et Nutrition). Un seul log par utilisateur par jour.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID de log unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'L\'utilisateur.' },
        { name: 'date', type: 'Date', details: 'Unique par utilisateur et jour', desc: 'Date du log (sans heure).' },
        { name: 'sleepScore', type: 'Int', details: '0-100', desc: 'Note globale attribuée au sommeil.' },
        { name: 'sleepHours', type: 'Float', details: 'Required', desc: 'Nombre d\'heures de sommeil mesurées.' },
        { name: 'sleepBedTime', type: 'String?', details: 'Optionnel, HH:MM', desc: 'Heure d\'endormissement déclarée.' },
        { name: 'sleepWakeTime', type: 'String?', details: 'Optionnel, HH:MM', desc: 'Heure de réveil.' },
        { name: 'sunScore', type: 'Int', details: '0-100', desc: 'Score de recharge lumineuse.' },
        { name: 'sunMinutes', type: 'Int', details: 'Required', desc: 'Minutes d\'exposition solaire directe.' },
        { name: 'sunTimestamp', type: 'DateTime?', details: 'Optionnel', desc: 'Moment de l\'exposition solaire.' },
        { name: 'nutritionScore', type: 'Int', details: '0-100', desc: 'Score de nutrition de la journée.' },
        { name: 'nutritionLogged', type: 'Boolean', details: 'Required', desc: 'Indique si les repas ont été répertoriés.' },
        { name: 'supplementsTaken', type: 'Enum[]', details: 'ZINC, MAGNESIUM, VITAMIN_D, OMEGA3, MACA, ASHWAGANDHA, OTHER', desc: 'Liste des suppléments pris aujourd\'hui.' },
        { name: 'coldScore', type: 'Int', details: '0-100', desc: 'Score d\'exposition au froid.' },
        { name: 'coldDurationSeconds', type: 'Int', details: 'Required', desc: 'Durée de la douche froide ou bain de glace.' },
        { name: 'coldTemperature', type: 'Float?', details: 'Optionnel', desc: 'Température de l\'eau en Celsius.' },
        { name: 'breathScore', type: 'Int', details: '0-100', desc: 'Score de cohérence cardiaque / respiration.' },
        { name: 'breathMinutes', type: 'Int', details: 'Required', desc: 'Minutes passées en exercices de respiration.' },
        { name: 'breathType', type: 'Enum', details: 'BOX_BREATHING, WIM_HOF, FOUR_SEVEN_EIGHT, ALPHA_BREATH, OTHER', desc: 'Technique utilisée.' },
        { name: 'overallScore', type: 'Int', details: '0-100', desc: 'Calcul pondéré de l\'indice de vitalité quotidien.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date de création.' },
        { name: 'updatedAt', type: 'DateTime', details: 'Auto-updated', desc: 'Date de mise à jour.' }
      ],
      indexes: ['userId + date (unique)'],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'VITALITY_TRANSACTION',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      desc: 'Compte de points de Vitalité de l\'utilisateur. Trace tous les gains (complétion, streak, parrainage, ad) et dépenses.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID de transaction unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'L\'utilisateur concerné.' },
        { name: 'amount', type: 'Int', details: 'Positif ou Négatif', desc: 'Points octroyés ou déduits.' },
        { name: 'type', type: 'Enum', details: 'KEGEL_COMPLETE, BREATHING_COMPLETE, SUN_COMPLETE, etc.', desc: 'Origine de la transaction.' },
        { name: 'description', type: 'String', details: 'Required', desc: 'Texte explicatif pour l\'historique (ex: "Défi quotidien de douche froide complété").' },
        { name: 'relatedEntityType', type: 'String?', details: 'Optionnel', desc: 'Table liée pour le lien technique (ex: "KEGEL_SESSION").' },
        { name: 'relatedEntityId', type: 'UUID?', details: 'Optionnel', desc: 'UUID de l\'entité liée.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date d\'exécution.' }
      ],
      indexes: ['userId + createdAt', 'userId + type'],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'LEVEL',
      icon: <Award className="w-4 h-4 text-yellow-500" />,
      desc: 'Niveaux d\'expérience prédéfinis de 1 à 8. Définit les points requis, les badges officiels et les fonctionnalités débloquées.',
      fields: [
        { name: 'id', type: 'Int (PK)', details: 'Unique, Clé Primaire', desc: 'Identifiant du niveau (1-8).' },
        { name: 'name', type: 'String', details: 'Unique', desc: 'Nom honorifique du niveau (ex: "ALPHA SUPRÊME").' },
        { name: 'minPoints', type: 'Int', details: 'Required', desc: 'Seuil minimum de Vitality Points requis.' },
        { name: 'maxPoints', type: 'Int', details: 'Required', desc: 'Seuil maximum pour passer au niveau supérieur.' },
        { name: 'badgeUrl', type: 'String', details: 'S3 Image URL', desc: 'Emplacement de l\'image de badge.' },
        { name: 'unlocks', type: 'Json', details: 'Array of Strings', desc: 'Clés des fonctionnalités déverrouillées (ex: ["clan_creation"]).' },
        { name: 'description', type: 'String', details: 'Text court', desc: 'Description philosophique du niveau.' }
      ],
      indexes: ['name (unique)'],
      relations: []
    },
    {
      name: 'CLAN',
      icon: <Users className="w-4 h-4 text-orange-400" />,
      desc: 'Clans de ralliement collectifs. Permet aux guerriers de se regrouper, cumuler leurs points et accomplir des défis hebdomadaires de groupe.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID de clan unique.' },
        { name: 'name', type: 'String', details: 'Unique', desc: 'Nom unique du clan (ex: "Lions de l\'Atlas").' },
        { name: 'description', type: 'String', details: 'Required', desc: 'Description et charte du clan.' },
        { name: 'badgeUrl', type: 'String', details: 'S3 Image URL', desc: 'Emblème graphique du clan.' },
        { name: 'memberCount', type: 'Int', details: 'Default 0', desc: 'Nombre total de membres actifs dans le clan.' },
        { name: 'totalVitalityPoints', type: 'BigInt', details: 'Default 0', desc: 'Somme cumulée des points de tous les membres.' },
        { name: 'weeklyChallengeProgress', type: 'Int', details: 'Default 0', desc: 'Avancement actuel du clan dans le défi de la semaine.' },
        { name: 'weeklyChallengeGoal', type: 'Int', details: 'Default 0', desc: 'Objectif de points collectifs hebdomadaires.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date de fondation du clan.' }
      ],
      indexes: ['name (unique)'],
      relations: ['1:N ClanMembership (Cascade)']
    },
    {
      name: 'CLAN_MEMBERSHIP',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      desc: 'Table de liaison entre un utilisateur et un clan, précisant son rôle (MEMBER, ELDER, LEADER) et sa contribution personnelle.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Utilisateur membre.' },
        { name: 'clanId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Clan rejoint.' },
        { name: 'role', type: 'Enum', details: 'MEMBER, ELDER, LEADER', desc: 'Rôle d\'administration au sein du clan.' },
        { name: 'joinedAt', type: 'DateTime', details: 'Default now()', desc: 'Date d\'adhésion.' },
        { name: 'contributionPoints', type: 'Int', details: 'Default 0', desc: 'Total de points rapportés au clan par cet utilisateur.' }
      ],
      indexes: ['userId + clanId (unique)'],
      relations: ['N:1 User (Belongs to)', 'N:1 Clan (Belongs to)']
    },
    {
      name: 'CHALLENGE',
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      desc: 'Défis périodiques configurés par le système pour motiver la rétention séminale ou l\'exercice (individuel ou de clan).',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID de défi unique.' },
        { name: 'name', type: 'String', details: 'Required', desc: 'Titre du challenge.' },
        { name: 'description', type: 'String', details: 'Required', desc: 'Description de la consigne et règles.' },
        { name: 'type', type: 'Enum', details: 'INDIVIDUAL, CLAN', desc: 'Type de portée de challenge.' },
        { name: 'startDate', type: 'DateTime', details: 'Required', desc: 'Date de début de l\'épreuve.' },
        { name: 'endDate', type: 'DateTime', details: 'Required', desc: 'Date de fin de l\'épreuve.' },
        { name: 'goal', type: 'Json', details: 'Schema: {type, target, unit}', desc: 'Spécification technique du but (ex: 15 douches froides).' },
        { name: 'rewardPoints', type: 'Int', details: 'Required', desc: 'Points octroyés aux vainqueurs.' },
        { name: 'rewardBadge', type: 'String?', details: 'Optionnel', desc: 'Code ou URL du badge honorifique débloqué.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date de création.' }
      ],
      indexes: [],
      relations: ['1:N ChallengeParticipation (Cascade)']
    },
    {
      name: 'CHALLENGE_PARTICIPATION',
      icon: <Trophy className="w-4 h-4 text-emerald-400" />,
      desc: 'Suivi de l\'avancement d\'un utilisateur dans un défi spécifique. Gère la progression courante et le classement final.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID d\'inscription unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'L\'utilisateur participant.' },
        { name: 'challengeId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Le défi relevé.' },
        { name: 'progress', type: 'Int', details: 'Default 0', desc: 'Valeur courante de progression.' },
        { name: 'completed', type: 'Boolean', details: 'Default false', desc: 'Indique si l\'objectif a été atteint.' },
        { name: 'completedAt', type: 'DateTime?', details: 'Optionnel', desc: 'Date exacte de validation du défi.' },
        { name: 'rank', type: 'Int?', details: 'Optionnel', desc: 'Rang final obtenu dans le classement.' }
      ],
      indexes: ['userId + challengeId (unique)'],
      relations: ['N:1 User (Belongs to)', 'N:1 Challenge (Belongs to)']
    },
    {
      name: 'JOURNAL_ENTRY',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      desc: 'Journal intime quotidien. Permet de tracer le niveau d\'énergie physique, l\'intensité des pulsions d\'addiction et d\'exprimer ses ressentis.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique de la note.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'L\'auteur.' },
        { name: 'mood', type: 'Int', details: 'Scale 1-10', desc: 'Note d\'humeur déclarée (1=Exécrable, 10=Exceptionnelle).' },
        { name: 'energyLevel', type: 'Int', details: 'Scale 1-10', desc: 'Niveau d\'énergie globale.' },
        { name: 'urgeLevel', type: 'Int', details: 'Scale 0-10', desc: 'Force des pulsions ou tentations de rechuter.' },
        { name: 'notes', type: 'String?', details: 'Optionnel, Text', desc: 'Texte rédigé libre.' },
        { name: 'tags', type: 'String[]', details: 'Array of String tags', desc: 'Mots-clés associés (ex: ["stress", "solitude", "Victoire"]).' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date d\'écriture.' }
      ],
      indexes: ['userId + createdAt'],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'EDUCATION_MODULE',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      desc: 'Modules d\'éducation scientifique sur la physiologie de Kegel, l\'addiction, le sommeil et la dopamine. Conçus sous format bento interactif.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique du cours.' },
        { name: 'title', type: 'String', details: 'Required', desc: 'Titre principal du module.' },
        { name: 'description', type: 'String', details: 'Text long', desc: 'Résumé et objectifs du module.' },
        { name: 'content', type: 'Json', details: 'Array of steps', desc: 'Contenu structuré (vidéos, quiz, schémas neurologiques).' },
        { name: 'category', type: 'Enum', details: 'NEUROSCIENCE, KEGEL, NUTRITION, SLEEP, BREATHING, etc.', desc: 'Domaine d\'apprentissage.' },
        { name: 'level', type: 'Int', details: 'Range 1-5', desc: 'Niveau de complexité du cours.' },
        { name: 'requiredTier', type: 'Enum', details: 'FREE, PREMIUM, ELITE, etc.', desc: 'Niveau de privilèges requis pour y accéder.' },
        { name: 'order', type: 'Int', details: 'Required', desc: 'Ordre d\'affichage dans la liste.' },
        { name: 'estimatedMinutes', type: 'Int', details: 'Required', desc: 'Temps estimé de lecture en minutes.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date d\'ajout.' }
      ],
      indexes: [],
      relations: ['1:N UserEducationProgress (Cascade)']
    },
    {
      name: 'USER_EDUCATION_PROGRESS',
      icon: <BookMarked className="w-4 h-4 text-emerald-400" />,
      desc: 'Enregistre la complétion des modules scientifiques par utilisateur, avec score des quiz intégrés.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Utilisateur.' },
        { name: 'moduleId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Module de formation.' },
        { name: 'progressPercent', type: 'Int', details: 'Default 0 (0-100)', desc: 'Pourcentage de complétion.' },
        { name: 'completed', type: 'Boolean', details: 'Default false', desc: 'Vrai si le cours a été lu en entier.' },
        { name: 'completedAt', type: 'DateTime?', details: 'Optionnel', desc: 'Date de complétion finale.' },
        { name: 'quizScore', type: 'Int?', details: 'Optionnel', desc: 'Note obtenue au quiz final (en %).' }
      ],
      indexes: ['userId + moduleId (unique)'],
      relations: ['N:1 User (Belongs to)', 'N:1 EducationModule (Belongs to)']
    },
    {
      name: 'NOTIFICATION',
      icon: <Bell className="w-4 h-4 text-orange-400" />,
      desc: 'Table de file d\'attente de notifications push et in-app. Permet de planifier les rappels d\'entraînement Kegel, d\'exposition solaire, etc.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Destinataire.' },
        { name: 'type', type: 'Enum', details: 'PATTERN_ALERT, KEGEL_REMINDER, SLEEP_REMINDER, etc.', desc: 'Type de notification.' },
        { name: 'title', type: 'String', details: 'Required', desc: 'Titre de la notification.' },
        { name: 'body', type: 'String', details: 'Required', desc: 'Contenu textuel du message.' },
        { name: 'data', type: 'Json?', details: 'Optionnel', desc: 'Données applicatives supplémentaires (payload de routage).' },
        { name: 'read', type: 'Boolean', details: 'Default false', desc: 'Indique si l\'in-app a été lue.' },
        { name: 'actionTaken', type: 'Boolean', details: 'Default false', desc: 'Vrai si le bouton d\'action a été cliqué.' },
        { name: 'scheduledAt', type: 'DateTime?', details: 'Optionnel', desc: 'Moment planifié pour l\'envoi futur.' },
        { name: 'sentAt', type: 'DateTime?', details: 'Optionnel', desc: 'Moment d\'envoi réel.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date de création.' }
      ],
      indexes: ['userId + read + createdAt'],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'AD_REWARD',
      icon: <Tv className="w-4 h-4 text-[#00D9A5]" />,
      desc: 'Trace l\'historique des visionnages de publicités récompensées par l\'utilisateur pour lui allouer des points d\'XP ou de déblocage de features.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Spectateur.' },
        { name: 'adProvider', type: 'Enum', details: 'ADMOB, UNITY, IRONSOURCE', desc: 'Réseau publicitaire fournisseur.' },
        { name: 'adType', type: 'Enum', details: 'VIDEO, INTERSTITIAL, REWARDED', desc: 'Type de publicité.' },
        { name: 'watchedAt', type: 'DateTime', details: 'Default now()', desc: 'Moment du visionnage.' },
        { name: 'rewardPoints', type: 'Int', details: 'Required', desc: 'Points de Vitalité alloués immédiatement.' },
        { name: 'rewardTier', type: 'Enum?', details: 'PREMIUM_DAY, ELITE_DAY, FEATURE_UNLOCK', desc: 'Type de récompense temporaire éventuelle.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Log système.' }
      ],
      indexes: [],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'SUBSCRIPTION_TRANSACTION',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      desc: 'Contrats financiers d\'abonnement. Enregistre les paiements récurrents via cartes ou opérateurs locaux marocains (Inwi, Orange).',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID de transaction unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'L\'acheteur.' },
        { name: 'tier', type: 'Enum', details: 'PREMIUM, ELITE, ELITE_PREMIUM, ALPHA_ULTIMATE', desc: 'Abonnement acheté.' },
        { name: 'amount', type: 'Int', details: 'En centimes', desc: 'Montant du paiement (ex: 4900 pour 49.00 MAD).' },
        { name: 'currency', type: 'Enum', details: 'MAD, USD', desc: 'Devise monétaire (Dirham marocain par défaut).' },
        { name: 'paymentMethod', type: 'Enum', details: 'CREDIT_CARD, PAYPAL, CMI, INWI, ORANGE, CIH', desc: 'Passerelle de paiement choisie.' },
        { name: 'status', type: 'Enum', details: 'PENDING, SUCCESS, FAILED, REFUNDED', desc: 'État de la transaction financière.' },
        { name: 'transactionId', type: 'String', details: 'Unique', desc: 'Numéro de facture unique interne.' },
        { name: 'providerTransactionId', type: 'String?', details: 'Optionnel', desc: 'Identifiant fourni par la banque ou passerelle externe.' },
        { name: 'startedAt', type: 'DateTime', details: 'Required', desc: 'Heure de début de couverture de l\'abonnement.' },
        { name: 'expiresAt', type: 'DateTime', details: 'Required', desc: 'Heure d\'expiration de l\'abonnement.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Création.' }
      ],
      indexes: ['transactionId (unique)'],
      relations: ['N:1 User (Belongs to)']
    },
    {
      name: 'EXPERT',
      icon: <User className="w-4 h-4 text-[#E94560]" />,
      desc: 'Base de données des professionnels certifiés d\'ALPHA MAN (urologues, sexologues, neuroscientifiques, kinésithérapeutes).',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique du docteur.' },
        { name: 'name', type: 'String', details: 'Required', desc: 'Nom complet du praticien.' },
        { name: 'title', type: 'String', details: 'Required', desc: 'Titres académiques officiels (ex: "Professeur de Sexologie Clinique").' },
        { name: 'specialty', type: 'Enum', details: 'UROLOGY, PHYSIOTHERAPY, SEXOLOGY, etc.', desc: 'Spécialité reconnue par l\'ordre des médecins.' },
        { name: 'bio', type: 'String', details: 'Description longue', desc: 'Biographie et parcours professionnel.' },
        { name: 'avatarUrl', type: 'String', details: 'Required', desc: 'URL de la photo officielle.' },
        { name: 'credentials', type: 'Json', details: 'Array of qualifications', desc: 'Certificats de diplômes et accréditations officiels.' },
        { name: 'tier', type: 'Enum', details: 'KEGEL, NEUROSCIENCE, BOTH', desc: 'Niveau d\'intervention de l\'expert.' },
        { name: 'isActive', type: 'Boolean', details: 'Default true', desc: 'Indique si l\'expert répond activement.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date d\'enregistrement.' }
      ],
      indexes: [],
      relations: ['1:N ExpertContent (Cascade)']
    },
    {
      name: 'EXPERT_CONTENT',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      desc: 'Articles, vidéos ou podcasts rédigés ou validés par un expert médical pour assurer un contenu de haute crédibilité scientifique.',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique.' },
        { name: 'expertId', type: 'UUID (FK)', details: 'Cascade Delete', desc: 'Auteur expert affilié.' },
        { name: 'title', type: 'String', details: 'Required', desc: 'Titre de la publication.' },
        { name: 'type', type: 'Enum', details: 'ARTICLE, VIDEO, PODCAST, LIVE_QA', desc: 'Format de contenu.' },
        { name: 'content', type: 'Json', details: 'Required', desc: 'Corps éditorial rédigé ou liens CDN multimédia.' },
        { name: 'requiredTier', type: 'Enum', details: 'Default ELITE', desc: 'Grade d\'abonnement minimum requis.' },
        { name: 'durationMinutes', type: 'Int?', details: 'Optionnel', desc: 'Temps nécessaire estimé pour consommer l\'information.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Date de parution.' }
      ],
      indexes: [],
      relations: ['N:1 Expert (Belongs to)']
    },
    {
      name: 'SETTINGS',
      icon: <SettingsIcon className="w-4 h-4 text-gray-400" />,
      desc: 'Contient les préférences de configuration personnelle d\'un utilisateur (reminders heures d\'envoi, alertes de patterns IA et langue préférée).',
      fields: [
        { name: 'id', type: 'UUID (PK)', details: 'Default UUID', desc: 'ID unique.' },
        { name: 'userId', type: 'UUID (FK)', details: 'Unique, Cascade Delete', desc: 'L\'utilisateur détenteur.' },
        { name: 'notificationsEnabled', type: 'Boolean', details: 'Default true', desc: 'Interrupteur général des notifications push.' },
        { name: 'kegelReminders', type: 'Json', details: 'Schema: {enabled, times: []}', desc: 'Heures et activation des entraînements PC.' },
        { name: 'breathingReminders', type: 'Json', details: 'Schema: {enabled, times: []}', desc: 'Heures des sessions de respiration.' },
        { name: 'sunReminders', type: 'Json', details: 'Schema: {enabled, time}', desc: 'Rappel d\'exposition lumineuse.' },
        { name: 'sleepReminders', type: 'Json', details: 'Schema: {enabled, time}', desc: 'Heure recommandée d\'endormissement.' },
        { name: 'coldReminders', type: 'Json', details: 'Schema: {enabled, times: []}', desc: 'Rappels de douches froides.' },
        { name: 'patternAlertsEnabled', type: 'Boolean', details: 'Default true', desc: 'Indique si l\'IA peut scanner les déclencheurs de rechute.' },
        { name: 'communityNotifications', type: 'Boolean', details: 'Default true', desc: 'Notifications d\'interactions de clans.' },
        { name: 'challengeNotifications', type: 'Boolean', details: 'Default true', desc: 'Notifications de début de défis.' },
        { name: 'darkMode', type: 'Boolean', details: 'Default true (Always true)', desc: 'Design sombre imposé par l\'identité esthétique.' },
        { name: 'language', type: 'Enum', details: 'FR, AR, EN', desc: 'Langue de l\'application choisie par l\'utilisateur.' },
        { name: 'createdAt', type: 'DateTime', details: 'Default now()', desc: 'Création.' },
        { name: 'updatedAt', type: 'DateTime', details: 'Auto-updated', desc: 'Mise à jour.' }
      ],
      indexes: ['userId (unique)'],
      relations: ['1:1 User (Belongs to)']
    }
  ], []);

  const filteredEntities = useMemo(() => {
    if (!searchQuery) return entities;
    const query = searchQuery.toLowerCase();
    return entities.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.desc.toLowerCase().includes(query)
    );
  }, [entities, searchQuery]);

  const activeEntityData = useMemo(() => {
    return entities.find(e => e.name === selectedEntity) || entities[0];
  }, [entities, selectedEntity]);

  const rawPrismaSchema = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// ALPHA MAN FULL DATABASE SCHEMA (20 TABLES)
// ==========================================

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum SubscriptionTier {
  FREE
  PREMIUM
  ELITE
  ELITE_PREMIUM
  ALPHA_ULTIMATE
}

enum GoalType {
  BRAIN_REWIRE
  PERFORMANCE
  CONFIDENCE
  ALL
}

enum StruggleDuration {
  LESS_THAN_1_YEAR
  ONE_TO_THREE
  THREE_TO_FIVE
  FIVE_PLUS
}

enum TriggerType {
  EVENING_ALONE
  MORNING_WAKE
  STRESS
  BOREDOM
  SOCIAL_MEDIA
  WEEKEND
  OTHER
}

enum MoodState {
  EXHAUSTED
  ANXIOUS
  MOTIVATED
  HOPELESS
  DETERMINED
}

enum SleepQuality {
  POOR
  FAIR
  GOOD
  EXCELLENT
}

enum PatternType {
  STRESS
  BOREDOM
  LONELINESS
  EVENING
  MORNING
  SOCIAL_MEDIA
  WEEKEND
  OTHER
}

enum InterventionType {
  BREATHING
  COLD_SHOWER
  EXERCISE
  CALL_BUDDY
  JOURNAL
  OTHER
}

enum BreathType {
  BOX_BREATHING
  WIM_HOF
  FOUR_SEVEN_EIGHT
  ALPHA_BREATH
  OTHER
}

enum SupplementType {
  ZINC
  MAGNESIUM
  VITAMIN_D
  OMEGA3
  MACA
  ASHWAGANDHA
  OTHER
}

enum VitalityTransactionType {
  KEGEL_COMPLETE
  BREATHING_COMPLETE
  SUN_COMPLETE
  SLEEP_COMPLETE
  COLD_COMPLETE
  NUTRITION_LOGGED
  JOURNAL_COMPLETE
  PATTERN_RESISTED
  STREAK_BONUS_7
  STREAK_BONUS_30
  HELP_BUDDY
  AD_WATCHED
  LEVEL_UP
  CHALLENGE_COMPLETE
  REFERRAL
  PURCHASE
  REDEEM
}

enum ClanRole {
  MEMBER
  ELDER
  LEADER
}

enum ChallengeType {
  INDIVIDUAL
  CLAN
}

enum EducationCategory {
  NEUROSCIENCE
  KEGEL
  NUTRITION
  SLEEP
  BREATHING
  CONFIDENCE
  COMMUNICATION
}

enum NotificationType {
  PATTERN_ALERT
  KEGEL_REMINDER
  BREATHING_REMINDER
  SUN_REMINDER
  SLEEP_REMINDER
  STREAK_WARNING
  LEVEL_UP
  CHALLENGE_UPDATE
  COMMUNITY_MESSAGE
  SYSTEM
}

enum AdProvider {
  ADMOB
  UNITY
  IRONSOURCE
}

enum AdType {
  VIDEO
  INTERSTITIAL
  REWARDED
}

enum AdRewardTier {
  PREMIUM_DAY
  ELITE_DAY
  FEATURE_UNLOCK
}

enum Currency {
  MAD
  USD
}

enum PaymentMethod {
  CREDIT_CARD
  PAYPAL
  CMI
  INWI
  ORANGE
  CIH
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum ExpertSpecialty {
  UROLOGY
  PHYSIOTHERAPY
  SEXOLOGY
  FITNESS
  BIOHACKING
  YOGA
  ANDROLOGY
  PHYSIOTHERAPY_GENERAL
  RESEARCH
  ENDOCRINOLOGY
  SLEEP
  NEUROSCIENCE
  PSYCHIATRY
  NEUROFEEDBACK
  NEUROPHARMACOLOGY
  SNA
  NEUROPSYCHOLOGY
  NEUROPLASTICITY
  COACH
}

enum ExpertContentTier {
  KEGEL
  NEUROSCIENCE
  BOTH
}

enum ExpertContentType {
  ARTICLE
  VIDEO
  PODCAST
  LIVE_QA
}

enum AppLanguage {
  FR
  AR
  EN
}

model User {
  id                    String                    @id @default(uuid()) @db.Uuid
  email                 String                    @unique
  passwordHash          String
  phoneNumber           String?                   @unique
  displayName           String                    @db.VarChar(30)
  avatarUrl             String?
  dateOfBirth           DateTime?
  gender                Gender
  country               String                    @default("MA")
  language              String                    @default("fr")
  timezone              String                    @default("Africa/Casablanca")
  subscriptionTier      SubscriptionTier          @default(FREE)
  subscriptionExpiresAt DateTime?
  vitalityPoints        Int                       @default(0)
  currentLevel          Int                       @default(1)
  currentStreak         Int                       @default(0)
  longestStreak         Int                       @default(0)
  lastActiveAt          DateTime                  @default(now())
  createdAt             DateTime                  @default(now())
  updatedAt             DateTime                  @updatedAt
  isActive              Boolean                   @default(true)
  isVerified            Boolean                   @default(false)
  referralCode          String                    @unique
  referredById          String?                   @db.Uuid
  referredBy            User?                     @relation("UserReferralRelation", fields: [referredById], references: [id], onDelete: SetNull)
  referrals             User[]                    @relation("UserReferralRelation")

  profile               UserProfile?
  settings              Settings?
  patternTrackers       PatternTracker[]
  kegelSessions         KegelSession[]
  vitalityLogs          VitalityLog[]
  vitalityTransactions  VitalityTransaction[]
  clanMemberships       ClanMembership[]
  challengeParticipations ChallengeParticipation[]
  educationProgresses   UserEducationProgress[]
  journalEntries        JournalEntry[]
  notifications         Notification[]
  adRewards             AdReward[]
  subscriptionTransactions SubscriptionTransaction[]

  @@index([email])
  @@index([subscriptionTier])
  @@index([vitalityPoints])
  @@index([createdAt])
}

model UserProfile {
  id                     String           @id @default(uuid()) @db.Uuid
  userId                 String           @unique @db.Uuid
  user                   User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal                   GoalType
  struggleDuration       StruggleDuration
  primaryTriggers        TriggerType[]
  currentMood            MoodState
  sleepQuality           SleepQuality
  stressLevel            Int
  currentKegelLevel      Int              @default(1)
  kegelForceScore        Int              @default(0)
  kegelEnduranceSeconds  Int              @default(0)
  vitalityScore          Int              @default(0)
  patternRiskScore       Int              @default(50)
  onboardingCompleted    Boolean          @default(false)
  onboardingStep         Int              @default(1)
}

model PatternTracker {
  id                 String           @id @default(uuid()) @db.Uuid
  userId             String           @db.Uuid
  user               User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  patternType        PatternType
  triggerDetectedAt  DateTime
  riskScore          Int
  contextData        Json
  interventionSent   Boolean          @default(false)
  interventionType   InterventionType
  userResponded      Boolean          @default(false)
  relapseOccurred    Boolean          @default(false)
  createdAt          DateTime         @default(now())

  @@index([userId, createdAt])
  @@index([userId, patternType])
}

model KegelSession {
  id                  String    @id @default(uuid()) @db.Uuid
  userId              String    @db.Uuid
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  level               Int
  durationSeconds     Int
  contractionsCount   Int
  averageHoldSeconds  Int
  maxHoldSeconds      Int
  forceScore          Int
  completed           Boolean
  skipped             Boolean   @default(false)
  notes               String?   @db.Text
  scheduledAt         DateTime
  completedAt         DateTime?
  createdAt           DateTime  @default(now())

  @@index([userId, completedAt])
  @@index([userId, level])
}

model VitalityLog {
  id                  String           @id @default(uuid()) @db.Uuid
  userId              String           @db.Uuid
  user                User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  date                DateTime         @db.Date
  sleepScore          Int
  sleepHours          Float
  sleepBedTime        String?
  sleepWakeTime       String?
  sunScore            Int
  sunMinutes          Int
  sunTimestamp        DateTime?
  nutritionScore      Int
  nutritionLogged     Boolean
  supplementsTaken    SupplementType[]
  coldScore           Int
  coldDurationSeconds Int
  coldTemperature     Float?
  breathScore         Int
  breathMinutes       Int
  breathType          BreathType
  overallScore        Int
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  @@unique([userId, date])
}

model VitalityTransaction {
  id                 String                  @id @default(uuid()) @db.Uuid
  userId             String                  @db.Uuid
  user               User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount             Int
  type               VitalityTransactionType
  description        String
  relatedEntityType  String?
  relatedEntityId    String?                 @db.Uuid
  createdAt          DateTime                @default(now())

  @@index([userId, createdAt])
  @@index([userId, type])
}

model Level {
  id          Int      @id
  name        String   @unique
  minPoints   Int
  maxPoints   Int
  badgeUrl    String
  unlocks     Json
  description String
}

model Clan {
  id                      String           @id @default(uuid()) @db.Uuid
  name                    String           @unique
  description             String
  badgeUrl                String
  memberCount             Int              @default(0)
  totalVitalityPoints     BigInt           @default(0)
  weeklyChallengeProgress Int              @default(0)
  weeklyChallengeGoal     Int              @default(0)
  createdAt               DateTime         @default(now())
  members                 ClanMembership[]
}

model ClanMembership {
  id                 String    @id @default(uuid()) @db.Uuid
  userId             String    @db.Uuid
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  clanId             String    @db.Uuid
  clan               Clan      @relation(fields: [clanId], references: [id], onDelete: Cascade)
  role               ClanRole  @default(MEMBER)
  joinedAt           DateTime  @default(now())
  contributionPoints Int       @default(0)

  @@unique([userId, clanId])
}

model Challenge {
  id            String                  @id @default(uuid()) @db.Uuid
  name          String
  description   String
  type          ChallengeType
  startDate     DateTime
  endDate       DateTime
  goal          Json
  rewardPoints  Int
  rewardBadge   String?
  createdAt     DateTime                @default(now())
  participations ChallengeParticipation[]
}

model ChallengeParticipation {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  challengeId String    @db.Uuid
  challenge   Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  progress    Int       @default(0)
  completed   Boolean   @default(false)
  completedAt DateTime?
  rank        Int?

  @@unique([userId, challengeId])
}

model JournalEntry {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  mood        Int
  energyLevel Int
  urgeLevel   Int
  notes       String?  @db.Text
  tags        String[]
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
}

model EducationModule {
  id               String            @id @default(uuid()) @db.Uuid
  title            String
  description      String            @db.Text
  content          Json
  category         EducationCategory
  level            Int
  requiredTier     SubscriptionTier  @default(FREE)
  order            Int
  estimatedMinutes Int
  createdAt        DateTime          @default(now())
  progresses       UserEducationProgress[]
}

model UserEducationProgress {
  id              String          @id @default(uuid()) @db.Uuid
  userId          String          @db.Uuid
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  moduleId        String          @db.Uuid
  module          EducationModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progressPercent Int             @default(0)
  completed       Boolean         @default(false)
  completedAt     DateTime?
  quizScore       Int?

  @@unique([userId, moduleId])
}

model Notification {
  id           String           @id @default(uuid()) @db.Uuid
  userId       String           @db.Uuid
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type         NotificationType
  title        String
  body         String
  data         Json?
  read         Boolean          @default(false)
  actionTaken  Boolean          @default(false)
  scheduledAt  DateTime?
  sentAt       DateTime?
  createdAt    DateTime         @default(now())

  @@index([userId, read, createdAt])
}

model AdReward {
  id           String        @id @default(uuid()) @db.Uuid
  userId       String        @db.Uuid
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  adProvider   AdProvider
  adType       AdType
  watchedAt    DateTime      @default(now())
  rewardPoints Int
  rewardTier   AdRewardTier?
  createdAt    DateTime      @default(now())
}

model SubscriptionTransaction {
  id                     String            @id @default(uuid()) @db.Uuid
  userId                 String            @db.Uuid
  user                   User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier                   SubscriptionTier
  amount                 Int
  currency               Currency          @default(MAD)
  paymentMethod          PaymentMethod
  status                 TransactionStatus
  transactionId          String            @unique
  providerTransactionId  String?
  startedAt              DateTime
  expiresAt              DateTime
  createdAt              DateTime          @default(now())
}

model Expert {
  id          String            @id @default(uuid()) @db.Uuid
  name        String
  title       String
  specialty   ExpertSpecialty
  bio         String            @db.Text
  avatarUrl   String
  credentials Json
  tier        ExpertContentTier
  isActive    Boolean           @default(true)
  createdAt   DateTime          @default(now())
  contents    ExpertContent[]
}

model ExpertContent {
  id              String            @id @default(uuid()) @db.Uuid
  expertId        String            @db.Uuid
  expert          Expert            @relation(fields: [expertId], references: [id], onDelete: Cascade)
  title           String
  type            ExpertContentType
  content         Json
  requiredTier    SubscriptionTier  @default(ELITE)
  durationMinutes Int?
  createdAt       DateTime          @default(now())
}

model Settings {
  id                     String      @id @default(uuid()) @db.Uuid
  userId                 String      @unique @db.Uuid
  user                   User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  notificationsEnabled   Boolean     @default(true)
  kegelReminders         Json
  breathingReminders     Json
  sunReminders           Json
  sleepReminders         Json
  coldReminders          Json
  patternAlertsEnabled   Boolean     @default(true)
  communityNotifications Boolean     @default(true)
  challengeNotifications Boolean     @default(true)
  darkMode               Boolean     @default(true)
  language               AppLanguage @default(FR)
  createdAt              DateTime    @default(now())
  updatedAt              DateTime    @updatedAt
}`;

  const rawSeedTs = `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ALPHA MAN database seed...');

  // 1. SEED LEVELS (1 to 8)
  console.log('🛡️ Seeding Levels (1-8)...');
  const levels = [
    { id: 1, name: "Initié Égaré", minPoints: 0, maxPoints: 1000, badgeUrl: "https://s3.alphaman.app/badges/level1.png", description: "Le début de la quête. Prise de conscience et discipline.", unlocks: ["kegel_basic_1", "box_breathing", "journal_daily"] },
    { id: 2, name: "Combattant de l'Ombre", minPoints: 1001, maxPoints: 3000, badgeUrl: "https://s3.alphaman.app/badges/level2.png", description: "Résistance active aux déclencheurs. Entraînement de l'esprit.", unlocks: ["kegel_level_2", "wim_hof_breathing", "clan_join"] },
    { id: 3, name: "Gardien du Souffle", minPoints: 3001, maxPoints: 7000, badgeUrl: "https://s3.alphaman.app/badges/level3.png", description: "Contrôle du stress et douches froides.", unlocks: ["kegel_level_3", "cold_exposure_tracker", "challenges_individual"] },
    { id: 4, name: "Dompteur de l'Esprit", minPoints: 7001, maxPoints: 15000, badgeUrl: "https://s3.alphaman.app/badges/level4.png", description: "Recâblage cérébral avancé. Sommeil stable.", unlocks: ["kegel_endurance_mode", "ai_relapse_predictor", "expert_articles"] },
    { id: 5, name: "Guerrier Souverain", minPoints: 15001, maxPoints: 30000, badgeUrl: "https://s3.alphaman.app/badges/level5.png", description: "Niveau de testostérone et d'énergie physique optimal.", unlocks: ["clan_creation", "expert_live_qa", "custom_reminders"] },
    { id: 6, name: "Maître de la Vitalité", minPoints: 30001, maxPoints: 60000, badgeUrl: "https://s3.alphaman.app/badges/level6.png", description: "Biohacking d'élite, diète de guerrier, Kegel suprême.", unlocks: ["advanced_hormonal_analytics", "expert_one_on_one", "elite_badge"] },
    { id: 7, name: "Empereur Séminal", minPoints: 60001, maxPoints: 120000, badgeUrl: "https://s3.alphaman.app/badges/level7.png", description: "Transmutation d'énergie et concentration suprême.", unlocks: ["ultimate_neuroscience_course", "clan_wars_access", "vip_support"] },
    { id: 8, name: "ALPHA SUPRÊME", minPoints: 120001, maxPoints: 999999, badgeUrl: "https://s3.alphaman.app/badges/level8.png", description: "Discipline de fer éternelle, vitalité maximale sans limite.", unlocks: ["all_features_unlocked", "custom_badge_designer", "co-author_expert_articles"] }
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: level,
      create: level,
    });
  }

  // 2. SEED CLANS
  console.log('🦁 Seeding Clans...');
  const clans = [
    { name: "Lions de l'Atlas", description: "Le clan d'élite marocain. Dédié à la force physique, à l'exposition au froid, et à la fraternité indomptable.", badgeUrl: "https://s3.alphaman.app/clans/atlas_lions.png", weeklyChallengeGoal: 5000 },
    { name: "Faucons du Sahara", description: "Focus extrême sur la méditation profonde, la respiration solaire, et le stoïcisme du désert.", badgeUrl: "https://s3.alphaman.app/clans/desert_falcons.png", weeklyChallengeGoal: 4000 },
    { name: "Corsaires de Salé", description: "Force musculaire brute et exercices de Kegel de niveau Empereur.", badgeUrl: "https://s3.alphaman.app/clans/corsaires_sale.png", weeklyChallengeGoal: 6000 }
  ];

  for (const clan of clans) {
    await prisma.clan.upsert({
      where: { name: clan.name },
      update: { description: clan.description, badgeUrl: clan.badgeUrl, weeklyChallengeGoal: clan.weeklyChallengeGoal },
      create: { ...clan, memberCount: 0, totalVitalityPoints: BigInt(0), weeklyChallengeProgress: 0 }
    });
  }

  console.log('🎉 Seeding successfully completed!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());`;

  const rawMigrationSql = `CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'ELITE', 'ELITE_PREMIUM', 'ALPHA_ULTIMATE');
-- ... [Suite du script de migration DDL PostgreSQL] ...
-- Toutes les tables (User, UserProfile, PatternTracker, KegelSession, VitalityLog, etc.)
-- Sont créées avec des clés primaires UUID, suppressions en cascade (Cascade Delete) et index optimisés.

-- Indexation Haute Performance
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_tracker_userId_createdAt" ON "PatternTracker"("userId", "createdAt");
CREATE INDEX "idx_kegel_userId_completedAt" ON "KegelSession"("userId", "completedAt");
CREATE INDEX "idx_transaction_userId_createdAt" ON "VitalityTransaction"("userId", "createdAt");`;

  return (
    <div className="flex flex-col gap-6">
      {/* Tab controls */}
      <div className="flex bg-[#16213E]/40 border border-[#1A1A2E] p-1 rounded-2xl gap-1 self-start">
        {[
          { id: 'explorer', label: 'Explorateur de Modèles', icon: <Database className="w-4 h-4" /> },
          { id: 'prisma', label: 'Schéma Prisma', icon: <Terminal className="w-4 h-4" /> },
          { id: 'seed', label: 'Script Seed.ts', icon: <FileText className="w-4 h-4" /> },
          { id: 'sql', label: 'Raw Migration SQL', icon: <GitFork className="w-4 h-4" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-headline uppercase tracking-wider cursor-pointer transition-colors
              ${activeTab === t.id ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
            `}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER CONTENT */}

      {/* 1. INTERACTIVE MODEL EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fade-in_0.2s_ease-out]">
          
          {/* Sidebar selector */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une entité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F0F1A] border border-[#1A1A2E] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E94560] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredEntities.map(e => (
                <button
                  key={e.name}
                  onClick={() => setSelectedEntity(e.name)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all duration-150
                    ${selectedEntity === e.name
                      ? 'bg-[#E94560]/10 border-[#E94560] text-white'
                      : 'bg-[#16213E]/20 border-[#1A1A2E] text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {e.icon}
                    <span className="font-headline font-bold text-xs uppercase tracking-wider">{e.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedEntity === e.name ? 'translate-x-1 text-[#E94560]' : ''}`} />
                </button>
              ))}
              {filteredEntities.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500">Aucune entité trouvée.</div>
              )}
            </div>
          </div>

          {/* Details panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-6 flex flex-col gap-6 border-[#E94560]/20">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#1A1A2E] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#E94560]/10 border border-[#E94560]/30 rounded-xl">
                    {activeEntityData.icon}
                  </div>
                  <div>
                    <h3 className="font-headline font-extrabold text-lg text-white uppercase tracking-widest">{activeEntityData.name}</h3>
                    <p className="text-[11px] text-[#00D9A5] font-mono mt-0.5">@id @db.Uuid • CASCADE DELETION ENABLED</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <AlphaBadge variant="gold">Level 1-8 Stack</AlphaBadge>
                  <AlphaBadge variant="secondary">PostgreSQL</AlphaBadge>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[9px] font-mono text-[#E94560] uppercase tracking-widest font-extrabold block mb-1">Rôle Métier</span>
                <p className="text-xs text-[#C0C0C0] leading-relaxed bg-[#0F0F1A] border border-[#1A1A2E] p-3.5 rounded-xl">{activeEntityData.desc}</p>
              </div>

              {/* Relations & Indexes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Indexes block */}
                <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] font-headline font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Indexes requis
                  </span>
                  {activeEntityData.indexes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeEntityData.indexes.map((idx, i) => (
                        <span key={i} className="text-[10px] font-mono bg-[#0F0F1A] border border-[#1A1A2E] px-2 py-0.5 rounded text-[#8E8E93]">{idx}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-mono mt-1">Aucun index spécifique (autre que PK/UQ).</span>
                  )}
                </div>

                {/* Relations block */}
                <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] font-headline font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <GitFork className="w-3.5 h-3.5" /> Relations actives
                  </span>
                  <div className="flex flex-col gap-1 mt-1 text-[10px] font-mono text-[#8E8E93]">
                    {activeEntityData.relations.map((rel, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-[#E94560]" />
                        <span>{rel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attributes Table */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-[#E94560] uppercase tracking-widest font-extrabold">Attributs de l'entité ({activeEntityData.fields.length})</span>
                <div className="border border-[#1A1A2E] rounded-xl overflow-hidden bg-[#0F0F1A]">
                  <div className="grid grid-cols-12 bg-[#16213E]/40 border-b border-[#1A1A2E] p-3 text-[10px] font-headline font-bold text-[#8E8E93] uppercase">
                    <div className="col-span-4">Champ</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-5">Description</div>
                  </div>
                  <div className="flex flex-col max-h-[350px] overflow-y-auto">
                    {activeEntityData.fields.map((f, i) => (
                      <div key={i} className="grid grid-cols-12 border-b border-[#1A1A2E] last:border-0 p-3 text-[11px] hover:bg-white/[0.02] transition-colors items-center">
                        <div className="col-span-4 font-mono font-bold text-white flex items-center gap-1.5">
                          {f.name === 'id' || f.name === 'userId' ? <Key className="w-3 h-3 text-[#FFD700]" /> : null}
                          <span>{f.name}</span>
                        </div>
                        <div className="col-span-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono
                            ${f.type.includes('PK') || f.type.includes('FK')
                              ? 'bg-[#FFD700]/10 text-[#FFD700]'
                              : f.type === 'Int' || f.type === 'Float'
                              ? 'bg-blue-500/10 text-blue-400'
                              : f.type === 'Boolean'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-gray-500/10 text-[#8E8E93]'
                            }
                          `}>
                            {f.type}
                          </span>
                        </div>
                        <div className="col-span-5 text-[#8E8E93] text-xs leading-relaxed">
                          <div>{f.desc}</div>
                          {f.details && <div className="text-[9px] text-[#00D9A5] font-mono mt-0.5">{f.details}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </AlphaCard>
          </div>

        </div>
      )}

      {/* 2. PRISMA SCHEMA VIEW */}
      {activeTab === 'prisma' && (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
          <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl flex justify-between items-center">
            <div>
              <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">Fichier de Configuration schema.prisma</h4>
              <p className="text-xs text-[#8E8E93] mt-1">Le schéma central déclaratif complet pour l'ORM Prisma de l'application ALPHA MAN.</p>
            </div>
            <AlphaButton variant="secondary" onClick={() => handleCopy(rawPrismaSchema, 'schema-prisma')}>
              {copiedKey === 'schema-prisma' ? <Check className="w-4 h-4 mr-1 text-[#00D9A5]" /> : <Copy className="w-4 h-4 mr-1" />}
              {copiedKey === 'schema-prisma' ? 'Copié !' : 'Copier le Schéma'}
            </AlphaButton>
          </div>
          <pre className="p-5 bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl font-mono text-xs text-[#8E8E93] overflow-x-auto max-h-[550px] leading-relaxed">
            <code>{rawPrismaSchema}</code>
          </pre>
        </div>
      )}

      {/* 3. SEEDER VIEW */}
      {activeTab === 'seed' && (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
          <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl flex justify-between items-center">
            <div>
              <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">Script de Seeding prisma/seed.ts</h4>
              <p className="text-xs text-[#8E8E93] mt-1">Script TypeScript robuste qui peuple la base avec les Levels 1-8, les Clans initiaux, et les Experts certifiés.</p>
            </div>
            <AlphaButton variant="secondary" onClick={() => handleCopy(rawSeedTs, 'seed-ts')}>
              {copiedKey === 'seed-ts' ? <Check className="w-4 h-4 mr-1 text-[#00D9A5]" /> : <Copy className="w-4 h-4 mr-1" />}
              {copiedKey === 'seed-ts' ? 'Copié !' : 'Copier le TypeScript'}
            </AlphaButton>
          </div>
          <pre className="p-5 bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl font-mono text-xs text-[#8E8E93] overflow-x-auto max-h-[550px] leading-relaxed">
            <code>{rawSeedTs}</code>
          </pre>
        </div>
      )}

      {/* 4. SQL MIGRATION VIEW */}
      {activeTab === 'sql' && (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
          <div className="p-4 bg-[#16213E]/20 border border-[#1A1A2E] rounded-2xl flex justify-between items-center">
            <div>
              <h4 className="font-headline font-extrabold text-base text-white uppercase tracking-wider">Migration Initiale SQL</h4>
              <p className="text-xs text-[#8E8E93] mt-1">Déclaration DDL brute pour PostgreSQL. Utile pour initialiser Docker-Compose ou provisionner les serveurs AWS RDS / Cloud SQL.</p>
            </div>
            <AlphaButton variant="secondary" onClick={() => handleCopy(rawMigrationSql, 'migration-sql')}>
              {copiedKey === 'migration-sql' ? <Check className="w-4 h-4 mr-1 text-[#00D9A5]" /> : <Copy className="w-4 h-4 mr-1" />}
              {copiedKey === 'migration-sql' ? 'Copié !' : 'Copier le SQL'}
            </AlphaButton>
          </div>
          <pre className="p-5 bg-[#0F0F1A] border border-[#1A1A2E] rounded-2xl font-mono text-xs text-[#8E8E93] overflow-x-auto max-h-[550px] leading-relaxed">
            <code>{rawMigrationSql}</code>
          </pre>
        </div>
      )}

    </div>
  );
}
