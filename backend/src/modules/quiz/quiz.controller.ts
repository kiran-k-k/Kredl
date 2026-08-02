import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { StartQuizDto } from './dto/start-quiz.dto';
import { StudentSubmitQuizDto } from './dto/student-submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Student Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.STUDENT)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get(':moduleId')
  @ApiOperation({
    summary: 'Get active published quiz details (answers hidden) for a module',
  })
  @ApiResponse({ status: 200, description: 'Return sanitized quiz' })
  @ApiResponse({
    status: 403,
    description: 'Module locked or student not enrolled',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  getQuiz(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.quizService.getQuizByIdForStudent(moduleId, user.sub);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a quiz attempt' })
  @ApiResponse({ status: 200, description: 'Quiz attempt started' })
  @ApiResponse({
    status: 400,
    description: 'Maximum attempts reached or cooldown active',
  })
  @ApiResponse({ status: 403, description: 'Module locked or not enrolled' })
  startQuiz(
    @Body() startQuizDto: StartQuizDto,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    return this.quizService.startQuizAttempt(
      startQuizDto.moduleId,
      user.sub,
      req.ip,
      userAgent,
    );
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted and graded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Already submitted or validation failed',
  })
  @ApiResponse({ status: 403, description: 'Module locked or not enrolled' })
  submitQuiz(
    @Body() submitQuizDto: StudentSubmitQuizDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.quizService.submitQuizAttempt(
      submitQuizDto.attemptId,
      submitQuizDto.answers,
      user.sub,
    );
  }

  @Get('result/:attemptId')
  @ApiOperation({
    summary: 'Get details of a submitted quiz attempt with explanations',
  })
  @ApiResponse({ status: 200, description: 'Return graded attempt results' })
  @ApiResponse({
    status: 400,
    description: 'Quiz attempt is still in progress',
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized access to another student result',
  })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  getResult(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.quizService.getQuizResult(attemptId, user.sub);
  }
}
