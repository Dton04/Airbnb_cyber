import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Nguyen Van A Updated', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'user_updated@gmail.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsString()
  @IsOptional()
  birth_day?: string;

  @ApiProperty({ example: 'Nam', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: 'USER', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}
