import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SECURITY_CONFIG } from '../../config/security.config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import {
  QuizAttempt,
  QuizAttemptDocument,
  QuizAttemptStatus,
} from './schemas/quiz-attempt.schema';
import {
  CourseModule,
  CourseModuleDocument,
  ModuleStatus as CourseModuleStatus,
} from '../modules/schemas/module.schema';
import {
  Progress,
  ProgressDocument,
} from '../progress/schemas/progress.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  ModuleCompletion,
  ModuleCompletionDocument,
  ModuleStatus as ProgressModuleStatus,
} from '../progress/schemas/module-completion.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ProgressService } from '../progress/progress.service';
import {
  AdminActionsLog,
  AdminActionType,
} from '../admin-actions-log/schemas/admin-actions-log.schema';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectModel(CourseModule.name)
    private readonly courseModuleModel: Model<CourseModuleDocument>,
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(ModuleCompletion.name)
    private readonly moduleCompletionModel: Model<ModuleCompletionDocument>,
    @InjectModel(AdminActionsLog.name)
    private readonly adminLogModel: Model<AdminActionsLog>,
    private readonly progressService: ProgressService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // Admin CRUD Services
  // ──────────────────────────────────────────────────────────────────────────

  async createQuiz(
    createQuizDto: CreateQuizDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const moduleId = new Types.ObjectId(createQuizDto.moduleId);

    // Validate module exists
    const moduleExists = await this.courseModuleModel.findOne({
      _id: moduleId,
      isDeleted: { $ne: true },
    });
    if (!moduleExists) {
      throw new NotFoundException(
        `Module with ID ${createQuizDto.moduleId} not found`,
      );
    }

    // Check if module already has a quiz
    const existingQuiz = await this.quizModel.findOne({
      moduleId,
      isDeleted: false,
    });
    if (existingQuiz) {
      throw new BadRequestException('A quiz already exists for this module');
    }

    // Validate options count and correctAnswerIndex for each question
    if (createQuizDto.questions && createQuizDto.questions.length > 0) {
      this.validateQuestions(createQuizDto.questions);
    }

    const maxAttempts =
      createQuizDto.maxAttempts ?? SECURITY_CONFIG.QUIZ.DEFAULT_MAX_ATTEMPTS;
    const cooldownMinutes =
      createQuizDto.cooldownMinutes !== undefined
        ? createQuizDto.cooldownMinutes
        : SECURITY_CONFIG.QUIZ.DEFAULT_COOLDOWN_HOURS * 60;

    const quiz = new this.quizModel({
      ...createQuizDto,
      moduleId,
      maxAttempts,
      cooldownMinutes,
      createdBy: new Types.ObjectId(adminId),
      updatedBy: new Types.ObjectId(adminId),
    });

    const savedQuiz = await quiz.save();

    // Log admin action
    await this.logAdminAction(
      adminId,
      AdminActionType.CREATE,
      'Quiz',
      savedQuiz._id,
      { title: savedQuiz.title, moduleId: savedQuiz.moduleId.toString() },
      ipAddress,
      userAgent,
    );

    return savedQuiz;
  }

  async updateQuiz(
    quizId: string,
    updateQuizDto: UpdateQuizDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    const updatedData: Record<string, any> = {
      ...updateQuizDto,
      updatedBy: new Types.ObjectId(adminId),
    };

    if (updateQuizDto.questions) {
      this.validateQuestions(updateQuizDto.questions);
      // Increment version since questions are changing
      updatedData.version = (quiz.version || 1) + 1;
    }

    if (updateQuizDto.moduleId) {
      updatedData.moduleId = new Types.ObjectId(updateQuizDto.moduleId);
    }

    const updatedQuiz = await this.quizModel.findOneAndUpdate(
      { _id: new Types.ObjectId(quizId) },
      { $set: updatedData },
      { new: true },
    );

    if (!updatedQuiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    await this.logAdminAction(
      adminId,
      AdminActionType.UPDATE,
      'Quiz',
      updatedQuiz._id,
      { updateFields: Object.keys(updateQuizDto) },
      ipAddress,
      userAgent,
    );

    return updatedQuiz;
  }

  async deleteQuiz(
    quizId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const quiz = (await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    })) as any;
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    quiz.isDeleted = true;
    quiz.deletedAt = new Date();
    quiz.deletedBy = new Types.ObjectId(adminId);
    await quiz.save();

    await this.logAdminAction(
      adminId,
      AdminActionType.DELETE,
      'Quiz',
      quiz._id as Types.ObjectId,
      { title: quiz.title },
      ipAddress,
      userAgent,
    );
  }

  async findAllQuizzes(): Promise<Quiz[]> {
    return this.quizModel
      .find({ isDeleted: false })
      .populate('moduleId', 'title slug')
      .exec();
  }

  async publishQuiz(
    quizId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      throw new BadRequestException(
        'Quizzes must contain at least one question before publishing.',
      );
    }

    quiz.isPublished = true;
    quiz.updatedBy = new Types.ObjectId(adminId);
    const saved = await quiz.save();

    await this.logAdminAction(
      adminId,
      AdminActionType.UPDATE,
      'Quiz',
      quiz._id,
      { title: quiz.title, action: 'PUBLISH' },
      ipAddress,
      userAgent,
    );

    return saved;
  }

  async unpublishQuiz(
    quizId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    quiz.isPublished = false;
    quiz.updatedBy = new Types.ObjectId(adminId);
    const saved = await quiz.save();

    await this.logAdminAction(
      adminId,
      AdminActionType.UPDATE,
      'Quiz',
      quiz._id,
      { title: quiz.title, action: 'UNPUBLISH' },
      ipAddress,
      userAgent,
    );

    return saved;
  }

  async addQuestion(
    quizId: string,
    createQuestionDto: CreateQuestionDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    this.validateQuestions([createQuestionDto]);

    const order = createQuestionDto.order ?? quiz.questions.length;
    const newQuestion = {
      _id: new Types.ObjectId(),
      questionText: createQuestionDto.questionText,
      options: createQuestionDto.options,
      correctAnswerIndex: createQuestionDto.correctAnswerIndex,
      explanation: createQuestionDto.explanation,
      order,
    };

    quiz.questions.push(newQuestion);
    quiz.version = (quiz.version || 1) + 1;
    quiz.updatedBy = new Types.ObjectId(adminId);

    const saved = await quiz.save();

    await this.logAdminAction(
      adminId,
      AdminActionType.UPDATE,
      'Quiz',
      quiz._id,
      { action: 'ADD_QUESTION', questionText: createQuestionDto.questionText },
      ipAddress,
      userAgent,
    );

    return saved;
  }

  async editQuestion(
    quizId: string,
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    const question = quiz.questions.find(
      (q) => q._id.toString() === questionId,
    );
    if (!question) {
      throw new NotFoundException(
        `Question #${questionId} not found in this quiz`,
      );
    }

    if (updateQuestionDto.questionText !== undefined) {
      question.questionText = updateQuestionDto.questionText;
    }
    if (updateQuestionDto.options !== undefined) {
      question.options = updateQuestionDto.options;
    }
    if (updateQuestionDto.correctAnswerIndex !== undefined) {
      question.correctAnswerIndex = updateQuestionDto.correctAnswerIndex;
    }
    if (updateQuestionDto.explanation !== undefined) {
      question.explanation = updateQuestionDto.explanation;
    }
    if (updateQuestionDto.order !== undefined) {
      question.order = updateQuestionDto.order;
    }

    this.validateQuestions([question]);

    quiz.version = (quiz.version || 1) + 1;
    quiz.updatedBy = new Types.ObjectId(adminId);

    const saved = await quiz.save();

    await this.logAdminAction(
      adminId,
      AdminActionType.UPDATE,
      'Quiz',
      quiz._id,
      { action: 'EDIT_QUESTION', questionId },
      ipAddress,
      userAgent,
    );

    return saved;
  }

  async deleteQuestion(
    quizId: string,
    questionId: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    const initialLength = quiz.questions.length;
    quiz.questions = quiz.questions.filter(
      (q) => q._id.toString() !== questionId,
    );

    if (quiz.questions.length === initialLength) {
      throw new NotFoundException(
        `Question #${questionId} not found in this quiz`,
      );
    }

    quiz.version = (quiz.version || 1) + 1;
    quiz.updatedBy = new Types.ObjectId(adminId);

    const saved = await quiz.save();

    await this.logAdminAction(
      adminId,
      AdminActionType.UPDATE,
      'Quiz',
      quiz._id,
      { action: 'DELETE_QUESTION', questionId },
      ipAddress,
      userAgent,
    );

    return saved;
  }

  async reorderQuestions(
    quizId: string,
    questionIds: string[],
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({
      _id: new Types.ObjectId(quizId),
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz #${quizId} not found`);
    }

    const questionMap = new Map(
      quiz.questions.map((q) => [q._id.toString(), q]),
    );

    const reorderedQuestions: any[] = [];
    let orderIndex = 0;

    for (const qId of questionIds) {
      const q = questionMap.get(qId);
      if (!q) {
        throw new BadRequestException(
          `Question ID ${qId} does not belong to this quiz.`,
        );
      }
      q.order = orderIndex++;
      reorderedQuestions.push(q);
    }

    for (const [qId, q] of questionMap.entries()) {
      if (!questionIds.includes(qId)) {
        q.order = orderIndex++;
        reorderedQuestions.push(q);
      }
    }

    quiz.questions = reorderedQuestions;
    quiz.version = (quiz.version || 1) + 1;
    quiz.updatedBy = new Types.ObjectId(adminId);

    const saved = await quiz.save();

    await this.logAdminAction(
      adminId,
      AdminActionType.UPDATE,
      'Quiz',
      quiz._id,
      { action: 'REORDER_QUESTIONS', questionIds },
      ipAddress,
      userAgent,
    );

    return saved;
  }

  async getQuizForAdmin(moduleSlug: string): Promise<Quiz> {
    const moduleObj = await this.courseModuleModel
      .findOne({
        slug: moduleSlug,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!moduleObj) {
      throw new NotFoundException(`Module with slug ${moduleSlug} not found`);
    }

    const quiz = await this.quizModel.findOne({
      moduleId: moduleObj._id,
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`No quiz found for module ${moduleSlug}`);
    }

    return quiz;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Student Services
  // ──────────────────────────────────────────────────────────────────────────

  async getQuizForStudent(moduleSlug: string, userId: string): Promise<any> {
    const moduleObj = await this.courseModuleModel
      .findOne({
        slug: moduleSlug,
        status: CourseModuleStatus.PUBLISHED,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!moduleObj) {
      throw new NotFoundException(`Module with slug ${moduleSlug} not found`);
    }

    const isEnrolled = await this.progressService.checkEnrollment(
      new Types.ObjectId(userId),
      moduleObj.courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    await this.validateModuleAccessibility(userId, moduleObj);

    const quiz = await this.quizModel.findOne({
      moduleId: moduleObj._id,
      isPublished: true,
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`No quiz available for module ${moduleSlug}`);
    }

    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id.toString(),
      questionText: q.questionText,
      options: q.options,
    }));

    return {
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      timeLimitMinutes: quiz.timeLimitMinutes,
      passingScorePercentage: quiz.passingScorePercentage,
      totalMarks: quiz.totalMarks,
      maxAttempts: quiz.maxAttempts,
      cooldownMinutes: quiz.cooldownMinutes,
      questions: sanitizedQuestions,
    };
  }

  async getQuizByIdForStudent(moduleId: string, userId: string): Promise<any> {
    const moduleObj = await this.courseModuleModel
      .findOne({
        _id: new Types.ObjectId(moduleId),
        status: CourseModuleStatus.PUBLISHED,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!moduleObj) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const isEnrolled = await this.progressService.checkEnrollment(
      new Types.ObjectId(userId),
      moduleObj.courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    await this.validateModuleAccessibility(userId, moduleObj);

    const quiz = await this.quizModel.findOne({
      moduleId: moduleObj._id,
      isPublished: true,
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(
        `No published quiz found for module ID ${moduleId}`,
      );
    }

    const sortedQuestions = [...quiz.questions].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );
    const sanitizedQuestions = sortedQuestions.map((q) => ({
      _id: q._id.toString(),
      questionText: q.questionText,
      options: q.options,
    }));

    return {
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      timeLimitMinutes: quiz.timeLimitMinutes,
      passingScorePercentage: quiz.passingScorePercentage,
      totalMarks: quiz.totalMarks,
      maxAttempts: quiz.maxAttempts,
      cooldownMinutes: quiz.cooldownMinutes,
      questions: sanitizedQuestions,
    };
  }

  async startQuizAttempt(
    moduleId: string,
    userId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<any> {
    const moduleObj = await this.courseModuleModel
      .findOne({
        _id: new Types.ObjectId(moduleId),
        status: CourseModuleStatus.PUBLISHED,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!moduleObj) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const isEnrolled = await this.progressService.checkEnrollment(
      new Types.ObjectId(userId),
      moduleObj.courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    await this.validateModuleAccessibility(userId, moduleObj);
    await this.validateAllLessonsCompleted(userId, moduleObj);

    const quiz = await this.quizModel.findOne({
      moduleId: moduleObj._id,
      isPublished: true,
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(
        `No published quiz found for module ID ${moduleId}`,
      );
    }

    const attempts = await this.quizAttemptModel
      .find({ userId: new Types.ObjectId(userId), quizId: quiz._id })
      .sort({ attemptNumber: -1 });

    if (attempts.length >= quiz.maxAttempts) {
      throw new BadRequestException(
        'You have reached the maximum allowed attempts for this quiz.',
      );
    }

    if (attempts.length > 0) {
      const latestAttempt = attempts[0];
      const timeDiffMs =
        new Date().getTime() - new Date(latestAttempt.startedAt).getTime();
      const cooldownMs = quiz.cooldownMinutes * 60 * 1000;
      if (timeDiffMs < cooldownMs) {
        const remainingMinutes = Math.ceil(
          (cooldownMs - timeDiffMs) / (60 * 1000),
        );
        throw new BadRequestException(
          `You must wait ${remainingMinutes} minutes before attempting this quiz again.`,
        );
      }
    }

    const attemptNumber = attempts.length + 1;
    const attempt = new this.quizAttemptModel({
      userId: new Types.ObjectId(userId),
      quizId: quiz._id,
      moduleId: moduleObj._id,
      status: QuizAttemptStatus.IN_PROGRESS,
      attemptNumber,
      quizVersion: quiz.version || 1,
      startedAt: new Date(),
      ipAddress,
      deviceInfo,
      answers: [],
    });

    const savedAttempt = await attempt.save();

    return {
      attemptId: savedAttempt._id.toString(),
      startedAt: savedAttempt.startedAt,
      totalQuestions: quiz.questions.length,
    };
  }

  async submitQuizAttempt(
    attemptId: string,
    answers: { questionId: string; selectedAnswerIndex: number }[],
    userId: string,
  ): Promise<any> {
    const attempt = await this.quizAttemptModel.findOne({
      _id: new Types.ObjectId(attemptId),
    });
    if (!attempt) {
      throw new NotFoundException(`Quiz attempt #${attemptId} not found`);
    }

    if (attempt.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have access to this quiz attempt',
      );
    }

    if (attempt.status === QuizAttemptStatus.COMPLETED) {
      throw new BadRequestException(
        'This quiz attempt has already been submitted',
      );
    }

    const quiz = await this.quizModel.findOne({
      _id: attempt.quizId,
      isDeleted: false,
    });
    if (!quiz || !quiz.isPublished) {
      throw new NotFoundException(
        'Quiz is not found or is no longer published',
      );
    }

    const moduleObj = await this.courseModuleModel
      .findOne({
        _id: attempt.moduleId,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!moduleObj) {
      throw new NotFoundException('Associated module not found');
    }

    await this.validateModuleAccessibility(userId, moduleObj);
    await this.validateAllLessonsCompleted(userId, moduleObj);

    const gradedAnswers: any[] = [];
    let correctCount = 0;

    for (const submission of answers) {
      const question = quiz.questions.find(
        (q) => q._id.toString() === submission.questionId,
      );
      if (!question) {
        throw new BadRequestException(
          `Question with ID ${submission.questionId} not found in this quiz`,
        );
      }

      const isCorrect =
        question.correctAnswerIndex === submission.selectedAnswerIndex;
      if (isCorrect) {
        correctCount++;
      }

      gradedAnswers.push({
        questionId: question._id,
        selectedAnswerIndex: submission.selectedAnswerIndex,
        isCorrect,
      });
    }

    const score = correctCount;
    const totalQuestions = quiz.questions.length;
    const percentage =
      totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= quiz.passingScorePercentage;

    const completedAt = new Date();
    const timeTakenSeconds = Math.max(
      0,
      Math.round((completedAt.getTime() - attempt.startedAt.getTime()) / 1000),
    );

    attempt.answers = gradedAnswers;
    attempt.score = score;
    attempt.correctAnswers = score;
    attempt.wrongAnswers = totalQuestions - score;
    attempt.totalQuestions = totalQuestions;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = QuizAttemptStatus.COMPLETED;
    attempt.submittedAt = completedAt;
    attempt.completedAt = completedAt;
    attempt.timeTakenSeconds = timeTakenSeconds;

    const savedAttempt = await attempt.save();

    if (passed) {
      this.eventEmitter.emit('quiz.passed', {
        userId: new Types.ObjectId(userId),
        courseId: moduleObj.courseId,
        moduleId: moduleObj._id,
        quizId: quiz._id,
        percentage,
      });
    }

    return {
      attemptId: savedAttempt._id.toString(),
      score: savedAttempt.score,
      correctAnswers: savedAttempt.correctAnswers,
      wrongAnswers: savedAttempt.wrongAnswers,
      totalQuestions: savedAttempt.totalQuestions,
      percentage: savedAttempt.percentage,
      passed: savedAttempt.passed,
      attemptNumber: savedAttempt.attemptNumber,
    };
  }

  async getQuizResult(attemptId: string, userId: string): Promise<any> {
    const attempt = await this.quizAttemptModel.findOne({
      _id: new Types.ObjectId(attemptId),
    });
    if (!attempt) {
      throw new NotFoundException(`Quiz attempt #${attemptId} not found`);
    }

    if (attempt.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have access to this quiz attempt',
      );
    }

    if (attempt.status !== QuizAttemptStatus.COMPLETED) {
      throw new BadRequestException(
        'This quiz attempt has not been submitted yet',
      );
    }

    const quiz = await this.quizModel.findOne({
      _id: attempt.quizId,
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const totalQuestions = quiz.questions.length;
    const correct = attempt.score || 0;
    const incorrect = totalQuestions - correct;

    const answersDetail = attempt.answers.map((ans) => {
      const q = quiz.questions.find(
        (quest) => quest._id.toString() === ans.questionId.toString(),
      );
      return {
        questionId: ans.questionId.toString(),
        questionText: q?.questionText || '',
        options: q?.options || [],
        selectedAnswerIndex: ans.selectedAnswerIndex,
        correctAnswerIndex: q?.correctAnswerIndex ?? 0,
        isCorrect: ans.isCorrect,
        explanation: q?.explanation || '',
      };
    });

    return {
      score: correct,
      percentage: attempt.percentage,
      passed: attempt.passed,
      totalQuestions,
      correct,
      incorrect,
      answers: answersDetail,
    };
  }

  async submitAttempt(
    moduleSlug: string,
    userId: string,
    submitAttemptDto: SubmitAttemptDto,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<any> {
    const moduleObj = await this.courseModuleModel
      .findOne({
        slug: moduleSlug,
        status: CourseModuleStatus.PUBLISHED,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!moduleObj) {
      throw new NotFoundException(`Module with slug ${moduleSlug} not found`);
    }

    const isEnrolled = await this.progressService.checkEnrollment(
      new Types.ObjectId(userId),
      moduleObj.courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    await this.validateModuleAccessibility(userId, moduleObj);
    await this.validateAllLessonsCompleted(userId, moduleObj);

    const quiz = await this.quizModel.findOne({
      moduleId: moduleObj._id,
      isPublished: true,
      isDeleted: false,
    });
    if (!quiz) {
      throw new NotFoundException(`No quiz found for module ${moduleSlug}`);
    }

    const attempts = await this.quizAttemptModel
      .find({ userId: new Types.ObjectId(userId), quizId: quiz._id })
      .sort({ attemptNumber: -1 });

    if (attempts.length >= quiz.maxAttempts) {
      throw new BadRequestException(
        'You have reached the maximum allowed attempts for this quiz.',
      );
    }

    if (attempts.length > 0) {
      const latestAttempt = attempts[0];
      const timeDiffMs =
        new Date().getTime() - new Date(latestAttempt.startedAt).getTime();
      const cooldownMs = quiz.cooldownMinutes * 60 * 1000;
      if (timeDiffMs < cooldownMs) {
        const remainingMinutes = Math.ceil(
          (cooldownMs - timeDiffMs) / (60 * 1000),
        );
        throw new BadRequestException(
          `You must wait ${remainingMinutes} minutes before attempting this quiz again.`,
        );
      }
    }

    const attemptNumber = attempts.length + 1;
    const answers: any[] = [];
    let correctCount = 0;

    for (const submission of submitAttemptDto.answers) {
      const question = quiz.questions.find(
        (q) => q._id.toString() === submission.questionId,
      );
      if (!question) {
        throw new BadRequestException(
          `Question with ID ${submission.questionId} not found in this quiz`,
        );
      }

      const isCorrect =
        question.correctAnswerIndex === submission.selectedAnswerIndex;
      if (isCorrect) {
        correctCount++;
      }

      answers.push({
        questionId: question._id,
        selectedAnswerIndex: submission.selectedAnswerIndex,
        isCorrect,
      });
    }

    const score = correctCount;
    const totalQuestions = quiz.questions.length;
    const percentage =
      totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= quiz.passingScorePercentage;

    const startedAt = new Date(
      Date.now() - submitAttemptDto.timeTakenSeconds * 1000,
    );
    const submittedAt = new Date();

    const attempt = new this.quizAttemptModel({
      userId: new Types.ObjectId(userId),
      quizId: quiz._id,
      moduleId: moduleObj._id,
      answers,
      score,
      percentage,
      passed,
      attemptNumber,
      quizVersion: quiz.version || 1,
      timeTakenSeconds: submitAttemptDto.timeTakenSeconds,
      ipAddress,
      deviceInfo,
      startedAt,
      submittedAt,
    });

    const savedAttempt = await attempt.save();

    if (passed) {
      this.eventEmitter.emit('quiz.passed', {
        userId: new Types.ObjectId(userId),
        courseId: moduleObj.courseId,
        moduleId: moduleObj._id,
        quizId: quiz._id,
        percentage,
      });
    }

    return {
      attemptId: savedAttempt._id.toString(),
      score: savedAttempt.score,
      totalQuestions,
      percentage: savedAttempt.percentage,
      passed: savedAttempt.passed,
      attemptNumber: savedAttempt.attemptNumber,
      correctAnswers: quiz.questions.map((q) => ({
        questionId: q._id.toString(),
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation || '',
      })),
    };
  }

  async getAttempts(
    moduleSlug: string,
    userId: string,
  ): Promise<QuizAttempt[]> {
    const moduleObj = await this.courseModuleModel.findOne({
      slug: moduleSlug,
      isDeleted: { $ne: true },
    });
    if (!moduleObj) {
      throw new NotFoundException(`Module with slug ${moduleSlug} not found`);
    }

    return this.quizAttemptModel
      .find({
        userId: new Types.ObjectId(userId),
        moduleId: moduleObj._id,
      })
      .sort({ attemptNumber: -1 })
      .exec();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Helper Validations
  // ──────────────────────────────────────────────────────────────────────────

  private validateQuestions(questions: any[]): void {
    for (const q of questions) {
      if (
        q.correctAnswerIndex < 0 ||
        q.correctAnswerIndex >= q.options.length
      ) {
        throw new BadRequestException(
          `correctAnswerIndex (${q.correctAnswerIndex}) must be a valid index within options length (${q.options.length}) for question: "${q.questionText}"`,
        );
      }
      const uniqueOptions = new Set(
        q.options.map((o: string) => o.trim().toLowerCase()),
      );
      if (uniqueOptions.size !== q.options.length) {
        throw new BadRequestException(
          `Duplicate options are not allowed in options array for question: "${q.questionText}"`,
        );
      }
    }
  }

  private async validateModuleAccessibility(
    userId: string,
    moduleObj: CourseModuleDocument,
  ): Promise<void> {
    const modules = await this.courseModuleModel
      .find({ courseId: moduleObj.courseId, isDeleted: { $ne: true } })
      .sort({ order: 1 })
      .exec();

    const lessons = await this.lessonModel
      .find({
        moduleId: { $in: modules.map((m) => m._id) },
        isDeleted: { $ne: true },
      })
      .exec();

    const accessInfo = await this.progressService.calculateModuleAccess(
      new Types.ObjectId(userId),
      moduleObj.courseId,
      modules,
      lessons,
    );

    const moduleAccess = accessInfo.modulesAccess.find(
      (a: any) => a.moduleId === moduleObj._id.toString(),
    );

    if (moduleAccess?.locked) {
      throw new ForbiddenException(
        'Module is locked. Complete previous modules first.',
      );
    }
  }

  private async validateAllLessonsCompleted(
    userId: string,
    moduleObj: CourseModuleDocument,
  ): Promise<void> {
    const moduleLessons = await this.lessonModel
      .find({ moduleId: moduleObj._id, isDeleted: { $ne: true } })
      .exec();

    const progressDoc = await this.progressService.getProgress(
      new Types.ObjectId(userId),
      moduleObj.courseId,
    );

    const completedLessonSet = new Set(
      progressDoc
        ? progressDoc.completedLessons.map((id) => id.toString())
        : [],
    );

    const allCompleted = moduleLessons.every((l) =>
      completedLessonSet.has(l._id.toString()),
    );
    if (!allCompleted && moduleLessons.length > 0) {
      throw new ForbiddenException(
        'You must complete all lessons in this module before taking the quiz.',
      );
    }
  }

  private async logAdminAction(
    adminId: string,
    actionType: AdminActionType,
    targetEntity: string,
    targetEntityId?: Types.ObjectId,
    metadata: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const log = new this.adminLogModel({
        adminId: new Types.ObjectId(adminId),
        actionType,
        targetEntity,
        targetEntityId,
        metadata,
        ipAddress,
        userAgent,
      });
      await log.save();
    } catch (e) {
      this.logger.error('Failed to save admin action log', e);
    }
  }

  async getQuizzesAnalytics(): Promise<any[]> {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'quizattempts',
          let: { qId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$quizId', '$$qId'] },
                    { $eq: ['$status', 'COMPLETED'] },
                  ],
                },
              },
            },
          ],
          as: 'attempts',
        },
      },
      {
        $lookup: {
          from: 'coursemodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'moduleInfo',
        },
      },
      { $unwind: { path: '$moduleInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'courses',
          localField: 'moduleInfo.courseId',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: { path: '$courseInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          quizId: '$_id',
          quizName: '$title',
          moduleName: '$moduleInfo.title',
          courseName: '$courseInfo.title',
          totalAttempts: { $size: '$attempts' },
          avgScore: { $ifNull: [{ $avg: '$attempts.score' }, 0] },
          avgPercentage: { $ifNull: [{ $avg: '$attempts.percentage' }, 0] },
          highestScore: { $ifNull: [{ $max: '$attempts.score' }, 0] },
          lowestScore: { $ifNull: [{ $min: '$attempts.score' }, 0] },
          passCount: {
            $size: {
              $filter: {
                input: '$attempts',
                as: 'att',
                cond: { $eq: ['$$att.passed', true] },
              },
            },
          },
          failCount: {
            $size: {
              $filter: {
                input: '$attempts',
                as: 'att',
                cond: { $eq: ['$$att.passed', false] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          passRate: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              {
                $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100],
              },
              0,
            ],
          },
          failRate: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              {
                $multiply: [{ $divide: ['$failCount', '$totalAttempts'] }, 100],
              },
              0,
            ],
          },
        },
      },
    ];

    return this.quizModel.aggregate(pipeline).exec();
  }

  async getMostMissedQuestionsAnalytics(): Promise<any[]> {
    const pipeline: any[] = [
      { $match: { status: 'COMPLETED' } },
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$answers.questionId',
          quizId: { $first: '$quizId' },
          moduleId: { $first: '$moduleId' },
          incorrectCount: {
            $sum: { $cond: [{ $eq: ['$answers.isCorrect', false] }, 1, 0] },
          },
          totalCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quizInfo',
        },
      },
      { $unwind: '$quizInfo' },
      {
        $lookup: {
          from: 'coursemodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'moduleInfo',
        },
      },
      { $unwind: '$moduleInfo' },
      {
        $project: {
          questionId: '$_id',
          incorrectCount: 1,
          totalCount: 1,
          incorrectPercentage: {
            $multiply: [{ $divide: ['$incorrectCount', '$totalCount'] }, 100],
          },
          quizTitle: '$quizInfo.title',
          moduleTitle: '$moduleInfo.title',
          questionsList: '$quizInfo.questions',
        },
      },
      {
        $addFields: {
          questionDetails: {
            $filter: {
              input: '$questionsList',
              as: 'q',
              cond: { $eq: ['$$q._id', '$questionId'] },
            },
          },
        },
      },
      { $unwind: '$questionDetails' },
      {
        $project: {
          questionId: 1,
          incorrectCount: 1,
          incorrectPercentage: 1,
          quizTitle: 1,
          moduleTitle: 1,
          questionText: '$questionDetails.questionText',
          correctAnswer: {
            $arrayElemAt: [
              '$questionDetails.options',
              '$questionDetails.correctAnswerIndex',
            ],
          },
        },
      },
      { $sort: { incorrectCount: -1, incorrectPercentage: -1 } },
    ];

    return this.quizAttemptModel.aggregate(pipeline).exec();
  }
}
