CREATE TYPE "public"."financial_category_type" AS ENUM('receita', 'despesa');--> statement-breakpoint
CREATE TYPE "public"."financial_status" AS ENUM('pendente', 'pago', 'vencido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."financial_type" AS ENUM('pagar', 'receber');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('orcamento', 'confirmado', 'producao', 'pronto', 'entregue', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(10),
	"dig" varchar(10),
	"ccm" varchar(20),
	"cnpj" varchar(20),
	"nome" varchar(255) NOT NULL,
	"endereco" text,
	"cidade" varchar(100),
	"estado" varchar(2),
	"cep" varchar(15),
	"inscricaoEstadual" varchar(20),
	"versao" varchar(20),
	"numeroTerminais" integer,
	"usaDigHistorico" boolean DEFAULT false,
	"usaDigCCustos" boolean DEFAULT false,
	"usaDigConta" boolean DEFAULT false,
	"codigoEmpresaCliente" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(320),
	"cpfCnpj" varchar(20),
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"zipCode" varchar(10),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financialAccounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "financial_type" NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"dueDate" timestamp NOT NULL,
	"paidDate" timestamp,
	"status" "financial_status" DEFAULT 'pendente' NOT NULL,
	"category" varchar(100),
	"orderId" integer,
	"customerId" integer,
	"notes" text,
	"userId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financialCategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "financial_category_type" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderNumber" varchar(20) NOT NULL,
	"customerId" integer,
	"status" "order_status" DEFAULT 'orcamento' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"deliveryDate" timestamp,
	"deliveryAddress" text,
	"notes" text,
	"userId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"categoryId" integer,
	"price" numeric(10, 2) NOT NULL,
	"cost" numeric(10, 2),
	"stockQuantity" integer DEFAULT 0 NOT NULL,
	"minStock" integer DEFAULT 0,
	"unit" varchar(20) DEFAULT 'un',
	"imageUrl" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stockMovements" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"type" "stock_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"reason" varchar(255),
	"notes" text,
	"userId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"passwordHash" text,
	"username" varchar(100),
	"empresa" varchar(100),
	"filial" varchar(100),
	"departamento" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
