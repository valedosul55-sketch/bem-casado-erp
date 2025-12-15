#!/usr/bin/env python3
"""
Script para criar checkpoints automáticos no projeto Bem Casado Loja.
Gera ID sequencial com data e horário para cada alteração.
"""

import os
import sys
from datetime import datetime
import pytz

# Configurações
CHANGELOG_PATH = os.path.join(os.path.dirname(__file__), '..', 'CHANGELOG_CHECKPOINTS.md')
TIMEZONE = pytz.timezone('America/Sao_Paulo')  # GMT-3

# Tipos de checkpoint disponíveis
CHECKPOINT_TYPES = [
    "Migração de Banco de Dados",
    "Cadastro de Produtos",
    "Correção de Backend",
    "Correção de Frontend",
    "Deploy/Rebuild",
    "Limpeza de Banco de Dados",
    "Configuração",
    "Documentação",
    "Teste",
    "Hotfix",
    "Feature",
    "Refatoração",
]


def get_next_checkpoint_id():
    """Lê o arquivo de changelog e retorna o próximo ID de checkpoint."""
    if not os.path.exists(CHANGELOG_PATH):
        return 1
    
    with open(CHANGELOG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Procurar por "CHECKPOINT #XXX"
    import re
    matches = re.findall(r'CHECKPOINT #(\d+)', content)
    
    if not matches:
        return 1
    
    # Retornar o maior ID + 1
    max_id = max(int(m) for m in matches)
    return max_id + 1


def get_current_datetime():
    """Retorna data e hora atual no timezone configurado."""
    now = datetime.now(TIMEZONE)
    return now.strftime('%Y-%m-%d %H:%M:%S GMT-3')


def create_checkpoint_template(checkpoint_id, checkpoint_type, author, description):
    """Cria o template do checkpoint."""
    datetime_str = get_current_datetime()
    
    template = f"""
## 🔖 CHECKPOINT #{checkpoint_id:03d}
**Data/Hora:** {datetime_str}  
**Tipo:** {checkpoint_type}  
**Autor:** {author}

### Descrição:
{description}

### Alterações:
- [ ] Alteração 1
- [ ] Alteração 2
- [ ] Alteração 3

### Arquivos Afetados:
- `caminho/para/arquivo1.ts`
- `caminho/para/arquivo2.tsx`

### Commit:
- Hash: [hash do commit]
- Mensagem: "[mensagem do commit]"
- Branch: main

### Testes:
- [ ] Teste 1
- [ ] Teste 2
- [ ] Teste 3

---
"""
    return template


def append_checkpoint_to_changelog(checkpoint_content):
    """Adiciona o checkpoint ao arquivo de changelog."""
    if not os.path.exists(CHANGELOG_PATH):
        print(f"❌ Erro: Arquivo {CHANGELOG_PATH} não encontrado!")
        return False
    
    with open(CHANGELOG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Encontrar a posição para inserir (antes do "Resumo de Checkpoints")
    insert_marker = "## 📊 Resumo de Checkpoints"
    
    if insert_marker in content:
        parts = content.split(insert_marker)
        new_content = parts[0] + checkpoint_content + "\n" + insert_marker + parts[1]
    else:
        # Se não encontrar o marcador, adiciona no final
        new_content = content + "\n" + checkpoint_content
    
    # Escrever de volta
    with open(CHANGELOG_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True


def update_summary_table(checkpoint_id, checkpoint_type):
    """Atualiza a tabela de resumo no changelog."""
    if not os.path.exists(CHANGELOG_PATH):
        return
    
    with open(CHANGELOG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    datetime_str = get_current_datetime()
    
    # Adicionar linha na tabela de resumo
    table_marker = "| #006 | 2025-12-08 08:52:15 | Limpeza DB | ✅ Concluído |"
    new_row = f"| #{checkpoint_id:03d} | {datetime_str} | {checkpoint_type} | ✅ Concluído |"
    
    if table_marker in content:
        content = content.replace(table_marker, f"{table_marker}\n{new_row}")
    
    # Atualizar "Próximo Checkpoint ID"
    import re
    content = re.sub(
        r'\*\*Próximo Checkpoint ID:\*\* #\d+',
        f'**Próximo Checkpoint ID:** #{checkpoint_id + 1:03d}',
        content
    )
    
    # Atualizar "Última Atualização"
    content = re.sub(
        r'\*\*Última Atualização:\*\* [\d\-: GMT\-3]+',
        f'**Última Atualização:** {datetime_str}',
        content
    )
    
    with open(CHANGELOG_PATH, 'w', encoding='utf-8') as f:
        f.write(content)


def interactive_mode():
    """Modo interativo para criar checkpoint."""
    print("=" * 60)
    print("🔖 CRIAR NOVO CHECKPOINT")
    print("=" * 60)
    print()
    
    # Obter próximo ID
    next_id = get_next_checkpoint_id()
    print(f"📌 Próximo Checkpoint ID: #{next_id:03d}")
    print()
    
    # Selecionar tipo
    print("📋 Tipos de Checkpoint Disponíveis:")
    for i, ctype in enumerate(CHECKPOINT_TYPES, 1):
        print(f"  {i}. {ctype}")
    print()
    
    while True:
        try:
            type_choice = int(input("Selecione o tipo (número): "))
            if 1 <= type_choice <= len(CHECKPOINT_TYPES):
                checkpoint_type = CHECKPOINT_TYPES[type_choice - 1]
                break
            else:
                print("❌ Número inválido! Tente novamente.")
        except ValueError:
            print("❌ Digite um número válido!")
    
    print()
    
    # Obter autor
    author = input("👤 Autor (ex: Manus AI, Nome do Dev): ").strip()
    if not author:
        author = "Manus AI"
    
    print()
    
    # Obter descrição
    print("📝 Descrição da alteração (pressione Enter duas vezes para finalizar):")
    description_lines = []
    while True:
        line = input()
        if line == "" and description_lines and description_lines[-1] == "":
            break
        description_lines.append(line)
    
    description = "\n".join(description_lines).strip()
    
    if not description:
        description = "[Adicione a descrição aqui]"
    
    print()
    print("=" * 60)
    print("✅ Criando checkpoint...")
    print()
    
    # Criar checkpoint
    checkpoint_content = create_checkpoint_template(next_id, checkpoint_type, author, description)
    
    # Adicionar ao changelog
    if append_checkpoint_to_changelog(checkpoint_content):
        update_summary_table(next_id, checkpoint_type)
        print(f"✅ Checkpoint #{next_id:03d} criado com sucesso!")
        print(f"📄 Arquivo: {CHANGELOG_PATH}")
        print()
        print("⚠️  Lembre-se de preencher:")
        print("   - Alterações realizadas")
        print("   - Arquivos afetados")
        print("   - Informações do commit")
        print("   - Testes realizados")
    else:
        print("❌ Erro ao criar checkpoint!")
        return 1
    
    return 0


def quick_mode(checkpoint_type, description, author="Manus AI"):
    """Modo rápido para criar checkpoint via linha de comando."""
    next_id = get_next_checkpoint_id()
    
    checkpoint_content = create_checkpoint_template(next_id, checkpoint_type, author, description)
    
    if append_checkpoint_to_changelog(checkpoint_content):
        update_summary_table(next_id, checkpoint_type)
        print(f"✅ Checkpoint #{next_id:03d} criado com sucesso!")
        return 0
    else:
        print("❌ Erro ao criar checkpoint!")
        return 1


def main():
    """Função principal."""
    if len(sys.argv) == 1:
        # Modo interativo
        return interactive_mode()
    elif len(sys.argv) >= 3:
        # Modo rápido: python create_checkpoint.py "Tipo" "Descrição" ["Autor"]
        checkpoint_type = sys.argv[1]
        description = sys.argv[2]
        author = sys.argv[3] if len(sys.argv) > 3 else "Manus AI"
        
        if checkpoint_type not in CHECKPOINT_TYPES:
            print(f"❌ Tipo inválido: {checkpoint_type}")
            print("Tipos disponíveis:")
            for ctype in CHECKPOINT_TYPES:
                print(f"  - {ctype}")
            return 1
        
        return quick_mode(checkpoint_type, description, author)
    else:
        print("Uso:")
        print("  Modo interativo: python create_checkpoint.py")
        print("  Modo rápido: python create_checkpoint.py \"Tipo\" \"Descrição\" [\"Autor\"]")
        return 1


if __name__ == "__main__":
    sys.exit(main())
