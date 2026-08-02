import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserStatus } from '../../users/schemas/user.schema';
import { TokenVersionMismatchException } from '../exceptions/auth.exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (
      user.status === UserStatus.DELETED ||
      user.status === UserStatus.DEACTIVATED ||
      user.status === UserStatus.SUSPENDED
    ) {
      throw new UnauthorizedException('Account is inactive or suspended');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new TokenVersionMismatchException();
    }

    return {
      sub: payload.sub,
      id: payload.sub,
      _id: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
      roles: [payload.roleName],
      tokenVersion: payload.tokenVersion,
    };
  }
}
