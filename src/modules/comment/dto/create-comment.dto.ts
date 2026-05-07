import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateCommentDto {
   @ApiProperty({ example: 1 })
   @IsNumber()
   @IsNotEmpty()
   maPhong: number;

   @ApiProperty({ example: 'Phòng rất đẹp và sạch sẽ' })
   @IsString()
   @IsNotEmpty()
   noiDung: string;

   @ApiProperty({ example: 5 })
   @IsNumber()
   @Min(1)
   @Max(5)
   @IsNotEmpty()
   saoBinhLuan: number;
}