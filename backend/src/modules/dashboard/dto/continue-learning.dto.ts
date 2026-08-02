export enum LessonType {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
  QUIZ = 'QUIZ',
  PROJECT = 'PROJECT',
}

/**
 * Represents the next immediate lesson a student should take.
 */
export class NextLessonDto {
  /** Unique identifier for the next lesson */
  readonly lessonId: string;

  /** Title of the next lesson */
  readonly title: string;

  /** Order of the lesson within the module */
  readonly order: number;

  /** Slug of the next lesson */
  readonly slug: string;
}

/**
 * Represents a student's current learning state for a course in progress.
 */
export class ContinueLearningDto {
  /** Unique identifier for the course */
  readonly courseId: string;

  /** Title of the course */
  readonly courseTitle: string;

  /** URL-friendly slug for the course */
  readonly courseSlug: string;

  /** URL to the course thumbnail image */
  readonly courseThumbnail: string;

  /** Unique identifier for the active module */
  readonly moduleId: string;

  /** Title of the active module */
  readonly moduleTitle: string;

  /** URL-friendly slug for the module */
  readonly moduleSlug: string;

  /** Unique identifier for the active lesson (if any) */
  readonly lessonId?: string;

  /** Title of the active lesson */
  readonly lessonTitle?: string;

  /** Slug of the active lesson */
  readonly lessonSlug?: string;

  /** Type of the active lesson */
  readonly lessonType?: LessonType;

  /** Overall completion percentage for the course (0-100) */
  readonly completionPercentage: number;

  /** Timestamp of when the user last watched or accessed lesson content */
  readonly lastWatchedAt: Date;

  /** Timestamp of the most recent general activity */
  readonly lastActivityAt: Date;

  /** Information about the immediate next lesson to take */
  readonly nextLesson?: NextLessonDto;
}
