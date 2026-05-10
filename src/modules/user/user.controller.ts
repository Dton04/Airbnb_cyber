import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe, Request, MaxFileSizeValidator, FileTypeValidator, ParseFilePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchUserDto } from './dto/search-user.dto';

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
  @ApiQuery({
    name: 'keyword',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'pageIndex',
    required: false,
    example: 1,
  })
  paginateAndSearch(@Query() query: SearchUserDto) {
    const page = parseInt(query.pageIndex || "1");
    const size = parseInt(query.pageSize || "10");

    return this.userService.paginateAndSearch(
      page,
      size,
      query.keyword || '',
    );
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
  @ApiOperation({ summary: 'Upload avatar cho chính người dùng đang đăng nhập' })
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
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Max 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }), // Chỉ nhận ảnh
        ],
      }),
    ) file: Express.Multer.File,
    @Request() req,
  ) {
    return this.userService.uploadAvatar(req.user.id, file);
  }
}
