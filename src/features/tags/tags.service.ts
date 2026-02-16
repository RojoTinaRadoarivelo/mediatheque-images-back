import { Injectable } from '@nestjs/common';
import { CrudService } from '../../core/crud/abstract-crud.service';
import { CreateTagDto, UpdateTagDto } from './DTOs/tags.dto';
import { TagsOutputDto, CreatedTagOutputDto, UpdatedTagOutputDto, DeletedTagOutputDto, SearchTagsOutputDto, FilterTagsOutputDto, Tags } from './tags.type';
import { TagRepository } from './tags.repository';

@Injectable()
export class TagsService extends CrudService<CreateTagDto, UpdateTagDto, Tags> {
    // default
    protected includeParams: any = TagsOutputDto;
    // crud include
    protected createIncludeParams: any = CreatedTagOutputDto;
    protected updateIncludeParams: any = UpdatedTagOutputDto;
    protected deleteIncludeParams: any = DeletedTagOutputDto;
    protected searchIncludeParams: any = SearchTagsOutputDto;
    protected listFilterIncludeParams: any = FilterTagsOutputDto;
    constructor(repo: TagRepository) { super(repo); }
}
