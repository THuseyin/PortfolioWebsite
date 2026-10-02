import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request>();

    if (
      request.session.adminAuthenticated !== true
    ) {
      throw new UnauthorizedException(
        'Administrator authentication required',
      );
    }

    return true;
  }
}