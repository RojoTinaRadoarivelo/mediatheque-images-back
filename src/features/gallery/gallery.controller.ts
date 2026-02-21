import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { PhotoService } from './photo/photo.service';
import { CreateGalleryDto, UpdateGalleryDto } from './DTOs/gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { Photos } from './photo/photos.type';
import { Galleries } from './gallery.type';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService, private readonly photoService: PhotoService) { }

  // list of photos
  @Get('photos')
  async ListPhoto(@Query('page') page = 1, @Query('limit') limit = 12): Promise<IResponse<Photos[]>> {
    return await this.galleryService.getAllPhoto(+page, +limit);
  }
  // filters of photos
  @Post('photos-filtered')
  async ListFilteredPhoto(@Query('page') page = 1, @Query('limit') limit = 12, @Body() query: any): Promise<IResponse<Photos[]>> {
    return await this.galleryService.getFilteredPhoto(query, +page, +limit);
  }
  // create photo with tag and user (photograph)
  @UseInterceptors(
    FileInterceptor('objectFile', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accepter uniquement les fichiers Image
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
          return cb(new Error('Seuls les fichiers Image sont acceptés'), false);
        }
        cb(null, true);
      },
    }),
  )
  @Post('photos')
  async CreatePhoto(@UploadedFile() file: Express.Multer.File, @Body() data: CreateGalleryDto): Promise<IResponse<any[]>> {
    if (!file) {
      throw new Error('File not imported');
    }
    const filePath = file.path;
    data.path = filePath;
    return await this.galleryService.createPhoto(data);
  }
  // move to bin
  @Put('photos/moveToBin/:id')
  async MoveToBinPhoto(@Param('id') id: string): Promise<IResponse<Galleries | null>> {
    return await this.galleryService.moveToBinPhoto(id);
  }
  // restore from bin
  @Put('photos/restoreFromBin/:id')
  async RestoreFromBinPhoto(@Param('id') id: string): Promise<IResponse<Galleries | null>> {
    return await this.galleryService.restoreFromBinPhoto(id);
  }
  // update tags properties and/or for the photo
  @UseInterceptors(
    FileInterceptor('objectFile', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accepter uniquement les fichiers Image
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
          return cb(new Error('Seuls les fichiers Image sont acceptés'), false);
        }
        cb(null, true);
      },
    }),
  )
  @Put('photos/update')
  async UpdatePhoto(@UploadedFile() file: Express.Multer.File, @Body() data: UpdateGalleryDto): Promise<IResponse<any[]>> {
    const filePath = file?.path ?? data.path;
    data.path = filePath;
    return await this.galleryService.updatePhoto(data);
  }
  // delete photo
  @Delete('photos/:id')
  async DeletePhoto(@Param('id') id: string): Promise<IResponse<Galleries | null>> {
    return await this.galleryService.deletePhoto(id);
  }
}
