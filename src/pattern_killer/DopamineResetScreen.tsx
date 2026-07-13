/**
 * ALPHA MAN - Dopamine Reset Screen
 * Clean, production-ready React Native screen for mobile application integration.
 * Includes visual 90-day timeline, lesson content reader, 3-question quiz, exercises checklist, and custom styling.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Animated
} from 'react-native';

// Simple mockup interface to represent external icons on mobile
const MobileIcon = ({ name, color, size }: { name: string; color: string; size: number }) => (
  <Text style={{ fontSize: size, color: color, fontWeight: 'bold' }}>•</Text>
);

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface DayLesson {
  day: number;
  title: string;
  duration: number;
  content: string;
  citation: string;
  quiz: QuizQuestion[];
  exercises: string[];
  points: number;
  badge?: string;
}

export default function DopamineResetScreen() {
  const [currentDay, setCurrentDay] = useState<number>(3);
  const [selectedDay, setSelectedDay] = useState<number>(3);
  const [journalText, setJournalText] = useState<string>('');
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<number, boolean>>({});
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(1420);
  const [claimedDays, setClaimedDays] = useState<Record<number, boolean>>({});

  // Mock static data generation for mobile screen demo
  const getLesson = (day: number): DayLesson => {
    if (day === 3) {
      return {
        day: 3,
        title: "Starving the Pattern — Comment tuer un neurone",
        duration: 4,
        content: "Chaque fois que tu résistes, tu affaiblis le neurone. Chaque fois que tu cèdes, tu le renforces. Il n'y a pas de match nul. C'est mathématique.\n\nLe cerveau fonctionne par renforcement synaptique. Plus tu utilises une voie neuronale, plus elle devient forte. Moins tu l'utilises, plus elle s'atrophie.\n\nCe n'est pas de la volonté. C'est de la biologie.",
        citation: "Heeb, D. O. (1949). The Organization of Behavior. Neuroscience & Biobehavioral Reviews.",
        points: 200,
        exercises: [
          "Respiration 4-7-8 (3x/jour)",
          "Analyse de micro-déclencheurs (1 min)",
          "Journal d'alignement souverain"
        ],
        quiz: [
          {
            question: "Qu'est-ce que le renforcement synaptique ?",
            options: [
              "Le fait que les neurones s'affaiblissent quand on les réutilise",
              "Le fait que l'utilisation répétée renforce une connexion nerveuse",
              "La création spontanée de liquide céphalo-rachidien"
            ],
            correctIndex: 1,
            explanation: "Plus un circuit de neurones est activé, plus sa résistance électrique diminue, facilitant le passage de l'influx."
          }
        ]
      };
    }

    // Default template for other days
    return {
      day,
      title: `Jour ${day} : Restructuration Cognitive`,
      duration: 3,
      content: "La constance est la clé de la neurogénèse préfrontale. Continuez d'inhiber les réactions rapides.",
      citation: "Nestler, E. J. (2013). Cellular basis of memory for addiction. Dialogues in Clin. Neurosci.",
      points: 50,
      exercises: ["Respiration Box Breathing (4 min)", "10 contractions Kegel"],
      quiz: [
        {
          question: "Combien de temps dure un pic d'impulsion intense ?",
          options: ["Entre 5 et 10 minutes maximum", "Plus d'une heure", "Toute la journée"],
          correctIndex: 0,
          explanation: "S'il n'est pas alimenté par des pensées obsessionnelles, le pic d'adrénaline d'une impulsion retombe sous 10 minutes."
        }
      ]
    };
  };

  const lesson = getLesson(selectedDay);

  const handleToggleExercise = (ex: string) => {
    setCompletedExercises(prev => ({
      ...prev,
      [`${selectedDay}-${ex}`]: !prev[`${selectedDay}-${ex}`]
    }));
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${selectedDay}-${qIdx}`]: optIdx
    }));
    const isCorrect = optIdx === lesson.quiz[qIdx].correctIndex;
    setQuizFeedback(prev => ({
      ...prev,
      [`${selectedDay}-${qIdx}`]: isCorrect
    }));
  };

  const handleClaimReward = () => {
    if (claimedDays[selectedDay]) {
      Alert.alert("Déjà obtenu", "Vous avez déjà collecté les points de ce jour.");
      return;
    }
    
    // Check if exercises and journal are completed
    const allExDone = lesson.exercises.every(ex => completedExercises[`${selectedDay}-${ex}`]);
    if (!allExDone) {
      Alert.alert("Exercices requis", "Veuillez terminer et cocher tous les exercices du jour avant de réclamer.");
      return;
    }

    if (!journalText.trim()) {
      Alert.alert("Journal obligatoire", "Veuillez rédiger au moins quelques mots dans votre journal.");
      return;
    }

    setClaimedDays(prev => ({ ...prev, [selectedDay]: true }));
    setPoints(prev => prev + lesson.points);
    
    let completionMessage = `+${lesson.points} Points ajoutés à votre compte ALPHA !`;
    if (lesson.badge) {
      completionMessage += `\nNouveau badge débloqué : 🏆 ${lesson.badge}`;
    }
    Alert.alert("Succès Souverain !", completionMessage);

    // Auto advance current day if completing the highest active day
    if (selectedDay === currentDay && currentDay < 90) {
      setCurrentDay(prev => prev + 1);
      setSelectedDay(prev => prev + 1);
      setJournalText('');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header section */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>PHASE 1 : MIND — NEURO-REWIRE</Text>
        <Text style={styles.title}>DOPAMINE RESET PROTOCOL</Text>
        <Text style={styles.quote}>\"Le cerveau est le champ de bataille. On gagne ici.\"</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{points} XP</Text>
          <Text style={styles.statLbl}>Énergie Vitale</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>Jours {currentDay}/90</Text>
          <Text style={styles.statLbl}>Progression Globale</Text>
        </View>
      </View>

      {/* Horizontal timeline */}
      <Text style={styles.sectionTitle}>Séquenceur de Recalibrage (90 Jours)</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
        <View style={styles.timelineContainer}>
          {Array.from({ length: 90 }, (_, i) => i + 1).map((d) => {
            const isPassed = d < currentDay;
            const isActive = d === currentDay;
            const isSelected = d === selectedDay;
            const isFuture = d > currentDay;

            let btnStyle = styles.timelineItemFuture;
            let textStyle = styles.timelineTextFuture;

            if (isSelected) {
              btnStyle = styles.timelineItemSelected;
              textStyle = styles.timelineTextSelected;
            } else if (isActive) {
              btnStyle = styles.timelineItemActive;
              textStyle = styles.timelineTextActive;
            } else if (isPassed) {
              btnStyle = styles.timelineItemPassed;
              textStyle = styles.timelineTextPassed;
            }

            return (
              <TouchableOpacity
                key={d}
                style={[styles.timelineItem, btnStyle]}
                onPress={() => setSelectedDay(d)}
                disabled={isFuture}
              >
                <Text style={[styles.timelineText, textStyle]}>{d}</Text>
                {isPassed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Main card */}
      <View style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <View style={styles.tagRow}>
            <Text style={styles.phaseTag}>
              {selectedDay <= 7 ? 'DETOX PHASE' : selectedDay <= 30 ? 'REWIRE PHASE' : 'REBUILD PHASE'}
            </Text>
            <Text style={styles.durationTag}>⏳ {lesson.duration} MIN</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
        </View>

        {/* Lesson content */}
        <View style={styles.lessonBody}>
          <Text style={styles.lessonText}>{lesson.content}</Text>
          
          <TouchableOpacity 
            style={styles.audioBtn}
            onPress={() => setIsAudioPlaying(!isAudioPlaying)}
          >
            <Text style={styles.audioBtnText}>
              {isAudioPlaying ? '⏸ Pause Audio Coaching' : '▶ Lancer le Coaching Audio Direct'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.citationText}>Source : {lesson.citation}</Text>
        </View>

        {/* Checklist */}
        <View style={styles.sectionDivider} />
        <Text style={styles.cardSubtitle}>EXERCICES DE RECONNEXION</Text>
        {lesson.exercises.map((ex, idx) => {
          const isDone = !!completedExercises[`${selectedDay}-${ex}`];
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.checkboxRow, isDone && styles.checkboxRowActive]}
              onPress={() => handleToggleExercise(ex)}
            >
              <View style={[styles.checkbox, isDone && styles.checkboxChecked]}>
                {isDone && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={[styles.checkboxText, isDone && styles.checkboxTextDone]}>{ex}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Interactive quiz */}
        <View style={styles.sectionDivider} />
        <Text style={styles.cardSubtitle}>ANALYSE DES CONNAISSANCES (QUIZ)</Text>
        {lesson.quiz.map((q, qIdx) => {
          const selectedOpt = quizAnswers[`${selectedDay}-${qIdx}`];
          const feedback = quizFeedback[`${selectedDay}-${qIdx}`];

          return (
            <View key={qIdx} style={styles.quizBlock}>
              <Text style={styles.quizQuestion}>{q.question}</Text>
              {q.options.map((opt, optIdx) => {
                const isCurrentSelected = selectedOpt === optIdx;
                return (
                  <TouchableOpacity
                    key={optIdx}
                    style={[
                      styles.quizOption,
                      isCurrentSelected && styles.quizOptionSelected,
                      isCurrentSelected && feedback === true && styles.quizOptionCorrect,
                      isCurrentSelected && feedback === false && styles.quizOptionWrong
                    ]}
                    onPress={() => handleSelectQuizOption(qIdx, optIdx)}
                  >
                    <Text style={styles.quizOptionText}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
              {selectedOpt !== undefined && (
                <Text style={styles.explanationText}>
                  {feedback ? '✓ CORRECT ! ' : '✗ INCORRECT. '}
                  {q.explanation}
                </Text>
              )}
            </View>
          );
        })}

        {/* 1 Min Journaling */}
        <View style={styles.sectionDivider} />
        <Text style={styles.cardSubtitle}>JOURNAL NEURAL (1 MIN)</Text>
        <Text style={styles.journalPrompt}>
          {selectedDay <= 7 
            ? "Rédige ton sentiment de manque ou d'irritation sans filtre. Exprime-le pour t'en détacher."
            : "Qu'est-ce qui a facilité ta résistance aujourd'hui ? Écris la voie que tu empruntes."
          }
        </Text>
        <TextInput
          style={styles.journalInput}
          multiline={true}
          numberOfLines={4}
          placeholder="Écris ton état d'esprit ici..."
          placeholderTextColor="#555"
          value={journalText}
          onChangeText={setJournalText}
        />

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.claimBtn, claimedDays[selectedDay] && styles.claimBtnClaimed]}
          onPress={handleClaimReward}
        >
          <Text style={styles.claimBtnText}>
            {claimedDays[selectedDay] 
              ? 'Récompense Obtenue ✓' 
              : `Compléter le Jour & Réclamer +${lesson.points} XP`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginVertical: 20
  },
  subtitle: {
    color: '#E94560',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center'
  },
  quote: {
    color: '#8E8E93',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16213E',
    borderWidth: 1,
    borderColor: '#1A1A2E',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  statVal: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900'
  },
  statLbl: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase'
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10
  },
  timelineScroll: {
    marginBottom: 24
  },
  timelineContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8
  },
  timelineItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative'
  },
  timelineItemFuture: {
    backgroundColor: '#16213E',
    borderColor: '#222'
  },
  timelineItemActive: {
    backgroundColor: '#E94560',
    borderColor: '#FFF'
  },
  timelineItemSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFF'
  },
  timelineItemPassed: {
    backgroundColor: '#00D9A5',
    borderColor: '#00D9A5'
  },
  timelineText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  timelineTextFuture: {
    color: '#555'
  },
  timelineTextActive: {
    color: '#FFF'
  },
  timelineTextSelected: {
    color: '#000'
  },
  timelineTextPassed: {
    color: '#000'
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFF',
    color: '#000',
    borderRadius: 8,
    width: 14,
    height: 14,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: 'extrabold'
  },
  lessonCard: {
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E'
  },
  lessonHeader: {
    marginBottom: 16
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  phaseTag: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold'
  },
  durationTag: {
    color: '#8E8E93',
    fontSize: 10
  },
  lessonTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  lessonBody: {
    marginBottom: 16
  },
  lessonText: {
    color: '#D1D1D6',
    fontSize: 14,
    lineHeight: 20
  },
  audioBtn: {
    backgroundColor: '#1F2E54',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12
  },
  audioBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  citationText: {
    color: '#8E8E93',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 16
  },
  cardSubtitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#111'
  },
  checkboxRowActive: {
    borderColor: '#00D9A5'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#444',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#00D9A5',
    borderColor: '#00D9A5'
  },
  checkboxTick: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold'
  },
  checkboxText: {
    color: '#FFF',
    fontSize: 13
  },
  checkboxTextDone: {
    color: '#8E8E93',
    textDecorationLine: 'line-through'
  },
  quizBlock: {
    backgroundColor: '#0F0F1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  quizQuestion: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10
  },
  quizOption: {
    backgroundColor: '#16213E',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#222'
  },
  quizOptionSelected: {
    borderColor: '#FFD700'
  },
  quizOptionCorrect: {
    borderColor: '#00D9A5',
    backgroundColor: '#00D9A520'
  },
  quizOptionWrong: {
    borderColor: '#E94560',
    backgroundColor: '#E9456020'
  },
  quizOptionText: {
    color: '#FFF',
    fontSize: 12
  },
  explanationText: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16
  },
  journalPrompt: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 10
  },
  journalInput: {
    backgroundColor: '#0F0F1A',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16
  },
  claimBtn: {
    backgroundColor: '#E94560',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  claimBtnClaimed: {
    backgroundColor: '#00D9A5'
  },
  claimBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14
  }
});
