import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ErrorMessages } from '../../../shared/interfaces/error-messages';

export class CreateTagDto {
    @IsString({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    name: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) { }