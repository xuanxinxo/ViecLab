import { PrismaClient as OriginalPrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  interface RunCommandResult {
    ok: number;
    [key: string]: any;
  }

  interface FindCommandResult<T = any> extends RunCommandResult {
    cursor?: {
      firstBatch: T[];
      id?: any;
      ns?: string;
    };
  }

  interface CountCommandResult extends RunCommandResult {
    n: number;
  }

  interface UpdateCommandResult extends RunCommandResult {
    n: number;
    nModified: number;
  }

  interface DeleteCommandResult extends RunCommandResult {
    n: number;
  }

  interface InsertCommandResult extends RunCommandResult {
    n: number;
    insertedIds: { [key: string]: any };
  }

  export interface PrismaClient extends OriginalPrismaClient {
    $runCommand<T = any>(command: any): Promise<T>;
    $runCommandRaw<T = any>(command: any): Promise<T>;
  }
}

export {};
