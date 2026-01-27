import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import { ApiMessageInterceptor } from './shared/middlewares/interceptors/api-message.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ApiMessageInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
