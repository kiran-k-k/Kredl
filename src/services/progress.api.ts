import { api } from '@/lib/api';

export interface NextLessonInfo {
  lessonId: string;
  title: string;
  order: number;
  slug: string;
}

export interface ContinueLearningResponse {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnail: string;
  moduleId: string;
  moduleTitle: string;
  moduleSlug: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonSlug?: string;
  completionPercentage: number;
  lastWatchedAt: string;
  nextLesson?: NextLessonInfo;
}

export interface CourseProgressResponse {
  courseProgress: number;
  moduleProgress: number;
  completedLessons: string[];
  completedModules: string[];
  currentLesson: { id: string; title: string; slug: string } | null;
  currentModule: { id: string; title: string; slug: string } | null;
  courseCompleted: boolean;
  moduleCompleted: boolean;
  completionDate: string | null;
}

export interface QuizSubmitPayload {
  courseId: string;
  moduleId: string;
  quizId: string;
  scorePercentage: number;
  passed: boolean;
  answers?: any[];
}

export const getContinueLearning = async (): Promise<ContinueLearningResponse | null> => {
  const { data } = await api.get<{
    success: boolean;
    data: { continueLearning: ContinueLearningResponse | null };
  }>('/progress/continue-learning');
  return data.data.continueLearning;
};

export const getCourseProgress = async (
  courseId: string,
): Promise<CourseProgressResponse> => {
  const { data } = await api.get<{ success: boolean; data: CourseProgressResponse }>(
    `/progress/course/${courseId}`,
  );
  return data.data;
};

export interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  progress: number;
  lastAccessedAt: string;
  totalLessons: number;
  completedLessons: number;
  status: string;
}

export const getDashboardProgress = async (): Promise<EnrolledCourse[]> => {
  const { data } = await api.get<{ success: boolean; data: EnrolledCourse[] }>(
    '/progress/dashboard',
  );

  return data.data;
};

export const markLessonComplete = async (
  lessonId: string,
  courseId: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/progress/lesson/${lessonId}`,
    { courseId },
  );
  return data;
};

export const markLessonIncomplete = async (
  lessonId: string,
  courseId: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `/progress/lesson/${lessonId}`,
    { data: { courseId } },
  );
  return data;
};

export const toggleProjectCompletion = async (
  projectId: string,
  courseId: string,
): Promise<{ success: boolean; data: any }> => {
  const { data } = await api.post<{ success: boolean; data: any }>(
    `/progress/project/${projectId}`,
    { courseId },
  );
  return data;
};

export const saveQuizScore = async (
  payload: QuizSubmitPayload,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/progress/quiz`,
    payload,
  );
  return data;
};
