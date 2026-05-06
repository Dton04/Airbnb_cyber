import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('NguoiDung')
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  // @UseInterceptors(CacheInterceptor)
  // @CacheKey('users_list')
  // @CacheTTL(60000) // cache cho 60 giây
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thêm người dùng mới' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa người dùng' })
  remove(@Query('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Get('phan-trang-tim-kiem')
  @ApiOperation({ summary: 'Phân trang tìm kiếm người dùng' })
  paginateAndSearch(
    @Query('pageIndex') pageIndex: string,
    @Query('pageSize') pageSize: string,
    @Query('keyword') keyword: string,
  ) {
    const page = parseInt(pageIndex) || 1;
    const size = parseInt(pageSize) || 10;
    return this.userService.paginateAndSearch(page, size, keyword || '');
  }

  @Get('search/:TenNguoiDung')
  @ApiOperation({ summary: 'Tìm kiếm người dùng theo tên' })
  searchByName(@Param('TenNguoiDung') name: string) {
    return this.userService.searchByName(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.userService.update(id, updateUserDto, req.user);
  }

  @Post('upload-avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('formFile'))
  @ApiOperation({ summary: 'Upload avatar người dùng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        formFile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadAvatar(
    @Body('userId', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(userId, file);
  }
}
