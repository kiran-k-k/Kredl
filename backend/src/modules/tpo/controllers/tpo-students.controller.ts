import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';
import { TpoStudentsService } from '../services/tpo-students.service';
import { AdminQueryDto } from '../../../common/dto/admin-query.dto';

@ApiTags('TPO Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.TPO, RoleEnum.ADMIN)
@Controller('tpo/students')
export class TpoStudentsController {
  constructor(private readonly tpoStudentsService: TpoStudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter all students (TPO view)' })
  @ApiResponse({ status: 200, description: 'Return paginated students list' })
  findAll(@Query() query: AdminQueryDto) {
    return this.tpoStudentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student details' })
  findOne(@Param('id') id: string) {
    return this.tpoStudentsService.findOne(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get student learning progress & placement readiness score' })
  getStudentProgress(@Param('id') id: string) {
    return this.tpoStudentsService.getStudentProgress(id);
  }
}
