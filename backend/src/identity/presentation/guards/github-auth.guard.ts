import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isGithubAuthEnabled } from '../../infrastructure/security/social-auth.config';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  canActivate(context: ExecutionContext) {
    if (!isGithubAuthEnabled()) {
      throw new NotFoundException('GitHub auth is disabled');
    }

    return super.canActivate(context);
  }
}
