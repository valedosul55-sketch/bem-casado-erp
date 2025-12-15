> ## **Pré-requisitos**
> 
> Este guia assume que você já possui familiaridade com o terminal (linha de comando) e com o Git. A instalação e configuração do [Git](https://git-scm.com/book/pt-br/v2/Come%C3%A7ando-Instalando-o-Git) é um pré-requisito.

# 🛠️ Guia de Setup do Ambiente de Desenvolvimento

**Autor**: Manus AI
**Data**: 15 de dezembro de 2025

## 1. Introdução

Este documento descreve os passos necessários para configurar um ambiente de desenvolvimento local para o projeto **ERP Bem Casado**. Um ambiente padronizado é essencial para garantir que o código funcione de maneira consistente entre diferentes máquinas e no ambiente de produção.

## 2. Tecnologias Necessárias

Para desenvolver e executar o projeto localmente, você precisará instalar as seguintes ferramentas:

- **Node.js**: Ambiente de execução para o backend e para as ferramentas de desenvolvimento do frontend. (Versão 18.x ou superior recomendada).
- **pnpm**: Gerenciador de pacotes rápido e eficiente em disco. [Instrução de instalação](https://pnpm.io/pt/installation).
- **Docker**: Para executar o banco de dados PostgreSQL em um contêiner isolado, evitando a necessidade de instalá-lo diretamente no sistema operacional. [Instalação do Docker](https://docs.docker.com/engine/install/).

## 3. Clonando o Repositório

O primeiro passo é clonar o repositório do projeto a partir do GitHub.

```bash
# Clone o repositório para a sua máquina local
git clone https://github.com/valedosul55-sketch/bem-casado-erp.git

# Navegue para o diretório do projeto
cd bem-casado-erp
```

## 4. Configurando o Banco de Dados com Docker

Utilizaremos o Docker e o Docker Compose para subir uma instância do PostgreSQL de forma simples e rápida.

1.  **Crie um arquivo `docker-compose.yml`** na raiz do projeto com o seguinte conteúdo:

    ```yaml
    version: '3.8'
    services:
      postgres:
        image: postgres:15-alpine
        container_name: bem-casado-erp-db
        restart: always
        environment:
          POSTGRES_USER: erp_user
          POSTGRES_PASSWORD: erp_password
          POSTGRES_DB: bem_casado_db
        ports:
          - "5432:5432"
        volumes:
          - postgres_data:/var/lib/postgresql/data

    volumes:
      postgres_data:
    ```

2.  **Inicie o contêiner do banco de dados** executando o comando abaixo no terminal, a partir da raiz do projeto:

    ```bash
    docker-compose up -d
    ```

    Este comando irá baixar a imagem do PostgreSQL e iniciar o serviço em segundo plano (`-d`). O banco de dados estará acessível na porta `5432` do seu `localhost`.

## 5. Configuração do Backend

O backend é responsável pela lógica de negócios e pela API do sistema.

1.  **Navegue até o diretório do backend**:

    ```bash
    cd src/backend
    ```

2.  **Instale as dependências** usando `pnpm`:

    ```bash
    pnpm install
    ```

3.  **Crie o arquivo de variáveis de ambiente**. Copie o arquivo de exemplo `.env.example` (que deverá ser criado no repositório) para um novo arquivo chamado `.env`.

    ```bash
    cp .env.example .env
    ```

4.  **Edite o arquivo `.env`** com as configurações do seu ambiente local. O conteúdo deve ser semelhante a este:

    ```env
    # URL de conexão com o banco de dados PostgreSQL
    # Formato: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    DATABASE_URL="postgresql://erp_user:erp_password@localhost:5432/bem_casado_db"

    # Segredo para assinatura dos tokens JWT
    JWT_SECRET="seu-segredo-super-secreto-aqui"

    # Credenciais para o serviço de armazenamento (R2 ou S3)
    # Deixe em branco se não estiver testando a integração de arquivos
    R2_ACCESS_KEY_ID=
    R2_SECRET_ACCESS_KEY=
    R2_BUCKET_NAME=
    R2_ACCOUNT_ID=
    R2_PUBLIC_URL=
    ```

5.  **Execute as migrações do banco de dados** com o Prisma para criar as tabelas necessárias:

    ```bash
    pnpm prisma migrate dev --name init
    ```

6.  **Inicie o servidor de desenvolvimento**:

    ```bash
    pnpm dev
    ```

    O servidor backend estará rodando, geralmente na porta `3333`.

## 6. Configuração do Frontend

O frontend é a interface com a qual o usuário irá interagir.

1.  **Abra um novo terminal** e navegue até o diretório do frontend:

    ```bash
    cd src/frontend
    ```

2.  **Instale as dependências**:

    ```bash
    pnpm install
    ```

3.  **Inicie o servidor de desenvolvimento do frontend**:

    ```bash
    pnpm dev
    ```

    A aplicação React estará disponível no seu navegador, geralmente em `http://localhost:5173`.

## 7. Conclusão

Com estes passos, seu ambiente de desenvolvimento estará completo e pronto para o trabalho. O backend e o frontend estarão rodando de forma independente, permitindo um desenvolvimento ágil e focado em cada parte da aplicação. Lembre-se de manter suas dependências atualizadas e de seguir as boas práticas de codificação definidas para o projeto.
