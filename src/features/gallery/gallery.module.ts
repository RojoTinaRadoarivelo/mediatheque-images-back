import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { PhotoService } from './photo/photo.service';

@Module({
  controllers: [GalleryController],
  providers: [GalleryService, PhotoService],
})
export class GalleryModule {}
