export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidUrlException extends DomainException {
  constructor(message = 'The target URL is invalid or blocked for security reasons.') {
    super(message);
  }
}

export class InvalidSlugException extends DomainException {
  constructor(message = 'The slug must be 4-10 alphanumeric characters.') {
    super(message);
  }
}

export class UrlNotFoundException extends DomainException {
  constructor(slug: string) {
    super(`Short URL with slug "${slug}" not found.`);
  }
}

export class SlugCollisionException extends DomainException {
  constructor() {
    super('A collision occurred while generating the short URL code. Please try again.');
  }
}
