/**
 * Represents a curated course suggestion for the user.
 */
export class RecommendedCourseDto {
  /** Unique identifier for the course */
  readonly courseId: string;

  /** Title of the course */
  readonly title: string;

  /** URL-friendly slug for the course */
  readonly slug: string;

  /** URL to the course thumbnail image */
  readonly thumbnail: string;

  /** Brief description or summary of the course */
  readonly shortDescription: string;

  /** Difficulty level (e.g., Beginner, Intermediate, Advanced) */
  readonly difficulty: string;

  /** Estimated duration to complete the course in minutes */
  readonly estimatedDuration: number;

  /** Category or department the course belongs to */
  readonly category: string;

  /** Full name of the primary instructor */
  readonly instructorName?: string;

  /** Average rating (0-5) */
  readonly rating?: number;

  /** Total number of enrolled students */
  readonly totalStudents?: number;

  /** Reason why this course is recommended to the user */
  readonly recommendationReason: string;
}
