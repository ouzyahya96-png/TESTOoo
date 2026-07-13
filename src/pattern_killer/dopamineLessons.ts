/**
 * ALPHA MAN - Dopamine Reset Protocol Education Lessons
 * Scientifically backed curriculum for the 90-day neuro-rewire journey.
 */

export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DopamineLesson {
  day: number;
  phase: 'DETOX' | 'REWIRE' | 'REBUILD' | 'ALPHA';
  title: string;
  duration: number; // estimated reading time in minutes
  content: string;
  scientificCitation: string;
  quiz: LessonQuiz[];
  exercises: string[];
  rewardPoints: number;
  badgeReward?: string;
  message: string;
}

// Pre-defined educational templates for generating intermediate days programmatically
const LESSON_THEMES = {
  DETOX: [
    {
      title: "La tempête dopaminergique initiale",
      content: "Durant les premiers jours de detox, votre cerveau réclame sa dose habituelle de dopamine rapide. Cette sensation de vide ou d'irritabilité n'est pas un manque réel, mais la baisse brutale de l'activité du récepteur D2. C'est le signal que la guérison a commencé.",
      citation: "Volkow, N. D., et al. (2011). 'Addiction: Beyond dopamine reward circuitry'. PNAS.",
      questions: [
        {
          question: "Qu'est-ce qui provoque l'irritabilité initiale en detox ?",
          options: [
            "La chute d'activité des récepteurs de dopamine D2",
            "Une diminution du flux sanguin hépatique",
            "Une baisse de l'adrénaline"
          ],
          correctIndex: 0,
          explanation: "La chute brutale de dopamine laisse temporairement les récepteurs D2 sous-activés, provoquant de l'irritabilité."
        }
      ]
    },
    {
      title: "Comprendre les micro-déclencheurs",
      content: "Un micro-déclencheur peut être une simple notification, la fatigue du soir ou l'ennui après une journée chargée. Identifier ces déclencheurs vous permet d'interposer un espace de conscience avant l'action impulsive.",
      citation: "Duhigg, C. (2012). 'The Power of Habit'. Random House.",
      questions: [
        {
          question: "Quel est le but de l'identification des micro-déclencheurs ?",
          options: [
            "Supprimer toutes les notifications définitivement",
            "Créer un espace de conscience entre le stimulus et la réaction",
            "Augmenter la fréquence cardiaque"
          ],
          correctIndex: 1,
          explanation: "Créer un espace de conscience permet de court-circuiter la réponse automatique pavlovienne."
        }
      ]
    }
  ],
  REWIRE: [
    {
      title: "La plasticité mésolimbique",
      content: "Votre circuit de récompense mésolimbique commence à se restructurer. En redirigeant consciemment l'énergie sexuelle et l'influx nerveux vers l'entraînement physique ou la respiration profonde, vous forgez de nouveaux circuits neuronaux.",
      citation: "Nestler, E. J. (2013). 'Cellular basis of memory for addiction'. Dialogues in Clinical Neuroscience.",
      questions: [
        {
          question: "Quel est le rôle du circuit mésolimbique ?",
          options: [
            "La régulation de la température corporelle",
            "L'évaluation de la valeur de récompense et la motivation",
            "Le contrôle des mouvements réflexes"
          ],
          correctIndex: 1,
          explanation: "Le circuit mésolimbique évalue la motivation et associe des stimuli à des sensations de plaisir."
        }
      ]
    },
    {
      title: "Le rôle de l'amygdale dans l'impulsion",
      content: "L'amygdale gère vos réponses au stress. Lorsque vous êtes stressé, elle court-circuite votre cortex préfrontal rationnel et pousse vers des comportements compensatoires rapides (dopamine artificielle).",
      citation: "Arnsten, A. F. (2009). 'Stress signalling pathways that impair prefrontal cortex structure and function'. Nature Reviews Neuroscience.",
      questions: [
        {
          question: "Comment le stress affecte-t-il le cortex préfrontal ?",
          options: [
            "Il l'active pour prendre de meilleures décisions",
            "Il altère temporairement ses fonctions de contrôle rationnel",
            "Il augmente la mémoire de travail"
          ],
          correctIndex: 1,
          explanation: "Sous stress aigu, l'amygdale inhibe le cortex préfrontal pour privilégier des réponses instinctives rapides."
        }
      ]
    }
  ],
  REBUILD: [
    {
      title: "Restauration des récepteurs dopaminergiques",
      content: "Après 30 jours de discipline stricte, les récepteurs D2 sous-régulés commencent à se multiplier de nouveau. Vous commencez à ressentir de la joie et de la motivation pour des activités simples : lecture, nature, conversations.",
      citation: "Wang, G. J., et al. (2004). 'Similarity between obesity and drug addiction as assessed by translational imaging'. Journal of Addictive Diseases.",
      questions: [
        {
          question: "Quel est l'effet de la multiplication des récepteurs D2 ?",
          options: [
            "Une augmentation de l'anxiété sociale",
            "Une sensibilité accrue aux plaisirs simples de la vie quotidienne",
            "Une diminution de la force musculaire"
          ],
          correctIndex: 1,
          explanation: "Plus de récepteurs D2 disponibles signifie que de faibles taux de dopamine naturelle suffisent à procurer de la satisfaction."
        }
      ]
    },
    {
      title: "L'énergie sexuelle transcendée",
      content: "Dans cette phase, l'énergie masculine accumulée n'est plus ressentie comme un fardeau ou une tension insoutenable, mais comme un moteur de création, d'ambition et de charisme naturel au quotidien.",
      citation: "Hill, N. (1937). 'Think and Grow Rich' (Chapter on Sex Transmutation).",
      questions: [
        {
          question: "Qu'est-ce que la transmutation de l'énergie ?",
          options: [
            "La suppression pure et simple de l'énergie vitale",
            "La redirection de l'influx d'excitation vers des objectifs créatifs ou physiques",
            "Le fait d'éviter tout effort physique"
          ],
          correctIndex: 1,
          explanation: "Transmuter consiste à canaliser l'influx d'excitation brute vers des actions créatrices ou d'entraînement d'élite."
        }
      ]
    }
  ]
};

/**
 * Génère de manière exhaustive et dynamique la leçon parfaite pour n'importe quel jour de la timeline 1-90+.
 * Garantit qu'aucun jour n'est vide et que tous disposent de leçons scientifiques de haute qualité,
 * avec des cas d'études spécifiques pour les jalons clés comme le Jour 1, 3, 7, 14, 21, 30, 60, 90.
 */
export function getLessonForDay(day: number): DopamineLesson {
  let phase: 'DETOX' | 'REWIRE' | 'REBUILD' | 'ALPHA' = 'DETOX';
  let title = "";
  let duration = 3;
  let content = "";
  let scientificCitation = "";
  let message = "";
  let rewardPoints = 50;
  let badgeReward: string | undefined = undefined;
  let exercises: string[] = ["Respiration 4-7-8 (3x/jour)", "Journal de gratitude (soir)"];

  // Determine phase
  if (day <= 7) {
    phase = 'DETOX';
    rewardPoints = day === 1 ? 100 : day === 3 ? 200 : day === 7 ? 500 : 50;
    if (day === 7) badgeReward = "SURVIVOR";
  } else if (day <= 30) {
    phase = 'REWIRE';
    rewardPoints = day === 14 ? 1000 : day === 21 ? 1500 : day === 30 ? 3000 : 75;
    if (day === 14) badgeReward = "REWIRER";
    if (day === 30) badgeReward = "MONTH WARRIOR";
    exercises = ["Kegel Niveau 1 (10 reps x3)", "Respiration Box Breathing (4 min)", "Journaling de force"];
  } else if (day <= 90) {
    phase = 'REBUILD';
    rewardPoints = day === 60 ? 5000 : day === 90 ? 10000 : 100;
    if (day === 60) badgeReward = "REBUILDER";
    if (day === 90) badgeReward = "ALPHA";
    exercises = ["Kegel Niveau 3 (20 reps avec contractions de 5s)", "Choc Thermique (Douche froide 2 min)", "Planification de vision hebdomadaire"];
  } else {
    phase = 'ALPHA';
    rewardPoints = 150;
    if (day === 180) badgeReward = "ALPHA LEGEND";
    exercises = ["Kegel Niveau 5 (Contractions dynamiques)", "Cold Plunge 3 min", "Session de mentorat de clan"];
  }

  // 1. MILESTONES CUSTOM CONTENT
  if (day === 1) {
    title = "Le Grand Départ — L'Engagement Souverain";
    duration = 3;
    content = "Aujourd'hui marque le jour zéro de la reconquête de votre attention. Votre cerveau est actuellement saturé par les stimuli numériques hyper-stimulants. En décidant d'entamer ce protocole, vous imposez un veto conscient à vos circuits automatiques. Le chemin sera rude, mais vous commencez à libérer votre force d'attention.";
    scientificCitation = "Hyman, S. E., et al. (2006). 'Addiction and the brain's reward system'. Annual Review of Neuroscience.";
    message = "Le début est le plus dur. Chaque seconde d'abstinence est une brique posée pour ton empire personnel. Tu es plus fort.";
  } 
  else if (day === 3) {
    title = "Starving the Pattern — Comment tuer un neurone";
    duration = 4;
    content = "Chaque fois que tu résistes, tu affaiblis le neurone. Chaque fois que tu cèdes, tu le renforces. Il n'y a pas de match nul. C'est mathématique. Le cerveau fonctionne par renforcement synaptique. Plus tu utilises une voie neuronale, plus elle devient forte. Moins tu l'utilises, plus elle s'atrophie. Ce n'est pas de la simple volonté, c'est de la biologie pure.";
    scientificCitation = "Hebb, D. O. (1949). 'The Organization of Behavior'. Wiley & Sons.";
    message = "Ton cerveau commence à comprendre le nouveau rythme. Garde la ligne de défense intacte.";
  }
  else if (day === 7) {
    title = "Libération Synaptique — Premier Cap de Detox";
    duration = 5;
    content = "Une semaine complète. Votre cortex préfrontal commence à reprendre l'ascendant sur le striatum, la zone des impulsions primitives. Le manque peut culminer aujourd'hui sous forme d'ennui ou d'insomnie. C'est la réaction naturelle de votre système qui réclame de la dopamine facile. Offrez-lui du sport intense à la place.";
    scientificCitation = "Koob, G. F., & Volkow, N. D. (2016). 'Neurobiology of addiction'. Lancet Psychiatry.";
    message = "Une semaine. Tu as prouvé par des actes réels que tu possèdes l'autodiscipline nécessaire. Félicitations pour le badge Survivor !";
  }
  else if (day === 14) {
    title = "La Voie Mésolimbique & Récompense";
    duration = 6;
    content = "Deux semaines. Vos récepteurs dopaminergiques se régulent lentement. Vous commencez à remarquer une hausse subtile de votre concentration et de votre clarté d'esprit. Votre circuit mésolimbique commence à réassocier la satisfaction à des efforts réels (sport, apprentissage, discipline) plutôt qu'aux pixels passifs.";
    scientificCitation = "Nestler, E. J. (2013). 'Cellular basis of memory for addiction'. Dialogues in Clinical Neuroscience.";
    message = "Deux semaines. Ton cerveau est en train de tracer de nouvelles routes neuronales de succès. Reçois ton badge REWIRER !";
  }
  else if (day === 21) {
    title = "Le Piège de l'Amygdale & Gestion du Stress";
    duration = 5;
    content = "À 21 jours, l'ancien comportement s'atrophie mais l'amygdale reste hyper-réactive au stress. En cas de coup de fatigue, votre inconscient recherchera le chemin d'évitement le plus court. Utilisez la respiration en boîte (Box Breathing) pour saturer vos poumons d'oxygène et forcer votre système nerveux parasympathique à se calmer.";
    scientificCitation = "Arnsten, A. F. (2009). 'Stress signalling pathways that impair prefrontal cortex structure'. Nature Reviews Neuroscience.";
    message = "Trois semaines. L'ancien pattern est à genoux, affaibli de jour en jour. Ne lui redonnez pas vie.";
  }
  else if (day === 30) {
    title = "Cortex Préfrontal — Le Siège de la Souveraineté";
    duration = 7;
    content = "Un mois complet. Les IRM fonctionnelles montrent qu'après 30 jours sans hyper-stimulation dopaminergique artificielle, la matière grise du cortex préfrontal s'épaissit de nouveau. Vos fonctions exécutives — contrôle de soi, planification, régulation émotionnelle — fonctionnent à plein régime. Vous n'êtes plus l'esclave de vos impulsions.";
    scientificCitation = "Goldstein, R. Z., & Volkow, N. D. (2011). 'Dysfunction of the prefrontal cortex in addiction'. Nature Reviews Neuroscience.";
    message = "Un mois de souveraineté. Tu as franchi la frontière invisible. Tu es l'architecte de ta vie. Badge MONTH WARRIOR débloqué !";
  }
  else if (day === 60) {
    title = "Confiance Sexuelle & Énergie Restaurée";
    duration = 8;
    content = "Soixante jours. Votre sensibilité globale à la dopamine s'est recalibrée à son niveau optimal d'origine. Votre réactivité sexuelle s'ancre désormais uniquement dans le réel, l'intimité tangible et l'interaction humaine. Votre niveau de testostérone libre s'est stabilisé, offrant un charisme et une voix plus profonde.";
    scientificCitation = "Abler, B., et al. (2006). 'Dopaminergic reward system is activated by anticipation'. NeuroImage.";
    message = "Deux mois. Tu construis l'homme magnétique et souverain que tu as juré d'incarner. Badge REBUILDER acquis.";
  }
  else if (day === 90) {
    title = "État d'ALPHA — Intégration Masculine Absolue";
    duration = 10;
    content = "Quatre-vingt-dix jours. La boucle de réadaptation dopaminergique est complète. Ce qui demandait de la lutte et de l'effort au Jour 1 est devenu une habitude naturelle, une identité solide. Vous ne résistez plus à l'impulsion : l'impulsion a perdu son pouvoir sur vous. Vous êtes libre, centré et souverain.";
    scientificCitation = "Volkow, N. D., et al. (2016). 'Neurobiologic Advances in Addiction'. New England Journal of Medicine.";
    message = "Tu as traversé l'enfer de la detox et tu es ressorti ALPHA. La résistance est devenue ton identité de vie. Reçois l'honneur ultime.";
  }
  // 2. PROGRAMMATIC INTERMEDIATE LESSONS GENERATION (FOR FULL 90-DAYS COVERAGE)
  else {
    const list = LESSON_THEMES[phase as keyof typeof LESSON_THEMES] || LESSON_THEMES.DETOX;
    const themeIdx = day % list.length;
    const theme = list[themeIdx];
    
    title = `Jour ${day} : ${theme.title}`;
    content = `Étape de progression du Jour ${day}. ${theme.content}`;
    scientificCitation = theme.citation;
    message = `Continue sur ta lancée du Jour ${day}. Chaque jour compte !`;
  }

  // Quiz questions builder
  const quiz: LessonQuiz[] = [
    {
      question: "Pourquoi est-il crucial de comprendre le renforcement synaptique ?",
      options: [
        "Pour comprendre que chaque victoire affaiblit physiquement l'ancien pattern",
        "Pour augmenter la force physique pure des bras",
        "Pour dormir plus longtemps l'après-midi"
      ],
      correctIndex: 0,
      explanation: "Moins une voie neuronale est sollicitée, plus ses connexions synaptiques se dégradent (loi de Hebb)."
    },
    {
      question: "Quel organe court-circuite le contrôle rationnel lors d'un stress intense ?",
      options: [
        "Le foie",
        "L'amygdale cérébrale",
        "Le cervelet"
      ],
      correctIndex: 1,
      explanation: "L'amygdale déclenche la réaction de stress aigu et inhibe temporairement le cortex préfrontal rationnel."
    },
    {
      question: "Quelle est la durée maximale d'un pic d'impulsion si on ne l'alimente pas ?",
      options: [
        "Seulement 10 minutes",
        "Plus de 12 heures",
        "Une semaine entière"
      ],
      correctIndex: 0,
      explanation: "Biologiquement, la décharge d'adrénaline et de dopamine liée à l'impulsion s'estompe naturellement après 10 minutes d'inactivité ou de substitution."
    }
  ];

  return {
    day,
    phase,
    title,
    duration,
    content,
    scientificCitation,
    quiz,
    exercises,
    rewardPoints,
    badgeReward,
    message
  };
}
