import { PrismaClient, Role } from '@prisma/client';
import { ContractSeeder } from './contract/seed.interface';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { deleteAllFiles, downloadAndSaveImage } from './../../src/common/utils';
import { profileStorageConfig } from './../../config/storage.config';

export class UserSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    await deleteAllFiles(profileStorageConfig);
    const users = [
      {
        fullname: 'Test Admin',
        username: 'testadmin',
        email: 'testadmin@example.com',
        role: Role.ADMIN,
        password: '12345',
      },
      {
        fullname: 'Test User',
        username: 'testuser',
        email: 'testuser@example.com',
        role: Role.MEMBER,
        password: '12345',
      },
    ];

    const anotherUsers = Array.from({ length: 6 }, () => ({
      fullname: faker.person.fullName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      role: Role.MEMBER,
      password: '12345',
    }));

    await Promise.all(
      [...users, ...anotherUsers].map(async (user) => {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(user.password, salt);
        const profilePicture = await downloadAndSaveImage(
          faker.image.urlLoremFlickr({
            width: 200,
            height: 200,
            category: 'person',
          }),
          profileStorageConfig,
        );
        await prisma.user.create({
          data: {
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            salt: salt,
            profile: profilePicture,
          },
        });
      }),
    );

    console.log('User seeding completed.');
  }
}
