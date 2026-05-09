import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }
  async create(dto: CreateCommentDto, userId: number) {
    const newComment = await this.prisma.binhLuan.create({
      data: {
        ma_phong: dto.maPhong,
        noi_dung: dto.noiDung,
        sao_binh_luan: dto.saoBinhLuan,
        ma_nguoi_binh_luan: userId,
        ngay_binh_luan: new Date(),
        isDeleted: false,
      },
      include: {
        Phong: {
          select: {
            ten_phong: true,
          }
        },
        NguoiDung: {
          select: {
            name: true,
          }
        }
      }
    });
    return {
      message: 'Thêm bình luận thành công',
      content: newComment,
    };
  }

  async findAll() {
    const comments = await this.prisma.binhLuan.findMany({
      include: {
        Phong: {
          select: {
            ten_phong: true,
          }
        },
        NguoiDung: {
          select: {
            name: true,
          }
        }
      }
    });
    return {
      message: 'Lấy danh sách bình luận thành công',
      content: comments,
    };
  }

  async findOne(id: number) {
    const comment = await this.prisma.binhLuan.findUnique({
      where: {
        id: id,
      },
      include: {
        Phong: {
          select: {
            ten_phong: true,
          }
        },
        NguoiDung: {
          select: {
            name: true,
          }
        }
      }
    });
    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }
    return {
      message: 'Lấy thông tin chi tiết bình luận thành công',
      content: comment,
    };
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const updatedComment = await this.prisma.binhLuan.update({
      where: {
        id: id,
      },
      data: {
        noi_dung: updateCommentDto.noiDung,
        sao_binh_luan: updateCommentDto.saoBinhLuan,
        updatedAt: new Date(),
      },
      include: {
        Phong: {
          select: {
            ten_phong: true,
          }
        },
        NguoiDung: {
          select: {
            name: true,
          }
        }
      }
    });
    return {
      message: 'Cập nhật bình luận thành công',
      content: updatedComment,
    };
  }

  async remove(id: number, reqUser: any) {
    const comment = await this.prisma.binhLuan.findFirst({
      where: {
        id,
        isDeleted: false
      }
    })
    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }
    if (comment.ma_nguoi_binh_luan !== reqUser.id) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }
    const deletedComment = await this.prisma.binhLuan.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return {
      message: 'Xóa bình luận thành công',
      content: deletedComment,
    };
  }
  async findCommentByRoomId(maPhong: number) {
    const comments = await this.prisma.binhLuan.findMany({
      where: {
        ma_phong: maPhong,
        isDeleted: false
      },
      include: {
        Phong: {
          select: {
            ten_phong: true,
          }
        },
        NguoiDung: {
          select: {
            name: true,
          }
        }
      }
    });
    if (comments.length === 0) {
      throw new NotFoundException('Không có bình luận nào');
    }
    return {
      message: 'Lấy danh sách bình luận thành công',
      content: comments,
    };
  }
}
