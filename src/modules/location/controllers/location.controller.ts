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
import { LocationService } from '../services/location.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto/location.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../core';

@ApiTags('ViTri')
@Controller('api/vi-tri')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('locations_list')
  @CacheTTL(6000)
  @ApiOperation({ summary: 'Lấy danh sách vị trí' })
  findAll() {
    return this.locationService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Thêm vị trí mới (ADMIN)' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({ summary: 'Phân trang tìm kiếm vị trí' })
  paginateAndSearch(
    @Query('pageIndex') pageIndex: string,
    @Query('pageSize') pageSize: string,
    @Query('keyword') keyword: string,
  ) {
    const page = parseInt(pageIndex) || 1;
    const size = parseInt(pageSize) || 10;
    return this.locationService.paginateAndSearch(page, size, keyword || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin vị trí theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin vị trí' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa vị trí (chỉ dành cho ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.remove(id);
  }

  @Post('upload-hinh-vitri')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('formFile'))
  @ApiOperation({ summary: 'Upload hình ảnh cho vị trí' })
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
    @Query('maViTri', ParseIntPipe) maViTri: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.locationService.uploadImage(maViTri, file);
  }
}
