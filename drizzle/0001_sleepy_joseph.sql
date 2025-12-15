CREATE TABLE "stores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"cnpj" varchar(14) NOT NULL,
	"ie" varchar(20),
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"zipCode" varchar(8),
	"phone" varchar(20),
	"email" varchar(320),
	"active" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stores_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
ALTER TABLE "nfce" ADD COLUMN "storeId" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "storeId" integer;--> statement-breakpoint
ALTER TABLE "stockBatches" ADD COLUMN "storeId" integer;--> statement-breakpoint
ALTER TABLE "stockMovements" ADD COLUMN "storeId" integer;