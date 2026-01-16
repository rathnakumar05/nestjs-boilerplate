import type { Request } from 'express';

export interface IPayload {
  sub: string;
  isTemp?: boolean;
  iat: number;
  exp: number;
}

export interface IAuthRequest extends Request {
  user?: IPayload;
  cookies: {
    refresh_token?: string;
  };
}
