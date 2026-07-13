// @ts-nocheck
import { PrismaClient, Gender, SubscriptionTier, GoalType, StruggleDuration, TriggerType, MoodState, SleepQuality, ClanRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ALPHA MAN database seed...');

  // 1. SEED LEVELS (1 to 8)
  console.log('🛡️ Seeding Levels (1-8)...');
  const levels = [
    {
      id: 1,
      name: "Initié Égaré",
      minPoints: 0,
      maxPoints: 1000,
      badgeUrl: "https://s3.alphaman.app/badges/level1.png",
      description: "Le début de la quête. Vous prenez conscience de vos faiblesses et décidez de reprendre le contrôle.",
      unlocks: ["kegel_basic_1", "box_breathing", "journal_daily"]
    },
    {
      id: 2,
      name: "Combattant de l'Ombre",
      minPoints: 1001,
      maxPoints: 3000,
      badgeUrl: "https://s3.alphaman.app/badges/level2.png",
      description: "Vous commencez à résister activement aux déclencheurs. Votre discipline se forge dans l'obscurité.",
      unlocks: ["kegel_level_2", "wim_hof_breathing", "clan_join"]
    },
    {
      id: 3,
      name: "Gardien du Souffle",
      minPoints: 3001,
      maxPoints: 7000,
      badgeUrl: "https://s3.alphaman.app/badges/level3.png",
      description: "La respiration n'a plus de secret pour vous. Votre maîtrise mentale s'affirme face au stress.",
      unlocks: ["kegel_level_3", "cold_exposure_tracker", "challenges_individual"]
    },
    {
      id: 4,
      name: "Dompteur de l'Esprit",
      minPoints: 7001,
      maxPoints: 15000,
      badgeUrl: "https://s3.alphaman.app/badges/level4.png",
      description: "Le recâblage neuronal s'accélère. Vos habitudes de sommeil et d'exercice se stabilisent.",
      unlocks: ["kegel_endurance_mode", "ai_relapse_predictor", "expert_articles"]
    },
    {
      id: 5,
      name: "Guerrier Souverain",
      minPoints: 15001,
      maxPoints: 30000,
      badgeUrl: "https://s3.alphaman.app/badges/level5.png",
      description: "Votre niveau d'énergie physique est sans précédent. Vous inspirez les autres membres de la communauté.",
      unlocks: ["clan_creation", "expert_live_qa", "custom_reminders"]
    },
    {
      id: 6,
      name: "Maître de la Vitalité",
      minPoints: 30001,
      maxPoints: 60000,
      badgeUrl: "https://s3.alphaman.app/badges/level6.png",
      description: "Une testostérone naturelle optimisée par le soleil, le froid, la nutrition et les exercices de Kegel avancés.",
      unlocks: ["advanced_hormonal_analytics", "expert_one_on_one", "elite_badge"]
    },
    {
      id: 7,
      name: "Empereur Séminal",
      minPoints: 60001,
      maxPoints: 120000,
      badgeUrl: "https://s3.alphaman.app/badges/level7.png",
      description: "Votre force d'intention et votre charisme rayonnent. Vous avez dompté l'énergie sexuelle pour la transmuter.",
      unlocks: ["ultimate_neuroscience_course", "clan_wars_access", "vip_support"]
    },
    {
      id: 8,
      name: "ALPHA SUPRÊME",
      minPoints: 120001,
      maxPoints: 999999,
      badgeUrl: "https://s3.alphaman.app/badges/level8.png",
      description: "Le sommet de l'évolution ALPHA MAN. Discipline absolue, esprit inébranlable, vitalité maximale.",
      unlocks: ["all_features_unlocked", "custom_badge_designer", "co-author_expert_articles"]
    }
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: {
        name: level.name,
        minPoints: level.minPoints,
        maxPoints: level.maxPoints,
        badgeUrl: level.badgeUrl,
        unlocks: level.unlocks,
        description: level.description,
      },
      create: {
        id: level.id,
        name: level.name,
        minPoints: level.minPoints,
        maxPoints: level.maxPoints,
        badgeUrl: level.badgeUrl,
        unlocks: level.unlocks,
        description: level.description,
      },
    });
  }
  console.log(`✅ Upserted ${levels.length} Levels.`);

  // 2. SEED INITIAL CLANS
  console.log('🦁 Seeding Clans...');
  const clans = [
    {
      name: "Lions de l'Atlas",
      description: "Le clan d'élite marocain. Dédié à la force pure, à l'exposition au froid de l'Atlas, et à la fraternité indomptable.",
      badgeUrl: "https://s3.alphaman.app/clans/atlas_lions.png",
      weeklyChallengeGoal: 5000,
    },
    {
      name: "Faucons du Sahara",
      description: "Inspirés de la résilience du désert. Focus extrême sur la méditation, la respiration solaire, et le minimalisme.",
      badgeUrl: "https://s3.alphaman.app/clans/desert_falcons.png",
      weeklyChallengeGoal: 4000,
    },
    {
      name: "Corsaires de Salé",
      description: "Un clan axé sur l'action et le dynamisme physique. Défis de force musculaire et entraînement Kegel de niveau Empereur.",
      badgeUrl: "https://s3.alphaman.app/clans/corsaires_sale.png",
      weeklyChallengeGoal: 6000,
    }
  ];

  for (const clan of clans) {
    await prisma.clan.upsert({
      where: { name: clan.name },
      update: {
        description: clan.description,
        badgeUrl: clan.badgeUrl,
        weeklyChallengeGoal: clan.weeklyChallengeGoal,
      },
      create: {
        name: clan.name,
        description: clan.description,
        badgeUrl: clan.badgeUrl,
        weeklyChallengeGoal: clan.weeklyChallengeGoal,
        memberCount: 0,
        totalVitalityPoints: BigInt(0),
        weeklyChallengeProgress: 0,
      }
    });
  }
  console.log(`✅ Upserted ${clans.length} Clans.`);

  // 3. SEED EXPERTS
  console.log('🩺 Seeding Experts...');
  const experts = [
    {
      name: "Dr. Amine El Mansouri",
      title: "Urologue & Andrologue Spécialiste",
      specialty: "UROLOGY",
      bio: "Ancien interne du CHU de Rabat, le Dr. El Mansouri s'intéresse particulièrement à l'impact thérapeutique de l'entraînement Kegel chez l'homme jeune.",
      avatarUrl: "https://s3.alphaman.app/experts/amine_mansouri.png",
      credentials: ["Doctorat en Médecine (Rabat)", "Spécialisation Urologie Paris V", "Auteur de 12 publications scientifiques"],
      tier: "KEGEL",
      isActive: true,
    },
    {
      name: "Yassine Guerrier",
      title: "Biohackeur & Expert Neurosciences",
      specialty: "NEUROSCIENCE",
      bio: "Yassine étudie les mécanismes dopaminergiques de l'addiction et aide les hommes à restructurer leurs circuits de récompense (Rewiring cérébral).",
      avatarUrl: "https://s3.alphaman.app/experts/yassine_guerrier.png",
      credentials: ["M.Sc. Neurosciences Cognitives (UCL)", "Coach certifié en biohacking", "Spécialiste de l'exposition au froid"],
      tier: "NEUROSCIENCE",
      isActive: true,
    }
  ];

  for (const expert of experts) {
    // We search by name
    const existing = await prisma.expert.findFirst({
      where: { name: expert.name }
    });

    if (existing) {
      await prisma.expert.update({
        where: { id: existing.id },
        data: {
          title: expert.title,
          specialty: expert.specialty as any,
          bio: expert.bio,
          avatarUrl: expert.avatarUrl,
          credentials: expert.credentials,
          tier: expert.tier as any,
          isActive: expert.isActive,
        }
      });
    } else {
      await prisma.expert.create({
        data: {
          name: expert.name,
          title: expert.title,
          specialty: expert.specialty as any,
          bio: expert.bio,
          avatarUrl: expert.avatarUrl,
          credentials: expert.credentials,
          tier: expert.tier as any,
          isActive: expert.isActive,
        }
      });
    }
  }
  console.log(`✅ Upserted ${clans.length} Experts.`);

  console.log('🎉 Database Seeding Completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during Database Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
