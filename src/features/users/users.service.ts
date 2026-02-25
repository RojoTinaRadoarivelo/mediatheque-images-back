import { BadRequestException, ConflictException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';


import { UserRepository } from './users.repository';
import { CreatedUserOutputDto, DeletedUserOutputDto, FilterUsersOutputDto, SearchUsersOutputDto, UpdatedUserOutputDto, Users, UsersOutputDto } from './users.type';
import { CrudService } from '../../core/crud/abstract-crud.service';
import { CreateUserDto, UpdateUserDto } from '../../shared/middlewares/DTOs/users.dto';
import { DEFAULT_ERROR_MSG, USER_ERROR_MESSAGE, } from '../../auth/interfaces/error-messages';
import { assertSingle } from '../../utils/interfaces/assert-single.utils';
import { RemoveFile } from '../../utils/files.util';
import { IResponse } from '../../shared/interfaces/responses.interfaces';

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
    constructor(private readonly repo: UserRepository) { super(repo); }
    // override si nécessaire async create(data: CreateUserDto) { // logique custom return super.create(data); } 

    override async Update(
        id: string | null,
        data: UpdateUserDto,
        query?: any
    ): Promise<IResponse<Users | null>> {
        let response: IResponse<Users | null>;
        let user: Users | null = null;
        try {
            if (!id) {
                throw new BadRequestException('Missing user id');
            }

            const hasFile = !!query?.hasFile;
            const { avatar, email, userName } = data;
            const existingUser = await this.repo.FindOne(
                { id },
                this.searchIncludeParams,
            );

            if (!existingUser.data) {
                throw new NotFoundException(USER_ERROR_MESSAGE.notfound);
            }

            user = assertSingle(
                existingUser.data,
                'User not found or invalid result'
            );

            // 2️⃣ supprimer l’ancienne image SI changement
            if (hasFile && user!.avatar && user!.avatar !== avatar) {
                RemoveFile(user!.avatar);
            }
            // update User
            const UserUpdated = await this.repo.Update(id, { avatar, email, userName }, this.updateIncludeParams);
            if (UserUpdated) {
                user = assertSingle(
                    UserUpdated.data,
                    'User not found or invalid result'
                );
            } else {
                throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected)
            }
            return {
                message: 'The user was updated successfuly!',
                data: user ?? null,
                statusCode: 200
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                response = {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            } else if (error instanceof ConflictException) {
                response = {
                    statusCode: HttpStatus.CONFLICT,
                    message: error.message,
                };
            } else if (error instanceof BadRequestException) {
                response = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message,
                };
            } else {
                response = {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                };
            }
            return response;
        }
    }
} 
