# 🎨 Diagramas da Arquitetura Multi-Filial

## 1. Arquitetura Geral do Sistema

```mermaid
graph TB
    subgraph "APLICAÇÃO ÚNICA"
        A[Frontend React/Next.js]
        B[Backend Node.js + tRPC]
        C[(PostgreSQL Database)]
    end
    
    subgraph "DADOS GLOBAIS"
        D[Produtos]
        E[Usuários]
        F[Clientes]
    end
    
    subgraph "MATRIZ - SP"
        G1[Estoque: 500 un]
        G2[Vendas]
        G3[NF-e CNPJ ...0190]
    end
    
    subgraph "FILIAL - RJ"
        H1[Estoque: 200 un]
        H2[Vendas]
        H3[NF-e CNPJ ...0271]
    end
    
    subgraph "FILIAL - MG"
        I1[Estoque: 150 un]
        I2[Vendas]
        I3[NF-e CNPJ ...0352]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G1
    C --> G2
    C --> G3
    C --> H1
    C --> H2
    C --> H3
    C --> I1
    C --> I2
    C --> I3
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style E fill:#9C27B0
    style F fill:#9C27B0
```

## 2. Modelo de Dados Multi-Tenant

```mermaid
erDiagram
    STORES ||--o{ PRODUCT_STOCKS : "tem"
    STORES ||--o{ ORDERS : "processa"
    STORES ||--o{ STOCK_MOVEMENTS : "registra"
    STORES ||--o{ NFCE : "emite"
    
    PRODUCTS ||--o{ PRODUCT_STOCKS : "distribuído em"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "movimenta"
    
    USERS ||--o{ STOCK_MOVEMENTS : "executa"
    USERS ||--o{ ORDERS : "processa"
    
    STORES {
        int id PK
        string name
        string cnpj UK
        string city
        string state
        int active
    }
    
    PRODUCTS {
        int id PK
        string name
        string ean13
        int price
        int averageCost
    }
    
    PRODUCT_STOCKS {
        int id PK
        int productId FK
        int storeId FK
        int quantity
        int minStock
    }
    
    ORDERS {
        int id PK
        int storeId FK
        int userId FK
        int finalAmount
        string paymentStatus
    }
    
    STOCK_MOVEMENTS {
        int id PK
        int productId FK
        int storeId FK
        int userId FK
        int quantity
        string movementType
    }
```

## 3. Fluxo de Venda Multi-Filial

```mermaid
sequenceDiagram
    participant C as Cliente
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant NF as Focus NF-e
    
    C->>F: Seleciona produtos
    F->>B: Adiciona ao carrinho
    B->>DB: Verifica estoque (storeId)
    DB-->>B: Estoque disponível
    
    C->>F: Finaliza pedido
    F->>B: Cria pedido (storeId)
    B->>DB: Registra venda
    B->>DB: Baixa estoque (productStocks)
    B->>DB: Cria movimentação (stockMovements)
    
    B->>NF: Emite NF-e (CNPJ da filial)
    NF-->>B: NF-e autorizada
    B->>DB: Salva chave NF-e
    
    B-->>F: Pedido confirmado
    F-->>C: Exibe confirmação + NF-e
```

## 4. Fluxo de Transferência Entre Filiais

```mermaid
sequenceDiagram
    participant U as Usuário
    participant S as Sistema
    participant DB as Database
    participant M as Matriz SP
    participant F as Filial RJ
    
    U->>S: Solicita transferência
    Note over U,S: 50 un de Arroz<br/>Matriz → Filial RJ
    
    S->>DB: Verifica estoque Matriz
    DB-->>S: 500 un disponíveis
    
    S->>DB: Registra saída Matriz
    Note over DB,M: stockMovements<br/>storeId: 1<br/>quantity: -50<br/>reason: transfer
    
    S->>DB: Atualiza estoque Matriz
    Note over DB,M: productStocks<br/>storeId: 1<br/>quantity: 450
    
    S->>DB: Registra entrada Filial
    Note over DB,F: stockMovements<br/>storeId: 2<br/>quantity: +50<br/>reason: transfer
    
    S->>DB: Atualiza estoque Filial
    Note over DB,F: productStocks<br/>storeId: 2<br/>quantity: 250
    
    S-->>U: Transferência concluída
```

## 5. Estrutura de Tabelas por Escopo

```mermaid
graph LR
    subgraph "TABELAS GLOBAIS<br/>(Compartilhadas)"
        P[products<br/>Catálogo único]
        U[users<br/>Usuários do sistema]
        CU[customers<br/>Clientes]
    end
    
    subgraph "TABELAS POR FILIAL<br/>(Isoladas)"
        PS[productStocks<br/>Estoque por loja]
        O[orders<br/>Vendas por loja]
        SM[stockMovements<br/>Movimentações]
        NF[nfce<br/>Notas fiscais]
    end
    
    subgraph "TABELA DE CONTROLE"
        S[stores<br/>Cadastro de filiais]
    end
    
    S --> PS
    S --> O
    S --> SM
    S --> NF
    
    P --> PS
    P --> SM
    U --> SM
    U --> O
    
    style P fill:#9C27B0,color:#fff
    style U fill:#9C27B0,color:#fff
    style CU fill:#9C27B0,color:#fff
    style PS fill:#4CAF50,color:#fff
    style O fill:#4CAF50,color:#fff
    style SM fill:#4CAF50,color:#fff
    style NF fill:#4CAF50,color:#fff
    style S fill:#FF9800,color:#fff
```

## 6. Expansão: Antes vs Depois

```mermaid
graph TB
    subgraph "❌ ARQUITETURA ERRADA<br/>(Duplicação)"
        A1[App Matriz]
        A2[App Filial 1]
        A3[App Filial 2]
        
        DB1[(DB Matriz)]
        DB2[(DB Filial 1)]
        DB3[(DB Filial 2)]
        
        A1 --> DB1
        A2 --> DB2
        A3 --> DB3
        
        DB1 -.Sincronização.-> DB2
        DB2 -.Sincronização.-> DB3
    end
    
    subgraph "✅ ARQUITETURA CORRETA<br/>(Centralizada)"
        APP[Aplicação Única]
        DBC[(Database Único)]
        
        M[Matriz storeId:1]
        F1[Filial 1 storeId:2]
        F2[Filial 2 storeId:3]
        
        APP --> DBC
        DBC --> M
        DBC --> F1
        DBC --> F2
    end
    
    style A1 fill:#f44336,color:#fff
    style A2 fill:#f44336,color:#fff
    style A3 fill:#f44336,color:#fff
    style DB1 fill:#f44336,color:#fff
    style DB2 fill:#f44336,color:#fff
    style DB3 fill:#f44336,color:#fff
    
    style APP fill:#4CAF50,color:#fff
    style DBC fill:#4CAF50,color:#fff
    style M fill:#2196F3,color:#fff
    style F1 fill:#2196F3,color:#fff
    style F2 fill:#2196F3,color:#fff
```

## 7. Ciclo de Vida de um Produto

```mermaid
stateDiagram-v2
    [*] --> Cadastrado: Admin cria produto
    
    Cadastrado --> DistribuidoMatriz: Importa NF-e na Matriz
    Cadastrado --> DistribuidoFilial: Importa NF-e na Filial
    
    DistribuidoMatriz --> EmEstoqueMatriz: Entrada confirmada
    DistribuidoFilial --> EmEstoqueFilial: Entrada confirmada
    
    EmEstoqueMatriz --> Transferido: Transfer para Filial
    Transferido --> EmEstoqueFilial: Recebido
    
    EmEstoqueMatriz --> Vendido: Cliente compra
    EmEstoqueFilial --> Vendido: Cliente compra
    
    Vendido --> [*]: Ciclo completo
    
    EmEstoqueMatriz --> Ajustado: Inventário/Perda
    EmEstoqueFilial --> Ajustado: Inventário/Perda
    Ajustado --> EmEstoqueMatriz
    Ajustado --> EmEstoqueFilial
```

## 8. Dashboard Multi-Filial

```mermaid
graph TB
    subgraph "DASHBOARD GERENCIAL"
        D[Dashboard Principal]
    end
    
    subgraph "VISÕES DISPONÍVEIS"
        V1[Visão Global<br/>Todas as filiais]
        V2[Visão por Filial<br/>Individual]
        V3[Comparativo<br/>Entre filiais]
    end
    
    subgraph "MÉTRICAS"
        M1[Vendas Totais]
        M2[Estoque Total]
        M3[Produtos Críticos]
        M4[Ranking Filiais]
    end
    
    subgraph "RELATÓRIOS"
        R1[Estoque Consolidado]
        R2[Movimentações]
        R3[Transferências]
        R4[Auditoria]
    end
    
    D --> V1
    D --> V2
    D --> V3
    
    V1 --> M1
    V1 --> M2
    V1 --> M3
    V1 --> M4
    
    V2 --> R1
    V2 --> R2
    V2 --> R3
    V2 --> R4
```

---

## 🎯 Legenda de Cores

- 🟣 **Roxo**: Dados Globais (compartilhados)
- 🟢 **Verde**: Dados por Filial (isolados)
- 🟠 **Laranja**: Controle/Configuração
- 🔵 **Azul**: Filiais/Lojas
- 🔴 **Vermelho**: Arquitetura incorreta (evitar)

---

## 📊 Resumo Visual

| Aspecto | Abordagem |
|---------|-----------|
| **Aplicação** | ✅ Única para todas |
| **Banco de Dados** | ✅ Único centralizado |
| **Produtos** | ✅ Catálogo compartilhado |
| **Estoque** | ✅ Isolado por filial |
| **Vendas** | ✅ Isolado por CNPJ |
| **NF-e** | ✅ Certificado por filial |
| **Usuários** | ✅ Acesso multi-filial |
| **Sincronização** | ❌ Não necessária |

---

**Nota**: Estes diagramas podem ser renderizados usando ferramentas que suportam Mermaid, como GitHub, GitLab, ou editores Markdown compatíveis.
