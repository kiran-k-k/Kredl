import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import {
  CLOUDINARY_ALLOWED_MIMES,
  CLOUDINARY_MAX_FILE_SIZE,
} from './cloudinary.constants';

export const cloudinaryMulterConfig: MulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: CLOUDINARY_MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (CLOUDINARY_ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Unsupported file type: ${file.mimetype}. Allowed types are: ${CLOUDINARY_ALLOWED_MIMES.join(
            ', ',
          )}`,
        ),
        false,
      );
    }
  },
};
