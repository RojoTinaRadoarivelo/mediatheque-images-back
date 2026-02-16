import { Controller } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) { }

  // list of photos
  // filters of photos
  // create photo with tag and user (photograph)
  // update tags properties for the photo
  // move to bin
  // delete photo
}
