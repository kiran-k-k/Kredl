import { ConfigService } from '@nestjs/config';

export const getCloudinaryConfig = (configService: ConfigService) => {
  const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
  const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
  const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration is missing');
  }

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  };
};
