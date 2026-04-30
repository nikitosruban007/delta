import { AccessTokenPayload } from '../types/access-token-payload.type';

export interface ITokenService {
  sign(payload: AccessTokenPayload): Promise<string> | string;
}
