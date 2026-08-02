import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'a1b2c3d4...',
    description: 'Verification token from email URL',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
