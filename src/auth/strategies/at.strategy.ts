import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../types';
import { Request } from 'express';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    const valid = await this.prismaService.personalAccessToken.findFirst({
      where: {
        access_token: token,
      },
    });

    if (!valid) {
      throw new ForbiddenException('Invalid token');
    }

    return { token, ...payload };
  }

  validateToken(token: string) {
    const valid = this.prismaService.personalAccessToken.findFirst({
      where: {
        access_token: token,
      },
    });

    if (!valid) {
      throw new ForbiddenException('Invalid token');
    }

    const secret = this.configService.get<string>('JWT_SECRET');

    return this.jwtService.verify(token, {
      secret,
    });
  }
}
