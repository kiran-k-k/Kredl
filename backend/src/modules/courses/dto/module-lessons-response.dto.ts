import { ApiProperty } from '@nestjs/swagger';

export class ModuleLessonDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  order: number;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  locked: boolean;
}

export class ModuleDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;
}

export class ModuleLessonsResponseDto {
  @ApiProperty({ type: ModuleDetailsDto })
  module: ModuleDetailsDto;

  @ApiProperty({ type: [ModuleLessonDto] })
  lessons: ModuleLessonDto[];
}
