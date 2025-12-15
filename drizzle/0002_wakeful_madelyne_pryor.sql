CREATE TABLE "productStocks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "productStocks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer NOT NULL,
	"storeId" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"minStock" integer DEFAULT 0,
	"maxStock" integer,
	"location" varchar(100),
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "productStocks_productId_storeId_unique" UNIQUE("productId","storeId")
);
