import { PrismaClient } from '@prisma/client';

export abstract class ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
