ALTER TABLE "media" ALTER COLUMN "original_mime" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "original_size" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "original_key" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "display_size" bigint;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "thumb_size" bigint;