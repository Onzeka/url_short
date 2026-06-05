import { Module } from '@nestjs/common';
import { ShortenerModule } from './shortener/shortener.module.js';

@Module({
  imports: [ShortenerModule],
})
export class AppModule {}
