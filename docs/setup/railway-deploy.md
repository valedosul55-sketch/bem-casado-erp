> ## **Em Construção**
> 
> Este documento será detalhado com o passo a passo específico para o deploy no Railway assim que a aplicação atingir um estado mínimo para deploy.

# 🚂 Guia de Deploy no Railway

**Autor**: Manus AI
**Data**: 15 de dezembro de 2025

## 1. Introdução

O [Railway](https://railway.app/) é a plataforma escolhida para a hospedagem e o deploy contínuo do **ERP Bem Casado**. Este guia cobrirá as etapas para configurar o ambiente de produção na plataforma.

## 2. Estratégia de Deploy

A estratégia adotada será o **Continuous Deployment (CD)** a partir do repositório no GitHub. A cada `push` na branch `main`, o Railway irá automaticamente buildar e implantar a nova versão da aplicação.

Serão configurados dois serviços principais:

1.  **Backend (API)**: O servidor Node.js/Express.
2.  **Frontend (Cliente)**: A aplicação React, servida como um site estático.

Além do serviço de banco de dados PostgreSQL já provisionado.

## 3. Passos Preliminares

1.  **Crie uma conta no Railway** e conecte-a à sua conta do GitHub.
2.  **Crie um novo projeto** no Railway para o ERP Bem Casado.
3.  **Provisione um banco de dados PostgreSQL** dentro do projeto.

## 4. Configurando o Backend

1.  No seu projeto Railway, clique em **New** e selecione **GitHub Repo**.
2.  Escolha o repositório `valedosul55-sketch/bem-casado-erp`.
3.  O Railway irá detectar o `Dockerfile` (que precisará ser criado na raiz do backend) ou o `package.json` e sugerir um serviço. Confirme a criação.
4.  **Configure as variáveis de ambiente** na aba **Variables** do serviço:
    - `DATABASE_URL`: Copie a URL de conexão do serviço de PostgreSQL.
    - `JWT_SECRET`: Gere um segredo forte e seguro.
    - Credenciais do **Cloudflare R2** ou **AWS S3** (conforme a escolha).

## 5. Configurando o Frontend

1.  O processo é similar ao do backend. Adicione um novo serviço a partir do mesmo repositório.
2.  O Railway pode precisar de ajuda para entender que este é um serviço de frontend. Nas configurações do serviço, você pode precisar especificar:
    - **Build Command**: `pnpm build`
    - **Install Command**: `pnpm install`
    - **Root Directory**: `src/frontend`
3.  Configure as variáveis de ambiente, principalmente a URL da API do backend:
    - `VITE_API_URL`: A URL pública do seu serviço de backend no Railway.

## 6. Domínio Personalizado

Após o deploy, você pode configurar um domínio personalizado (ex: `erp.bemcasadobuffet.com.br`) nas configurações de cada serviço no Railway.

Este documento será atualizado com mais detalhes conforme o projeto avança.
