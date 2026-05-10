import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private mapToResponse(viTri: any) {
    if (!viTri) return viTri;
    return {
      id: viTri.id,
      tenViTri: viTri.ten_vi_tri,
      tinhThanh: viTri.tinh_thanh,
      quocGia: viTri.quoc_gia,
      hinhAnh: viTri.hinh_anh,
    };
  }

  async findAll() {
    const data = await this.prisma.viTri.findMany({
      where: { isDeleted: false },
    });
    return data.map((item) => this.mapToResponse(item));
  }

  async create(dto: CreateLocationDto) {
    const newLocation = await this.prisma.viTri.create({
      data: {
        ten_vi_tri: dto.tenViTri,
        tinh_thanh: dto.tinhThanh,
        quoc_gia: dto.quocGia,
        hinh_anh: dto.hinhAnh,
      },
    });
    await this.cacheManager.del('locations_list');
    return this.mapToResponse(newLocation);
  }

  async remove(id: number) {
    const location = await this.prisma.viTri.findFirst({ where: { id, isDeleted: false } });
    if (!location) throw new NotFoundException('Location not found');

    await this.prisma.viTri.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await this.cacheManager.del('locations_list');
    return { message: 'Location deleted successfully' };
  }

  async paginateAndSearch(pageIndex: number, pageSize: number, keyword: string) {
    const skip = (pageIndex - 1) * pageSize;
    const whereCondition: any = { isDeleted: false };
    
    if (keyword) {
      whereCondition.ten_vi_tri = { contains: keyword };
    }

    const [data, total] = await Promise.all([
      this.prisma.viTri.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
      }),
      this.prisma.viTri.count({ where: whereCondition }),
    ]);

    return {
      pageIndex,
      pageSize,
      totalRow: total,
      data: data.map((item) => this.mapToResponse(item)),
    };
  }

  async findOne(id: number) {
    const location = await this.prisma.viTri.findFirst({
      where: { id, isDeleted: false },
    });

    if (!location) throw new NotFoundException('Location not found');
    return this.mapToResponse(location);
  }

  async update(id: number, dto: UpdateLocationDto) {
    const location = await this.prisma.viTri.findFirst({ where: { id, isDeleted: false } });
    if (!location) throw new NotFoundException('Location not found');

    const updatedLocation = await this.prisma.viTri.update({
      where: { id },
      data: {
        ten_vi_tri: dto.tenViTri,
        tinh_thanh: dto.tinhThanh,
        quoc_gia: dto.quocGia,
        hinh_anh: dto.hinhAnh,
      },
    });

    await this.cacheManager.del('locations_list');
    return this.mapToResponse(updatedLocation);
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    const location = await this.prisma.viTri.findFirst({ where: { id, isDeleted: false } });
    if (!location) throw new NotFoundException('Location not found');

    const uploadResult = await this.cloudinaryService.uploadFile(file, 'airbnb/locations');
    
    const updatedLocation = await this.prisma.viTri.update({
      where: { id },
      data: { hinh_anh: uploadResult.url },
    });

    await this.cacheManager.del('locations_list');
    return this.mapToResponse(updatedLocation);
  }
}
