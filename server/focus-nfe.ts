/**
 * Módulo de integração com Focus NFe API v2
 * Documentação: https://focusnfe.com.br/doc/
 */

import { eq } from 'drizzle-orm';
import { db } from './db'; // Assumindo que existe um arquivo de conexão com o banco
import { stores } from '../drizzle/schema';

function getFocusConfig() {
  const token = process.env.FOCUS_NFE_TOKEN;
  const baseUrl = process.env.FOCUS_NFE_ENV === 'production' 
    ? 'https://api.focusnfe.com.br'
    : 'https://homologacao.focusnfe.com.br';
    
  return { token, baseUrl };
}

interface FocusNFeItem {
  numero_item: string;
  codigo_produto: string;
  descricao: string;
  cfop: string;
  codigo_ncm: string;
  codigo_cest?: string; // Código Especificador da Substituição Tributária
  unidade_comercial: string;
  quantidade_comercial: number;
  valor_unitario_comercial: string;
  valor_bruto: string;
  icms_origem: string;
  icms_situacao_tributaria: string;
  icms_modalidade_base_calculo?: string;
  icms_base_calculo?: string;
  icms_aliquota?: string;
  icms_percentual_reducao?: string;
  icms_valor?: string;
}

interface FocusNFePayload {
  natureza_operacao: string;
  data_emissao: string;
  tipo_documento: string;
  finalidade_emissao: string;
  cnpj_emitente: string;
  inscricao_estadual_emitente?: string;
  nome_emitente?: string;
  nome_fantasia_emitente?: string;
  logradouro_emitente?: string;
  numero_emitente?: string;
  complemento_emitente?: string;
  bairro_emitente?: string;
  municipio_emitente?: string;
  uf_emitente?: string;
  cep_emitente?: string;
  telefone_emitente?: string;
  cnae_fiscal_emitente?: string;
  regime_tributario_emitente?: string;
  modalidade_frete: string;
  numero?: string;
  itens: FocusNFeItem[];
  formas_pagamento: Array<{
    forma_pagamento: string;
    valor_pagamento: string;
  }>;
  consumidor_final?: string;
  presenca_comprador?: string;
  cpf_destinatario?: string;
  cnpj_destinatario?: string;
  inscricao_estadual_destinatario?: string;
  cep_destinatario?: string;
  logradouro_destinatario?: string;
  numero_destinatario?: string;
  bairro_destinatario?: string;
  municipio_destinatario?: string;
  uf_destinatario?: string;
  telefone_destinatario?: string;
  email_destinatario?: string;
  nome_destinatario?: string;
}

interface FocusNFeResponse {
  status: 'autorizado' | 'erro_autorizacao' | 'processando';
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_nfe?: string;
  numero?: string;
  serie?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  qrcode_url?: string;
  url_consulta_nf?: string;
  ref?: string; // Referência da nota
  erros?: Array<{
    codigo: string;
    mensagem: string;
    campo?: string;
  }>;
}

/**
 * Emite uma NFC-e através da API do Focus NFe
 */
export async function emitirNFCe(
  items: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    preco: number;
    ncm?: string; // Código NCM do produto
  }>,
  total: number,
  cpfCliente?: string,
  nomeCliente?: string,
  inscricaoEstadual?: string, // Inscrição Estadual (apenas para CNPJ contribuinte)
  uf?: string, // UF do destinatário
  formaPagamento: string = '01', // 01=Dinheiro por padrão
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    cep: string;
  },
  numeroNota?: string,
  storeId?: number // ID da loja emitente (opcional, usa Matriz se não informado)
): Promise<FocusNFeResponse> {
  const { token: FOCUS_NFE_TOKEN, baseUrl: FOCUS_NFE_BASE_URL } = getFocusConfig();
  if (!FOCUS_NFE_TOKEN) {
    throw new Error('FOCUS_NFE_TOKEN não configurado');
  }

  // Busca dados da loja no banco de dados
  let store;
  if (storeId) {
    const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    store = storeResult[0];
  } else {
    // Se não informou loja, busca a Matriz (primeira loja ativa)
    const storeResult = await db.select().from(stores).where(eq(stores.active, 1)).limit(1);
    store = storeResult[0];
  }

  if (!store) {
    throw new Error('Nenhuma loja encontrada para emissão da nota');
  }

  console.log(`[Focus NFe] Emitindo nota pela loja: ${store.name} (CNPJ: ${store.cnpj})`);

  // Gera referência única com data/hora
  const { generateNFCeReference } = await import('./id-generator');
  const referencia = generateNFCeReference();

  // Monta payload da NFC-e com dados dinâmicos da loja
  const payload: FocusNFePayload = {
    natureza_operacao: 'Venda de mercadoria',
    data_emissao: new Date().toISOString(),
    tipo_documento: '1', // 1=Saída
    finalidade_emissao: '1', // 1=Normal
    cnpj_emitente: store.cnpj, // CNPJ da loja
    inscricao_estadual_emitente: store.ie || undefined, // IE da loja
    nome_emitente: 'INDUSTRIA E COMERCIO DE ALIMENTOS BEM CASADO LTDA', // Razão Social (pode vir do banco futuramente)
    nome_fantasia_emitente: store.name, // Nome Fantasia
    logradouro_emitente: store.address?.split(',')[0] || 'ENDERECO NAO CADASTRADO',
    numero_emitente: store.address?.split(',')[1]?.trim() || 'S/N',
    bairro_emitente: 'BAIRRO', // Idealmente viria do banco
    municipio_emitente: store.city || 'CIDADE',
    uf_emitente: store.state || 'SP',
    cep_emitente: store.zipCode || '00000000',
    regime_tributario_emitente: '3', // 3=Regime Normal - Lucro Real
    consumidor_final: '1', // 1=Consumidor final
    presenca_comprador: '1', // 1=Operação presencial
    modalidade_frete: '9', // 9=Sem frete (venda presencial)
    ...(numeroNota ? { numero: numeroNota } : {}),
    itens: items.map((item, index) => {
      // Identifica tipo de produto pelo NCM
      const ncm = item.ncm || '10063021';
      const isAcucar = ncm === '17019900';
      const isArrozOuFeijao = ncm === '10063021' || ncm === '07133399';
      
      // Açúcar: CST 060 (ICMS ST já recolhido)
      if (isAcucar) {
        // CST 060 - sem destaque de ICMS
      }
      
      // Arroz/Feijão: Determina tributação baseado em Inscrição Estadual
      // ISENTO: sem CPF/CNPJ, com CPF, ou CNPJ sem IE
      // BASE REDUZIDA 7%: CNPJ com IE (contribuinte do ICMS)
      const isCnpj = cpfCliente && cpfCliente.length === 14;
      const temInscricaoEstadual = !!inscricaoEstadual && inscricaoEstadual.toUpperCase() !== 'ISENTO';
      const isContribuinte = isCnpj && temInscricaoEstadual;
      const isIsento = isArrozOuFeijao && !isContribuinte;
      
      const valorBruto = item.quantidade * item.preco;
      
      return {
        numero_item: String(index + 1),
        codigo_produto: item.codigo,
        descricao: item.descricao,
        // CFOP: 5405 para ST (açúcar), 5102 para arroz/feijão
        cfop: isAcucar ? '5405' : '5102',
        codigo_ncm: ncm,
        codigo_cest: isAcucar ? '1710100' : undefined, // CEST Açúcar Cristal
        unidade_comercial: 'UN',
        quantidade_comercial: item.quantidade,
        valor_unitario_comercial: item.preco.toFixed(2),
        valor_bruto: valorBruto.toFixed(2),
        icms_origem: '0', // 0=Nacional
        // CST: 60=ICMS ST, 40=Isenta, 20=Com redução de base
        icms_situacao_tributaria: isAcucar ? '60' : (isIsento ? '40' : '20'),
        ...(isAcucar ? {
          // Açúcar: CST 060 - ICMS cobrado anteriormente por ST
          // Sem destaque de ICMS (já recolhido na origem)
        } : isIsento ? {
          // Arroz/Feijão isento - sem cálculo de ICMS
        } : {
          // Arroz/Feijão com base reduzida (7% efetivo)
          icms_modalidade_base_calculo: '3', // 3=Valor da operação
          icms_base_calculo: (valorBruto * 0.3889).toFixed(2), // Base tributável 38.89%
          icms_aliquota: '18.00', // Alíquota ICMS 18%
          icms_percentual_reducao: '61.11', // Redução de 61.11%
          icms_valor: (valorBruto * 0.3889 * 0.18).toFixed(2) // 7% efetivo
        })
      };
    }),
    formas_pagamento: [
      {
        forma_pagamento: formaPagamento,
        valor_pagamento: total.toFixed(2)
      }
    ]
  };

  // Adiciona CPF ou CNPJ do cliente se informado
  if (cpfCliente) {
    if (cpfCliente.length === 11) {
      payload.cpf_destinatario = cpfCliente;
    } else if (cpfCliente.length === 14) {
      payload.cnpj_destinatario = cpfCliente;
      
      // Adiciona IE se informada (apenas para CNPJ)
      if (inscricaoEstadual && inscricaoEstadual.toUpperCase() !== 'ISENTO') {
        payload.inscricao_estadual_destinatario = inscricaoEstadual;
      }
    }
  }

  // Adiciona UF do destinatário se informado
  if (uf) {
    payload.uf_destinatario = uf.toUpperCase();
  }

  // Adiciona endereço completo se informado (Obrigatório para CNPJ)
  if (endereco) {
    payload.logradouro_destinatario = endereco.logradouro;
    payload.numero_destinatario = endereco.numero;
    payload.bairro_destinatario = endereco.bairro;
    payload.municipio_destinatario = endereco.municipio;
    payload.cep_destinatario = endereco.cep;
  }
  // Adiciona nome do cliente se informado E se tiver documento (regra da NFC-e)
  if (nomeCliente && (cpfCliente || payload.cnpj_destinatario)) {
    payload.nome_destinatario = nomeCliente;
  }

  console.log('[Focus NFe] Emitindo NFC-e...');
  console.log('[Focus NFe] Referência:', referencia);
  console.log('[Focus NFe] Total:', total);
  console.log('[Focus NFe] Items:', items.length);

  try {
    // Envia requisição para Focus NFe
    const response = await fetch(
      `${FOCUS_NFE_BASE_URL}/v2/nfce?ref=${referencia}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${FOCUS_NFE_TOKEN}:`).toString('base64')}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data: FocusNFeResponse = await response.json();

    if (!response.ok) {
      console.error('[Focus NFe] Erro na emissão:', JSON.stringify(data, null, 2));
      console.error('[Focus NFe] Status HTTP:', response.status);
      console.error('[Focus NFe] Payload enviado:', JSON.stringify(payload, null, 2));
      throw new Error(data.erros?.[0]?.mensagem || JSON.stringify(data) || 'Erro ao emitir NFC-e');
    }

    console.log('[Focus NFe] ✅ NFC-e emitida com sucesso!');
    console.log('[Focus NFe] Status:', data.status);
    console.log('[Focus NFe] Número:', data.numero);
    console.log('[Focus NFe] Chave:', data.chave_nfe);

    // Adiciona referência ao retorno
    return {
      ...data,
      ref: referencia
    };
  } catch (error) {
    console.error('[Focus NFe] Erro:', error);
    throw error;
  }
}

/**
 * Envia DANFE por email
 */
export async function enviarDanfePorEmail(
  referencia: string,
  emails: string[]
): Promise<void> {
  const { token: FOCUS_NFE_TOKEN, baseUrl: FOCUS_NFE_BASE_URL } = getFocusConfig();
  if (!FOCUS_NFE_TOKEN) {
    throw new Error('FOCUS_NFE_TOKEN não configurado');
  }

  console.log('[Focus NFe] Enviando DANFE por email...');
  console.log('[Focus NFe] Referência:', referencia);
  console.log('[Focus NFe] Emails:', emails);

  try {
    const response = await fetch(
      `${FOCUS_NFE_BASE_URL}/v2/nfce/${referencia}/email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${FOCUS_NFE_TOKEN}:`).toString('base64')}`
        },
        body: JSON.stringify({ emails })
      }
    );

    if (!response.ok) {
      const data = await response.json();
      console.error('[Focus NFe] Erro ao enviar email:', data);
      throw new Error('Erro ao enviar DANFE por email');
    }

    console.log('[Focus NFe] ✅ DANFE enviado por email com sucesso!');
  } catch (error) {
    console.error('[Focus NFe] Erro ao enviar email:', error);
    throw error;
  }
}

/**
 * Consulta status de uma NFC-e
 */
export async function consultarNFCe(referencia: string): Promise<FocusNFeResponse> {
  const { token: FOCUS_NFE_TOKEN, baseUrl: FOCUS_NFE_BASE_URL } = getFocusConfig();
  if (!FOCUS_NFE_TOKEN) {
    throw new Error('FOCUS_NFE_TOKEN não configurado');
  }

  const response = await fetch(
    `${FOCUS_NFE_BASE_URL}/v2/nfce/${referencia}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${FOCUS_NFE_TOKEN}:`).toString('base64')}`
      }
    }
  );

  const data: FocusNFeResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.erros?.[0]?.mensagem || 'Erro ao consultar NFC-e');
  }

  return data;
}
