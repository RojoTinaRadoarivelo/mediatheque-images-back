import { Controller, Post, Req, Res } from '@nestjs/common';
import { SignOutService } from './sign-out.service';
import { Request, Response } from 'express';

@Controller('auth')
export class SignOutController {
  constructor(private readonly signOutService: SignOutService) {}

  @Post('sign-out')
  async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
    if (req.cookies['accessToken']) {
      res.clearCookie('accessToken');
    }

    return res.status(200).json({
      message: 'User logged out successfuly!',
      statusCode: 200,
    });
  }
}
