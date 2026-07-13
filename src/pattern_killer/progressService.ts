/**
 * ALPHA MAN - Dopamine Reset Protocol Progress Service
 * Durable local storage based service to track user's 90-day neuro-rewire journey.
 */

export interface DailyProgress {
  day: number;
  completed: boolean;
  lessonRead: boolean;
  quizCompleted: boolean;
  exercisesCompleted: string[]; // list of completed exercise titles
  journalEntry: string;
  claimedReward: boolean;
  completedAt?: string;
}

export interface UserResetState {
  currentDay: number;
  totalPoints: number;
  streak: number;
  claimedBadges: string[];
  history: Record<number, DailyProgress>; // keyed by day number
}

const STORAGE_KEY = 'alphaman_dopamine_reset_state';

const defaultState: UserResetState = {
  currentDay: 1,
  totalPoints: 1420, // matching default starting points in showcase app
  streak: 1,
  claimedBadges: ["SOUVERAIN_DEBUT"],
  history: {}
};

export const progressService = {
  /**
   * Loads or initializes the progression state.
   */
  getState(): UserResetState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load progress state", e);
    }
    // Store default state initially if not found
    this.saveState(defaultState);
    return defaultState;
  },

  /**
   * Persists the progression state.
   */
  saveState(state: UserResetState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save progress state", e);
    }
  },

  /**
   * Retrieves daily progress state for a specific day.
   */
  getOrCreateDayProgress(day: number): DailyProgress {
    const state = this.getState();
    if (state.history[day]) {
      return state.history[day];
    }
    const newProgress: DailyProgress = {
      day,
      completed: false,
      lessonRead: false,
      quizCompleted: false,
      exercisesCompleted: [],
      journalEntry: '',
      claimedReward: false
    };
    state.history[day] = newProgress;
    this.saveState(state);
    return newProgress;
  },

  /**
   * Saves specific day's progress.
   */
  saveDayProgress(day: number, progress: Partial<DailyProgress>): UserResetState {
    const state = this.getState();
    const current = this.getOrCreateDayProgress(day);
    state.history[day] = { ...current, ...progress };
    this.saveState(state);
    return state;
  },

  /**
   * Claims reward points and badge for completing a milestone.
   */
  claimReward(day: number, rewardPoints: number, badgeReward?: string): { success: boolean; state: UserResetState; ptsAdded: number } {
    const state = this.getState();
    const current = this.getOrCreateDayProgress(day);

    if (current.claimedReward) {
      return { success: false, state, ptsAdded: 0 };
    }

    current.claimedReward = true;
    current.completed = true;
    current.completedAt = new Date().toISOString();
    state.history[day] = current;

    // Add points
    state.totalPoints += rewardPoints;

    // Check for streak updates
    // If we completed today and the previous days are completed, we can increment streak
    let activeStreak = 1;
    for (let d = day - 1; d >= 1; d--) {
      if (state.history[d]?.completed) {
        activeStreak++;
      } else {
        break;
      }
    }
    state.streak = activeStreak;

    // Add badge
    if (badgeReward && !state.claimedBadges.includes(badgeReward)) {
      state.claimedBadges.push(badgeReward);
    }

    this.saveState(state);
    return { success: true, state, ptsAdded: rewardPoints };
  },

  /**
   * Set the active simulation day (for prototype testing)
   */
  setCurrentDay(day: number): UserResetState {
    const state = this.getState();
    state.currentDay = Math.max(1, Math.min(day, 120));
    this.saveState(state);
    return state;
  },

  /**
   * Reset all progress to starting state.
   */
  resetAll(): UserResetState {
    this.saveState(defaultState);
    return defaultState;
  }
};
