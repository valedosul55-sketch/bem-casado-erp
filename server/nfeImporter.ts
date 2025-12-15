/**
 * Importador de NF-e para Estoque
 * 
 * Processa XML de NF-e e registra entrada de produtos no estoque
 */

import { db } from "./db";
import { products, stockMovements, stockBatches, productStocks } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { parseNFeXML, validarNFeXML, type NFeInfo, type NFeProduto } from "./nfeParser";
import { processStockEntry } from "./averageCost";

export interface ImportResult {
  success: boolean;
  nfeInfo: {
    chave: string;
    numero: string;
    serie: string;
    dataEmissao: Date;
    valorTotal: number;
    fornecedor: {
      nome: string;
      cnpj: string;
    };
  };
  produtosProcessados: Array<{
    nome: string;
    quantidade: number;
    unidade: string;
    valorUnitario: number;
    valorTotal: number;
  }>;
  produtosNovos: number;
  produtosAtualizados: number;
  erros: string[];
  avisos: string[];
}

/**
 * Busca ou cria produto baseado nos dados da NF-e
 */
async function buscarOuCriarProduto(produtoNFe: NFeProduto): Promise<{
  productId: number;
  isNew: boolean;
}> {
  // Tentar buscar por EAN
  if (produtoNFe.ean) {
    const [produtoExistente] = await db
      .select()
      .from(products)
      .where(eq(products.ean13, produtoNFe.ean))
      .limit(1);

    if (produtoExistente) {
      return { productId: produtoExistente.id, isNew: false };
    }
  }

  // Produto não encontrado, criar novo
  const [novoProduto] = await db
    .insert(products)
    .values({
      name: produtoNFe.descricao,
      ean13: produtoNFe.ean,
      ncm: produtoNFe.ncm,
      unit: produtoNFe.unidade.toLowerCase(),
      price: produtoNFe.valorUnitario, // Usar como preço inicial
      stock: 0, // Será atualizado pela movimentação
      active: 1,
    })
    .returning();

  return { productId: novoProduto.id, isNew: true };
}

/**
 * Registra movimentação de entrada para um produto e cria lote
 */
async function registrarEntrada(
  productId: number,
  quantidade: number,
  valorUnitario: number,
  nfeInfo: NFeInfo,
  storeId: number = 1 // Loja padrão (Matriz)
): Promise<void> {
  // Gerar número do lote baseado na NF-e
  const batchNumber = `NFE-${nfeInfo.numero}-${nfeInfo.serie}-${productId}`;

  // Criar lote
  const [batch] = await db
    .insert(stockBatches)
    .values({
      productId,
      storeId,
      batchNumber,
      quantity: quantidade,
      initialQuantity: quantidade,
      unitCost: valorUnitario,
      entryDate: nfeInfo.dataEmissao,
      expiryDate: null, // TODO: Extrair do XML se disponível
      supplier: `${nfeInfo.emitente.razaoSocial} (${nfeInfo.emitente.cnpj})`,
      notes: `Importado da NF-e ${nfeInfo.numero}/${nfeInfo.serie} | Chave: ${nfeInfo.chave}`,
    })
    .returning();

  // Criar movimentação de entrada vinculada ao lote
  await db.insert(stockMovements).values({
    productId,
    storeId,
    batchId: batch.id,
    movementType: "entry",
    quantity: quantidade,
    unitCost: valorUnitario,
    reason: `Importação NF-e ${nfeInfo.numero}`,
    notes: `Fornecedor: ${nfeInfo.emitente.razaoSocial} (CNPJ: ${nfeInfo.emitente.cnpj}) | Chave: ${nfeInfo.chave} | Lote: ${batchNumber}`,
  });

  // Atualizar estoque do produto
  const [produto] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  // Atualizar estoque do produto na loja
  const existingStock = await db
    .select()
    .from(productStocks)
    .where(eq(productStocks.productId, productId))
    .limit(1);

  if (existingStock.length > 0) {
    // Atualizar estoque existente
    await db
      .update(productStocks)
      .set({
        quantity: existingStock[0].quantity + quantidade,
        updatedAt: new Date(),
      })
      .where(eq(productStocks.id, existingStock[0].id));
  } else {
    // Criar novo registro de estoque
    await db.insert(productStocks).values({
      productId,
      storeId,
      quantity: quantidade,
    });
  }

  // Atualizar estoque total do produto (para compatibilidade)
  if (produto) {
    await db
      .update(products)
      .set({
        stock: (produto.stock || 0) + quantidade,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
  }

  // Calcular e atualizar custo médio
  await processStockEntry(productId, quantidade, valorUnitario);
}

/**
 * Importa NF-e e registra entrada de produtos no estoque
 * 
 * @param xmlContent - Conteúdo do arquivo XML da NF-e
 * @returns Resultado da importação com estatísticas
 */
export async function importarNFe(xmlContent: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    nfeInfo: {
      chave: '',
      numero: '',
      serie: '',
      dataEmissao: new Date(),
      valorTotal: 0,
      fornecedor: {
        nome: '',
        cnpj: '',
      },
    },
    produtosProcessados: [],
    produtosNovos: 0,
    produtosAtualizados: 0,
    erros: [],
    avisos: [],
  };

  try {
    // Validar XML
    const validacao = validarNFeXML(xmlContent);
    if (!validacao.valido) {
      result.erros.push(validacao.erro || 'XML inválido');
      return result;
    }

    // Fazer parsing do XML
    const nfeInfo = await parseNFeXML(xmlContent);

    // Preencher informações básicas
    result.nfeInfo = {
      chave: nfeInfo.chave,
      numero: nfeInfo.numero,
      serie: nfeInfo.serie,
      dataEmissao: nfeInfo.dataEmissao,
      valorTotal: nfeInfo.valorTotal,
      fornecedor: {
        nome: nfeInfo.emitente.razaoSocial,
        cnpj: nfeInfo.emitente.cnpj,
      },
    };

    // Processar cada produto
    for (const produtoNFe of nfeInfo.produtos) {
      try {
        // Buscar ou criar produto
        const { productId, isNew } = await buscarOuCriarProduto(produtoNFe);

        if (isNew) {
          result.produtosNovos++;
          result.avisos.push(
            `Produto novo cadastrado: ${produtoNFe.descricao} (EAN: ${produtoNFe.ean || 'N/A'})`
          );
        } else {
          result.produtosAtualizados++;
        }

        // Registrar entrada no estoque
        await registrarEntrada(
          productId,
          produtoNFe.quantidade,
          produtoNFe.valorUnitario,
          nfeInfo
        );

        // Adicionar ao array de produtos processados
        result.produtosProcessados.push({
          nome: produtoNFe.descricao,
          quantidade: produtoNFe.quantidade,
          unidade: produtoNFe.unidade,
          valorUnitario: produtoNFe.valorUnitario,
          valorTotal: produtoNFe.valorTotal,
        });
      } catch (error) {
        result.erros.push(
          `Erro ao processar produto "${produtoNFe.descricao}": ${(error as Error).message}`
        );
      }
    }

    // Marcar como sucesso se pelo menos um produto foi processado
    result.success = result.produtosProcessados.length > 0;

    return result;
  } catch (error) {
    result.erros.push(`Erro geral: ${(error as Error).message}`);
    return result;
  }
}
