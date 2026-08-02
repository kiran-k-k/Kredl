with open('src/services/progress.api.ts', 'r') as f:
    content = f.read()

# I will add the interface and change getDashboardProgress return type

interface_string = """export interface EnrolledCourse {
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
"""

content = content.replace("""export const getDashboardProgress = async (): Promise<any> => {
  const { data } = await api.get<{ success: boolean; data: any }>(
    '/progress/dashboard',
  );""", interface_string)

with open('src/services/progress.api.ts', 'w') as f:
    f.write(content)
