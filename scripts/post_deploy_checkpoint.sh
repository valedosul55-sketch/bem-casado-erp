#!/bin/bash
#
# Script de Checkpoint Pós-Deploy
# Cria checkpoint automático após cada deploy bem-sucedido
# Uso: ./post_deploy_checkpoint.sh "Descrição do deploy"
#

set -e  # Parar em caso de erro

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Arquivo de log de checkpoints
CHECKPOINT_LOG="$PROJECT_ROOT/.checkpoints/checkpoint_history.log"
CHECKPOINT_INDEX="$PROJECT_ROOT/.checkpoints/index.json"

# Criar diretório de checkpoints se não existir
mkdir -p "$PROJECT_ROOT/.checkpoints"

# Função para obter próximo ID de checkpoint
get_next_checkpoint_id() {
    if [ ! -f "$CHECKPOINT_LOG" ]; then
        echo "1"
        return
    fi
    
    # Pegar o último ID e incrementar
    last_id=$(grep -oP 'CHECKPOINT #\K\d+' "$CHECKPOINT_LOG" | tail -1)
    if [ -z "$last_id" ]; then
        echo "1"
    else
        echo $((last_id + 1))
    fi
}

# Função para obter data/hora atual
get_datetime() {
    date '+%Y-%m-%d %H:%M:%S GMT-3'
}

# Função para obter data/hora para tag
get_datetime_tag() {
    date '+%Y%m%d_%H%M%S'
}

# Obter descrição do deploy
DESCRIPTION="${1:-Deploy automático}"

# Obter próximo ID
CHECKPOINT_ID=$(get_next_checkpoint_id)
DATETIME=$(get_datetime)
DATETIME_TAG=$(get_datetime_tag)

# Nome da tag Git
TAG_NAME="checkpoint-${CHECKPOINT_ID}-${DATETIME_TAG}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔖 CRIANDO CHECKPOINT PÓS-DEPLOY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}📌 Checkpoint ID:${NC} #${CHECKPOINT_ID}"
echo -e "${GREEN}📅 Data/Hora:${NC} ${DATETIME}"
echo -e "${GREEN}📝 Descrição:${NC} ${DESCRIPTION}"
echo -e "${GREEN}🏷️  Git Tag:${NC} ${TAG_NAME}"
echo ""

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas!${NC}"
    echo -e "${YELLOW}   Fazendo commit automático...${NC}"
    git add -A
    git commit -m "chore: Commit automático antes do checkpoint #${CHECKPOINT_ID}"
    echo -e "${GREEN}✅ Commit realizado${NC}"
    echo ""
fi

# Obter hash do commit atual
COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_SHORT=$(git rev-parse --short HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)
BRANCH=$(git branch --show-current)

echo -e "${GREEN}📦 Commit Atual:${NC}"
echo -e "   Hash: ${COMMIT_SHORT}"
echo -e "   Branch: ${BRANCH}"
echo -e "   Mensagem: ${COMMIT_MESSAGE}"
echo ""

# Criar tag Git anotada
echo -e "${BLUE}🏷️  Criando Git tag...${NC}"
git tag -a "$TAG_NAME" -m "Checkpoint #${CHECKPOINT_ID}: ${DESCRIPTION}

Data/Hora: ${DATETIME}
Commit: ${COMMIT_SHORT}
Branch: ${BRANCH}

Este checkpoint foi criado automaticamente após o deploy.
Para restaurar: ./scripts/rollback_checkpoint.sh ${CHECKPOINT_ID}
"

echo -e "${GREEN}✅ Tag criada: ${TAG_NAME}${NC}"
echo ""

# Push da tag para o repositório remoto
echo -e "${BLUE}📤 Enviando tag para GitHub...${NC}"
if git push origin "$TAG_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Tag enviada para o repositório remoto${NC}"
else
    echo -e "${YELLOW}⚠️  Não foi possível enviar a tag (sem conexão ou sem permissão)${NC}"
fi
echo ""

# Registrar checkpoint no log
echo "========================================" >> "$CHECKPOINT_LOG"
echo "CHECKPOINT #${CHECKPOINT_ID}" >> "$CHECKPOINT_LOG"
echo "Data/Hora: ${DATETIME}" >> "$CHECKPOINT_LOG"
echo "Descrição: ${DESCRIPTION}" >> "$CHECKPOINT_LOG"
echo "Git Tag: ${TAG_NAME}" >> "$CHECKPOINT_LOG"
echo "Commit: ${COMMIT_HASH}" >> "$CHECKPOINT_LOG"
echo "Branch: ${BRANCH}" >> "$CHECKPOINT_LOG"
echo "========================================" >> "$CHECKPOINT_LOG"
echo "" >> "$CHECKPOINT_LOG"

echo -e "${GREEN}✅ Checkpoint registrado no log${NC}"
echo ""

# Criar/atualizar índice JSON
if [ ! -f "$CHECKPOINT_INDEX" ]; then
    echo '{
  "version": "1.0",
  "created_at": "'"${DATETIME}"'",
  "checkpoints": []
}' > "$CHECKPOINT_INDEX"
fi

# Adicionar checkpoint ao índice (usando Python para manipular JSON)
python3 -c "
import json
import sys

index_file = '$CHECKPOINT_INDEX'

with open(index_file, 'r') as f:
    index = json.load(f)

checkpoint = {
    'id': $CHECKPOINT_ID,
    'datetime': '$DATETIME',
    'description': '$DESCRIPTION',
    'tag': '$TAG_NAME',
    'commit': '$COMMIT_HASH',
    'commit_short': '$COMMIT_SHORT',
    'branch': '$BRANCH'
}

index['checkpoints'].append(checkpoint)
index['last_updated'] = '$DATETIME'

with open(index_file, 'w') as f:
    json.dump(index, f, indent=2, ensure_ascii=False)

print('✅ Índice JSON atualizado')
"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ CHECKPOINT #${CHECKPOINT_ID} CRIADO COM SUCESSO!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}💡 Informações Importantes:${NC}"
echo -e "   • Checkpoint salvo como Git tag: ${TAG_NAME}"
echo -e "   • Commit: ${COMMIT_SHORT}"
echo -e "   • Para voltar a este ponto:"
echo -e "     ${GREEN}./scripts/rollback_checkpoint.sh ${CHECKPOINT_ID}${NC}"
echo ""
echo -e "   • Para listar todos os checkpoints:"
echo -e "     ${GREEN}./scripts/list_checkpoints.sh${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
