#!/bin/bash

#############################################
# Script de Backup Completo
# Projeto: Loja Bem Casado
# Autor: Manus AI
# Data: 2024-12-14
#############################################

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO:${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Diretório dos scripts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

log "Iniciando backup completo do projeto Bem Casado..."
log "Diretório do projeto: $PROJECT_DIR"

# Contador de erros
ERRORS=0

# 1. Backup do código-fonte (Git)
section "1. BACKUP DO CÓDIGO-FONTE (GIT)"
cd "$PROJECT_DIR" || exit 1

if git rev-parse --git-dir > /dev/null 2>&1; then
    log "Verificando status do Git..."
    
    # Verificar se há mudanças não commitadas
    if ! git diff-index --quiet HEAD --; then
        warning "Há mudanças não commitadas. Fazendo commit automático..."
        git add .
        git commit -m "Backup automático - $(date +'%Y-%m-%d %H:%M:%S')"
    fi
    
    # Fazer push
    log "Fazendo push para GitHub..."
    if git push origin main; then
        log "✅ Código-fonte enviado para GitHub com sucesso!"
    else
        error "❌ Falha ao fazer push para GitHub"
        ((ERRORS++))
    fi
else
    warning "Não é um repositório Git. Pulando backup do código-fonte."
fi

# 2. Backup do banco de dados
section "2. BACKUP DO BANCO DE DADOS"
if [ -f "$SCRIPT_DIR/backup-database.sh" ]; then
    if bash "$SCRIPT_DIR/backup-database.sh"; then
        log "✅ Backup do banco de dados concluído!"
    else
        error "❌ Falha no backup do banco de dados"
        ((ERRORS++))
    fi
else
    warning "Script backup-database.sh não encontrado. Pulando."
fi

# 3. Backup de arquivos S3
section "3. BACKUP DE ARQUIVOS S3"
if [ -f "$SCRIPT_DIR/backup-s3.sh" ]; then
    if bash "$SCRIPT_DIR/backup-s3.sh"; then
        log "✅ Backup de arquivos S3 concluído!"
    else
        error "❌ Falha no backup de arquivos S3"
        ((ERRORS++))
    fi
else
    warning "Script backup-s3.sh não encontrado. Pulando."
fi

# 4. Backup local completo (tar.gz)
section "4. BACKUP LOCAL COMPLETO"
BACKUP_DIR="/home/ubuntu/backups/complete"
mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bem_casado_complete_${DATE}.tar.gz"

log "Criando arquivo tar.gz do projeto..."
if tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.log' \
    -C "$(dirname "$PROJECT_DIR")" \
    "$(basename "$PROJECT_DIR")"; then
    
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "✅ Backup local criado: $BACKUP_FILE ($SIZE)"
    
    # Upload para S3 (se configurado)
    if command -v aws &> /dev/null && [ -n "$S3_BUCKET" ]; then
        log "Enviando backup completo para S3..."
        if aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/complete/"; then
            log "✅ Backup completo enviado para S3!"
        else
            warning "Falha no upload do backup completo para S3"
        fi
    fi
else
    error "❌ Falha ao criar backup local"
    ((ERRORS++))
fi

# Resumo final
section "RESUMO DO BACKUP"
if [ $ERRORS -eq 0 ]; then
    log "✅ Backup completo concluído com sucesso!"
    log "Nenhum erro encontrado."
else
    warning "⚠️  Backup concluído com $ERRORS erro(s)."
    log "Verifique os logs acima para mais detalhes."
fi

log "Data/Hora: $(date +'%Y-%m-%d %H:%M:%S')"

exit $ERRORS
