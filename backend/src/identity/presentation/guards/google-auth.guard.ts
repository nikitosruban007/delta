import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isGoogleAuthEnabled } from '../../infrastructure/security/social-auth.config';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (!isGoogleAuthEnabled()) {
      throw new NotFoundException('Google auth is disabled');
    }

    return super.canActivate(context);
  }
}
