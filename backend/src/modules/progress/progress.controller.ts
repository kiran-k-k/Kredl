import { Controller, Get, Param, Post, Delete, Body, UseGuards, forwardRef, Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Types } from 'mongoose';
import { CourseIdDto } from './dto/course-id.dto';

// DTOs
export class QuizSubmitDto {
  courseId: string;
  moduleId: string;
  quizId: string;
  scorePercentage: number;
  passed: boolean;
  answers?: any[];
}

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('progress')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    @Inject(forwardRef(() => DashboardService)) private readonly dashboardService: DashboardService,
  ) {}

  @Get('course/:courseId')
  @Roles(RoleEnum.STUDENT, RoleEnum.ADMIN, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get detailed learning progress for a specific course' })
  async getCourseProgress(
    @Param('courseId') courseId: string,
    @CurrentUser() user: { sub: string },
  ) {
    const data = await this.progressService.getCourseProgressDetails(courseId, user.sub);
    return { success: true, data };
  }

  @Get('dashboard')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get all enrolled courses with progress for the student' })
  async getDashboard(@CurrentUser() user: { sub: string }) {
    const data = await this.progressService.getEnrolledCourses(user.sub);
    return { success: true, data };
  }

  @Post('lesson/:lessonId')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Mark a lesson as complete' })
  async markLessonComplete(
    @Param('lessonId') lessonId: string,
    @Body() { courseId }: CourseIdDto,
    @CurrentUser() user: { sub: string },
  ) {
    await this.progressService.markLessonComplete(
      new Types.ObjectId(user.sub),
      new Types.ObjectId(courseId),
      new Types.ObjectId(lessonId)
    );
    return { success: true, message: 'Lesson marked as complete' };
  }

  @Delete('lesson/:lessonId')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Mark a lesson as incomplete' })
  async markLessonIncomplete(
    @Param('lessonId') lessonId: string,
    @Body() { courseId }: CourseIdDto,
    @CurrentUser() user: { sub: string },
  ) {
    await this.progressService.markLessonIncomplete(
      new Types.ObjectId(user.sub),
      new Types.ObjectId(courseId),
      new Types.ObjectId(lessonId)
    );
    return { success: true, message: 'Lesson marked as incomplete' };
  }

  @Post('project/:projectId')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Toggle completion status of a project' })
  async toggleProjectCompletion(
    @Param('projectId') projectId: string,
    @Body() { courseId }: CourseIdDto,
    @CurrentUser() user: { sub: string },
  ) {
    const data = await this.progressService.toggleProjectCompletion(
      user.sub,
      courseId,
      projectId,
    );
    return { success: true, data };
  }

  @Post('quiz')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Save quiz score' })
  async saveQuizScore(
    @Body() dto: QuizSubmitDto,
    @CurrentUser() user: { sub: string },
  ) {
    await this.progressService.saveQuizScore(
      new Types.ObjectId(user.sub),
      new Types.ObjectId(dto.courseId),
      new Types.ObjectId(dto.moduleId),
      new Types.ObjectId(dto.quizId),
      dto.scorePercentage,
      dto.passed,
      dto.answers
    );
    return { success: true, message: 'Quiz score saved successfully' };
  }

  @Get('continue-learning')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get continue learning data' })
  async getContinueLearning(@CurrentUser() user: { sub: string }) {
    const data = await this.dashboardService.getContinueLearning(user.sub);
    return { success: true, data };
  }
}
