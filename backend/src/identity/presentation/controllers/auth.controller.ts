import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { MeResponseDto } from '../dto/me-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { EmailAlreadyExistsError } from '../../application/errors/email-already-exists.error';
import { InvalidCredentialsError } from '../../application/errors/invalid-credentials.error';
import { UserNotFoundError } from '../../application/errors/user-not-found.error';
import { SocialLoginUseCase } from '../../application/use-cases/social-login.use-case';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { GithubAuthGuard } from '../guards/github-auth.guard';
import type { Request, Response } from 'express';

type SocialRequestUser = {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly socialLoginUseCase: SocialLoginUseCase,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login/Register with Google' })
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.withHttpErrors(() =>
      this.socialLoginUseCase.execute(req.user as SocialRequestUser),
    );
    return this.redirectAfterSocialAuth(res, result.accessToken);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Login/Register with GitHub' })
  githubAuth() {
    return;
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.withHttpErrors(() =>
      this.socialLoginUseCase.execute(req.user as SocialRequestUser),
    );
    return this.redirectAfterSocialAuth(res, result.accessToken);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiOkResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto) {
    return this.withHttpErrors(() => this.registerUseCase.execute(dto));
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto) {
    return this.withHttpErrors(() => this.loginUseCase.execute(dto));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: MeResponseDto })
  me(@CurrentUser() user: { id: string }) {
    return this.withHttpErrors(() => this.getMeUseCase.execute(user.id));
  }

  private redirectAfterSocialAuth(res: Response, accessToken: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const callbackUrl = new URL('/auth/callback', frontendUrl);
    callbackUrl.searchParams.set('token', accessToken);

    return res.redirect(callbackUrl.toString());
  }

  private async withHttpErrors<T>(handler: () => Promise<T>): Promise<T> {
    try {
      return await handler();
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }

      if (error instanceof EmailAlreadyExistsError) {
        throw new ConflictException(error.message);
      }

      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
