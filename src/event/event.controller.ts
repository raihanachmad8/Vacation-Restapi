import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Public } from '@src/common/decorators';
import { EventModel, WebResponse } from '@src/models';
import { RolesGuard } from '@src/common/guards/roles.guard';
import { Roles } from '@src/common/decorators/role.decorator';
import { EventCategory, Role, User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@src/common/decorators/current-user.decorator';
import { CreateEventRequest, UpdateEventRequest } from './dto';
import { eventFilter } from './types';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Public()
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getCategories(
    @Query('s') search?: string,
  ): Promise<WebResponse<EventCategory[]>> {
    const categories = await this.eventService.getCategories(search);
    return new WebResponse<EventCategory[]>({
      message: 'Tags retrieved successfully',
      statusCode: HttpStatus.OK,
      data: categories,
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @UseInterceptors(FilesInterceptor('photos'))
  @HttpCode(HttpStatus.CREATED)
  async crateEvent(
    @CurrentUser() user: User,
    @Body() request: CreateEventRequest,
    @UploadedFiles() photos: Express.Multer.File[],
  ): Promise<WebResponse<EventModel>> {
    const ConvertRequest = {
      ...request,
      price_start: Number(request.price_start),
      price_end: Number(request.price_end),
      rating: Number(request.rating),
      photos: photos,
      user_id: user.user_id,
    };
    const response = await this.eventService.createEvent(ConvertRequest);
    return new WebResponse<EventModel>({
      message: 'Event created successfully',
      statusCode: HttpStatus.CREATED,
      data: response,
    });
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getHiddenGems(
    @Query() request: eventFilter,
    @CurrentUser() user?: User,
  ): Promise<WebResponse<EventModel[]>> {
    const ConvertRequest = {
      ...request,
      price_start: request?.price_start
        ? Number(request.price_start)
        : undefined,
      price_end: request?.price_end ? Number(request.price_end) : undefined,
      rating: request?.rating ? Number(request.rating) : undefined,
      page: request?.page ? Number(request.page) : undefined,
      limit: request?.limit ? Number(request.limit) : undefined,
    };

    const response = await this.eventService.search(ConvertRequest, user);

    return new WebResponse<EventModel[]>({
      data: response.data,
      message: 'Event fetched successfully',
      statusCode: HttpStatus.OK,
      paging: response.paging,
    });
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getHiddenGemsById(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ): Promise<WebResponse<EventModel>> {
    const response = await this.eventService.getEventById(id, user);

    return new WebResponse<EventModel>({
      data: response,
      message: 'Event fetched successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @UseInterceptors(FilesInterceptor('photos'))
  @HttpCode(HttpStatus.OK)
  async updateHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() request: Partial<UpdateEventRequest>,
    @UploadedFiles() photos: Express.Multer.File[],
  ): Promise<WebResponse<EventModel>> {
    const ConvertRequest = {
      ...request,
      event_id: id,
      price_start: Number(request.price_start),
      price_end: Number(request.price_end),
      rating: Number(request.rating),
      photos: photos,
      user_id: user.user_id,
    };
    const response = await this.eventService.updateEvent(ConvertRequest, user);

    return new WebResponse<EventModel>({
      data: response,
      message: 'Event updated successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.OK)
  async deleteHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<EventModel>> {
    await this.eventService.deleteEvent(id, user);

    return new WebResponse<EventModel>({
      message: 'Event deleted successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approveHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<EventModel>> {
    const response = await this.eventService.changeStatus(id, 'APPROVE', user);

    return new WebResponse<EventModel>({
      data: response,
      message: 'Event approved successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/revision')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async revisionHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<EventModel>> {
    const response = await this.eventService.changeStatus(id, 'REVISION', user);

    return new WebResponse<EventModel>({
      data: response,
      message: 'Event changed to revision successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async rejectHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<EventModel>> {
    const response = await this.eventService.changeStatus(id, 'REJECT', user);

    return new WebResponse<EventModel>({
      data: response,
      message: 'Event rejected successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async pendingHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<EventModel>> {
    const response = await this.eventService.changeStatus(id, 'PENDING', user);

    return new WebResponse<EventModel>({
      data: response,
      message: 'Event changed to pending successfully',
      statusCode: HttpStatus.OK,
    });
  }

  @Patch(':id/interest')
  @UseGuards(RolesGuard)
  @Roles(Role.MEMBER)
  @HttpCode(HttpStatus.CREATED)
  async interestHiddenGems(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<WebResponse<{ interest: boolean }>> {
    const response = await this.eventService.eventInterest(id, user);

    return new WebResponse<{ interest: boolean }>({
      data: response,
      message: 'Event interested successfully',
      statusCode: HttpStatus.CREATED,
    });
  }
}
