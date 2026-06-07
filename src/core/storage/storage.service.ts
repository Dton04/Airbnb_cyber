import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(configService: ConfigService) {
    cloudinary.config({
      cloud_name:
        configService.get<string>('CLOUDINARY_CLOUD_NAME') ||
        configService.get<string>('cloudinary.cloudName'),
      api_key:
        configService.get<string>('CLOUDINARY_API_KEY') ||
        configService.get<string>('cloudinary.apiKey'),
      api_secret:
        configService.get<string>('CLOUDINARY_API_SECRET') ||
        configService.get<string>('cloudinary.apiSecret'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            if (error instanceof Error) {
              return reject(error);
            }
            return reject(
              new Error(typeof error === 'string' ? error : 'Upload failed'),
            );
          }
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
