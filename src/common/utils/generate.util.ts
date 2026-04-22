import { randomUUID } from 'crypto';

export const generateCode = (prefix: string) => {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  return `${prefix}-${suffix}`;
};
