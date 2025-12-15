#!/bin/bash

#############################################
# Script de Backup do Banco de Dados
# Projeto: Loja Bem Casado
# Autor: Manus AI
# Data: 2024-12-14
#############################################

# Configurações (edite conforme necessário)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-bem_casado}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/backups/database}"
S3_BUCKET="${S3_BUCKET:-s3://seu-bucket/backups/database}"
RETENTION_DAYS=30
S3_RETENTION_DAYS=90

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Verificar se pg_dump está instalado
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump não encontrado. Instale o PostgreSQL client."
    exit 1
fi

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Nome do arquivo de backup
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DATE}.dump"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

log "Iniciando backup do banco de dados..."
log "Banco: $DB_NAME @ $DB_HOST:$DB_PORT"
log "Arquivo: $BACKUP_FILE"

# Fazer backup
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_FILE"; then
    log "Backup criado com sucesso!"
    
    # Comprimir
    log "Comprimindo backup..."
    if gzip "$BACKUP_FILE"; then
        log "Backup comprimido: $BACKUP_FILE_GZ"
        
        # Tamanho do arquivo
        SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
        log "Tamanho: $SIZE"
        
        # Upload para S3 (se configurado)
        if command -v aws &> /dev/null && [ -n "$S3_BUCKET" ]; then
            log "Enviando para S3..."
            if aws s3 cp "$BACKUP_FILE_GZ" "$S3_BUCKET/"; then
                log "Upload para S3 concluído!"
            else
                warning "Falha no upload para S3"
            fi
        else
            warning "AWS CLI não encontrado ou S3_BUCKET não configurado. Pulando upload."
        fi
        
        # Limpar backups antigos localmente
        log "Limpando backups locais antigos (>${RETENTION_DAYS} dias)..."
        find "$BACKUP_DIR" -name "backup_*.dump.gz" -mtime +$RETENTION_DAYS -delete
        
        # Limpar backups antigos no S3
        if command -v aws &> /dev/null && [ -n "$S3_BUCKET" ]; then
            log "Limpando backups antigos no S3 (>${S3_RETENTION_DAYS} dias)..."
            aws s3 ls "$S3_BUCKET/" | grep "backup_" | sort | head -n -$S3_RETENTION_DAYS | awk '{print $4}' | xargs -I {} aws s3 rm "$S3_BUCKET/{}"
        fi
        
        log "Backup concluído com sucesso!"
        log "Arquivo: $BACKUP_FILE_GZ"
        
    else
        error "Falha ao comprimir backup"
        exit 1
    fi
else
    error "Falha ao criar backup"
    exit 1
fi

# Listar backups existentes
log "Backups locais disponíveis:"
ls -lh "$BACKUP_DIR"/backup_*.dump.gz | tail -5

exit 0
