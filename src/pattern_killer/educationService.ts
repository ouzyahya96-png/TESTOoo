/**
 * ALPHA MAN - Education Cérébrale Interactive Progress Service
 * Durable persistence engine to track user's progress through the 40-lesson curriculum.
 */

export interface UserEducationState {
  completedLessons: string[]; // List of completed lesson IDs
  quizScores: Record<string, number>; // Lesson ID -> Score (percentage or points)
  totalPointsEarned: number;
  activeLessonId: string | null;
}

const STORAGE_KEY = 'alphaman_education_progress';

const defaultState: UserEducationState = {
  completedLessons: [],
  quizScores: {},
  totalPointsEarned: 0,
  activeLessonId: null,
};

export const educationService = {
  /**
   * Retrieves the current education progression state.
   */
  getState(): UserEducationState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Ensure default properties exist
        return {
          completedLessons: parsed.completedLessons || [],
          quizScores: parsed.quizScores || {},
          totalPointsEarned: parsed.totalPointsEarned || 0,
          activeLessonId: parsed.activeLessonId || null,
        };
      }
    } catch (e) {
      console.error("Failed to load education progress state", e);
    }
    this.saveState(defaultState);
    return defaultState;
  },

  /**
   * Saves the education progression state.
   */
  saveState(state: UserEducationState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save education progress state", e);
    }
  },

  /**
   * Completes a lesson, saving progress and awarding points.
   */
  completeLesson(lessonId: string, points: number, score?: number): UserEducationState {
    const state = this.getState();
    
    if (!state.completedLessons.includes(lessonId)) {
      state.completedLessons.push(lessonId);
      state.totalPointsEarned += points;
      
      // Also add to dopamine reset total progress points if progressService is available
      try {
        const dopamineState = localStorage.getItem('alphaman_dopamine_reset_state');
        if (dopamineState) {
          const parsed = JSON.parse(dopamineState);
          parsed.totalPoints = (parsed.totalPoints || 0) + points;
          localStorage.setItem('alphaman_dopamine_reset_state', JSON.stringify(parsed));
          
          // Dispatch custom event to notify components of points update
          window.dispatchEvent(new CustomEvent('alphaman_points_updated', { detail: parsed.totalPoints }));
        }
      } catch (err) {
        console.error("Could not sync points with dopamine reset state", err);
      }
    }

    if (score !== undefined) {
      state.quizScores[lessonId] = score;
    }

    this.saveState(state);
    
    // Dispatch custom event to notify UI of complete lesson
    window.dispatchEvent(new CustomEvent('alphaman_education_updated', { detail: state }));

    return state;
  },

  /**
   * Marks a lesson as currently being read.
   */
  setActiveLesson(lessonId: string | null): void {
    const state = this.getState();
    state.activeLessonId = lessonId;
    this.saveState(state);
  },

  /**
   * Resets all education progress for testing.
   */
  resetProgress(): UserEducationState {
    this.saveState(defaultState);
    window.dispatchEvent(new CustomEvent('alphaman_education_updated', { detail: defaultState }));
    return defaultState;
  }
};
