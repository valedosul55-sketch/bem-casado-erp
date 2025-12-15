import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

async function listarUltimasNotas() {
  const token = process.env.FOCUS_NFE_TOKEN;
  const baseUrl = process.env.FOCUS_NFE_ENV === 'production' 
    ? 'https://api.focusnfe.com.br'
    : 'https://homologacao.focusnfe.com.br';

  console.log('=== CONSULTANDO ÚLTIMAS NOTAS EM PRODUÇÃO ===');
  console.log('Ambiente:', process.env.FOCUS_NFE_ENV);

  try {
    // Consulta as últimas 50 notas emitidas
    const response = await fetch(
      `${baseUrl}/v2/nfce?offset=0&limit=50`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`
        }
      }
    );

    if (!response.ok) {
      console.error('Erro ao consultar notas:', response.status, response.statusText);
      const data = await response.json();
      console.error('Detalhes:', JSON.stringify(data, null, 2));
      return;
    }

    const notas = await response.json();
    
    console.log(`\nEncontradas ${notas.length} notas.`);
    
    // Filtra apenas as autorizadas ou canceladas (que consumiram número)
    const notasValidas = notas.filter((n: any) => 
      ['autorizado', 'cancelado', 'processando_autorizacao'].includes(n.status)
    );

    console.log('\n--- ÚLTIMAS NOTAS VÁLIDAS ---');
    notasValidas.forEach((n: any) => {
      console.log(`Número: ${n.numero} | Série: ${n.serie} | Status: ${n.status} | Data: ${n.data_emissao}`);
    });

    // Encontra o maior número
    const maiorNumero = notasValidas.reduce((max: number, n: any) => {
      const num = parseInt(n.numero || '0');
      return num > max ? num : max;
    }, 0);

    console.log(`\n>>> MAIOR NÚMERO ENCONTRADO: ${maiorNumero}`);
    console.log(`>>> PRÓXIMO NÚMERO SUGERIDO: ${maiorNumero + 1}`);

  } catch (error: any) {
    console.error('Erro na execução:', error.message);
  }
}

listarUltimasNotas();
