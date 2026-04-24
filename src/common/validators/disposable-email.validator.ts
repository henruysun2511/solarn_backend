import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';
import disposableDomains from 'disposable-email-domains';

const disposableDomainSet = new Set(disposableDomains.map((domain) => domain.toLowerCase()));

const extractDomain = (email: string): string | null => {
  const atIndex = email.lastIndexOf('@');
  if (atIndex < 0) return null;
  const domain = email
    .slice(atIndex + 1)
    .trim()
    .toLowerCase();
  return domain.length ? domain : null;
};

const isDisposableDomain = (domain: string): boolean => {
  if (disposableDomainSet.has(domain)) return true;

  // Fallback: treat subdomains as their base domain (e.g. a.b.com -> b.com)
  const parts = domain.split('.').filter(Boolean);
  if (parts.length >= 2) {
    const baseDomain = parts.slice(-2).join('.');
    return disposableDomainSet.has(baseDomain);
  }

  return false;
};

export function IsNotDisposableEmail(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotDisposableEmail',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === null || value === undefined || value === '') return true; // allow optional
          if (typeof value !== 'string') return false;

          const domain = extractDomain(value);
          if (!domain) return false;

          return !isDisposableDomain(domain);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} không được dùng email tạm thời/email rác`;
        }
      }
    });
  };
}
