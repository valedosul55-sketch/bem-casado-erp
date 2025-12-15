# 🔒 Guia de Backup e Recuperação de Dados - Loja Bem Casado

Documentação completa sobre onde os dados estão armazenados, como fazer backup e como recuperar tudo caso você perca acesso à conta Manus.

---

## 📍 Onde Seus Dados Estão Armazenados

### **Resposta Rápida**

**VOCÊ É O DONO DOS SEUS DADOS!** ✅

Seus dados **NÃO estão presos na conta Manus**. Eles estão em **infraestrutura própria** que você controla:

1. **Código-fonte**: GitHub (seu repositório privado)
2. **Banco de dados**: PostgreSQL (servidor próprio ou cloud)
3. **Arquivos**: S3 ou similar (bucket próprio)
4. **Aplicação**: Servidor web próprio (após deploy)

**Manus é apenas a ferramenta de desenvolvimento**, não o dono dos dados!

---

## 🗄️ Arquitetura de Armazenamento

### **1. Código-Fonte** 📝

**Onde está**: Repositório Git (local + remoto)

**Localização atual**:
- **Sandbox Manus**: `/home/ubuntu/bem_casado_loja/`
- **GitHub**: `github.com/seu-usuario/bem-casado-loja` (quando você fizer push)

**Você possui**:
- ✅ Código completo do backend
- ✅ Código completo do frontend
- ✅ Schemas do banco de dados
- ✅ Migrações SQL
- ✅ Testes unitários
- ✅ Documentação

**Como garantir acesso**:
```bash
# 1. Fazer push para GitHub
cd /home/ubuntu/bem_casado_loja
git add .
git commit -m "Backup completo"
git push origin main

# 2. Clonar em qualquer máquina
git clone https://github.com/seu-usuario/bem-casado-loja.git
```

**Backup automático**: Configure GitHub Actions para backup diário

---

### **2. Banco de Dados** 🗄️

**Onde está**: PostgreSQL (servidor próprio)

**Localização**:
- **Desenvolvimento**: Servidor PostgreSQL fornecido por Manus (temporário)
- **Produção**: Seu servidor PostgreSQL (permanente)

**Dados armazenados**:
- ✅ Produtos
- ✅ Clientes
- ✅ Pedidos
- ✅ Estoque
- ✅ Movimentações
- ✅ Usuários
- ✅ Lojas/Filiais

**Como garantir acesso**:

#### **Opção 1: Backup Manual**
```bash
# Fazer backup completo
pg_dump -h seu-servidor.com -U usuario -d bem_casado > backup.sql

# Restaurar backup
psql -h novo-servidor.com -U usuario -d bem_casado < backup.sql
```

#### **Opção 2: Backup Automático**
```bash
# Criar script de backup diário
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -h seu-servidor.com -U usuario -d bem_casado > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://seu-bucket/backups/
```

#### **Opção 3: Usar Serviço Gerenciado**
- **Supabase**: Backup automático diário
- **Neon**: Backup automático + point-in-time recovery
- **AWS RDS**: Backup automático + snapshots

**Recomendação**: Use serviço gerenciado com backup automático

---

### **3. Arquivos (Imagens, PDFs, etc)** 📁

**Onde está**: S3 ou similar

**Localização**:
- **Desenvolvimento**: Bucket S3 temporário (fornecido por Manus)
- **Produção**: Seu bucket S3 permanente

**Dados armazenados**:
- ✅ Imagens de produtos
- ✅ Logos das lojas
- ✅ Certificados digitais (NF-e)
- ✅ XMLs de NF-e
- ✅ Relatórios gerados

**Como garantir acesso**:

#### **Opção 1: Sincronizar com Seu Bucket**
```bash
# Copiar todos os arquivos para seu bucket
aws s3 sync s3://bucket-manus/bem-casado/ s3://seu-bucket/bem-casado/
```

#### **Opção 2: Usar Seu Bucket Desde o Início**
```typescript
// server/config.ts
export const S3_CONFIG = {
  bucket: process.env.S3_BUCKET || 'seu-bucket-bem-casado',
  region: process.env.S3_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
```

**Recomendação**: Configure seu próprio bucket S3 desde o início

---

### **4. Aplicação Web** 🌐

**Onde está**: Servidor web

**Localização**:
- **Desenvolvimento**: Sandbox Manus (temporário)
- **Produção**: Seu servidor (permanente)

**Opções de hospedagem**:
1. **Manus Hosting** (built-in)
   - ✅ Deploy automático
   - ✅ Custom domain
   - ✅ SSL grátis
   - ✅ Escalável
   
2. **Vercel/Netlify** (frontend)
   - ✅ Deploy automático via GitHub
   - ✅ CDN global
   - ✅ SSL grátis

3. **Railway/Render** (fullstack)
   - ✅ Backend + Frontend
   - ✅ PostgreSQL incluído
   - ✅ Deploy automático

4. **AWS/Google Cloud** (enterprise)
   - ✅ Controle total
   - ✅ Escalabilidade ilimitada
   - ✅ Mais caro

**Como garantir acesso**:
- Faça deploy em múltiplas plataformas
- Configure CI/CD via GitHub Actions
- Documente processo de deploy

---

## 🔄 Estratégia de Backup Completa

### **Regra 3-2-1 de Backup**

**3 cópias** dos dados:
1. Original (produção)
2. Backup local
3. Backup remoto

**2 tipos** de mídia:
1. Disco/SSD
2. Cloud storage

**1 cópia** offsite:
1. Em região geográfica diferente

---

### **Implementação para Bem Casado**

#### **1. Código-Fonte** (Diário)
```yaml
# .github/workflows/backup.yml
name: Backup Diário
on:
  schedule:
    - cron: '0 3 * * *' # 03:00 UTC todo dia
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Criar backup
        run: |
          tar -czf backup-$(date +%Y%m%d).tar.gz .
      - name: Upload para S3
        run: |
          aws s3 cp backup-*.tar.gz s3://seu-bucket/backups/code/
```

#### **2. Banco de Dados** (Diário + Incremental)
```bash
# /home/ubuntu/scripts/backup-db.sh
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
S3_BUCKET="s3://seu-bucket/backups/database"

# Backup completo
pg_dump -h $DB_HOST -U $DB_USER -d bem_casado -F c -f $BACKUP_DIR/full_$DATE.dump

# Comprimir
gzip $BACKUP_DIR/full_$DATE.dump

# Upload para S3
aws s3 cp $BACKUP_DIR/full_$DATE.dump.gz $S3_BUCKET/

# Manter apenas últimos 30 dias localmente
find $BACKUP_DIR -name "*.dump.gz" -mtime +30 -delete

# Manter últimos 90 dias no S3
aws s3 ls $S3_BUCKET/ | grep "full_" | sort | head -n -90 | awk '{print $4}' | xargs -I {} aws s3 rm $S3_BUCKET/{}

echo "Backup concluído: full_$DATE.dump.gz"
```

**Agendar com cron**:
```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 03:00)
0 3 * * * /home/ubuntu/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1
```

#### **3. Arquivos S3** (Semanal)
```bash
# /home/ubuntu/scripts/backup-s3.sh
#!/bin/bash

DATE=$(date +%Y%m%d)
SOURCE_BUCKET="s3://bucket-producao/bem-casado/"
BACKUP_BUCKET="s3://bucket-backup/bem-casado/$DATE/"

# Sincronizar
aws s3 sync $SOURCE_BUCKET $BACKUP_BUCKET

echo "Backup S3 concluído: $BACKUP_BUCKET"
```

**Agendar com cron**:
```bash
# Backup semanal (domingo às 02:00)
0 2 * * 0 /home/ubuntu/scripts/backup-s3.sh >> /var/log/backup-s3.log 2>&1
```

---

## 🚨 Cenários de Recuperação

### **Cenário 1: Perdi Acesso à Conta Manus**

**Impacto**: ❌ Não consegue acessar sandbox de desenvolvimento

**Dados perdidos**: NENHUM! ✅

**Solução**:

1. **Código-fonte**: Clonar do GitHub
   ```bash
   git clone https://github.com/seu-usuario/bem-casado-loja.git
   cd bem-casado-loja
   pnpm install
   ```

2. **Banco de dados**: Continua funcionando (está no seu servidor)
   - Nenhuma ação necessária

3. **Aplicação**: Continua rodando (está no seu servidor)
   - Nenhuma ação necessária

4. **Desenvolvimento**: Configurar ambiente local
   ```bash
   # Instalar dependências
   pnpm install

   # Configurar .env
   cp .env.example .env
   # Editar .env com suas credenciais

   # Rodar localmente
   pnpm dev
   ```

**Tempo de recuperação**: 15 minutos

---

### **Cenário 2: Banco de Dados Corrompido**

**Impacto**: ❌ Perda de dados recentes

**Dados perdidos**: Desde o último backup

**Solução**:

1. **Parar aplicação**
   ```bash
   pm2 stop bem-casado
   ```

2. **Restaurar backup**
   ```bash
   # Baixar último backup do S3
   aws s3 cp s3://seu-bucket/backups/database/full_20241214.dump.gz .

   # Descomprimir
   gunzip full_20241214.dump.gz

   # Restaurar
   pg_restore -h $DB_HOST -U $DB_USER -d bem_casado -c full_20241214.dump
   ```

3. **Reiniciar aplicação**
   ```bash
   pm2 start bem-casado
   ```

**Tempo de recuperação**: 30 minutos

---

### **Cenário 3: Servidor Web Caiu**

**Impacto**: ❌ Site fora do ar

**Dados perdidos**: NENHUM! ✅

**Solução**:

1. **Deploy em novo servidor**
   ```bash
   # Clonar código
   git clone https://github.com/seu-usuario/bem-casado-loja.git
   cd bem-casado-loja

   # Instalar dependências
   pnpm install

   # Build
   pnpm build

   # Configurar .env
   cp .env.example .env
   # Editar .env

   # Rodar
   pm2 start ecosystem.config.js
   ```

2. **Atualizar DNS** (se necessário)
   - Apontar domínio para novo servidor

**Tempo de recuperação**: 1 hora

---

### **Cenário 4: Perda Total (Desastre)**

**Impacto**: ❌ Tudo perdido

**Dados perdidos**: Desde o último backup

**Solução**:

1. **Recuperar código do GitHub**
2. **Recuperar banco do S3**
3. **Recuperar arquivos do S3**
4. **Deploy em novo servidor**

**Tempo de recuperação**: 2-4 horas

---

## ✅ Checklist de Segurança

### **Configuração Inicial**

- [ ] Criar repositório GitHub privado
- [ ] Fazer push do código para GitHub
- [ ] Configurar GitHub Actions para backup automático
- [ ] Configurar seu próprio banco PostgreSQL
- [ ] Configurar backup automático do banco (diário)
- [ ] Configurar seu próprio bucket S3
- [ ] Configurar backup do S3 (semanal)
- [ ] Documentar credenciais em local seguro (1Password, Bitwarden)
- [ ] Testar restauração de backup (mensal)

### **Manutenção Contínua**

- [ ] Verificar logs de backup (semanal)
- [ ] Testar restauração de backup (mensal)
- [ ] Atualizar documentação (quando mudar algo)
- [ ] Revisar estratégia de backup (anual)

---

## 🔐 Onde Guardar Credenciais

### **Recomendações**

1. **Gerenciador de Senhas** (1Password, Bitwarden, LastPass)
   - ✅ Credenciais do banco de dados
   - ✅ Credenciais da AWS (S3)
   - ✅ Tokens do GitHub
   - ✅ Senhas de app do Gmail

2. **Arquivo .env Criptografado** (backup local)
   ```bash
   # Criptografar
   gpg --symmetric --cipher-algo AES256 .env

   # Descriptografar
   gpg --decrypt .env.gpg > .env
   ```

3. **Cofre Físico** (papel)
   - ✅ Master password do gerenciador
   - ✅ Chave de recuperação do GitHub
   - ✅ Backup de 2FA

---

## 📝 Documentação Essencial

### **Arquivos para Manter Atualizados**

1. **README.md** - Como rodar o projeto
2. **DEPLOY.md** - Como fazer deploy
3. **BACKUP.md** - Como fazer backup/restore
4. **CREDENTIALS.md** - Lista de credenciais necessárias (sem valores!)
5. **RUNBOOK.md** - Procedimentos de emergência

---

## 🎯 Resumo Executivo

### **Seus Dados Estão Seguros Se**:

1. ✅ Código no GitHub (backup automático)
2. ✅ Banco com backup diário automático
3. ✅ Arquivos S3 com backup semanal
4. ✅ Credenciais em gerenciador de senhas
5. ✅ Documentação atualizada
6. ✅ Teste de restauração mensal

### **Você Pode Perder Acesso à Conta Manus Sem Problemas**:

- ✅ Código está no GitHub
- ✅ Banco está no seu servidor
- ✅ Aplicação está no seu servidor
- ✅ Arquivos estão no seu S3
- ✅ Você pode desenvolver localmente
- ✅ Você pode fazer deploy em qualquer lugar

**Manus é apenas a ferramenta de desenvolvimento, não o dono dos seus dados!**

---

## 📞 Contatos de Emergência

### **Suporte Técnico**

- **Manus**: https://help.manus.im
- **GitHub**: https://support.github.com
- **AWS**: https://aws.amazon.com/support

### **Fornecedores**

- **Banco de dados**: [Seu provedor]
- **Hospedagem**: [Seu provedor]
- **S3**: [Seu provedor]

---

**Autor**: Manus AI  
**Data**: 14 de dezembro de 2024  
**Versão**: 1.0
