import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../types';
import { Request } from 'express';
import { PrismaService } from './../../prisma/prisma.service';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = req.headers.authorization.split(' ')[1];
    const valid = await this.prismaService.personalAccessToken.findFirst({
      where: {
        access_token: token,
      },
    });

    if (!valid || !token) {
      throw new ForbiddenException('Invalid token');
    }

    return { token, ...payload };
  }
}
