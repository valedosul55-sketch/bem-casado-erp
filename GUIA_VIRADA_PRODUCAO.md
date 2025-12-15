# 🚀 Guia de Virada para Produção - PDV Bem Casado

Este documento orienta como alterar o sistema do ambiente de **Homologação (Testes)** para **Produção (Validade Fiscal)**.

---

## 1. Quando fazer a virada?

Você deve realizar este procedimento apenas quando:
1.  A contabilidade confirmar que a empresa está **Credenciada na SEFAZ** para emissão de NFC-e em Produção.
2.  O Token de Produção da Focus NFe estiver ativo.
3.  Os testes em homologação estiverem satisfatórios.

## 2. Procedimento Técnico

Para ativar o modo de produção, é necessário editar o arquivo de configuração `.env` no servidor.

### Passo a Passo:

1.  Acesse o arquivo `.env` na raiz do projeto.
2.  Localize as variáveis `FOCUS_NFE_TOKEN` e `FOCUS_NFE_ENV`.
3.  Substitua pelos valores de produção:

**De (Homologação):**
```ini
FOCUS_NFE_TOKEN=BtkEw8Pzty7cvp2EMreGClE37QTRYP4z
FOCUS_NFE_ENV=homologation
```

**Para (Produção):**
```ini
FOCUS_NFE_TOKEN=MVt0ErNtzInzXPk4EvcQbPtR2jnTtZfk
FOCUS_NFE_ENV=production
```

4.  Reinicie o servidor para aplicar as alterações.

---

## 3. Checklist Pós-Virada

Após alterar para produção, realize a primeira venda real:
*   [ ] Emitir uma venda de valor baixo (ex: R$ 1,00).
*   [ ] Verificar se a nota foi autorizada.
*   [ ] Confirmar se o PDF foi gerado corretamente.
*   [ ] Verificar se a nota consta no portal da SEFAZ SP.

---

**Suporte:**
Em caso de erro "Emitente não habilitado", reverta para homologação e contate a contabilidade.
