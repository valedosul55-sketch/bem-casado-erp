# ERP Bem Casado - TODO

## Configuração Inicial
- [x] Schema do banco de dados com todas as tabelas
- [x] Configurar tema visual (laranja/amarelo, verde, cinza)

## Autenticação e Login
- [x] Tela de login com visual Omega Light
- [x] Campos: Empresa, Filial, Departamento, Usuário, Senha
- [x] Logo Bem Casado com nuvem laranja
- [x] Fundo com filtro amarelo/laranja
- [x] Sistema de autenticação com controle de acesso

## Dashboard e Layout
- [x] Dashboard principal
- [x] Sidebar de navegação com módulos
- [x] Menu: Vendas, Clientes, Produtos, Estoque, Financeiro, Relatórios
- [x] Design responsivo

## Módulo de Clientes
- [x] Listagem de clientes
- [x] Cadastro completo (nome, telefone, email, endereço)
- [ ] Histórico de pedidos do cliente
- [x] Edição e exclusão de clientes

## Módulo de Produtos
- [x] Listagem de produtos
- [x] Cadastro (nome, descrição, categoria, preço, custo, estoque mínimo)
- [x] Upload de imagem do produto (via URL)
- [x] Categorias de produtos para confeitaria
- [x] Edição e exclusão de produtos

## Módulo de Estoque
- [x] Registro de movimentações (entrada/saída)
- [x] Sistema de alertas para estoque baixo
- [x] Histórico de movimentações
- [x] Visualização de estoque atual

## Módulo de Vendas/Pedidos
- [x] Criar orçamentos
- [x] Criar pedidos
- [x] Selecionar cliente e produtos
- [x] Cálculo automático de totais
- [x] Status do pedido (orçamento, confirmado, em produção, entregue)

## Módulo Financeiro
- [x] Contas a pagar
- [x] Contas a receber
- [x] Fluxo de caixa
- [x] Categorização de despesas e receitas

## Módulo de Relatórios
- [x] Vendas por período
- [x] Produtos mais vendidos
- [ ] Clientes frequentes
- [x] Análise financeira

## Testes
- [x] Testes unitários para routers

## Módulo de Cadastros (Novo)
- [x] Página principal de Cadastros com menu hierárquico
- [x] Tabelas > Dados da Empresa
- [ ] Tabelas > Organizacionais
- [ ] Tabelas > Operacionais
- [ ] Tabelas > Fiscais
- [ ] Tabelas > Financeiras
- [ ] Tabelas > Gerais
- [ ] Cadastros gerais
- [ ] Parâmetros do sistema

## Dados da Empresa (Importação)
- [x] Importar dados da empresa do arquivo Excel
- [x] Criar tabela de empresas no banco de dados
- [x] Exibir dados reais na página de Cadastros

## Migração para PostgreSQL
- [x] Alterar schema de MySQL para PostgreSQL
- [x] Atualizar dependências (mysql2 -> pg)
- [x] Atualizar db.ts para usar PostgreSQL
- [x] Fazer push para GitHub
- [ ] Configurar variáveis no Railway

## Correção Deploy Railway
- [ ] Corrigir erro "Cannot GET /" no Railway
