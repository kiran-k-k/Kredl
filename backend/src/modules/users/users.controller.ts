import {
  Controller,
  Put,
  Get,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Put('me/onboarding')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Update student onboarding (Career Goal)' })
  @ApiResponse({ status: 200, description: 'Onboarding updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateOnboarding(
    @Body() updateOnboardingDto: UpdateOnboardingDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.usersService.updateOnboarding(user.sub, updateOnboardingDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile' })
  async getMe(@CurrentUser() user: { sub: string; roleName?: string }) {
    const profile = await this.usersService.findById(user.sub);
    if (!profile) throw new NotFoundException('Profile not found');
    const result = profile.toObject() as any;
    delete result.passwordHash;
    if (user.roleName) {
      result.roleName = user.roleName;
    }
    return result;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Return updated user profile' })
  async updateMe(@CurrentUser() user: { sub: string }, @Body() updateDto: any) {
    const profile = await this.usersService.updateProfile(user.sub, updateDto);
    if (!profile) throw new NotFoundException('Profile not found');
    const result = profile.toObject();
    delete result.passwordHash;
    return result;
  }

  @Get('career-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user career profile' })
  @ApiResponse({ status: 200, description: 'Return career profile' })
  async getCareerProfile(@CurrentUser() user: { sub: string }) {
    return this.usersService.getCareerProfile(user.sub);
  }

  @Put('career-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user career profile' })
  @ApiResponse({ status: 200, description: 'Return updated career profile' })
  async updateCareerProfile(
    @CurrentUser() user: { sub: string },
    @Body() updateDto: any, // Using any here for brevity, in a real app use UpdateCareerProfileDto
  ) {
    return this.usersService.updateCareerProfile(user.sub, updateDto);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and update user profile avatar' })
  @ApiResponse({ status: 200, description: 'Return updated profile with new avatar URL' })
  async uploadAvatar(
    @CurrentUser() user: { sub: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Upload image to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(file, {
      folder: 'user_avatars',
      width: 500,
      height: 500,
      crop: 'fill',
    });

    // Update user profile with the new secure URL
    const updatedProfile = await this.usersService.updateProfile(user.sub, {
      profileImage: uploadResult.url,
    });

    if (!updatedProfile) throw new NotFoundException('Profile not found');
    const result = updatedProfile.toObject();
    delete result.passwordHash;
    return result;
  }
}
