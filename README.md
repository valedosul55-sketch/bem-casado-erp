# 🎂 ERP Bem Casado

Sistema ERP completo para gestão de buffet de casamentos, desenvolvido para otimizar todos os processos operacionais e administrativos.

## 📋 Visão Geral

O **ERP Bem Casado** é uma solução integrada que centraliza a gestão de:

- **Clientes e Contratos**: Cadastro completo de clientes, orçamentos e contratos
- **Eventos**: Planejamento e acompanhamento de casamentos e eventos
- **Financeiro**: Contas a pagar/receber, fluxo de caixa e conciliação bancária
- **Estoque**: Controle de ingredientes, produtos e movimentações
- **Produção**: Gestão de receitas, fichas técnicas e ordens de produção
- **Compras**: Pedidos de compra, fornecedores e cotações
- **Fiscal**: Emissão de NF-e/NFC-e e controle tributário
- **Recursos Humanos**: Cadastro de funcionários, ponto e folha de pagamento
- **Relatórios**: Dashboards e análises gerenciais

## 🚀 Tecnologias

### Backend
- **Node.js** com **TypeScript**
- **Express.js** para API REST
- **Prisma ORM** para banco de dados
- **PostgreSQL** como banco principal
- **Redis** para cache e filas
- **JWT** para autenticação

### Frontend
- **React** com **TypeScript**
- **Vite** como build tool
- **TailwindCSS** para estilização
- **React Query** para gerenciamento de estado
- **React Router** para navegação

### Infraestrutura
- **AWS S3** para armazenamento de arquivos
- **Railway** para deploy e hosting
- **GitHub Actions** para CI/CD
- **Cloudflare** para CDN e proteção

## 📁 Estrutura do Projeto

```
bem-casado-erp/
├── docs/                    # Documentação
│   ├── setup/              # Guias de instalação e configuração
│   ├── architecture/       # Arquitetura e diagramas
│   └── api/                # Documentação da API
├── src/
│   ├── backend/            # Código do servidor
│   │   ├── src/
│   │   ├── prisma/
│   │   └── tests/
│   └── frontend/           # Código do cliente
│       ├── src/
│       ├── public/
│       └── tests/
├── scripts/                # Scripts de automação
└── .github/                # Workflows do GitHub Actions
```

## 🛠️ Instalação e Configuração

Consulte a documentação completa em [`docs/setup/`](docs/setup/):

1. [Configuração da AWS](docs/setup/aws-setup.md)
2. [Setup do Ambiente de Desenvolvimento](docs/setup/dev-environment.md)
3. [Deploy no Railway](docs/setup/railway-deploy.md)
4. [Configuração Fiscal (NF-e/NFC-e)](docs/setup/fiscal-setup.md)

## 📊 Funcionalidades Principais

### Módulo de Eventos
- Cadastro completo de eventos (casamentos, festas, etc.)
- Timeline de planejamento
- Checklist de tarefas
- Gestão de fornecedores externos
- Controle de pagamentos parcelados

### Módulo Financeiro
- Contas a pagar e receber
- Fluxo de caixa projetado e realizado
- Conciliação bancária automática
- Relatórios financeiros
- Integração com bancos (API)

### Módulo de Produção
- Fichas técnicas de receitas
- Cálculo automático de custos
- Ordens de produção
- Controle de qualidade
- Rastreabilidade de lotes

### Módulo Fiscal
- Emissão de NF-e (Nota Fiscal Eletrônica)
- Emissão de NFC-e (Nota Fiscal ao Consumidor)
- Controle de impostos (ICMS, PIS, COFINS)
- SPED Fiscal
- Integração com SEFAZ

## 🔐 Segurança

- Autenticação JWT com refresh tokens
- Criptografia de dados sensíveis
- Backup automático diário
- Logs de auditoria
- Controle de acesso por perfis (RBAC)

## 📈 Roadmap

- [ ] Fase 1: Módulos básicos (Clientes, Eventos, Financeiro)
- [ ] Fase 2: Estoque e Produção
- [ ] Fase 3: Fiscal e Integração SEFAZ
- [ ] Fase 4: RH e Folha de Pagamento
- [ ] Fase 5: Business Intelligence e Analytics
- [ ] Fase 6: App Mobile

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Propriedade de **Bem Casado Buffet**. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas, consulte a documentação ou entre em contato com a equipe de TI.

---

**Desenvolvido com ❤️ para o Bem Casado Buffet**
