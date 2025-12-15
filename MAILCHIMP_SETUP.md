# Configuração do Mailchimp para Newsletter

Este documento explica como configurar a integração com Mailchimp para gerenciar a newsletter da Bem Casado Alimentos.

## 📋 Pré-requisitos

1. Conta no Mailchimp (gratuita para até 500 contatos)
2. Lista de audiência criada no Mailchimp
3. Chave de API do Mailchimp

## 🔧 Passo a Passo

### 1. Criar Conta no Mailchimp

1. Acesse https://mailchimp.com/
2. Clique em "Sign Up Free"
3. Preencha seus dados e confirme o email
4. Complete o cadastro da empresa

### 2. Criar Lista de Audiência

1. No dashboard do Mailchimp, vá em **Audience** → **All contacts**
2. Clique em **Create Audience**
3. Preencha as informações:
   - **Audience name**: Newsletter Bem Casado
   - **Default from email**: noreply@arrozbemcasado.com.br
   - **Default from name**: Bem Casado Alimentos
   - **Campaign URL settings**: bemcasado-7huvr3oj.manus.space
4. Clique em **Save**

### 3. Obter Chave de API

1. Clique no ícone do seu perfil (canto superior direito)
2. Vá em **Account & billing** → **Extras** → **API keys**
3. Clique em **Create A Key**
4. Dê um nome para a chave (ex: "Website Newsletter")
5. **Copie a chave gerada** (você não poderá vê-la novamente!)

### 4. Obter ID da Lista

1. Vá em **Audience** → **All contacts**
2. Clique em **Settings** → **Audience name and defaults**
3. Role até o final da página
4. Copie o **Audience ID** (formato: abc123def4)

### 5. Obter Prefixo do Servidor

O prefixo do servidor está na sua chave de API, após o hífen.

Exemplo: Se sua chave é `abc123def456ghi789-us1`, o prefixo é **us1**

### 6. Configurar Variáveis de Ambiente

No painel de administração do Manus, adicione as seguintes variáveis de ambiente:

```
MAILCHIMP_API_KEY=sua_chave_de_api_aqui
MAILCHIMP_LIST_ID=seu_id_da_lista_aqui
MAILCHIMP_SERVER_PREFIX=us1
```

**Exemplo:**
```
MAILCHIMP_API_KEY=abc123def456ghi789-us1
MAILCHIMP_LIST_ID=a1b2c3d4e5
MAILCHIMP_SERVER_PREFIX=us1
```

### 7. Reiniciar o Servidor

Após adicionar as variáveis de ambiente, reinicie o servidor para aplicar as mudanças.

## ✅ Testar Integração

1. Acesse o site da Bem Casado
2. Role até o rodapé
3. Digite um email de teste na seção "Receba Ofertas Exclusivas"
4. Clique em "Ganhar Cupom"
5. Verifique se o email foi adicionado à lista no Mailchimp

## 📧 Configurar Email de Boas-Vindas (Opcional)

Para enviar um email automático de boas-vindas com o cupom:

1. No Mailchimp, vá em **Audience** → **All contacts**
2. Clique em **Manage Audience** → **Signup forms**
3. Selecione **Automated welcome email**
4. Ative a opção **Send a welcome email**
5. Personalize o email com:
   - Assunto: "Bem-vindo à Bem Casado! Aqui está seu cupom de 5% OFF"
   - Corpo do email:
     ```
     Olá!
     
     Obrigado por se cadastrar na newsletter da Bem Casado Alimentos!
     
     Como prometido, aqui está seu cupom de desconto exclusivo:
     
     NEWSLETTER5
     
     Use este cupom para ganhar 5% de desconto em compras acima de R$ 30.
     
     Visite nossa loja de fábrica:
     - Sábados e Domingos: 7h às 13h
     - Localização: Digite "Fábrica de arroz" no Google Maps
     - Telefone: (12) 3197-3400
     
     Até breve!
     Equipe Bem Casado Alimentos
     ```
6. Clique em **Save**

## 🎯 Criar Campanhas de Email

Para enviar campanhas promocionais:

1. Vá em **Campaigns** → **Create Campaign**
2. Selecione **Email**
3. Escolha **Regular** campaign
4. Configure:
   - **To**: Selecione sua lista "Newsletter Bem Casado"
   - **From**: noreply@arrozbemcasado.com.br
   - **Subject**: Ex: "Promoção de Fim de Semana - Arroz a R$ 2,30/kg"
   - **Content**: Use o editor para criar o email
5. Clique em **Send** ou **Schedule**

## 📊 Acompanhar Resultados

No dashboard do Mailchimp você pode ver:

- **Número de assinantes**: Total de emails cadastrados
- **Taxa de abertura**: Quantos abriram seus emails
- **Taxa de cliques**: Quantos clicaram nos links
- **Crescimento da lista**: Novos assinantes por dia/semana/mês

## 🔒 Segurança

**IMPORTANTE:**
- Nunca compartilhe sua chave de API publicamente
- Não commite a chave de API no código
- Use apenas variáveis de ambiente
- Revogue chaves antigas se suspeitar de vazamento

## 🆘 Solução de Problemas

### Email não está sendo cadastrado

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Verifique os logs do servidor para erros
3. Confirme que a chave de API está ativa no Mailchimp
4. Verifique se o ID da lista está correto

### Email já cadastrado

Se o usuário tentar se cadastrar novamente, o sistema mostrará a mensagem "Este email já está cadastrado na nossa newsletter!"

### Modo Simulação

Se as variáveis de ambiente não estiverem configuradas, o sistema funcionará em **modo simulação**:
- Emails não serão enviados ao Mailchimp
- Cupom será gerado normalmente
- Mensagem de sucesso será exibida
- Logs indicarão "MODO SIMULAÇÃO"

## 📚 Recursos Adicionais

- [Documentação oficial do Mailchimp](https://mailchimp.com/help/)
- [API Reference](https://mailchimp.com/developer/marketing/api/)
- [Guia de melhores práticas](https://mailchimp.com/resources/email-marketing-best-practices/)

## 💡 Dicas

1. **Segmente sua lista**: Use tags para separar clientes por interesse (ex: "Arroz", "Feijão", "Promoções")
2. **Teste seus emails**: Sempre envie um teste antes de enviar para toda a lista
3. **Respeite a frequência**: Não envie emails demais (recomendado: 1-2 por semana no máximo)
4. **Personalize**: Use o nome do assinante quando possível (*|FNAME|* no Mailchimp)
5. **Mobile-first**: Certifique-se que seus emails ficam bonitos no celular
6. **Call-to-action claro**: Sempre tenha um botão ou link destacado

## 📞 Suporte

Se precisar de ajuda adicional, entre em contato com o suporte do Mailchimp ou consulte a documentação técnica do projeto.
