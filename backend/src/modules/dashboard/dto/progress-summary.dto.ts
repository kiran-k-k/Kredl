/**
 * Aggregates high-level learning metrics for the student.
 */
export class ProgressSummaryDto {
  /** Total number of courses the user is enrolled in */
  readonly totalCoursesEnrolled: number;

  /** Total number of courses the user has completed */
  readonly coursesCompleted: number;

  /** Total number of modules the user has completed across all courses */
  readonly modulesCompleted: number;

  /** Total number of lessons the user has completed */
  readonly lessonsCompleted: number;

  /** Total number of quizzes the user has successfully passed */
  readonly quizzesCompleted: number;

  /** Average completion percentage across all active courses (0-100) */
  readonly overallProgressPercentage: number;

  /** Current consecutive days of learning activity */
  readonly currentLearningStreak: number;

  /** Total accumulated hours of learning */
  readonly totalLearningHours: number;
}
