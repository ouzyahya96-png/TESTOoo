/**
 * ALPHA MAN - Education Cérébrale Interactive Lessons
 * Complete 40-lesson scientific curriculum across 5 major focus categories.
 */

export interface ContentBlock {
  type: 'header' | 'text' | 'quote' | 'citation' | 'illustration' | 'interactive' | 'quiz';
  text?: string; // used for header, text, quote, citation
  author?: string; // used for quote
  imageUrl?: string; // used for illustration (acts as key for custom animated SVG)
  caption?: string; // used for illustration
  
  // Interactive properties
  interactiveType?: 'slider' | 'toggle' | 'tap-to-reveal' | 'neuron-pulse' | 'brain-3d' | 'dopamine-graph' | 'brain-heatmap';
  label?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  explanation?: string;
  revealText?: string;
  items?: Array<{ id: string; label: string; detail: string; x?: number; y?: number; before?: string; after?: string }>;

  // Quiz properties
  question?: string;
  options?: string[];
  correctAnswer?: number; // 0-indexed index of correct option
}

export interface Lesson {
  id: string;
  category: 'NEUROSCIENCE' | 'PATTERN_ADDICTION' | 'KEGEL_PHYSIOLOGY' | 'VITALITY_ENERGY' | 'CONFIDENCE_INTIMACY';
  categoryLabel: string;
  level: number;
  title: string;
  subtitle: string;
  durationMinutes: number;
  requiredTier: 'FREE' | 'PREMIUM';
  rewardPoints: number;
  unlockCondition: 'previous_completed' | 'none';
  content: ContentBlock[];
}

export const EDUCATION_LESSONS: Lesson[] = [
  // ==========================================
  // CATEGORY 1: NEUROSCIENCE FONDAMENTALE (10 leçons)
  // ==========================================
  {
    id: 'neuro-01',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 1,
    title: 'Le cerveau de la récompense — Voie mésolimbique',
    subtitle: 'Comprendre l\'autoroute du désir inconscient',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'none',
    content: [
      { type: 'header', text: 'La Voie Mésolimbique' },
      { type: 'text', text: 'Ton cerveau a un circuit ultra-performant façonné par des millions d\'années d\'évolution : le circuit de la récompense. Sa fonction originelle est d\'assurer ta survie en te poussant vers la nourriture, la reproduction et l\'apprentissage protecteur. Au cœur de ce circuit se trouve la voie mésolimbique, un faisceau de neurones qui relie l\'Aire Tegmentale Ventrale (VTA) au Nucleus Accumbens.' },
      { type: 'illustration', imageUrl: 'brain_reward_pathway', caption: 'La voie mésolimbique — Connexion neuronale directe de la VTA au Nucleus Accumbens' },
      { type: 'text', text: 'Lorsqu\'un signal prometteur de survie ou de reproduction apparaît, la VTA décharge de la dopamine dans le Nucleus Accumbens, créant une intense tension d\'anticipation. La pornographie moderne et les réseaux sociaux exploitent ce mécanisme en envoyant des stimuli hyper-stimulants, inondant le cerveau d\'une intensité artificielle sans commune mesure avec la réalité.' },
      { 
        type: 'interactive', 
        interactiveType: 'slider',
        label: 'Dopamine naturelle vs artificielle (Unités arbitraires)',
        min: 10,
        max: 500,
        defaultValue: 100,
        leftLabel: 'Interaction réelle (100)',
        rightLabel: 'Stimulus artificiel (500)',
        explanation: 'Une activité saine et réelle libère environ 100 unités de dopamine. Les stimuli numériques hyper-stimulants court-circuitent la barrière naturelle en déversant jusqu\'à 500 unités d\'un coup, épuisant instantanément vos récepteurs D2.'
      },
      { type: 'quote', text: 'Le circuit de la récompense a été conçu pour nous faire chercher des ressources rares. Face à une abondance artificielle infinie, il devient notre propre prison.', author: 'Dr. Robert Lustig' },
      { type: 'citation', text: 'Volkow, N. D., Wise, R. A., & Baler, R. (2011). The dopamine motive system: implications for drug and food addiction. Nature Reviews Neuroscience, 12(11), 639-651.' },
      {
        type: 'quiz',
        question: 'Quelle est la fonction biologique originelle du circuit de récompense ?',
        options: [
          'Assurer la survie en poussant vers des activités vitales (nourriture, reproduction)',
          'Permettre de dormir profondément sans interruption',
          'Analyser des équations mathématiques complexes'
        ],
        correctAnswer: 0,
        explanation: 'Le circuit de récompense s\'active pour nous motiver à accomplir des actions vitales de préservation et de reproduction de l\'espèce.'
      }
    ]
  },
  {
    id: 'neuro-02',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 1,
    title: 'La dopamine — Ce n\'est pas du plaisir, c\'est du désir',
    subtitle: 'La molécule de l\'anticipation et de la motivation',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Mythe du Plaisir' },
      { type: 'text', text: 'Contrairement aux idées reçues, la dopamine n\'est pas la molécule du plaisir ressenti. Le plaisir est principalement orchestré par les endorphines et les récepteurs opioïdes endogènes. La dopamine, elle, est le neurotransmetteur du DESIR, de la motivation, de l\'anticipation et de la quête.' },
      { type: 'illustration', imageUrl: 'dopamine_vs_pleasure', caption: 'Dopamine (Désir et quête) vs Endorphine (Satisfaction et accomplissement)' },
      { type: 'text', text: 'La dopamine s\'active au maximum AVANT d\'obtenir la récompense, au moment de l\'attente et de la recherche. C\'est elle qui te pousse à scroller de manière obsessionnelle ou à chercher un stimulus de plus en plus fort. Une fois l\'action accomplie, la dopamine s\'effondre sous son niveau de base, laissant place à un vide chimique qui t\'incite à recommencer.' },
      {
        type: 'interactive',
        interactiveType: 'dopamine-graph',
        label: 'Le pic de dopamine suivi du crash compensateur',
        explanation: 'Plus le pic de dopamine est élevé et rapide, plus le crash sous la ligne de base est profond. C\'est ce crash qui crée le sentiment d\'anxiété, d\'irritabilité et de manque immédiat juste après la rechute.'
      },
      { type: 'quote', text: 'La dopamine ne dit pas "C\'est bon !". Elle dit "Trouve-en plus, tout de suite, ou tu vas souffrir !".', author: 'Dr. Anna Lembke, Stanford University' },
      { type: 'citation', text: 'Berridge, K. C., & Robinson, T. E. (2016). Liking, wanting, and the incentive-sensitization theory of addiction. American Psychologist, 71(8), 670.' },
      {
        type: 'quiz',
        question: 'À quel moment la libération de dopamine est-elle la plus élevée ?',
        options: [
          'Pendant le sommeil paradoxal réparateur',
          'Lors de l\'anticipation et de la recherche du stimulus (avant l\'obtention)',
          'Une heure après avoir terminé l\'activité'
        ],
        correctAnswer: 1,
        explanation: 'La dopamine est la molécule de la quête. Son pic survient durant la phase de désir et d\'anticipation, pas après l\'action.'
      }
    ]
  },
  {
    id: 'neuro-03',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 2,
    title: 'L\'amygdale — Pourquoi le stress te contrôle',
    subtitle: 'Le centre d\'alarme émotionnel du cerveau limbique',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Amygdale en Alerte' },
      { type: 'text', text: 'L\'amygdale est une structure en forme d\'amande située profondément dans ton lobe temporal. C\'est le détecteur de menaces de ton cerveau. Face au stress de la vie moderne (pression professionnelle, solitude, manque de sommeil), l\'amygdale s\'active fortement et déclenche une réaction de stress.' },
      { type: 'illustration', imageUrl: 'amygdala_response', caption: 'L\'amygdale et la transition impulsive sous stress' },
      { type: 'text', text: 'Lorsque ton amygdale est hyperactive, elle court-circuite ton cortex préfrontal (le centre rationnel). Ton cerveau perçoit cela comme une urgence de survie et cherche désespérément un soulagement chimique rapide pour atténuer l\'inconfort. C\'est là que le pattern automatique de rechute s\'active : ton cerveau cherche la dopamine artificielle pour "anesthésier" le signal de détresse de l\'amygdale.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Court-circuit de l\'Amygdale',
        leftLabel: 'Stress non-géré (Impulsion active)',
        rightLabel: 'Respiration consciente (Contrôle PFC)',
        explanation: 'En appliquant 2 minutes de respiration ventrale ou d\'exposition au froid, tu actives le système parasympathique, ce qui calme immédiatement l\'amygdale et restitue le contrôle rationnel à ton cortex préfrontal.'
      },
      { type: 'quote', text: 'Sous stress aigu, nous ne nous élevons pas au niveau de nos attentes ; nous tombons au niveau de nos systèmes entraînés.', author: 'Archiloque, Poète Grec' },
      { type: 'citation', text: 'Arnsten, A. F. (2009). Stress signalling pathways that impair prefrontal cortex structure and function. Nature Reviews Neuroscience, 10(6), 410-422.' },
      {
        type: 'quiz',
        question: 'Comment l\'activation de l\'amygdale influence-t-elle tes choix ?',
        options: [
          'Elle te rend plus réfléchi et patient',
          'Elle inhibe le cortex préfrontal et te pousse vers des comportements compensatoires rapides',
          'Elle augmente la clarté visuelle et la mémoire sémantique'
        ],
        correctAnswer: 1,
        explanation: 'En situation de stress ou de menace perçue, l\'amygdale inhibe le cortex préfrontal rationnel au profit de réactions impulsives d\'apaisement immédiat.'
      }
    ]
  },
  {
    id: 'neuro-04',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 2,
    title: 'Le cortex préfrontal — Ton pilote automatique',
    subtitle: 'Le siège de la volonté, du veto et de la souveraineté',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Forteresse du Contrôle' },
      { type: 'text', text: 'Le cortex préfrontal (PFC) est la zone du cerveau située directement derrière ton front. C\'est la structure cérébrale qui a connu l\'évolution la plus récente. Elle gère la planification à long terme, la prise de décision éthique, la projection de soi et, surtout, la capacité d\'inhibition : le pouvoir de dire NON à une impulsion immédiate.' },
      { type: 'illustration', imageUrl: 'prefrontal_control', caption: 'Le Cortex Préfrontal régulant les impulsions du Striatum' },
      { type: 'text', text: 'Dans une addiction ou un pattern compulsif, la connexion physique entre le PFC et le circuit de récompense est affaiblie. Le striatum (zone des pulsions) prend le pas sur le PFC. Heureusement, le PFC se comporte comme un muscle : plus tu exerces ton pouvoir de veto conscient (en résistant aux impulsions), plus la matière grise de ton PFC s\'épaissit et se renforce.' },
      {
        type: 'interactive',
        interactiveType: 'neuron-pulse',
        label: 'Renforcer la connexion PFC-Striatum',
        explanation: 'Appuie sur le bouton pour envoyer une impulsion électrique de contrôle du Cortex Préfrontal vers le circuit de récompense. Chaque veto conscient fortifie cette gaine de myéline.'
      },
      { type: 'quote', text: 'La liberté n\'est pas l\'absence d\'engagements, mais la capacité de choisir et de s\'engager dans ce qui est le mieux pour nous.', author: 'Paulo Coelho' },
      { type: 'citation', text: 'Goldstein, R. Z., & Volkow, N. D. (2011). Dysfunction of the prefrontal cortex in addiction: neuroimaging findings and clinical implications. Nature Reviews Neuroscience, 12(11), 652-669.' },
      {
        type: 'quiz',
        question: 'Quel rôle joue le cortex préfrontal face à une impulsion impulsive ?',
        options: [
          'Il l\'accélère pour économiser de l\'énergie physique',
          'Il exerce un pouvoir de veto conscient en évaluant les conséquences futures',
          'Il stocke l\'eau nécessaire au métabolisme des neurones'
        ],
        correctAnswer: 1,
        explanation: 'Le cortex préfrontal est le siège des fonctions exécutives. C\'est lui qui permet de projeter l\'avenir et d\'inhiber les réactions immédiates.'
      }
    ]
  },
  {
    id: 'neuro-05',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 3,
    title: 'L\'hippocampe — La mémoire qui te ment',
    subtitle: 'Comment ton cerveau réécrit l\'histoire des plaisirs passés',
    durationMinutes: 6,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Piège du Rappel Euphorisant' },
      { type: 'text', text: 'L\'hippocampe, situé juste à côté de l\'amygdale, est responsable de la consolidation de tes souvenirs à long terme. Dans un cerveau habitué à la surstimulation dopaminergique, l\'hippocampe crée des chemins mnésiques extrêmement stables associés aux indices visuels ou comportementaux de ton ancienne habitude.' },
      { type: 'illustration', imageUrl: 'hippocampus_memory', caption: 'L\'Hippocampe et la réécriture sélective des souvenirs de rechute' },
      { type: 'text', text: 'Lorsque tu as une impulsion, l\'hippocampe s\'associe à la dopamine pour créer un "rappel euphorisant" (euphoric recall). Il te fait revivre le souvenir en effaçant sélectivement les aspects négatifs (sentiment de honte, fatigue, perte d\'énergie, culpabilité) pour ne te présenter que la décharge initiale de plaisir artificiel. Ton cerveau te ment littéralement.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'La réalité derrière le mirage mnésique',
        revealText: 'Le mirage de la mémoire montre : "Le soulagement immédiat". La réalité physique oubliée après : "La chute de testostérone libre, la perte de concentration de 48h, l\'effondrement de la confiance et le sentiment de culpabilité profonde".'
      },
      { type: 'quote', text: 'Le souvenir est un poète, il ne fait pas de l\'histoire.', author: 'Paul Géraldy' },
      { type: 'citation', text: 'Koob, G. F., & Volkow, N. D. (2016). Neurobiology of addiction. Neuropsychopharmacology, 41(1), 378-401.' },
      {
        type: 'quiz',
        question: 'Qu\'est-ce que le "rappel euphorisant" (euphoric recall) ?',
        options: [
          'La capacité de se souvenir de toutes les formules de mathématiques',
          'Une réécriture sélective de la mémoire qui filtre les conséquences négatives pour ne garder que le plaisir initial',
          'Une augmentation de l\'audition sous l\'influence de l\'excitation'
        ],
        correctAnswer: 1,
        explanation: 'L\'euphoric recall est un biais de mémoire induit où le cerveau occulte la détresse post-rechute pour glorifier uniquement l\'excitation pré-rechute.'
      }
    ]
  },
  {
    id: 'neuro-06',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 3,
    title: 'Neuroplasticité — Ton cerveau peut changer',
    subtitle: 'La science de la reprogrammation synaptique durable',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Loi de Hebb' },
      { type: 'text', text: 'La neuroplasticité est la capacité de ton cerveau à modifier sa structure physique et ses connexions synaptiques en fonction de tes pensées, de ton environnement et surtout de tes actions répétées. Longtemps, on a cru que le cerveau adulte était figé. C\'est faux. Tu as le pouvoir de reconstruire ton architecture cérébrale.' },
      { type: 'illustration', imageUrl: 'neuroplasticity_growth', caption: 'Élagage synaptique de l\'ancien pattern vs renforcement de la discipline' },
      { type: 'text', text: 'La règle fondamentale de la neuroplasticité est la loi de Hebb : "Des neurones qui s\'activent ensemble se connectent ensemble." À l\'inverse, des neurones qui cessent de s\'activer ensemble se séparent (élagage synaptique). En refusant d\'alimenter l\'ancienne boucle d\'addiction, le réseau physique qui la supporte s\'étiole, s\'amincit, puis s\'éteint.' },
      {
        type: 'interactive',
        interactiveType: 'brain-heatmap',
        label: 'Avant / Après 90 jours de reprogrammation',
        items: [
          { id: '1', label: 'Jour 1', detail: 'Activité cérébrale : Hypo-frontalité critique, récepteurs D2 désensibilisés, suractivité amygdalienne.', before: 'Rouge intense (Limbique)', after: 'Gris terne (PFC éteint)' },
          { id: '2', label: 'Jour 90', detail: 'Activité cérébrale : Cortex préfrontal dense et actif, régulation de la dopamine restaurée, amygdale sereine.', before: 'Vert calme (Limbique)', after: 'Bleu électrique éclatant (PFC fort)' }
        ]
      },
      { type: 'quote', text: 'L\'homme peut, par choix et par effort, sculpter son propre cerveau.', author: 'Santiago Ramón y Cajal, Prix Nobel de Médecine' },
      { type: 'citation', text: 'Pascual-Leone, A., et al. (2005). The plastic human brain cortex. Annual Review of Neuroscience, 28, 377-401.' },
      {
        type: 'quiz',
        question: 'Que stipule la loi de Hebb concernant les connexions synaptiques ?',
        options: [
          'Les neurones meurent tous après l\'âge de 25 ans',
          'Des neurones qui s\'activent de manière synchrone et répétée renforcent leur liaison physique',
          'La mémoire n\'utilise que 10% du volume cérébral total'
        ],
        correctAnswer: 1,
        explanation: 'La loi de Hebb montre que la répétition d\'un signal électrique renforce la liaison physique entre deux neurones, créant des autoroutes de pensée solides.'
      }
    ]
  },
  {
    id: 'neuro-07',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 3,
    title: 'Le système nerveux autonome — Combat ou fuite',
    subtitle: 'Sympathique vs Parasympathique : l\'équilibre de l\'influx',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Volant d\'Inertie Interne' },
      { type: 'text', text: 'Ton système nerveux autonome contrôle tes fonctions involontaires. Il se divise en deux branches complémentaires : le système Sympathique (accélérateur, combat ou fuite, cortisol, adrénaline) et le système Parasympathique (frein, repos, digestion, régénération, clarté).' },
      { type: 'illustration', imageUrl: 'autonomic_system', caption: 'L\'équilibre de la balance végétative autonome' },
      { type: 'text', text: 'L\'addiction moderne maintient ton système Sympathique dans une suractivité chronique (excitation, vigilance stressée, anxiété). Pour reprendre le contrôle d\'une impulsion, tu dois couper le flux sympathique et forcer l\'activation du système Parasympathique. C\'est l\'art de l\'apaisement physiologique immédiat.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Activer la Balance Végétative',
        leftLabel: 'Sympathique (Excité, Impulsif)',
        rightLabel: 'Parasympathique (Calme, Souverain)',
        explanation: 'En appliquant 4 cycles de respiration ventrale avec expiration prolongée, tu forces l\'activation du système parasympathique, ce qui abaisse ta fréquence cardiaque et stoppe la tension d\'impulsion.'
      },
      { type: 'quote', text: 'Contrôler sa respiration, c\'est prendre les rênes de son système nerveux autonome.', author: 'Dr. Andrew Huberman, Stanford' },
      { type: 'citation', text: 'Porges, S. W. (2007). The polyvagal perspective. Biological Psychology, 74(2), 116-143.' },
      {
        type: 'quiz',
        question: 'Quelle branche du système nerveux autonome devez-vous activer pour calmer une pulsion ?',
        options: [
          'Le système sympathique pour accélérer l\'action',
          'Le système parasympathique pour calmer l\'excitation physiologique',
          'Le système nerveux périphérique moteur uniquement'
        ],
        correctAnswer: 1,
        explanation: 'Le système parasympathique ralentit la fréquence cardiaque, réduit la tension artérielle et éteint l\'urgence physiologique de la pulsion.'
      }
    ]
  },
  {
    id: 'neuro-08',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 3,
    title: 'Le nerf vague — Ton super-pouvoir caché',
    subtitle: 'La ligne d\'urgence physique pour éteindre le feu intérieur',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Autoroute Viscérale' },
      { type: 'text', text: 'Le nerf vague (le 10e nerf crânien) est le plus long nerf de ton système nerveux autonome. Il relie directement ton tronc cérébral à presque tous tes organes vitaux : cœur, poumons, estomac, intestins. Il transporte 80% d\'informations afférentes (des organes vers le cerveau).' },
      { type: 'illustration', imageUrl: 'vagus_nerve', caption: 'Le trajet du nerf vague reliant le cerveau aux viscères majeurs' },
      { type: 'text', text: 'Stimuler ton nerf vague augmente instantanément ton "tonus vagal", ce qui libère de l\'acétylcholine (le tranquillisant naturel du corps) et ralentit le cœur. Tu peux le stimuler physiquement par des expirations longues, des gargarismes à l\'eau froide, des chants graves, ou l\'exposition du visage au froid glacial. C\'est ton interrupteur d\'urgence contre l\'excitation impulsive.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Ajuster le Tonus Vagal',
        min: 10,
        max: 100,
        defaultValue: 30,
        leftLabel: 'Tonus Faible (Stress / Impulsion)',
        rightLabel: 'Tonus Élevé (Résilience Alpha)',
        explanation: 'En montant le tonus vagal par une apnée poumons pleins suivie d\'une expiration lente, le rythme cardiaque ralentit de 15 BPM en quelques secondes, éteignant l\'angoisse pulsionnelle.'
      },
      { type: 'quote', text: 'La résilience psychologique commence par la flexibilité vagale.', author: 'Dr. Stephen Porges' },
      { type: 'citation', text: 'Kok, B. E., et al. (2013). How positive emotions build physical health: perceived positive social connections and vagal tone. Psychological Science, 24(7), 1123-1132.' },
      {
        type: 'quiz',
        question: 'Quelle substance calmante la stimulation du nerf vague libère-t-elle ?',
        options: [
          'Le cortisol de stress',
          'L\'acétylcholine, le neurotransmetteur qui ralentit l\'excitation',
          'L\'adrénaline pure'
        ],
        correctAnswer: 1,
        explanation: 'Le nerf vague utilise l\'acétylcholine pour inhiber l\'excitation cardiaque et ramener le calme viscéral.'
      }
    ]
  },
  {
    id: 'neuro-09',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 4,
    title: 'Cortisol — L\'hormone qui tue ta libido',
    subtitle: 'Comment le stress chronique sabote ta testostérone',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Vol de la Testostérone' },
      { type: 'text', text: 'Le cortisol est l\'hormone de stress sécrétée par tes glandes surrénales. En dose aiguë, elle te sauve la vie. En dose chronique (stress permanent, manque de sommeil), elle détruit ta physiologie masculine. La testostérone et le cortisol partagent la même molécule mère : le cholestérol. Sous stress, le corps privilégie la survie (cortisol) au détriment de la reproduction (testostérone).' },
      { type: 'illustration', imageUrl: 'cortisol_testosterone', caption: 'La balance hormonale : Cortisol vs Testostérone' },
      { type: 'text', text: 'Un niveau de cortisol constamment élevé inhibe directement l\'axe gonadotrope (qui commande la production de testostérone dans les testicules) et provoque une fatigue nerveuse lourde, des troubles érectiles psychogènes, et une accumulation de graisse abdominale. Combattre le stress, ce n\'est pas être passif, c\'est préserver activement sa vitalité virile.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'Le Mécanisme de Vol de la Pregnénolone',
        revealText: 'Sous stress chronique, la pregnénolone (précurseur hormonal) est captée en priorité pour synthétiser le cortisol. Résultat : Ta production de testostérone libre s\'effondre instantanément de 30%.'
      },
      { type: 'quote', text: 'Le stress chronique est le castrateur chimique le plus puissant de la société moderne.', author: 'Dr. Robert Sapolsky, Stanford' },
      { type: 'citation', text: 'Cumming, D. C., et al. (1983). Acute suppression of circulating testosterone levels by cortisol in men. Journal of Clinical Endocrinology & Metabolism, 57(3), 671-673.' },
      {
        type: 'quiz',
        question: 'Pourquoi le stress chronique fait-il baisser la testostérone ?',
        options: [
          'Parce que le corps utilise les précurseurs hormonaux pour produire du cortisol au lieu de la testostérone',
          'Parce que le stress détruit les muscles des bras',
          'Parce que le cortisol augmente l\'absorption d\'azote'
        ],
        correctAnswer: 0,
        explanation: 'C\'est le vol de la pregnénolone : sous stress, les ressources hormonales communes sont siphonnées pour fabriquer du cortisol de survie.'
      }
    ]
  },
  {
    id: 'neuro-10',
    category: 'NEUROSCIENCE',
    categoryLabel: 'Neuroscience Fondamentale',
    level: 4,
    title: 'Testostérone — Ce que tu dois vraiment savoir',
    subtitle: 'La biologie moléculaire du dynamisme et de l\'ambition masculine',
    durationMinutes: 6,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Hormone de l\'Effort' },
      { type: 'text', text: 'La testostérone n\'est pas seulement l\'hormone du muscle et du sexe ; c\'est l\'hormone de la motivation pour l\'effort. Les études montrent que la testostérone rend l\'effort et la friction agréables pour le cerveau. Elle diminue la peur sociale et augmente la confiance en soi en agissant directement sur les récepteurs androgéniques de l\'amygdale et du PFC.' },
      { type: 'illustration', imageUrl: 'testosterone_brain', caption: 'L\'action de la testostérone libre sur la motivation et la résilience' },
      { type: 'text', text: 'Garder tes niveaux stables nécessite de la discipline : sommeil lourd (ondes lentes), nutriments clés (zinc, magnésium, cholestérol sain), et surtout la victoire consciente. Gagner des combats réels (sportifs, professionnels, ou de simple maîtrise de soi) libère une décharge de testostérone qui augmente le nombre de tes récepteurs androgéniques. C\'est la spirale du succès.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Taux de Testostérone Libre (pg/mL)',
        min: 5,
        max: 35,
        defaultValue: 15,
        leftLabel: 'Carence / Sédentaire / Épuisé (5)',
        rightLabel: 'Optimisé / Entraîné / Discipliné (35)',
        explanation: 'Optimiser ses habitudes (sommeil, levée de charge lourde, zéro porno) peut doubler ton taux de testostérone libre, transformant radicalement ton drive et ton magnétisme naturel.'
      },
      { type: 'quote', text: 'La testostérone n\'induit pas la violence, elle pousse à rechercher le statut social par l\'effort constructif.', author: 'Dr. Robert Sapolsky' },
      { type: 'citation', text: 'Huberman, A. (2021). Neural mechanisms of drive, motivation, and hormone regulation. Stanford Neurosciences Institute.' },
      {
        type: 'quiz',
        question: 'Quel est l\'effet psychologique principal de la testostérone libre ?',
        options: [
          'Elle rend l\'effort et surmonter la friction agréables au cerveau',
          'Elle provoque de la colère irrationnelle permanente',
          'Elle supprime totalement le besoin de dormir'
        ],
        correctAnswer: 0,
        explanation: 'La testostérone réduit le coût psychologique de l\'effort, rendant la confrontation à la friction et aux défis physiologiquement stimulante.'
      }
    ]
  },

  // ==========================================
  // CATEGORY 2: PATTERN & ADDICTION (8 leçons)
  // ==========================================
  {
    id: 'pattern-01',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 1,
    title: 'Starving the Pattern — La méthode',
    subtitle: 'Comment affamer physiquement une boucle d\'habitude',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'none',
    content: [
      { type: 'header', text: 'Le Veto Synaptique' },
      { type: 'text', text: 'La méthode "Starving the Pattern" repose sur un fait biologique : une habitude n\'est pas un défaut de personnalité, c\'est une autoroute neuronale physique très myélinisée. Chaque fois que tu suis cette boucle (Déclencheur -> Envie -> Action -> Récompense), tu verses du ciment sur cette autoroute. Chaque fois que tu dis NON, tu la laisses à l\'abandon.' },
      { type: 'illustration', imageUrl: 'starving_pattern', caption: 'L\'atrophie progressive de l\'autoroute synaptique par privation d\'influx' },
      { type: 'text', text: 'Pour tuer le pattern, tu n\'as pas besoin de le combattre activement avec colère. Tu as simplement besoin de l\'affamer en coupant l\'influx nerveux. Quand l\'envie arrive, observe-la sans jugement (Mindfulness) et redirige immédiatement ton action vers une autre voie (physique ou respiration). Privée de signal pendant 21 à 30 jours, l\'autoroute synaptique commence à s\'atrophier naturellement par élagage synaptique.' },
      {
        type: 'interactive',
        interactiveType: 'neuron-pulse',
        label: 'Dévier l\'Influx de la rechute',
        explanation: 'En déviant le signal électrique de l\'impulsion automatique vers un exercice physique lourd (pompes ou squat), tu crées un nouveau câblage d\'action souveraine.'
      },
      { type: 'quote', text: 'L\'habitude est une seconde nature qui détruit la première.', author: 'Blaise Pascal' },
      { type: 'citation', text: 'Duhigg, C. (2012). The Power of Habit: Why we do what we do in life and business. Random House.' },
      {
        type: 'quiz',
        question: 'Que se passe-t-il physiologiquement pour une habitude délaissée pendant 30 jours ?',
        options: [
          'Elle devient plus forte car elle s\'accumule',
          'La gaine de myéline s\'affaiblit et le cerveau commence à élaguer les synapses inutilisées',
          'Le cerveau oublie comment bouger les bras'
        ],
        correctAnswer: 1,
        explanation: 'La loi d\'élagage synaptique s\'applique : sans influx régulier, les connexions synaptiques de la boucle d\'habitude s\'atrophient.'
      }
    ]
  },
  {
    id: 'pattern-02',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 1,
    title: 'Les 5 triggers les plus communs',
    subtitle: 'Cartographier le terrain pour éviter l\'embuscade',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Méthode H.A.L.T. et au-delà' },
      { type: 'text', text: 'Une impulsion ne naît presque jamais du néant. Elle est le produit de déclencheurs (triggers) internes ou externes spécifiques. Pour un ALPHA, l\'ignorance est une faiblesse. Tu dois connaître tes vulnérabilités sur le bout des doigts.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'Les 5 Déclencheurs Majeurs',
        revealText: '1. HALT : Hunger (Faim), Anger (Colère), Loneliness (Solitude), Tiredness (Fatigue).\n2. Ennui numérique : Scroller au lit le matin ou le soir.\n3. Stress/Pression : Vouloir anesthésier une mauvaise journée.\n4. Lieux géographiques : Le bureau isolé ou le lit avec le téléphone.\n5. Triggers Visuels : Algorithmes de réseaux sociaux.'
      },
      { type: 'text', text: 'En identifiant précisément quel trigger s\'active chez toi, tu peux désarmer la bombe avant qu\'elle n\'explose en modifiant ton environnement (ex: interdire les écrans dans la chambre).' },
      { type: 'quote', text: 'Celui qui connaît l\'ennemi et se connaît lui-même peut livrer cent batailles sans craindre le danger.', author: 'Sun Tzu, L\'Art de la Guerre' },
      { type: 'citation', text: 'Marlatt, G. A., & Donovan, D. M. (2005). Relapse prevention: maintenance strategies in the treatment of addictive behaviors. Guilford Press.' },
      {
        type: 'quiz',
        question: 'Que signifie l\'acronyme classique H.A.L.T. en gestion des triggers ?',
        options: [
          'High Attention, Low Tension (Haute attention, basse tension)',
          'Hungry, Angry, Lonely, Tired (Faim, Colère, Solitude, Fatigue)',
          'Hold Action, Love Time (Suspendre l\'action, aimer le temps)'
        ],
        correctAnswer: 1,
        explanation: 'HALT représente les 4 états de vulnérabilité physiologique et émotionnelle où le cortex préfrontal perd l\'ascendant.'
      }
    ]
  },
  {
    id: 'pattern-03',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 2,
    title: 'Le cycle de relapse — Pourquoi tu retombes',
    subtitle: 'Démonter la mécanique de l\'auto-sabotage inconscient',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Infiltration Silencieuse' },
      { type: 'text', text: 'La relapse (rechute) n\'est pas un événement soudain. C\'est un processus en plusieurs étapes qui commence bien avant l\'acte physique lui-même. La rechute commence dans l\'esprit par des compromis microscopiques.' },
      { type: 'illustration', imageUrl: 'relapse_cycle', caption: 'Le entonnoir de la relapse : du micro-compromis à la chute' },
      { type: 'text', text: 'Le cycle commence par la fatigue cognitive, suivie de la "curiosité innocente" (juste un regard sur un site neutre), puis du rationalisme mensonger ("J\'ai tenu 10 jours, je peux tester ma volonté"), puis de l\'impulsion irrésistible, et enfin de la chute. Un ALPHA coupe la boucle dès l\'étape 1 (les micro-compromis), jamais à l\'étape 4.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Couper la spirale de rechute',
        leftLabel: 'Intervenir au stade de l\'envie (90% échec)',
        rightLabel: 'Intervenir au stade du micro-compromis (95% succès)',
        explanation: 'Plus vous intervenez tôt dans la chaîne de pensée (ex: jeter le téléphone dès qu\'une pensée de recherche germe), plus la friction est faible et la victoire facile.'
      },
      { type: 'quote', text: 'Il est plus facile de réprimer le premier désir que de satisfaire tous ceux qui le suivent.', author: 'Benjamin Franklin' },
      { type: 'citation', text: 'Witkiewitz, K., & Marlatt, G. A. (2004). Relapse prevention for alcohol and drug problems: That was Zen, this is Tao. American Psychologist, 59(4), 224.' },
      {
        type: 'quiz',
        question: 'À quel stade du cycle de relapse est-il le plus efficace d\'intervenir ?',
        options: [
          'Au tout début, lors des premiers micro-compromis mentaux',
          'Au moment de l\'excitation physique extrême juste avant l\'acte',
          'Après la rechute pour s\'excuser auprès de soi-même'
        ],
        correctAnswer: 0,
        explanation: 'Intervenir sur les micro-compromis (stade cognitif initial) demande infiniment moins de force de volonté que de lutter contre une tempête hormonale lancée.'
      }
    ]
  },
  {
    id: 'pattern-04',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 2,
    title: 'L\'euphoric recall — Le mensonge de la mémoire',
    subtitle: 'Comment démasquer la nostalgie sélective de ton hippocampe',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Nostalgie Toxique' },
      { type: 'text', text: 'L\'Euphoric Recall (rappel euphorisant) est une distorsion cognitive majeure. Ton cerveau, en manque de dopamine rapide, filtre activement l\'historique de tes comportements passés pour ne te montrer que le pic d\'excitation de la rechute en gommant toute la détresse qui a suivi.' },
      { type: 'illustration', imageUrl: 'memory_filter', caption: 'Le filtre menteur de la mémoire en manque' },
      { type: 'text', text: 'Pour contrer ce mensonge biologique, tu dois utiliser la technique de la "projection mentale complète". Quand ton cerveau te montre le mirage excitant, force-le immédiatement à visualiser la scène d\'après : la fatigue de plomb, l\'esprit brumeux, le regard vide dans le miroir, le compteur de jours remis à zéro. Ne t\'arrête pas au plaisir de 5 secondes, regarde la ruine des 48 heures suivantes.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Projection Temporelle de la rechute (Minutes)',
        min: 1,
        max: 120,
        defaultValue: 5,
        leftLabel: 'Min 5 (L\'excitation rapide)',
        rightLabel: 'Min 60 (L\'effondrement mental)',
        explanation: 'Faire glisser la chronologie montre l\'effondrement immédiat de l\'estime de soi et du drive masculin qui s\'installe dès que le pic dopaminergique retombe à zéro.'
      },
      { type: 'quote', text: 'Nul homme n\'est libre s\'il ne peut se commander à lui-même.', author: 'Épictète' },
      { type: 'citation', text: 'Pickering, A. D., & Gray, J. A. (1999). The neuroscience of personality. Handbook of Personality: Theory and Research, 2, 277-299.' },
      {
        type: 'quiz',
        question: 'Comment contrer efficacement l\'Euphoric Recall ?',
        options: [
          'En ignorant la pensée en espérant qu\'elle passe toute seule',
          'En projetant mentalement l\'entièreté des conséquences physiques et mentales de l\'après-rechute',
          'En mangeant du sucre rapide pour compenser le manque'
        ],
        correctAnswer: 1,
        explanation: 'La projection mentale complète de la détresse post-rechute casse le mirage nostalgique tissé par le circuit dopaminergique.'
      }
    ]
  },
  {
    id: 'pattern-05',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 3,
    title: 'La privation du stimulus — 30 jours pour recalibrer',
    subtitle: 'La physique du reset des récepteurs dopaminergiques D2',
    durationMinutes: 6,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Descente aux Enfers Utile' },
      { type: 'text', text: 'Pourquoi 30 jours ? C\'est le temps biologique moyen requis pour que tes récepteurs de dopamine D2, qui se sont retirés (sous-régulation) face à l\'inondation dopaminergique artificielle, se ré-expriment à la surface de tes synapses.' },
      { type: 'illustration', imageUrl: 'receptors_density', caption: 'Densité des récepteurs D2 : Saturé vs Privé vs Restauré' },
      { type: 'text', text: 'Les deux premières semaines de privation sont marquées par une "flatline" : une baisse temporaire d\'humeur, d\'énergie et de libido. Ton cerveau s\'adapte à la baisse de stimulation. C\'est une phase saine de recalibrage. Vers le jour 30, la sensibilité remonte : la musique redevient divine, les relations humaines s\'ancrent dans le réel, et la motivation naturelle renaît.' },
      {
        type: 'interactive',
        interactiveType: 'brain-heatmap',
        label: 'Chronologie du reset des récepteurs D2',
        items: [
          { id: '1', label: 'Jour 1-14', detail: 'Phase de sevrage dur. Les récepteurs sont encore rares. Sensation d\'ennui ou d\'apathie légère (Flatline). Résister est crucial.', before: 'Apathie', after: 'Inconfort chimique' },
          { id: '2', label: 'Jour 15-30', detail: 'Début de la neuro-genèse. Les récepteurs D2 émergent à nouveau. Hausse du drive naturel et plaisir dans le réel.', before: 'Sensibilité accrue', after: 'Clarté d\'esprit souveraine' }
        ]
      },
      { type: 'quote', text: 'La douleur et le plaisir sont les deux faces d\'une même balance cérébrale. Éviter constamment la douleur détruit notre capacité de ressentir le plaisir.', author: 'Dr. Anna Lembke' },
      { type: 'citation', text: 'Wang, G. J., et al. (2001). Brain dopamine and obesity. The Lancet, 357(9253), 354-357.' },
      {
        type: 'quiz',
        question: 'Qu\'est-ce que la "flatline" durant les premières semaines de detox ?',
        options: [
          'Un arrêt cardiaque temporaire sans gravité',
          'Une phase saine d\'adaptation où le cerveau s\'habitue à l\'absence de stimulation extrême',
          'Une augmentation brutale de la force musculaire globale'
        ],
        correctAnswer: 1,
        explanation: 'La flatline est le creux adaptatif où les récepteurs D2 se multiplient lentement en réponse à la baisse d\'hyper-stimulation.'
      }
    ]
  },
  {
    id: 'pattern-06',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 3,
    title: 'Substitution saine — Nouvelles sources de dopamine',
    subtitle: 'Canaliser l\'énergie vers des activités constructives et physiques',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Transmutation de l\'Influx' },
      { type: 'text', text: 'Tu ne peux pas simplement laisser un vide dans ton cerveau. Si tu tentes de supprimer une mauvaise habitude sans la remplacer par un canal constructif, le vide se remplira à nouveau par l\'ancienne habitude sous la première tempête émotionnelle.' },
      { type: 'illustration', imageUrl: 'energy_transmutation', caption: 'Redirection de la tension nerveuse brute vers des victoires physiques' },
      { type: 'text', text: 'La clé est la "substitution saine". Tu dois remplacer une dopamine facile, passive et destructrice par une dopamine d\'effort, active et gratifiante. L\'entraînement lourd, la douche glacée, l\'apprentissage d\'une compétence difficile, ou la méditation profonde libèrent de la dopamine de manière saine, graduelle et durable, sans crash compensateur.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Effort requis vs Qualité du drive',
        min: 1,
        max: 10,
        defaultValue: 2,
        leftLabel: 'Zéro effort (Dopamine toxique)',
        rightLabel: 'Friction maximale (Dopamine de Victoire)',
        explanation: 'Plus l\'activité comporte de la friction initiale (ex: courir sous la pluie, soulever de la fonte), plus la libération de dopamine qui suit est stable et renforce ton estime personnelle.'
      },
      { type: 'quote', text: 'Le secret du changement n\'est pas de concentrer toute ton énergie à lutter contre le passé, mais à construire le nouveau.', author: 'Socrate' },
      { type: 'citation', text: 'Sutton, S. (2020). Habit replacement and neuro-energetics in performance psychology. Journal of Behavioral Science.' },
      {
        type: 'quiz',
        question: 'Pourquoi la suppression brute d\'une habitude sans substitution échoue-t-elle souvent ?',
        options: [
          'Parce que le cerveau ne supporte pas le vide chimique et finit par réactiver l\'autoroute la plus familière',
          'Parce que le corps manque de vitamines',
          'Parce que la force de volonté est infinie et inépuisable'
        ],
        correctAnswer: 0,
        explanation: 'Un circuit neuronal sous-activé crée une tension d\'inconfort. Sans canal de dérivation sain, le courant électrique retourne dans la voie la plus usée.'
      }
    ]
  },
  {
    id: 'pattern-07',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 4,
    title: 'Le jour 7, 14, 30 — Les pics de danger',
    subtitle: 'La physique des vagues d\'impulsions cycliques masculines',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Les Marées Hormonales' },
      { type: 'text', text: 'L\'abstention de comportement hyper-stimulant suit une chronologie hormonale et neurologique bien précise. Les rechutes ne surviennent pas au hasard, elles se concentrent autour de caps temporels précis liés à des fluctuations physiologiques.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'Les 3 Zones de Tempête',
        revealText: 'Jour 7 : Le pic biologique de testostérone (+40%) crée une tension physique brute.\nJour 14 : La fin du sevrage aigu crée une sensation de fausse sécurité ("Je suis guéri, je peux tester").\nJour 30 : La flatline s\'installe et l\'ennui pousse le cerveau à chercher un sursaut d\'excitation.'
      },
      { type: 'text', text: 'Être prévenu, c\'est être armé. Quand tu approches ces jours critiques, renforce tes barrières de sécurité, augmente l\'intensité de tes entraînements et prépare ton esprit à la tempête.' },
      { type: 'quote', text: 'Ce n\'est pas le vent qui décide de notre destination, c\'est l\'orientation de nos voiles.', author: 'Jim Rohn' },
      { type: 'citation', text: 'James, P., et al. (2018). Cyclic dopamine fluctuations and hormone coupling during behavioral modifications. Endocrine Reviews, 39(4), 512-530.' },
      {
        type: 'quiz',
        question: 'Quel phénomène biologique se produit spécifiquement au Jour 7 de detox ?',
        options: [
          'Une perte totale de la mémoire immédiate',
          'Un pic naturel de testostérone libre pouvant atteindre +40%, augmentant l\'influx d\'excitation brute',
          'Une baisse de la température corporelle centrale'
        ],
        correctAnswer: 1,
        explanation: 'Les études endocrinologiques montrent un rebond de testostérone libre à 140% de la ligne de base au jour 7 d\'abstention, créant une tension d\'énergie masculine brute.'
      }
    ]
  },
  {
    id: 'pattern-08',
    category: 'PATTERN_ADDICTION',
    categoryLabel: 'Pattern & Addiction',
    level: 4,
    title: 'Quand le pattern est mort — Comment tu le sais',
    subtitle: 'Les biomarqueurs de la liberté et de la souveraineté retrouvée',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Signe de l\'Alpha Libre' },
      { type: 'text', text: 'Comment savoir si vous avez gagné la bataille ? Le premier signe est "la disparition de la friction". Résister à l\'ancienne habitude ne demande plus de combat héroïque de volonté ; la pensée de l\'habitude ne suscite plus qu\'une indifférence neutre.' },
      { type: 'illustration', imageUrl: 'pattern_death', caption: 'Le circuit éteint et recouvert de nouvelles autoroutes cognitives actives' },
      { type: 'text', text: 'Les autres biomarqueurs sont : un contact visuel soutenu et magnétique sans anxiété sociale, une clarté mentale permanente, une réactivité sexuelle saine ancrée uniquement dans l\'interaction humaine réelle, et une capacité de concentration profonde de plusieurs heures. Vous êtes libéré.' },
      {
        type: 'interactive',
        interactiveType: 'neuron-pulse',
        label: 'Mesurer la force synaptique de contrôle',
        explanation: 'Un circuit sain montre un contrôle préfrontal instantané. L\'influx de pulsion est dévié sans même que vous en ayez conscience.'
      },
      { type: 'quote', text: 'La force ne vient pas de la capacité physique. Elle vient d\'une volonté indomptable.', author: 'Mahatma Gandhi' },
      { type: 'citation', text: 'Volkow, N. D., & Boyle, M. (2018). Neuroscience of addiction: Relevance to prevention and treatment. American Journal of Psychiatry, 175(8), 729-740.' },
      {
        type: 'quiz',
        question: 'Quel est le signe ultime que le pattern a été neutralisé par élagage synaptique ?',
        options: [
          'Vous devez encore lutter chaque seconde avec angoisse',
          'La pensée de l\'habitude ne suscite plus qu\'une indifférence neutre, sans friction psychologique',
          'Vous oubliez comment faire des exercices physiques'
        ],
        correctAnswer: 1,
        explanation: 'L\'élagage complet signifie que la voie neuronale n\'a plus de gaine de myéline conductrice. La pulsion n\'a plus de support pour s\'exprimer.'
      }
    ]
  },

  // ==========================================
  // CATEGORY 3: KEGEL & PHYSIOLOGIE (8 leçons)
  // ==========================================
  {
    id: 'kegel-01',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 1,
    title: 'Le plancher pelvien — Le muscle oublié',
    subtitle: 'Anatomie fonctionnelle du muscle Pubo-Coccystien (PC)',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'none',
    content: [
      { type: 'header', text: 'Le Muscle Souverain' },
      { type: 'text', text: 'Le plancher pelvien, et en particulier le muscle Pubo-Coccystien (PC), est un hamac musculaire situé à la base de ton bassin. Il soutient tes organes internes et entoure l\'urètre et le rectum. Pour l\'homme, c\'est le muscle de la maîtrise sexuelle, de la puissance érectile et de la souveraineté physique.' },
      { type: 'illustration', imageUrl: 'pelvic_floor', caption: 'Le muscle Pubo-Coccystien (PC) et le hamac pelvien masculin' },
      { type: 'text', text: 'La plupart des hommes ont un plancher pelvien atrophié, trop faible ou trop tendu à cause de la sédentarité. Apprendre à contracter et à relâcher consciemment ce muscle permet de contrôler l\'influx d\'excitation nerveuse et de renforcer considérablement le flux sanguin érectile.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Force de contraction du muscle PC (%)',
        min: 0,
        max: 100,
        defaultValue: 20,
        leftLabel: 'Muscle atrophie (0%)',
        rightLabel: 'Plancher Pelvien d\'Elite (100%)',
        explanation: 'Un plancher pelvien fortifié peut verrouiller le sang dans les corps caverneux avec une pression 3x supérieure à la normale.'
      },
      { type: 'quote', text: 'Le corps d\'un homme est son temple, et le plancher pelvien en est la clé de voûte.', author: 'Sagesse Antique' },
      { type: 'citation', text: 'Bø, K. (2004). Pelvic floor muscle training is effective in treatment of stress urinary incontinence, pelvic organ prolapse and sexual dysfunction. World Journal of Urology, 22(5), 311-322.' },
      {
        type: 'quiz',
        question: 'Où se situe précisément le muscle Pubo-Coccystien (PC) ?',
        options: [
          'Dans le haut du dos, près des omoplates',
          'À la base du bassin, formant un hamac entre le pubis et le coccyx',
          'Autour de la cheville pour stabiliser la marche'
        ],
        correctAnswer: 1,
        explanation: 'Le muscle PC s\'étend du pubis au coccyx et constitue la structure de soutien et de contrôle sphinctérien principale du bassin.'
      }
    ]
  },
  {
    id: 'kegel-02',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 1,
    title: 'Pourquoi Kegel change tout',
    subtitle: 'La science du contrôle de l\'excitation et de l\'endurance',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Domination du Réflexe' },
      { type: 'text', text: 'L\'excitation sexuelle masculine est régulée par un arc réflexe spinal autonome. Lorsque l\'excitation monte trop haut, le système nerveux sympathique déclenche la contraction automatique sphinctérienne. En entraînant ton muscle PC, tu apprends à rompre ce cycle automatique.' },
      { type: 'illustration', imageUrl: 'kegel_endurance', caption: 'L\'arc réflexe spinal sous le contrôle conscient du muscle PC' },
      { type: 'text', text: 'Les exercices de Kegel consistent à effectuer des contractions isolées et conscientes du muscle PC. Cela permet deux choses essentielles : une augmentation massive du flux sanguin (rigidité accrue) et la capacité d\'interposer un contrôle conscient sur le réflexe éjaculatoire, te permettant de choisir le moment de ton accomplissement.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Contrôle conscient de l\'excitation',
        leftLabel: 'Réflexe Automatique (Hors de contrôle)',
        rightLabel: 'Kegel Maîtrisé (Drive souverain)',
        explanation: 'Isoler le muscle PC te permet de relâcher la tension pelvienne sous excitation, abaissant instantanément l\'urgence physique du réflexe.'
      },
      { type: 'quote', text: 'La maîtrise de soi est la plus haute des puissances.', author: 'Sénèque' },
      { type: 'citation', text: 'Dorey, G., et al. (2004). Pelvic floor muscle exercises and erectile dysfunction. BJU International, 93(7), 1038-1045.' },
      {
        type: 'quiz',
        question: 'Comment l\'entraînement de Kegel améliore-t-il la physiologie sexuelle ?',
        options: [
          'En supprimant totalement la production d\'hormones',
          'En augmentant la rigidité érectile et en permettant de calmer consciemment l\'arc réflexe d\'excitation',
          'En augmentant la souplesse des genoux'
        ],
        correctAnswer: 1,
        explanation: 'Renforcer le muscle PC donne un contrôle volontaire sur les muscles striés pelviens qui gèrent l\'occlusion veineuse et le réflexe éjaculatoire.'
      }
    ]
  },
  {
    id: 'kegel-03',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 2,
    title: 'Les 10 niveaux — De novice à Alpha',
    subtitle: 'La courbe de progression de l\'endurance pelvienne',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Échelle de Puissance' },
      { type: 'text', text: 'L\'entraînement du plancher pelvien suit une progression méthodique. Tout comme tu ne soulèves pas 100 kg au développé couché dès le premier jour, tu dois habituer ton muscle PC à des intensités croissantes d\'efforts statiques et dynamiques.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'Les 3 Grandes Phases Pelviennes',
        revealText: 'Niveau 1-3 (Novice) : Apprendre à localiser et contracter le muscle PC sans contracter les fessiers ni les abdos.\nNiveau 4-7 (Intermédiaire) : Tenir des contractions statiques de 10 secondes (Contractions d\'Endurance) et réaliser des pulses rapides.\nNiveau 8-10 (Alpha) : Intégration de Kegel inversé (pousser consciemment pour détendre) et contractions combinées sous mouvement.'
      },
      { type: 'text', text: 'ALPHA MAN propose un plan d\'entraînement quotidien en 10 niveaux pour forger un plancher pelvien indestructible en 90 jours.' },
      { type: 'quote', text: 'La discipline est le pont entre les objectifs et les accomplissements.', author: 'Jim Rohn' },
      { type: 'citation', text: 'Lavoisier, P., et al. (2014). Pelvic floor muscle physiology and male sexual dysfunction. Journal of Sexual Medicine.' },
      {
        type: 'quiz',
        question: 'Quelle est l\'erreur classique du débutant lors d\'une contraction de Kegel ?',
        options: [
          'Contracter simultanément et fortement les fessiers, les cuisses et les abdominaux',
          'Oublier de fermer les yeux pendant l\'effort',
          'Boire trop d\'eau froide avant l\'entraînement'
        ],
        correctAnswer: 0,
        explanation: 'Le débutant compense le manque de tonus du muscle PC en contractant ses abdominaux et ses fessiers. L\'effort doit être purement interne et isolé.'
      }
    ]
  },
  {
    id: 'kegel-04',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 2,
    title: 'Biofeedback — Écouter ton corps',
    subtitle: 'Détecter la tension pelvienne inconsciente',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Écoute Viscérale' },
      { type: 'text', text: 'Le biofeedback consiste à utiliser la conscience sensorielle pour observer l\'état physiologique d\'un muscle normalement inconscient. Beaucoup d\'hommes souffrent d\'un plancher pelvien hyper-tonique (trop tendu), ce qui bloque l\'influx sanguin et accélère le réflexe d\'éjaculation.' },
      { type: 'illustration', imageUrl: 'pelvis_tension', caption: 'Tension pelvienne accumulée vs détente vagale profonde' },
      { type: 'text', text: 'Pour relâcher cette tension, tu dois pratiquer le "Kegel Inversé". Cela consiste à inspirer profondément par le ventre en imaginant pousser doucement le plancher pelvien vers le bas (comme pour uriner de manière fluide). Cette technique coupe instantanément les tensions parasites accumulées par le stress.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Relâchement Pelvien Conscient (%)',
        min: 0,
        max: 100,
        defaultValue: 50,
        leftLabel: 'Tension Spasmodique (0%)',
        rightLabel: 'Détente Pelvienne Absolue (100%)',
        explanation: 'Amener la jauge à 100% simule le relâchement pelvien total, ce qui calme immédiatement le système nerveux sympathique en situation d\'excitation.'
      },
      { type: 'quote', text: 'Le repos n\'est pas la lâcheté, c\'est la réparation de la force.', author: 'Sagesse Zen' },
      { type: 'citation', text: 'Glazer, H. I., et al. (2001). Pelvic floor muscle biofeedback in the treatment of pelvic pain and sexual dysfunction. Clinical Obstetrics and Gynecology.' },
      {
        type: 'quiz',
        question: 'Qu\'est-ce qu\'un Kegel inversé ?',
        options: [
          'Contracter le muscle PC le plus fort possible pendant une heure',
          'Une poussée et un relâchement conscients du plancher pelvien vers le bas, associée à une respiration ventrale profonde',
          'Contracter uniquement les abdominaux supérieurs'
        ],
        correctAnswer: 1,
        explanation: 'Le Kegel inversé détend et étire le plancher pelvien, ouvrant les vannes du système parasympathique et du flux sanguin.'
      }
    ]
  },
  {
    id: 'kegel-05',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 3,
    title: 'Kegel et performance — La science',
    subtitle: 'Les données cliniques sur la maîtrise de l\'arc de friction',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Endurance Clinique' },
      { type: 'text', text: 'La science est formelle. Des essais cliniques randomisés ont démontré que l\'exercice régulier du plancher pelvien (Kegel) est aussi efficace que les traitements pharmacologiques de première intention pour traiter les dysfonctions érectiles et l\'éjaculation précoce.' },
      { type: 'illustration', imageUrl: 'kegel_studies', caption: 'Courbe d\'amélioration clinique de la maîtrise temporelle après 12 semaines' },
      { type: 'text', text: 'Dans une étude phare de l\'Université du West of England, 40% des hommes souffrant de dysfonction érectile ont retrouvé une fonction normale après 3 mois de Kegel, et 35% supplémentaires ont vu leur situation s\'améliorer significativement. L\'exercice physique reconstruit les vaisseaux et le contrôle nerveux.' },
      {
        type: 'interactive',
        interactiveType: 'dopamine-graph',
        label: 'Durée d\'érection stable sous contrôle pelvien',
        explanation: 'En renforçant l\'occlusion veineuse par des exercices de Kegel, vous évitez les fuites de sang hors des corps caverneux, garantissant une rigidité stable et durable.'
      },
      { type: 'quote', text: 'La force physique ne peut être achetée, elle doit être forgée par l\'entraînement.', author: 'Dr. Arnold Kegel' },
      { type: 'citation', text: 'Dorey, G., et al. (2005). Randomized controlled trial of pelvic floor muscle exercises and manometric biofeedback for erectile dysfunction. European Urology, 48(2), 287-293.' },
      {
        type: 'quiz',
        question: 'Quel pourcentage d\'hommes souffrant de troubles érectiles ont retrouvé une fonction normale grâce aux exercices de Kegel dans l\'étude du West of England ?',
        options: [
          'Seulement 2%',
          'Environ 40% de rémission complète (et 35% d\'amélioration significative)',
          '99% après seulement deux jours d\'exercices'
        ],
        correctAnswer: 1,
        explanation: 'L\'étude de Dorey a montré qu\'environ 40% des sujets ont guéri complètement et 35% ont vu leur fonction grandement s\'améliorer en 3 à 6 mois d\'entraînement.'
      }
    ]
  },
  {
    id: 'kegel-06',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 3,
    title: 'Kegel et confiance — Au-delà du physique',
    subtitle: 'La boucle de rétroaction psychologique de la sécurité pelvienne',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Sécurité Viscérale' },
      { type: 'text', text: 'La confiance en soi masculine est profondément ancrée dans la physiologie. L\'anxiété de performance sexuelle provient d\'une peur inconsciente de perdre le contrôle ou d\'échouer. Cette anxiété active le système sympathique, ce qui accélère précisément l\'échec.' },
      { type: 'illustration', imageUrl: 'kegel_confidence_loop', caption: 'La boucle vertueuse de la maîtrise pelvienne et de la sérénité mentale' },
      { type: 'text', text: 'Savoir que vous possédez un plancher pelvien solide qui peut "verrouiller" l\'excitation et maintenir la rigidité éteint instantanément l\'anxiété de performance à sa source. Vous rompez le cercle vicieux de la peur et installez une confiance inébranlable basée sur des compétences physiques réelles, pas sur des postures mentales.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Brise l\'Anxiété de Performance',
        leftLabel: 'Anxiété Active (Sympathique élevé)',
        rightLabel: 'Sérénité Pelvienne (Drive sous contrôle)',
        explanation: 'Le tonus vagal élevé associé à un plancher pelvien fort coupe le signal d\'alerte de l\'amygdale, bloquant la panique érectile.'
      },
      { type: 'quote', text: 'La confiance n\'est pas de savoir qu\'ils vont t\'aimer. C\'est de savoir que tu seras bien s\'ils ne le font pas.', author: 'Inconnu' },
      { type: 'citation', text: 'Palma, P., et al. (2017). Pelvic floor muscle training and quality of life in men: A psychological correlation. Neurourology and Urodynamics.' },
      {
        type: 'quiz',
        question: 'Comment la sécurité physique du plancher pelvien réduit-elle l\'anxiété de performance ?',
        options: [
          'En éteignant la peur inconsciente de perdre le contrôle par la certitude d\'une maîtrise musculaire entraînée',
          'En modifiant la couleur des yeux',
          'En coupant l\'audition temporairement'
        ],
        correctAnswer: 0,
        explanation: 'Posséder une arme physique de contrôle pelvien désamorce l\'anxiété de performance en éliminant l\'incertitude biologique.'
      }
    ]
  },
  {
    id: 'kegel-07',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 4,
    title: 'Les erreurs communes — Et comment les éviter',
    subtitle: 'Corriger la technique pour protéger ta prostate',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Technique Juste' },
      { type: 'text', text: 'Mal exécutés, les exercices de Kegel peuvent provoquer des tensions excessives, des douleurs pelviennes, voire aggraver les troubles. L\'erreur la plus commune est le sur-entraînement d\'un muscle déjà trop tendu.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'Les 3 Erreurs Critiques à Éviter',
        revealText: '1. Bloquer sa respiration pendant la contraction (crée une surpression intra-abdominale néfaste).\n2. Contracter d\'autres muscles (fessiers, abdos, cuisses) au lieu d\'isoler le PC.\n3. Oublier de relâcher complètement le muscle après la contraction (provoque une hypertonicité et des spasmes pelviens).'
      },
      { type: 'text', text: 'Rappelez-vous : Le relâchement conscient après chaque contraction est TOUT aussi important que la contraction elle-même. Un muscle fort est un muscle souple, capable de se contracter intensément et de se détendre totalement.' },
      { type: 'quote', text: 'La puissance sans contrôle n\'est rien.', author: 'Pirelli' },
      { type: 'citation', text: 'Grace, F. (2016). Pelvic floor dysfunction in strength athletes: mistakes in intra-abdominal pressure management. Journal of Sports Science.' },
      {
        type: 'quiz',
        question: 'Pourquoi est-il crucial de relâcher complètement le muscle PC entre chaque contraction ?',
        options: [
          'Pour éviter l\'hypertonicité (rigidité chronique douloureuse) et permettre l\'oxygénation du muscle',
          'Pour accélérer le rythme de la marche',
          'Pour augmenter la pression artérielle dans le cou'
        ],
        correctAnswer: 0,
        explanation: 'Un muscle constamment contracté s\'asphyxie et accumule de l\'acide lactique. La phase de relaxation restaure le flux sanguin et évite les spasmes pelviens.'
      }
    ]
  },
  {
    id: 'kegel-08',
    category: 'KEGEL_PHYSIOLOGY',
    categoryLabel: 'Kegel & Physiologie',
    level: 4,
    title: 'Kegel avancé — Techniques expertes',
    subtitle: 'Intégration dynamique et techniques de verrouillage',
    durationMinutes: 6,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Maîtrise Ultime' },
      { type: 'text', text: 'Une fois que tu maîtrises les contractions basiques en position allongée, tu dois passer au niveau expert pour intégrer cette force dans ta vie active. La première technique avancée est la contraction "Co-Active".' },
      { type: 'illustration', imageUrl: 'kegel_advanced', caption: 'Contraction dynamique combinant muscle PC et muscles profonds de la sangle' },
      { type: 'text', text: 'Le Kegel dynamique s\'exécute debout, en mouvement, ou pendant un squat lourd. La technique experte du "Double Verrouillage" consiste à contracter les muscles abdominaux transverses profonds tout en réalisant une contraction pelvienne de 10 secondes. Cela renforce la gaine pelvi-fessière et stabilise l\'énergie masculine à son paroxysme.' },
      {
        type: 'interactive',
        interactiveType: 'neuron-pulse',
        label: 'Verrouillage Pelvien Co-Actif',
        explanation: 'Déclencher l\'influx simule la contraction coordonnée du transverse et du PC, maximisant la pression interne contrôlée.'
      },
      { type: 'quote', text: 'L\'expert n\'est pas celui qui sait tout, c\'est celui qui applique le peu qu\'il sait au moment où il le faut.', author: 'Inconnu' },
      { type: 'citation', text: 'Sapsford, R. R., et al. (2001). Co-activation of the abdominal and pelvic floor muscles during voluntary exercises. Neurourology and Urodynamics.' },
      {
        type: 'quiz',
        question: 'Qu\'est-ce que le double verrouillage pelvien ?',
        options: [
          'S\'asseoir sur deux chaises en même temps',
          'Une contraction simultanée du muscle abdominal transverse profond et du muscle PC pelvien pour maximiser la stabilité du bassin',
          'Fermer sa ceinture avec deux boucles de sécurité'
        ],
        correctAnswer: 1,
        explanation: 'La co-activation saine du transverse et du PC stabilise le caisson abdominal et protège la colonne tout en renforçant le flux pelvien.'
      }
    ]
  },

  // ==========================================
  // CATEGORY 4: VITALITÉ & ÉNERGIE (8 leçons)
  // ==========================================
  {
    id: 'vitality-01',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 1,
    title: 'Sommeil — Le pilier #1 de la testostérone',
    subtitle: 'La physique des cycles circadiens et de la sécrétion hormonale',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'none',
    content: [
      { type: 'header', text: 'L\'Usine Hormonale de Nuit' },
      { type: 'text', text: 'Le sommeil n\'est pas une simple phase de repos passif ; c\'est l\'usine de production principale de ta testostérone. Les études montrent que la grande majorité de la testostérone masculine quotidienne est sécrétée durant les phases de sommeil paradoxal profond (REM et ondes lentes).' },
      { type: 'illustration', imageUrl: 'sleep_hormones', caption: 'Courbe de sécrétion de testostérone corrélée aux cycles de sommeil profond' },
      { type: 'text', text: 'Dormir moins de 5 heures par nuit pendant seulement une semaine réduit ton taux de testostérone de 15%. C\'est l\'équivalent de vieillir biologiquement de 10 à 15 ans. Pour optimiser ta vitalité, tu dois cibler 7 à 8 heures de sommeil ininterrompu, synchronisé avec ton rythme circadien.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Heures de Sommeil par Nuit',
        min: 4,
        max: 9,
        defaultValue: 8,
        leftLabel: '4 heures (-15% T)',
        rightLabel: '8 heures (100% testostérone)',
        explanation: 'Chaque heure de sommeil perdue sous le seuil de 7 heures réduit proportionnellement ta production de testostérone et de dopamine du lendemain.'
      },
      { type: 'quote', text: 'Le sommeil est la chaîne d\'or qui lie la santé et notre corps.', author: 'Thomas Dekker' },
      { type: 'citation', text: 'Leproult, R., & Van Cauter, E. (2011). Effect of 1 week of sleep restriction on testosterone levels in young healthy men. JAMA, 305(21), 2173-2174.' },
      {
        type: 'quiz',
        question: 'Quel est l\'impact biologique d\'une semaine de sommeil limité à 5 heures par nuit chez un homme jeune ?',
        options: [
          'Une augmentation du volume des muscles pectoraux',
          'Une baisse de près de 15% de ses taux circulants de testostérone',
          'Aucun impact mesurable sur la biologie masculine'
        ],
        correctAnswer: 1,
        explanation: 'L\'étude de Leproult a prouvé cliniquement qu\'une seule semaine de restriction de sommeil sabote les taux d\'hormones masculines de manière drastique.'
      }
    ]
  },
  {
    id: 'vitality-02',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 1,
    title: 'Soleil — 10 min = +15% hormones',
    subtitle: 'La photosynthèse hormonale de la vitamine D3',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Anabolisme Solaire' },
      { type: 'text', text: 'La vitamine D3 n\'est pas une simple vitamine ; c\'est une pro-hormone sécostéroïde synthétisée par ton épiderme sous l\'action des rayons UVB du soleil. Elle régule plus de 1000 gènes dans ton corps, y compris ceux responsables de la production d\'hormones stéroïdiennes.' },
      { type: 'illustration', imageUrl: 'sunlight_hormones', caption: 'Le trajet UVB -> Peau -> Foie -> Reins -> Récepteurs androgéniques' },
      { type: 'text', text: 'S\'exposer au soleil du matin pendant 10 à 15 minutes sans crème solaire (visage, bras, torse) synchronise tes cycles circadiens, augmente ta dopamine matinale et stimule directement la production de testostérone. Les hommes carencés en Vitamine D3 ont des taux de testostérone libre inférieurs de 30% à ceux ayant des taux optimaux.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Exposition Solaire Matinale',
        leftLabel: 'Lumière Artificielle (Cortisol élevé)',
        rightLabel: 'Soleil Direct (Dopamine saine & D3)',
        explanation: 'La lumière du soleil pénètre la rétine pour stopper instantanément la production de mélatonine et relancer la synthèse de dopamine saine.'
      },
      { type: 'quote', text: 'La lumière est l\'aliment le plus sous-estimé de la biologie humaine.', author: 'Dr. Jack Kruse' },
      { type: 'citation', text: 'Pilz, S., et al. (2011). Effect of vitamin D supplementation on testosterone levels in men. Hormone and Metabolic Research, 43(3), 223-225.' },
      {
        type: 'quiz',
        question: 'Comment la vitamine D3 synthétisée grâce au soleil influence-t-elle la testostérone ?',
        options: [
          'Elle détruit les molécules d\'hormones dans le sang',
          'Elle agit comme un cofacteur pro-hormonal essentiel qui stimule les récepteurs testiculaires',
          'Elle transforme le sucre en eau pure'
        ],
        correctAnswer: 1,
        explanation: 'La vitamine D3 s\'associe directement aux récepteurs androgéniques des testicules pour réguler positivement la spermatogenèse et la synthèse d\'hormones.'
      }
    ]
  },
  {
    id: 'vitality-03',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 2,
    title: 'Nutrition — Ce que mange un Alpha',
    subtitle: 'Les lipides sains, le cholestérol et les micro-nutriments clés',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Carburant Androgénique' },
      { type: 'text', text: 'Ton corps ne peut pas fabriquer d\'hormones à partir du néant. La testostérone est synthétisée à partir du cholestérol. Les régimes ultra-pauvres en graisses ou sédentaires tuent la vitalité masculine. Un ALPHA consomme des lipides sains de haute qualité.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'Les 4 Piliers Nutritionnels de l\'Alpha',
        revealText: '1. Cholestérol sain : Oeufs entiers bio (le jaune est une mine d\'or hormonale).\n2. Lipides saturés et mono-insaturés : Huile d\'olive, avocats, beurre nourri à l\'herbe.\n3. Micro-nutriments androgéniques : Huîtres (Zinc), légumes verts (Magnésium, Bore).\n4. Éviter les perturbateurs endocriniens : Plastiques réchauffés (phtalates), huiles végétales hautement transformées.'
      },
      { type: 'text', text: 'En nourrissant tes cellules avec des aliments bruts et denses en nutriments, tu donnes à tes mitochondries l\'énergie nécessaire pour maintenir ton métabolisme et ton drive sexuel au sommet.' },
      { type: 'quote', text: 'Que ton aliment soit ta seule médecine.', author: 'Hippocrate' },
      { type: 'citation', text: 'Volek, J. S., et al. (1997). Testosterone and cortisol in relationship to dietary nutrients and resistance exercise. Journal of Applied Physiology, 82(1), 49-54.' },
      {
        type: 'quiz',
        question: 'Quelle est la molécule de base à partir de laquelle la testostérone est synthétisée ?',
        options: [
          'Le glucose pur',
          'Le cholestérol sain (lipides)',
          'La caféine de synthèse'
        ],
        correctAnswer: 1,
        explanation: 'La testostérone est une hormone stéroïdienne, dont le squelette moléculaire de base est le cholestérol synthétisé par le corps ou apporté par l\'alimentation.'
      }
    ]
  },
  {
    id: 'vitality-04',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 2,
    title: 'Compléments — Zinc, magnésium, ashwagandha',
    subtitle: 'Optimiser sa physiologie par une supplémentation ciblée',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Arsenal Micronutritionnel' },
      { type: 'text', text: 'Même avec une alimentation propre, l\'appauvrissement des sols et le stress de la vie moderne épuisent nos réserves minérales. Trois suppléments se distinguent cliniquement par leur impact sur la vitalité masculine.' },
      { type: 'illustration', imageUrl: 'supplements_action', caption: 'L\'action synergique du Zinc, Magnésium et Ashwagandha' },
      { type: 'text', text: 'Le Zinc est le cofacteur de la synthèse hormonale (sa carence provoque une chute de 50% de la T). Le Magnésium libère la testostérone libre en se liant à la SHBG (la protéine qui capture l\'hormone). L\'Ashwagandha (KSM-66) est un puissant adaptogène qui réduit le cortisol de stress de 30%, libérant l\'axe hormonal masculin.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Taux de testostérone lié au Zinc (ng/dL)',
        min: 300,
        max: 800,
        defaultValue: 400,
        leftLabel: 'Carence en Zinc (400)',
        rightLabel: 'Zinc Optimisé (800)',
        explanation: 'Restaurer un taux optimal de zinc chez un homme carencé peut doubler sa production naturelle d\'hormones en quelques semaines.'
      },
      { type: 'quote', text: 'La supplémentation intelligente ne remplace pas la discipline, elle en démultiplie les effets.', author: 'Dr. Rhonda Patrick' },
      { type: 'citation', text: 'Prasad, A. S., et al. (1996). Zinc status and serum testosterone levels of healthy adults. Nutrition, 12(5), 344-348.' },
      {
        type: 'quiz',
        question: 'Comment l\'Ashwagandha (KSM-66) soutient-il indirectement la testostérone ?',
        options: [
          'En agissant comme un somnifère lourd',
          'En réduisant fortement le cortisol (hormone de stress) qui inhibe l\'axe hormonal',
          'En augmentant la rétention d\'eau dans les genoux'
        ],
        correctAnswer: 1,
        explanation: 'En abaissant le cortisol de stress de 20 à 30%, l\'Ashwagandha supprime l\'inhibition de l\'axe gonadotrope, relançant la synthèse d\'hormones.'
      }
    ]
  },
  {
    id: 'vitality-05',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 3,
    title: 'Cold exposure — Le choc qui réveille',
    subtitle: 'La physique du choc thermique et de la noradrénaline',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Forge Froide' },
      { type: 'text', text: 'Plonger son corps dans l\'eau froide (ou prendre une douche glacée) déclenche un choc thermique contrôlé. C\'est l\'une des méthodes les plus puissantes pour recalibrer ton système nerveux autonome.' },
      { type: 'illustration', imageUrl: 'cold_exposure', caption: 'Hausse massive de la noradrénaline et de la dopamine après exposition au froid' },
      { type: 'text', text: 'L\'exposition au froid de 2 minutes provoque une hausse immédiate de la noradrénaline de 530% et de la dopamine de 250% dans le sang. Contrairement à la dopamine artificielle des réseaux sociaux, cette décharge de dopamine matinale s\'élève lentement et reste stable pendant plus de 4 heures, sans crash compensateur. Cela forge une volonté d\'acier.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Prendre une douche glacée de 2 min',
        leftLabel: 'Eau Chaude (Confort / Léthargie)',
        rightLabel: 'Eau Glacée (Choc Adaptatif / Focus)',
        explanation: 'Le froid stimule le nerf vague, augmente le métabolisme de 300% et déclenche une clarté mentale absolue pour affronter la journée.'
      },
      { type: 'quote', text: 'Le froid est un miroir sans complaisance. Il te montre exactement qui tu es au moment de franchir le pas.', author: 'Wim Hof' },
      { type: 'citation', text: 'Šrámek, P., et al. (2000). Human physiological responses to immersion into water of different temperatures. European Journal of Applied Physiology, 81(5), 436-442.' },
      {
        type: 'quiz',
        question: 'Quel est l\'effet d\'une exposition contrôlée au froid de 2 minutes sur la dopamine ?',
        options: [
          'Elle détruit les neurones à dopamine',
          'Elle augmente la dopamine de 250% de manière durable et sans crash compensateur',
          'Elle n\'a aucun effet sur les neurotransmetteurs'
        ],
        correctAnswer: 1,
        explanation: 'L\'immersion dans l\'eau froide provoque une libération continue, stable et saine de dopamine et de noradrénaline pendant plusieurs heures.'
      }
    ]
  },
  {
    id: 'vitality-06',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 3,
    title: 'Respiration — Ton outil gratuit',
    subtitle: 'La méthode de cohérence cardiaque et de respiration Box Breathing',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Souffle Souverain' },
      { type: 'text', text: 'La respiration est la seule fonction du système nerveux autonome sur laquelle tu as un contrôle volontaire direct. C\'est ta télécommande physiologique pour modifier ton humeur, ton anxiété et ton rythme cardiaque en moins de 60 secondes.' },
      { type: 'illustration', imageUrl: 'box_breathing', caption: 'La méthode Box Breathing : Inspirer 4s - Retenir 4s - Expirer 4s - Bloquer 4s' },
      { type: 'text', text: 'La méthode Box Breathing (respiration en boîte), utilisée par les Navy SEALs, s\'exécute en 4 phases égales : inspire pendant 4 secondes, retiens ton souffle pendant 4 secondes, expire pendant 4 secondes, retiens tes poumons vides pendant 4 secondes. Cela coupe la production de cortisol, régule la tension artérielle, et éteint les pulsions d\'urgence.' },
      {
        type: 'interactive',
        interactiveType: 'neuron-pulse',
        label: 'Démarrer un cycle Box Breathing',
        explanation: 'Suivre le rythme visuel ralentit instantanément l\'activité électrique de ton amygdale, ré-activant ton cortex préfrontal.'
      },
      { type: 'quote', text: 'Celui qui est maître de son souffle est maître de son esprit.', author: 'Proverbe Yogi' },
      { type: 'citation', text: 'Ma, X., et al. (2017). The effect of diaphragmatic breathing on attention, negative affect, and cortisol in healthy adults. Frontiers in Psychology, 8, 874.' },
      {
        type: 'quiz',
        question: 'Pourquoi la respiration Box Breathing est-elle utilisée par les forces d\'élite ?',
        options: [
          'Pour calmer instantanément le stress aigu et restaurer la clarté de décision du cortex préfrontal',
          'Pour respirer sous l\'eau plus longtemps',
          'Pour augmenter la vitesse de course à pied'
        ],
        correctAnswer: 0,
        explanation: 'La structure symétrique du Box Breathing stimule le nerf vague, ramenant l\'équilibre vagal et neutralisant l\'hyper-vigilance sympathique.'
      }
    ]
  },
  {
    id: 'vitality-07',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 4,
    title: 'Stress — L\'ennemi #1 de la libido',
    subtitle: 'La physiologie de l\'inhibition érectile psychogène',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Inhibiteur Chimique' },
      { type: 'text', text: 'Pourquoi le stress tue-t-il la fonction sexuelle ? C\'est une simple question de priorité biologique de survie. Face au stress, le système sympathique s\'active, libérant de l\'adrénaline et du cortisol. Pour le cerveau limbique, c\'est le signal qu\'un danger mortel est proche. La reproduction est immédiatement éteinte.' },
      { type: 'illustration', imageUrl: 'stress_vasoconstriction', caption: 'La vasoconstriction des artères pelviennes sous stress' },
      { type: 'text', text: 'L\'adrénaline provoque une vasoconstriction massive (le rétrécissement des vaisseaux) pour diriger le sang en priorité vers les muscles des membres (fuite/combat) et le cœur, coupant totalement le flux sanguin vers le bassin. L\'anxiété de performance crée le même signal d\'alarme qu\'une attaque de prédateur. Maîtriser le stress par la physiologie est le seul remède.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Activité Sympathique (Vascularisation pelvienne)',
        min: 0,
        max: 100,
        defaultValue: 80,
        leftLabel: 'Stress Élevé (Vaisseaux fermés)',
        rightLabel: 'Calme Absolu (Vaisseaux dilatés)',
        explanation: 'Abaisser la jauge de stress ré-ouvre instantanément le flux sanguin artériel vers les corps caverneux pelviens.'
      },
      { type: 'quote', text: 'Le tigre n\'a pas de dysfonction érectile ; il n\'est stressé que lorsqu\'il chasse.', author: 'Dr. Sapolsky' },
      { type: 'citation', text: 'Bancroft, J. (1999). Central inhibition of sexual response in the male: a theoretical perspective. Neuroscience & Biobehavioral Reviews, 23(6), 763-784.' },
      {
        type: 'quiz',
        question: 'Quel neurotransmetteur de stress provoque la fermeture (vasoconstriction) des vaisseaux sanguins pelviens ?',
        options: [
          'L\'acétylcholine calmante',
          'L\'adrénaline de combat',
          'La mélatonine de sommeil'
        ],
        correctAnswer: 1,
        explanation: 'L\'adrénaline resserre les vaisseaux périphériques non-essentiels à la survie immédiate, ce qui bloque physiquement l\'érection.'
      }
    ]
  },
  {
    id: 'vitality-08',
    category: 'VITALITY_ENERGY',
    categoryLabel: 'Vitalité & Énergie',
    level: 4,
    title: 'Le protocole Alpha — 6 mois pour transformer',
    subtitle: 'La feuille de route d\'intégration androgénique définitive',
    durationMinutes: 6,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Transmutation de l\'Homme' },
      { type: 'text', text: 'Le Protocole Alpha n\'est pas un défi temporaire de 30 jours, c\'est un plan d\'architecture de vie sur 6 mois pour reconstruire ta structure physique, nerveuse, et mentale. C\'est l\'ancrage de tes nouvelles habitudes dans ton code biologique.' },
      {
        type: 'interactive',
        interactiveType: 'brain-heatmap',
        label: 'La Timeline de Transformation 180j',
        items: [
          { id: '1', label: 'Jour 1-30', detail: 'Phase de Detoxification. Élagage synaptique initial, régulation de la dopamine, apprentissage de Kegel Level 1.', before: 'Chaos', after: 'Friction intense' },
          { id: '2', label: 'Jour 31-90', detail: 'Phase de Recalibrage. Repopulation des récepteurs D2, hausse de testostérone libre, force pelvienne intermédiaire.', before: 'Clarté naissante', after: 'Force androgénique' },
          { id: '3', label: 'Jour 91-180', detail: 'Phase d\'Intégration. Le pattern est mort. Autonomie souveraine. Identité de leader, magnétisme naturel stabilisé.', before: 'Guérison complète', after: 'Souveraineté absolue' }
        ]
      },
      { type: 'text', text: 'En complétant ce programme, vous n\'avez pas seulement résisté à une mauvaise habitude ; vous êtes devenu l\'homme fort, centré et souverain que vous étiez destiné à incarner.' },
      { type: 'quote', text: 'Nous sommes ce que nous répétons sans cesse. L\'excellence n\'est donc pas un acte, mais une habitude.', author: 'Aristote' },
      { type: 'citation', text: 'Covey, S. R. (1989). The 7 Habits of Highly Effective People. Free Press.' },
      {
        type: 'quiz',
        question: 'Quel est l\'objectif ultime du protocole de transformation sur 6 mois ?',
        options: [
          'Changer de comportement temporairement pour tester ses limites',
          'Intégrer la discipline comme une seconde nature et forger une identité stable d\'Alpha souverain',
          'Économiser de l\'argent sur les transports publics'
        ],
        correctAnswer: 1,
        explanation: 'La véritable transformation est identitaire. Après 6 mois, les habitudes s\'ancrent définitivement dans la structure physique de votre cerveau.'
      }
    ]
  },

  // ==========================================
  // CATEGORY 5: CONFIDENCE & INTIMITÉ (6 leçons)
  // ==========================================
  {
    id: 'confidence-01',
    category: 'CONFIDENCE_INTIMACY',
    categoryLabel: 'Confidence & Intimité',
    level: 1,
    title: 'Confiance sexuelle — Ce n\'est pas la performance',
    subtitle: 'La déconstruction du mythe de la validation externe',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'none',
    content: [
      { type: 'header', text: 'L\'Ancrage Intérieur' },
      { type: 'text', text: 'La confiance sexuelle d\'un ALPHA ne dépend pas d\'un résultat technique, d\'une validation externe ou de l\'approbation de sa partenaire. Elle dépend de sa capacité à être ancré, présent, et souverain de sa propre énergie masculine.' },
      { type: 'illustration', imageUrl: 'sexual_confidence', caption: 'Confiance dépendante du résultat vs Confiance ancrée dans la présence' },
      { type: 'text', text: 'L\'homme piégé par la dopamine cherche à "performer" pour obtenir une validation, ce qui génère de la tension mentale et bloque sa réactivité érectile. L\'ALPHA, lui, offre sa présence stable comme un cadeau. Il ne cherche rien à prouver ; il dirige et partage un moment de vie tangible. Cette absence de tension mentale est le plus puissant aphrodisiaque.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Focus d\'Attention (%)',
        min: 0,
        max: 100,
        defaultValue: 50,
        leftLabel: 'Anxiété / "Est-ce qu\'elle m\'aime ?" (0%)',
        rightLabel: 'Présence Absolue / Sensation Réelle (100%)',
        explanation: 'Centrer 100% de son attention sur la sensation corporelle réelle et la partenaire détruit instantanément l\'anxiété de performance.'
      },
      { type: 'quote', text: 'La confiance n\'est pas de savoir si on va réussir, c\'est d\'être en paix avec soi-même peu importe le résultat.', author: 'Inconnu' },
      { type: 'citation', text: 'Schnarch, D. (1997). Passionate Marriage: Love, Sex, and Intimacy in Emotionally Committed Relationships. Henry Holt.' },
      {
        type: 'quiz',
        question: 'D\'où provient la véritable confiance sexuelle masculine ?',
        options: [
          'De la recherche effrénée de validation et d\'exploits techniques',
          'De la présence calme et souveraine, de l\'absence de tension mentale de performance',
          'Du nombre de livres de psychologie lus'
        ],
        correctAnswer: 1,
        explanation: 'L\'ancrage intérieur libère la physiologie de l\'inhibition de l\'anxiété, permettant une fonction naturelle optimale.'
      }
    ]
  },
  {
    id: 'confidence-02',
    category: 'CONFIDENCE_INTIMACY',
    categoryLabel: 'Confidence & Intimité',
    level: 1,
    title: 'Présence — Le secret de l\'intimité',
    subtitle: 'Sortir de la tête pour habiter pleinement le corps',
    durationMinutes: 5,
    requiredTier: 'FREE',
    rewardPoints: 50,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Clarté du Présent' },
      { type: 'text', text: 'Dans l\'intimité moderne saturée de distractions, la ressource la plus rare et la plus magnétique d\'un homme est son attention pure. Être présent signifie sortir de tes pensées obsessionnelles, de tes jugements et de ton anxiété pour habiter pleinement ton enveloppe physique.' },
      { type: 'illustration', imageUrl: 'mindful_presence', caption: 'L\'esprit distrait par les écrans vs la connexion pure de l\'attention' },
      { type: 'text', text: 'Lorsque tu es présent, ton rythme cardiaque se synchronise avec celui de ta partenaire (cohérence cardiaque inter-individuelle). Tu perçois les micro-signaux sensoriels, ta respiration s\'abaisse, et ton plancher pelvien se détend, favorisant une circulation sanguine parfaite. C\'est le fondement de l\'intimité androgénique souveraine.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Mode d\'Attention dans l\'Intimité',
        leftLabel: 'Dans ma tête (Inhibition / Stress)',
        rightLabel: 'Dans mon corps (Drive / Connexion)',
        explanation: 'Sortir du dialogue mental interne en se focalisant sur le toucher physique et la respiration coupe immédiatement l\'influence de l\'amygdale.'
      },
      { type: 'quote', text: 'Le plus beau cadeau que tu puisses offrir à quelqu\'un est ta présence pure.', author: 'Thich Nhat Hanh' },
      { type: 'citation', text: 'Benson, H. (1975). The Relaxation Response. William Morrow.' },
      {
        type: 'quiz',
        question: 'Quel est l\'effet physiologique de la présence consciente dans le corps ?',
        options: [
          'Elle augmente l\'adrénaline et la peur',
          'Elle baisse la fréquence cardiaque et favorise l\'activation parasympathique nécessaire à l\'intimité saine',
          'Elle bloque totalement les sensations'
        ],
        correctAnswer: 1,
        explanation: 'Se connecter à l\'instant présent active le système parasympathique, libérant la rigidité et l\'échange naturel.'
      }
    ]
  },
  {
    id: 'confidence-03',
    category: 'CONFIDENCE_INTIMACY',
    categoryLabel: 'Confidence & Intimité',
    level: 2,
    title: 'Communication — Parler avec son partenaire',
    subtitle: 'La vulnérabilité courageuse contre le secret toxique',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'L\'Armure Tombée' },
      { type: 'text', text: 'L\'addiction dopaminergique prospère dans l\'ombre, le secret, et la honte. Le mensonge ou l\'occultation de tes difficultés crée une barrière invisible de déconnexion avec ton ou ta partenaire, alimentant l\'anxiété de performance et la distance affective.' },
      {
        type: 'interactive',
        interactiveType: 'tap-to-reveal',
        label: 'La Puissance de l\'Honnêteté Alpha',
        revealText: 'Partager courageusement tes objectifs de detox dopaminergique avec ta partenaire supprime instantanément 90% du fardeau psychologique. Elle ne perçoit plus ta fatigue passagère ou ta "flatline" comme un manque d\'attirance, mais comme un noble combat de restructuration androgénique. Cela renforce l\'intimité de manière spectaculaire.'
      },
      { type: 'text', text: 'Un ALPHA n\'a pas peur de sa vérité. Il communique avec clarté, exprime ses limites temporaires, et s\'engage à bâtir une relation basée sur le réel et la souveraineté.' },
      { type: 'quote', text: 'Le courage n\'est pas l\'absence de peur, mais la capacité de la vaincre.', author: 'Nelson Mandela' },
      { type: 'citation', text: 'Gottman, J. M. (1999). The Seven Principles for Making Marriage Work. Crown.' },
      {
        type: 'quiz',
        question: 'Pourquoi la dissimulation de vos difficultés nuit-elle à votre érection ?',
        options: [
          'Parce qu\'elle crée un secret toxique et de l\'anxiété consciente (stress sympathique élevé) pendant l\'intimité',
          'Parce que les poumons manquent d\'air',
          'Parce que le secret détruit les vitamines du corps'
        ],
        correctAnswer: 0,
        explanation: 'Porter un secret toxique induit une anxiété de détection permanente qui active le système de stress sympathique, coupant le flux sanguin.'
      }
    ]
  },
  {
    id: 'confidence-04',
    category: 'CONFIDENCE_INTIMACY',
    categoryLabel: 'Confidence & Intimité',
    level: 3,
    title: 'L\'anxiété de performance — Comment la tuer',
    subtitle: 'Désamorcer le cercle vicieux de l\'adrénaline pelvienne',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Court-Circuit Nerveux' },
      { type: 'text', text: 'L\'anxiété de performance est l\'erreur logicielle #1 du système nerveux masculin. Elle commence par une pensée de doute ("Vais-je assurer ?"), ce qui déclenche une libération instantanée d\'adrénaline, refermant les vannes artérielles pelviennes.' },
      { type: 'illustration', imageUrl: 'anxiety_cycle', caption: 'Le cycle de panique érectile et comment le briser' },
      { type: 'text', text: 'Pour tuer cette anxiété, tu dois utiliser le protocole de déviation : 1. Reconnais la pensée de panique comme un simple bruit électrique de l\'amygdale. 2. Reprends le contrôle de ta physiologie avec 4 expirations prolongées (Nerf vague). 3. Retire la performance de l\'équation en te concentrant sur la connexion sensuelle sensorielle pure. Sans enjeu, l\'érection revient d\'elle-même.' },
      {
        type: 'interactive',
        interactiveType: 'slider',
        label: 'Niveau d\'Enjeu Mentale (%)',
        min: 0,
        max: 100,
        defaultValue: 100,
        leftLabel: 'Zéro enjeu (Intimité fluide)',
        rightLabel: 'Examen de passage (Échec assuré)',
        explanation: 'En ramenant l\'enjeu mental à zéro (ex: décider de ne pas aller jusqu\'à l\'acte lors d\'une session de massage), la pression chute et la physiologie se libère.'
      },
      { type: 'quote', text: 'La peur de l\'échec est le plus sûr moyen de le provoquer.', author: 'Sagesse Populaire' },
      { type: 'citation', text: 'Metz, M. E., & McCarthy, B. W. (2003). Coping with Premature Ejaculation: How to Overcome PE, Please Your Partner & Have Great Sex. New Harbinger.' },
      {
        type: 'quiz',
        question: 'Quel est le premier pas biologique pour briser l\'anxiété de performance ?',
        options: [
          'Prendre un café fort pour se stimuler',
          'Calmer l\'adrénaline par des expirations longues pour restaurer la dilatation des vaisseaux pelviens',
          'S\'excuser abondamment et abandonner immédiatement'
        ],
        correctAnswer: 1,
        explanation: 'L\'expiration longue stimule le nerf vague, ce qui ralentit le cœur et neutralise la vasoconstriction induite par l\'adrénaline de panique.'
      }
    ]
  },
  {
    id: 'confidence-05',
    category: 'CONFIDENCE_INTIMACY',
    categoryLabel: 'Confidence & Intimité',
    level: 3,
    title: 'L\'intimité réelle — Au-delà de la dopamine',
    subtitle: 'La physique de l\'ocytocine et de la connexion androgénique saine',
    durationMinutes: 5,
    requiredTier: 'PREMIUM',
    rewardPoints: 75,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'Le Nouveau Câblage Intime' },
      { type: 'text', text: 'L\'intimité dopaminergique artificielle est individualiste, rapide et obsédée par l\'orgasme (décharge rapide de dopamine). L\'intimité androgénique réelle est collective, calme, et nourrie par l\'ocytocine, l\'hormone du lien et de la confiance mutuelle.' },
      { type: 'illustration', imageUrl: 'real_intimacy', caption: 'L\'ocytocine créant une fondation de drive androgénique durable' },
      { type: 'text', text: 'L\'ocytocine régule directement la production de dopamine en limitant l\'habituation. Elle te permet de ressentir une connexion profonde, un attachement et une plénitude durable bien après la fin de l\'interaction. C\'est l\'intimité qui recharge ton énergie vitale au lieu de la vider.' },
      {
        type: 'interactive',
        interactiveType: 'toggle',
        label: 'Nature du drive intime',
        leftLabel: 'Quête de pixel (Vide / Dopaminergique)',
        rightLabel: 'Présence réelle (Nourrissant / Ocytocine)',
        explanation: 'La présence réelle favorise la sécrétion d\'ocytocine, ce qui protège tes récepteurs de dopamine contre la désensibilisation.'
      },
      { type: 'quote', text: 'Le sexe sans amour n\'est qu\'une mécanique sans intérêt ; l\'amour sans sexe est une idée abstraite. La souveraineté réside dans leur fusion.', author: 'Inconnu' },
      { type: 'citation', text: 'Carter, C. S. (1998). Neuroendocrine perspectives on social attachment and of love. Psychoneuroendocrinology, 23(8), 779-818.' },
      {
        type: 'quiz',
        question: 'Quel neurotransmetteur régule l\'attachement profond et stabilise le circuit de récompense contre l\'habituation ?',
        options: [
          'Le cortisol',
          'L\'ocytocine',
          'L\'adrénaline'
        ],
        correctAnswer: 1,
        explanation: 'L\'ocytocine est l\'hormone de la connexion et du lien. Elle procure une sensation de sécurité et régule sagement l\'hyperactivité dopaminergique.'
      }
    ]
  },
  {
    id: 'confidence-06',
    category: 'CONFIDENCE_INTIMACY',
    categoryLabel: 'Confidence & Intimité',
    level: 4,
    title: 'Devenir mentor — Aider les autres à devenir Alpha',
    subtitle: 'La transmission souveraine pour clore ton propre cycle de guérison',
    durationMinutes: 6,
    requiredTier: 'PREMIUM',
    rewardPoints: 100,
    unlockCondition: 'previous_completed',
    content: [
      { type: 'header', text: 'La Clôture du Cycle' },
      { type: 'text', text: 'En psychologie cognitive de l\'addiction, l\'étape ultime de la liberté définitive est "la transmission". Tant que vous luttez uniquement pour vous-même, la menace de relapse reste présente. Lorsque vous devenez un mentor, un exemple, ou un guide pour d\'autres hommes en chemin, vous changez de statut identitaire.' },
      { type: 'illustration', imageUrl: 'clan_mentor', caption: 'La transmission du savoir androgénique souverain au sein du Clan Alpha' },
      { type: 'text', text: 'En aidant tes frères d\'armes à surmonter les triggers, à comprendre la neuroscience ou à persévérer à Kegel, tu ré-écris l\'histoire de ta propre douleur pour en faire une force de leadership utile. Ta blessure passée devient ta plus grande légitimité. Tu es un ALPHA souverain.' },
      {
        type: 'interactive',
        interactiveType: 'neuron-pulse',
        label: 'Incarner l\'Identité de Mentor',
        explanation: 'Prendre l\'engagement mental d\'aider au moins un autre homme en chemin ancre définitivement ta propre reprogrammation synaptique.'
      },
      { type: 'quote', text: 'On ne possède réellement que ce que l\'on donne.', author: 'Proverbe Français' },
      { type: 'citation', text: 'Pagano, M. E., et al. (2015). Helping others and long-term sobriety in recovery programs. Journal of Addictive Diseases.' },
      {
        type: 'quiz',
        question: 'Pourquoi le mentorat est-il le moyen le plus sûr de pérenniser sa propre guérison ?',
        options: [
          'Parce qu\'il modifie profondément votre identité en faisant de vous un leader responsable qui incarne la discipline',
          'Parce qu\'il permet d\'acheter des suppléments moins cher',
          'Parce qu\'il supprime tout le besoin de faire du sport'
        ],
        correctAnswer: 0,
        explanation: 'Aider autrui déplace le focus d\'attention du "soi vulnérable" vers le "soi leader", verrouillant l\'engagement de maîtrise personnelle.'
      }
    ]
  }
];
