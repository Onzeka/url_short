-- CreateTable
CREATE TABLE "shortened_urls" (
    "id" UUID NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shortened_urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_visits" (
    "id" UUID NOT NULL,
    "shortenedUrlId" UUID NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(100),
    "referrer" TEXT,

    CONSTRAINT "url_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shortened_urls_slug_key" ON "shortened_urls"("slug");

-- AddForeignKey
ALTER TABLE "url_visits" ADD CONSTRAINT "url_visits_shortenedUrlId_fkey" FOREIGN KEY ("shortenedUrlId") REFERENCES "shortened_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
