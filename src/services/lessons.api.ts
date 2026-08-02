import { api } from '@/lib/api';
import { ModuleLessonsResponse, LessonDetailsResponse } from '@/types/lesson';

export const getModuleLessons = async (
  courseSlug: string,
  moduleSlug: string,
): Promise<ModuleLessonsResponse> => {
  const { data } = await api.get<ModuleLessonsResponse>(
    `/courses/${courseSlug}/modules/${moduleSlug}`,
  );
  return data;
};

export const getLessonDetails = async (
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<LessonDetailsResponse> => {
  const { data } = await api.get<LessonDetailsResponse>(
    `/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lessonSlug}`,
  );
  return data;
};

export const completeLesson = async (
  lessonId: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/lessons/${lessonId}/complete`,
  );
  return data;
};
