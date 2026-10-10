CREATE TABLE "activities" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"body" text NOT NULL,
	"description" text,
	"day" text,
	"time" text,
	"price" text,
	"age_range" text,
	"contact" text,
	"phone" text,
	"external_url" text,
	"hero_image_path" text,
	"hero_image_alt" text,
	"source_url" text,
	"source_updated_on" date,
	"draft" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_spaces" (
	"id" serial PRIMARY KEY,
	"booking_id" integer NOT NULL,
	"space_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"notes" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_ends_after_starts" CHECK ("ends_at" > "starts_at")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"body" text NOT NULL,
	"template" text DEFAULT 'standard' NOT NULL,
	"description" text,
	"hero_image_path" text,
	"hero_image_alt" text,
	"source_url" text,
	"draft" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY,
	"amount_pence" integer NOT NULL,
	"booking_id" integer NOT NULL,
	"currency" text DEFAULT 'GBP' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"provider" text,
	"provider_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"bookable" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"capacity" integer,
	"description" text,
	"dimensions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" text DEFAULT '' NOT NULL,
	"password_hash" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "activities_slug_key" ON "activities" ("slug");--> statement-breakpoint
CREATE INDEX "activities_draft_position_idx" ON "activities" ("draft","position");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_spaces_booking_id_space_id_key" ON "booking_spaces" ("booking_id","space_id");--> statement-breakpoint
CREATE INDEX "booking_spaces_booking_id_idx" ON "booking_spaces" ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_spaces_space_id_idx" ON "booking_spaces" ("space_id");--> statement-breakpoint
CREATE INDEX "bookings_starts_at_ends_at_idx" ON "bookings" ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" ("status");--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "bookings" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_slug_key" ON "pages" ("slug");--> statement-breakpoint
CREATE INDEX "pages_draft_position_idx" ON "pages" ("draft","position");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments" ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "spaces_slug_key" ON "spaces" ("slug");--> statement-breakpoint
CREATE INDEX "spaces_bookable_position_idx" ON "spaces" ("bookable","position");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "users_approved_at_idx" ON "users" ("approved_at");--> statement-breakpoint
ALTER TABLE "booking_spaces" ADD CONSTRAINT "booking_spaces_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id");--> statement-breakpoint
ALTER TABLE "booking_spaces" ADD CONSTRAINT "booking_spaces_space_id_spaces_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id");