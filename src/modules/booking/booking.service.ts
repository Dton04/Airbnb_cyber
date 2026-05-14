import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
  ) { }

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
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        Phong: {
          select: {
            ten_phong: true,
            gia_tien: true,
          },
        },
        NguoiDung: {
          select: {
            name: true,
            avatar: true
          },
        },
      },
    });
    return data.map((item) => this.mapToResponse(item));
  }

  async create(dto: CreateBookingDto, reqUser: any) {
    const { maPhong, ngayDen, ngayDi, soLuongKhach } = dto;
    const phong = await this.prisma.phong.findFirst({
      where: {
        id: maPhong,
        isDeleted: false,
      },
    });
    if (!phong) {
      throw new NotFoundException("Không tìm thấy phòng")
    }
    if (soLuongKhach > phong.khach!) {
      throw new BadRequestException(`Phòng này chỉ chứa tối đa ${phong.khach} người`)
    }
    const isBooked = await this.prisma.datPhong.findFirst({
      where: {
        ma_phong: maPhong,
        ngay_den: { lte: new Date(ngayDi) },
        ngay_di: { gte: new Date(ngayDen) },
        isDeleted: false,
      },
    });
    if (isBooked) {
      throw new BadRequestException('Phòng đã có người đặt trong khoảng thời gian này');
    }

    const newBooking = await this.prisma.datPhong.create({
      data: {
        ma_phong: dto.maPhong,
        ngay_den: new Date(dto.ngayDen),
        ngay_di: new Date(dto.ngayDi),
        so_luong_khach: dto.soLuongKhach,
        ma_nguoi_dat: reqUser.id,
      },
    });

    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: reqUser.id }
    });

    // Fire-and-forget: không await để không block response trả về client
    if (user?.email) {
      setImmediate(() => {
        this.emailQueue
          .add('send-booking-email', {
            to: user.email,
            subject: 'Xác nhận đặt phòng Airbnb thành công',
            html: `
              <h2>Xin chào ${user.name || 'bạn'},</h2>
              <p>Bạn đã đặt phòng <strong>${phong.ten_phong}</strong> thành công trên hệ thống Airbnb!</p>
              <ul>
                <li><strong>Ngày đến:</strong> ${new Date(ngayDen).toLocaleDateString('vi-VN')}</li>
                <li><strong>Ngày đi:</strong> ${new Date(ngayDi).toLocaleDateString('vi-VN')}</li>
                <li><strong>Số khách:</strong> ${soLuongKhach} người</li>
                <li><strong>Tổng giá dự kiến:</strong> ${phong.gia_tien ? phong.gia_tien + ' $' : 'Liên hệ'} / đêm</li>
              </ul>
              <p>Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.</p>
            `,
          })
          .catch((err) =>
            console.error('[BullMQ] Failed to enqueue email job:', err?.message),
          );
      });
    }


    return {
      message: 'Đặt phòng thành công',
      content: this.mapToResponse(newBooking),
    };
  }

  async findOne(id: number) {
    const booking = await this.prisma.datPhong.findFirst({
      where: { id, isDeleted: false },
    });

    if (!booking) throw new NotFoundException('Đặt phòng không tồn tại');
    return this.mapToResponse(booking);
  }

  async update(id: number, dto: UpdateBookingDto, reqUser: any) {
    const booking = await this.prisma.datPhong.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!booking) {
      throw new NotFoundException('Đặt phòng không tồn tại');
    }

    const isOwner = booking.ma_nguoi_dat === reqUser.id;
    const isAdmin = reqUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException(
        'Bạn không có quyền chỉnh sửa đặt phòng này',
      );
    }

    const maPhong = dto.maPhong ?? booking.ma_phong;

    const ngayDen: Date = dto.ngayDen
      ? new Date(dto.ngayDen)
      : booking.ngay_den!;

    const ngayDi: Date = dto.ngayDi
      ? new Date(dto.ngayDi)
      : booking.ngay_di!;

    const soLuongKhach =
      dto.soLuongKhach ?? booking.so_luong_khach;

    if (isNaN(ngayDen.getTime()) || isNaN(ngayDi.getTime())) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

    if (ngayDen >= ngayDi) {
      throw new BadRequestException(
        'Ngày đi phải lớn hơn ngày đến',
      );
    }


    const room = await this.prisma.phong.findFirst({
      where: {
        id: maPhong!,
        isDeleted: false,
      },
    });

    if (!room) {
      throw new NotFoundException('Phòng không tồn tại');
    }

    if (soLuongKhach! > room.khach!) {
      throw new BadRequestException(
        `Phòng chỉ cho tối đa ${room.khach} khách`,
      );
    }

    const conflictBooking = await this.prisma.datPhong.findFirst({
      where: {
        id: {
          not: id,
        },

        ma_phong: maPhong,

        isDeleted: false,

        AND: [
          {
            ngay_den: {
              lt: ngayDi,
            },
          },
          {
            ngay_di: {
              gt: ngayDen,
            },
          },
        ],
      },
    });

    if (conflictBooking) {
      throw new BadRequestException(
        'Phòng đã được đặt trong khoảng thời gian này',
      );
    }

    // 9. Không cho update rỗng
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Không có dữ liệu để cập nhật',
      );
    }

    // 10. Update
    const updatedBooking = await this.prisma.datPhong.update({
      where: { id },
      data: {
        ma_phong: maPhong,
        ngay_den: ngayDen,
        ngay_di: ngayDi,
        so_luong_khach: soLuongKhach,
      },
    });

    return this.mapToResponse(updatedBooking);
  }
  async remove(id: number) {
    const booking = await this.prisma.datPhong.findFirst({ where: { id, isDeleted: false } });
    if (!booking) throw new NotFoundException('Đặt phòng không tồn tại');

    await this.prisma.datPhong.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'Xóa đặt phòng thành công' };
  }

  async findByUser(maNguoiDung: number) {
    const data = await this.prisma.datPhong.findMany({
      where: { ma_nguoi_dat: maNguoiDung, isDeleted: false },
    });
    return data.map((item) => this.mapToResponse(item));
  }
}
