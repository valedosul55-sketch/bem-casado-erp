import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { emitirNFCe, enviarDanfePorEmail } from './focus-nfe';
import { gerarMensagemDanfe, gerarLinkWhatsApp } from './whatsapp';
import { getDb } from './db';
import { products, nfce } from '../drizzle/schema';
import { eq, desc, and, or, gte, lte, like } from 'drizzle-orm';

export const nfceRouter = router({
  /**
   * Emite NFC-e através do Focus NFe ao finalizar venda no PDV
   */
  emitir: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            ean: z.string(),
            name: z.string(),
            quantity: z.number(),
            price: z.number(),
          })
        ),
        cliente: z.object({
          nome: z.string().default('CONSUMIDOR FINAL'),
          cpf_cnpj: z.string().optional(),
          inscricao_estadual: z.string().optional(), // IE para CNPJ contribuinte
          email: z.string().email().optional(),
          telefone: z.string().optional(),
        }),
        formaPagamento: z.string().default('01'), // 01=Dinheiro, 03=Crédito, 04=Débito, 17=PIX
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Calcula total da venda
        const valorTotal = input.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Busca dados completos dos produtos do banco (incluindo NCM)
        const db = await getDb();
        if (!db) {
          throw new Error('Banco de dados não disponível');
        }

        const productIds = input.items.map(item => item.productId);
        const productsData = await db
          .select()
          .from(products)
          .where(eq(products.id, productIds[0]));

        // Cria um mapa de produtos por ID para facilitar busca
        const productMap = new Map();
        for (const productId of productIds) {
          const product = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);
          if (product[0]) {
            productMap.set(productId, product[0]);
          }
        }

        // Monta dados para o Focus NFe com NCM do banco
        const items = input.items.map((item) => {
          const product = productMap.get(item.productId);
          return {
            codigo: item.ean,
            descricao: item.name,
            quantidade: item.quantity,
            preco: item.price,
            ncm: product?.ncm || '10063021', // Usa NCM do produto ou padrão
          };
        });

        // Emite NFC-e no Focus NFe
        const response = await emitirNFCe(
          items,
          valorTotal,
          input.cliente.cpf_cnpj,
          input.cliente.nome,
          input.cliente.inscricao_estadual,
          undefined, // UF
          input.formaPagamento
        );

        // Verifica se houve erro
        if (response.status !== 'autorizado') {
          const erro = response.erros?.[0]?.mensagem || response.mensagem_sefaz;
          throw new Error(`Erro ao emitir NFC-e: ${erro}`);
        }

        // Salva NFC-e no banco de dados (reutiliza conexão existente)
        if (db) {
          await db.insert(nfce).values({
            referencia: response.ref || `VENDA_${Date.now()}`,
            numero: response.numero || null,
            serie: response.serie || '1',
            chaveAcesso: response.chave_nfe || null,
            status: response.status === 'autorizado' ? 'autorizada' : 'processando',
            statusSefaz: response.status_sefaz || null,
            mensagemSefaz: response.mensagem_sefaz || null,
            urlDanfe: response.caminho_danfe || null,
            urlDanfeSimplificado: response.caminho_danfe_simplificado || null,
            urlDanfeEtiqueta: response.caminho_danfe_etiqueta || null,
            qrcodeUrl: response.qrcode_url || null,
            clienteNome: input.cliente.nome,
            clienteCpfCnpj: input.cliente.cpf_cnpj || null,
            clienteEmail: input.cliente.email || null,
            clienteTelefone: input.cliente.telefone || null,
            valorTotal,
            valorProdutos: valorTotal,
            valorDesconto: 0,
            valorIcms: 0,
            itens: JSON.stringify(input.items),
            danfeEnviadoWhatsapp: input.cliente.telefone ? 1 : 0,
            danfeEnviadoEmail: input.cliente.email ? 1 : 0,
            emitidaEm: new Date(),
          });
        }

        // Baixa estoque dos produtos
        if (db) {
          for (const item of input.items) {
            // Buscar estoque atual
            const currentProduct = await db
              .select({ stock: products.stock })
              .from(products)
              .where(eq(products.id, item.productId));
            
            const currentStock = currentProduct[0]?.stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            // Atualizar estoque
            await db
              .update(products)
              .set({ stock: newStock })
              .where(eq(products.id, item.productId));
          }
        }

        // Envia DANFE por email/WhatsApp se informado
        if (input.cliente.email && response.ref) {
          try {
            await enviarDanfePorEmail(response.ref, [input.cliente.email]);
            console.log('[NFC-e] DANFE enviado por email para:', input.cliente.email);
          } catch (emailError) {
            console.error('[NFC-e] Erro ao enviar email:', emailError);
            // Não falha a venda se o email não for enviado
          }
        }

        // Gera link do WhatsApp se telefone informado
        let whatsappLink: string | undefined;
        if (input.cliente.telefone && response.numero && response.chave_nfe) {
          const mensagem = gerarMensagemDanfe({
            numero: response.numero,
            chaveAcesso: response.chave_nfe,
            urlDanfe: response.caminho_danfe || '',
            qrcodeUrl: response.qrcode_url || '',
            valorTotal,
            produtos: input.items.map(item => ({
              nome: item.name,
              quantidade: item.quantity,
              valor: item.price * item.quantity
            }))
          });
          whatsappLink = gerarLinkWhatsApp(input.cliente.telefone, mensagem);
          console.log('[NFC-e] Link do WhatsApp gerado para:', input.cliente.telefone);
        }

        return {
          success: true,
          nota: {
            numero: response.numero || '',
            serie: response.serie || '1',
            chaveAcesso: response.chave_nfe || '',
            urlDanfe: response.caminho_danfe || '',
            qrcodeUrl: response.qrcode_url || '',
          },
          whatsappLink,
        };
      } catch (error: any) {
        console.error('Erro ao emitir NFC-e:', error);
        return {
          success: false,
          error: error.message || 'Erro ao emitir NFC-e',
        };
      }
    }),

  /**
   * Lista todas as NFC-e emitidas com filtros opcionais e paginação
   */
  listar: publicProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(), // YYYY-MM-DD
        dataFim: z.string().optional(), // YYYY-MM-DD
        status: z.enum(['processando', 'autorizada', 'cancelada', 'denegada', 'erro']).optional(),
        busca: z.string().optional(), // Busca por número, chave, nome do cliente ou CPF/CNPJ
        pagina: z.number().default(1),
        limite: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Importa funções de filtro do drizzle
      const { and, or, gte, lte, like, sql } = await import('drizzle-orm');
      
      // Constrói array de condições
      const conditions = [];
      
      // Filtro por data de início
      if (input.dataInicio) {
        conditions.push(gte(nfce.createdAt, new Date(input.dataInicio)));
      }
      
      // Filtro por data de fim
      if (input.dataFim) {
        const dataFim = new Date(input.dataFim);
        dataFim.setHours(23, 59, 59, 999); // Fim do dia
        conditions.push(lte(nfce.createdAt, dataFim));
      }
      
      // Filtro por status
      if (input.status) {
        conditions.push(eq(nfce.status, input.status));
      }
      
      // Busca por número, chave, nome ou CPF/CNPJ
      if (input.busca) {
        const searchTerm = `%${input.busca}%`;
        conditions.push(
          or(
            like(nfce.numero, searchTerm),
            like(nfce.chaveAcesso, searchTerm),
            like(nfce.clienteNome, searchTerm),
            like(nfce.clienteCpfCnpj, searchTerm)
          )
        );
      }
      
      // Calcula offset para paginação
      const offset = (input.pagina - 1) * input.limite;
      
      // Query com filtros
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Busca notas com filtros
      const notas = await db
        .select()
        .from(nfce)
        .where(whereClause)
        .orderBy(desc(nfce.createdAt))
        .limit(input.limite)
        .offset(offset);
      
      // Conta total de registros (para paginação)
      const totalQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(nfce)
        .where(whereClause);
      
      const total = Number(totalQuery[0]?.count || 0);
      const totalPaginas = Math.ceil(total / input.limite);
      
      // Calcula totalizadores
      const totalizadoresQuery = await db
        .select({
          valorTotal: sql<number>`SUM(${nfce.valorTotal})`,
          quantidade: sql<number>`COUNT(*)`,
        })
        .from(nfce)
        .where(whereClause);
      
      const valorTotalGeral = Number(totalizadoresQuery[0]?.valorTotal || 0);
      const quantidadeTotal = Number(totalizadoresQuery[0]?.quantidade || 0);
      
      return {
        notas: notas.map(nota => ({
          ...nota,
          itens: JSON.parse(nota.itens as string),
        })),
        paginacao: {
          paginaAtual: input.pagina,
          totalPaginas,
          totalRegistros: total,
          registrosPorPagina: input.limite,
        },
        totalizadores: {
          valorTotal: valorTotalGeral,
          quantidade: quantidadeTotal,
        },
      };
    }),

  /**
   * Busca detalhes de uma NFC-e específica
   */
  buscar: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      const nota = await db
        .select()
        .from(nfce)
        .where(eq(nfce.id, input.id))
        .limit(1);

      if (!nota[0]) {
        throw new Error('Nota fiscal não encontrada');
      }

      return {
        ...nota[0],
        itens: JSON.parse(nota[0].itens as string),
      };
    }),

  /**
   * Obtém estatísticas de NFC-e
   */
  estatisticas: publicProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Buscar todas as notas (com filtro de data se fornecido)
      const notas = await db.select().from(nfce);

      // Calcular estatísticas
      const totalNotas = notas.length;
      const notasAutorizadas = notas.filter(n => n.status === 'autorizada').length;
      const notasCanceladas = notas.filter(n => n.status === 'cancelada').length;
      const faturamentoTotal = notas
        .filter(n => n.status === 'autorizada')
        .reduce((sum, n) => sum + (n.valorTotal || 0), 0);

      return {
        totalNotas,
        notasAutorizadas,
        notasCanceladas,
        faturamentoTotal,
      };
    }),

  /**
   * Reenvia DANFE por WhatsApp
   */
  reenviarWhatsApp: publicProcedure
    .input(
      z.object({
        id: z.number(),
        telefone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      const nota = await db
        .select()
        .from(nfce)
        .where(eq(nfce.id, input.id))
        .limit(1);

      if (!nota[0]) {
        throw new Error('Nota fiscal não encontrada');
      }

      const itens = JSON.parse(nota[0].itens as string);
      const mensagem = gerarMensagemDanfe({
        numero: nota[0].numero || '',
        chaveAcesso: nota[0].chaveAcesso || '',
        urlDanfe: nota[0].urlDanfe || '',
        qrcodeUrl: nota[0].qrcodeUrl || '',
        valorTotal: nota[0].valorTotal || 0,
        produtos: itens.map((item: any) => ({
          nome: item.name,
          quantidade: item.quantity,
          valor: item.price * item.quantity,
        })),
      });

      const whatsappLink = gerarLinkWhatsApp(input.telefone, mensagem);

      return {
        success: true,
        whatsappLink,
      };
    }),

  /**
   * Envia DANFE por email
   */
  enviarEmail: publicProcedure
    .input(
      z.object({
        referencia: z.string(),
        emails: z.array(z.string().email()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await enviarDanfePorEmail(input.referencia, input.emails);
        return {
          success: true,
          message: 'DANFE enviado por email com sucesso',
        };
      } catch (error: any) {
        console.error('Erro ao enviar DANFE por email:', error);
        return {
          success: false,
          error: error.message || 'Erro ao enviar DANFE por email',
        };
      }
    }),

  /**
   * Exportar relatório em Excel
   */
  exportarExcel: publicProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        status: z.enum(['processando', 'autorizada', 'cancelada', 'denegada', 'erro']).optional(),
        busca: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Buscar notas com filtros
      let query = db.select().from(nfce);

      const conditions = [];
      if (input.dataInicio) {
        conditions.push(gte(nfce.createdAt, new Date(input.dataInicio)));
      }
      if (input.dataFim) {
        const dataFim = new Date(input.dataFim);
        dataFim.setHours(23, 59, 59, 999);
        conditions.push(lte(nfce.createdAt, dataFim));
      }
      if (input.status) {
        conditions.push(eq(nfce.status, input.status));
      }
      if (input.busca) {
        conditions.push(
          or(
            like(nfce.numero, `%${input.busca}%`),
            like(nfce.chaveAcesso, `%${input.busca}%`),
            like(nfce.clienteNome, `%${input.busca}%`),
            like(nfce.clienteCpfCnpj, `%${input.busca}%`)
          )!
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)!) as any;
      }

      const notas = await query.orderBy(desc(nfce.createdAt));

      // Calcular totalizadores
      const valorTotal = notas.reduce((sum, nota) => sum + nota.valorTotal, 0);
      const totalizadores = {
        valorTotal,
        quantidade: notas.length,
      };

      // Gerar Excel
      const { gerarRelatorioExcel } = await import('./export-reports');
      const buffer = await gerarRelatorioExcel(notas, totalizadores);

      // Retornar como base64
      return {
        success: true,
        data: buffer.toString('base64'),
        filename: `notas_fiscais_${new Date().toISOString().split('T')[0]}.xlsx`,
      };
    }),

  /**
   * Exportar relatório em PDF (HTML)
   */
  exportarPDF: publicProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        status: z.enum(['processando', 'autorizada', 'cancelada', 'denegada', 'erro']).optional(),
        busca: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Buscar notas com filtros (mesmo código do Excel)
      let query = db.select().from(nfce);

      const conditions = [];
      if (input.dataInicio) {
        conditions.push(gte(nfce.createdAt, new Date(input.dataInicio)));
      }
      if (input.dataFim) {
        const dataFim = new Date(input.dataFim);
        dataFim.setHours(23, 59, 59, 999);
        conditions.push(lte(nfce.createdAt, dataFim));
      }
      if (input.status) {
        conditions.push(eq(nfce.status, input.status));
      }
      if (input.busca) {
        conditions.push(
          or(
            like(nfce.numero, `%${input.busca}%`),
            like(nfce.chaveAcesso, `%${input.busca}%`),
            like(nfce.clienteNome, `%${input.busca}%`),
            like(nfce.clienteCpfCnpj, `%${input.busca}%`)
          )!
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)!) as any;
      }

      const notas = await query.orderBy(desc(nfce.createdAt));

      // Calcular totalizadores
      const valorTotal = notas.reduce((sum, nota) => sum + nota.valorTotal, 0);
      const totalizadores = {
        valorTotal,
        quantidade: notas.length,
      };

      // Gerar HTML
      const { gerarRelatorioPDF } = await import('./export-reports');
      const html = gerarRelatorioPDF(notas, totalizadores);

      return {
        success: true,
        html,
        filename: `notas_fiscais_${new Date().toISOString().split('T')[0]}.pdf`,
      };
    }),

  /**
   * Reenvia DANFE por email para um destinatário
   */
  reenviarEmail: publicProcedure
    .input(
      z.object({
        referencia: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Envia DANFE por email usando a API do Focus NFe
        await enviarDanfePorEmail(input.referencia, [input.email]);

        // Atualiza flag no banco de dados
        const database = await getDb();
        if (database) {
          await database
            .update(nfce)
            .set({ danfeEnviadoEmail: 1 })
            .where(eq(nfce.referencia, input.referencia));
        }

        return {
          success: true,
          message: 'DANFE enviado com sucesso!',
        };
      } catch (error: any) {
        console.error('Erro ao reenviar DANFE por email:', error);
        return {
          success: false,
          error: error.message || 'Erro ao enviar DANFE por email',
        };
      }
    }),
});
