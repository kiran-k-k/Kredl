export interface ModuleLesson {
  id: string;
  title: string;
  slug: string;
  duration: number;
  order: number;
  completed: boolean;
  locked: boolean;
}

export interface ModuleDetails {
  id: string;
  title: string;
  slug: string;
  description: string;
}

export interface ModuleLessonsResponse {
  module: ModuleDetails;
  lessons: ModuleLesson[];
}

export interface SidebarLesson {
  id: string;
  title: string;
  slug: string;
  duration: number;
  order: number;
  completed: boolean;
  locked: boolean;
  current: boolean;
}

export interface LessonContent {
  id: string;
  title: string;
  slug: string;
  description: string;
  youtubeUrl: string;
  githubUrl?: string;
  durationMinutes: number;
  order: number;
  learningObjectives: string[];
  keyPoints: string[];
  notes: string;
  completed: boolean;
  completedAt?: Date | string;
  locked: boolean;
}

export interface NavigationLink {
  title: string;
  slug: string;
}

export interface LessonNavigation {
  previous?: NavigationLink;
  next?: NavigationLink;
  isLastLesson: boolean;
}

export interface ProgressSummary {
  lessonCompleted: boolean;
  moduleProgress: number;
  courseProgress: number;
}

export interface LessonDetailsResponse {
  course: {
    id: string;
    title: string;
    slug: string;
  };
  module: {
    id: string;
    title: string;
    slug: string;
    description: string;
  };
  lesson: LessonContent;
  sisterLessons: SidebarLesson[];
  navigation: LessonNavigation;
  progress: ProgressSummary;
}
