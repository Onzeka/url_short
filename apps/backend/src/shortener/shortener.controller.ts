import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ShortenUrlUseCase,
  GetAnalyticsUseCase,
  InvalidUrlException,
  InvalidSlugException,
  UrlNotFoundException,
  SlugCollisionException,
  DomainException,
} from '@stoik/url-shortener';

@Controller('api')
export class ShortenerController {
  constructor(
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    private readonly getAnalyticsUseCase: GetAnalyticsUseCase
  ) {}

  @Post('shorten')
  public async shorten(
    @Body('originalUrl') originalUrl: string,
    @Body('customSlug') customSlug: string | undefined,
    @Req() req: Request
  ) {
    if (!originalUrl) {
      throw new BadRequestException('originalUrl is required.');
    }

    try {
      const result = await this.shortenUrlUseCase.execute(originalUrl, customSlug);
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol;
      const shortenedUrl = `${protocol}://${host}/${result.getSlug().getValue()}`;

      return {
        id: result.getId(),
        slug: result.getSlug().getValue(),
        originalUrl: result.getOriginalUrl().getValue(),
        shortenedUrl,
        clicks: result.getClicks(),
        createdAt: result.getCreatedAt(),
      };
    } catch (err) {
      if (err instanceof InvalidUrlException || err instanceof InvalidSlugException) {
        throw new BadRequestException(err.message);
      }
      if (err instanceof DomainException) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Get('analytics/:slug')
  public async getAnalytics(@Param('slug') slug: string) {
    try {
      const analytics = await this.getAnalyticsUseCase.execute(slug);
      return analytics;
    } catch (err) {
      if (err instanceof InvalidSlugException) {
        throw new BadRequestException(err.message);
      }
      if (err instanceof UrlNotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }
}
