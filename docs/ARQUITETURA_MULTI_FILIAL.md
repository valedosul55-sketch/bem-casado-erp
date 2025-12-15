# 🏗️ Arquitetura Multi-Filial - Loja Bem Casado

## 📋 Visão Geral

O sistema **Loja Bem Casado** foi projetado desde o início com arquitetura **centralizada e escalável** para suportar múltiplas filiais sem necessidade de duplicação de estrutura.

### ✅ Princípio Fundamental

**VOCÊ NÃO PRECISA COPIAR NADA!**

- ✅ **1 banco de dados** para todas as filiais
- ✅ **1 aplicação** servindo todas as lojas
- ✅ **Dados compartilhados** (produtos, clientes, usuários)
- ✅ **Dados isolados** (estoque, vendas, NF-e por filial)

---

## 🎯 Modelo de Dados Multi-Filial

### 1️⃣ **Dados GLOBAIS (Compartilhados)**

Estes dados são **únicos** e **compartilhados** entre todas as filiais:

```typescript
// Tabela: products
// - Catálogo de produtos único
// - Preços podem ser iguais ou diferentes por filial (via configuração)
// - EAN, NCM, CEST são os mesmos em todo Brasil

products {
  id: 1,
  name: "Arroz Integral Bem Casado 1kg",
  ean13: "7891234567890",
  ncm: "10063021",
  price: 1290, // R$ 12,90 (pode ser sobrescrito por filial)
  averageCost: 850, // Custo médio global
  active: 1
}
```

```typescript
// Tabela: users
// - Usuários podem acessar múltiplas filiais
// - Permissões por filial (futuro)

users {
  id: 1,
  name: "João Silva",
  email: "joao@bemcasado.com.br",
  role: "admin" // Pode gerenciar todas as filiais
}
```

### 2️⃣ **Dados POR FILIAL (Isolados)**

Estes dados são **específicos** de cada filial:

```typescript
// Tabela: stores
// - Cada filial tem seu próprio registro
// - CNPJ único por filial
// - Configurações fiscais independentes

stores {
  id: 1,
  name: "Matriz - São Paulo",
  cnpj: "12345678000190",
  ie: "123456789",
  city: "São Paulo",
  state: "SP",
  active: 1
}

stores {
  id: 2,
  name: "Filial - Rio de Janeiro",
  cnpj: "12345678000271",
  ie: "987654321",
  city: "Rio de Janeiro",
  state: "RJ",
  active: 1
}
```

```typescript
// Tabela: productStocks
// - Estoque INDEPENDENTE por filial
// - Mesmo produto pode ter quantidades diferentes

productStocks {
  id: 1,
  productId: 1, // Arroz Integral
  storeId: 1,   // Matriz SP
  quantity: 500,
  minStock: 100,
  location: "Corredor A, Prateleira 3"
}

productStocks {
  id: 2,
  productId: 1, // Mesmo produto
  storeId: 2,   // Filial RJ
  quantity: 200, // Quantidade diferente
  minStock: 50,
  location: "Setor B, Estante 5"
}
```

```typescript
// Tabela: orders
// - Vendas vinculadas à filial

orders {
  id: 1,
  storeId: 1, // Venda na Matriz SP
  customerName: "Maria Santos",
  finalAmount: 5000,
  paymentStatus: "approved"
}
```

```typescript
// Tabela: stockMovements
// - Movimentações por filial
// - Histórico completo de auditoria

stockMovements {
  id: 1,
  productId: 1,
  storeId: 1, // Movimento na Matriz
  movementType: "entry",
  quantity: 100,
  reason: "Importação NF-e 12345"
}
```

---

## 🔄 Fluxo de Criação de Nova Filial

### Passo 1: Cadastrar a Filial

```sql
INSERT INTO stores (name, cnpj, ie, address, city, state, zipCode, phone, email, active)
VALUES (
  'Filial - Belo Horizonte',
  '12345678000352',
  '001234567890',
  'Rua das Flores, 123',
  'Belo Horizonte',
  'MG',
  '30130000',
  '31987654321',
  'bh@bemcasado.com.br',
  1
);
```

### Passo 2: Inicializar Estoque (Opcional)

```sql
-- Copiar estrutura de estoque da matriz (produtos sem quantidade)
INSERT INTO productStocks (productId, storeId, quantity, minStock, maxStock)
SELECT 
  id as productId,
  3 as storeId, -- ID da nova filial
  0 as quantity, -- Começa zerado
  minStock,
  maxStock
FROM products
WHERE active = 1;
```

### Passo 3: Configurar Certificado Digital (NF-e)

```typescript
// Cada filial tem seu próprio certificado A1
// Armazenado em: server/certificates/
// Arquivo: {cnpj}_certificate.pfx

// Configuração no banco ou arquivo .env por filial
STORE_1_CERT_PATH=/certificates/12345678000190.pfx
STORE_1_CERT_PASSWORD=senha123

STORE_2_CERT_PATH=/certificates/12345678000271.pfx
STORE_2_CERT_PASSWORD=senha456
```

### Passo 4: Pronto! 🎉

A filial já está operacional e pode:
- ✅ Vender produtos
- ✅ Gerenciar estoque independente
- ✅ Emitir NF-e próprias
- ✅ Importar XML de NF-e
- ✅ Fazer ajustes manuais
- ✅ Gerar relatórios

---

## 🌐 Arquitetura de Aplicação

### Modelo: **Single Application, Multi-Tenant**

```
┌─────────────────────────────────────────────────┐
│         APLICAÇÃO ÚNICA (bem_casado_loja)       │
│                                                  │
│  Frontend: React + Next.js                      │
│  Backend: Node.js + Express + tRPC              │
│  Banco: PostgreSQL (Railway)                    │
└─────────────────────────────────────────────────┘
                      │
                      ├─────────────────────────────┐
                      │                             │
         ┌────────────▼──────────┐    ┌─────────────▼─────────┐
         │   MATRIZ - SP         │    │   FILIAL - RJ         │
         │   CNPJ: ...0190       │    │   CNPJ: ...0271       │
         │   Estoque: 500 un     │    │   Estoque: 200 un     │
         │   Vendas: 1.234       │    │   Vendas: 456         │
         └───────────────────────┘    └───────────────────────┘
```

### Vantagens desta Arquitetura

#### ✅ **1. Centralização**
- **Um único código** para manter
- **Atualizações simultâneas** em todas as filiais
- **Bugs corrigidos** uma vez, aplicados em todos

#### ✅ **2. Compartilhamento Inteligente**
- **Catálogo único** de produtos
- **Clientes únicos** (compra em qualquer filial)
- **Usuários centralizados** (gerente acessa todas)

#### ✅ **3. Isolamento de Dados Críticos**
- **Estoque independente** por filial
- **Vendas separadas** por CNPJ
- **NF-e específicas** de cada loja

#### ✅ **4. Escalabilidade**
- **Adicionar filial** = 1 INSERT no banco
- **Sem limite** de filiais
- **Performance** não degrada

#### ✅ **5. Relatórios Consolidados**
- **Visão global** do negócio
- **Comparação** entre filiais
- **Transferências** entre lojas

---

## 📊 Exemplos Práticos

### Cenário 1: Cliente Compra em Filiais Diferentes

```typescript
// Cliente único no sistema
customer {
  id: 1,
  name: "João Silva",
  cpf: "12345678900",
  email: "joao@email.com"
}

// Compra 1 - Matriz SP
order {
  id: 1,
  customerId: 1,
  storeId: 1, // Matriz
  finalAmount: 5000
}

// Compra 2 - Filial RJ
order {
  id: 2,
  customerId: 1, // Mesmo cliente
  storeId: 2, // Filial RJ
  finalAmount: 3000
}

// Histórico completo do cliente em todas as filiais
```

### Cenário 2: Transferência Entre Filiais

```typescript
// Saída da Matriz
stockMovement {
  productId: 1,
  storeId: 1, // Matriz
  movementType: "adjustment",
  quantity: -50,
  reason: "transfer",
  notes: "Transferência para Filial RJ"
}

// Entrada na Filial
stockMovement {
  productId: 1,
  storeId: 2, // Filial RJ
  movementType: "adjustment",
  quantity: 50,
  reason: "transfer",
  notes: "Recebimento da Matriz SP"
}
```

### Cenário 3: Relatório Consolidado

```sql
-- Estoque total de um produto em todas as filiais
SELECT 
  p.name,
  s.name as store_name,
  ps.quantity,
  ps.quantity * p.averageCost as stock_value
FROM productStocks ps
JOIN products p ON ps.productId = p.id
JOIN stores s ON ps.storeId = s.id
WHERE p.id = 1
ORDER BY s.name;

-- Resultado:
-- Arroz Integral | Matriz SP | 500 un | R$ 4.250,00
-- Arroz Integral | Filial RJ | 200 un | R$ 1.700,00
-- TOTAL: 700 un | R$ 5.950,00
```

---

## 🔐 Controle de Acesso (Futuro)

### Níveis de Permissão

```typescript
// Usuário pode ter acesso a filiais específicas
userStoreAccess {
  userId: 1,
  storeId: 1, // Acesso à Matriz
  role: "manager"
}

userStoreAccess {
  userId: 2,
  storeId: 2, // Acesso apenas à Filial RJ
  role: "operator"
}

// Admin global (acesso a todas)
users {
  id: 3,
  role: "admin", // Acessa todas as filiais
  name: "Diretor Geral"
}
```

---

## 🚀 Expansão para Novas Filiais

### Checklist de Abertura

- [ ] **1. Dados Cadastrais**
  - [ ] Cadastrar filial na tabela `stores`
  - [ ] CNPJ, IE, endereço completo
  - [ ] Email para notificações

- [ ] **2. Configuração Fiscal**
  - [ ] Obter certificado digital A1
  - [ ] Configurar credenciais Focus NF-e
  - [ ] Testar emissão de NF-e em homologação

- [ ] **3. Estoque Inicial**
  - [ ] Criar registros em `productStocks`
  - [ ] Definir estoque mínimo/máximo
  - [ ] Importar estoque inicial via NF-e ou ajuste manual

- [ ] **4. Configurações Locais**
  - [ ] Meios de pagamento aceitos
  - [ ] Horário de funcionamento
  - [ ] Políticas de entrega (se aplicável)

- [ ] **5. Treinamento**
  - [ ] Treinar equipe no sistema
  - [ ] Criar usuários operadores
  - [ ] Definir permissões

- [ ] **6. Go Live**
  - [ ] Testar fluxo completo de venda
  - [ ] Emitir primeira NF-e
  - [ ] Monitorar primeiras operações

---

## 📈 Escalabilidade

### Limites Teóricos

- **Filiais**: Ilimitado (depende apenas do banco)
- **Produtos**: Milhões (índices otimizados)
- **Vendas**: Milhões/dia (com sharding se necessário)
- **Usuários**: Milhares (autenticação JWT)

### Performance

```sql
-- Índices otimizados para multi-filial
CREATE INDEX idx_product_stocks_store ON productStocks(storeId);
CREATE INDEX idx_orders_store ON orders(storeId);
CREATE INDEX idx_stock_movements_store ON stockMovements(storeId);
CREATE INDEX idx_nfce_store ON nfce(storeId);
```

---

## 🎯 Resumo Executivo

### O Que É Compartilhado?
- ✅ Catálogo de produtos
- ✅ Cadastro de clientes
- ✅ Usuários do sistema
- ✅ Configurações globais

### O Que É Isolado?
- ✅ Estoque (quantidade por filial)
- ✅ Vendas (por CNPJ)
- ✅ NF-e (certificado próprio)
- ✅ Movimentações de estoque
- ✅ Caixa e financeiro

### Como Adicionar Nova Filial?
1. **INSERT** na tabela `stores`
2. **Copiar** estrutura de estoque (zerado)
3. **Configurar** certificado digital
4. **Pronto!** 🎉

### Não É Necessário:
- ❌ Copiar banco de dados
- ❌ Duplicar aplicação
- ❌ Criar subdomínios
- ❌ Replicar código
- ❌ Configurar sincronização

---

## 📞 Suporte e Dúvidas

Para dúvidas sobre arquitetura ou expansão:
- 📧 Email: suporte@bemcasado.com.br
- 📱 WhatsApp: (11) 98765-4321
- 🌐 Documentação: https://docs.bemcasado.com.br

---

**Última atualização**: Dezembro 2024  
**Versão do documento**: 1.0  
**Autor**: Equipe de Desenvolvimento Bem Casado
