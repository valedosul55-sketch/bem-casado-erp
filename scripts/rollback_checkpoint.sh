#!/bin/bash
#
# Script de Rollback de Checkpoint
# Restaura o código para um checkpoint anterior
# Uso: ./rollback_checkpoint.sh [CHECKPOINT_ID]
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

# Arquivo de índice de checkpoints
CHECKPOINT_INDEX="$PROJECT_ROOT/.checkpoints/index.json"

# Função para listar checkpoints
list_checkpoints() {
    if [ ! -f "$CHECKPOINT_INDEX" ]; then
        echo -e "${RED}❌ Nenhum checkpoint encontrado!${NC}"
        echo -e "${YELLOW}   Execute um deploy primeiro para criar checkpoints.${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}📋 CHECKPOINTS DISPONÍVEIS${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    python3 -c "
import json

with open('$CHECKPOINT_INDEX', 'r') as f:
    index = json.load(f)

if not index['checkpoints']:
    print('❌ Nenhum checkpoint encontrado!')
    exit(1)

print(f\"{'ID':<6} {'Data/Hora':<22} {'Commit':<10} {'Descrição'}\")
print('-' * 80)

for cp in index['checkpoints']:
    print(f\"#{cp['id']:<5} {cp['datetime']:<22} {cp['commit_short']:<10} {cp['description']}\")

print()
print(f\"Total: {len(index['checkpoints'])} checkpoint(s)\")
"
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
}

# Função para obter informações do checkpoint
get_checkpoint_info() {
    local checkpoint_id=$1
    
    if [ ! -f "$CHECKPOINT_INDEX" ]; then
        echo ""
        return 1
    fi
    
    python3 -c "
import json
import sys

with open('$CHECKPOINT_INDEX', 'r') as f:
    index = json.load(f)

checkpoint = next((cp for cp in index['checkpoints'] if cp['id'] == $checkpoint_id), None)

if checkpoint:
    print(checkpoint['tag'])
    print(checkpoint['commit'])
    print(checkpoint['datetime'])
    print(checkpoint['description'])
else:
    sys.exit(1)
"
}

# Verificar se foi fornecido o ID do checkpoint
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  Nenhum checkpoint especificado!${NC}"
    echo ""
    list_checkpoints
    echo ""
    echo -e "${YELLOW}Uso: ./rollback_checkpoint.sh [CHECKPOINT_ID]${NC}"
    echo -e "${YELLOW}Exemplo: ./rollback_checkpoint.sh 5${NC}"
    exit 1
fi

CHECKPOINT_ID=$1

# Obter informações do checkpoint
CHECKPOINT_INFO=$(get_checkpoint_info "$CHECKPOINT_ID")

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Checkpoint #${CHECKPOINT_ID} não encontrado!${NC}"
    echo ""
    list_checkpoints
    exit 1
fi

# Extrair informações
TAG_NAME=$(echo "$CHECKPOINT_INFO" | sed -n '1p')
COMMIT_HASH=$(echo "$CHECKPOINT_INFO" | sed -n '2p')
DATETIME=$(echo "$CHECKPOINT_INFO" | sed -n '3p')
DESCRIPTION=$(echo "$CHECKPOINT_INFO" | sed -n '4p')
COMMIT_SHORT=$(echo "$COMMIT_HASH" | cut -c1-7)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔄 ROLLBACK PARA CHECKPOINT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}📌 Checkpoint ID:${NC} #${CHECKPOINT_ID}"
echo -e "${GREEN}📅 Data/Hora:${NC} ${DATETIME}"
echo -e "${GREEN}📝 Descrição:${NC} ${DESCRIPTION}"
echo -e "${GREEN}🏷️  Git Tag:${NC} ${TAG_NAME}"
echo -e "${GREEN}📦 Commit:${NC} ${COMMIT_SHORT}"
echo ""

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}⚠️  ATENÇÃO: Há mudanças não commitadas!${NC}"
    echo -e "${YELLOW}   Essas mudanças serão perdidas se continuar.${NC}"
    echo ""
    echo -e "${YELLOW}Mudanças detectadas:${NC}"
    git status --short
    echo ""
    read -p "Deseja continuar mesmo assim? (digite 'SIM' para confirmar): " confirm
    if [ "$confirm" != "SIM" ]; then
        echo -e "${RED}❌ Rollback cancelado!${NC}"
        exit 1
    fi
    echo ""
fi

# Confirmação final
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação irá:${NC}"
echo -e "   1. Descartar todas as mudanças atuais"
echo -e "   2. Voltar o código para o checkpoint #${CHECKPOINT_ID}"
echo -e "   3. Fazer push forçado para o GitHub (se confirmado)"
echo ""
read -p "Tem certeza que deseja fazer o rollback? (digite 'SIM' para confirmar): " confirm

if [ "$confirm" != "SIM" ]; then
    echo -e "${RED}❌ Rollback cancelado!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Iniciando rollback...${NC}"
echo ""

# Fazer backup do estado atual (caso queira voltar)
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_BRANCH=$(git branch --show-current)
BACKUP_TAG="backup-before-rollback-$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}📦 Criando backup do estado atual...${NC}"
git tag -a "$BACKUP_TAG" -m "Backup automático antes do rollback para checkpoint #${CHECKPOINT_ID}"
echo -e "${GREEN}✅ Backup criado: ${BACKUP_TAG}${NC}"
echo -e "${YELLOW}   (Para voltar ao estado atual: git checkout ${BACKUP_TAG})${NC}"
echo ""

# Fazer checkout para o commit do checkpoint
echo -e "${BLUE}🔄 Voltando para o checkpoint #${CHECKPOINT_ID}...${NC}"
git checkout "$COMMIT_HASH"
echo -e "${GREEN}✅ Código restaurado para o checkpoint #${CHECKPOINT_ID}${NC}"
echo ""

# Voltar para a branch principal
echo -e "${BLUE}🔄 Atualizando branch ${CURRENT_BRANCH}...${NC}"
git checkout "$CURRENT_BRANCH"
git reset --hard "$COMMIT_HASH"
echo -e "${GREEN}✅ Branch ${CURRENT_BRANCH} atualizada${NC}"
echo ""

# Perguntar se deseja fazer push
echo -e "${YELLOW}⚠️  Deseja fazer push forçado para o GitHub?${NC}"
echo -e "${YELLOW}   Isso irá atualizar o repositório remoto e disparar novo deploy.${NC}"
echo ""
read -p "Fazer push para GitHub? (s/n): " push_confirm

if [ "$push_confirm" = "s" ] || [ "$push_confirm" = "S" ]; then
    echo ""
    echo -e "${BLUE}📤 Fazendo push forçado para GitHub...${NC}"
    git push origin "$CURRENT_BRANCH" --force
    echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
    echo -e "${GREEN}   O Railway detectará a mudança e fará deploy automaticamente.${NC}"
else
    echo -e "${YELLOW}⚠️  Push não realizado.${NC}"
    echo -e "${YELLOW}   Execute manualmente quando estiver pronto:${NC}"
    echo -e "${YELLOW}   git push origin ${CURRENT_BRANCH} --force${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ ROLLBACK CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📊 Resumo:${NC}"
echo -e "   • Código restaurado para checkpoint #${CHECKPOINT_ID}"
echo -e "   • Commit: ${COMMIT_SHORT}"
echo -e "   • Data do checkpoint: ${DATETIME}"
echo -e "   • Backup do estado anterior: ${BACKUP_TAG}"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "   1. Verifique se o código está correto"
echo -e "   2. Teste localmente se necessário"
echo -e "   3. Aguarde o deploy automático no Railway"
echo -e "   4. Teste em produção"
echo ""
echo -e "${YELLOW}⚠️  Para voltar ao estado anterior (desfazer rollback):${NC}"
echo -e "   ${GREEN}git checkout ${BACKUP_TAG}${NC}"
echo -e "   ${GREEN}git checkout ${CURRENT_BRANCH}${NC}"
echo -e "   ${GREEN}git reset --hard ${BACKUP_TAG}${NC}"
echo -e "   ${GREEN}git push origin ${CURRENT_BRANCH} --force${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
