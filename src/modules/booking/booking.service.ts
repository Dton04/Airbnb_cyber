import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) { }

  private mapToResponse(datPhong: any) {
    if (!datPhong) return datPhong;
    return {
      id: datPhong.id,
      maPhong: datPhong.ma_phong,
      ngayDen: datPhong.ngay_den,
      ngayDi: datPhong.ngay_di,
      soLuongKhach: datPhong.so_luong_khach,
      maNguoiDat: datPhong.ma_nguoi_dat,
    };
  }

  async findAll() {
    const data = await this.prisma.datPhong.findMany({
      where: { isDeleted: false },
    });
    return data.map((item) => this.mapToResponse(item));
  }

  async create(dto: CreateBookingDto) {
    const newBooking = await this.prisma.datPhong.create({
      data: {
        ma_phong: dto.maPhong,
        ngay_den: new Date(dto.ngayDen),
        ngay_di: new Date(dto.ngayDi),
        so_luong_khach: dto.soLuongKhach,
        ma_nguoi_dat: dto.maNguoiDat,
      },
    });
    return this.mapToResponse(newBooking);
  }

  async findOne(id: number) {
    const booking = await this.prisma.datPhong.findFirst({
      where: { id, isDeleted: false },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    return this.mapToResponse(booking);
  }

  async update(id: number, dto: UpdateBookingDto) {
    const booking = await this.prisma.datPhong.findFirst({ where: { id, isDeleted: false } });
    if (!booking) throw new NotFoundException('Booking not found');

    const dataToUpdate: any = {};
    if (dto.maPhong !== undefined) dataToUpdate.ma_phong = dto.maPhong;
    if (dto.ngayDen !== undefined) dataToUpdate.ngay_den = new Date(dto.ngayDen);
    if (dto.ngayDi !== undefined) dataToUpdate.ngay_di = new Date(dto.ngayDi);
    if (dto.soLuongKhach !== undefined) dataToUpdate.so_luong_khach = dto.soLuongKhach;
    if (dto.maNguoiDat !== undefined) dataToUpdate.ma_nguoi_dat = dto.maNguoiDat;

    const updatedBooking = await this.prisma.datPhong.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.mapToResponse(updatedBooking);
  }

  async remove(id: number) {
    const booking = await this.prisma.datPhong.findFirst({ where: { id, isDeleted: false } });
    if (!booking) throw new NotFoundException('Booking not found');

    await this.prisma.datPhong.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'Booking deleted successfully' };
  }

  async findByUser(maNguoiDung: number) {
    const data = await this.prisma.datPhong.findMany({
      where: { ma_nguoi_dat: maNguoiDung, isDeleted: false },
    });
    return data.map((item) => this.mapToResponse(item));
  }
}
