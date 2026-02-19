import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ErrorMessages } from '../../../shared/interfaces/error-messages';

export class CreatePhotoDto {
    @IsString({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    name: string;
    @IsString({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    path: string;
}

export class UpdatePhotoDto extends PartialType(CreatePhotoDto) { }