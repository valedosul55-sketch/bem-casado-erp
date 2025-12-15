import { describe, it, expect } from 'vitest';
import { emitirNFCe } from './tiny-erp';

describe('Tiny ERP Integration', () => {
  it('deve tentar emitir NFC-e e capturar resposta', async () => {
    const saleData = {
      cliente: {
        nome: 'CONSUMIDOR FINAL',
      },
      itens: [
        {
          codigo: '7896285902176',
          descricao: 'Açúcar Cristal',
          unidade: 'UN',
          quantidade: 1,
          valor_unitario: 29.90,
        },
      ],
      valor_total: 29.90,
    };

    try {
      console.log('\n🧪 Testando emissão de NFC-e no Tiny ERP...\n');
      const result = await emitirNFCe(saleData);
      console.log('\n✅ Resultado:', JSON.stringify(result, null, 2));
      
      // Se chegou aqui, a chamada funcionou
      expect(result).toBeDefined();
      expect(result.retorno).toBeDefined();
    } catch (error: any) {
      console.error('\n❌ Erro capturado:', error.message);
      console.error('Stack:', error.stack);
      
      // Vamos falhar o teste para ver o erro completo
      throw error;
    }
  }, 60000); // 60 segundos de timeout
});
