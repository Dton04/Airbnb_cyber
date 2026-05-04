import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  tenViTri: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  tinhThanh: string;

  @ApiProperty({ example: 'Việt Nam' })
  @IsString()
  @IsNotEmpty()
  quocGia: string;

  @ApiProperty({ example: 'url_hinh_anh', required: false })
  @IsString()
  @IsOptional()
  hinhAnh?: string;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 'Hồ Chí Minh Updated', required: false })
  @IsString()
  @IsOptional()
  tenViTri?: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh', required: false })
  @IsString()
  @IsOptional()
  tinhThanh?: string;

  @ApiProperty({ example: 'Việt Nam', required: false })
  @IsString()
  @IsOptional()
  quocGia?: string;

  @ApiProperty({ example: 'url_hinh_anh_updated', required: false })
  @IsString()
  @IsOptional()
  hinhAnh?: string;
}
