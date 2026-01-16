import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { IPayload } from '../interfaces/auth.interface';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { HAS_TEMP_ACCESS_KEY } from '../../common/decorators/temp-access.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<IPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });

      if (payload?.isTemp === true) {
        const hasTempAccess = this.reflector.getAllAndOverride<boolean>(HAS_TEMP_ACCESS_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (!hasTempAccess) {
          throw new Error();
        }
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
