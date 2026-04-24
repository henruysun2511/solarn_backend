import bcrypt from 'bcrypt';

export const DEFAULT_OTP_LENGTH = 6;
export const DEFAULT_OTP_SALT_ROUNDS = 6;

export const generateOtpCode = (length: number = DEFAULT_OTP_LENGTH): string => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};

export const hashOtp = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, DEFAULT_OTP_SALT_ROUNDS);
};

export const compareOtp = async (inputOtp: string, hashedOtp: string): Promise<boolean> => {
  return bcrypt.compare(inputOtp, hashedOtp);
};
