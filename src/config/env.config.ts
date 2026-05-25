import dotenv from 'dotenv';
dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Biến môi trường ${key} chưa được thiết lập`);
  }
  return value;
};

export const env = {
  APP_NAME: getEnv('APP_NAME'),
  PROJECT_STAGE: getEnv('PROJECT_STAGE'),
  DIRECT_URL: getEnv('DIRECT_URL'),
  DATABASE_URL: getEnv('DATABASE_URL'),
  LOGTAIL_TOKEN: getEnv('LOGTAIL_TOKEN'),
  LOGTAIL_ENDPOINT: getEnv('LOGTAIL_ENDPOINT'),
  LOGTAIL_LEVEL: getEnv('LOGTAIL_LEVEL'),
  LOG_FILE_PATH: getEnv('LOG_FILE_PATH'),
  EMAIL_USER: getEnv('EMAIL_USER'),
  EMAIL_PASS: getEnv('EMAIL_PASS'),
  OTP_EXPIRE_MINUTES: getEnv('OTP_EXPIRE_MINUTES'),
  JWT_REFRESH_TOKEN_EXPIRE: getEnv('JWT_REFRESH_TOKEN_EXPIRE'),
  JWT_REFRESH_TOKEN_SECRET: getEnv('JWT_REFRESH_TOKEN_SECRET'),
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
  MAIN_FOLDER_UPLOAD_CLOUDINARY: getEnv('MAIN_FOLDER_UPLOAD_CLOUDINARY'),
  CORS_ORIGINS: getEnv('CORS_ORIGINS')
} as const;
