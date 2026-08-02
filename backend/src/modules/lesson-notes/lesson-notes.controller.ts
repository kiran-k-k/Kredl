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
import { LessonNotesService } from './lesson-notes.service';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';
import { LessonNotesFilterDto } from './dto/lesson-notes-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Lesson Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lesson-notes')
export class LessonNotesController {
  constructor(private readonly lessonNotesService: LessonNotesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new lesson note' })
  @ApiResponse({ status: 201, description: 'Lesson note created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createLessonNoteDto: CreateLessonNoteDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.lessonNotesService.create(createLessonNoteDto, user.sub);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({
    summary: 'Get all lesson notes with pagination and filtering',
  })
  @ApiResponse({ status: 200, description: 'Return all lesson notes' })
  findAll(@Query() query: LessonNotesFilterDto) {
    return this.lessonNotesService.findAll(query);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get a single lesson note by id' })
  @ApiResponse({ status: 200, description: 'Return a single lesson note' })
  @ApiResponse({ status: 404, description: 'Lesson note not found' })
  findOne(@Param('id') id: string) {
    return this.lessonNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update a lesson note' })
  @ApiResponse({ status: 200, description: 'Lesson note updated successfully' })
  @ApiResponse({ status: 404, description: 'Lesson note not found' })
  update(
    @Param('id') id: string,
    @Body() updateLessonNoteDto: UpdateLessonNoteDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.lessonNotesService.update(id, updateLessonNoteDto, user.sub);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a lesson note (hard delete)' })
  @ApiResponse({ status: 200, description: 'Lesson note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lesson note not found' })
  remove(@Param('id') id: string) {
    return this.lessonNotesService.remove(id);
  }
}
