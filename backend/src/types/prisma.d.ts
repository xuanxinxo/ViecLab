import { PrismaClient as OriginalPrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient extends OriginalPrismaClient {
    $runCommandRaw<T = any>(command: object): Promise<T>;
    $queryRaw<T = any>(query: string | TemplateStringsArray, ...values: any[]): Promise<T>;
  }
}
