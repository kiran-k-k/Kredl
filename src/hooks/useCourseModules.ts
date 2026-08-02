import { useQuery } from '@tanstack/react-query';
import { getCourseModules } from '@/services/course.api';

export const useCourseModules = (courseIdOrSlug: string) => {
  return useQuery({
    queryKey: ['course-modules', courseIdOrSlug],
    queryFn: () => getCourseModules(courseIdOrSlug),
    enabled: !!courseIdOrSlug,
  });
};
