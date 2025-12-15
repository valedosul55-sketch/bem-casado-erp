#!/bin/bash
# Lista todos os checkpoints disponíveis

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECKPOINT_INDEX="$PROJECT_ROOT/.checkpoints/index.json"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ ! -f "$CHECKPOINT_INDEX" ]; then
    echo -e "${RED}❌ Nenhum checkpoint encontrado!${NC}"
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
echo -e "${YELLOW}💡 Para fazer rollback:${NC}"
echo -e "   ${GREEN}./scripts/rollback_checkpoint.sh [ID]${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
