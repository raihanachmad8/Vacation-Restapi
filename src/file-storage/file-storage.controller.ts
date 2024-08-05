import { Controller, Get, Param, Res } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { Response } from 'express';
import mime from 'mime-types';
import { Public } from '@src/common/decorators';

@Controller('storage')
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Public()
  @Get('public/articles/:filename')
  async getPublicArticleFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.fileStorageService.getFile(
        filename,
        FileStorageService.PUBLIC('articles'),
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

  @Public()
  @Get('public/profiles/:filename')
  async getPublicProfileFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.fileStorageService.getFile(
        filename,
        FileStorageService.PUBLIC('profiles'),
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
}
