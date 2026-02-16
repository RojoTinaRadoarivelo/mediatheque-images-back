import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';

import { Users } from './users.type';
import { CrudController } from '../../core/crud/abstract-crud.controller';
import { CreateUserDto, UpdateUserDto } from '../../shared/middlewares/DTOs/users.dto';
import { AuthGuard } from '../../shared/middlewares/Guards/auth.guard';
import { reponsesDTO } from '../../utils/interfaces/responses';
import { AuthUserPresenter } from '../../auth/interfaces/presenters/auth-user.presenter';
import { SignedUserDto } from '../../auth/interfaces/dtos/signed-user.dto';

@Controller('users')
export class UsersController extends CrudController<CreateUserDto, UpdateUserDto, Users> {
  constructor(service: UsersService) { super(service); }
  protected getCreateDto() {
    return CreateUserDto;
  }

  protected getUpdateDto() {
    return UpdateUserDto;
  }

  // 🔥 Nouvelle route spécifique @Get('active') findActiveUsers() { return []; } } 

  @Get('info')
  @UseGuards(AuthGuard)
  async FindByToken(@Req() req: any): Promise<reponsesDTO<SignedUserDto>> {
    const userPresenter: AuthUserPresenter = new AuthUserPresenter();
    const dataResponse = req.user ? userPresenter.present(req.user) : null;
    return {
      message: 'Information about the user',
      data: dataResponse,
      statusCode: 200,
    };
  }
}
