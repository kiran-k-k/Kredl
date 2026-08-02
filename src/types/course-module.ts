export interface CourseModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
  completedLessons: string[];
  estimatedDuration: string;
  progress: number;
  locked: boolean;
  completed: boolean;
  nextLessonId?: string;
  available?: boolean;
  lessonsCompleted?: boolean;
  quizAvailable?: boolean;
  quizPassed?: boolean;
  quizFailed?: boolean;
  nextModuleUnlocked?: boolean;
  lessons?: any[];
}

export interface CourseSummary {
  id: string;
  title: string;
  progress: number;
  completedModules: number;
  totalModules: number;
}

export interface CourseModulesListResponse {
  course: CourseSummary;
  modules: CourseModule[];
}
