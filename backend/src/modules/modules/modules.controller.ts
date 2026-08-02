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
import { CourseModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesFilterDto } from './dto/modules-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modules')
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new module' })
  @ApiResponse({ status: 201, description: 'Module created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createModuleDto: CreateModuleDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.courseModulesService.create(createModuleDto, user.sub);
  }

  @Public()
  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get all modules with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Return all modules' })
  findAll(@Query() query: ModulesFilterDto) {
    return this.courseModulesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.STUDENT, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get a single module by id' })
  @ApiResponse({ status: 200, description: 'Return a single module' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  findOne(@Param('id') id: string) {
    return this.courseModulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({ status: 200, description: 'Module updated successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.courseModulesService.update(id, updateModuleDto, user.sub);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a module (hard delete)' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.courseModulesService.remove(id, user.sub);
  }
}
