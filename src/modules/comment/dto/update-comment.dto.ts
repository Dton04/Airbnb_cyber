import { ApiProperty } from '@nestjs/swagger';
import { Max, Min } from 'class-validator';

export class UpdateCommentDto {
   @ApiProperty()
   @ApiProperty({ example: 'Nội dung cập nhật' })
   noiDung: string;

   @ApiProperty({ example: 4 })
   @Min(1)
   @Max(5)
   saoBinhLuan: number;
}
