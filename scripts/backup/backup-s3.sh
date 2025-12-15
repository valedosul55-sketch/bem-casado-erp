#!/bin/bash

#############################################
# Script de Backup de Arquivos S3
# Projeto: Loja Bem Casado
# Autor: Manus AI
# Data: 2024-12-14
#############################################

# Configurações (edite conforme necessário)
SOURCE_BUCKET="${SOURCE_BUCKET:-s3://bucket-producao/bem-casado/}"
BACKUP_BUCKET="${BACKUP_BUCKET:-s3://bucket-backup/bem-casado/}"
DATE=$(date +%Y%m%d)

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

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    error "AWS CLI não encontrado. Instale com: pip install awscli"
    exit 1
fi

# Verificar credenciais AWS
if ! aws sts get-caller-identity &> /dev/null; then
    error "Credenciais AWS não configuradas. Execute: aws configure"
    exit 1
fi

log "Iniciando backup de arquivos S3..."
log "Origem: $SOURCE_BUCKET"
log "Destino: ${BACKUP_BUCKET}${DATE}/"

# Sincronizar arquivos
if aws s3 sync "$SOURCE_BUCKET" "${BACKUP_BUCKET}${DATE}/" --storage-class STANDARD_IA; then
    log "Backup de arquivos S3 concluído com sucesso!"
    
    # Contar arquivos
    FILE_COUNT=$(aws s3 ls "${BACKUP_BUCKET}${DATE}/" --recursive | wc -l)
    log "Total de arquivos: $FILE_COUNT"
    
    # Calcular tamanho total
    TOTAL_SIZE=$(aws s3 ls "${BACKUP_BUCKET}${DATE}/" --recursive --summarize | grep "Total Size" | awk '{print $3}')
    if [ -n "$TOTAL_SIZE" ]; then
        SIZE_MB=$((TOTAL_SIZE / 1024 / 1024))
        log "Tamanho total: ${SIZE_MB} MB"
    fi
    
else
    error "Falha no backup de arquivos S3"
    exit 1
fi

# Listar backups existentes
log "Backups disponíveis:"
aws s3 ls "$BACKUP_BUCKET" | tail -5

exit 0
