import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from 'common/interceptors';
import cookieParser from 'cookie-parser';
import { AppConfig } from 'common/constants';
import { JwtAuthGuard } from 'modules/auth/guards';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: AppConfig.CORS.ORIGINS,
    methods: AppConfig.CORS.METHODS,
    credentials: AppConfig.CORS.CREDENTIALS
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // thuộc tính nào không được định nghĩa trong DTO sẽ bị loại bỏ khỏi đối tượng đầu vào.
      forbidNonWhitelisted: true, // có thuộc tính không hợp lệ trong dữ liệu đầu vào, một lỗi sẽ được ném ra
      transform: true //tự động chuyển đổi dữ liệu đầu vào thành kiểu dữ liệu tương ứng với các kiểu đã được định nghĩa trong DTO
    })
  );

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('APIDocs')
    .setVersion('1.0')
    .addServer('/api/v1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Trả về toàn bộ spec JSON
  app.use('/api-json', (_req, res) => res.json(document));

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1']
  });

  app.enableShutdownHooks();
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
  });
}
void bootstrap();
