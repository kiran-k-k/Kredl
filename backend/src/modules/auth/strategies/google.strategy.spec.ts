/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google.strategy';
import { ConfigService } from '@nestjs/config';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'GOOGLE_CLIENT_ID') return 'test-client-id';
              if (key === 'GOOGLE_CLIENT_SECRET') return 'test-client-secret';
              if (key === 'GOOGLE_CALLBACK_URL') return 'test-callback-url';
              return null;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return mapped user profile on validate', async () => {
    const mockProfile: any = {
      id: 'g123',
      emails: [{ value: 'test@google.com', verified: 'true' }],
      name: { givenName: 'John', familyName: 'Doe' },
      photos: [{ value: 'img.png' }],
    };

    const done = jest.fn();

    await strategy.validate('access', 'refresh', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      googleId: 'g123',
      email: 'test@google.com',
      firstName: 'John',
      lastName: 'Doe',
      profileImage: 'img.png',
      verifiedEmail: true,
    });
  });

  it('should handle missing profile fields gracefully', async () => {
    const mockProfile: any = {
      id: 'g123',
    };

    const done = jest.fn();

    await strategy.validate('access', 'refresh', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      googleId: 'g123',
      email: '',
      firstName: '',
      lastName: '',
      profileImage: undefined,
      verifiedEmail: false,
    });
  });
});
