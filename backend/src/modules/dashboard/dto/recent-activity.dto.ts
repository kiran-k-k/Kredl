import { ActivityType } from '../../../common/enums/activity-type.enum';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsDate,
} from 'class-validator';

export class ActivityMetadata {
  score?: number;
  percentage?: number;
  attemptNumber?: number;
  duration?: number;
  chapter?: number;
  completionPercentage?: number;
}

export class RecentActivityDto {
  /** Unique identifier for the activity record */
  readonly activityId: string;

  /** Type of activity strongly typed */
  readonly activityType: ActivityType;

  /** Title or short summary of the activity */
  readonly title: string;

  /** Detailed description of the activity */
  readonly description: string;

  /** Associated course ID, if applicable */
  readonly courseId?: string;

  /** Associated course title, if applicable */
  readonly courseTitle?: string;

  /** Associated module ID, if applicable */
  readonly moduleId?: string;

  /** Associated lesson ID, if applicable */
  readonly lessonId?: string;

  /** Timestamp when the activity occurred */
  readonly timestamp: Date;

  /** Additional contextual metadata */
  readonly metadata?: ActivityMetadata;
}

export class ActivityResponseDto {
  activities: RecentActivityDto[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
  generatedAt: Date;
}

export class ActivityQueryDto {
  @IsOptional()
  @IsEnum(ActivityType)
  activityType?: ActivityType;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fromDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  toDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc' = 'desc';
}
