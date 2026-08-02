import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'client-id',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'client-secret',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:5000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos, id } = profile;
    const user = {
      googleId: id,
      email: emails && emails[0] ? emails[0].value : '',
      firstName: name && name.givenName ? name.givenName : '',
      lastName: name && name.familyName ? name.familyName : '',
      profileImage: photos && photos[0] ? photos[0].value : undefined,
      verifiedEmail:
        emails && emails[0] ? String(emails[0].verified) === 'true' : false,
    };

    done(null, user);
  }
}
