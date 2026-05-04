import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly cloudinaryService: CloudinaryService,
   ) { }

   async findAll() {
      return this.prisma.nguoiDung.findMany();
   }

   async create(dto: CreateUserDto) {
      const existingUser = await this.prisma.nguoiDung.findFirst({
         where: { email: dto.email, isDeleted: false },
      });
      if (existingUser) {
         throw new BadRequestException('Email already exists');
      }

      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(dto.pass_word, saltOrRounds);

      const newUser = await this.prisma.nguoiDung.create({
         data: {
            ...dto,
            pass_word: hashedPassword,
            role: dto.role || 'USER',
         },
      });

      const { pass_word, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
   }

   async remove(id: number) {
      const user = await this.prisma.nguoiDung.findFirst({ where: { id, isDeleted: false } });
      if (!user) throw new NotFoundException('User not found');

      await this.prisma.nguoiDung.update({
         where: { id },
         data: { isDeleted: true, deletedAt: new Date() },
      });
      return { message: 'User deleted successfully' };
   }

   async paginateAndSearch(pageIndex: number, pageSize: number, keyword: string) {
      const skip = (pageIndex - 1) * pageSize;
      const whereCondition: any = { isDeleted: false };

      if (keyword) {
         whereCondition.name = { contains: keyword };
      }

      const [data, total] = await Promise.all([
         this.prisma.nguoiDung.findMany({
            where: whereCondition,
            skip,
            take: pageSize,
            select: {
               id: true, name: true, email: true, phone: true, birth_day: true, gender: true, role: true, avatar: true,
            },
         }),
         this.prisma.nguoiDung.count({ where: whereCondition }),
      ]);

      return {
         pageIndex,
         pageSize,
         totalRow: total,
         data,
      };
   }

   async findOne(id: number) {
      const user = await this.prisma.nguoiDung.findFirst({
         where: { id, isDeleted: false },
         select: {
            id: true, name: true, email: true, phone: true, birth_day: true, gender: true, role: true, avatar: true,
         },
      });

      if (!user) throw new NotFoundException('User not found');
      return user;
   }

   async update(id: number, dto: UpdateUserDto) {
      const user = await this.prisma.nguoiDung.findFirst({ where: { id, isDeleted: false } });
      if (!user) throw new NotFoundException('User not found');

      if (dto.email && dto.email !== user.email) {
         const emailExists = await this.prisma.nguoiDung.findFirst({
            where: { email: dto.email, isDeleted: false },
         });
         if (emailExists) throw new BadRequestException('Email already in use');
      }

      const updatedUser = await this.prisma.nguoiDung.update({
         where: { id },
         data: { ...dto },
         select: {
            id: true, name: true, email: true, phone: true, birth_day: true, gender: true, role: true, avatar: true,
         },
      });

      return updatedUser;
   }

   async searchByName(name: string) {
      return this.prisma.nguoiDung.findMany({
         where: {
            name: { contains: name },
            isDeleted: false,
         },
         select: {
            id: true, name: true, email: true, phone: true, birth_day: true, gender: true, role: true, avatar: true,
         },
      });
   }

   async uploadAvatar(userId: number, file: Express.Multer.File) {
      const user = await this.prisma.nguoiDung.findFirst({ where: { id: userId, isDeleted: false } });
      if (!user) throw new NotFoundException('User not found');

      const uploadResult = await this.cloudinaryService.uploadFile(file, 'airbnb/avatars');

      const updatedUser = await this.prisma.nguoiDung.update({
         where: { id: userId },
         data: { avatar: uploadResult.url },
         select: {
            id: true, name: true, email: true, phone: true, birth_day: true, gender: true, role: true, avatar: true,
         },
      });

      return updatedUser;
   }
}
