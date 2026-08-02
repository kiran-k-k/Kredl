export const CLOUDINARY = 'Cloudinary';

export const CLOUDINARY_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const CLOUDINARY_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
export const CLOUDINARY_ALLOWED_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const CloudinaryFolders = {
  USERS_PROFILE: 'kredl/users/profile-images',
  COURSES_THUMBNAILS: 'kredl/courses/thumbnails',
  COMPANIES_LOGOS: 'kredl/companies/logos',
} as const;
