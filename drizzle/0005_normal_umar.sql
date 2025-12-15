CREATE TABLE "monitor_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monitor_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "monitor_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "monitor_notification_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monitor_notification_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"emailEnabled" integer DEFAULT 1 NOT NULL,
	"minRelevanceScore" integer DEFAULT 50 NOT NULL,
	"scheduleTime" varchar(5) DEFAULT '08:00' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitor_scraping_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monitor_scraping_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sourceId" integer NOT NULL,
	"status" "monitor_status" NOT NULL,
	"itemsFound" integer DEFAULT 0 NOT NULL,
	"itemsNew" integer DEFAULT 0 NOT NULL,
	"errorMessage" text,
	"executionTime" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitor_sources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monitor_sources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(200) NOT NULL,
	"url" text NOT NULL,
	"type" "monitor_type" NOT NULL,
	"categoryId" integer NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"scrapingConfig" text,
	"lastScrapedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitor_updates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monitor_updates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sourceId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"url" text,
	"publishedAt" timestamp,
	"relevanceScore" integer,
	"isRelevant" integer DEFAULT 1,
	"isRead" integer DEFAULT 0 NOT NULL,
	"tags" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
