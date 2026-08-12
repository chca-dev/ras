CREATE TYPE "public"."media_status" AS ENUM('processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"title" varchar(160),
	"entry_date" date NOT NULL,
	"content" jsonb NOT NULL,
	"plain_text" text DEFAULT '' NOT NULL,
	"cover_media_id" uuid,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"entry_id" uuid NOT NULL,
	"status" "media_status" DEFAULT 'processing' NOT NULL,
	"original_name" text NOT NULL,
	"original_mime" text NOT NULL,
	"original_size" bigint NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"original_key" text NOT NULL,
	"display_key" text NOT NULL,
	"thumb_key" text NOT NULL,
	"checksum" text NOT NULL,
	"detached_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entries_owner_entry_date_created_at_idx" ON "entries" USING btree ("owner_id","entry_date" DESC NULLS LAST,"created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "entries_owner_updated_at_idx" ON "entries" USING btree ("owner_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "media_entry_created_at_idx" ON "media" USING btree ("entry_id","created_at");--> statement-breakpoint
CREATE INDEX "media_detached_at_idx" ON "media" USING btree ("detached_at");