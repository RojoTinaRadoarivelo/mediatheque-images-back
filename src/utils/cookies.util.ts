import { CookieOptions } from 'express';

const environment = process.env;

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  // secure: environment.NODE_ENV == 'production',
  sameSite: 'lax',
  maxAge: +environment.COOKIE_ACCESS_DURATION!,
};

export const cookieRefreshOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  // secure: environment.NODE_ENV == 'production',
  sameSite: 'lax',
  maxAge: +environment.COOKIE_REFRESH_DURATION!,
};
