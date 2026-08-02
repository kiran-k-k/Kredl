import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'user@kredl.dev',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role name for the invited user',
    example: 'Student',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
