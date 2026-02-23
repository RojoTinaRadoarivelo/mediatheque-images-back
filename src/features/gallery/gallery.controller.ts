import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { PhotoService } from './photo/photo.service';
import { CreateGalleryDto, UpdateGalleryDto } from './DTOs/gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { basename, extname } from 'path';
import { diskStorage } from 'multer';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { Galleries } from './gallery.type';
import { Response } from 'express';
import { join } from 'path';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService, private readonly photoService: PhotoService) { }

  // list of photos
  @Get('photos')
  async ListPhoto(@Query('page') page = 1, @Query('limit') limit = 12): Promise<IResponse<Galleries[]>> {
    return await this.galleryService.getAllPhoto(+page, +limit);
  }
  // filters of photos
  @Post('photos-filtered')
  async ListFilteredPhoto(@Query('page') page = 1, @Query('limit') limit = 12, @Body() query: any): Promise<IResponse<Galleries[]>> {
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
          cb(null, `Photo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accepter uniquement les fichiers Image
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
          return cb(new Error('Seuls les fichiers Image sont acceptÃ©s'), false);
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

  // update tags properties and/or for the photo
  @UseInterceptors(
    FileInterceptor('objectFile', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `Photo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accepter uniquement les fichiers Image
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
          return cb(new Error('Seuls les fichiers Image sont acceptÃ©s'), false);
        }
        cb(null, true);
      },
    }),
  )
  @Put('photos/update')
  async UpdatePhoto(@UploadedFile() file: Express.Multer.File, @Body() data: UpdateGalleryDto): Promise<IResponse<any[]>> {
    const filePath = file?.path ?? data.path;
    data.path = filePath;
    return await this.galleryService.updatePhoto(data, file ? true : false);
  }
  // delete photo
  @Delete('photos/:id')
  async DeletePhoto(@Param('id') id: string): Promise<IResponse<Galleries | null>> {
    return await this.galleryService.deletePhoto(id);
  }

  @Get('photos/:id/download')
  async downloadPhoto(@Param('id') id: string, @Res() res: Response) {
    // RÃ©cupÃ©rer les infos du fichier depuis la DB
    const photo = await this.galleryService.findById(id);
    if (!photo.data) {
      return res.status(404).json({ message: 'Photo not found' });
    }


    const filePath = join(process.cwd(), photo.data.photo.path);

    // Ne prendre que le nom du fichier (sans le dossier)
    const fileName = basename(filePath); // "Photo-1771764399638-194926642.jpg"

    // DÃ©tecter type MIME
    const ext = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';

    // Headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    res.sendFile(filePath);
  }
}

