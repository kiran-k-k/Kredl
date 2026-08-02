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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new job listing (Admin only)' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all job listings with pagination and filters (Admin only)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('employmentType') employmentType?: string,
    @Query('workMode') workMode?: string,
    @Query('location') location?: string,
    @Query('companyId') companyId?: string,
    @Query('roleId') roleId?: string,
    @Query('experienceRequired') experienceRequired?: string,
  ) {
    return this.jobsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      employmentType,
      workMode,
      location,
      companyId,
      roleId,
      experienceRequired,
    });
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get a job listing by id (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update a job listing by id (Admin only)' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a job listing by id (Admin only)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?._id?.toString();
    return this.jobsService.remove(id, adminId);
  }
}
