import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  maPhong: number;

  @ApiProperty({ example: '2026-05-10T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  ngayDen: string;

  @ApiProperty({ example: '2026-05-15T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  ngayDi: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  soLuongKhach: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  maNguoiDat: number;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
