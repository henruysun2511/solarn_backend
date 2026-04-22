import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, transports, format } from 'winston';
import { AppConfig } from 'common/constants';
import { env } from 'config';

export class WinstonConfig {
  createLogger() {
    // ✅ Factory — mỗi lần gọi là instance mới, tránh conflict
    const uppercaseLevel = () =>
      format((info) => {
        if (info.level) info.level = info.level.toString().toUpperCase();
        return info;
      })();

    const customFormat = format.printf((info) => {
      const timestamp = info.timestamp ?? new Date().toISOString();
      const level = info.level ?? 'info';
      const message = info.stack ?? info.message ?? '';
      const context = info.context ? `- CONTEXT: ${info.context}` : '';
      const trace = info.trace ? `\n${info.trace}` : '';
      return `\u001b[36m[NEST]\u001b[0m - ${timestamp} - [${level}] - ${message} ${context}${trace}`.trim();
    });

    const consoleFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      uppercaseLevel(),
      format.colorize({ all: true }),
      format.errors({ stack: true }),
      customFormat
    );

    const fileFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      uppercaseLevel(),
      format.errors({ stack: true }),
      customFormat
    );

    // ✅ Logtail nhận JSON — KHÔNG dùng printf
    const logtailFormat = format.combine(format.timestamp(), uppercaseLevel(), format.errors({ stack: true }));

    const level = env.PROJECT_STAGE === 'production' ? 'info' : 'silly';

    const transportsList: any[] = [
      new transports.Console({
        level: AppConfig.LOGGER.CONSOLE_LEVEL,
        format: consoleFormat
      })
    ];

    const exceptionHandlersList: any[] = [new transports.Console({ format: consoleFormat })];

    const rejectionHandlersList: any[] = [new transports.Console({ format: consoleFormat })];

    if (env.PROJECT_STAGE === 'production' && env.LOGTAIL_TOKEN) {
      const logtail = new Logtail(env.LOGTAIL_TOKEN, {
        endpoint: env.LOGTAIL_ENDPOINT
      });

      // ✅ Rotation thay vì file tĩnh
      const rotateTransport = new DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        format: fileFormat,
        maxFiles: '14d',
        maxSize: '50m'
      });

      transportsList.push(
        new LogtailTransport(logtail, {
          level: AppConfig.LOGGER.LOGTAIL_LEVEL,
          format: logtailFormat // ✅ JSON cho Logtail
        }),
        rotateTransport
      );

      const logtailWarn = new LogtailTransport(logtail, { format: logtailFormat });

      exceptionHandlersList.unshift(logtailWarn, rotateTransport);
      rejectionHandlersList.unshift(logtailWarn, rotateTransport);
    }

    return createLogger({
      level,
      transports: transportsList,
      exceptionHandlers: exceptionHandlersList,
      rejectionHandlers: rejectionHandlersList
    });
  }
}
