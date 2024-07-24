import type { JWTRefreshToken } from './jwt-rt.type';
import type { JWTAccessToken } from './jwt-at.type';

export class Tokens {
  access_token: JWTAccessToken;
  refresh_token: JWTRefreshToken;
}
