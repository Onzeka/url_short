import { Module } from '@nestjs/common';
import {
  PrismaUrlRepository,
  CryptoSlugGenerator,
  ShortenUrlUseCase,
  RedirectUrlUseCase,
  GetAnalyticsUseCase,
  UrlRepository,
  SlugGenerator,
} from '@stoik/url-shortener';
import { ShortenerController } from './shortener.controller.js';
import { RedirectionController } from './redirection.controller.js';
import { PrismaService } from './prisma.service.js';

@Module({
  controllers: [ShortenerController, RedirectionController],
  providers: [
    PrismaService,
    {
      provide: 'UrlRepository',
      useFactory: (prisma: PrismaService) => new PrismaUrlRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'SlugGenerator',
      useClass: CryptoSlugGenerator,
    },
    {
      provide: ShortenUrlUseCase,
      useFactory: (repo: UrlRepository, gen: SlugGenerator) =>
        new ShortenUrlUseCase(repo, gen),
      inject: ['UrlRepository', 'SlugGenerator'],
    },
    {
      provide: RedirectUrlUseCase,
      useFactory: (repo: UrlRepository) => new RedirectUrlUseCase(repo),
      inject: ['UrlRepository'],
    },
    {
      provide: GetAnalyticsUseCase,
      useFactory: (repo: UrlRepository) => new GetAnalyticsUseCase(repo),
      inject: ['UrlRepository'],
    },
  ],
})
export class ShortenerModule {}
