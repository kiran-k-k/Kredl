import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit a new inquiry' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Inquiry submitted successfully.' })
  async create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all inquiries (Admin only)' })
  async findAll() {
    return this.inquiriesService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an inquiry (Admin only)' })
  async remove(@Param('id') id: string) {
    await this.inquiriesService.remove(id);
    return { message: 'Inquiry deleted successfully' };
  }
}
