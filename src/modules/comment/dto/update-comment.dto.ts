import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Nội dung cập nhật', required: false })
  @IsOptional()
  @IsString()
  noiDung?: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  saoBinhLuan?: number;
}

