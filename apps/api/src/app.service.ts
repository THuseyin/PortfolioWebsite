import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Portfolio API',
      version: '1.0.0',
    };
  }
}
