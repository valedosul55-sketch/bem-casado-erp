import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createOrder, getOrderById, updateOrderPaymentStatus, getAllProducts, getActiveProducts, getProductById, createProduct, updateProduct, deleteProduct, db } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { processPOSSale } from "./pos";
import { processSafraPayPayment } from "./safrapay";
import { generateBemCasadoPix } from "./pix";
import { sendPixConfirmationEmail } from "./email";
import { nfceRouter } from "./nfce";
import { dashboardRouter } from "./dashboard";
import { subscribeToNewsletter } from "./mailchimp";
import { stockRouter } from "./stockRouter";
import { stockMovementsRouter } from "./stockMovementsRouter";
import { nfeRouter } from "./nfeRouter";
import { adjustmentRouter } from './adjustmentRouter';
import { salesRouter } from './salesRouter';
import { reportsRouter } from './reportsRouter';
import { publicApiRouter } from './publicApiRouter';
import { batchRouter } from './batchRouter';
import { storesRouter } from './storesRouter';
import { productsRouter } from './productsRouter';
import { suppliersRouter } from './suppliersRouter';
import * as monitorDb from "./monitorDb";
import { runManualScraping, runNewsAgentManually } from "./scheduler";
import { sendDailyDigest } from "./emailService";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  stock: stockRouter,
  stockMovements: stockMovementsRouter,
  nfeImport: nfeRouter,
  adjustments: adjustmentRouter,
  sales: salesRouter,
  reports: reportsRouter,
  publicApi: publicApiRouter,
  batches: batchRouter,
  stores: storesRouter,
  products: productsRouter,
  suppliers: suppliersRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email().optional(),
          customerPhone: z.string().min(10),
          items: z.array(
            z.object({
              productName: z.string(),
              productBrand: z.string().optional(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().int().positive(),
            })
          ),
          paymentMethod: z.enum(["credit_card", "debit_card", "pix", "food_voucher"]),
          notes: z.string().optional(),
          couponCode: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Calcular total
        const totalAmount = input.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );

        // TODO: Aplicar desconto de cupom se houver
        const discountAmount = 0;
        const finalAmount = totalAmount - discountAmount;

        // Criar pedido no banco
        const orderId = await createOrder(
          {
            userId: ctx.user?.id,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            totalAmount,
            discountAmount,
            finalAmount,
            couponCode: input.couponCode,
            paymentMethod: input.paymentMethod,
            paymentStatus: "pending",
            notes: input.notes,
          },
          input.items.map((item) => ({
            productName: item.productName,
            productBrand: item.productBrand,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          }))
        );

        return {
          orderId,
          totalAmount: finalAmount,
        };
      }),

    processPayment: publicProcedure
      .input(
        z.object({
          orderId: z.number().int().positive(),
          paymentMethod: z.enum(["credit_card", "debit_card", "pix", "food_voucher"]),
          // Dados do cartão (opcionais, dependem do método)
          cardNumber: z.string().optional(),
          cardHolderName: z.string().optional(),
          cardExpiryMonth: z.string().optional(),
          cardExpiryYear: z.string().optional(),
          cardCvv: z.string().optional(),
          // Dados do cliente para NFC-e
          customerEmail: z.string().email().optional(),
          customerCpfCnpj: z.string().optional(),
          inscricaoEstadual: z.string().optional(),
          razaoSocial: z.string().optional(),
          uf: z.string().optional(),
          storeId: z.number().int().optional(), // ID da loja para emissão fiscal
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Buscar pedido
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new Error("Pedido não encontrado");
        }

        // Atualizar status para processando
        await updateOrderPaymentStatus(input.orderId, "processing");

        // Processar pagamento via SafraPay
        const paymentResult = await processSafraPayPayment({
          amount: order.finalAmount,
          paymentMethod: input.paymentMethod,
          customerName: order.customerName,
          customerEmail: order.customerEmail || undefined,
          customerPhone: order.customerPhone,
          orderId: input.orderId,
          description: `Pedido #${input.orderId} - Bem Casado`,
          cardNumber: input.cardNumber,
          cardHolderName: input.cardHolderName,
          cardExpiryMonth: input.cardExpiryMonth,
          cardExpiryYear: input.cardExpiryYear,
          cardCvv: input.cardCvv,
        });

        // Atualizar status do pedido
        await updateOrderPaymentStatus(
          input.orderId,
          paymentResult.status === "approved" ? "approved" : "failed",
          paymentResult.transactionId
        );

        // Se pagamento aprovado, emite NFC-e automaticamente e atualiza estoque
        let nfceData = null;
        if (paymentResult.status === "approved") {
          // Atualizar estoque se storeId estiver presente
          if (input.storeId) {
            try {
              const { updateStock } = await import('./stock');
              for (const item of order.items) {
                // TODO: Mapear productName para productId corretamente
                // Por enquanto, vamos assumir que precisamos buscar o produto pelo nome
                // Isso será melhorado quando o orderItems tiver productId
                const { getProductByName } = await import('./db');
                const product = await getProductByName(item.productName);
                
                if (product) {
                  await updateStock({
                    productId: product.id,
                    storeId: input.storeId!,
                    quantity: -item.quantity, // Deduzir estoque
                    reason: 'sale',
                    orderId: input.orderId,
                    userId: ctx.user?.id,
                  });
                }
              }
            } catch (stockError) {
              console.error('[ProcessPayment] Erro ao atualizar estoque:', stockError);
              // Não falha o pagamento se o estoque falhar, mas loga o erro
            }
          }

          try {
            const { emitirNFCe, enviarDanfePorEmail } = await import('./focus-nfe');
            
            // Monta itens da nota
            const items = order.items.map(item => ({
              codigo: `PROD_${item.productName.substring(0, 10).toUpperCase()}`,
              descricao: item.productName,
              quantidade: item.quantity,
              preco: item.unitPrice / 100, // Converte centavos para reais
              ncm: '10063021', // NCM padrão (arroz) - ajustar conforme produto
            }));

            // Usa Razão Social se informado (CNPJ), senão usa customerName
            const nomeDestinatario = input.razaoSocial || order.customerName;
            
            const response = await emitirNFCe(
              items,
              order.finalAmount / 100, // Converte centavos para reais
              input.customerCpfCnpj,
              nomeDestinatario,
              input.inscricaoEstadual,
              input.uf,
              undefined, // formaPagamento padrão
              undefined, // endereco
              undefined, // numeroNota
              input.storeId // Passa o ID da loja selecionada
            );

            if (response.status === 'autorizado') {
              nfceData = {
                numero: response.numero,
                serie: response.serie,
                chaveAcesso: response.chave_nfe,
                urlDanfe: response.caminho_danfe,
                urlXml: response.caminho_xml_nota_fiscal,
                qrcodeUrl: response.qrcode_url,
              };

              // Envia DANFE por email se informado
              if (input.customerEmail && response.ref) {
                try {
                  await enviarDanfePorEmail(response.ref, [input.customerEmail]);
                  console.log('[ProcessPayment] DANFE enviado por email para:', input.customerEmail);
                } catch (emailError) {
                  console.error('[ProcessPayment] Erro ao enviar email:', emailError);
                }
              }
            }
          } catch (nfceError) {
            console.error('[ProcessPayment] Erro ao emitir NFC-e:', nfceError);
            // Não falha o pagamento se a NFC-e falhar
          }
        }

        return {
          success: paymentResult.success,
          status: paymentResult.status,
          transactionId: paymentResult.transactionId,
          message: paymentResult.message,
          paymentUrl: paymentResult.paymentUrl,
          nfce: nfceData,
        };
      }),

    generatePix: publicProcedure
      .input(z.object({ 
        orderId: z.number().int().positive(),
        amount: z.number().positive(),
        customerEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        // Gera referência PIX com data/hora
        const { generatePixReference } = await import('./id-generator');
        const pixReference = generatePixReference();
        
        const pixPayload = generateBemCasadoPix(
          input.amount,
          pixReference
        );
        
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`;
        
        // Enviar email de confirmação se houver email
        if (input.customerEmail) {
          try {
            const order = await getOrderById(input.orderId);
            if (order) {
              await sendPixConfirmationEmail({
                to: input.customerEmail,
                customerName: order.customerName,
                orderId: order.id,
                totalAmount: order.finalAmount,
                items: order.items.map(item => ({
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                })),
                pixCode: pixPayload,
                qrCodeUrl,
                couponCode: order.couponCode || undefined,
                discountAmount: order.discountAmount || 0,
              });
              console.log('[PIX] Email de confirmação enviado para:', input.customerEmail);
            }
          } catch (emailError) {
            console.error('[PIX] Erro ao enviar email:', emailError);
            // Não falhar a geração do PIX se o email falhar
          }
        }
        
        return {
          pixPayload,
          qrCodeUrl
        };
      }),

    getById: publicProcedure
      .input(z.object({ orderId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new Error("Pedido não encontrado");
        }
        return order;
      }),

    confirmPayment: publicProcedure
      .input(z.object({ 
        orderId: z.number().int().positive(),
        customerEmail: z.string().email().optional(),
        customerCpfCnpj: z.string().optional(),
        inscricaoEstadual: z.string().optional(),
        razaoSocial: z.string().optional(),
        uf: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Atualiza status do pagamento
        await updateOrderPaymentStatus(input.orderId, "approved");
        
        // Busca dados do pedido para emitir NFC-e
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new Error("Pedido não encontrado");
        }

        // Emite NFC-e automaticamente
        let nfceData = null;
        try {
          const { emitirNFCe, enviarDanfePorEmail } = await import('./focus-nfe');
          
          // Monta itens da nota
          const items = order.items.map(item => ({
            codigo: `PROD_${item.productName.substring(0, 10).toUpperCase()}`,
            descricao: item.productName,
            quantidade: item.quantity,
            preco: item.unitPrice / 100, // Converte centavos para reais
            ncm: '10063021', // NCM padrão (arroz) - ajustar conforme produto
          }));

          // Emite NFC-e
          // Usa Razão Social se informado (CNPJ), senão usa customerName
          const nomeDestinatario = input.razaoSocial || order.customerName;
          
          const response = await emitirNFCe(
            items,
            order.finalAmount / 100, // Converte centavos para reais
            input.customerCpfCnpj,
            nomeDestinatario,
            input.inscricaoEstadual, // inscricao_estadual
            input.uf // uf
          );

          if (response.status === 'autorizado') {
            nfceData = {
              numero: response.numero,
              serie: response.serie,
              chaveAcesso: response.chave_nfe,
              urlDanfe: response.caminho_danfe,
              urlXml: response.caminho_xml_nota_fiscal,
              qrcodeUrl: response.qrcode_url,
            };

            // Envia DANFE por email se informado
            if (input.customerEmail && response.ref) {
              try {
                await enviarDanfePorEmail(response.ref, [input.customerEmail]);
                console.log('[Checkout] DANFE enviado por email para:', input.customerEmail);
              } catch (emailError) {
                console.error('[Checkout] Erro ao enviar email:', emailError);
              }
            }
          }
        } catch (nfceError) {
          console.error('[Checkout] Erro ao emitir NFC-e:', nfceError);
          // Não falha o pagamento se a NFC-e falhar
        }
        
        return { 
          success: true,
          nfce: nfceData
        };
      }),

    // Consultar dados de CNPJ
    consultarCNPJ: publicProcedure
      .input(z.object({ cnpj: z.string().min(14).max(18) }))
      .query(async ({ input }) => {
        const { consultarCNPJ } = await import('./cnpj-lookup');
        
        try {
          const dados = await consultarCNPJ(input.cnpj);
          
          if (!dados) {
            return {
              success: false,
              message: 'CNPJ não encontrado',
            };
          }
          
          return {
            success: true,
            dados: {
              razaoSocial: dados.razaoSocial,
              nomeFantasia: dados.nomeFantasia,
              uf: dados.uf,
              municipio: dados.municipio,
              situacao: dados.situacao,
              inscricaoEstadual: dados.inscricaoEstadual,
            },
          };
        } catch (error) {
          console.error('[Router] Erro ao consultar CNPJ:', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Erro ao consultar CNPJ',
          };
        }
      }),
  }),

  pos: router({
    // Finalizar venda no PDV
    finalizeSale: publicProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              productId: z.number().int().positive(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().int().positive(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const result = await processPOSSale(input.items);
        if (!result.success) {
          throw new Error(result.message);
        }
        return result;
      }),
  }),

  nfce: nfceRouter,
  dashboard: dashboardRouter,

  products: router({
    // Listar todos os produtos (admin)
    list: publicProcedure
      .query(async () => {
        return await getAllProducts();
      }),

    // Listar apenas produtos ativos (público)
    listActive: publicProcedure
      .query(async () => {
        return await getActiveProducts();
      }),

    // Buscar produto por ID
    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new Error("Produto não encontrado");
        }
        return product;
      }),

    // Criar produto (admin)
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          brand: z.string().optional(),
          description: z.string().optional(),
          price: z.number().int().positive(),
          averageCost: z.number().int().min(0).default(0).optional(),
          stock: z.number().int().min(0).default(0),
          unit: z.string().default("un"),
          ean13: z.string().optional(),
          imageUrl: z.string().optional(),
          category: z.string().optional(),
          active: z.number().int().min(0).max(1).default(1),
        })
      )
      .mutation(async ({ input }) => {
        // Validar se já existe produto com mesmo EAN-13
        if (input.ean13) {
          const existingProduct = await db.select().from(products).where(eq(products.ean13, input.ean13)).limit(1);
          if (existingProduct.length > 0) {
            throw new Error(`Produto com código de barras ${input.ean13} já cadastrado: ${existingProduct[0].name}`);
          }
        }
        const productId = await createProduct(input);
        return { id: productId };
      }),

    // Atualizar produto (admin)
    update: publicProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(1).optional(),
          brand: z.string().optional(),
          description: z.string().optional(),
          price: z.number().int().positive().optional(),
          stock: z.number().int().min(0).optional(),
          unit: z.string().optional(),
          ean13: z.string().optional(),
          imageUrl: z.string().optional(),
          category: z.string().optional(),
          active: z.number().int().min(0).max(1).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProduct(id, data);
        return { success: true };
      }),
  }),

  // Sistema de Monitoramento
  monitor: router({
    // Listar todas as atualizações
    getAllUpdates: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return monitorDb.getAllUpdates(input?.limit);
      }),

    // Listar atualizações por categoria
    getUpdatesByCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return monitorDb.getUpdatesByCategory(input.categoryId, input.limit);
      }),

    // Listar atualizações não lidas
    getUnreadUpdates: publicProcedure.query(async () => {
      return monitorDb.getUnreadUpdates();
    }),

    // Listar atualizações recentes
    getRecentUpdates: publicProcedure
      .input(z.object({ days: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return monitorDb.getRecentUpdates(input?.days);
      }),

    // Marcar atualização como lida
    markAsRead: publicProcedure
      .input(z.object({ updateId: z.number() }))
      .mutation(async ({ input }) => {
        await monitorDb.markUpdateAsRead(input.updateId);
        return { success: true };
      }),

    // Listar categorias
    getCategories: publicProcedure.query(async () => {
      return monitorDb.getAllCategories();
    }),

    // Listar fontes
    getSources: publicProcedure.query(async () => {
      return monitorDb.getAllSources();
    }),

    // Listar logs de scraping
    getScrapingLogs: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return monitorDb.getRecentLogs(input?.limit);
      }),

    // Executar scraping manual
    runManualScraping: publicProcedure.mutation(async () => {
      const results = await runManualScraping();
      return { success: true, results };
    }),

    // Enviar digest manual
    sendDigest: publicProcedure.mutation(async () => {
      const updates = await monitorDb.getRecentUpdates(1);
      if (updates.length > 0) {
        await sendDailyDigest(updates);
        return { success: true, count: updates.length };
      }
      return { success: false, message: "No updates to send" };
    }),

    // Executar agente de notícias fiscais manualmente
    runNewsAgent: publicProcedure.mutation(async () => {
      const result = await runNewsAgentManually();
      return result;
    }),

    // Teste simples de envio de email
    testEmail: publicProcedure.mutation(async () => {
      const { sendEmail } = await import('./emailService');
      const directorEmail = process.env.DIRECTOR_EMAIL || 'diretoria@arrozbemcasado.com.br';
      
      console.log('[TestEmail] Enviando email de teste para:', directorEmail);
      console.log('[TestEmail] RESEND_API_KEY configurada:', !!process.env.RESEND_API_KEY);
      
      try {
        await sendEmail({
          to: directorEmail,
          subject: '📧 Teste do Sistema de Monitoramento - Bem Casado',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #E63946;">📧 Email de Teste</h1>
              <p>Este é um email de teste do sistema de monitoramento.</p>
              <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
              <p><strong>Destinatário:</strong> ${directorEmail}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">Sistema de Monitoramento Automático - Bem Casado Alimentos</p>
            </div>
          `
        });
        console.log('[TestEmail] Email enviado com sucesso!');
        return { success: true, message: `Email de teste enviado para ${directorEmail}` };
      } catch (error: any) {
        console.error('[TestEmail] Erro ao enviar email:', error);
        return { success: false, message: error.message || 'Erro desconhecido' };
      }
    }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log('='.repeat(80));
        console.log('[Newsletter Router] Nova inscrição recebida');
        console.log('[Newsletter Router] Email:', input.email);
        console.log('[Newsletter Router] Nome:', input.firstName || 'Não informado');
        console.log('[Newsletter Router] Verificando variáveis de ambiente...');
        console.log('[Newsletter Router] SMTP_EMAIL_USER:', process.env.SMTP_EMAIL_USER ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
        console.log('[Newsletter Router] SMTP_EMAIL_PASS:', process.env.SMTP_EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
        console.log('='.repeat(80));
        
        const result = await subscribeToNewsletter({
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          tags: ['Website'],
        });
        
        console.log('[Newsletter Router] Resultado:', result.success ? '✅ SUCESSO' : '❌ FALHA');
        console.log('[Newsletter Router] Mensagem:', result.message);
        console.log('='.repeat(80));
        
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
