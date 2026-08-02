import { useQuery } from '@tanstack/react-query';
import { getLessonDetails } from '@/services/lessons.api';

export const useLessonDetails = (
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
) => {
  return useQuery({
    queryKey: ['lesson-details', courseSlug, moduleSlug, lessonSlug],
    queryFn: () => getLessonDetails(courseSlug, moduleSlug, lessonSlug),
    enabled: !!courseSlug && !!moduleSlug && !!lessonSlug,
  });
};
