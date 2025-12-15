/**
 * Parser de XML de NF-e (Nota Fiscal Eletrônica)
 * 
 * Extrai informações de produtos, fornecedor e valores de arquivos XML de NF-e
 * Conforme layout da NF-e versão 4.00 (Nota Técnica 2016.002)
 */

import { XMLParser } from 'fast-xml-parser';

export interface NFeProduto {
  codigo: string; // cProd
  ean: string | null; // cEAN
  descricao: string; // xProd
  ncm: string; // NCM
  cfop: string; // CFOP
  unidade: string; // uCom
  quantidade: number; // qCom
  valorUnitario: number; // vUnCom (em centavos)
  valorTotal: number; // vProd (em centavos)
}

export interface NFeEmitente {
  cnpj: string;
  razaoSocial: string; // xNome
  nomeFantasia: string | null; // xFant
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
}

export interface NFeInfo {
  chave: string; // Chave de acesso da NF-e
  numero: string; // nNF
  serie: string; // serie
  dataEmissao: Date; // dhEmi
  valorTotal: number; // vNF (em centavos)
  emitente: NFeEmitente;
  produtos: NFeProduto[];
}

/**
 * Converte valor monetário string para centavos (inteiro)
 */
function valorParaCentavos(valor: string | number): number {
  if (typeof valor === 'number') {
    return Math.round(valor * 100);
  }
  const valorNum = parseFloat(valor.replace(',', '.'));
  return Math.round(valorNum * 100);
}

/**
 * Extrai chave de acesso do XML
 */
function extrairChaveAcesso(nfeProc: any): string {
  try {
    // Tentar extrair da tag protNFe (NF-e processada)
    if (nfeProc.protNFe?.infProt?.chNFe) {
      return String(nfeProc.protNFe.infProt.chNFe);
    }
    
    // Tentar extrair do atributo Id da tag infNFe
    if (nfeProc.NFe?.infNFe?.['@_Id']) {
      const id = String(nfeProc.NFe.infNFe['@_Id']);
      // Remove o prefixo "NFe" se existir
      return id.replace('NFe', '');
    }
    
    throw new Error('Chave de acesso não encontrada no XML');
  } catch (error) {
    throw new Error('Erro ao extrair chave de acesso: ' + (error as Error).message);
  }
}

/**
 * Extrai informações do emitente
 */
function extrairEmitente(emit: any): NFeEmitente {
  try {
    const enderEmit = emit.enderEmit;
    
    return {
      cnpj: emit.CNPJ || '',
      razaoSocial: emit.xNome || '',
      nomeFantasia: emit.xFant || null,
      endereco: {
        logradouro: enderEmit.xLgr || '',
        numero: enderEmit.nro || '',
        bairro: enderEmit.xBairro || '',
        municipio: enderEmit.xMun || '',
        uf: enderEmit.UF || '',
        cep: enderEmit.CEP || '',
      },
    };
  } catch (error) {
    throw new Error('Erro ao extrair dados do emitente: ' + (error as Error).message);
  }
}

/**
 * Extrai informações dos produtos
 */
function extrairProdutos(dets: any | any[]): NFeProduto[] {
  try {
    // Garantir que dets é um array
    const detArray = Array.isArray(dets) ? dets : [dets];
    
    return detArray.map((det) => {
      const prod = det.prod;
      
      return {
        codigo: prod.cProd || '',
        ean: prod.cEAN && prod.cEAN !== 'SEM GTIN' ? prod.cEAN : null,
        descricao: prod.xProd || '',
        ncm: prod.NCM || '',
        cfop: prod.CFOP || '',
        unidade: prod.uCom || 'UN',
        quantidade: parseFloat(prod.qCom || '0'),
        valorUnitario: valorParaCentavos(prod.vUnCom || '0'),
        valorTotal: valorParaCentavos(prod.vProd || '0'),
      };
    });
  } catch (error) {
    throw new Error('Erro ao extrair produtos: ' + (error as Error).message);
  }
}

/**
 * Faz o parsing do XML da NF-e e extrai informações relevantes
 * 
 * @param xmlContent - Conteúdo do arquivo XML
 * @returns Objeto com informações da NF-e
 */
export async function parseNFeXML(xmlContent: string): Promise<NFeInfo> {
  try {
    // Configurar parser
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: false,
      parseTagValue: false, // Desabilitado para evitar conversão de chaves longas em números
    });

    // Fazer parsing do XML
    const result = parser.parse(xmlContent);

    // Navegar pela estrutura do XML
    // Pode ser nfeProc (NF-e processada) ou NFe (NF-e não processada)
    const nfeProc = result.nfeProc || result.NFe;
    
    if (!nfeProc) {
      throw new Error('XML não é uma NF-e válida. Tag raiz não encontrada.');
    }

    const nfe = nfeProc.NFe || nfeProc;
    const infNFe = nfe.infNFe;

    if (!infNFe) {
      throw new Error('Tag infNFe não encontrada no XML');
    }

    const ide = infNFe.ide;
    const emit = infNFe.emit;
    const det = infNFe.det;
    const total = infNFe.total?.ICMSTot;

    if (!ide || !emit || !det || !total) {
      throw new Error('XML incompleto. Faltam tags obrigatórias (ide, emit, det ou total)');
    }

    // Extrair informações
    const chave = extrairChaveAcesso(nfeProc);
    const emitente = extrairEmitente(emit);
    const produtos = extrairProdutos(det);

    return {
      chave,
      numero: ide.nNF || '',
      serie: ide.serie || '',
      dataEmissao: new Date(ide.dhEmi || ide.dEmi),
      valorTotal: valorParaCentavos(total.vNF || '0'),
      emitente,
      produtos,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao fazer parsing do XML: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao fazer parsing do XML');
  }
}

/**
 * Valida se o XML é uma NF-e válida
 */
export function validarNFeXML(xmlContent: string): { valido: boolean; erro?: string } {
  try {
    // Verificações básicas
    if (!xmlContent || xmlContent.trim() === '') {
      return { valido: false, erro: 'XML vazio' };
    }

    if (!xmlContent.includes('<nfeProc') && !xmlContent.includes('<NFe')) {
      return { valido: false, erro: 'Não é um XML de NF-e válido' };
    }

    if (!xmlContent.includes('<infNFe')) {
      return { valido: false, erro: 'XML não contém tag infNFe' };
    }

    return { valido: true };
  } catch (error) {
    return { valido: false, erro: 'Erro ao validar XML: ' + (error as Error).message };
  }
}
