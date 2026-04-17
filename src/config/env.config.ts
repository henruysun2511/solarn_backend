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
} as const;