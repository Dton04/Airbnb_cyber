import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class SearchUserDto {
   @IsOptional()
   @IsNumberString()
   pageIndex?: string;

   @IsOptional()
   @IsNumberString()
   pageSize?: string;

   @IsOptional()
   @IsString()
   keyword?: string;
}