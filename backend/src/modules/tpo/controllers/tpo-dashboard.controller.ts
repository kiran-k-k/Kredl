import { Controller, Get, UseGuards } from '@nestjs/common';
import { TpoDashboardService } from '../services/tpo-dashboard.service';
import { TpoDashboardResponseDto } from '../dto/tpo-dashboard-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';

@Controller('tpo/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TpoDashboardController {
  constructor(private readonly dashboardService: TpoDashboardService) {}

  @Get()
  @Roles(RoleEnum.TPO, RoleEnum.ADMIN)
  async getOverview(): Promise<TpoDashboardResponseDto> {
    return this.dashboardService.getDashboardOverview();
  }
}
