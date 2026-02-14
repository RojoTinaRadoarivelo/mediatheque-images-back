import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { HttpExceptionUtil } from '../../../utils/http-exception.util';
import { ValidatorFormatter } from '../../../utils/validator-formatter.util';



@Injectable()
export class GenericDtoValidatorPipe<T> implements PipeTransform<T> {
  constructor(private readonly validationGroups: string[] = []) { }
  async transform(value: T, metadata: ArgumentMetadata): Promise<T> {
    if (!metadata.metatype || [String, Boolean, Number, Array].includes(metadata.metatype as any)) {
      return value;
    }

    const isCreateMode = this.validationGroups.includes('create');

    const object = plainToInstance(metadata.metatype, value);

    if (isCreateMode) {
      if (!value || typeof value !== 'object' || Object.keys(value).length === 0) {
        HttpExceptionUtil.badRequest('Please give all the required information!');
      }
    } else {
      const hasValidFields = Object.values(object).some((field) => field !== undefined);
      if (!hasValidFields) {
        HttpExceptionUtil.badRequest('Please provide at least one valid field to update!');
      }
    }

    const errors: ValidationError[] = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      groups: this.validationGroups,
    });

    if (errors.length) {
      HttpExceptionUtil.badRequest(ValidatorFormatter.format(errors));
    }

    return value;
  }
}
