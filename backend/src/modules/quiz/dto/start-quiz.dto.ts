import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartQuizDto {
  @ApiProperty({ description: 'The ID of the module to start the quiz for' })
  @IsString()
  @IsNotEmpty()
  moduleId: string;
}
