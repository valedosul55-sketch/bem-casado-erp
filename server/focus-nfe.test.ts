import { describe, it, expect } from 'vitest';

describe('Focus NFe API', () => {
  it('deve ter token configurado', () => {
    expect(process.env.FOCUS_NFE_TOKEN).toBeDefined();
    expect(process.env.FOCUS_NFE_TOKEN).not.toBe('');
  });

  it('deve ter CNPJ configurado', () => {
    expect(process.env.CNPJ_EMPRESA).toBeDefined();
    expect(process.env.CNPJ_EMPRESA).toBe('14295537000130');
  });

  it('deve ter ambiente configurado', () => {
    expect(process.env.FOCUS_NFE_ENV).toBeDefined();
    expect(['homologacao', 'production']).toContain(process.env.FOCUS_NFE_ENV);
  });

  it('deve ter CSC (Código de Segurança do Contribuinte) configurado', () => {
    expect(process.env.FOCUS_NFE_CSC).toBeDefined();
    expect(process.env.FOCUS_NFE_CSC).not.toBe('');
    // Verifica formato UUID
    expect(process.env.FOCUS_NFE_CSC).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('deve ter ID do Token CSC configurado', () => {
    expect(process.env.FOCUS_NFE_CSC_ID).toBeDefined();
    expect(process.env.FOCUS_NFE_CSC_ID).not.toBe('');
    // Verifica formato numérico com zeros à esquerda (6 dígitos)
    expect(process.env.FOCUS_NFE_CSC_ID).toMatch(/^\d{6}$/);
  });

  it('deve validar autenticação com Focus NFe', async () => {
    const token = process.env.FOCUS_NFE_TOKEN;
    const baseUrl = process.env.FOCUS_NFE_ENV === 'production'
      ? 'https://api.focusnfe.com.br'
      : 'https://homologacao.focusnfe.com.br';

    // Tenta consultar uma nota que não existe (apenas para validar autenticação)
    const response = await fetch(
      `${baseUrl}/v2/nfce/TEST_AUTH_${Date.now()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}`
        }
      }
    );

    // Esperamos 404 (não encontrado) ou 200 (encontrado)
    // Qualquer outro código significa problema de autenticação
    expect([200, 404]).toContain(response.status);
    
    // Se retornar 403 ou 401, significa que o token está inválido
    expect(response.status).not.toBe(403);
    expect(response.status).not.toBe(401);
  }, 10000); // Timeout de 10 segundos
});
