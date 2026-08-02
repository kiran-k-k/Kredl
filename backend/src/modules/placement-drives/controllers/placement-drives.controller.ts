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
import { PlacementDrivesService } from '../services/placement-drives.service';
import { CreatePlacementDriveDto } from '../dto/create-placement-drive.dto';
import { UpdatePlacementDriveDto } from '../dto/update-placement-drive.dto';
import { AdminQueryDto } from '../../../common/dto/admin-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';

@ApiTags('Placement Drives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.TPO)
@Controller('placement-drives')
export class PlacementDrivesController {
  constructor(private readonly drivesService: PlacementDrivesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new placement drive' })
  @ApiResponse({
    status: 201,
    description: 'Placement Drive created successfully',
  })
  create(@Body() createDto: CreatePlacementDriveDto) {
    return this.drivesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all placement drives with pagination' })
  findAll(@Query() query: AdminQueryDto) {
    return this.drivesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a placement drive by ID' })
  findOne(@Param('id') id: string) {
    return this.drivesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a placement drive' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlacementDriveDto,
  ) {
    return this.drivesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a placement drive' })
  remove(@Param('id') id: string) {
    return this.drivesService.remove(id);
  }

  @Get(':id/eligible-students')
  @ApiOperation({ summary: 'Get eligible students for a placement drive' })
  getEligibleStudents(@Param('id') id: string) {
    return this.drivesService.getEligibleStudents(id);
  }
}
