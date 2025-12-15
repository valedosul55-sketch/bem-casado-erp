# 🛒 Loja Bem Casado - E-commerce Full-Stack

E-commerce completo para a **Bem Casado Alimentos**, com sistema de pagamentos, emissão de NFC-e, integração com ERP e funcionalidades avançadas de marketing.

---

## 🎯 Sobre o Projeto

A **Loja Bem Casado** é uma plataforma de vendas online desenvolvida para a Bem Casado Alimentos, empresa especializada na produção e comercialização de arroz, feijão e açúcar. A loja permite que clientes comprem produtos em kits de 10 unidades (fardos de 10kg) diretamente da fábrica, com preços promocionais e entrega facilitada.

**Domínio de Produção:** www.arrozbemcasado.com.br

---

## ✨ Funcionalidades

### 🛍️ E-commerce
- Catálogo de 5 produtos (arroz branco, arroz integral, feijão carioca, feijão preto, açúcar cristal)
- Venda em kits de 10 unidades (fardos de 10kg)
- Sistema de carrinho de compras
- Filtros e busca de produtos
- Visualização em lista/grade
- Notificações de estoque baixo
- Produtos alternativos sugeridos

### 💳 Pagamentos
- **SafraPay:** Cartão de crédito e vales alimentação
- **PIX:** Pagamento instantâneo
- **WhatsApp:** Finalização de pedidos via mensagem

### 🧾 Fiscal
- Emissão de NFC-e via Focus NFe
- Certificado digital A1 configurado
- Integração com Tiny ERP
- Parametrização fiscal completa (ICMS, PIS, COFINS)
- Consulta de CNPJ automática

### 📧 Marketing
- Sistema de cupons de desconto
- Newsletter com cupom automático (NEWSLETTER5 - 5% OFF)
- Integração com Mailchimp
- WhatsApp Business
- Clube VIP com planos de assinatura (Básico R$ 89,90 e Premium R$ 149,90)

### 📊 Gestão
- Dashboard administrativo
- Sistema de relatórios exportáveis (Excel)
- Gerenciamento de estoque
- Histórico de vendas
- Análise de cupons utilizados

### 🛡️ Segurança e Backup
- **Backup Automático:** Diário às 02:00 AM (UTC)
- **Armazenamento:** Amazon S3 (Bucket: `backup-bem-casado-loja`)
- **Retenção:** Dados fiscais e de clientes protegidos externamente

### 🎨 Interface
- Design responsivo (mobile, tablet, desktop)
- Tema claro/escuro
- Animações suaves
- Galeria de fotos da fábrica
- Página "Sobre Nós" completa
- Mapa de localização integrado

---

## 🛠️ Tecnologias

### Frontend
- **React 19.2** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **Recharts** - Gráficos
- **React Three Fiber** - Visualização 3D

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **tRPC** - API type-safe
- **Drizzle ORM** - ORM para MySQL
- **MySQL/TiDB** - Banco de dados
- **Jose** - JWT authentication

### Integrações
- **Focus NFe** - Emissão de notas fiscais
- **SafraPay** - Gateway de pagamento
- **Mailchimp** - Email marketing
- **Tiny ERP** - Sistema de gestão
- **WhatsApp Business** - Comunicação com clientes
- **AWS S3** - Armazenamento de arquivos e backups

---

## 📁 Estrutura do Projeto

```
bem_casado_loja/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários
│   │   └── App.tsx        # Componente principal
│   ├── public/            # Assets estáticos
│   └── index.html         # HTML template
│
├── server/                # Backend Node.js
│   ├── _core/            # Configuração do servidor
│   ├── routers.ts        # Rotas tRPC
│   ├── db.ts             # Conexão com banco
│   ├── services/         # Serviços de negócio
│   │   └── backup.ts     # Serviço de backup S3
│   ├── focus-nfe.ts      # Integração Focus NFe
│   ├── safrapay.ts       # Integração SafraPay
│   ├── mailchimp.ts      # Integração Mailchimp
│   ├── email.ts          # Envio de e-mails
│   └── ...               # Outros módulos
│
├── shared/               # Código compartilhado
│   └── schema.ts         # Schemas Drizzle
│
├── drizzle/              # Migrações do banco
│
├── scripts/              # Scripts utilitários
│
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json          # Dependências
├── tsconfig.json         # Configuração TypeScript
├── vite.config.ts        # Configuração Vite
└── DEPLOY_PRODUCAO.md    # Guia de deploy
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 22.x
- pnpm 10.x
- MySQL 8.x (ou TiDB)

### 1. Instalar Dependências

```bash
cd bem_casado_loja
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

- `DATABASE_URL` - URL de conexão com MySQL
- `JWT_SECRET` - Chave secreta para JWT
- `FOCUS_NFE_TOKEN` - Token da Focus NFe
- `SAFRAPAY_*` - Credenciais SafraPay
- `SMTP_*` - Configurações de e-mail
- `MAILCHIMP_*` - Credenciais Mailchimp
- `AWS_*` - Credenciais S3 para backup
- E outras variáveis conforme necessário

### 3. Executar Migrações do Banco

```bash
pnpm db:push
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em: http://localhost:3000

### 5. Build para Produção

```bash
pnpm build
```

### 6. Iniciar em Produção

```bash
pnpm start
```

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Gera build de produção |
| `pnpm start` | Inicia servidor em produção |
| `pnpm check` | Verifica tipos TypeScript |
| `pnpm format` | Formata código com Prettier |
| `pnpm test` | Executa testes |
| `pnpm db:push` | Executa migrações do banco |

---

## 🌐 Deploy em Produção

Para fazer o deploy da loja no domínio **www.arrozbemcasado.com.br**, siga o guia completo em:

📄 **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)**

O guia inclui:
- Passo a passo detalhado para Railway (recomendado)
- Configuração de domínio personalizado
- Configuração de SSL/HTTPS
- Configuração de banco de dados em nuvem
- Checklist de segurança
- Solução de problemas comuns

---

## 🔐 Segurança

- ✅ Todas as senhas e tokens são armazenados em variáveis de ambiente
- ✅ Arquivo `.env` está no `.gitignore` (nunca é commitado)
- ✅ JWT para autenticação segura
- ✅ HTTPS obrigatório em produção
- ✅ Validação de entrada em todas as rotas
- ✅ Proteção contra SQL injection (via Drizzle ORM)
- ✅ Rate limiting em endpoints sensíveis
- ✅ Backup diário criptografado em S3

---

## 📊 Dados de Teste

### Cupons de Desconto

| Código | Desconto | Descrição |
|--------|----------|-----------|
| `BEMVINDO10` | 10% | Cupom de boas-vindas |
| `FIDELIDADE15` | 15% | Cupom de fidelidade |
| `PRIMEIRACOMPRA` | 20% | Primeira compra |
| `NEWSLETTER5` | 5% | Cadastro na newsletter |

### Produtos

| Produto | Peso | Preço Unitário | Preço Kit (10un) |
|---------|------|----------------|------------------|
| Arroz Branco | 1kg | R$ 5,90 | R$ 54,90 |
| Arroz Integral | 1kg | R$ 7,90 | R$ 74,90 |
| Feijão Carioca | 1kg | R$ 6,90 | R$ 64,90 |
| Feijão Preto | 1kg | R$ 6,90 | R$ 64,90 |
| Açúcar Cristal | 1kg | R$ 4,90 | R$ 44,90 |

---

## 🤝 Contribuindo

Este é um projeto privado da Bem Casado Alimentos. Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Documentação Adicional

- **[CACHE_SYSTEM.md](./CACHE_SYSTEM.md)** - Sistema de cache
- **[CONFIGURACAO_NFCE.md](./CONFIGURACAO_NFCE.md)** - Configuração de NFC-e
- **[SECURITY_PAYMENTS.md](./SECURITY_PAYMENTS.md)** - Segurança em pagamentos
- **[MAILCHIMP_SETUP.md](./MAILCHIMP_SETUP.md)** - Configuração do Mailchimp
- **[todo.md](./todo.md)** - Lista de tarefas e histórico

---

## 📞 Contato

**Bem Casado Alimentos**
- **Site:** www.arrozbemcasado.com.br
- **E-mail:** contato@arrozbemcasado.com.br
- **WhatsApp:** (12) 3197-3400
- **Instagram:** @bemcasadoalimentos (20k+ seguidores)
- **Endereço:** Fábrica de arroz - São José dos Campos, SP
- **GPS:** -23.187869, -45.764573

**Horário de Funcionamento:**
- Sábados e Domingos: 7h às 13h

---

## 📜 Licença

© 2024 Bem Casado Alimentos. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para a Bem Casado Alimentos**
