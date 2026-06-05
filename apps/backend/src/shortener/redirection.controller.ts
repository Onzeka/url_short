import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  RedirectUrlUseCase,
  UrlNotFoundException,
  InvalidSlugException,
} from '@stoik/url-shortener';

@Controller()
export class RedirectionController {
  constructor(private readonly redirectUrlUseCase: RedirectUrlUseCase) {}

  @Get(':slug')
  public async redirect(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Exclude API requests if they accidentally hit this router
    if (slug === 'api' || slug.startsWith('api/')) {
      return res.status(404).json({ message: 'Not found' });
    }

    try {
      const userAgent = req.get('user-agent') || null;
      // Get remote IP address
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const referrer = req.get('referer') || null;

      const originalUrl = await this.redirectUrlUseCase.execute(slug, {
        userAgent,
        ipAddress,
        referrer,
      });

      return res.redirect(302, originalUrl);
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
