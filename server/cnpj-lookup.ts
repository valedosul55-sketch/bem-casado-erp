/**
 * Serviço de consulta de CNPJ
 * Usa Brasil API (gratuita) como fonte primária
 * Fallback para ReceitaWS se Brasil API falhar
 */

interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  uf: string;
  municipio?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  situacao?: string;
  inscricaoEstadual?: string;
}

interface BrasilAPIResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  uf: string;
  municipio: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  ddd_telefone_1: string;
  email: string;
  situacao_cadastral: string;
}

interface ReceitaWSResponse {
  cnpj: string;
  nome: string;
  fantasia: string;
  uf: string;
  municipio: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  telefone: string;
  email: string;
  situacao: string;
}

/**
 * Consulta CNPJ na Brasil API
 */
async function consultarBrasilAPI(cnpj: string): Promise<CNPJData | null> {
  try {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('[CNPJ Lookup] Brasil API retornou erro:', response.status);
      return null;
    }

    const data: BrasilAPIResponse = await response.json();

    return {
      cnpj: data.cnpj,
      razaoSocial: data.razao_social,
      nomeFantasia: data.nome_fantasia,
      uf: data.uf,
      municipio: data.municipio,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cep: data.cep,
      telefone: data.ddd_telefone_1,
      email: data.email,
      situacao: data.situacao_cadastral,
    };
  } catch (error) {
    console.error('[CNPJ Lookup] Erro ao consultar Brasil API:', error);
    return null;
  }
}

/**
 * Consulta CNPJ na ReceitaWS (fallback)
 */
async function consultarReceitaWS(cnpj: string): Promise<CNPJData | null> {
  try {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('[CNPJ Lookup] ReceitaWS retornou erro:', response.status);
      return null;
    }

    const data: ReceitaWSResponse = await response.json();

    // ReceitaWS retorna status: "ERROR" quando não encontra
    if ((data as any).status === 'ERROR') {
      console.log('[CNPJ Lookup] ReceitaWS não encontrou CNPJ');
      return null;
    }

    return {
      cnpj: data.cnpj,
      razaoSocial: data.nome,
      nomeFantasia: data.fantasia,
      uf: data.uf,
      municipio: data.municipio,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cep: data.cep,
      telefone: data.telefone,
      email: data.email,
      situacao: data.situacao,
    };
  } catch (error) {
    console.error('[CNPJ Lookup] Erro ao consultar ReceitaWS:', error);
    return null;
  }
}

/**
 * Consulta dados de CNPJ com fallback automático
 * Tenta Brasil API primeiro, depois ReceitaWS
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData | null> {
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  // Valida formato
  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  console.log('[CNPJ Lookup] Consultando CNPJ:', cnpjLimpo);

  // Tenta Brasil API primeiro
  let resultado = await consultarBrasilAPI(cnpjLimpo);
  
  if (resultado) {
    console.log('[CNPJ Lookup] ✅ Dados obtidos via Brasil API');
    return resultado;
  }

  // Fallback para ReceitaWS
  console.log('[CNPJ Lookup] Tentando fallback para ReceitaWS...');
  resultado = await consultarReceitaWS(cnpjLimpo);

  if (resultado) {
    console.log('[CNPJ Lookup] ✅ Dados obtidos via ReceitaWS');
    return resultado;
  }

  console.log('[CNPJ Lookup] ❌ CNPJ não encontrado em nenhuma API');
  return null;
}
