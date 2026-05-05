import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private mapToResponse(phong: any) {
    if (!phong) return phong;
    return {
      id: phong.id,
      tenPhong: phong.ten_phong,
      khach: phong.khach,
      phongNgu: phong.phong_ngu,
      giuong: phong.giuong,
      phongTam: phong.phong_tam,
      moTa: phong.mo_ta,
      giaTien: phong.gia_tien,
      mayGiat: phong.may_giat,
      banLa: phong.ban_la,
      tivi: phong.tivi,
      dieuHoa: phong.dieu_hoa,
      wifi: phong.wifi,
      bep: phong.bep,
      doXe: phong.do_xe,
      hoBoi: phong.ho_boi,
      banUi: phong.ban_ui,
      hinhAnh: phong.hinh_anh,
      maViTri: phong.ma_vi_tri,
    };
  }

  async findAll() {
    const data = await this.prisma.phong.findMany({
      where: { isDeleted: false },
    });
    return data.map((item) => this.mapToResponse(item));
  }

  async create(dto: CreateRoomDto) {
    const newRoom = await this.prisma.phong.create({
      data: {
        ten_phong: dto.tenPhong,
        khach: dto.khach,
        phong_ngu: dto.phongNgu,
        giuong: dto.giuong,
        phong_tam: dto.phongTam,
        mo_ta: dto.moTa,
        gia_tien: dto.giaTien,
        may_giat: dto.mayGiat,
        ban_la: dto.banLa,
        tivi: dto.tivi,
        dieu_hoa: dto.dieuHoa,
        wifi: dto.wifi,
        bep: dto.bep,
        do_xe: dto.doXe,
        ho_boi: dto.hoBoi,
        ban_ui: dto.banUi,
        ma_vi_tri: dto.maViTri,
      },
    });
    return this.mapToResponse(newRoom);
  }

  async findByLocation(maViTri: number) {
    const data = await this.prisma.phong.findMany({
      where: { ma_vi_tri: maViTri, isDeleted: false },
    });
    return data.map((item) => this.mapToResponse(item));
  }

  async paginateAndSearch(pageIndex: number, pageSize: number, keyword: string) {
    const skip = (pageIndex - 1) * pageSize;
    const whereCondition: any = { isDeleted: false };
    
    if (keyword) {
      whereCondition.ten_phong = { contains: keyword };
    }

    const [data, total] = await Promise.all([
      this.prisma.phong.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
      }),
      this.prisma.phong.count({ where: whereCondition }),
    ]);

    return {
      pageIndex,
      pageSize,
      totalRow: total,
      data: data.map((item) => this.mapToResponse(item)),
    };
  }

  async findOne(id: number) {
    const room = await this.prisma.phong.findFirst({
      where: { id, isDeleted: false },
    });

    if (!room) throw new NotFoundException('Room not found');
    return this.mapToResponse(room);
  }

  async update(id: number, dto: UpdateRoomDto) {
    const room = await this.prisma.phong.findFirst({ where: { id, isDeleted: false } });
    if (!room) throw new NotFoundException('Room not found');

    const dataToUpdate: any = {};
    if (dto.tenPhong !== undefined) dataToUpdate.ten_phong = dto.tenPhong;
    if (dto.khach !== undefined) dataToUpdate.khach = dto.khach;
    if (dto.phongNgu !== undefined) dataToUpdate.phong_ngu = dto.phongNgu;
    if (dto.giuong !== undefined) dataToUpdate.giuong = dto.giuong;
    if (dto.phongTam !== undefined) dataToUpdate.phong_tam = dto.phongTam;
    if (dto.moTa !== undefined) dataToUpdate.mo_ta = dto.moTa;
    if (dto.giaTien !== undefined) dataToUpdate.gia_tien = dto.giaTien;
    if (dto.mayGiat !== undefined) dataToUpdate.may_giat = dto.mayGiat;
    if (dto.banLa !== undefined) dataToUpdate.ban_la = dto.banLa;
    if (dto.tivi !== undefined) dataToUpdate.tivi = dto.tivi;
    if (dto.dieuHoa !== undefined) dataToUpdate.dieu_hoa = dto.dieuHoa;
    if (dto.wifi !== undefined) dataToUpdate.wifi = dto.wifi;
    if (dto.bep !== undefined) dataToUpdate.bep = dto.bep;
    if (dto.doXe !== undefined) dataToUpdate.do_xe = dto.doXe;
    if (dto.hoBoi !== undefined) dataToUpdate.ho_boi = dto.hoBoi;
    if (dto.banUi !== undefined) dataToUpdate.ban_ui = dto.banUi;
    if (dto.maViTri !== undefined) dataToUpdate.ma_vi_tri = dto.maViTri;

    const updatedRoom = await this.prisma.phong.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.mapToResponse(updatedRoom);
  }

  async remove(id: number) {
    const room = await this.prisma.phong.findFirst({ where: { id, isDeleted: false } });
    if (!room) throw new NotFoundException('Room not found');

    await this.prisma.phong.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'Room deleted successfully' };
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    const room = await this.prisma.phong.findFirst({ where: { id, isDeleted: false } });
    if (!room) throw new NotFoundException('Room not found');

    const uploadResult = await this.cloudinaryService.uploadFile(file, 'airbnb/rooms');
    
    const updatedRoom = await this.prisma.phong.update({
      where: { id },
      data: { hinh_anh: uploadResult.url },
    });

    return this.mapToResponse(updatedRoom);
  }
}
