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
import { FileVisibility, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { createFileStorageConfig } from 'src/common/utils/file-storage-util';
import { WebResponse } from 'src/models';
import { UpdateUserDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async get(@CurrentUser() user: User): Promise<WebResponse<User>> {
    const response = await this.userService.get(user.user_id);

    return new WebResponse<User>({
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
    @Body() dto: UpdateUserDto,
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
  ): Promise<WebResponse<User>> {
    if (file) {
      dto.profile = file?.originalname;
    }

    const { profile, ...data } = dto;
    if (Object.keys(data).length === 0 && !profile) {
      return new WebResponse<User>({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No data to update',
      });
    }
    const response = await this.userService.update(user.user_id, dto, file);
    return new WebResponse<User>({
      statusCode: HttpStatus.OK,
      message: 'User data updated',
      data: response,
    });
  }
}
