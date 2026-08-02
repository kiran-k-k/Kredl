/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseModulesListResponseDto } from './dto/course-modules-response.dto';
import { ModuleLessonsResponseDto } from './dto/module-lessons-response.dto';
import { LessonDetailsResponseDto } from './dto/lesson-details-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get all published courses (Student/Public view)' })
  @ApiResponse({
    status: 200,
    description: 'Return all published courses',
    type: [CourseResponseDto],
  })
  async findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      difficulty?: string;
      sort?: string;
      isFeatured?: string;
    },
    @CurrentUser() user?: { sub: string; role?: string },
  ) {
    // Treat student role strictly to enforce isPublished constraint
    const callerRole = user?.role === RoleEnum.STUDENT ? 'student' : user?.role;
    const result = await this.coursesService.findAll(
      query,
      callerRole,
      user?.sub,
    );
    return {
      ...result,
      data: result.data.map((course) => this.mapCourseToDto(course)),
    };
  }

  @Public()
  @Get(':slug')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get a single course by slug' })
  @ApiResponse({
    status: 200,
    description: 'Return a single course',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(
    @Param('slug') slug: string,
    @CurrentUser() user?: { sub: string; role?: string },
  ): Promise<CourseResponseDto> {
    const callerRole = user?.role === RoleEnum.STUDENT ? 'student' : user?.role;
    const course = await this.coursesService.findOneBySlug(
      slug,
      callerRole,
      user?.sub,
    );
    return this.mapCourseToDto(course);
  }

  @Get(':courseId/modules')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({
    summary: 'Get course modules with progress and locking for student',
  })
  @ApiResponse({ status: 200, type: CourseModulesListResponseDto })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseModules(
    @Param('courseId') courseId: string,
    @CurrentUser() user: { sub: string },
  ): Promise<CourseModulesListResponseDto> {
    return this.coursesService.getCourseModules(courseId, user.sub);
  }

  @Get(':courseId/modules/:moduleSlug')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({
    summary: 'Get lessons of a course module with completion and lock status',
  })
  @ApiResponse({
    status: 200,
    description: 'Return module lessons',
    type: ModuleLessonsResponseDto,
  })
  async getModuleLessons(
    @Param('courseId') courseId: string,
    @Param('moduleSlug') moduleSlug: string,
    @CurrentUser() user: { sub: string },
  ): Promise<ModuleLessonsResponseDto> {
    return this.coursesService.getModuleLessons(courseId, moduleSlug, user.sub);
  }

  @Get(':courseSlug/modules/:moduleSlug/lessons/:lessonSlug')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({
    summary: 'Get unified details of a lesson for student learning view',
  })
  @ApiResponse({
    status: 200,
    description: 'Return full lesson details and navigation metadata',
    type: LessonDetailsResponseDto,
  })
  async getLessonDetails(
    @Param('courseSlug') courseSlug: string,
    @Param('moduleSlug') moduleSlug: string,
    @Param('lessonSlug') lessonSlug: string,
    @CurrentUser() user: { sub: string },
  ): Promise<LessonDetailsResponseDto> {
    return this.coursesService.getLessonDetails(
      courseSlug,
      moduleSlug,
      lessonSlug,
      user.sub,
    );
  }

  @Post(':id/enroll')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({ status: 200, description: 'Enrolled successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async enroll(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<{ success: boolean; message: string }> {
    await this.coursesService.enroll(id, user.sub);
    return { success: true, message: 'Enrolled successfully' };
  }

  private mapCourseToDto(course: any): CourseResponseDto {
    return {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription || '',
      description: course.description,
      thumbnail: course.thumbnail,
      thumbnailAlt: course.thumbnailAlt || '',
      difficulty: course.difficulty || course.difficultyLevel || 'Beginner',
      estimatedDuration: course.estimatedDuration || '',
      category: course.category,
      moduleCount: course.moduleCount || 0,
      lessonCount: course.lessonCount || 0,
      displayOrder: course.displayOrder || 0,
      isFeatured: !!course.isFeatured,
      isPublished: !!course.isPublished,
      seoTitle: course.seoTitle,
      seoDescription: course.seoDescription,
      isEnrolled: !!course.isEnrolled,
      completedLessons: course.completedLessons || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
