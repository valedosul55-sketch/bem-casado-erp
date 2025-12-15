CREATE TABLE "alertLogs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alertLogs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"storeId" integer,
	"productId" integer,
	"type" "alert_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"recipientEmail" varchar(320),
	"status" varchar(50) DEFAULT 'sent',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
