import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// @ts-ignore
import cookieParserDefault from 'cookie-parser';

const cp = (cookieParserDefault || cookieParser) as any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cp());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Airbnb API')
    .setDescription('Tài liệu API cho dự án Airbnb Clone')
    .setVersion('1.0')
    .addBearerAuth() // Thêm JWT Bearer Auth vào Swagger UI
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3069);
}
bootstrap();
