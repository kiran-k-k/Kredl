import { BadRequestException } from '@nestjs/common';
import {
  CLOUDINARY_ALLOWED_MIMES,
  CLOUDINARY_MAX_FILE_SIZE,
} from '../cloudinary.constants';

export const validateImageFile = (file: Express.Multer.File): void => {
  if (!file) {
    throw new BadRequestException('No file provided for upload');
  }

  if (!CLOUDINARY_ALLOWED_MIMES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Unsupported file type: ${file.mimetype}. Allowed types are: ${CLOUDINARY_ALLOWED_MIMES.join(
        ', ',
      )}`,
    );
  }

  if (file.size > CLOUDINARY_MAX_FILE_SIZE) {
    throw new BadRequestException(
      `File is too large. Maximum size allowed is ${
        CLOUDINARY_MAX_FILE_SIZE / (1024 * 1024)
      }MB`,
    );
  }
};
