/* eslint-disable */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { EmailModule } from '../email/email.module';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

import { SECURITY_CONFIG } from '../../config/security.config';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
            SECURITY_CONFIG.TOKENS.DEFAULT_JWT_EXPIRATION,
          ) as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, PasswordService, TokenService],
})
export class AuthModule {}
