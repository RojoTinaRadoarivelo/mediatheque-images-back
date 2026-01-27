import { Controller } from '@nestjs/common';

import { UsersService } from './users.service';

import { Users } from './users.type';
import { CrudController } from '../../core/crud/abstract-crud.controller';
import { CreateUserDto, UpdateUserDto } from '../../shared/middlewares/DTOs/users.dto';

@Controller('users')
export class UsersController extends CrudController<CreateUserDto, UpdateUserDto, Users> {
  constructor(service: UsersService) { super(service); }
  // 🔥 Nouvelle route spécifique @Get('active') findActiveUsers() { return []; } } 
}
