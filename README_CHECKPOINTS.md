# 🔖 Sistema de Checkpoints - Bem Casado Loja

Sistema automático de rastreamento de alterações com geração de ID sequencial e timestamp.

---

## 🎯 O Que É?

Um sistema de versionamento detalhado que registra **cada alteração** feita no projeto, incluindo:

- ✅ **ID único e sequencial** (ex: #001, #002, #003)
- ✅ **Data e horário exatos** (GMT-3)
- ✅ **Tipo de alteração** (Correção, Feature, Deploy, etc.)
- ✅ **Descrição detalhada**
- ✅ **Arquivos modificados**
- ✅ **Informações do commit Git**
- ✅ **Testes realizados**

---

## 🚀 Como Usar

### **Modo Interativo (Recomendado)**

```bash
cd /home/ubuntu/bem_casado_loja
python3 scripts/create_checkpoint.py
```

O script irá guiá-lo através de perguntas interativas.

### **Modo Rápido (Linha de Comando)**

```bash
python3 scripts/create_checkpoint.py "Tipo" "Descrição" "Autor"
```

**Exemplo:**
```bash
python3 scripts/create_checkpoint.py \
  "Correção de Frontend" \
  "Corrigido bug no carrinho de compras" \
  "João Silva"
```

---

## 📚 Documentação

- **[Guia Completo](docs/COMO_USAR_CHECKPOINTS.md)** - Documentação detalhada com exemplos
- **[Guia Rápido](docs/CHECKPOINT_QUICK_REFERENCE.md)** - Referência rápida de comandos
- **[Histórico](CHANGELOG_CHECKPOINTS.md)** - Todos os checkpoints registrados

---

## 📋 Tipos de Checkpoint

| Tipo | Descrição |
|------|-----------|
| **Migração de Banco de Dados** | Criação/alteração de tabelas |
| **Cadastro de Produtos** | Inserção/atualização de produtos |
| **Correção de Backend** | Alterações no servidor |
| **Correção de Frontend** | Alterações no cliente |
| **Deploy/Rebuild** | Deploys e rebuilds |
| **Limpeza de Banco de Dados** | Remoção/limpeza de dados |
| **Configuração** | Alterações em configs |
| **Documentação** | Atualizações de docs |
| **Teste** | Execução de testes |
| **Hotfix** | Correção urgente |
| **Feature** | Nova funcionalidade |
| **Refatoração** | Melhoria de código |

---

## 📊 Checkpoints Registrados

Atualmente temos **7 checkpoints** registrados:

| ID | Data | Tipo | Status |
|----|------|------|--------|
| #001 | 2025-12-05 | Migração DB | ✅ |
| #002 | 2025-12-05 | Cadastro Produtos | ✅ |
| #003 | 2025-12-08 | Correção Backend | ✅ |
| #004 | 2025-12-08 | Correção Frontend | ✅ |
| #005 | 2025-12-08 | Deploy/Rebuild | ✅ |
| #006 | 2025-12-08 | Limpeza DB | ✅ |
| #007 | 2025-12-08 | Documentação | ✅ |

Ver todos: [CHANGELOG_CHECKPOINTS.md](CHANGELOG_CHECKPOINTS.md)

---

## 🔄 Workflow Recomendado

```
1. Criar checkpoint
   ↓
2. Fazer alterações no código
   ↓
3. Testar localmente
   ↓
4. Fazer commit no Git
   ↓
5. Atualizar checkpoint com detalhes
   ↓
6. Commit do changelog
   ↓
7. Push para GitHub
```

---

## 📂 Estrutura de Arquivos

```
bem_casado_loja/
├── CHANGELOG_CHECKPOINTS.md      # Histórico completo
├── README_CHECKPOINTS.md         # Este arquivo
├── scripts/
│   └── create_checkpoint.py      # Script gerador
└── docs/
    ├── COMO_USAR_CHECKPOINTS.md  # Guia completo
    └── CHECKPOINT_QUICK_REFERENCE.md  # Guia rápido
```

---

## ✨ Funcionalidades

- ✅ Geração automática de ID sequencial
- ✅ Timestamp automático (GMT-3)
- ✅ Modo interativo e modo rápido
- ✅ Atualização automática da tabela resumo
- ✅ Validação de tipos de checkpoint
- ✅ Template pré-formatado
- ✅ Suporte a múltiplos autores

---

## 🛠️ Requisitos

- Python 3.6+
- Biblioteca `pytz` (para timezone)

**Instalar dependências:**
```bash
pip3 install pytz
```

---

## 📝 Exemplo de Checkpoint

```markdown
## 🔖 CHECKPOINT #007
**Data/Hora:** 2025-12-08 10:57:10 GMT-3  
**Tipo:** Documentação  
**Autor:** Manus AI

### Descrição:
Criado sistema de checkpoints automáticos com geração de ID e timestamp

### Alterações:
- ✅ Criado arquivo CHANGELOG_CHECKPOINTS.md
- ✅ Criado script create_checkpoint.py
- ✅ Criada documentação completa

### Arquivos Afetados:
- CHANGELOG_CHECKPOINTS.md (novo)
- scripts/create_checkpoint.py (novo)
- docs/COMO_USAR_CHECKPOINTS.md (novo)

### Commit:
- Hash: 4f3bc6f
- Mensagem: "docs: Adicionar sistema de checkpoints"
- Branch: main

### Testes:
- ✅ Script executa corretamente
- ✅ ID gerado automaticamente
- ✅ Timestamp correto
```

---

## 🤝 Contribuindo

Ao fazer alterações no projeto:

1. **Sempre crie um checkpoint** antes de começar
2. **Seja detalhado** na descrição
3. **Liste todos os arquivos** modificados
4. **Registre todos os testes** realizados
5. **Faça commit do changelog** junto com o código

---

## 📞 Suporte

- **Documentação Completa:** `docs/COMO_USAR_CHECKPOINTS.md`
- **Guia Rápido:** `docs/CHECKPOINT_QUICK_REFERENCE.md`
- **Histórico:** `CHANGELOG_CHECKPOINTS.md`

---

## 📜 Licença

Este sistema de checkpoints faz parte do projeto **Bem Casado Loja**.

---

**Criado em:** 2025-12-08  
**Versão:** 1.0.0  
**Autor:** Manus AI  
**Última Atualização:** 2025-12-08 10:58:00 GMT-3
