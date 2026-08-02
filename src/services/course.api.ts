import { api } from '@/lib/api';
import { CourseModulesListResponse } from '@/types/course-module';

export const getCourseModules = async (courseIdOrSlug: string): Promise<CourseModulesListResponse> => {
  const { data } = await api.get<any>(`/courses/${courseIdOrSlug}/modules`);
  return data?.data || data;
};
