import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './../prisma/prisma.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            personalAccessToken: {
              deleteMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1h'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw BadRequestException if user already exists', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ email: 'test@example.com' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password',
          fullname: 'Test User',
          username: 'testuser',
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it('should return tokens if registration is successful', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest
        .fn()
        .mockResolvedValue({ user_id: '1', email: 'test@example.com' });
      jwtService.sign = jest.fn().mockReturnValue('mockToken');
      prismaService.personalAccessToken.create = jest.fn();
      const result = await service.register({
        email: 'test@example.com',
        password: 'password',
        fullname: 'Test User',
        username: 'testuser',
      });
      expect(result).toEqual({
        access_token: { token: 'mockToken', expires_in: expect.any(Date) },
        refresh_token: { token: 'mockToken', expires_in: expect.any(Date) },
      });
    });
  });

  describe('login', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ password: 'hashedPassword' });
      bcrypt.compareSync = jest.fn().mockReturnValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongPassword' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return tokens if login is successful', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        user_id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      bcrypt.compareSync = jest.fn().mockReturnValue(true);
      jwtService.sign = jest.fn().mockReturnValue('mockToken');
      prismaService.personalAccessToken.create = jest.fn();

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        access_token: { token: 'mockToken', expires_in: expect.any(Date) },
        refresh_token: { token: 'mockToken', expires_in: expect.any(Date) },
      });
    });
  });

  describe('logout', () => {
    it('should throw UnauthorizedException if user_id is not provided', async () => {
      await expect(service.logout(null, 'token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.logout('userId', 'token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call revokeToken if user exists', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ user_id: '1' });

      // Mock the revokeToken method
      const revokeTokenMock = jest.fn();
      (service as any).revokeToken = revokeTokenMock;

      await service.logout('userId', 'token');

      expect(revokeTokenMock).toHaveBeenCalledWith('userId', 'token');
    });
  });

  describe('refresh', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.refresh('userId', 'token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return new tokens if refresh is successful', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ user_id: '1' });
      jwtService.sign = jest.fn().mockReturnValue('mockToken');
      prismaService.personalAccessToken.create = jest.fn();
      const revokeTokenMock = jest.fn();
      (service as any).revokeToken = revokeTokenMock;

      const result = await service.refresh('userId', 'token');

      expect(result).toEqual({
        access_token: { token: 'mockToken', expires_in: expect.any(Date) },
        refresh_token: { token: 'mockToken', expires_in: expect.any(Date) },
      });
      expect(revokeTokenMock).toHaveBeenCalledWith('userId', 'token');
    });
  });
});
