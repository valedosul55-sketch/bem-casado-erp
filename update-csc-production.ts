
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

async function updateCSC() {
  // Token Principal de Produção (Master)
  const token = 'pzAT7aPQuhus5SF6ceMenbom6hkyIOHK'; 
  const cnpj = '14295537000130';
  
  // Dados do Excel
  const cscId = '1'; // ID 000001 -> 1
  const cscCodigo = '64ec579e-65eb-48f9-b2ef-42fc57984476';

  console.log(`🚀 Atualizando CSC para CNPJ ${cnpj} em PRODUÇÃO...`);

  const baseUrl = 'https://api.focusnfe.com.br';

  try {
    // Endpoint para atualizar dados da empresa (incluindo CSC)
    const response = await fetch(
      `${baseUrl}/v2/empresas/${cnpj}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          csc_nfce_producao: cscCodigo,
          id_token_nfce_producao: cscId
        })
      }
    );

    if (response.ok) {
      console.log('✅ CSC Atualizado com Sucesso!');
    } else {
      console.error('❌ Falha ao atualizar CSC.');
      console.error('Status:', response.status);
      const error = await response.text();
      console.error('Erro:', error);
    }

  } catch (error: any) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

updateCSC();
