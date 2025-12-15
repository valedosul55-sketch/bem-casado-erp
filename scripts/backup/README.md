# 📦 Scripts de Backup - Loja Bem Casado

Scripts automatizados para backup completo do projeto.

---

## 📁 Arquivos

| Script | Descrição | Frequência Recomendada |
|--------|-----------|------------------------|
| `backup-database.sh` | Backup do banco PostgreSQL | Diária (03:00) |
| `backup-s3.sh` | Backup de arquivos S3 | Semanal (Domingo 02:00) |
| `backup-all.sh` | Backup completo (tudo) | Diária (04:00) |

---

## 🚀 Uso Rápido

### **Backup Completo** (Recomendado)
```bash
cd /home/ubuntu/bem_casado_loja
./scripts/backup/backup-all.sh
```

### **Apenas Banco de Dados**
```bash
./scripts/backup/backup-database.sh
```

### **Apenas Arquivos S3**
```bash
./scripts/backup/backup-s3.sh
```

---

## ⚙️ Configuração

### **1. Variáveis de Ambiente**

Crie um arquivo `.env` no diretório do projeto:

```bash
# Banco de Dados
DB_HOST=seu-servidor.com
DB_PORT=5432
DB_NAME=bem_casado
DB_USER=postgres
PGPASSWORD=sua-senha-aqui

# AWS S3
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_DEFAULT_REGION=us-east-1

# Buckets
SOURCE_BUCKET=s3://bucket-producao/bem-casado/
BACKUP_BUCKET=s3://bucket-backup/bem-casado/
S3_BUCKET=seu-bucket-backups

# Diretórios
BACKUP_DIR=/home/ubuntu/backups/database
```

### **2. Carregar Variáveis**

Adicione no início dos scripts ou no seu `.bashrc`:

```bash
export $(grep -v '^#' /home/ubuntu/bem_casado_loja/.env | xargs)
```

---

## ⏰ Agendar Backups Automáticos

### **Usando Cron**

Edite o crontab:
```bash
crontab -e
```

Adicione as linhas:
```bash
# Backup do banco de dados (diário às 03:00)
0 3 * * * cd /home/ubuntu/bem_casado_loja && ./scripts/backup/backup-database.sh >> /var/log/backup-db.log 2>&1

# Backup de arquivos S3 (semanal, domingo às 02:00)
0 2 * * 0 cd /home/ubuntu/bem_casado_loja && ./scripts/backup/backup-s3.sh >> /var/log/backup-s3.log 2>&1

# Backup completo (diário às 04:00)
0 4 * * * cd /home/ubuntu/bem_casado_loja && ./scripts/backup/backup-all.sh >> /var/log/backup-all.log 2>&1
```

### **Verificar Cron Jobs**
```bash
crontab -l
```

---

## 📊 Monitoramento

### **Ver Logs**
```bash
# Banco de dados
tail -f /var/log/backup-db.log

# S3
tail -f /var/log/backup-s3.log

# Completo
tail -f /var/log/backup-all.log
```

### **Verificar Backups Criados**
```bash
# Backups locais do banco
ls -lh /home/ubuntu/backups/database/

# Backups completos
ls -lh /home/ubuntu/backups/complete/

# Backups no S3
aws s3 ls s3://seu-bucket/backups/
```

---

## 🔄 Restauração

### **Restaurar Banco de Dados**

```bash
# 1. Baixar backup do S3 (se necessário)
aws s3 cp s3://seu-bucket/backups/database/backup_20241214.dump.gz .

# 2. Descomprimir
gunzip backup_20241214.dump.gz

# 3. Restaurar
pg_restore -h seu-servidor.com -U postgres -d bem_casado -c backup_20241214.dump

# Ou usar psql para SQL puro:
psql -h seu-servidor.com -U postgres -d bem_casado < backup_20241214.sql
```

### **Restaurar Arquivos S3**

```bash
# Sincronizar de volta
aws s3 sync s3://bucket-backup/bem-casado/20241214/ s3://bucket-producao/bem-casado/
```

### **Restaurar Projeto Completo**

```bash
# 1. Baixar backup
aws s3 cp s3://seu-bucket/backups/complete/bem_casado_20241214.tar.gz .

# 2. Extrair
tar -xzf bem_casado_20241214.tar.gz

# 3. Instalar dependências
cd bem_casado_loja
pnpm install

# 4. Configurar .env
cp .env.example .env
# Editar .env com suas credenciais

# 5. Rodar
pnpm dev
```

---

## ✅ Checklist de Configuração

### **Primeira Vez**:
- [ ] Instalar PostgreSQL client (`sudo apt install postgresql-client`)
- [ ] Instalar AWS CLI (`pip install awscli`)
- [ ] Configurar credenciais AWS (`aws configure`)
- [ ] Criar diretórios de backup (`mkdir -p /home/ubuntu/backups/{database,complete}`)
- [ ] Configurar variáveis de ambiente (`.env`)
- [ ] Tornar scripts executáveis (`chmod +x scripts/backup/*.sh`)
- [ ] Testar backup manual (`./scripts/backup/backup-all.sh`)
- [ ] Configurar cron jobs (`crontab -e`)

### **Manutenção**:
- [ ] Verificar logs de backup semanalmente
- [ ] Testar restauração mensalmente
- [ ] Revisar retenção de backups trimestralmente
- [ ] Atualizar documentação quando mudar algo

---

## 🔐 Segurança

### **Boas Práticas**:

1. ✅ **Nunca commitar credenciais** no Git
   - Use `.env` (já está no `.gitignore`)
   - Use AWS IAM roles quando possível

2. ✅ **Criptografar backups sensíveis**
   ```bash
   # Criptografar
   gpg --symmetric --cipher-algo AES256 backup.dump
   
   # Descriptografar
   gpg --decrypt backup.dump.gpg > backup.dump
   ```

3. ✅ **Testar restauração regularmente**
   - Backup sem teste = backup inexistente

4. ✅ **Manter múltiplas cópias**
   - Local + S3 + Região diferente

---

## 📞 Suporte

Em caso de problemas:

1. Verificar logs (`/var/log/backup-*.log`)
2. Testar conexão com banco (`psql -h host -U user -d db`)
3. Testar credenciais AWS (`aws sts get-caller-identity`)
4. Verificar permissões dos scripts (`ls -l scripts/backup/`)

---

**Autor**: Manus AI  
**Data**: 14 de dezembro de 2024  
**Versão**: 1.0
