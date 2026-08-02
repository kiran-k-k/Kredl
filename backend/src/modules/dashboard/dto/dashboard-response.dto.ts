import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ContinueLearningDto } from './continue-learning.dto';
import { RecommendedCourseDto } from './recommended-course.dto';
import { ProgressSummaryDto } from './progress-summary-response.dto';
import { RecentActivityDto } from './recent-activity.dto';
import { NotificationResponseDto } from './notification.dto';

/**
 * Embedded snippet containing essential user profile information for the dashboard header.
 */
export class UserProfileSnippetDto {
  @ApiProperty({ description: 'The user ID' })
  @IsString()
  readonly id: string;

  @ApiProperty({ description: 'The user full name' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The user email address' })
  @IsEmail()
  readonly email: string;

  @ApiPropertyOptional({ description: 'The user profile image URL' })
  @IsOptional()
  @IsString()
  readonly avatar?: string;

  @ApiProperty({ description: 'The user role name' })
  @IsString()
  readonly role: string;

  @ApiPropertyOptional({ description: 'The user college name' })
  @IsOptional()
  @IsString()
  readonly college?: string;

  @ApiPropertyOptional({ description: 'The user department name' })
  @IsOptional()
  @IsString()
  readonly department?: string;

  @ApiProperty({ description: 'The user joined date' })
  @Type(() => Date)
  @IsDate()
  readonly joinedAt: Date;
}

/**
 * Master API response payload aggregating all dashboard sections into a single object.
 */
export class DashboardResponseDto {
  /** Essential user profile information */
  @ApiProperty({ type: UserProfileSnippetDto })
  @ValidateNested()
  @Type(() => UserProfileSnippetDto)
  readonly profile: UserProfileSnippetDto;

  /** List of courses the user is currently taking */
  @ApiPropertyOptional({
    type: ContinueLearningDto,
    description: 'Ongoing learning course',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContinueLearningDto)
  readonly continueLearning: ContinueLearningDto | null;

  /** List of curated course recommendations */
  @ApiProperty({ type: [RecommendedCourseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedCourseDto)
  readonly recommendedCourses: RecommendedCourseDto[];

  /** High-level learning metrics and statistics */
  @ApiProperty({ type: ProgressSummaryDto })
  @ValidateNested()
  @Type(() => ProgressSummaryDto)
  readonly progress: ProgressSummaryDto;

  /** Chronological feed of the user's latest actions */
  @ApiProperty({ type: [RecentActivityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecentActivityDto)
  readonly recentActivity: RecentActivityDto[];

  /** Unread or recent system notifications */
  @ApiProperty({ type: [NotificationResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationResponseDto)
  readonly notifications: NotificationResponseDto[];

  /** Timestamp when this dashboard payload was assembled */
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  readonly generatedAt: Date;
}
