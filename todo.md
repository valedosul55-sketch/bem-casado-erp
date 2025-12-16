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
- [x] Configurar variáveis no Railway

## Correção Deploy Railway
- [x] Corrigir erro "Cannot GET /" no Railway
- [x] Corrigir erro "Invalid URL" no Railway

## Autenticação Local (Railway)
- [x] Adicionar campo de senha hash ao schema de usuários
- [x] Implementar rota de login local no backend
- [x] Implementar rota de registro de usuários
- [x] Atualizar frontend para autenticação local
- [x] Criar usuário admin padrão
- [x] Deploy e teste no Railway

## Gestão de Usuários
- [x] Tela de listagem de usuários
- [x] Formulário de cadastro de novos usuários
- [x] Edição e exclusão de usuários
- [x] Perfis de acesso (admin, gerente, vendedor, operador)

## Recuperação de Senha
- [x] Tela de "Esqueci minha senha"
- [x] Geração de link de recuperação pelo admin
- [x] Tela de redefinição de senha
- [x] Validação de token de recuperação

## Controle de Permissões
- [x] Definir permissões por perfil/departamento
- [x] Middleware de verificação de permissões
- [x] Ocultar menus não autorizados na sidebar
- [x] Bloquear acesso a rotas não autorizadas
- [x] Tela de configurações do usuário
