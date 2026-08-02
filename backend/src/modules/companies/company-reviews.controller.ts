import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyReviewsService } from './company-reviews.service';
import {
  CreateCompanyReviewDto,
  ModerateCompanyReviewDto,
  UpdateCompanyReviewDto,
} from './dto/company-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';

@ApiTags('Company Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CompanyReviewsController {
  constructor(private readonly reviewsService: CompanyReviewsService) {}

  // --- Admin Global Routes ---

  @Get('admin/companies/reviews/flagged')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get flagged/hidden reviews (Admin)' })
  getFlaggedReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.getFlaggedReviews({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // --- Company Specific Routes ---

  @Post('companies/:companyId/reviews')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Submit a review for a company (Student)' })
  create(
    @Param('companyId') companyId: string,
    @Body() createDto: CreateCompanyReviewDto,
    @Req() req: any,
  ) {
    return this.reviewsService.create(companyId, req.user.id, createDto);
  }

  @Get('companies/:companyId/reviews')
  @Roles(RoleEnum.STUDENT, RoleEnum.ADMIN, RoleEnum.TPO)
  @ApiOperation({ summary: 'Get all approved reviews for a company' })
  findAll(
    @Param('companyId') companyId: string,
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isAdmin = req.user.roles.includes(RoleEnum.ADMIN);
    return this.reviewsService.findAllForCompany(
      companyId,
      {
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      },
      isAdmin,
    );
  }

  @Patch('companies/:companyId/reviews/:reviewId')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Edit own review (Student)' })
  update(
    @Param('reviewId') reviewId: string,
    @Body() updateDto: UpdateCompanyReviewDto,
    @Req() req: any,
  ) {
    return this.reviewsService.update(reviewId, req.user.id, updateDto);
  }

  @Delete('companies/:companyId/reviews/:reviewId')
  @Roles(RoleEnum.STUDENT, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete review (Student owns it OR Admin)' })
  remove(@Param('reviewId') reviewId: string, @Req() req: any) {
    if (req.user.roles.includes(RoleEnum.ADMIN)) {
      return this.reviewsService.removeAsAdmin(reviewId, req.user.id);
    }
    return this.reviewsService.removeAsStudent(reviewId, req.user.id);
  }

  @Patch('companies/:companyId/reviews/:reviewId/moderate')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Moderate review status/visibility (Admin)' })
  moderate(
    @Param('reviewId') reviewId: string,
    @Body() moderateDto: ModerateCompanyReviewDto,
    @Req() req: any,
  ) {
    return this.reviewsService.moderate(reviewId, moderateDto, req.user.id);
  }
}
