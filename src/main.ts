import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import { ApiMessageInterceptor } from './shared/middlewares/interceptors/api-message.interceptor';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const CONFIG_SERVICE = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    origin: CONFIG_SERVICE.get<string[]>('allowedUrls'),
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200,
  });
  app.useGlobalInterceptors(new ApiMessageInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
