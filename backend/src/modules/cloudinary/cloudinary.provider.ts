import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { CLOUDINARY } from './cloudinary.constants';
import { getCloudinaryConfig } from './cloudinary.config';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    return cloudinary.config(getCloudinaryConfig(configService));
  },
  inject: [ConfigService],
};
