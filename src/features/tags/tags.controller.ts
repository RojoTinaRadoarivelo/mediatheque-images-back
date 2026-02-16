import { Controller } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CrudController } from '../../core/crud/abstract-crud.controller';
import { Tags } from './tags.type';
import { CreateTagDto, UpdateTagDto } from './DTOs/tags.dto';

@Controller('tags')
export class TagsController extends CrudController<CreateTagDto, UpdateTagDto, Tags> {
  constructor(private readonly tagsService: TagsService) { super(tagsService); }

  protected getCreateDto() {
    return CreateTagDto;
  }

  protected getUpdateDto() {
    return UpdateTagDto;
  }
}
