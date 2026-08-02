import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JobRolesService } from './job-roles.service';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CONTROLLER — no auth required
// ─────────────────────────────────────────────────────────────────────────────
@ApiTags('Job Roles')
@Public()
@Controller('job-roles')
export class PublicJobRolesController {
  constructor(private readonly jobRolesService: JobRolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published job roles (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'experienceLevel', required: false })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['alphabetical', 'newest'] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.jobRolesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      category,
      experienceLevel,
      sortBy,
      adminMode: false,
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured job roles (public)' })
  getFeatured() {
    return this.jobRolesService.findFeatured();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a job role by slug (public, with ID fallback)' })
  findOne(@Param('slug') slug: string) {
    return this.jobRolesService.findBySlug(slug);
  }

  @Get(':slug/companies')
  @ApiOperation({ summary: 'Get companies hiring for a role (public)' })
  async getCompanies(@Param('slug') slug: string) {
    const role = await this.jobRolesService.findBySlug(slug);
    return { data: role.companiesHiring };
  }

  @Get(':slug/projects')
  @ApiOperation({ summary: 'Get recommended projects for a role (public)' })
  async getProjects(@Param('slug') slug: string) {
    const role = await this.jobRolesService.findBySlug(slug);
    return { data: role.recommendedProjects };
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Get related job roles in the same category (public)' })
  getRelated(@Param('slug') slug: string) {
    return this.jobRolesService.getRelated(slug, 3);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CONTROLLER — JWT + Admin role required
// ─────────────────────────────────────────────────────────────────────────────
@ApiTags('Job Roles (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/job-roles')
export class AdminJobRolesController {
  constructor(private readonly jobRolesService: JobRolesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new job role (Admin only)' })
  @ApiResponse({ status: 201, description: 'Job role created successfully' })
  create(@Body() createJobRoleDto: CreateJobRoleDto) {
    return this.jobRolesService.create(createJobRoleDto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all job roles including unpublished (Admin only)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.jobRolesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      category,
      experienceLevel,
      sortBy,
      adminMode: true,
    });
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get a job role by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.jobRolesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update a job role (Admin only)' })
  update(@Param('id') id: string, @Body() updateJobRoleDto: UpdateJobRoleDto) {
    return this.jobRolesService.update(id, updateJobRoleDto);
  }

  @Patch(':id/publish')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a job role (Admin only)' })
  publish(@Param('id') id: string) {
    return this.jobRolesService.publish(id);
  }

  @Patch(':id/unpublish')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a job role (Admin only)' })
  unpublish(@Param('id') id: string) {
    return this.jobRolesService.unpublish(id);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a job role (Admin only)' })
  remove(@Param('id') id: string) {
    return this.jobRolesService.remove(id);
  }
}
