/**
 * ALPHA MAN - Education Screen (React Native Mobile Screen Blueprint)
 * Clean, production-ready React Native screen displaying the educational syllabus,
 * category filter tabs, global progress tracking ring, and syllabus list cards.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView
} from 'react-native';

// Import full lessons dataset structure for types representation
import { EDUCATION_LESSONS, Lesson } from './educationLessons';

const { width } = Dimensions.get('window');

interface EducationScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
  completedLessons: string[];
  totalPoints: number;
}

export default function EducationScreen({ onSelectLesson, completedLessons = [], totalPoints = 1420 }: EducationScreenProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'Tout' },
    { id: 'NEUROSCIENCE', label: 'Neuro' },
    { id: 'PATTERN_ADDICTION', label: 'Addiction' },
    { id: 'KEGEL_PHYSIOLOGY', label: 'Kegel' },
    { id: 'VITALITY_ENERGY', label: 'Vitalité' },
    { id: 'CONFIDENCE_INTIMACY', label: 'Confiance' }
  ];

  // Filter lessons
  const filteredLessons = EDUCATION_LESSONS.filter((lesson) => {
    if (activeTab === 'ALL') return true;
    return lesson.category === activeTab;
  });

  const isLessonUnlocked = (lesson: Lesson, index: number) => {
    if (lesson.unlockCondition === 'none' || index === 0) return true;
    const prevLesson = EDUCATION_LESSONS[index - 1];
    return completedLessons.includes(prevLesson.id);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'NEUROSCIENCE': return '#E94560';
      case 'PATTERN_ADDICTION': return '#FF9800';
      case 'KEGEL_PHYSIOLOGY': return '#00E676';
      case 'VITALITY_ENERGY': return '#2196F3';
      case 'CONFIDENCE_INTIMACY': return '#9C27B0';
      default: return '#E94560';
    }
  };

  const completionPercentage = Math.round((completedLessons.length / EDUCATION_LESSONS.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* HEADER BRANDING */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>MIND — PHASE 1.3</Text>
          <Text style={styles.headerTitle}>EDUCATION CEREBRALE</Text>
          <Text style={styles.headerDescription}>
            Reprends le contrôle de ta chimie interne par la science de l'attention souveraine.
          </Text>
        </View>

        {/* STATS HIGHLIGHT COMPONENT */}
        <View style={styles.statsCard}>
          <View style={styles.statsRingContainer}>
            <View style={styles.statsRingInner}>
              <Text style={styles.statsRingText}>{completionPercentage}%</Text>
            </View>
          </View>
          <View style={styles.statsContent}>
            <Text style={styles.statsHeading}>PROGRÈS CURRICULUM</Text>
            <Text style={styles.statsNumbers}>{completedLessons.length} / {EDUCATION_LESSONS.length} Leçons</Text>
            <Text style={styles.statsPoints}>{totalPoints.toLocaleString()} PTS ALPHA VITALITÉ</Text>
          </View>
        </View>

        {/* HORIZONTAL CATEGORY TABS */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {categories.map((cat) => {
              const isSelected = activeTab === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveTab(cat.id)}
                  style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SYLLABUS LIST GRID */}
        <View style={styles.listContainer}>
          {filteredLessons.map((lesson, idx) => {
            const globalIndex = EDUCATION_LESSONS.findIndex((l) => l.id === lesson.id);
            const isCompleted = completedLessons.includes(lesson.id);
            const isUnlocked = isLessonUnlocked(lesson, globalIndex);
            const catColor = getCategoryColor(lesson.category);

            return (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => isUnlocked && onSelectLesson(lesson)}
                style={[
                  styles.lessonCard,
                  isCompleted && styles.lessonCardCompleted,
                  !isUnlocked && styles.lessonCardLocked
                ]}
                activeOpacity={0.7}
              >
                {/* Accent strip on left */}
                <View style={[styles.accentStrip, { backgroundColor: isUnlocked ? catColor : '#333344' }]} />

                <View style={styles.lessonCardBody}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.lessonCategory, { color: catColor }]}>
                      {lesson.categoryLabel.toUpperCase()}
                    </Text>
                    {isCompleted ? (
                      <Text style={styles.completedTag}>✓ COMPLÉTÉ</Text>
                    ) : !isUnlocked ? (
                      <Text style={styles.lockedTag}>🔒 LOCK</Text>
                    ) : (
                      <Text style={styles.pointsTag}>+{lesson.rewardPoints} PTS</Text>
                    )}
                  </View>

                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonSubtitle} numberOfLines={2}>{lesson.subtitle}</Text>

                  <View style={styles.cardFooterRow}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>NIVEAU {lesson.level}</Text>
                    </View>
                    <Text style={styles.durationText}>🕒 {lesson.durationMinutes} MIN</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerSubtitle: {
    color: '#E94560',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'System',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  headerDescription: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '300',
    marginTop: 6,
    lineHeight: 18,
    fontFamily: 'System',
  },
  statsCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statsRingContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#E94560',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsRingInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContent: {
    flex: 1,
  },
  statsHeading: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  statsNumbers: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statsPoints: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabsWrapper: {
    marginBottom: 20,
  },
  tabsContainer: {
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111122',
    borderWidth: 1,
    borderColor: '#1C1C3A',
    marginRight: 6,
  },
  tabButtonActive: {
    backgroundColor: '#E94560',
    borderColor: 'transparent',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  lessonCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 130,
  },
  lessonCardCompleted: {
    borderColor: '#00D9A5',
    backgroundColor: '#0F1E1B',
  },
  lessonCardLocked: {
    opacity: 0.5,
  },
  accentStrip: {
    width: 6,
    height: '100%',
  },
  lessonCardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonCategory: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  completedTag: {
    color: '#00D9A5',
    fontSize: 8,
    fontWeight: 'bold',
  },
  lockedTag: {
    color: '#8E8E93',
    fontSize: 8,
    fontWeight: 'bold',
  },
  pointsTag: {
    color: '#E94560',
    fontSize: 9,
    fontWeight: 'bold',
  },
  lessonTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  lessonSubtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  levelBadge: {
    backgroundColor: '#1C1C3A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: {
    color: '#E94560',
    fontSize: 8,
    fontWeight: 'bold',
  },
  durationText: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '600',
  }
});
