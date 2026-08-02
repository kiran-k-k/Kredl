import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { QuizService } from '../../quiz/quiz.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly quizService: QuizService) {}

  @Get('quizzes')
  @ApiOperation({ summary: 'Get quiz aggregate analytics' })
  @ApiResponse({
    status: 200,
    description: 'Return summary statistics for quizzes',
  })
  async getQuizzesAnalytics() {
    const data = await this.quizService.getQuizzesAnalytics();
    return {
      success: true,
      message: 'Quizzes analytics retrieved successfully',
      data,
      timestamp: new Date(),
    };
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get most missed questions analytics' })
  @ApiResponse({
    status: 200,
    description: 'Return list of most missed questions',
  })
  async getMostMissedQuestions() {
    const data = await this.quizService.getMostMissedQuestionsAnalytics();
    return {
      success: true,
      message: 'Most missed questions retrieved successfully',
      data,
      timestamp: new Date(),
    };
  }
}
