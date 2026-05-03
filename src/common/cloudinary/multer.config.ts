import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: Function,
) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        'Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP',
      ),
      false,
    );
  }
  callback(null, true);
};

export const multerOptions = {
  storage: memoryStorage(), // Store in memory to pipe to Cloudinary
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
};
