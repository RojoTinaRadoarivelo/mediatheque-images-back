import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';


import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/configs/interfaces/prisma-ripository/prisma-interfaces.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './shared/middlewares/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG } from './core/configs/config';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './features/users/users.module';
import { TagsModule } from './features/tags/tags.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [CONFIG],
      cache: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('ttl', 1000),
            limit: config.get<number>('limit', 5),
            blockDuration: config.get<number>('ttl')
          },
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    TagsModule
  ],
  controllers: [AppController],
  providers: [
    AppService, {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('*'); // Apply to all routes
  }
}
