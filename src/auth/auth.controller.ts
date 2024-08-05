import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { WebResponse } from '@src/models';
import { JwtRefreshAuthGuard } from './guards';
import { Public } from '@src/common/decorators';
import { Tokens } from '@src/models/tokens';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { RegisterRequest, LoginRequest } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() request: RegisterRequest,
  ): Promise<WebResponse<Tokens>> {
    const token = await this.authService.register(request);

    return new WebResponse<Tokens>({
      message: 'User successfully registered',
      data: token,
      statusCode: HttpStatus.CREATED,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() request: LoginRequest): Promise<WebResponse<Tokens>> {
    const token = await this.authService.login(request);
    return new WebResponse<Tokens>({
      message: 'User successfully logged in',
      data: token,
      statusCode: HttpStatus.OK,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Delete('logout')
  async logout(@CurrentUser() user: User): Promise<WebResponse> {
    await this.authService.logout(user.user_id, user['token']);

    return new WebResponse({
      message: 'User successfully logged out',
      statusCode: HttpStatus.OK,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: User): Promise<WebResponse<Tokens>> {
    const token = await this.authService.refresh(user.user_id, user['token']);

    return new WebResponse<Tokens>({
      message: 'Token successfully refreshed',
      data: token,
      statusCode: HttpStatus.OK,
    });
  }
}
