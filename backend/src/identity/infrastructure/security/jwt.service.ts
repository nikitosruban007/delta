import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ITokenService } from '../../application/ports/token-service.port';
import { AccessTokenPayload } from '../../application/types/access-token-payload.type';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwt: NestJwtService) {}

  sign(payload: AccessTokenPayload): string {
    return this.jwt.sign(payload);
  }
}
