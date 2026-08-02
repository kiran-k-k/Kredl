/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { TokenPair } from '../types/token-pair.type';
import { SECURITY_CONFIG } from '../../../config/security.config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_EXPIRES_IN',
          SECURITY_CONFIG.TOKENS.DEFAULT_JWT_EXPIRATION,
        ) as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          SECURITY_CONFIG.TOKENS.DEFAULT_REFRESH_EXPIRATION,
        ) as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyToken(token: string, isRefresh = false): JwtPayload {
    const secretKey = isRefresh ? 'JWT_REFRESH_SECRET' : 'JWT_SECRET';
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>(secretKey),
    });
  }
}
