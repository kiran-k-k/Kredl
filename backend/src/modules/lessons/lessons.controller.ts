import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsFilterDto } from './dto/lessons-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SECURITY_CONFIG } from '../../config/security.config';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.lessonsService.create(createLessonDto, user.sub);
  }

  @Public()
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get all lessons with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Return all lessons' })
  findAll(@Query() query: LessonsFilterDto) {
    return this.lessonsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @Throttle({
    default: {
      limit: SECURITY_CONFIG.THROTTLER.LESSONS.LIMIT,
      ttl: SECURITY_CONFIG.THROTTLER.LESSONS.TTL,
    },
  })
  @ApiOperation({ summary: 'Get a single lesson by id' })
  @ApiResponse({ status: 200, description: 'Return a single lesson' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.lessonsService.update(id, updateLessonDto, user.sub);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a lesson (hard delete)' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.lessonsService.remove(id, user.sub);
  }

  @Post(':id/complete')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Mark lesson as completed for the student' })
  @ApiResponse({ status: 200, description: 'Lesson completed status updated' })
  @ApiResponse({
    status: 404,
    description: 'Lesson or parent module not found',
  })
  async complete(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<{ success: boolean; message: string }> {
    await this.lessonsService.completeLesson(id, user.sub);
    return {
      success: true,
      message: 'Lesson marked as completed successfully',
    };
  }
}
