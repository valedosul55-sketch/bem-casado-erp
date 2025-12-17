#!/bin/bash

# ============================================
# Script de Verificação Pré-Deploy
# ERP Bem Casado
# ============================================
# Execute antes de fazer push para o GitHub
# Uso: ./scripts/pre-deploy.sh
# ============================================

set -e  # Para no primeiro erro

echo ""
echo "🔍 =========================================="
echo "   VERIFICAÇÃO PRÉ-DEPLOY - ERP Bem Casado"
echo "==========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar se estamos no diretório correto
echo "📁 Verificando diretório..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Diretório OK${NC}"
echo ""

# 2. Verificar dependências
echo "📦 Verificando dependências..."
if ! pnpm install --frozen-lockfile 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Instalando dependências...${NC}"
    pnpm install
fi
echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

# 3. Verificar TypeScript (build)
echo "🔧 Verificando TypeScript..."
if pnpm build 2>&1 | tee /tmp/build-output.txt | grep -q "error TS"; then
    echo -e "${RED}❌ Erros de TypeScript encontrados:${NC}"
    grep "error TS" /tmp/build-output.txt
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ TypeScript OK${NC}"
fi
echo ""

# 4. Rodar testes
echo "🧪 Rodando testes..."
if pnpm test 2>&1; then
    echo -e "${GREEN}✅ Testes OK${NC}"
else
    echo -e "${RED}❌ Testes falharam${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Verificar variáveis de ambiente necessárias
echo "🔐 Verificando variáveis de ambiente documentadas..."
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "RESEND_API_KEY"
)

echo "   Variáveis necessárias no Railway:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "   - $var"
done
echo -e "${GREEN}✅ Lista de variáveis documentada${NC}"
echo ""

# 6. Verificar se há alterações não commitadas
echo "📝 Verificando status do Git..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Há alterações não commitadas:${NC}"
    git status --short
else
    echo -e "${GREEN}✅ Working directory limpo${NC}"
fi
echo ""

# Resultado final
echo "==========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🚀 PRONTO PARA DEPLOY!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. git add -A"
    echo "  2. git commit -m 'sua mensagem'"
    echo "  3. git push origin main"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ENCONTRADOS $ERRORS ERRO(S)${NC}"
    echo "Corrija os erros antes de fazer deploy."
    echo ""
    exit 1
fi
