import { IsJSON, IsNotEmpty, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ErrorMessages } from '../../../shared/interfaces/error-messages';

export class CreatePreferenceDto {
    @IsUUID('4', { message: ErrorMessages.INVALID_ID })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    user_id: string;
    @IsJSON({ message: ErrorMessages.INVALID_TYPE })
    @IsNotEmpty({ message: ErrorMessages.REQUIRED })
    preferences;

}

export class UpdatePreferenceDto extends PartialType(CreatePreferenceDto) { }