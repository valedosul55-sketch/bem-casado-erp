# 🔖 Sistema de Checkpoints Pós-Deploy

Sistema automático que cria snapshots do código após cada deploy, permitindo rollback rápido caso algo dê errado em produção.

---

## 🎯 Como Funciona

1. **Após cada deploy bem-sucedido**, você executa o script de checkpoint
2. O sistema cria uma **Git tag** com ID único e timestamp
3. Se algo der errado, você pode **fazer rollback** para qualquer checkpoint anterior
4. O rollback restaura o código e faz push para o GitHub
5. O Railway detecta a mudança e **faz deploy automático** da versão anterior

---

## 📋 Comandos Principais

### **1. Criar Checkpoint (Após Deploy)**

```bash
cd /home/ubuntu/bem_casado_loja
./scripts/post_deploy_checkpoint.sh "Descrição do deploy"
```

**Exemplo:**
```bash
./scripts/post_deploy_checkpoint.sh "Adicionado sistema de cupons de desconto"
```

**O que acontece:**
- ✅ Cria Git tag com ID sequencial (checkpoint-1, checkpoint-2, etc.)
- ✅ Registra data/hora, commit, descrição
- ✅ Envia tag para o GitHub
- ✅ Atualiza índice de checkpoints

---

### **2. Listar Checkpoints Disponíveis**

```bash
./scripts/list_checkpoints.sh
```

**Saída:**
```
========================================
📋 CHECKPOINTS DISPONÍVEIS
========================================

ID     Data/Hora              Commit     Descrição
--------------------------------------------------------------------------------
#1     2025-12-08 10:08:58    5d311dc    Deploy inicial
#2     2025-12-08 14:30:15    a1b2c3d    Adicionado cupons
#3     2025-12-08 16:45:22    e4f5g6h    Corrigido bug no checkout

Total: 3 checkpoint(s)

💡 Para fazer rollback:
   ./scripts/rollback_checkpoint.sh [ID]
========================================
```

---

### **3. Fazer Rollback para Checkpoint Anterior**

```bash
./scripts/rollback_checkpoint.sh [CHECKPOINT_ID]
```

**Exemplo:**
```bash
./scripts/rollback_checkpoint.sh 2
```

**O que acontece:**
1. ⚠️  Mostra informações do checkpoint
2. ⚠️  Pede confirmação (digite "SIM")
3. 📦 Cria backup do estado atual
4. 🔄 Restaura código para o checkpoint escolhido
5. 📤 Pergunta se deseja fazer push para GitHub
6. ✅ Railway detecta mudança e faz deploy automático

---

## 🔄 Workflow Completo

### **Cenário 1: Deploy Normal**

```bash
# 1. Fazer alterações no código
# ... (editar arquivos)

# 2. Testar localmente
npm run dev

# 3. Commit e push
git add .
git commit -m "feat: Nova funcionalidade"
git push origin main

# 4. Aguardar deploy no Railway (2-3 minutos)

# 5. Testar em produção
# Acessar: https://bem-casado-loja-production.up.railway.app/loja/

# 6. Se tudo OK, criar checkpoint
./scripts/post_deploy_checkpoint.sh "Deploy da nova funcionalidade"
```

---

### **Cenário 2: Deploy com Problema (Rollback)**

```bash
# 1. Deploy foi feito mas há um bug em produção
# 2. Listar checkpoints disponíveis
./scripts/list_checkpoints.sh

# 3. Fazer rollback para o último checkpoint bom
./scripts/rollback_checkpoint.sh 2

# 4. Confirmar rollback (digite "SIM")

# 5. Confirmar push para GitHub (digite "s")

# 6. Aguardar deploy automático no Railway

# 7. Verificar se o problema foi resolvido

# 8. Corrigir o bug localmente e fazer novo deploy
```

---

## 📊 Estrutura de Arquivos

```
bem_casado_loja/
├── .checkpoints/                    # Diretório de checkpoints
│   ├── index.json                   # Índice com todos os checkpoints
│   └── checkpoint_history.log       # Log detalhado
├── scripts/
│   ├── post_deploy_checkpoint.sh    # Criar checkpoint
│   ├── rollback_checkpoint.sh       # Fazer rollback
│   └── list_checkpoints.sh          # Listar checkpoints
└── CHECKPOINTS_GUIA.md              # Este arquivo
```

---

## 🏷️ Git Tags

Cada checkpoint cria uma Git tag no formato:

```
checkpoint-[ID]-[TIMESTAMP]
```

**Exemplo:**
```
checkpoint-1-20251208_100858
checkpoint-2-20251208_143015
checkpoint-3-20251208_164522
```

Essas tags ficam salvas no GitHub e podem ser acessadas em:
```
https://github.com/valedosul55-sketch/bem-casado-loja/tags
```

---

## ⚠️ Avisos Importantes

### **1. Mudanças Não Commitadas**

Se houver mudanças não commitadas ao criar checkpoint:
- O script faz commit automático antes de criar a tag
- Mensagem: "chore: Commit automático antes do checkpoint #X"

Se houver mudanças ao fazer rollback:
- O script avisa que as mudanças serão perdidas
- Pede confirmação digitando "SIM"

### **2. Push Forçado**

O rollback usa `git push --force` para sobrescrever o histórico.
- ⚠️ Isso é necessário para voltar a um commit anterior
- ⚠️ O Railway detecta a mudança e faz deploy automático
- ✅ Um backup é criado antes do rollback

### **3. Backup Automático**

Antes de cada rollback, o sistema cria um backup:
- Tag: `backup-before-rollback-[TIMESTAMP]`
- Permite desfazer o rollback se necessário

---

## 💡 Boas Práticas

### **✅ FAÇA:**

1. **Crie checkpoint SEMPRE após deploy bem-sucedido**
   ```bash
   ./scripts/post_deploy_checkpoint.sh "Descrição do que foi deployado"
   ```

2. **Teste em produção antes de criar checkpoint**
   - Acesse a URL de produção
   - Verifique funcionalidades principais
   - Só crie checkpoint se tudo estiver OK

3. **Use descrições claras nos checkpoints**
   - ✅ "Adicionado sistema de cupons de desconto"
   - ✅ "Corrigido bug no carrinho de compras"
   - ❌ "Deploy"
   - ❌ "Alterações"

4. **Mantenha histórico de checkpoints**
   - Não delete tags antigas
   - Útil para auditoria e debugging

### **❌ NÃO FAÇA:**

1. **Não faça rollback sem necessidade**
   - Rollback é para emergências
   - Para correções pequenas, faça novo deploy

2. **Não delete checkpoints manualmente**
   - Pode quebrar o índice
   - Use os scripts fornecidos

3. **Não faça rollback sem testar depois**
   - Sempre verifique se o problema foi resolvido
   - Teste em produção após rollback

---

## 🆘 Solução de Problemas

### **Erro: "Nenhum checkpoint encontrado"**

**Causa:** Ainda não foi criado nenhum checkpoint

**Solução:**
```bash
./scripts/post_deploy_checkpoint.sh "Primeiro checkpoint"
```

---

### **Erro: "Checkpoint #X não encontrado"**

**Causa:** ID inválido ou checkpoint não existe

**Solução:**
```bash
# Listar checkpoints disponíveis
./scripts/list_checkpoints.sh

# Usar ID válido
./scripts/rollback_checkpoint.sh [ID_VALIDO]
```

---

### **Erro: "Há mudanças não commitadas"**

**Causa:** Há arquivos modificados não commitados

**Solução 1 - Fazer commit:**
```bash
git add .
git commit -m "Descrição das mudanças"
./scripts/post_deploy_checkpoint.sh "Descrição"
```

**Solução 2 - Descartar mudanças:**
```bash
git reset --hard HEAD
./scripts/post_deploy_checkpoint.sh "Descrição"
```

---

### **Erro ao fazer push da tag**

**Causa:** Sem conexão ou sem permissão

**Solução:**
```bash
# Verificar conexão
git remote -v

# Fazer push manual da tag
git push origin [TAG_NAME]
```

---

## 📝 Exemplos Práticos

### **Exemplo 1: Deploy com Sucesso**

```bash
# Situação: Deploy de nova feature funcionou perfeitamente

# 1. Criar checkpoint
./scripts/post_deploy_checkpoint.sh "Implementado sistema de avaliações de produtos"

# Saída:
# ✅ CHECKPOINT #4 CRIADO COM SUCESSO!
# 📂 Tag: checkpoint-4-20251208_180530
# 💡 Para voltar: ./scripts/rollback_checkpoint.sh 4
```

---

### **Exemplo 2: Deploy com Bug (Rollback)**

```bash
# Situação: Deploy causou bug crítico no checkout

# 1. Listar checkpoints
./scripts/list_checkpoints.sh

# Saída:
# #3     2025-12-08 16:45:22    e4f5g6h    Última versão funcionando
# #4     2025-12-08 18:05:30    i7j8k9l    Deploy com bug

# 2. Fazer rollback para checkpoint #3
./scripts/rollback_checkpoint.sh 3

# 3. Confirmar (digite "SIM")
# 4. Confirmar push (digite "s")

# 5. Aguardar deploy automático (2-3 min)

# 6. Verificar se bug foi resolvido

# 7. Corrigir código localmente e fazer novo deploy
```

---

### **Exemplo 3: Desfazer Rollback**

```bash
# Situação: Fez rollback mas era falso alarme

# 1. Verificar tag de backup criada
git tag | grep backup

# Saída:
# backup-before-rollback-20251208_181500

# 2. Voltar para o backup
git checkout backup-before-rollback-20251208_181500
git checkout main
git reset --hard backup-before-rollback-20251208_181500

# 3. Fazer push
git push origin main --force

# 4. Aguardar deploy automático
```

---

## 📞 Suporte

- **Documentação:** Este arquivo (CHECKPOINTS_GUIA.md)
- **Scripts:** Diretório `scripts/`
- **Logs:** `.checkpoints/checkpoint_history.log`
- **Índice:** `.checkpoints/index.json`

---

## 📊 Estatísticas

**Checkpoint Atual:** #1  
**Data de Criação:** 2025-12-08  
**Versão do Sistema:** 1.0  
**Última Atualização:** 2025-12-08 10:08:58 GMT-3

---

**Sistema de checkpoints 100% funcional e pronto para uso! 🎉**
