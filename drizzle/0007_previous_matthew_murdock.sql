CREATE TABLE "stockReservations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stockReservations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer NOT NULL,
	"storeId" integer NOT NULL,
	"orderId" integer,
	"quantity" integer NOT NULL,
	"status" "reservation_status" DEFAULT 'active' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"completedAt" timestamp,
	"cancelledAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
