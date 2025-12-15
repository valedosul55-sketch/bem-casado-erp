import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { getDb } from './db';
import { nfce } from '../drizzle/schema';
import { sql, and, gte, lte, eq } from 'drizzle-orm';

export const dashboardRouter = router({
  /**
   * Retorna estatísticas gerais de vendas
   */
  estatisticas: publicProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(), // YYYY-MM-DD
        dataFim: z.string().optional(), // YYYY-MM-DD
        storeId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Define período padrão (últimos 30 dias)
      const dataFim = input.dataFim ? new Date(input.dataFim) : new Date();
      const dataInicio = input.dataInicio 
        ? new Date(input.dataInicio) 
        : new Date(dataFim.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Ajusta fim do dia
      dataFim.setHours(23, 59, 59, 999);

      // Condições de filtro
      const conditions = [
        gte(nfce.emitidaEm, dataInicio),
        lte(nfce.emitidaEm, dataFim),
        eq(nfce.status, 'autorizada'), // Apenas notas autorizadas
      ];

      if (input.storeId) {
        conditions.push(eq(nfce.storeId, input.storeId));
      }

      // Total de vendas no período
      const totalVendasQuery = await db
        .select({
          total: sql<number>`SUM(${nfce.valorTotal})`,
          quantidade: sql<number>`COUNT(*)`,
        })
        .from(nfce)
        .where(and(...conditions));

      const totalVendas = Number(totalVendasQuery[0]?.total || 0);
      const quantidadeVendas = Number(totalVendasQuery[0]?.quantidade || 0);
      const ticketMedio = quantidadeVendas > 0 ? totalVendas / quantidadeVendas : 0;

      // Vendas de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const fimHoje = new Date();
      fimHoje.setHours(23, 59, 59, 999);

      const vendasHojeConditions = [
        gte(nfce.emitidaEm, hoje),
        lte(nfce.emitidaEm, fimHoje),
        eq(nfce.status, 'autorizada')
      ];

      if (input.storeId) {
        vendasHojeConditions.push(eq(nfce.storeId, input.storeId));
      }

      const vendasHojeQuery = await db
        .select({
          total: sql<number>`SUM(${nfce.valorTotal})`,
          quantidade: sql<number>`COUNT(*)`,
        })
        .from(nfce)
        .where(and(...vendasHojeConditions));

      const vendasHoje = Number(vendasHojeQuery[0]?.total || 0);
      const quantidadeHoje = Number(vendasHojeQuery[0]?.quantidade || 0);

      // Vendas do mês atual
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

      const vendasMesConditions = [
        gte(nfce.emitidaEm, inicioMes),
        lte(nfce.emitidaEm, fimMes),
        eq(nfce.status, 'autorizada')
      ];

      if (input.storeId) {
        vendasMesConditions.push(eq(nfce.storeId, input.storeId));
      }

      const vendasMesQuery = await db
        .select({
          total: sql<number>`SUM(${nfce.valorTotal})`,
          quantidade: sql<number>`COUNT(*)`,
        })
        .from(nfce)
        .where(and(...vendasMesConditions));

      const vendasMes = Number(vendasMesQuery[0]?.total || 0);
      const quantidadeMes = Number(vendasMesQuery[0]?.quantidade || 0);

      // Vendas do mês anterior (para comparação)
      const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      const vendasMesAnteriorConditions = [
        gte(nfce.emitidaEm, inicioMesAnterior),
        lte(nfce.emitidaEm, fimMesAnterior),
        eq(nfce.status, 'autorizada')
      ];

      if (input.storeId) {
        vendasMesAnteriorConditions.push(eq(nfce.storeId, input.storeId));
      }

      const vendasMesAnteriorQuery = await db
        .select({
          total: sql<number>`SUM(${nfce.valorTotal})`,
        })
        .from(nfce)
        .where(and(...vendasMesAnteriorConditions));
      
      const vendasMesAnterior = Number(vendasMesAnteriorQuery[0]?.total || 0);
      const crescimentoMensal = vendasMesAnterior > 0 
        ? ((vendasMes - vendasMesAnterior) / vendasMesAnterior) * 100 
        : 0;

      // Total de clientes únicos
      const clientesQuery = await db
        .select({
          clientes: sql<number>`COUNT(DISTINCT ${nfce.clienteCpfCnpj})`,
        })
        .from(nfce)
        .where(and(...conditions));

      const totalClientes = Number(clientesQuery[0]?.clientes || 0);

      return {
        vendasHoje,
        quantidadeHoje,
        vendasMes,
        quantidadeMes,
        vendasMesAnterior,
        crescimentoMensal,
        totalVendas,
        quantidadeVendas,
        ticketMedio,
        totalClientes,
      };
    }),

  /**
   * Retorna faturamento diário dos últimos 30 dias
   */
  faturamentoDiario: publicProcedure
    .input(
      z.object({
        dias: z.number().default(30),
        storeId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      const dataFim = new Date();
      dataFim.setHours(23, 59, 59, 999);
      const dataInicio = new Date(dataFim.getTime() - input.dias * 24 * 60 * 60 * 1000);
      dataInicio.setHours(0, 0, 0, 0);

      const diarioConditions = [
        gte(nfce.emitidaEm, dataInicio),
        lte(nfce.emitidaEm, dataFim),
        eq(nfce.status, 'autorizada')
      ];

      if (input.storeId) {
        diarioConditions.push(eq(nfce.storeId, input.storeId));
      }

      // Busca vendas agrupadas por dia
      const vendasDiarias = await db
        .select({
          data: sql<string>`DATE(${nfce.emitidaEm})`,
          total: sql<number>`SUM(${nfce.valorTotal})`,
          quantidade: sql<number>`COUNT(*)`,
        })
        .from(nfce)
        .where(and(...diarioConditions))
        .groupBy(sql`DATE(${nfce.emitidaEm})`)
        .orderBy(sql`DATE(${nfce.emitidaEm})`);

      // Preenche dias sem vendas com zero
      const resultado = [];
      const dataAtual = new Date(dataInicio);
      
      while (dataAtual <= dataFim) {
        const dataStr = dataAtual.toISOString().split('T')[0];
        const venda = vendasDiarias.find(v => v.data === dataStr);
        
        resultado.push({
          data: dataStr,
          total: venda ? Number(venda.total) : 0,
          quantidade: venda ? Number(venda.quantidade) : 0,
        });
        
        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      return resultado;
    }),

  /**
   * Retorna faturamento mensal dos últimos 12 meses
   */
  faturamentoMensal: publicProcedure
    .input(
      z.object({
        storeId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error('Banco de dados não disponível');
    }

    const hoje = new Date();
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1);
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

    const mensalConditions = [
      gte(nfce.emitidaEm, dataInicio),
      lte(nfce.emitidaEm, dataFim),
      eq(nfce.status, 'autorizada')
    ];

    if (input?.storeId) {
      mensalConditions.push(eq(nfce.storeId, input.storeId));
    }

    // Busca vendas agrupadas por mês
    const vendasMensais = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${nfce.emitidaEm})`,
        mes: sql<number>`EXTRACT(MONTH FROM ${nfce.emitidaEm})`,
        total: sql<number>`SUM(${nfce.valorTotal})`,
        quantidade: sql<number>`COUNT(*)`,
      })
      .from(nfce)
      .where(and(...mensalConditions))
      .groupBy(sql`EXTRACT(YEAR FROM ${nfce.emitidaEm})`, sql`EXTRACT(MONTH FROM ${nfce.emitidaEm})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${nfce.emitidaEm})`, sql`EXTRACT(MONTH FROM ${nfce.emitidaEm})`);

    // Preenche meses sem vendas com zero
    const resultado = [];
    const dataAtual = new Date(dataInicio);
    
    while (dataAtual <= dataFim) {
      const ano = dataAtual.getFullYear();
      const mes = dataAtual.getMonth() + 1;
      const venda = vendasMensais.find(v => v.ano === ano && v.mes === mes);
      
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      resultado.push({
        mes: `${meses[mes - 1]}/${ano}`,
        total: venda ? Number(venda.total) : 0,
        quantidade: venda ? Number(venda.quantidade) : 0,
      });
      
      dataAtual.setMonth(dataAtual.getMonth() + 1);
    }

    return resultado;
  }),

  /**
   * Retorna top 10 produtos mais vendidos
   */
  produtosMaisVendidos: publicProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        limite: z.number().default(10),
        storeId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Define período padrão (últimos 30 dias)
      const dataFim = input.dataFim ? new Date(input.dataFim) : new Date();
      const dataInicio = input.dataInicio 
        ? new Date(input.dataInicio) 
        : new Date(dataFim.getTime() - 30 * 24 * 60 * 60 * 1000);

      dataFim.setHours(23, 59, 59, 999);

      const notasConditions = [
        gte(nfce.emitidaEm, dataInicio),
        lte(nfce.emitidaEm, dataFim),
        eq(nfce.status, 'autorizada')
      ];

      if (input.storeId) {
        notasConditions.push(eq(nfce.storeId, input.storeId));
      }

      // Busca todas as notas do período
      const notas = await db
        .select()
        .from(nfce)
        .where(and(...notasConditions));

      // Agrupa produtos por nome
      const produtosMap = new Map<string, { quantidade: number; valorTotal: number }>();

      for (const nota of notas) {
        try {
          const itens = JSON.parse(nota.itens as string);
          for (const item of itens) {
            const key = item.name;
            const atual = produtosMap.get(key) || { quantidade: 0, valorTotal: 0 };
            produtosMap.set(key, {
              quantidade: atual.quantidade + item.quantity,
              valorTotal: atual.valorTotal + (item.price * item.quantity),
            });
          }
        } catch (error) {
          console.error('Erro ao processar itens da nota:', error);
        }
      }

      // Converte para array e ordena por quantidade
      const produtos = Array.from(produtosMap.entries())
        .map(([nome, dados]) => ({
          nome,
          quantidade: dados.quantidade,
          valorTotal: dados.valorTotal,
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, input.limite);

      return produtos;
    }),
});
