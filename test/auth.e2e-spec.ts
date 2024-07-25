import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { CustomValidationPipe } from './../src/common/pipes/custom-validation.pipe';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  const dto = {
    email: 'test@example.com',
    password: 'password',
    fullname: 'Test User',
    username: 'testuser',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app = moduleFixture.createNestApplication();

    // Apply global settings
    app.useGlobalPipes(new CustomValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.user.deleteMany({});
    await prismaService.personalAccessToken.deleteMany({});

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto)
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should return 400 if some field is not provided', async () => {
      const dto = {
        fullname: 'Test Register User',
        email: '',
        password: 'password',
        username: 'testuser',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors.length).toBe(2);
    });

    it('should return 400 if email is invalid', async () => {
      const dto = {
        fullname: 'Test Register User',
        email: 'invalidEmail',
        password: 'password',
        username: 'testuser',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors.length).toBe(1);
    });

    it('should register a new user and return tokens', async () => {
      const dto = {
        fullname: 'Test Register User',
        email: 'testuserregister@example.com',
        password: 'password',
        username: 'testuserregister',
      };
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      expect(response.body.message).toBe('User successfully registered');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login the user and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dto.email,
          password: dto.password,
        })
        .expect(200);
      expect(response.body.message).toBe('User successfully logged in');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
    });

    it('should throw BadRequestException on incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dto.email,
          password: 'wrongPassword',
        })
        .expect(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testtt@example.com',
          password: 'password',
        })
        .expect(404);
      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('/auth/logout (DELETE)', () => {
    it('should log out the user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dto.email,
          password: dto.password,
        });

      console.log(response.body);
      const { access_token } = response.body.data;
      const response2 = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Authorization', `Bearer ${access_token.token}`)
        .expect(200);
      expect(response2.body.message).toBe('User successfully logged out');
      expect(response2.body).not.toHaveProperty('data');
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Authorization', 'Bearer invalidToken')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {

    it('should refresh the token and return new tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dto.email,
          password: dto.password,
        });

      const { refresh_token } = response.body.data;
      const response2 = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refresh_token.token}`)
        .expect(200);

      expect(response2.body.message).toBe('Token successfully refreshed');
      expect(response2.body.data).toHaveProperty('access_token');
      expect(response2.body.data).toHaveProperty('refresh_token');
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalidToken')
        .expect(401);
    });
  });
});