export interface CreateUserDto {
    email: string;
    password?: string;
}
export interface UpdateUserDto extends Partial<CreateUserDto> { }

