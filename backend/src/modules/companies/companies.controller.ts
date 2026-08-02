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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new company (Admin only)' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: any) {
    return this.companiesService.create(createCompanyDto, req.user?.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all companies with pagination and filter' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('activelyHiring') activelyHiring?: string,
    @Query('topSalary') topSalary?: string,
    @Query('skills') skills?: string,
  ) {
    console.log('API /companies called with skills:', skills);
    return this.companiesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      activelyHiring: activelyHiring === 'true',
      topSalary: topSalary === 'true',
      skills,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a company by id' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update a company by id (Admin only)' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Req() req: any) {
    return this.companiesService.update(id, updateCompanyDto, req.user?.id);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a company by id (Admin only)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.companiesService.remove(id, req.user?.id);
  }
}
