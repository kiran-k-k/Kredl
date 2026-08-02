import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardStatsDto {
  @ApiProperty({ example: 152 })
  users: number;

  @ApiProperty({ example: 18 })
  courses: number;

  @ApiProperty({ example: 92 })
  modules: number;

  @ApiProperty({ example: 410 })
  lessons: number;

  @ApiProperty({ example: 385 })
  notes: number;
}

export class AdminDashboardSystemDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: 'connected' })
  database: string;

  @ApiProperty({ example: 'online' })
  api: string;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({ example: '2026-07-08T00:00:00.000Z' })
  lastChecked: Date;
}

export class AdminRecentActivityDto {
  @ApiProperty({ example: 'UserRegistration' })
  type: string;

  @ApiProperty({ example: 'kiran@example.com joined Kredl' })
  description: string;

  @ApiProperty({ example: '2 mins ago' })
  time: string;

  @ApiProperty({ example: 'bg-blue-500' })
  color: string;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: AdminDashboardStatsDto })
  stats: AdminDashboardStatsDto;

  @ApiProperty({ type: [AdminRecentActivityDto] })
  recentActivity: AdminRecentActivityDto[];

  @ApiProperty({ type: AdminDashboardSystemDto })
  system: AdminDashboardSystemDto;
}
