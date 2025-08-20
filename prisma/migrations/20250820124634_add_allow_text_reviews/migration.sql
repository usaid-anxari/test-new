-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "audioId" TEXT,
ADD COLUMN     "text" TEXT,
ADD COLUMN     "textStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "allowTextReviews" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."AudioAsset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AudioAsset_s3Key_key" ON "public"."AudioAsset"("s3Key");

-- AddForeignKey
ALTER TABLE "public"."AudioAsset" ADD CONSTRAINT "AudioAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "public"."AudioAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
