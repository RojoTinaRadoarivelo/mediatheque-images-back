import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';


import { UsersModule } from './features/users/users.module';
import { PrismaModule } from './core/configs/interfaces/prisma-ripository/prisma-interfaces.module';


@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
