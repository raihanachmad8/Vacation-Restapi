import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserModel, WebResponse } from '@src/models';
import { User } from '@prisma/client';
import { UpdateUserRequest } from './dto';
import { UserFilter } from './types';
import { Public } from '@src/common/decorators';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async get(@CurrentUser() user: User): Promise<WebResponse<UserModel>> {
    const response = await this.userService.get(user.user_id);

    return new WebResponse<UserModel>({
      statusCode: HttpStatus.OK,
      message: 'User data retrieved',
      data: response,
    });
  }

  @Patch()
  @UseInterceptors(FileInterceptor('profile'))
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: User,
    @Body() request: UpdateUserRequest,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<WebResponse<UserModel>> {
    const ConvertRequest = {
      ...request,
      user_id: user.user_id,
      profile: file,
    };
    const response = await this.userService.update(ConvertRequest);
    return new WebResponse<UserModel>({
      statusCode: HttpStatus.OK,
      message: 'User data updated',
      data: response,
    });
  }

  @Public()
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() request: UserFilter): Promise<WebResponse<UserModel[]>> {
    const response = await this.userService.search(request);
    return new WebResponse<UserModel[]>({
      statusCode: HttpStatus.OK,
      message: 'User data retrieved',
      data: response.data,
      paging: response.paging,
    });
  }
}
