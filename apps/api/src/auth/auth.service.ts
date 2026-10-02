import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<void> {
    const expectedUsername = this.configService.getOrThrow<string>('ADMIN_USERNAME');

    const passwordHash = this.configService.getOrThrow<string>( 'ADMIN_PASSWORD_HASH', );

    const passwordMatches = !bcrypt.truncates(password) && (await bcrypt.compare(password, passwordHash));

    if ( username !== expectedUsername || !passwordMatches ) {
      throw new UnauthorizedException(
        'Invalid username or password',
      );
    }
  }
}