/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'JWT_SECRET') return 'test_secret';
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', async () => {
      const payload = {
        sub: '123',
        email: 'test@test.com',
        roleId: 'r1',
        roleName: 'Student',
        tokenVersion: 1,
      };

      (jwtService.signAsync as jest.Mock).mockResolvedValueOnce(
        'access_token_value',
      );
      (jwtService.signAsync as jest.Mock).mockResolvedValueOnce(
        'refresh_token_value',
      );

      const result = await service.generateTokens(payload);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'access_token_value',
        refreshToken: 'refresh_token_value',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify access token with default options', () => {
      const token = 'valid_token';
      const decodedPayload = { sub: '123' };
      (jwtService.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = service.verifyToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'test_secret',
      });
      expect(result).toBe(decodedPayload);
    });

    it('should verify refresh token when isRefresh is true', () => {
      const token = 'refresh_token';
      const decodedPayload = { sub: '123' };
      (jwtService.verify as jest.Mock).mockReturnValue(decodedPayload);
      (configService.get as jest.Mock).mockReturnValueOnce(
        'refresh_secret_value',
      );

      const result = service.verifyToken(token, true);

      expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'refresh_secret_value',
      });
      expect(result).toBe(decodedPayload);
    });
  });
});
