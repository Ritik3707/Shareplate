import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * Ensures single instance across the application
 * Handles connection pooling and lifecycle
 */
class DatabaseClient {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      });
    }
    return DatabaseClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
      DatabaseClient.instance = null as unknown as PrismaClient;
    }
  }
}

export const prisma = DatabaseClient.getInstance();
export default DatabaseClient;
