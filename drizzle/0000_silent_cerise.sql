CREATE TABLE "nfce" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "nfce_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"referencia" varchar(100) NOT NULL,
	"numero" varchar(20),
	"serie" varchar(10),
	"chaveAcesso" varchar(44),
	"status" "nfce_status" DEFAULT 'processando' NOT NULL,
	"statusSefaz" varchar(10),
	"mensagemSefaz" text,
	"urlDanfe" varchar(500),
	"urlDanfeSimplificado" varchar(500),
	"urlDanfeEtiqueta" varchar(500),
	"qrcodeUrl" varchar(500),
	"clienteNome" varchar(255) DEFAULT 'CONSUMIDOR FINAL',
	"clienteCpfCnpj" varchar(18),
	"clienteEmail" varchar(320),
	"clienteTelefone" varchar(20),
	"valorTotal" integer NOT NULL,
	"valorProdutos" integer NOT NULL,
	"valorDesconto" integer DEFAULT 0,
	"valorIcms" integer DEFAULT 0,
	"itens" text NOT NULL,
	"canceladaEm" timestamp,
	"motivoCancelamento" text,
	"protocoloCancelamento" varchar(50),
	"danfeEnviadoWhatsapp" integer DEFAULT 0,
	"danfeEnviadoEmail" integer DEFAULT 0,
	"emitidaEm" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nfce_referencia_unique" UNIQUE("referencia")
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orderItems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"productName" varchar(255) NOT NULL,
	"productBrand" varchar(255),
	"quantity" integer NOT NULL,
	"unitPrice" integer NOT NULL,
	"totalPrice" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"customerName" varchar(255) NOT NULL,
	"customerEmail" varchar(320),
	"customerPhone" varchar(20) NOT NULL,
	"totalAmount" integer NOT NULL,
	"discountAmount" integer DEFAULT 0,
	"finalAmount" integer NOT NULL,
	"couponCode" varchar(50),
	"paymentMethod" "payment_method",
	"paymentStatus" "payment_status" DEFAULT 'pending' NOT NULL,
	"transactionId" varchar(255),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"brand" varchar(255),
	"description" text,
	"price" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"unit" varchar(20) DEFAULT 'un',
	"imageUrl" varchar(500),
	"category" varchar(100),
	"ean13" varchar(13),
	"ncm" varchar(8),
	"cest" varchar(7),
	"active" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stockBatches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stockBatches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer NOT NULL,
	"batchNumber" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"initialQuantity" integer NOT NULL,
	"unitCost" integer NOT NULL,
	"entryDate" timestamp NOT NULL,
	"expiryDate" timestamp,
	"supplier" varchar(255),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stockMovements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stockMovements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer NOT NULL,
	"batchId" integer,
	"movementType" "movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"unitCost" integer,
	"reason" varchar(255),
	"orderId" integer,
	"userId" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
