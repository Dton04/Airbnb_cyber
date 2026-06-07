import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoomService } from '../services/room.service';
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../core';

@ApiTags('PhongThue')
@Controller('api/phong-thue')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('rooms_list')
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Lấy danh sách phòng' })
  findAll() {
    return this.roomService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Thêm phòng mới (chỉ dành cho ADMIN)' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get('lay-phong-theo-vi-tri')
  @ApiOperation({ summary: 'Lấy danh sách phòng theo vị trí' })
  findByLocation(@Query('maViTri', ParseIntPipe) maViTri: number) {
    return this.roomService.findByLocation(maViTri);
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({ summary: 'Phân trang tìm kiếm phòng' })
  paginateAndSearch(
    @Query('pageIndex') pageIndex: string,
    @Query('pageSize') pageSize: string,
    @Query('keyword') keyword: string,
  ) {
    const page = parseInt(pageIndex) || 1;
    const size = parseInt(pageSize) || 10;
    return this.roomService.paginateAndSearch(page, size, keyword || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết phòng' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật phòng (chỉ dành cho ADMIN)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa phòng (chỉ dành cho ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }

  @Post('upload-hinh-phong')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('formFile'))
  @ApiOperation({ summary: 'Upload hình ảnh cho phòng (chỉ dành cho ADMIN)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        formFile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadImage(
    @Query('maPhong', ParseIntPipe) maPhong: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.roomService.uploadImage(maPhong, file);
  }
}
