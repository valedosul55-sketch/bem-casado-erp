> ## **AVISO IMPORTANTE**
> 
> Este documento detalha duas abordagens para configurar o armazenamento de objetos para o ERP Bem Casado. A **Opção 1 (Cloudflare R2)** é a recomendada por sua compatibilidade com a API S3, custo-benefício e integração simplificada. A **Opção 2 (AWS S3)** é uma alternativa para casos onde o uso direto do ecossistema AWS é um requisito.

# ☁️ Guia de Configuração de Infraestrutura na Nuvem

**Autor**: Manus AI
**Data**: 15 de dezembro de 2025

## 1. Introdução

Este documento fornece um guia passo a passo para a configuração da infraestrutura de armazenamento de objetos para o projeto **ERP Bem Casado**. A infraestrutura é projetada para armazenar de forma segura e organizada os seguintes tipos de arquivos:

- **Documentação técnica**: Manuais, diagramas e especificações.
- **Backups de dados**: Cópias de segurança do banco de dados e arquivos críticos.
- **Arquivos XML**: Notas Fiscais Eletrônicas (NF-e) e Notas Fiscais ao Consumidor Eletrônicas (NFC-e).
- **Relatórios exportados**: Planilhas, PDFs e outros relatórios gerados pelo sistema.
- **Logs do sistema**: Logs de aplicação e de auditoria para monitoramento e depuração.

## 2. Opção 1: Configuração com Cloudflare R2 (Recomendado)

O [Cloudflare R2](https://www.cloudflare.com/pt-br/products/r2/) é um serviço de armazenamento de objetos compatível com a API do Amazon S3, mas sem as taxas de saída de dados, tornando-o uma opção mais econômica para muitas aplicações.

### Passo 1: Criar o Bucket R2

O bucket será o contêiner para todos os arquivos do projeto. A criação pode ser feita através da interface da Cloudflare ou via API.

1.  **Acesse o painel da Cloudflare** e navegue até a seção **R2**.
2.  Clique em **Criar bucket**.
3.  **Nome do bucket**: `bem-casado-erp-assets` (use um nome único e descritivo).
4.  **Localização**: Escolha a localização geográfica mais próxima dos seus usuários ou do seu servidor de aplicação para minimizar a latência.
5.  Clique em **Criar bucket** para finalizar.

### Passo 2: Obter as Credenciais de Acesso

Para que a aplicação possa interagir com o bucket R2, você precisará de credenciais de acesso (semelhantes às chaves de acesso da AWS).

1.  No painel do R2, clique em **Gerenciar tokens de API R2**.
2.  Clique em **Criar token de API**.
3.  Dê um nome ao token, por exemplo, `erp-bem-casado-worker`.
4.  Em **Permissões**, selecione **Objeto Leitura & Escrita** para permitir que a aplicação leia e grave arquivos.
5.  Clique em **Criar token de API**.
6.  **⚠️ Anote o `Access Key ID` e o `Secret Access Key` em um local seguro.** Eles não serão exibidos novamente.

### Passo 3: Estrutura de Pastas

Uma estrutura de pastas bem definida é crucial para a organização e o gerenciamento dos arquivos. Recomendamos a seguinte estrutura a ser criada programaticamente pela aplicação dentro do bucket `bem-casado-erp-assets`:

```
docs/             # Documentação técnica e manuais
backups/
  database/       # Backups do banco de dados PostgreSQL
  system/         # Backups de arquivos de configuração
xml/
  nfe/            # Notas Fiscais Eletrônicas
    sent/
    received/
  nfce/           # Notas Fiscais ao Consumidor Eletrônicas
reports/          # Relatórios exportados pelos usuários
  financial/
  operational/
logs/
  application/    # Logs da aplicação (erros, debug)
  audit/          # Logs de auditoria de ações dos usuários
```

### Passo 4: Configuração de Regras de Ciclo de Vida (Lifecycle Rules)

Para otimizar custos, configure regras para mover ou excluir arquivos automaticamente após um certo período.

1.  No painel do seu bucket R2, vá para a aba **Configurações**.
2.  Em **Regras de Ciclo de Vida**, clique em **Adicionar regra**.
3.  **Exemplo de regra para logs**: Mover logs com mais de 90 dias para um armazenamento de acesso infrequente (se disponível) ou excluí-los.
    - **Prefixo do filtro**: `logs/`
    - **Ação**: `Expirar`
    - **Idade (dias)**: `90`
4.  **Exemplo de regra para backups**: Excluir backups de banco de dados com mais de 30 dias.
    - **Prefixo do filtro**: `backups/database/`
    - **Ação**: `Expirar`
    - **Idade (dias)**: `30`

## 3. Opção 2: Configuração com AWS S3 (Alternativa)

Esta opção utiliza o serviço [Amazon S3](https://aws.amazon.com/pt/s3/) diretamente. A configuração é semelhante, mas realizada dentro do ecossistema da AWS.

### Passo 1: Criar o Bucket S3 na AWS

1.  **Acesse o Console da AWS** e navegue até o serviço **S3**.
2.  Clique em **Criar bucket**.
3.  **Nome do bucket**: `bem-casado-erp-assets` (deve ser globalmente único).
4.  **Região da AWS**: Escolha a região mais adequada para sua aplicação.
5.  **Configurações de propriedade de objeto**: Mantenha **ACLs desabilitadas (recomendado)**.
6.  **Bloquear todo o acesso público**: Mantenha esta opção **marcada** por segurança.
7.  Clique em **Criar bucket**.

### Passo 2: Configurar Permissões (IAM)

Crie um usuário IAM com permissões específicas para este bucket, em vez de usar as credenciais root da sua conta AWS.

1.  No console da AWS, vá para o serviço **IAM**.
2.  Crie uma nova **Política** com as seguintes permissões (JSON), substituindo `bem-casado-erp-assets` pelo nome do seu bucket:

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    "s3:ListBucket"
                ],
                "Resource": [
                    "arn:aws:s3:::bem-casado-erp-assets/*",
                    "arn:aws:s3:::bem-casado-erp-assets"
                ]
            }
        ]
    }
    ```

3.  Crie um novo **Usuário** no IAM.
4.  Anexe a política criada a este usuário.
5.  Na aba **Credenciais de segurança** do usuário, crie uma **chave de acesso** e anote o `ID da chave de acesso` e a `Chave de acesso secreta`.

### Passo 3: Estrutura de Pastas e Lifecycle Rules

A estrutura de pastas e as regras de ciclo de vida seguem a mesma lógica descrita na **Opção 1 (Cloudflare R2)**. A configuração das regras de ciclo de vida no S3 é feita na aba **Gerenciamento** do seu bucket.

## 4. Configuração do Repositório GitHub

O repositório `bem-casado-erp` já foi criado e está disponível em:
[https://github.com/valedosul55-sketch/bem-casado-erp](https://github.com/valedosul55-sketch/bem-casado-erp)

O auxiliar deve clonar este repositório para iniciar o desenvolvimento.

```bash
git clone https://github.com/valedosul55-sketch/bem-casado-erp.git
cd bem-casado-erp
```

## 5. Deploy no Railway

O [Railway](https://railway.app/) é uma plataforma de hospedagem que simplifica o deploy de aplicações. Para o ERP Bem Casado, você precisará de dois serviços:

1.  **Serviço de Backend (Node.js/Express)**: Conectado ao repositório GitHub para deploy automático a cada `push` na branch `main`.
2.  **Serviço de Banco de Dados (PostgreSQL)**: Provisionado diretamente no Railway.

### Passos para o Deploy:

1.  **Crie um novo projeto no Railway**.
2.  **Adicione o serviço de PostgreSQL** a partir dos templates do Railway.
3.  **Adicione o serviço de backend**, selecionando o repositório `bem-casado-erp` do GitHub.
4.  **Configure as variáveis de ambiente** no serviço de backend. Isso inclui:
    - `DATABASE_URL`: A URL de conexão do banco de dados PostgreSQL (fornecida pelo Railway).
    - `R2_ACCESS_KEY_ID` / `AWS_ACCESS_KEY_ID`: A chave de acesso do R2 ou S3.
    - `R2_SECRET_ACCESS_KEY` / `AWS_SECRET_ACCESS_KEY`: A chave secreta do R2 ou S3.
    - `R2_BUCKET_NAME` / `S3_BUCKET_NAME`: O nome do bucket.
    - `JWT_SECRET`: Um segredo forte para a assinatura de tokens JWT.

## 6. Conclusão

Com esta infraestrutura configurada, o projeto **ERP Bem Casado** terá uma base sólida, segura e escalável para o armazenamento de arquivos e para o deploy contínuo da aplicação. A escolha entre Cloudflare R2 e AWS S3 dependerá dos requisitos específicos de custo e integração do projeto.
