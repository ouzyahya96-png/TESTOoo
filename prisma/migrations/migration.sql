-- ============================================================================
-- ALPHA MAN INITIAL POSTGRESQL SCHEMA MIGRATION
-- Aesthetic Slate Theme • High-Performance Indexing
-- Target Environment: AWS RDS / GCP Cloud SQL (PostgreSQL 15+)
-- ============================================================================

-- Create Enums
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'ELITE', 'ELITE_PREMIUM', 'ALPHA_ULTIMATE');
CREATE TYPE "GoalType" AS ENUM ('BRAIN_REWIRE', 'PERFORMANCE', 'CONFIDENCE', 'ALL');
CREATE TYPE "StruggleDuration" AS ENUM ('LESS_THAN_1_YEAR', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS');
CREATE TYPE "TriggerType" AS ENUM ('EVENING_ALONE', 'MORNING_WAKE', 'STRESS', 'BOREDOM', 'SOCIAL_MEDIA', 'WEEKEND', 'OTHER');
CREATE TYPE "MoodState" AS ENUM ('EXHAUSTED', 'ANXIOUS', 'MOTIVATED', 'HOPELESS', 'DETERMINED');
CREATE TYPE "SleepQuality" AS ENUM ('POOR', 'FAIR', 'GOOD', 'EXCELLENT');
CREATE TYPE "PatternType" AS ENUM ('STRESS', 'BOREDOM', 'LONELINESS', 'EVENING', 'MORNING', 'SOCIAL_MEDIA', 'WEEKEND', 'OTHER');
CREATE TYPE "InterventionType" AS ENUM ('BREATHING', 'COLD_SHOWER', 'EXERCISE', 'CALL_BUDDY', 'JOURNAL', 'OTHER');
CREATE TYPE "BreathType" AS ENUM ('BOX_BREATHING', 'WIM_HOF', 'FOUR_SEVEN_EIGHT', 'ALPHA_BREATH', 'OTHER');
CREATE TYPE "SupplementType" AS ENUM ('ZINC', 'MAGNESIUM', 'VITAMIN_D', 'OMEGA3', 'MACA', 'ASHWAGANDHA', 'OTHER');
CREATE TYPE "VitalityTransactionType" AS ENUM ('KEGEL_COMPLETE', 'BREATHING_COMPLETE', 'SUN_COMPLETE', 'SLEEP_COMPLETE', 'COLD_COMPLETE', 'NUTRITION_LOGGED', 'JOURNAL_COMPLETE', 'PATTERN_RESISTED', 'STREAK_BONUS_7', 'STREAK_BONUS_30', 'HELP_BUDDY', 'AD_WATCHED', 'LEVEL_UP', 'CHALLENGE_COMPLETE', 'REFERRAL', 'PURCHASE', 'REDEEM');
CREATE TYPE "ClanRole" AS ENUM ('MEMBER', 'ELDER', 'LEADER');
CREATE TYPE "ChallengeType" AS ENUM ('INDIVIDUAL', 'CLAN');
CREATE TYPE "EducationCategory" AS ENUM ('NEUROSCIENCE', 'KEGEL', 'NUTRITION', 'SLEEP', 'BREATHING', 'CONFIDENCE', 'COMMUNICATION');
CREATE TYPE "NotificationType" AS ENUM ('PATTERN_ALERT', 'KEGEL_REMINDER', 'BREATHING_REMINDER', 'SUN_REMINDER', 'SLEEP_REMINDER', 'STREAK_WARNING', 'LEVEL_UP', 'CHALLENGE_UPDATE', 'COMMUNITY_MESSAGE', 'SYSTEM');
CREATE TYPE "AdProvider" AS ENUM ('ADMOB', 'UNITY', 'IRONSOURCE');
CREATE TYPE "AdType" AS ENUM ('VIDEO', 'INTERSTITIAL', 'REWARDED');
CREATE TYPE "AdRewardTier" AS ENUM ('PREMIUM_DAY', 'ELITE_DAY', 'FEATURE_UNLOCK');
CREATE TYPE "Currency" AS ENUM ('MAD', 'USD');
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PAYPAL', 'CMI', 'INWI', 'ORANGE', 'CIH');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE "ExpertSpecialty" AS ENUM ('UROLOGY', 'PHYSIOTHERAPY', 'SEXOLOGY', 'FITNESS', 'BIOHACKING', 'YOGA', 'ANDROLOGY', 'PHYSIOTHERAPY_GENERAL', 'RESEARCH', 'ENDOCRINOLOGY', 'SLEEP', 'NEUROSCIENCE', 'PSYCHIATRY', 'NEUROFEEDBACK', 'NEUROPHARMACOLOGY', 'SNA', 'NEUROPSYCHOLOGY', 'NEUROPLASTICITY', 'COACH');
CREATE TYPE "ExpertContentTier" AS ENUM ('KEGEL', 'NEUROSCIENCE', 'BOTH');
CREATE TYPE "ExpertContentType" AS ENUM ('ARTICLE', 'VIDEO', 'PODCAST', 'LIVE_QA');
CREATE TYPE "AppLanguage" AS ENUM ('FR', 'AR', 'EN');

-- 1. Create User Table
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(50) UNIQUE,
    "displayName" VARCHAR(30) NOT NULL,
    "avatarUrl" TEXT,
    "dateOfBirth" TIMESTAMP,
    "gender" "Gender" NOT NULL,
    "country" VARCHAR(5) DEFAULT 'MA' NOT NULL,
    "language" VARCHAR(5) DEFAULT 'fr' NOT NULL,
    "timezone" VARCHAR(100) DEFAULT 'Africa/Casablanca' NOT NULL,
    "subscriptionTier" "SubscriptionTier" DEFAULT 'FREE' NOT NULL,
    "subscriptionExpiresAt" TIMESTAMP,
    "vitalityPoints" INTEGER DEFAULT 0 NOT NULL,
    "currentLevel" INTEGER DEFAULT 1 NOT NULL,
    "currentStreak" INTEGER DEFAULT 0 NOT NULL,
    "longestStreak" INTEGER DEFAULT 0 NOT NULL,
    "lastActiveAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "isVerified" BOOLEAN DEFAULT FALSE NOT NULL,
    "referralCode" VARCHAR(100) UNIQUE NOT NULL,
    "referredById" UUID,
    CONSTRAINT "fk_user_referred_by" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL
);

-- 2. Create UserProfile Table
CREATE TABLE "UserProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "goal" "GoalType" NOT NULL,
    "struggleDuration" "StruggleDuration" NOT NULL,
    "primaryTriggers" "TriggerType"[] NOT NULL,
    "currentMood" "MoodState" NOT NULL,
    "sleepQuality" "SleepQuality" NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "currentKegelLevel" INTEGER DEFAULT 1 NOT NULL,
    "kegelForceScore" INTEGER DEFAULT 0 NOT NULL,
    "kegelEnduranceSeconds" INTEGER DEFAULT 0 NOT NULL,
    "vitalityScore" INTEGER DEFAULT 0 NOT NULL,
    "patternRiskScore" INTEGER DEFAULT 50 NOT NULL,
    "onboardingCompleted" BOOLEAN DEFAULT FALSE NOT NULL,
    "onboardingStep" INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT "fk_profile_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 3. Create PatternTracker Table
CREATE TABLE "PatternTracker" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "patternType" "PatternType" NOT NULL,
    "triggerDetectedAt" TIMESTAMP NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "contextData" JSONB NOT NULL,
    "interventionSent" BOOLEAN DEFAULT FALSE NOT NULL,
    "interventionType" "InterventionType" NOT NULL,
    "userResponded" BOOLEAN DEFAULT FALSE NOT NULL,
    "relapseOccurred" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_tracker_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 4. Create KegelSession Table
CREATE TABLE "KegelSession" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "contractionsCount" INTEGER NOT NULL,
    "averageHoldSeconds" INTEGER NOT NULL,
    "maxHoldSeconds" INTEGER NOT NULL,
    "forceScore" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "skipped" BOOLEAN DEFAULT FALSE NOT NULL,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP NOT NULL,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_kegel_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 5. Create VitalityLog Table
CREATE TABLE "VitalityLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "sleepScore" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "sleepBedTime" VARCHAR(50),
    "sleepWakeTime" VARCHAR(50),
    "sunScore" INTEGER NOT NULL,
    "sunMinutes" INTEGER NOT NULL,
    "sunTimestamp" TIMESTAMP,
    "nutritionScore" INTEGER NOT NULL,
    "nutritionLogged" BOOLEAN NOT NULL,
    "supplementsTaken" "SupplementType"[] NOT NULL,
    "coldScore" INTEGER NOT NULL,
    "coldDurationSeconds" INTEGER NOT NULL,
    "coldTemperature" DOUBLE PRECISION,
    "breathScore" INTEGER NOT NULL,
    "breathMinutes" INTEGER NOT NULL,
    "breathType" "BreathType" NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_vitality_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_user_date" UNIQUE ("userId", "date")
);

-- 6. Create VitalityTransaction Table
CREATE TABLE "VitalityTransaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "VitalityTransactionType" NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "relatedEntityType" VARCHAR(100),
    "relatedEntityId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_transaction_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 7. Create Level Table
CREATE TABLE "Level" (
    "id" INTEGER PRIMARY KEY,
    "name" VARCHAR(100) UNIQUE NOT NULL,
    "minPoints" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "badgeUrl" TEXT NOT NULL,
    "unlocks" JSONB NOT NULL,
    "description" TEXT NOT NULL
);

-- 8. Create Clan Table
CREATE TABLE "Clan" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "badgeUrl" TEXT NOT NULL,
    "memberCount" INTEGER DEFAULT 0 NOT NULL,
    "totalVitalityPoints" BIGINT DEFAULT 0 NOT NULL,
    "weeklyChallengeProgress" INTEGER DEFAULT 0 NOT NULL,
    "weeklyChallengeGoal" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Create ClanMembership Table
CREATE TABLE "ClanMembership" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "clanId" UUID NOT NULL,
    "role" "ClanRole" DEFAULT 'MEMBER' NOT NULL,
    "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "contributionPoints" INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT "fk_membership_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_membership_clan" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_user_clan" UNIQUE ("userId", "clanId")
);

-- 10. Create Challenge Table
CREATE TABLE "Challenge" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "goal" JSONB NOT NULL,
    "rewardPoints" INTEGER NOT NULL,
    "rewardBadge" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Create ChallengeParticipation Table
CREATE TABLE "ChallengeParticipation" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "challengeId" UUID NOT NULL,
    "progress" INTEGER DEFAULT 0 NOT NULL,
    "completed" BOOLEAN DEFAULT FALSE NOT NULL,
    "completedAt" TIMESTAMP,
    "rank" INTEGER,
    CONSTRAINT "fk_participation_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_participation_challenge" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_user_challenge" UNIQUE ("userId", "challengeId")
);

-- 12. Create JournalEntry Table
CREATE TABLE "JournalEntry" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "mood" INTEGER NOT NULL,
    "energyLevel" INTEGER NOT NULL,
    "urgeLevel" INTEGER NOT NULL,
    "notes" TEXT,
    "tags" VARCHAR(100)[] NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_journal_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 13. Create EducationModule Table
CREATE TABLE "EducationModule" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "category" "EducationCategory" NOT NULL,
    "level" INTEGER NOT NULL,
    "requiredTier" "SubscriptionTier" DEFAULT 'FREE' NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. Create UserEducationProgress Table
CREATE TABLE "UserEducationProgress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "progressPercent" INTEGER DEFAULT 0 NOT NULL,
    "completed" BOOLEAN DEFAULT FALSE NOT NULL,
    "completedAt" TIMESTAMP,
    "quizScore" INTEGER,
    CONSTRAINT "fk_edu_progress_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_edu_progress_module" FOREIGN KEY ("moduleId") REFERENCES "EducationModule"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_user_module" UNIQUE ("userId", "moduleId")
);

-- 15. Create Notification Table
CREATE TABLE "Notification" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN DEFAULT FALSE NOT NULL,
    "actionTaken" BOOLEAN DEFAULT FALSE NOT NULL,
    "scheduledAt" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_notification_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 16. Create AdReward Table
CREATE TABLE "AdReward" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "adProvider" "AdProvider" NOT NULL,
    "adType" "AdType" NOT NULL,
    "watchedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "rewardPoints" INTEGER NOT NULL,
    "rewardTier" "AdRewardTier",
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_ad_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 17. Create SubscriptionTransaction Table
CREATE TABLE "SubscriptionTransaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" DEFAULT 'MAD' NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "transactionId" VARCHAR(255) UNIQUE NOT NULL,
    "providerTransactionId" VARCHAR(255),
    "startedAt" TIMESTAMP NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_sub_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 18. Create Expert Table
CREATE TABLE "Expert" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "specialty" "ExpertSpecialty" NOT NULL,
    "bio" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "credentials" JSONB NOT NULL,
    "tier" "ExpertContentTier" NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 19. Create ExpertContent Table
CREATE TABLE "ExpertContent" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "expertId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "ExpertContentType" NOT NULL,
    "content" JSONB NOT NULL,
    "requiredTier" "SubscriptionTier" DEFAULT 'ELITE' NOT NULL,
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_content_expert" FOREIGN KEY ("expertId") REFERENCES "Expert"("id") ON DELETE CASCADE
);

-- 20. Create Settings Table
CREATE TABLE "Settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "notificationsEnabled" BOOLEAN DEFAULT TRUE NOT NULL,
    "kegelReminders" JSONB NOT NULL,
    "breathingReminders" JSONB NOT NULL,
    "sunReminders" JSONB NOT NULL,
    "sleepReminders" JSONB NOT NULL,
    "coldReminders" JSONB NOT NULL,
    "patternAlertsEnabled" BOOLEAN DEFAULT TRUE NOT NULL,
    "communityNotifications" BOOLEAN DEFAULT TRUE NOT NULL,
    "challengeNotifications" BOOLEAN DEFAULT TRUE NOT NULL,
    "darkMode" BOOLEAN DEFAULT TRUE NOT NULL,
    "language" "AppLanguage" DEFAULT 'FR' NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fk_settings_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ============================================================================
-- HIGH-PERFORMANCE INDEXING (OWASP & Query Optimization Guidelines)
-- ============================================================================

CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_user_subscriptionTier" ON "User"("subscriptionTier");
CREATE INDEX "idx_user_vitalityPoints" ON "User"("vitalityPoints");
CREATE INDEX "idx_user_createdAt" ON "User"("createdAt");

CREATE INDEX "idx_tracker_userId_createdAt" ON "PatternTracker"("userId", "createdAt");
CREATE INDEX "idx_tracker_userId_patternType" ON "PatternTracker"("userId", "patternType");

CREATE INDEX "idx_kegel_userId_completedAt" ON "KegelSession"("userId", "completedAt");
CREATE INDEX "idx_kegel_userId_level" ON "KegelSession"("userId", "level");

CREATE INDEX "idx_transaction_userId_createdAt" ON "VitalityTransaction"("userId", "createdAt");
CREATE INDEX "idx_transaction_userId_type" ON "VitalityTransaction"("userId", "type");

CREATE INDEX "idx_journal_userId_createdAt" ON "JournalEntry"("userId", "createdAt");

CREATE INDEX "idx_notification_userId_read_createdAt" ON "Notification"("userId", "read", "createdAt");
