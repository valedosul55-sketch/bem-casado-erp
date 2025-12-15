# 🚀 Guia Prático: Como Abrir uma Nova Filial

## 📋 Pré-requisitos

Antes de iniciar o processo de abertura de uma nova filial no sistema, certifique-se de ter:

- ✅ CNPJ da nova filial (já registrado na Receita Federal)
- ✅ Inscrição Estadual (IE)
- ✅ Certificado Digital A1 (para emissão de NF-e)
- ✅ Endereço completo da loja
- ✅ Credenciais Focus NF-e (ambiente de produção)
- ✅ Acesso administrativo ao sistema

---

## 🎯 Processo Completo (Passo a Passo)

### ETAPA 1: Cadastro da Filial no Sistema

#### 1.1. Acessar o Painel Administrativo

1. Faça login no sistema com usuário **admin**
2. Acesse a aba **"Filiais"** no menu administrativo
3. Clique em **"Nova Filial"**

#### 1.2. Preencher Dados Cadastrais

```typescript
// Exemplo de dados a preencher:
{
  name: "Filial - Belo Horizonte",
  cnpj: "12345678000352", // Apenas números
  ie: "001234567890",
  address: "Rua das Flores, 123 - Centro",
  city: "Belo Horizonte",
  state: "MG",
  zipCode: "30130000",
  phone: "31987654321",
  email: "bh@bemcasado.com.br",
  notificationEmail: "estoque.bh@bemcasado.com.br",
  active: 1
}
```

#### 1.3. Via SQL (Alternativa)

Se preferir fazer via banco de dados:

```sql
INSERT INTO stores (
  name, 
  cnpj, 
  ie, 
  address, 
  city, 
  state, 
  zipCode, 
  phone, 
  email, 
  notificationEmail, 
  active
) VALUES (
  'Filial - Belo Horizonte',
  '12345678000352',
  '001234567890',
  'Rua das Flores, 123 - Centro',
  'Belo Horizonte',
  'MG',
  '30130000',
  '31987654321',
  'bh@bemcasado.com.br',
  'estoque.bh@bemcasado.com.br',
  1
);

-- Anotar o ID retornado (ex: 3)
```

---

### ETAPA 2: Inicializar Estrutura de Estoque

#### 2.1. Criar Registros de Estoque Zerado

```sql
-- Copiar estrutura de produtos da matriz
-- Todos os produtos começam com estoque ZERO

INSERT INTO productStocks (productId, storeId, quantity, minStock, maxStock)
SELECT 
  id as productId,
  3 as storeId, -- ID da nova filial (substituir pelo ID real)
  0 as quantity, -- Estoque inicial zerado
  CASE 
    WHEN category = 'arroz' THEN 50
    WHEN category = 'feijao' THEN 30
    WHEN category = 'acucar' THEN 40
    ELSE 20
  END as minStock, -- Estoque mínimo por categoria
  1000 as maxStock -- Estoque máximo padrão
FROM products
WHERE active = 1;
```

#### 2.2. Verificar Criação

```sql
-- Conferir quantos produtos foram criados
SELECT COUNT(*) as total_produtos
FROM productStocks
WHERE storeId = 3;

-- Deve retornar o mesmo número de produtos ativos
```

---

### ETAPA 3: Configuração Fiscal (NF-e)

#### 3.1. Instalar Certificado Digital

```bash
# Criar diretório de certificados (se não existir)
mkdir -p /home/ubuntu/bem_casado_loja/server/certificates

# Copiar certificado A1 da filial
# Formato: {cnpj}_certificate.pfx
cp /caminho/do/certificado.pfx /home/ubuntu/bem_casado_loja/server/certificates/12345678000352_certificate.pfx

# Definir permissões
chmod 600 /home/ubuntu/bem_casado_loja/server/certificates/12345678000352_certificate.pfx
```

#### 3.2. Configurar Variáveis de Ambiente

Adicionar no arquivo `.env`:

```bash
# Filial Belo Horizonte (storeId: 3)
STORE_3_CNPJ=12345678000352
STORE_3_CERT_PATH=/home/ubuntu/bem_casado_loja/server/certificates/12345678000352_certificate.pfx
STORE_3_CERT_PASSWORD=SenhaDoC3rtificad0
STORE_3_FOCUS_TOKEN=seu_token_focus_nfe_aqui
```

#### 3.3. Testar Emissão em Homologação

```typescript
// Criar script de teste: server/test-nfe-filial.ts

import { emitirNFCe } from './nfceService';

async function testarEmissaoFilial() {
  const dadosVenda = {
    storeId: 3, // Nova filial
    customerName: 'Cliente Teste',
    customerCpf: '12345678900',
    items: [
      {
        productName: 'Arroz Integral 1kg',
        quantity: 1,
        unitPrice: 1290, // R$ 12,90
        totalPrice: 1290
      }
    ],
    totalAmount: 1290,
    paymentMethod: 'dinheiro'
  };

  try {
    const nfce = await emitirNFCe(dadosVenda);
    console.log('✅ NF-e emitida com sucesso!');
    console.log('Chave:', nfce.chave);
    console.log('Número:', nfce.numero);
  } catch (error) {
    console.error('❌ Erro ao emitir NF-e:', error);
  }
}

testarEmissaoFilial();
```

```bash
# Executar teste
pnpm tsx server/test-nfe-filial.ts
```

---

### ETAPA 4: Entrada de Estoque Inicial

#### Opção A: Via Importação de NF-e

1. Acesse **Admin → Importar NF-e**
2. Selecione a **filial** no dropdown
3. Faça upload do XML da NF-e de compra
4. Clique em **"Importar NF-e"**
5. O estoque será atualizado automaticamente

#### Opção B: Via Ajuste Manual

1. Acesse **Admin → Ajustes**
2. Clique em **"Entrada (+)"**
3. Selecione o **produto**
4. Informe a **quantidade**
5. Selecione a **filial** (Belo Horizonte)
6. Escolha o motivo: **"Inventário/Contagem Física"**
7. Adicione observações: **"Estoque inicial da filial"**
8. Informe o **custo unitário** (opcional)
9. Clique em **"Registrar Ajuste"**

#### Opção C: Via SQL (Bulk Insert)

```sql
-- Exemplo: Adicionar estoque inicial de 100 unidades para todos os produtos

-- 1. Criar movimentações
INSERT INTO stockMovements (productId, storeId, movementType, quantity, reason, notes)
SELECT 
  id as productId,
  3 as storeId,
  'adjustment' as movementType,
  100 as quantity,
  'inventory' as reason,
  'Estoque inicial da filial Belo Horizonte' as notes
FROM products
WHERE active = 1;

-- 2. Atualizar estoque
UPDATE productStocks
SET quantity = 100
WHERE storeId = 3;
```

---

### ETAPA 5: Configurações Específicas da Filial

#### 5.1. Definir Horário de Funcionamento

```sql
-- Adicionar em uma tabela de configurações (se existir)
-- Ou criar campo na tabela stores

UPDATE stores
SET 
  opening_hours = '{"seg-sex": "08:00-18:00", "sab": "08:00-12:00"}',
  delivery_radius = 10, -- km
  accepts_card = true,
  accepts_pix = true
WHERE id = 3;
```

#### 5.2. Configurar Meios de Pagamento

```typescript
// Configurar no painel administrativo ou via código
const filialConfig = {
  storeId: 3,
  paymentMethods: {
    creditCard: true,
    debitCard: true,
    pix: true,
    foodVoucher: true,
    cash: true
  },
  pixKey: '12345678000352', // CNPJ como chave PIX
  merchantId: 'BH_STORE_001'
};
```

---

### ETAPA 6: Criar Usuários da Filial

#### 6.1. Cadastrar Gerente da Filial

```sql
-- Criar usuário gerente
INSERT INTO users (openId, name, email, role)
VALUES (
  'oauth_id_gerente_bh',
  'Maria Silva',
  'maria.silva@bemcasado.com.br',
  'manager'
);

-- Vincular à filial (se houver tabela de permissões)
INSERT INTO userStoreAccess (userId, storeId, role)
VALUES (
  (SELECT id FROM users WHERE email = 'maria.silva@bemcasado.com.br'),
  3,
  'manager'
);
```

#### 6.2. Cadastrar Operadores

```sql
-- Criar operadores de caixa
INSERT INTO users (openId, name, email, role)
VALUES 
  ('oauth_id_op1_bh', 'João Santos', 'joao.santos@bemcasado.com.br', 'operator'),
  ('oauth_id_op2_bh', 'Ana Costa', 'ana.costa@bemcasado.com.br', 'operator');

-- Vincular à filial
INSERT INTO userStoreAccess (userId, storeId, role)
SELECT id, 3, 'operator'
FROM users
WHERE email IN ('joao.santos@bemcasado.com.br', 'ana.costa@bemcasado.com.br');
```

---

### ETAPA 7: Testes de Integração

#### 7.1. Checklist de Testes

- [ ] **Venda Completa**
  - [ ] Adicionar produtos ao carrinho
  - [ ] Finalizar pedido
  - [ ] Processar pagamento
  - [ ] Emitir NF-e
  - [ ] Verificar baixa de estoque

- [ ] **Importação de NF-e**
  - [ ] Fazer upload de XML
  - [ ] Validar parsing
  - [ ] Confirmar entrada de estoque
  - [ ] Verificar atualização de custo médio

- [ ] **Ajustes Manuais**
  - [ ] Registrar entrada manual
  - [ ] Registrar saída manual
  - [ ] Verificar validações
  - [ ] Conferir histórico

- [ ] **Transferência Entre Filiais**
  - [ ] Criar transferência da Matriz para BH
  - [ ] Verificar saída na Matriz
  - [ ] Verificar entrada em BH
  - [ ] Conferir movimentações

- [ ] **Relatórios**
  - [ ] Estoque por filial
  - [ ] Vendas da filial
  - [ ] Movimentações
  - [ ] Comparativo entre filiais

#### 7.2. Script de Teste Automatizado

```typescript
// server/test-filial-completo.ts

import { db } from './db';
import { stores, productStocks, stockMovements } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function testarFilial(storeId: number) {
  console.log(`🧪 Testando filial ID: ${storeId}`);
  
  // 1. Verificar cadastro
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId));
  console.log('✅ Filial cadastrada:', store.name);
  
  // 2. Verificar estoque
  const stocks = await db.select().from(productStocks).where(eq(productStocks.storeId, storeId));
  console.log(`✅ Produtos em estoque: ${stocks.length}`);
  
  // 3. Verificar movimentações
  const movements = await db.select().from(stockMovements).where(eq(stockMovements.storeId, storeId));
  console.log(`✅ Movimentações registradas: ${movements.length}`);
  
  // 4. Calcular valor total do estoque
  const totalValue = stocks.reduce((sum, s) => sum + (s.quantity * 850), 0); // Custo médio exemplo
  console.log(`✅ Valor total do estoque: R$ ${(totalValue / 100).toFixed(2)}`);
  
  console.log('🎉 Todos os testes passaram!');
}

testarFilial(3); // ID da nova filial
```

---

### ETAPA 8: Treinamento da Equipe

#### 8.1. Materiais de Treinamento

Criar documentação específica:

- 📄 **Manual do Operador de Caixa**
  - Como fazer vendas
  - Como emitir NF-e
  - Como processar pagamentos
  - Como lidar com devoluções

- 📄 **Manual do Gerente de Loja**
  - Como gerenciar estoque
  - Como fazer ajustes manuais
  - Como importar NF-e
  - Como gerar relatórios
  - Como solicitar transferências

- 📄 **FAQ - Perguntas Frequentes**
  - Problemas comuns e soluções
  - Contatos de suporte
  - Procedimentos de emergência

#### 8.2. Sessão de Treinamento

**Agenda Sugerida (4 horas)**:

1. **Introdução ao Sistema** (30 min)
   - Visão geral
   - Login e navegação
   - Segurança e boas práticas

2. **Operações de Venda** (1 hora)
   - Busca de produtos
   - Carrinho de compras
   - Finalização de pedido
   - Emissão de NF-e
   - Prática supervisionada

3. **Gestão de Estoque** (1 hora)
   - Consulta de estoque
   - Importação de NF-e
   - Ajustes manuais
   - Alertas de estoque baixo

4. **Relatórios e Análises** (30 min)
   - Relatórios disponíveis
   - Como exportar dados
   - Análise de vendas

5. **Prática Livre** (1 hora)
   - Simulações de cenários reais
   - Dúvidas e esclarecimentos
   - Avaliação de aprendizado

---

### ETAPA 9: Go Live

#### 9.1. Checklist Final

- [ ] Todos os testes passaram
- [ ] Equipe treinada
- [ ] Certificado digital configurado
- [ ] Estoque inicial cadastrado
- [ ] Meios de pagamento testados
- [ ] NF-e emitida com sucesso (teste)
- [ ] Backup do banco de dados realizado
- [ ] Suporte técnico de prontidão

#### 9.2. Primeira Venda Real

1. Fazer a primeira venda com supervisão
2. Emitir a primeira NF-e oficial
3. Processar o primeiro pagamento
4. Verificar baixa de estoque
5. Comemorar! 🎉

#### 9.3. Monitoramento Pós-Lançamento

**Primeiras 24 horas**:
- Monitorar todas as vendas
- Verificar emissão de NF-e
- Acompanhar estoque em tempo real
- Estar disponível para suporte

**Primeira semana**:
- Reunião diária com a equipe
- Ajustes de processo se necessário
- Coleta de feedback
- Análise de métricas

**Primeiro mês**:
- Reunião semanal de acompanhamento
- Análise de performance
- Comparação com outras filiais
- Planejamento de melhorias

---

## 📊 Métricas de Sucesso

### KPIs para Acompanhar

- **Vendas**
  - Ticket médio
  - Número de vendas/dia
  - Taxa de conversão

- **Estoque**
  - Giro de estoque
  - Produtos em falta
  - Valor imobilizado

- **Operacional**
  - Tempo médio de atendimento
  - NF-e emitidas com sucesso
  - Erros de sistema

- **Financeiro**
  - Faturamento diário
  - Margem de lucro
  - Inadimplência

---

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

#### 1. NF-e não emite

**Possíveis causas**:
- Certificado digital vencido
- Senha incorreta
- Token Focus NF-e inválido
- CNPJ não cadastrado na SEFAZ

**Solução**:
```bash
# Verificar certificado
openssl pkcs12 -info -in /path/to/certificate.pfx

# Testar conexão com Focus
curl -X POST https://api.focusnfe.com.br/v2/nfce \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"cnpj": "12345678000352"}'
```

#### 2. Estoque não atualiza

**Possíveis causas**:
- storeId incorreto
- Transação não commitada
- Erro no cálculo de custo médio

**Solução**:
```sql
-- Verificar movimentações
SELECT * FROM stockMovements 
WHERE storeId = 3 
ORDER BY createdAt DESC 
LIMIT 10;

-- Recalcular estoque
UPDATE productStocks ps
SET quantity = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM stockMovements sm
  WHERE sm.productId = ps.productId
    AND sm.storeId = ps.storeId
)
WHERE storeId = 3;
```

#### 3. Transferência não funciona

**Verificar**:
- Estoque disponível na origem
- storeId correto em ambos os lados
- Permissões do usuário

---

## 📞 Contatos de Suporte

- **Suporte Técnico**: suporte@bemcasado.com.br
- **Emergências**: (11) 98765-4321 (WhatsApp)
- **Documentação**: https://docs.bemcasado.com.br
- **Slack**: #suporte-filiais

---

## ✅ Resumo Executivo

### Tempo Estimado
- **Cadastro**: 15 minutos
- **Configuração**: 1 hora
- **Estoque Inicial**: 2-4 horas
- **Testes**: 2 horas
- **Treinamento**: 4 horas
- **Total**: ~1 dia útil

### Custo Estimado
- Certificado Digital A1: R$ 200/ano
- Focus NF-e: R$ 50/mês
- Treinamento: Interno (sem custo adicional)
- **Total**: ~R$ 800/ano por filial

### Recursos Necessários
- 1 Administrador do sistema (4 horas)
- 1 Técnico de TI (2 horas)
- 1 Contador (1 hora - certificado)
- Equipe da filial (4 horas - treinamento)

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0  
**Próxima revisão**: Após abertura da primeira filial
