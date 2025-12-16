ALTER TYPE "public"."role" ADD VALUE 'gerente';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'vendedor';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'operador';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetToken" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" timestamp;