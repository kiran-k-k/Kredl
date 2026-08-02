export class TpoDashboardResponseDto {
  stats: {
    totalStudents: number;
    placedStudents: number;
    placementRate: string;
    activeDrives: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'drive' | 'student' | 'announcement';
    title: string;
    description: string;
    timestamp: string;
  }>;
}
