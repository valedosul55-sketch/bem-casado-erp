import axios from 'axios';

/**
 * Módulo de integração com Tiny ERP para emissão de NFC-e
 * Documentação: https://tiny.com.br/api-docs
 */

const TINY_API_URL = 'https://api.tiny.com.br/api2';
const TINY_TOKEN = process.env.TINY_ERP_TOKEN || '9e1a0f4f0b1b509593ab08f33555404317050d8f98a5b6affc2a45a18ce69a6dtoken';

interface TinyProduct {
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
}

interface TinySale {
  cliente: {
    nome: string;
    cpf_cnpj?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
  itens: TinyProduct[];
  valor_total: number;
}

interface TinyNFCeResponse {
  retorno: {
    status_processamento: string;
    status: string;
    codigo_erro?: string;
    erros?: Array<{ erro: string }>;
    registros?: Array<{
      registro: {
        numero: string;
        serie: string;
        chave_acesso: string;
        url_danfe: string;
        xml: string;
      };
    }>;
  };
}

/**
 * Emite NFC-e através da API do Tiny ERP
 */
export async function emitirNFCe(sale: TinySale): Promise<TinyNFCeResponse> {
  try {
    // Monta o XML da nota conforme documentação do Tiny
    const notaXML = `
      <nota_fiscal>
        <natureza_operacao>Venda de mercadoria</natureza_operacao>
        <tipo_documento>S</tipo_documento>
        <finalidade_emissao>1</finalidade_emissao>
        <cliente>
          <nome>${sale.cliente.nome}</nome>
          ${sale.cliente.cpf_cnpj ? `<cpf_cnpj>${sale.cliente.cpf_cnpj}</cpf_cnpj>` : ''}
          ${sale.cliente.endereco ? `<endereco>${sale.cliente.endereco}</endereco>` : ''}
          ${sale.cliente.numero ? `<numero>${sale.cliente.numero}</numero>` : ''}
          ${sale.cliente.bairro ? `<bairro>${sale.cliente.bairro}</bairro>` : ''}
          ${sale.cliente.cidade ? `<cidade>${sale.cliente.cidade}</cidade>` : ''}
          ${sale.cliente.uf ? `<uf>${sale.cliente.uf}</uf>` : ''}
          ${sale.cliente.cep ? `<cep>${sale.cliente.cep}</cep>` : ''}
        </cliente>
        <itens>
          ${sale.itens.map(item => `
            <item>
              <codigo>${item.codigo}</codigo>
              <descricao>${item.descricao}</descricao>
              <unidade>${item.unidade}</unidade>
              <quantidade>${item.quantidade}</quantidade>
              <valor_unitario>${item.valor_unitario.toFixed(2)}</valor_unitario>
            </item>
          `).join('')}
        </itens>
      </nota_fiscal>
    `;

    console.log('[Tiny ERP] Enviando requisição para:', `${TINY_API_URL}/nota.fiscal.incluir.php`);
    console.log('[Tiny ERP] Token:', TINY_TOKEN.substring(0, 20) + '...');
    console.log('[Tiny ERP] XML da nota:', notaXML.substring(0, 200) + '...');

    // Envia requisição para API do Tiny com timeout
    // Primeiro INCLUI a nota, depois EMITE
    const response = await axios.post(
      `${TINY_API_URL}/nota.fiscal.incluir.php`,
      `token=${encodeURIComponent(TINY_TOKEN)}&nota=${encodeURIComponent(notaXML)}&formato=json`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000 // 30 segundos
      }
    );

    console.log('[Tiny ERP] Resposta recebida:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('[Tiny ERP] Erro detalhado:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout ao conectar com Tiny ERP');
    }
    
    if (error.response) {
      throw new Error(`Erro do Tiny ERP: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    throw new Error(`Falha ao emitir NFC-e: ${error.message}`);
  }
}

/**
 * Consulta status de uma NFC-e emitida
 */
export async function consultarNFCe(numeroNota: string): Promise<TinyNFCeResponse> {
  try {
    const response = await axios.post(
      `${TINY_API_URL}/nota.fiscal.obter.php`,
      {
        token: TINY_TOKEN,
        numero: numeroNota,
        formato: 'json'
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao consultar NFC-e no Tiny:', error);
    throw new Error('Falha ao consultar NFC-e');
  }
}

/**
 * Baixa o DANFE (PDF) de uma NFC-e
 */
export async function baixarDANFE(chaveAcesso: string): Promise<Buffer> {
  try {
    const response = await axios.get(
      `${TINY_API_URL}/nota.fiscal.obter.danfe.php`,
      {
        params: {
          token: TINY_TOKEN,
          chave: chaveAcesso,
          formato: 'pdf'
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Erro ao baixar DANFE do Tiny:', error);
    throw new Error('Falha ao baixar DANFE');
  }
}
