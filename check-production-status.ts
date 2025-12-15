
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

async function checkProductionStatus() {
  const token = process.env.FOCUS_NFE_TOKEN;
  const env = process.env.FOCUS_NFE_ENV;
  
  console.log(`🚀 Verificando conexão com Focus NFe [${env?.toUpperCase()}]`);
  
  if (!token) {
    console.error('❌ Token não configurado!');
    return;
  }

  const baseUrl = 'https://api.focusnfe.com.br'; // URL de Produção

  try {
    // Tentar listar Hooks (Webhooks) - Rota leve que exige autenticação
    console.log('📡 Testando autenticação (Listar Hooks)...');
    
    const response = await fetch(
      `${baseUrl}/v2/hooks`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão com Produção: SUCESSO!');
      console.log('🏢 Empresa:', data.nome);
      console.log('🆔 CNPJ:', data.cnpj);
      console.log('📊 Status:', data.status);
      console.log('📜 Regime:', data.regime_tributario);
    } else {
      console.error('❌ Falha na autenticação ou empresa não encontrada.');
      console.error('Status:', response.status);
      const error = await response.text();
      console.error('Erro:', error);
    }

  } catch (error: any) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

checkProductionStatus();
