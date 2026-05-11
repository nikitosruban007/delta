import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { SocialAuthProfile } from './google.strategy';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ??
        'http://localhost:3000/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<SocialAuthProfile> {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('GitHub account has no email');
    }

    return {
      provider: 'github',
      providerId: profile.id,
      email,
      name: profile.displayName?.trim() || profile.username || email.split('@')[0],
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}
