import { Injectable } from '@nestjs/common';


import { UserRepository } from './users.repository';
import { CreatedUserOutputDto, DeletedUserOutputDto, FilterUsersOutputDto, SearchUsersOutputDto, UpdatedUserOutputDto, Users, UsersOutputDto } from './users.type';
import { CrudService } from '../../core/crud/abstract-crud.service';
import { CreateUserDto, UpdateUserDto } from '../../shared/middlewares/DTOs/users.dto';

@Injectable()
export class UsersService extends CrudService<CreateUserDto, UpdateUserDto, Users> {
    // default
    protected includeParams: any = UsersOutputDto;
    // crud include
    protected createIncludeParams: any = CreatedUserOutputDto;
    protected updateIncludeParams: any = UpdatedUserOutputDto;
    protected deleteIncludeParams: any = DeletedUserOutputDto;
    protected searchIncludeParams: any = SearchUsersOutputDto;
    protected listFilterIncludeParams: any = FilterUsersOutputDto;
    constructor(repo: UserRepository) { super(repo); }
    // override si nécessaire async create(data: CreateUserDto) { // logique custom return super.create(data); } 
} 
