import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { Response } from 'express';
import mime from 'mime-types';
import { Public } from '@src/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '@src/models';

@Controller('storage')
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Public()
  @Get('public/:folder/:filename')
  async getPublicArticleFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.fileStorageService.getFile(
        filename,
        FileStorageService.PUBLIC(folder),
      );
      const mimeType = mime.lookup(filename);
      res.setHeader('Content-Type', mimeType);
      res.send(buffer);
    } catch (error) {
      res.status(404).send({
        statusCode: 404,
        timestamp: new Date().toISOString(),
        message: 'File not found',
        error: 'Not Found',
      });
    }
  }

  @Post('file-storage')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WebResponse<any>> {
    const response = await this.fileStorageService.uploadFile(
      { file, user_id: user.user_id },
      FileStorageService.PUBLIC('file-storage'),
    );

    return new WebResponse<any>({
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: {
        url: response,
      },
    });
  }

  @Delete('file-storage/:filename')
  @HttpCode(HttpStatus.OK || HttpStatus.NO_CONTENT)
  async deleteFile(
    @CurrentUser() user: User,
    @Param('filename') filename: string,
  ): Promise<WebResponse<any>> {
    await this.fileStorageService.deleteFile(
      filename,
      FileStorageService.PUBLIC('file-storage'),
      user,
    );

    return new WebResponse<any>({
      statusCode: HttpStatus.OK || HttpStatus.NO_CONTENT,
      message: 'File deleted successfully',
    });
  }
}
