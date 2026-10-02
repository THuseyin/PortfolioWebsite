import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

function regenerateSession( request: Request, ): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function saveSession(request: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function destroySession(
  request: Request,
): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

@Controller('admin/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  ) {
    await this.authService.validateCredentials(
      loginDto.username,
      loginDto.password,
    );

    await regenerateSession(request);

    request.session.adminAuthenticated = true;

    await saveSession(request);

    return {
      authenticated: true,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await destroySession(request);

    response.clearCookie('portfolio.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure:
        this.configService.get('NODE_ENV') ===
        'production',
    });
  }

  @Get('session')
  getSession(@Req() request: Request) {
    return {
      authenticated:
        request.session.adminAuthenticated === true,
    };
  }
}