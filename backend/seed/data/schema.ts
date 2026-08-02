export interface CourseData {
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  shortDescription: string;
  description: string;
  prerequisites: string[];
  learningOutcomes: string[];
  estimatedDuration: number;
  tags: string[];
  displayOrder: number;
  isPublished: boolean;
  price: number;
}

export interface ModuleData {
  title: string;
  slug: string;
  order: number;
  description: string;
  learningObjectives: string[];
  skillsGained: string[];
  prerequisites: string[];
  estimatedStudyTime: number; // in hours
  isPublished: boolean;
}

export interface LessonData {
  moduleSlug: string;
  title: string;
  slug: string;
  order: number;
  shortDescription: string;
  estimatedDuration: number; // in minutes
  youtubeUrls: Array<{
    url: string;
    title: string;
    channelName: string;
    whySelected: string;
  }>;
  isPublished: boolean;
  isFree: boolean;
}

export interface LessonNoteData {
  lessonSlug: string;
  summary: string;
  detailedNotes: string; // Markdown
  keyPoints: string[];
  importantTerminology: Array<{ term: string; definition: string }>;
  practicalExercises: string[];
  commonMistakes: string[];
  bestPractices: string[];
}

export interface QuizData {
  moduleSlug: string;
  title: string;
  description: string;
  timeLimit: number; // minutes
  passingScore: number; // percentage
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }>;
}

export interface ProjectData {
  moduleSlug: string;
  title: string;
  slug: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  githubUrl: string;
  technologiesUsed: string[];
  learningObjectives: string[];
  suggestedImprovements: string[];
}

export interface InterviewQuestionData {
  moduleSlug: string;
  category: string; // e.g. "Core Java", "Spring Boot", "HR"
  question: string;
  answer: string; // Model answer
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}
