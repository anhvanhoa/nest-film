import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error'],
    cors: {
      credentials: true,
      origin: ['http://localhost:3000', 'http://localhost:3000/'],
      methods: '*',
    },
  });
  const configService = app.get(ConfigService<EnvironmentVariables>);
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(configService.get('PORT')!);
}
bootstrap();
