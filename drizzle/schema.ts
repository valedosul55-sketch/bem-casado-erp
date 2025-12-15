import { integer, pgEnum, pgTable, text, timestamp, varchar, unique } from "drizzle-orm/pg-core";

// Enums para PostgreSQL
const roleEnum = pgEnum("role", ["user", "admin"]);
const paymentMethodEnum = pgEnum("payment_method", ["credit_card", "debit_card", "pix", "food_voucher"]);
const paymentStatusEnum = pgEnum("payment_status", ["pending", "processing", "approved", "failed", "cancelled"]);
const movementTypeEnum = pgEnum("movement_type", ["entry", "exit", "adjustment", "sale", "sale_cancellation"]);
const reservationStatusEnum = pgEnum("reservation_status", ["active", "completed", "cancelled", "expired"]);
const nfceStatusEnum = pgEnum("nfce_status", ["processando", "autorizada", "cancelada", "denegada", "erro"]);
const alertTypeEnum = pgEnum("alert_type", ["low_stock", "system_error", "other"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de Lojas (Filiais)
export const stores = pgTable("stores", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(), // Nome da loja (ex: Matriz, Filial SP, Filial RJ)
  cnpj: varchar("cnpj", { length: 14 }).notNull().unique(), // CNPJ da loja (apenas números)
  ie: varchar("ie", { length: 20 }), // Inscrição Estadual
  address: text("address"), // Endereço completo
  city: varchar("city", { length: 100 }), // Cidade
  state: varchar("state", { length: 2 }), // UF (SP, RJ, etc)
  zipCode: varchar("zipCode", { length: 8 }), // CEP
  phone: varchar("phone", { length: 20 }), // Telefone
  email: varchar("email", { length: 320 }), // Email
  notificationEmail: varchar("notificationEmail", { length: 320 }), // Email para notificações (estoque baixo, etc)
  stockValuationMethod: varchar("stockValuationMethod", { length: 20 }).default("fifo").notNull(), // Método de valoração: 'fifo' ou 'average_cost'
  taxRegime: varchar("taxRegime", { length: 20 }).default("presumido").notNull(), // Regime tributário: 'simples', 'presumido', 'real', 'arbitrado'
  active: integer("active").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

// Tabelas de pedidos
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId"),
  storeId: integer("storeId"), // ID da loja onde o pedido foi feito
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  totalAmount: integer("totalAmount").notNull(), // em centavos
  discountAmount: integer("discountAmount").default(0),
  finalAmount: integer("finalAmount").notNull(), // em centavos
  couponCode: varchar("couponCode", { length: 50 }),
  paymentMethod: paymentMethodEnum("paymentMethod"),
  paymentStatus: paymentStatusEnum("paymentStatus").default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const orderItems = pgTable("orderItems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("orderId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productBrand: varchar("productBrand", { length: 255 }),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unitPrice").notNull(), // em centavos
  totalPrice: integer("totalPrice").notNull(), // em centavos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Tabela de produtos
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  description: text("description"),
  price: integer("price").notNull(), // em centavos (preço de venda)
  averageCost: integer("averageCost").default(0).notNull(), // Custo médio ponderado em centavos
  stock: integer("stock").default(0).notNull(), // Mantido para compatibilidade, mas idealmente usar productStocks
  unit: varchar("unit", { length: 20 }).default("un"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  category: varchar("category", { length: 100 }),
  ean13: varchar("ean13", { length: 13 }), // Código de barras EAN-13
  ncm: varchar("ncm", { length: 8 }), // Código NCM (Nomenclatura Comum do Mercosul) para NF-e
  cest: varchar("cest", { length: 7 }), // Código CEST (Código Especificador da Substituição Tributária)
  active: integer("active").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Tabela de estoque por loja (Novo)
export const productStocks = pgTable("productStocks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull(),
  storeId: integer("storeId").notNull(),
  quantity: integer("quantity").default(0).notNull(),
  minStock: integer("minStock").default(0), // Estoque mínimo para alerta
  maxStock: integer("maxStock"), // Estoque máximo ideal
  location: varchar("location", { length: 100 }), // Localização na loja (corredor, prateleira)
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.productId, t.storeId), // Garante um registro único por produto/loja
}));

export type ProductStock = typeof productStocks.$inferSelect;
export type InsertProductStock = typeof productStocks.$inferInsert;

// Tabela de lotes de estoque (PEPS/FIFO)
export const stockBatches = pgTable("stockBatches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull(),
  storeId: integer("storeId"), // ID da loja onde o lote está armazenado
  batchNumber: varchar("batchNumber", { length: 50 }).notNull(), // Número do lote (ex: BC-2024-11-001)
  quantity: integer("quantity").notNull(), // Quantidade disponível no lote
  initialQuantity: integer("initialQuantity").notNull(), // Quantidade inicial do lote
  unitCost: integer("unitCost").notNull(), // Custo unitário em centavos
  entryDate: timestamp("entryDate").notNull(), // Data de entrada do lote
  expiryDate: timestamp("expiryDate"), // Data de validade
  supplier: varchar("supplier", { length: 255 }), // Fornecedor
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StockBatch = typeof stockBatches.$inferSelect;
export type InsertStockBatch = typeof stockBatches.$inferInsert;

// Tabela de movimentações de estoque
export const stockMovements = pgTable("stockMovements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull(),
  storeId: integer("storeId"), // ID da loja onde ocorreu a movimentação
  batchId: integer("batchId"), // Lote relacionado (se aplicável)
  movementType: movementTypeEnum("movementType").notNull(),
  quantity: integer("quantity").notNull(), // Quantidade (positivo para entrada, negativo para saída)
  unitCost: integer("unitCost"), // Custo unitário em centavos (para entradas)
  reason: varchar("reason", { length: 255 }), // Motivo (venda, ajuste, perda, etc)
  orderId: integer("orderId"), // ID do pedido (se for venda)
  userId: integer("userId"), // Usuário responsável
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

// Tabela de Logs de Alertas (Novo)
export const alertLogs = pgTable("alertLogs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer("storeId"), // Loja relacionada
  productId: integer("productId"), // Produto relacionado (se houver)
  type: alertTypeEnum("type").notNull(), // Tipo de alerta
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }), // Quem recebeu o email
  status: varchar("status", { length: 50 }).default("sent"), // sent, failed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertLog = typeof alertLogs.$inferSelect;
export type InsertAlertLog = typeof alertLogs.$inferInsert;

// Tabela de NFC-e (Notas Fiscais de Consumidor Eletrônica)
export const nfce = pgTable("nfce", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer("storeId"), // ID da loja emitente
  referencia: varchar("referencia", { length: 100 }).notNull().unique(), // Referência única da nota
  numero: varchar("numero", { length: 20 }), // Número da nota fiscal
  serie: varchar("serie", { length: 10 }), // Série da nota
  chaveAcesso: varchar("chaveAcesso", { length: 44 }), // Chave de acesso de 44 dígitos
  status: nfceStatusEnum("status").default("processando").notNull(),
  statusSefaz: varchar("statusSefaz", { length: 10 }), // Código de status da SEFAZ
  mensagemSefaz: text("mensagemSefaz"), // Mensagem de retorno da SEFAZ
  urlDanfe: varchar("urlDanfe", { length: 500 }), // URL do DANFE em PDF
  urlDanfeSimplificado: varchar("urlDanfeSimplificado", { length: 500 }), // URL do DANFE simplificado
  urlDanfeEtiqueta: varchar("urlDanfeEtiqueta", { length: 500 }), // URL do DANFE etiqueta
  qrcodeUrl: varchar("qrcodeUrl", { length: 500 }), // URL do QR Code
  
  // Dados do cliente
  clienteNome: varchar("clienteNome", { length: 255 }).default("CONSUMIDOR FINAL"),
  clienteCpfCnpj: varchar("clienteCpfCnpj", { length: 18 }),
  clienteEmail: varchar("clienteEmail", { length: 320 }),
  clienteTelefone: varchar("clienteTelefone", { length: 20 }),
  
  // Valores
  valorTotal: integer("valorTotal").notNull(), // em centavos
  valorProdutos: integer("valorProdutos").notNull(), // em centavos
  valorDesconto: integer("valorDesconto").default(0),
  valorIcms: integer("valorIcms").default(0), // em centavos
  
  // Produtos (JSON)
  itens: text("itens").notNull(), // JSON com array de produtos
  
  // Dados de cancelamento
  canceladaEm: timestamp("canceladaEm"),
  motivoCancelamento: text("motivoCancelamento"),
  protocoloCancelamento: varchar("protocoloCancelamento", { length: 50 }),
  
  // Envio de DANFE
  danfeEnviadoWhatsapp: integer("danfeEnviadoWhatsapp").default(0), // 1 = enviado, 0 = não enviado
  danfeEnviadoEmail: integer("danfeEnviadoEmail").default(0), // 1 = enviado, 0 = não enviado
  
  // Timestamps
  emitidaEm: timestamp("emitidaEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type NFCe = typeof nfce.$inferSelect;
export type InsertNFCe = typeof nfce.$inferInsert;
/**
 * Sistema de Monitoramento de Legislação e Notícias
 */

// Enums para o sistema de monitoramento
const monitorTypeEnum = pgEnum("monitor_type", ["scraper", "rss", "api"]);
const monitorStatusEnum = pgEnum("monitor_status", ["success", "error", "partial"]);

// Categorias de monitoramento
export const monitorCategories = pgTable("monitor_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MonitorCategory = typeof monitorCategories.$inferSelect;
export type InsertMonitorCategory = typeof monitorCategories.$inferInsert;

// Fontes de monitoramento
export const monitorSources = pgTable("monitor_sources", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 200 }).notNull(),
  url: text("url").notNull(),
  type: monitorTypeEnum("type").notNull(),
  categoryId: integer("categoryId").notNull(),
  isActive: integer("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  scrapingConfig: text("scrapingConfig"), // JSON com configuração de scraping
  lastScrapedAt: timestamp("lastScrapedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MonitorSource = typeof monitorSources.$inferSelect;
export type InsertMonitorSource = typeof monitorSources.$inferInsert;

// Atualizações coletadas
export const monitorUpdates = pgTable("monitor_updates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sourceId: integer("sourceId").notNull(),
  categoryId: integer("categoryId").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"), // Resumo gerado por IA
  url: text("url"),
  publishedAt: timestamp("publishedAt"),
  relevanceScore: integer("relevanceScore"), // 0-100, calculado por IA
  isRelevant: integer("isRelevant").default(1), // 1 = relevante, 0 = não relevante
  isRead: integer("isRead").default(0).notNull(), // 1 = lido, 0 = não lido
  tags: text("tags"), // JSON array de tags
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MonitorUpdate = typeof monitorUpdates.$inferSelect;
export type InsertMonitorUpdate = typeof monitorUpdates.$inferInsert;

// Histórico de execução do scraping
export const monitorScrapingLogs = pgTable("monitor_scraping_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sourceId: integer("sourceId").notNull(),
  status: monitorStatusEnum("status").notNull(),
  itemsFound: integer("itemsFound").default(0).notNull(),
  itemsNew: integer("itemsNew").default(0).notNull(),
  errorMessage: text("errorMessage"),
  executionTime: integer("executionTime"), // tempo em ms
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MonitorScrapingLog = typeof monitorScrapingLogs.$inferSelect;
export type InsertMonitorScrapingLog = typeof monitorScrapingLogs.$inferInsert;

// Configurações de notificação
export const monitorNotificationSettings = pgTable("monitor_notification_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  categoryId: integer("categoryId").notNull(),
  emailEnabled: integer("emailEnabled").default(1).notNull(),
  minRelevanceScore: integer("minRelevanceScore").default(50).notNull(),
  scheduleTime: varchar("scheduleTime", { length: 5 }).default("08:00").notNull(), // HH:MM
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MonitorNotificationSetting = typeof monitorNotificationSettings.$inferSelect;
export type InsertMonitorNotificationSetting = typeof monitorNotificationSettings.$inferInsert;

// Tabela de reservas de estoque (para vendas em andamento)
export const stockReservations = pgTable("stockReservations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull(),
  storeId: integer("storeId").notNull(),
  orderId: integer("orderId"), // ID do pedido (quando criado)
  quantity: integer("quantity").notNull(), // Quantidade reservada
  status: reservationStatusEnum("status").default("active").notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // Tempo de expiração (15 minutos)
  completedAt: timestamp("completedAt"), // Quando foi completada (venda confirmada)
  cancelledAt: timestamp("cancelledAt"), // Quando foi cancelada
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StockReservation = typeof stockReservations.$inferSelect;
export type InsertStockReservation = typeof stockReservations.$inferInsert;

/**
 * Módulo de Cadastro Completo de Produtos
 */

// Tabela de Fornecedores
export const suppliers = pgTable("suppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  tradeName: varchar("tradeName", { length: 255 }), // Nome fantasia
  cnpj: varchar("cnpj", { length: 14 }).unique(), // CNPJ (apenas números)
  cpf: varchar("cpf", { length: 11 }).unique(), // CPF (para pessoa física)
  ie: varchar("ie", { length: 20 }), // Inscrição Estadual
  im: varchar("im", { length: 20 }), // Inscrição Municipal
  
  // Contato
  contactName: varchar("contactName", { length: 255 }), // Nome do contato
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  
  // Endereço
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 8 }),
  country: varchar("country", { length: 2 }).default("BR"),
  
  // Informações comerciais
  paymentTerms: varchar("paymentTerms", { length: 255 }), // Condições de pagamento
  deliveryTime: integer("deliveryTime"), // Prazo de entrega em dias
  minOrderValue: integer("minOrderValue"), // Valor mínimo de pedido em centavos
  
  // Classificação
  rating: integer("rating"), // Avaliação (1-5)
  isCertified: integer("isCertified").default(0), // 1 = certificado, 0 = não certificado
  certifications: text("certifications"), // JSON com certificações
  
  // Status
  active: integer("active").default(1).notNull(),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// Tabela de Informações Fiscais do Produto
export const productTaxInfo = pgTable("productTaxInfo", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull().unique(), // Um produto tem apenas uma config fiscal
  
  // NCM e CEST
  ncm: varchar("ncm", { length: 8 }).notNull(), // Código NCM (8 dígitos)
  cest: varchar("cest", { length: 7 }), // Código CEST (7 dígitos)
  
  // Origem e CFOP
  origem: varchar("origem", { length: 1 }).default("0").notNull(), // 0=Nacional, 1=Estrangeira, etc
  cfopVendaDentroEstado: varchar("cfopVendaDentroEstado", { length: 4 }).default("5102"), // CFOP venda dentro do estado
  cfopVendaForaEstado: varchar("cfopVendaForaEstado", { length: 4 }).default("6102"), // CFOP venda fora do estado
  cfopCompra: varchar("cfopCompra", { length: 4 }).default("1102"), // CFOP compra
  
  // ICMS
  cstIcms: varchar("cstIcms", { length: 3 }), // CST/CSOSN do ICMS
  aliquotaIcms: integer("aliquotaIcms").default(0), // Alíquota ICMS em centésimos (ex: 1800 = 18%)
  baseCalculoIcms: integer("baseCalculoIcms").default(10000), // Base de cálculo ICMS em centésimos (ex: 10000 = 100%)
  icmsSt: integer("icmsSt").default(0), // 1 = tem ST, 0 = não tem
  mva: integer("mva").default(0), // MVA em centésimos (ex: 4000 = 40%)
  
  // PIS
  cstPis: varchar("cstPis", { length: 2 }), // CST do PIS
  aliquotaPis: integer("aliquotaPis").default(165), // Alíquota PIS em centésimos (ex: 165 = 1,65%)
  baseCalculoPis: integer("baseCalculoPis").default(10000), // Base de cálculo PIS em centésimos
  
  // COFINS
  cstCofins: varchar("cstCofins", { length: 2 }), // CST do COFINS
  aliquotaCofins: integer("aliquotaCofins").default(760), // Alíquota COFINS em centésimos (ex: 760 = 7,60%)
  baseCalculoCofins: integer("baseCalculoCofins").default(10000), // Base de cálculo COFINS em centésimos
  
  // IPI
  cstIpi: varchar("cstIpi", { length: 2 }), // CST do IPI
  aliquotaIpi: integer("aliquotaIpi").default(0), // Alíquota IPI em centésimos
  codigoEnquadramentoIpi: varchar("codigoEnquadramentoIpi", { length: 3 }), // Código de enquadramento IPI
  
  // FCP (Fundo de Combate à Pobreza)
  aliquotaFcp: integer("aliquotaFcp").default(0), // Alíquota FCP em centésimos
  
  // Observações
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductTaxInfo = typeof productTaxInfo.$inferSelect;
export type InsertProductTaxInfo = typeof productTaxInfo.$inferInsert;

// Tabela de Informações Comerciais do Produto
export const productCommercialInfo = pgTable("productCommercialInfo", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull().unique(),
  
  // Preços
  precoCusto: integer("precoCusto").default(0).notNull(), // Preço de custo em centavos
  precoVenda: integer("precoVenda").default(0).notNull(), // Preço de venda em centavos
  precoTabela: integer("precoTabela"), // Preço de tabela (antes do desconto) em centavos
  
  // Margens e descontos
  margemLucro: integer("margemLucro").default(0), // Margem de lucro em centésimos (ex: 3000 = 30%)
  descontoMaximo: integer("descontoMaximo").default(0), // Desconto máximo permitido em centésimos
  
  // Comissões
  comissaoVenda: integer("comissaoVenda").default(0), // Comissão de venda em centésimos
  comissaoCompra: integer("comissaoCompra").default(0), // Comissão de compra em centésimos
  
  // Markup
  markup: integer("markup").default(0), // Markup em centésimos (ex: 5000 = 50%)
  
  // Histórico de preços (JSON)
  priceHistory: text("priceHistory"), // JSON com histórico de alterações de preço
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductCommercialInfo = typeof productCommercialInfo.$inferSelect;
export type InsertProductCommercialInfo = typeof productCommercialInfo.$inferInsert;

// Tabela de Informações de Estoque do Produto
export const productStockInfo = pgTable("productStockInfo", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull().unique(),
  
  // Controles de estoque
  estoqueMinimo: integer("estoqueMinimo").default(0), // Estoque mínimo
  estoqueMaximo: integer("estoqueMaximo"), // Estoque máximo
  pontoPedido: integer("pontoPedido"), // Ponto de pedido (quando fazer nova compra)
  
  // Controle de lote e validade
  controlaLote: integer("controlaLote").default(1).notNull(), // 1 = controla, 0 = não controla
  controlaValidade: integer("controlaValidade").default(1).notNull(), // 1 = controla, 0 = não controla
  prazoValidadePadrao: integer("prazoValidadePadrao"), // Prazo de validade padrão em dias
  
  // Localização
  localizacaoPadrao: varchar("localizacaoPadrao", { length: 100 }), // Localização padrão no estoque
  
  // Tipo de produto
  tipoProduto: varchar("tipoProduto", { length: 20 }).default("acabado").notNull(), // acabado, materia_prima, insumo, embalagem
  
  // Produção
  tempoProdução: integer("tempoProdução"), // Tempo de produção em minutos
  rendimento: integer("rendimento"), // Rendimento em centésimos (ex: 9500 = 95%)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductStockInfo = typeof productStockInfo.$inferSelect;
export type InsertProductStockInfo = typeof productStockInfo.$inferInsert;

// Tabela de Fornecedores do Produto (N:N)
export const productSuppliers = pgTable("productSuppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull(),
  supplierId: integer("supplierId").notNull(),
  
  // Informações específicas deste fornecedor para este produto
  codigoFornecedor: varchar("codigoFornecedor", { length: 50 }), // Código do produto no fornecedor
  precoCusto: integer("precoCusto"), // Preço de custo deste fornecedor em centavos
  prazoEntrega: integer("prazoEntrega"), // Prazo de entrega em dias
  loteMinimoCompra: integer("loteMinimoCompra"), // Lote mínimo de compra
  
  // Prioridade
  isPrincipal: integer("isPrincipal").default(0), // 1 = fornecedor principal, 0 = secundário
  prioridade: integer("prioridade").default(1), // Ordem de prioridade (1 = maior)
  
  // Status
  active: integer("active").default(1).notNull(),
  
  // Última compra
  ultimaCompra: timestamp("ultimaCompra"),
  ultimoPreco: integer("ultimoPreco"), // Último preço pago em centavos
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.productId, t.supplierId), // Garante um registro único por produto/fornecedor
}));

export type ProductSupplier = typeof productSuppliers.$inferSelect;
export type InsertProductSupplier = typeof productSuppliers.$inferInsert;
