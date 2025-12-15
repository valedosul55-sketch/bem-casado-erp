import { describe, it, expect } from 'vitest';
import { parseNFeXML, validarNFeXML } from '../nfeParser';

describe('NF-e Parser', () => {
  describe('validarNFeXML', () => {
    it('deve rejeitar XML vazio', () => {
      const result = validarNFeXML('');
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('vazio');
    });

    it('deve rejeitar XML sem tag nfeProc ou NFe', () => {
      const xmlInvalido = '<root><data>test</data></root>';
      const result = validarNFeXML(xmlInvalido);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('NF-e válido');
    });

    it('deve rejeitar XML sem tag infNFe', () => {
      const xmlSemInfNFe = '<nfeProc><NFe><teste>data</teste></NFe></nfeProc>';
      const result = validarNFeXML(xmlSemInfNFe);
      expect(result.valido).toBe(false);
      expect(result.erro).toContain('infNFe');
    });

    it('deve aceitar XML com estrutura básica de NF-e', () => {
      const xmlValido = `
        <nfeProc>
          <NFe>
            <infNFe>
              <ide><nNF>123</nNF></ide>
            </infNFe>
          </NFe>
        </nfeProc>
      `;
      const result = validarNFeXML(xmlValido);
      expect(result.valido).toBe(true);
      expect(result.erro).toBeUndefined();
    });
  });

  describe('parseNFeXML', () => {
    it('deve lançar erro para XML inválido', async () => {
      const xmlInvalido = '<root>invalid</root>';
      await expect(parseNFeXML(xmlInvalido)).rejects.toThrow();
    });

    it('deve parsear XML básico de NF-e', async () => {
      const xmlBasico = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe35240112345678901234550010000000011234567890">
      <ide>
        <nNF>1</nNF>
        <serie>1</serie>
        <dhEmi>2024-01-01T10:00:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678901234</CNPJ>
        <xNome>Fornecedor Teste LTDA</xNome>
        <xFant>Fornecedor Teste</xFant>
        <enderEmit>
          <xLgr>Rua Teste</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234567</CEP>
        </enderEmit>
      </emit>
      <det>
        <prod>
          <cProd>001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Produto Teste</xProd>
          <NCM>12345678</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>10.00</qCom>
          <vUnCom>5.50</vUnCom>
          <vProd>55.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vNF>55.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <chNFe>35240112345678901234550010000000011234567890</chNFe>
    </infProt>
  </protNFe>
</nfeProc>`;

      const result = await parseNFeXML(xmlBasico);

      // Verificar informações básicas
      expect(result.chave).toBe('35240112345678901234550010000000011234567890');
      expect(result.numero).toBe('1');
      expect(result.serie).toBe('1');
      expect(result.valorTotal).toBe(5500); // 55.00 em centavos

      // Verificar emitente
      expect(result.emitente.cnpj).toBe('12345678901234');
      expect(result.emitente.razaoSocial).toBe('Fornecedor Teste LTDA');
      expect(result.emitente.nomeFantasia).toBe('Fornecedor Teste');

      // Verificar produtos
      expect(result.produtos).toHaveLength(1);
      expect(result.produtos[0].codigo).toBe('001');
      expect(result.produtos[0].ean).toBe('7891234567890');
      expect(result.produtos[0].descricao).toBe('Produto Teste');
      expect(result.produtos[0].quantidade).toBe(10);
      expect(result.produtos[0].valorUnitario).toBe(550); // 5.50 em centavos
      expect(result.produtos[0].valorTotal).toBe(5500); // 55.00 em centavos
    });

    it('deve tratar múltiplos produtos', async () => {
      const xmlMultiplosProdutos = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe35240112345678901234550010000000021234567890">
      <ide>
        <nNF>2</nNF>
        <serie>1</serie>
        <dhEmi>2024-01-02T10:00:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678901234</CNPJ>
        <xNome>Fornecedor Teste LTDA</xNome>
        <enderEmit>
          <xLgr>Rua Teste</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234567</CEP>
        </enderEmit>
      </emit>
      <det>
        <prod>
          <cProd>001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Produto A</xProd>
          <NCM>12345678</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>5.00</qCom>
          <vUnCom>10.00</vUnCom>
          <vProd>50.00</vProd>
        </prod>
      </det>
      <det>
        <prod>
          <cProd>002</cProd>
          <cEAN>7891234567891</cEAN>
          <xProd>Produto B</xProd>
          <NCM>12345679</NCM>
          <CFOP>5102</CFOP>
          <uCom>KG</uCom>
          <qCom>2.50</qCom>
          <vUnCom>20.00</vUnCom>
          <vProd>50.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vNF>100.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <chNFe>35240112345678901234550010000000021234567890</chNFe>
    </infProt>
  </protNFe>
</nfeProc>`;

      const result = await parseNFeXML(xmlMultiplosProdutos);

      expect(result.produtos).toHaveLength(2);
      expect(result.produtos[0].descricao).toBe('Produto A');
      expect(result.produtos[1].descricao).toBe('Produto B');
      expect(result.produtos[1].unidade).toBe('KG');
    });

    it('deve tratar produto sem EAN (SEM GTIN)', async () => {
      const xmlSemEAN = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe35240112345678901234550010000000031234567890">
      <ide>
        <nNF>3</nNF>
        <serie>1</serie>
        <dhEmi>2024-01-03T10:00:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678901234</CNPJ>
        <xNome>Fornecedor Teste LTDA</xNome>
        <enderEmit>
          <xLgr>Rua Teste</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234567</CEP>
        </enderEmit>
      </emit>
      <det>
        <prod>
          <cProd>999</cProd>
          <cEAN>SEM GTIN</cEAN>
          <xProd>Produto Sem Código de Barras</xProd>
          <NCM>12345678</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>1.00</qCom>
          <vUnCom>15.00</vUnCom>
          <vProd>15.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vNF>15.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <chNFe>35240112345678901234550010000000031234567890</chNFe>
    </infProt>
  </protNFe>
</nfeProc>`;

      const result = await parseNFeXML(xmlSemEAN);

      expect(result.produtos[0].ean).toBeNull();
      expect(result.produtos[0].descricao).toBe('Produto Sem Código de Barras');
    });
  });
});
