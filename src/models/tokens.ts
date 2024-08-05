import { JWTAccessToken, JWTRefreshToken } from '@src/auth/types';

export class Tokens {
  access_token: JWTAccessToken;
  refresh_token: JWTRefreshToken;
}
