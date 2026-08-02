import { useQuery } from '@tanstack/react-query';
import { getModuleLessons } from '@/services/lessons.api';

export const useModuleLessons = (courseSlug: string, moduleSlug: string) => {
  return useQuery({
    queryKey: ['module-lessons', courseSlug, moduleSlug],
    queryFn: () => getModuleLessons(courseSlug, moduleSlug),
    enabled: !!courseSlug && !!moduleSlug,
  });
};
