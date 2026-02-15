export interface CreateUserDto {
    email: string;
    password?: string;
    userName?: string;
}
export interface UpdateUserDto extends Partial<CreateUserDto> { }

