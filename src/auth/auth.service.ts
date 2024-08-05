import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { JWTRefreshToken, JWTAccessToken } from './types';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types';
import ms from 'ms';
import { User } from '@prisma/client';
import { LoginRequest, RegisterRequest } from './dto';
import { ValidationService } from '@src/common/validation.service';
import { AuthValidation } from './auth.validation';
import { Tokens } from '@src/models/tokens';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private validationService: ValidationService,
  ) {}

  async register(request: RegisterRequest): Promise<Tokens> {
    const RegisterRequest = this.validationService.validate(
      AuthValidation.REGISTER_REQUEST,
      request,
    );
    const user = await this.prismaService.user.findUnique({
      where: { email: RegisterRequest.email },
    });

    if (user) {
      throw new BadRequestException('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = this.hashPassword(RegisterRequest.password, salt);

    const newUser = await this.prismaService.user.create({
      data: {
        fullname: RegisterRequest.fullname,
        username: RegisterRequest.username,
        email: RegisterRequest.email,
        password: hash,
        salt: salt,
      },
    });

    const { access_token, refresh_token } = await this.generateToken(newUser);

    return { access_token, refresh_token };
  }

  async login(request: LoginRequest): Promise<Tokens> {
    const LoginRequest = this.validationService.validate(
      AuthValidation.LOGIN_REQUEST,
      request,
    );
    const user = await this.prismaService.user.findUnique({
      where: { email: LoginRequest.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (bcrypt.compareSync(LoginRequest.password, user.password)) {
      const { access_token, refresh_token } = await this.generateToken(user);

      return { access_token, refresh_token };
    } else {
      throw new BadRequestException('Invalid credentials');
    }
  }

  async logout(user_id: string, at: string): Promise<void> {
    if (!user_id) {
      throw new UnauthorizedException('User is not logged in');
    }

    const user = await this.prismaService.user.findUnique({
      where: { user_id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.revokeToken(user_id, at);
  }

  async refresh(user_id: string, rt: string): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { access_token, refresh_token } = await this.generateToken(user, rt);
    await this.revokeToken(user_id, rt);

    return { access_token, refresh_token: refresh_token };
  }

  public hashPassword(password: string, salt: string): string {
    return bcrypt.hashSync(password, salt);
  }

  private async generateAccessToken(user: User): Promise<JWTAccessToken> {
    const payload: JwtPayload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      timestamp: Date.now(),
    };
    const durationInMs = ms(
      this.configService.get<string>('JWT_SECRET_EXPIRATION'),
    );
    const expires = new Date(new Date().getTime() + durationInMs);
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_SECRET_EXPIRATION'),
    });
    return {
      token,
      expires_in: expires,
    };
  }

  private async generateRefreshToken(user: User): Promise<JWTRefreshToken> {
    const payload: JwtPayload = {
      user_id: user.user_id,
      timestamp: Date.now(),
    };

    const durationInMs = ms(
      this.configService.get<string>('JWT_SECRET_REFRESH_EXPIRATION'),
    );
    const expires = new Date(new Date().getTime() + durationInMs);
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
      expiresIn: this.configService.get<string>(
        'JWT_SECRET_REFRESH_EXPIRATION',
      ),
    });

    return {
      token,
      expires_in: expires,
    };
  }

  private async generateToken(user: User, lastToken?: string): Promise<Tokens> {
    if (lastToken) {
      await this.prismaService.personalAccessToken.deleteMany({
        where: {
          OR: [
            {
              access_token: lastToken,
            },
            {
              refresh_token: lastToken,
            },
          ],
          AND: {
            user_id: user.user_id,
          },
        },
      });
    }
    const access_token = await this.generateAccessToken(user);
    const refresh_token = await this.generateRefreshToken(user);

    await this.prismaService.personalAccessToken.create({
      data: {
        access_token: access_token.token,
        refresh_token: refresh_token.token,
        user_id: user.user_id,
        expires_access_token: access_token.expires_in,
        expires_refresh_token: refresh_token.expires_in,
      },
    });

    return { access_token, refresh_token };
  }

  private async revokeToken(user_id: string, token: string): Promise<void> {
    await this.prismaService.personalAccessToken.deleteMany({
      where: {
        OR: [
          {
            access_token: token,
          },
          {
            refresh_token: token,
          },
        ],
        AND: {
          user_id: user_id,
        },
      },
    });
  }
}
