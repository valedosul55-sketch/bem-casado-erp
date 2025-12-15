# Documentação: Cadastro Rápido de Produtos

## Comportamento Esperado

### Fluxo Principal

1. **Usuário escane código de barras** na página "Entrada/Saída Rápida"
2. **Sistema busca produto** no banco de dados pelo EAN13
3. **Três cenários possíveis:**

#### Cenário A: Produto Encontrado ✅
- Sistema exibe card verde com dados do produto
- Usuário pode fazer movimentação de estoque (entrada/saída)
- Formulário de cadastro **NÃO** aparece

#### Cenário B: Produto Não Encontrado (null) 📝
- Sistema exibe toast informativo: "Produto não encontrado - Cadastre agora!"
- **Formulário de cadastro rápido aparece automaticamente**
- EAN13 já está preenchido no formulário
- Usuário preenche: Nome, Preço, Marca, Categoria, Unidade
- Ao salvar, produto é cadastrado e fica disponível imediatamente

#### Cenário C: Erro na Busca (catch) ⚠️
- Sistema trata como "produto não encontrado"
- Exibe toast informativo: "Produto não encontrado - Cadastre agora!"
- **Formulário de cadastro rápido aparece automaticamente**
- Mesmo comportamento do Cenário B

---

## Implementação Técnica

### Código Crítico

```typescript
const handleBarcodeSubmit = async () => {
  try {
    const product = await trpc.stockMovements.getByBarcode.query({ 
      barcode: barcode.trim() 
    });
    
    if (product) {
      // Cenário A: Produto encontrado
      setScannedProduct(product);
      toast.success(`Produto encontrado: ${product.name}`);
      setShowQuickRegister(false);  // ❌ NÃO mostrar formulário
    } else {
      // Cenário B: Produto não encontrado (null)
      toast.info('Produto não encontrado - Cadastre agora!');
      setScannedProduct(null);
      setShowQuickRegister(true);  // ✅ MOSTRAR formulário
    }
  } catch (error) {
    // Cenário C: Erro na busca
    toast.info('Produto não encontrado - Cadastre agora!');
    setScannedProduct(null);
    setShowQuickRegister(true);  // ✅ MOSTRAR formulário
  }
};
```

### Estado do Componente

```typescript
const [showQuickRegister, setShowQuickRegister] = useState(false);
```

- `true` → Formulário visível
- `false` → Formulário escondido

### Renderização Condicional

```typescript
{showQuickRegister && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    {/* Formulário de cadastro */}
  </div>
)}
```

---

## Bug Corrigido

### Problema Original

Quando o produto não existia, o backend lançava um **erro** (catch), e o código original apenas exibia:

```typescript
catch (error) {
  toast.error('Erro ao buscar produto');  // ❌ Não mostrava formulário
  setScannedProduct(null);
  // setShowQuickRegister estava FALTANDO!
}
```

### Solução Implementada

Agora o `catch` trata erro como "produto não encontrado" e **mostra o formulário**:

```typescript
catch (error) {
  toast.info('Produto não encontrado - Cadastre agora!');  // ✅ Mensagem positiva
  setScannedProduct(null);
  setShowQuickRegister(true);  // ✅ MOSTRA formulário
}
```

---

## Testes Automatizados

### Casos de Teste

1. ✅ **Produto não encontrado (null)** → Formulário aparece
2. ✅ **Erro na busca (catch)** → Formulário aparece
3. ✅ **Produto encontrado** → Formulário NÃO aparece

### Executar Testes

```bash
pnpm test AdminQuickStock
```

---

## Prevenção de Regressão

### Checklist para Futuras Modificações

Antes de modificar `AdminQuickStock.tsx`, verificar:

- [ ] `setShowQuickRegister(true)` está presente no `catch`
- [ ] `setShowQuickRegister(true)` está presente no `else` (produto null)
- [ ] `setShowQuickRegister(false)` está presente no `if` (produto encontrado)
- [ ] Testes automatizados estão passando
- [ ] Comportamento testado manualmente em produção

### Commits Relacionados

- `0316a11` - fix: Mostrar formulário de cadastro quando der erro ao buscar produto
- `7aff756` - chore: Force rebuild to clear Railway cache
- `2ea2d23` - feat: Adicionar cadastro rápido de produtos no Entrega Rápida

---

## Contato

Para dúvidas ou problemas, contatar o time de desenvolvimento.

**Data da última atualização:** 2025-12-13
