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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsFilterDto } from './dto/projects-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.projectsService.create(createProjectDto, user.sub);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get all projects with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Return all projects' })
  findAll(@Query() query: ProjectsFilterDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get a single project by id' })
  @ApiResponse({ status: 200, description: 'Return a single project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('module/:moduleId')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get projects by module id' })
  @ApiResponse({
    status: 200,
    description: 'Return projects for a specific module',
  })
  findByModuleId(@Param('moduleId') moduleId: string) {
    return this.projectsService.findByModuleId(moduleId);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.projectsService.update(id, updateProjectDto, user.sub);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a project (hard delete)' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.projectsService.remove(id, user.sub);
  }
}
