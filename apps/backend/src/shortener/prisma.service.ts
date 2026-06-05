import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@stoik/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to the database.');
    } catch (error) {
      console.error('Failed to connect to the database on startup:', error);
      process.exit(1);
    }
  }

  async onApplicationShutdown() {
    await this.$disconnect();
    console.log('Successfully disconnected from the database.');
  }
}
