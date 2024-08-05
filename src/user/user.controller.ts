import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
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
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
          message: 'File size exceeds 5MB',
        })
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)/i,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ): Promise<WebResponse<UserModel>> {
    if (file) {
      request.profile = file?.originalname;
    }

    const { profile, ...data } = request;
    if (Object.keys(data).length === 0 && !profile) {
      return new WebResponse<User>({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No data to update',
      });
    }
    const response = await this.userService.update(user.user_id, request, file);
    return new WebResponse<UserModel>({
      statusCode: HttpStatus.OK,
      message: 'User data updated',
      data: response,
    });
  }
}
