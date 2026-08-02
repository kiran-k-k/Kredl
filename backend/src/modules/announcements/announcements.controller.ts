import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AnnouncementsFilterDto } from './dto/announcements-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.TPO)
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
  })
  create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.announcementsService.create(createAnnouncementDto, user.sub);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({
    summary: 'Get all announcements with pagination and filtering',
  })
  @ApiResponse({ status: 200, description: 'Return all announcements' })
  findAll(@Query() query: AnnouncementsFilterDto) {
    return this.announcementsService.findAll(query);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get a single announcement by id' })
  @ApiResponse({ status: 200, description: 'Return a single announcement' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.TPO)
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiResponse({
    status: 200,
    description: 'Announcement updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.TPO)
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiResponse({
    status: 200,
    description: 'Announcement deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
