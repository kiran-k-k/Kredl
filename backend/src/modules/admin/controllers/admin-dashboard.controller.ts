import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';
import { AdminDashboardResponseDto } from '../dto/admin-dashboard-response.dto';
import { ApiResponseDto } from '../../../common/dto/api-response.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/overview')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get overall admin dashboard statistics and system health',
  })
  @ApiResponse({ status: 200, type: AdminDashboardResponseDto })
  async getDashboard() {
    return this.adminDashboardService.getDashboardOverview();
  }
}
