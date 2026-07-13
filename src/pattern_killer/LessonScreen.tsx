/**
 * ALPHA MAN - Lesson Reader Screen (React Native Mobile Screen Blueprint)
 * Detailed screen showing custom interactive content reader. Includes:
 * - Top sticky reader progress bar
 * - Simulated audio TTS reader panel with custom visualizer bars
 * - Native flippable dual-state Quiz block with feedback
 * - Deep scientific citations and quotations blocks styling
 * - Smooth scrollable vertical container with locking mechanics
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert
} from 'react-native';

import { Lesson, ContentBlock } from './educationLessons';

const { width } = Dimensions.get('window');

interface LessonScreenProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: (points: number) => void;
  isAlreadyCompleted: boolean;
}

export default function LessonScreen({ lesson, onClose, onComplete, isAlreadyCompleted }: LessonScreenProps) {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  
  // Quiz states (index of block -> selected option index)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  
  // Handle simulated audio ticker
  useEffect(() => {
    let timer: any;
    if (isAudioPlaying) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsAudioPlaying(false);
            Alert.alert("Audio terminé", "Vous avez reçu 10 points bonus d'attention !");
            return 100;
          }
          return prev + 2;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isAudioPlaying]);

  const handleSelectQuiz = (blockIndex: number, optionIndex: number) => {
    if (quizSubmitted[blockIndex]) return;
    setQuizAnswers(prev => ({ ...prev, [blockIndex]: optionIndex }));
  };

  const handleSubmitQuiz = (blockIndex: number, correctAnswer: number) => {
    const chosen = quizAnswers[blockIndex];
    if (chosen === undefined) {
      Alert.alert("Oups", "Sélectionnez d'abord une réponse !");
      return;
    }
    setQuizSubmitted(prev => ({ ...prev, [blockIndex]: true }));
  };

  const handleFinish = () => {
    // Check if quizzes in content are completed
    const quizBlocks = lesson.content.filter((b) => b.type === 'quiz');
    const allQuizCompleted = quizBlocks.every((block) => {
      const idx = lesson.content.indexOf(block);
      return quizSubmitted[idx];
    });

    if (quizBlocks.length > 0 && !allQuizCompleted) {
      Alert.alert("Attention", "Veuillez répondre au quiz d'assimilation avant de valider la leçon !");
      return;
    }

    onComplete(lesson.rewardPoints);
    Alert.alert("Leçon validée !", `Félicitations, vous gagnez +${lesson.rewardPoints} Points ALPHA.`);
    onClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕ Quitter</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>+{lesson.rewardPoints} PTS</Text>
        </View>
      </View>

      {/* TOP PROGRESS TAPE */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${scrollProgress * 100}%` }]} />
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const { y } = e.nativeEvent.contentOffset;
          const height = e.nativeEvent.contentSize.height - e.nativeEvent.layoutMeasurement.height;
          setScrollProgress(height > 0 ? y / height : 0);
        }}
      >
        
        {/* INTRO METADATA */}
        <View style={styles.introHeader}>
          <Text style={styles.categoryLabel}>{lesson.categoryLabel.toUpperCase()}</Text>
          <Text style={styles.lessonTitleBig}>{lesson.title}</Text>
          <Text style={styles.lessonSubtitleBig}>{lesson.subtitle}</Text>
        </View>

        {/* AUDIO TRACK PLAYER PANEL */}
        <View style={styles.audioPanel}>
          <View style={styles.audioTop}>
            <Text style={styles.audioTitle}>🎙️ SYNTHÈSE VOCALE ALPHA</Text>
            <Text style={styles.audioDuration}>{lesson.durationMinutes}:00 MIN</Text>
          </View>

          {/* Sound waves simulation indicators */}
          <View style={styles.wavesRow}>
            {Array(15).fill(0).map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.waveBar, 
                  { 
                    height: isAudioPlaying ? Math.floor(Math.random() * 20) + 4 : 4,
                    opacity: isAudioPlaying ? 0.9 : 0.2
                  }
                ]} 
              />
            ))}
          </View>

          <View style={styles.audioControls}>
            <TouchableOpacity 
              onPress={() => setIsAudioPlaying(!isAudioPlaying)} 
              style={styles.playButton}
            >
              <Text style={styles.playText}>{isAudioPlaying ? "⏸ Pause" : "▶ Écouter"}</Text>
            </TouchableOpacity>
            
            <View style={styles.audioProgressTrack}>
              <View style={[styles.audioProgressBar, { width: `${audioProgress}%` }]} />
            </View>
          </View>
        </View>

        {/* CURRICULUM BLOCKS RENDERING */}
        {lesson.content.map((block, idx) => {
          
          if (block.type === 'header') {
            return (
              <Text key={idx} style={styles.blockHeader}>
                {block.text}
              </Text>
            );
          }

          if (block.type === 'text') {
            return (
              <Text key={idx} style={styles.blockText}>
                {block.text}
              </Text>
            );
          }

          if (block.type === 'quote') {
            return (
              <View key={idx} style={styles.quoteCard}>
                <Text style={styles.quoteQuote}>“{block.text}”</Text>
                <Text style={styles.quoteAuthor}>— {block.author}</Text>
              </View>
            );
          }

          if (block.type === 'citation') {
            return (
              <View key={idx} style={styles.citationCard}>
                <Text style={styles.citationHeading}>RÉFÉRENCE CLINIQUE ET SCIENTIFIQUE</Text>
                <Text style={styles.citationText}>{block.text}</Text>
              </View>
            );
          }

          if (block.type === 'quiz') {
            const selected = quizAnswers[idx];
            const isDone = quizSubmitted[idx];
            const isCorrect = selected === block.correctAnswer;

            return (
              <View key={idx} style={[styles.quizCard, isDone && (isCorrect ? styles.quizCardCorrect : styles.quizCardError)]}>
                <Text style={styles.quizHeading}>🔬 ASSIMILATION SYNAPTIQUE</Text>
                <Text style={styles.quizQuestion}>{block.question}</Text>

                {block.options?.map((opt, optIdx) => {
                  const isChosen = selected === optIdx;
                  return (
                    <TouchableOpacity
                      key={optIdx}
                      onPress={() => handleSelectQuiz(idx, optIdx)}
                      disabled={isDone}
                      style={[
                        styles.quizOptionButton,
                        isChosen && styles.quizOptionChosen,
                        isDone && optIdx === block.correctAnswer && styles.quizOptionCorrect
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.quizOptionText, isChosen && styles.quizOptionTextChosen]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {!isDone ? (
                  <TouchableOpacity
                    onPress={() => handleSubmitQuiz(idx, block.correctAnswer)}
                    disabled={selected === undefined}
                    style={[styles.quizSubmitBtn, selected === undefined && styles.quizSubmitBtnDisabled]}
                  >
                    <Text style={styles.quizSubmitText}>Vérifier la réponse</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>
                      {isCorrect ? "✓ EXCELLENT COMPRIS" : "✗ SYNAPSE INCORRECTE"}
                    </Text>
                    <Text style={styles.explanationText}>{block.explanation}</Text>
                  </View>
                )}
              </View>
            );
          }

          return null;
        })}

        {/* FINISH BUTTON */}
        <TouchableOpacity 
          onPress={handleFinish}
          style={[styles.finishBtn, isAlreadyCompleted && styles.finishBtnCompleted]}
          activeOpacity={0.8}
        >
          <Text style={styles.finishText}>
            {isAlreadyCompleted ? "LEÇON ACQUISE ✓ CONTINUER" : "J'AI COMPRIS ✓ VALIDER L'ACQUIS"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070F',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#16213E',
    backgroundColor: '#0A0A12',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    maxWidth: width * 0.45,
  },
  pointsBadge: {
    backgroundColor: '#E9456015',
    borderColor: '#E9456030',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    color: '#E94560',
    fontSize: 10,
    fontWeight: '900',
  },
  progressTrack: {
    height: 3,
    width: '100%',
    backgroundColor: '#111122',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E94560',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  introHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#16213E30',
    paddingBottom: 16,
    marginBottom: 16,
  },
  categoryLabel: {
    color: '#E94560',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  lessonTitleBig: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  lessonSubtitleBig: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 16,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  audioPanel: {
    backgroundColor: '#111122',
    borderRadius: 14,
    borderColor: '#1C1C3A',
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  audioTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  audioDuration: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: 'bold',
  },
  wavesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00000030',
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  waveBar: {
    width: 2,
    backgroundColor: '#E94560',
    borderRadius: 1,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#E94560',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  audioProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#0A0A12',
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioProgressBar: {
    height: '100%',
    backgroundColor: '#E94560',
  },
  blockHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E94560',
    paddingLeft: 8,
  },
  blockText: {
    color: '#BCBCC3',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '300',
    marginBottom: 12,
    textAlign: 'justify',
  },
  quoteCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  quoteQuote: {
    color: '#FFFFFF',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  quoteAuthor: {
    color: '#E94560',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  citationCard: {
    borderTopWidth: 1,
    borderTopColor: '#16213E30',
    paddingTop: 8,
    marginVertical: 10,
  },
  citationHeading: {
    color: '#8E8E93',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  citationText: {
    color: '#E9456090',
    fontSize: 9,
    lineHeight: 12,
    fontStyle: 'italic',
  },
  quizCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginVertical: 16,
  },
  quizCardCorrect: {
    borderColor: '#00E67650',
  },
  quizCardError: {
    borderColor: '#E9456050',
  },
  quizHeading: {
    color: '#E94560',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  quizQuestion: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 16,
    marginBottom: 12,
  },
  quizOptionButton: {
    backgroundColor: '#090913',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  quizOptionChosen: {
    borderColor: '#E94560',
    backgroundColor: '#E9456010',
  },
  quizOptionCorrect: {
    borderColor: '#00E676',
    backgroundColor: '#00E67610',
  },
  quizOptionText: {
    color: '#8E8E93',
    fontSize: 11,
  },
  quizOptionTextChosen: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quizSubmitBtn: {
    backgroundColor: '#E94560',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  quizSubmitBtnDisabled: {
    backgroundColor: '#333344',
  },
  quizSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  explanationBox: {
    backgroundColor: '#00000020',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  explanationTitle: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  explanationText: {
    color: '#8E8E93',
    fontSize: 10,
    lineHeight: 13,
  },
  finishBtn: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  finishBtnCompleted: {
    backgroundColor: '#00D9A5',
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
