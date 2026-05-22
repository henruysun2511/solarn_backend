import { randomInt } from 'crypto';

export const generateClassCode = (prefix = 'SEG') => {
  const max = 36 * 36 * 36 * 36;
  const suffix = randomInt(0, max).toString(36).toUpperCase().padStart(4, '0');
  return `${prefix}${suffix}`;
};
