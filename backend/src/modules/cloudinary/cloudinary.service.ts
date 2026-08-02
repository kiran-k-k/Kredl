import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
  UploadApiOptions,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadImageOptions } from './dto/upload-image-options.dto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { validateImageFile } from './utils/image-validation.util';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadImage(
    file: Express.Multer.File,
    options: UploadImageOptions,
  ): Promise<UploadImageResponseDto> {
    validateImageFile(file);

    const uploadOptions: UploadApiOptions = {
      folder: options.folder,
      width: options.width,
      height: options.height,
      crop: options.crop,
      overwrite: options.overwrite,
      invalidate: options.invalidate,
      quality: options.quality || 'auto',
      fetch_format: options.format || 'auto',
      tags: options.tags,
      context: options.context,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(`Upload Failure: ${error.message}`);
            return reject(
              new BadRequestException(
                `Failed to upload image: ${error.message}`,
              ),
            );
          }
          this.logger.log(`Upload Success: ${result.public_id}`);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = (await cloudinary.uploader.destroy(publicId)) as {
        result: string;
      };
      if (result.result === 'ok') {
        this.logger.log(`Delete Success: ${publicId}`);
        return true;
      }
      this.logger.warn(
        `Delete result not ok for ${publicId}: ${result.result}`,
      );
      return false;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Delete Failure for ${publicId}: ${err.message}`);
      throw new BadRequestException(`Failed to delete image: ${err.message}`);
    }
  }

  async updateImage(
    publicId: string,
    newFile: Express.Multer.File,
    options: UploadImageOptions,
  ): Promise<UploadImageResponseDto> {
    if (publicId) {
      await this.deleteImage(publicId);
    }
    return this.uploadImage(newFile, options);
  }

  extractPublicId(url: string): string | null {
    if (!url) return null;
    try {
      // Matches: https://res.cloudinary.com/.../upload/v1234567890/folder/subfolder/file.ext
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;

      // Extract parts after 'upload/vXXX/'
      const pathParts = parts.slice(uploadIndex + 2);
      const fullPath = pathParts.join('/');

      // Remove extension
      const lastDotIndex = fullPath.lastIndexOf('.');
      if (lastDotIndex === -1) return fullPath;

      return fullPath.substring(0, lastDotIndex);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Extract Public ID Failure: ${err.message}`);
      return null;
    }
  }
}
