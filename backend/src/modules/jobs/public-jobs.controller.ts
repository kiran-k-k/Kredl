import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Public Jobs')
@Controller('public/jobs')
@Public()
export class PublicJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active job listings (Public)' })
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
    @Query('sort') sort?: string,
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
      sort,
      isPublic: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single active job listing by id or slug (Public)' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
}
