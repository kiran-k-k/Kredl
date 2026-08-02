import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
import { Roles } from './modules/auth/decorators/roles.decorator';
import { RoleEnum } from './modules/roles/schemas/role.schema';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';
import type { JwtUser } from './modules/auth/interfaces/jwt-payload.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Demo RBAC')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('demo/public')
  getPublicEndpoint(): string {
    return 'This is a public endpoint. Anyone can access it without a JWT.';
  }

  @Get('demo/authenticated')
  getAuthenticatedEndpoint(@CurrentUser() user: JwtUser): string {
    return `This is a protected endpoint. Welcome, ${user.email}! Your role is: ${user.roleName}.`;
  }

  @Roles(RoleEnum.STUDENT)
  @Get('demo/student-only')
  getStudentEndpoint(@CurrentUser() user: JwtUser): string {
    return `Access Granted to STUDENT. Welcome, ${user.email}!`;
  }

  @Roles(RoleEnum.ADMIN)
  @Get('demo/admin-only')
  getAdminEndpoint(@CurrentUser() user: JwtUser): string {
    return `Access Granted to ADMIN. Welcome, ${user.email}!`;
  }

  @Roles(RoleEnum.TPO)
  @Get('demo/tpo-only')
  getTpoEndpoint(@CurrentUser() user: JwtUser): string {
    return `Access Granted to TPO. Welcome, ${user.email}!`;
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TPO)
  @Get('demo/admin-and-tpo')
  getAdminAndTpoEndpoint(@CurrentUser() user: JwtUser): string {
    return `Access Granted to ADMIN or TPO. Welcome, ${user.email}! Your role is: ${user.roleName}.`;
  }
}
