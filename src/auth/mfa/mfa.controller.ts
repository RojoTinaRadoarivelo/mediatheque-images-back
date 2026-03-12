import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';

import { MfaService } from './mfa.service';
import {
  SendVerificationCodeDto,
  VerificationCodeDto,
} from '../interfaces/dtos/verification-code.dto';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';
import { reponsesDTO } from '../../utils/interfaces/responses';

@Controller('auth')
export class MfaController {
  constructor(private readonly _mfaService: MfaService) { }

  @Get('google/redirect')
  RedirectGoogle(@Query('code') code?: string, @Query('error') error?: string) {
    return { code: code || null, error: error || null };
  }
  @Post('send-verification-code')
  @UsePipes(new GenericDtoValidatorPipe(SendVerificationCodeDto))
  async SendVerification(
    @Body() data: SendVerificationCodeDto,
  ): Promise<reponsesDTO<object | null>> {
    const sendmailVerification = await this._mfaService.SendVerificationCode(data.email);

    const statusCode = sendmailVerification.statusCode;
    const message = sendmailVerification.message;

    const response: reponsesDTO<object | null> = { statusCode, message };

    return response;
  }
  @Post('verify-code')
  @UsePipes(new GenericDtoValidatorPipe(VerificationCodeDto))
  async VerifyCode(@Body() data: VerificationCodeDto): Promise<reponsesDTO<object | null>> {
    const sendmailVerification = await this._mfaService.verifyCode(data.email, data.code);

    const statusCode = sendmailVerification.statusCode;
    const message = sendmailVerification.message;

    const response: reponsesDTO<object | null> = { statusCode, message };

    return response;
  }
}
