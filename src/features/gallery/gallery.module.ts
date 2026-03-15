import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { PhotoService } from './photo/photo.service';

@Module({
  imports: [],
  controllers: [GalleryController],
  providers: [GalleryService, PhotoService],
  exports: [GalleryService, PhotoService],
})
export class GalleryModule { }
