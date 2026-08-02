import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderQuestionsDto {
  @ApiProperty({ type: [String], description: 'Ordered list of question IDs' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  questionIds: string[];
}
