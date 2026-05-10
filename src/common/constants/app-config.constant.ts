export const AppConfig = {
  STAGES: {
    DEV: 'dev',
    PRODUCTION: 'production',
    TEST: 'test'
  },
  LOGGER: {
    LOGTAIL_LEVEL: 'warn',
    CONSOLE_LEVEL: 'debug'
  },

  ROLE: {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
    ADMIN: 'ADMIN'
  },

  DOMAIN: {
    FE: '',
    BE: 'http://localhost:3000'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    SALT_ROUNDS: 10
  },

  INVOICE: {
    CANCEL_URL: '',
    RETURN_URL: ''
  },

  CORS: {
    ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : 'http://localhost:3001',
    METHODS: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    CREDENTIALS: true
  }
} as const;
