import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Phòng VIP' })
  @IsString()
  @IsNotEmpty()
  tenPhong: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @IsNotEmpty()
  khach: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsOptional()
  phongNgu?: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsOptional()
  giuong?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  phongTam?: number;

  @ApiProperty({ example: 'Phòng đẹp view biển' })
  @IsString()
  @IsOptional()
  moTa?: string;

  @ApiProperty({ example: 1000000 })
  @IsInt()
  @IsOptional()
  giaTien?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  mayGiat?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  banLa?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  tivi?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  dieuHoa?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  wifi?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  bep?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  doXe?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  hoBoi?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  banUi?: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  maViTri: number;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) { }
