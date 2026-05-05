import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thêm phòng mới' })
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật phòng' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa phòng' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }

  @Post('upload-hinh-phong')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('formFile'))
  @ApiOperation({ summary: 'Upload hình ảnh cho phòng' })
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
