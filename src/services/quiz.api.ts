import { api } from '@/lib/api';

export interface QuestionInfo {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  order: number;
}

export interface QuizInfo {
  _id: string;
  moduleId: any; // populated or unpopulated
  title: string;
  description?: string;
  questions: QuestionInfo[];
  timeLimitMinutes: number;
  passingScorePercentage: number;
  totalMarks: number;
  isPublished: boolean;
  maxAttempts: number;
  cooldownMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizInput {
  moduleId: string;
  title: string;
  description?: string;
  questions?: Omit<QuestionInfo, '_id' | 'order'>[];
  timeLimitMinutes?: number;
  passingScorePercentage?: number;
  totalMarks?: number;
  maxAttempts?: number;
  cooldownMinutes?: number;
  type?: string;
  targetCompanies?: string[];
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScorePercentage?: number;
  totalMarks?: number;
  maxAttempts?: number;
  cooldownMinutes?: number;
}

export interface QuestionInput {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  order?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN QUIZ APIs
// ──────────────────────────────────────────────────────────────────────────────

export const getAdminQuizzes = async (): Promise<QuizInfo[]> => {
  const { data } = await api.get<any>('/admin/quizzes');
  return data?.data || data;
};

export const getAdminQuizDetails = async (moduleSlug: string): Promise<QuizInfo> => {
  const { data } = await api.get<any>(`/admin/quizzes/modules/${moduleSlug}`);
  return data?.data || data;
};

export const createQuiz = async (input: CreateQuizInput): Promise<QuizInfo> => {
  const { data } = await api.post<any>('/admin/quizzes', input);
  return data?.data || data;
};

export const updateQuiz = async (id: string, input: UpdateQuizInput): Promise<QuizInfo> => {
  const { data } = await api.patch<any>(`/admin/quizzes/${id}`, input);
  return data?.data || data;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  await api.delete(`/admin/quizzes/${id}`);
};

export const publishQuiz = async (id: string): Promise<QuizInfo> => {
  const { data } = await api.post<any>(`/admin/quizzes/${id}/publish`);
  return data?.data || data;
};

export const unpublishQuiz = async (id: string): Promise<QuizInfo> => {
  const { data } = await api.post<any>(`/admin/quizzes/${id}/unpublish`);
  return data?.data || data;
};

// ──────────────────────────────────────────────────────────────────────────────
// QUESTION CRUD APIs
// ──────────────────────────────────────────────────────────────────────────────

export const addQuestion = async (quizId: string, input: QuestionInput): Promise<QuizInfo> => {
  const { data } = await api.post<any>(`/admin/quizzes/${quizId}/questions`, input);
  return data?.data || data;
};

export const editQuestion = async (
  quizId: string,
  questionId: string,
  input: Partial<QuestionInput>,
): Promise<QuizInfo> => {
  const { data } = await api.patch<any>(
    `/admin/quizzes/${quizId}/questions/${questionId}`,
    input,
  );
  return data?.data || data;
};

export const deleteQuestion = async (quizId: string, questionId: string): Promise<QuizInfo> => {
  const { data } = await api.delete<any>(
    `/admin/quizzes/${quizId}/questions/${questionId}`,
  );
  return data?.data || data;
};

export const reorderQuestions = async (
  quizId: string,
  questionIds: string[],
): Promise<QuizInfo> => {
  const { data } = await api.patch<any>(`/admin/quizzes/${quizId}/questions/reorder`, {
    questionIds,
  });
  return data?.data || data;
};
