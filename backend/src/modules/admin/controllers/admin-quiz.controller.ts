import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { QuizService } from '../../quiz/quiz.service';
import { CreateQuizDto } from '../../quiz/dto/create-quiz.dto';
import { UpdateQuizDto } from '../../quiz/dto/update-quiz.dto';
import { CreateQuestionDto } from '../../quiz/dto/create-question.dto';
import { UpdateQuestionDto } from '../../quiz/dto/update-question.dto';
import { ReorderQuestionsDto } from '../../quiz/dto/reorder-questions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/quizzes')
export class AdminQuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all quizzes' })
  @ApiResponse({ status: 200, description: 'Return list of quizzes' })
  findAll() {
    return this.quizService.findAllQuizzes();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new quiz for a module' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Quiz already exists or validation failed',
  })
  create(
    @Body() createQuizDto: CreateQuizDto,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.createQuiz(
      createQuizDto,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.updateQuiz(
      id,
      updateQuizDto,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a quiz' })
  @ApiResponse({ status: 204, description: 'Quiz deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.deleteQuiz(
      id,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz published successfully' })
  @ApiResponse({
    status: 400,
    description: 'Quiz requires at least one question before publishing',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  publish(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.publishQuiz(
      id,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz unpublished successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  unpublish(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.unpublishQuiz(
      id,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('modules/:moduleSlug')
  @ApiOperation({
    summary: 'Get full quiz details (with correct answers) for a module',
  })
  @ApiResponse({ status: 200, description: 'Return full quiz' })
  @ApiResponse({ status: 404, description: 'Quiz or Module not found' })
  findOne(@Param('moduleSlug') moduleSlug: string) {
    return this.quizService.getQuizForAdmin(moduleSlug);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Question Management Endpoints
  // ──────────────────────────────────────────────────────────────────────────

  @Post(':id/questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new question to a quiz' })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or duplicate options',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  addQuestion(
    @Param('id') quizId: string,
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.addQuestion(
      quizId,
      createQuestionDto,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch(':id/questions/:questionId')
  @ApiOperation({ summary: 'Edit an existing question in a quiz' })
  @ApiResponse({ status: 200, description: 'Question edited successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or duplicate options',
  })
  @ApiResponse({ status: 404, description: 'Quiz or Question not found' })
  editQuestion(
    @Param('id') quizId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.editQuestion(
      quizId,
      questionId,
      updateQuestionDto,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id/questions/:questionId')
  @ApiOperation({ summary: 'Delete a question from a quiz' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quiz or Question not found' })
  deleteQuestion(
    @Param('id') quizId: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.deleteQuestion(
      quizId,
      questionId,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch(':id/questions/reorder')
  @ApiOperation({ summary: 'Reorder questions in a quiz' })
  @ApiResponse({ status: 200, description: 'Questions reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid question IDs list' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  reorderQuestions(
    @Param('id') quizId: string,
    @Body() reorderQuestionsDto: ReorderQuestionsDto,
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
  ) {
    return this.quizService.reorderQuestions(
      quizId,
      reorderQuestionsDto.questionIds,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }
}
