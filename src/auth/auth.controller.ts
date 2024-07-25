import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegistrationDto } from './dto';
import { Tokens } from './types';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { WebResponse } from './../models';
import { JwtAuthGuard, JwtRefreshAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: RegistrationDto): Promise<WebResponse<Tokens>> {
    const token = await this.authService.register(dto);

    return new WebResponse<Tokens>('User successfully registered', 201, token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: AuthDto): Promise<WebResponse<Tokens>> {
    const token = await this.authService.login(dto);
    return new WebResponse<Tokens>('User successfully logged in', 200, token);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('logout')
  async logout(@Req() req: Request): Promise<WebResponse> {
    await this.authService.logout(req['user']['user_id'], req['user']['token']);

    return new WebResponse('User successfully logged out', 200);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request): Promise<WebResponse<Tokens>> {
    const token = await this.authService.refresh(
      req['user']['user_id'],
      req['user']['token'],
    );

    return new WebResponse<Tokens>('Token successfully refreshed', 200, token);
  }
}
