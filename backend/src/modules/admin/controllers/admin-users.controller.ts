import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserStatus } from '../../users/schemas/user.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';
import { InviteUserDto } from '../dto/invite-user.dto';
import { Post } from '@nestjs/common';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new user' })
  async inviteUser(@Body() inviteUserDto: InviteUserDto) {
    return this.authService.inviteUser(inviteUserDto.email, inviteUserDto.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAllAdmin(
      parseInt(page),
      parseInt(limit),
      search,
      role,
      status,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    const user = await this.usersService.updateUserStatus(id, status);

    if (!user) {
      return { message: 'User not found' }; // Consider throwing NotFoundException in a real app
    }

    return {
      message: 'User status updated successfully',
      user: {
        id: user._id,
        status: user.status,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() admin: { sub: string },
  ) {
    await this.usersService.softDeleteUser(id, admin.sub);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/reset-password-link')
  @ApiOperation({ summary: 'Generate a direct password reset link for a user' })
  async generateResetLink(@Param('id') id: string) {
    return this.authService.generateAdminResetLink(id);
  }
}
