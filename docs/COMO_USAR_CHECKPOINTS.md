# 📋 Como Usar o Sistema de Checkpoints

Este documento explica como usar o sistema de checkpoints para rastrear todas as alterações no projeto **Bem Casado Loja**.

---

## 🎯 O Que São Checkpoints?

Checkpoints são registros detalhados de cada alteração feita no projeto, incluindo:

- **ID único e sequencial** (ex: #001, #002, #003)
- **Data e horário** exatos da alteração (GMT-3)
- **Tipo de alteração** (Correção, Feature, Deploy, etc.)
- **Descrição detalhada** do que foi alterado
- **Arquivos afetados**
- **Informações do commit** (hash, mensagem, branch)
- **Testes realizados**

---

## 📂 Arquivos do Sistema

### **1. CHANGELOG_CHECKPOINTS.md**
- Localização: `/home/ubuntu/bem_casado_loja/CHANGELOG_CHECKPOINTS.md`
- Contém todos os checkpoints registrados
- Inclui tabela resumo de todos os checkpoints
- Atualizado automaticamente pelo script

### **2. create_checkpoint.py**
- Localização: `/home/ubuntu/bem_casado_loja/scripts/create_checkpoint.py`
- Script Python para criar novos checkpoints
- Gera ID automático e timestamp
- Dois modos: interativo e rápido

---

## 🚀 Como Criar um Novo Checkpoint

### **Método 1: Modo Interativo (Recomendado)**

Execute o script sem argumentos:

```bash
cd /home/ubuntu/bem_casado_loja
python3 scripts/create_checkpoint.py
```

O script irá perguntar:
1. **Tipo de checkpoint** (escolha um número da lista)
2. **Autor** (seu nome ou "Manus AI")
3. **Descrição** (digite a descrição e pressione Enter duas vezes)

Exemplo de uso:
```
🔖 CRIAR NOVO CHECKPOINT
========================================

📌 Próximo Checkpoint ID: #007

📋 Tipos de Checkpoint Disponíveis:
  1. Migração de Banco de Dados
  2. Cadastro de Produtos
  3. Correção de Backend
  4. Correção de Frontend
  5. Deploy/Rebuild
  ...

Selecione o tipo (número): 4

👤 Autor (ex: Manus AI, Nome do Dev): João Silva

📝 Descrição da alteração (pressione Enter duas vezes para finalizar):
Adicionada validação de CPF no formulário de checkout.
Agora o sistema valida o formato do CPF antes de enviar.

✅ Checkpoint #007 criado com sucesso!
```

---

### **Método 2: Modo Rápido (Linha de Comando)**

Para criar um checkpoint rapidamente via linha de comando:

```bash
python3 scripts/create_checkpoint.py "Tipo" "Descrição" "Autor"
```

Exemplo:
```bash
python3 scripts/create_checkpoint.py \
  "Correção de Frontend" \
  "Corrigido bug no carrinho de compras que duplicava itens" \
  "João Silva"
```

Se não informar o autor, será usado "Manus AI" como padrão:
```bash
python3 scripts/create_checkpoint.py \
  "Deploy/Rebuild" \
  "Deploy de hotfix para correção de bug crítico"
```

---

## 📝 Tipos de Checkpoint Disponíveis

| Tipo | Quando Usar |
|------|-------------|
| **Migração de Banco de Dados** | Criação ou alteração de tabelas, índices, etc. |
| **Cadastro de Produtos** | Inserção ou atualização de produtos no banco |
| **Correção de Backend** | Alterações no código do servidor (Express, tRPC) |
| **Correção de Frontend** | Alterações no código do cliente (React, TypeScript) |
| **Deploy/Rebuild** | Deploys no Railway, rebuilds, etc. |
| **Limpeza de Banco de Dados** | Remoção ou limpeza de dados |
| **Configuração** | Alterações em variáveis de ambiente, configs |
| **Documentação** | Atualizações de documentação, READMEs |
| **Teste** | Execução de testes, criação de testes |
| **Hotfix** | Correção urgente em produção |
| **Feature** | Nova funcionalidade implementada |
| **Refatoração** | Melhoria de código sem alterar funcionalidade |

---

## ✏️ Completando o Checkpoint

Após criar o checkpoint, você precisa preencher as informações faltantes no arquivo `CHANGELOG_CHECKPOINTS.md`:

### **1. Alterações Realizadas**
Substitua os checkboxes vazios pela lista real de alterações:

```markdown
### Alterações:
- ✅ Adicionada validação de CPF no formulário
- ✅ Criada função `validateCPF()` em `utils/validators.ts`
- ✅ Adicionada mensagem de erro customizada
```

### **2. Arquivos Afetados**
Liste todos os arquivos modificados:

```markdown
### Arquivos Afetados:
- `client/src/components/CheckoutForm.tsx` (linha 45-60)
- `client/src/utils/validators.ts` (nova função)
- `client/src/styles/forms.css` (linha 120)
```

### **3. Informações do Commit**
Preencha com os dados do commit Git:

```markdown
### Commit:
- Hash: `a1b2c3d`
- Mensagem: "feat: Adicionar validação de CPF no checkout"
- Branch: main
```

### **4. Testes Realizados**
Liste os testes que você fez:

```markdown
### Testes:
- ✅ CPF válido é aceito
- ✅ CPF inválido mostra erro
- ✅ Campo vazio mostra mensagem apropriada
- ✅ Formatação automática funciona (000.000.000-00)
```

---

## 🔄 Workflow Recomendado

### **Antes de Fazer Alterações:**
1. Planeje o que vai alterar
2. Anote os arquivos que serão modificados

### **Durante as Alterações:**
1. Faça as alterações no código
2. Teste localmente
3. Faça commit no Git

### **Depois das Alterações:**
1. **Crie o checkpoint:**
   ```bash
   python3 scripts/create_checkpoint.py
   ```

2. **Preencha as informações no CHANGELOG_CHECKPOINTS.md:**
   - Alterações realizadas
   - Arquivos afetados
   - Hash do commit
   - Testes realizados

3. **Faça commit do changelog:**
   ```bash
   git add CHANGELOG_CHECKPOINTS.md
   git commit -m "docs: Adicionar checkpoint #007"
   git push origin main
   ```

---

## 📊 Visualizando Checkpoints

### **Ver Todos os Checkpoints:**
Abra o arquivo `CHANGELOG_CHECKPOINTS.md` no editor de texto ou navegador.

### **Ver Resumo:**
Role até a seção "📊 Resumo de Checkpoints" para ver a tabela resumida.

### **Buscar Checkpoint Específico:**
Use Ctrl+F (ou Cmd+F) e busque por:
- `#007` (ID do checkpoint)
- `Correção de Frontend` (tipo)
- `2025-12-08` (data)

---

## 🛠️ Exemplos Práticos

### **Exemplo 1: Adicionar Nova Feature**

```bash
# 1. Criar checkpoint
python3 scripts/create_checkpoint.py

# Selecionar:
# Tipo: 11. Feature
# Autor: João Silva
# Descrição: Implementado sistema de cupons de desconto

# 2. Fazer as alterações no código
# ... (editar arquivos, testar, etc.)

# 3. Fazer commit
git add .
git commit -m "feat: Implementar sistema de cupons"
git push origin main

# 4. Atualizar checkpoint com informações do commit
# Editar CHANGELOG_CHECKPOINTS.md e preencher:
# - Alterações realizadas
# - Arquivos afetados
# - Hash do commit (ex: b4c5d6e)
# - Testes realizados

# 5. Fazer commit do changelog
git add CHANGELOG_CHECKPOINTS.md
git commit -m "docs: Adicionar checkpoint #007 - Sistema de cupons"
git push origin main
```

---

### **Exemplo 2: Hotfix em Produção**

```bash
# 1. Criar checkpoint urgente
python3 scripts/create_checkpoint.py \
  "Hotfix" \
  "Corrigido bug crítico que impedia finalização de compras" \
  "João Silva"

# 2. Fazer correção
# ... (editar código)

# 3. Commit e deploy urgente
git add .
git commit -m "hotfix: Corrigir bug no checkout"
git push origin main

# 4. Atualizar checkpoint
# Editar CHANGELOG_CHECKPOINTS.md

# 5. Commit do changelog
git add CHANGELOG_CHECKPOINTS.md
git commit -m "docs: Checkpoint #007 - Hotfix checkout"
git push origin main
```

---

### **Exemplo 3: Deploy no Railway**

```bash
# 1. Criar checkpoint de deploy
python3 scripts/create_checkpoint.py \
  "Deploy/Rebuild" \
  "Deploy da versão 1.2.0 com novas features" \
  "Manus AI"

# 2. Fazer deploy no Railway
# (Railway faz deploy automático via GitHub)

# 3. Aguardar deploy terminar e testar

# 4. Atualizar checkpoint com resultados
# Editar CHANGELOG_CHECKPOINTS.md
# Adicionar:
# - Tempo de deploy
# - Testes realizados em produção
# - URL de produção

# 5. Commit do changelog
git add CHANGELOG_CHECKPOINTS.md
git commit -m "docs: Checkpoint #007 - Deploy v1.2.0"
git push origin main
```

---

## ⚠️ Boas Práticas

### **✅ FAÇA:**
- Crie um checkpoint para **cada alteração significativa**
- Seja **detalhado** na descrição
- Liste **todos os arquivos** afetados
- Registre **todos os testes** realizados
- Preencha **todas as informações** do checkpoint
- Faça commit do changelog **junto com o código**

### **❌ NÃO FAÇA:**
- Criar checkpoints para alterações triviais (typos, espaços)
- Deixar checkpoints incompletos
- Esquecer de atualizar a tabela resumo
- Pular checkpoints (sempre use IDs sequenciais)
- Criar checkpoints sem fazer commit no Git

---

## 🔧 Solução de Problemas

### **Erro: "Arquivo CHANGELOG_CHECKPOINTS.md não encontrado"**
```bash
# Certifique-se de estar no diretório correto
cd /home/ubuntu/bem_casado_loja

# Verifique se o arquivo existe
ls -la CHANGELOG_CHECKPOINTS.md
```

### **Erro: "Tipo inválido"**
Certifique-se de usar um dos tipos listados em "Tipos de Checkpoint Disponíveis".

### **Checkpoint com ID errado**
O script calcula automaticamente o próximo ID. Se o ID estiver errado:
1. Verifique se há checkpoints duplicados no arquivo
2. Corrija manualmente o ID no arquivo
3. Execute o script novamente

---

## 📞 Suporte

Se tiver dúvidas ou problemas com o sistema de checkpoints:

1. Consulte este documento
2. Veja exemplos no arquivo `CHANGELOG_CHECKPOINTS.md`
3. Entre em contato com o time de desenvolvimento

---

**Última Atualização:** 2025-12-08 08:55:00 GMT-3  
**Versão do Sistema:** 1.0.0
