import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from 'config';
import { Prisma, PrismaClient } from '@prisma/client';
// import { CustomLogger } from 'logger/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' }
        // Bỏ comment dòng dưới khi cần debug query chậm
        // { emit: 'event', level: 'query' },
      ]
    });

    this.pool = pool;

    this.registerPrismaEvents();
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  async onModuleInit() {
    try {
      await this.$connect();
      const healthy = await this.isHealthy(); // gọi ở đây

      if (!healthy) {
        // this.logger.error('DB unreachable on startup');
        process.exit(1);
      }
      // this.logger.log('Database connected successfully');
    } catch (err) {
      // this.logger.error('Failed to connect to database on startup', err, PrismaService.name, {
      //   category: 'DB_CONNECT_FAILED',
      //   errorCode: err?.code, // P1001 = unreachable, P1008 = timeout
      //   errorMessage: err?.message
      // });
      // Crash app ngay nếu không kết nối được DB lúc khởi động
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    // this.logger.log('Database disconnected');
  }

  // ─── Health Check ─────────────────────────────────────────────────────────

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      // this.logger.error('Database health check failed', err, PrismaService.name, {
      //   category: 'DB_HEALTH_CHECK_FAILED',
      //   errorCode: err?.code,
      //   errorMessage: err?.message
      // });
      return false;
    }
  }

  // ─── Prisma Events ────────────────────────────────────────────────────────

  private registerPrismaEvents() {
    // Log lỗi từ Prisma engine (cấp thấp hơn, trước khi throw lên app)
    this.$on('error' as never, (event: Prisma.LogEvent) => {
      // this.logger.error(event.message, undefined, PrismaService.name, {
      //   category: 'PRISMA_ENGINE_ERROR',
      //   target: event.target,
      //   timestamp: event.timestamp
      // });
    });

    this.$on('warn' as never, (event: Prisma.LogEvent) => {
      // this.logger.warn({
      //   category: 'PRISMA_WARNING',
      //   message: event.message,
      //   target: event.target
      // });
    });

    // Uncomment khi cần detect slow query
    // this.$on('query' as never, (event: Prisma.QueryEvent) => {
    //   if (event.duration > 1000) {
    //     this.logger.warn({
    //       category: 'SLOW_QUERY',
    //       query: event.query,
    //       duration: event.duration,
    //     });
    //   }
    // });
  }
}
