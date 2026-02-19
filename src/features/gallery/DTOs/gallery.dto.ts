import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ErrorMessages } from '../../../shared/interfaces/error-messages';

export class CreateGalleryDto {
    @IsString({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    name: string;
    @IsString({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    path: string;
    @IsArray({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    tags_id: string[];
    @IsString({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    user_id: string;
    @IsString({ message: ErrorMessages.INVALID_TYPE })
    @IsOptional()
    photo_id?: string;
}

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) { }