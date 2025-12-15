#!/usr/bin/env python3
"""
Sistema de Checkpoint com Backup Completo
Permite criar snapshots do código e reverter para estados anteriores
"""

import os
import sys
import shutil
import json
from datetime import datetime
import pytz

# Configurações
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKPOINTS_DIR = os.path.join(PROJECT_ROOT, '.checkpoints')
CHECKPOINT_INDEX = os.path.join(CHECKPOINTS_DIR, 'index.json')
TIMEZONE = pytz.timezone('America/Sao_Paulo')  # GMT-3

# Diretórios e arquivos a incluir no backup
BACKUP_INCLUDES = [
    'client/src',
    'server',
    'shared',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    '.env.example',
]

# Diretórios a excluir do backup
BACKUP_EXCLUDES = [
    'node_modules',
    'dist',
    'build',
    '.git',
    '.checkpoints',
    '__pycache__',
    '.env',
    '.DS_Store',
]


def get_next_checkpoint_id():
    """Retorna o próximo ID de checkpoint."""
    if not os.path.exists(CHECKPOINT_INDEX):
        return 1
    
    with open(CHECKPOINT_INDEX, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    if not index['checkpoints']:
        return 1
    
    max_id = max(cp['id'] for cp in index['checkpoints'])
    return max_id + 1


def get_current_datetime():
    """Retorna data e hora atual no timezone configurado."""
    now = datetime.now(TIMEZONE)
    return now.strftime('%Y-%m-%d %H:%M:%S GMT-3')


def get_current_datetime_filename():
    """Retorna data e hora para nome de arquivo."""
    now = datetime.now(TIMEZONE)
    return now.strftime('%Y%m%d_%H%M%S')


def initialize_checkpoints_dir():
    """Inicializa o diretório de checkpoints."""
    if not os.path.exists(CHECKPOINTS_DIR):
        os.makedirs(CHECKPOINTS_DIR)
        print(f"✅ Diretório de checkpoints criado: {CHECKPOINTS_DIR}")
    
    if not os.path.exists(CHECKPOINT_INDEX):
        index = {
            'version': '1.0',
            'created_at': get_current_datetime(),
            'checkpoints': []
        }
        with open(CHECKPOINT_INDEX, 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2, ensure_ascii=False)
        print(f"✅ Índice de checkpoints criado: {CHECKPOINT_INDEX}")


def should_exclude(path, excludes):
    """Verifica se o caminho deve ser excluído."""
    for exclude in excludes:
        if exclude in path:
            return True
    return False


def create_backup(checkpoint_id, description, author):
    """Cria backup completo do código."""
    datetime_str = get_current_datetime()
    datetime_filename = get_current_datetime_filename()
    
    # Nome do diretório do checkpoint
    checkpoint_name = f"checkpoint_{checkpoint_id:03d}_{datetime_filename}"
    checkpoint_path = os.path.join(CHECKPOINTS_DIR, checkpoint_name)
    
    print(f"\n📦 Criando backup do checkpoint #{checkpoint_id:03d}...")
    print(f"📂 Destino: {checkpoint_path}")
    print()
    
    # Criar diretório do checkpoint
    os.makedirs(checkpoint_path, exist_ok=True)
    
    # Copiar arquivos e diretórios
    total_files = 0
    total_size = 0
    
    for item in BACKUP_INCLUDES:
        source = os.path.join(PROJECT_ROOT, item)
        
        if not os.path.exists(source):
            print(f"⚠️  Ignorando (não existe): {item}")
            continue
        
        if os.path.isfile(source):
            # Copiar arquivo
            dest = os.path.join(checkpoint_path, item)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copy2(source, dest)
            size = os.path.getsize(source)
            total_files += 1
            total_size += size
            print(f"✅ Copiado: {item} ({size:,} bytes)")
        
        elif os.path.isdir(source):
            # Copiar diretório
            dest = os.path.join(checkpoint_path, item)
            
            for root, dirs, files in os.walk(source):
                # Filtrar diretórios excluídos
                dirs[:] = [d for d in dirs if not should_exclude(d, BACKUP_EXCLUDES)]
                
                for file in files:
                    if should_exclude(file, BACKUP_EXCLUDES):
                        continue
                    
                    src_file = os.path.join(root, file)
                    rel_path = os.path.relpath(src_file, PROJECT_ROOT)
                    dest_file = os.path.join(checkpoint_path, rel_path)
                    
                    os.makedirs(os.path.dirname(dest_file), exist_ok=True)
                    shutil.copy2(src_file, dest_file)
                    
                    size = os.path.getsize(src_file)
                    total_files += 1
                    total_size += size
            
            print(f"✅ Copiado: {item}/ ({total_files} arquivos)")
    
    print()
    print(f"📊 Total: {total_files} arquivos, {total_size:,} bytes ({total_size / 1024 / 1024:.2f} MB)")
    
    # Criar arquivo de metadados
    metadata = {
        'id': checkpoint_id,
        'datetime': datetime_str,
        'description': description,
        'author': author,
        'files_count': total_files,
        'total_size': total_size,
        'backup_path': checkpoint_name,
    }
    
    metadata_file = os.path.join(checkpoint_path, 'checkpoint_metadata.json')
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Metadados salvos: checkpoint_metadata.json")
    
    return metadata


def update_index(metadata):
    """Atualiza o índice de checkpoints."""
    with open(CHECKPOINT_INDEX, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    index['checkpoints'].append(metadata)
    index['last_updated'] = get_current_datetime()
    
    with open(CHECKPOINT_INDEX, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Índice atualizado")


def list_checkpoints():
    """Lista todos os checkpoints disponíveis."""
    if not os.path.exists(CHECKPOINT_INDEX):
        print("❌ Nenhum checkpoint encontrado!")
        return []
    
    with open(CHECKPOINT_INDEX, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    return index['checkpoints']


def create_checkpoint_interactive():
    """Modo interativo para criar checkpoint."""
    print("=" * 70)
    print("🔖 CRIAR CHECKPOINT COM BACKUP COMPLETO")
    print("=" * 70)
    print()
    
    # Obter próximo ID
    next_id = get_next_checkpoint_id()
    print(f"📌 Próximo Checkpoint ID: #{next_id:03d}")
    print()
    
    # Obter descrição
    description = input("📝 Descrição da alteração: ").strip()
    if not description:
        description = "Checkpoint sem descrição"
    
    print()
    
    # Obter autor
    author = input("👤 Autor (pressione Enter para 'Manus AI'): ").strip()
    if not author:
        author = "Manus AI"
    
    print()
    print("=" * 70)
    
    # Confirmar
    confirm = input("⚠️  Criar checkpoint com backup completo? (s/n): ").strip().lower()
    if confirm != 's':
        print("❌ Operação cancelada!")
        return 1
    
    print()
    
    # Inicializar diretório de checkpoints
    initialize_checkpoints_dir()
    
    # Criar backup
    metadata = create_backup(next_id, description, author)
    
    # Atualizar índice
    update_index(metadata)
    
    print()
    print("=" * 70)
    print(f"✅ Checkpoint #{next_id:03d} criado com sucesso!")
    print(f"📂 Backup salvo em: .checkpoints/{metadata['backup_path']}")
    print()
    print("💡 Para restaurar este checkpoint:")
    print(f"   python3 scripts/checkpoint_restore.py {next_id}")
    print("=" * 70)
    
    return 0


def create_checkpoint_quick(description, author="Manus AI"):
    """Modo rápido para criar checkpoint."""
    next_id = get_next_checkpoint_id()
    
    print(f"🔖 Criando checkpoint #{next_id:03d}...")
    print()
    
    # Inicializar diretório de checkpoints
    initialize_checkpoints_dir()
    
    # Criar backup
    metadata = create_backup(next_id, description, author)
    
    # Atualizar índice
    update_index(metadata)
    
    print()
    print(f"✅ Checkpoint #{next_id:03d} criado com sucesso!")
    print(f"📂 Backup: .checkpoints/{metadata['backup_path']}")
    print(f"💡 Restaurar: python3 scripts/checkpoint_restore.py {next_id}")
    
    return 0


def main():
    """Função principal."""
    if len(sys.argv) == 1:
        # Modo interativo
        return create_checkpoint_interactive()
    elif len(sys.argv) == 2 and sys.argv[1] == 'list':
        # Listar checkpoints
        checkpoints = list_checkpoints()
        if not checkpoints:
            print("❌ Nenhum checkpoint encontrado!")
            return 1
        
        print("=" * 100)
        print("📋 CHECKPOINTS DISPONÍVEIS")
        print("=" * 100)
        print()
        print(f"{'ID':<6} {'Data/Hora':<22} {'Autor':<15} {'Arquivos':<10} {'Tamanho':<12} {'Descrição'}")
        print("-" * 100)
        
        for cp in checkpoints:
            size_mb = cp['total_size'] / 1024 / 1024
            print(f"#{cp['id']:<5} {cp['datetime']:<22} {cp['author']:<15} {cp['files_count']:<10} {size_mb:>8.2f} MB   {cp['description']}")
        
        print()
        print(f"Total: {len(checkpoints)} checkpoint(s)")
        print("=" * 100)
        return 0
    elif len(sys.argv) >= 2:
        # Modo rápido
        description = sys.argv[1]
        author = sys.argv[2] if len(sys.argv) > 2 else "Manus AI"
        return create_checkpoint_quick(description, author)
    else:
        print("Uso:")
        print("  Modo interativo: python3 checkpoint_backup.py")
        print("  Modo rápido: python3 checkpoint_backup.py \"Descrição\" [\"Autor\"]")
        print("  Listar: python3 checkpoint_backup.py list")
        return 1


if __name__ == "__main__":
    sys.exit(main())
