# 🚀 Guia Rápido - Sistema de Checkpoints

Referência rápida para criar checkpoints no projeto Bem Casado Loja.

---

## 📝 Criar Checkpoint (Modo Interativo)

```bash
cd /home/ubuntu/bem_casado_loja
python3 scripts/create_checkpoint.py
```

Siga as instruções na tela.

---

## ⚡ Criar Checkpoint (Modo Rápido)

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

## 📋 Tipos Disponíveis

1. Migração de Banco de Dados
2. Cadastro de Produtos
3. Correção de Backend
4. Correção de Frontend
5. Deploy/Rebuild
6. Limpeza de Banco de Dados
7. Configuração
8. Documentação
9. Teste
10. Hotfix
11. Feature
12. Refatoração

---

## ✅ Workflow Completo

```bash
# 1. Criar checkpoint
python3 scripts/create_checkpoint.py

# 2. Fazer alterações no código
# ... (editar arquivos)

# 3. Testar
# ... (rodar testes)

# 4. Commit
git add .
git commit -m "feat: Descrição da alteração"
git push origin main

# 5. Atualizar checkpoint no CHANGELOG_CHECKPOINTS.md
# - Preencher alterações
# - Preencher arquivos afetados
# - Adicionar hash do commit
# - Adicionar testes realizados

# 6. Commit do changelog
git add CHANGELOG_CHECKPOINTS.md
git commit -m "docs: Atualizar checkpoint #XXX"
git push origin main
```

---

## 📂 Arquivos Importantes

- **CHANGELOG_CHECKPOINTS.md** - Histórico de todos os checkpoints
- **scripts/create_checkpoint.py** - Script para criar checkpoints
- **docs/COMO_USAR_CHECKPOINTS.md** - Documentação completa

---

## 🔍 Ver Checkpoints

```bash
# Ver arquivo completo
cat CHANGELOG_CHECKPOINTS.md

# Ver apenas resumo
grep "CHECKPOINT #" CHANGELOG_CHECKPOINTS.md

# Ver checkpoint específico
grep -A 30 "CHECKPOINT #007" CHANGELOG_CHECKPOINTS.md
```

---

## 💡 Dicas

- ✅ Crie checkpoint **antes** de fazer alterações
- ✅ Seja **detalhado** na descrição
- ✅ Liste **todos** os arquivos afetados
- ✅ Registre **todos** os testes
- ✅ Faça commit do changelog **junto** com o código

---

## 🆘 Ajuda

Documentação completa: `docs/COMO_USAR_CHECKPOINTS.md`

---

**Última Atualização:** 2025-12-08 10:58:00 GMT-3
