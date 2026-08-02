/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseHealthService } from './database-health.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class DatabaseHealthController {
  constructor(private readonly databaseHealthService: DatabaseHealthService) {}

  @Public()
  @Get('db/live')
  async getLiveHealth() {
    try {
      return await this.databaseHealthService.checkLive();
    } catch (error) {
      throw new HttpException(
        { status: 'unhealthy', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('db/full')
  async getFullHealth() {
    try {
      return await this.databaseHealthService.checkFull();
    } catch (error) {
      throw new HttpException(
        { status: 'unhealthy', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('security')
  getSecurityHealth() {
    return {
      status: 'secure',
      features: {
        helmet: true,
        cors: true,
        rateLimiter: true,
        jwtConfigured: !!process.env.JWT_SECRET,
        environmentValidation: true,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
