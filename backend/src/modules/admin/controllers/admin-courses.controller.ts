/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CoursesService } from '../../courses/courses.service';
import { CreateCourseDto } from '../../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../../courses/dto/update-course.dto';
import { CourseResponseDto } from '../../courses/dto/course-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: { sub: string },
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.create(createCourseDto, user.sub);
    return this.mapCourseToDto(course);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get course management dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats() {
    return this.coursesService.getAdminStats();
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all courses with full pagination/search/filtering (Admin view)',
  })
  @ApiResponse({ status: 200, description: 'Return all courses formatted' })
  async findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      difficulty?: string;
      sort?: string;
    },
  ) {
    const result = await this.coursesService.findAll(query, 'admin');
    return {
      ...result,
      data: result.data.map((course) => this.mapCourseToDto(course)),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: { sub: string },
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.update(
      id,
      updateCourseDto,
      user.sub,
    );
    return this.mapCourseToDto(course);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a course (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course soft-deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    await this.coursesService.remove(id, user.sub);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a course (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Course published successfully',
    type: CourseResponseDto,
  })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.publish(id, user.sub);
    return this.mapCourseToDto(course);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a course (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Course unpublished successfully',
    type: CourseResponseDto,
  })
  async unpublish(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.unpublish(id, user.sub);
    return this.mapCourseToDto(course);
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
