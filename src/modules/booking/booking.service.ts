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

    // Lấy thông tin user để gửi mail
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: reqUser.id }
    });

    if (user?.email) {
      // Đẩy job gửi mail vào Background Queue thay vì gửi đồng bộ
      await this.emailQueue.add(
        'send-booking-email',
        {
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
        },
        {
          removeOnComplete: true, // Xóa job khỏi Redis sau khi chạy thành công để tiết kiệm RAM
          attempts: 3,            // Nếu lỗi SMTP sẽ tự động thử lại tối đa 3 lần
          backoff: {              // Đợi 5 giây giữa các lần thử lại
            type: 'fixed',
            delay: 5000,
          },
        }
      );
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
    const booking = await this.prisma.datPhong.findFirst({ where: { id, isDeleted: false } });
    if (!booking) throw new NotFoundException('Đặt phòng không tồn tại');

    const dataToUpdate: any = {};
    if (dto.maPhong !== undefined) dataToUpdate.ma_phong = dto.maPhong;
    if (dto.ngayDen !== undefined) dataToUpdate.ngay_den = new Date(dto.ngayDen);
    if (dto.ngayDi !== undefined) dataToUpdate.ngay_di = new Date(dto.ngayDi);
    if (dto.soLuongKhach !== undefined) dataToUpdate.so_luong_khach = dto.soLuongKhach;

    if (reqUser.role === 'ADMIN' || booking.ma_nguoi_dat === reqUser.id) {
      const updatedBooking = await this.prisma.datPhong.update({
        where: { id },
        data: dataToUpdate,
      });
      return this.mapToResponse(updatedBooking);
    }
    else {
      throw new UnauthorizedException('Bạn không có quyền chỉnh sửa đặt phòng này');
    }

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
