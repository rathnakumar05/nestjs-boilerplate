import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    required: false,
    type: String,
    description: 'First name of the user',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    type: String,
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: 'Password of the user',
    example: 'Str0ngP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  password: string;
}
