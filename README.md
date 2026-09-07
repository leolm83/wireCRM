# Fio

CRM simples para quem não quer perder o fio da conversa.

Organiza contatos e oportunidades de negócio em um lugar só, no lugar de
planilhas soltas e conversas espalhadas pelo WhatsApp e pelo e-mail. Cada
contato tem sua etapa no funil e seu histórico de conversas — e a IA escreve
a mensagem de retomada quando alguém fica parado tempo demais.

---

## O que ele faz

- **Contatos** — cadastro com nome, e-mail e telefone, todos conferidos antes
  de salvar (inclusive DDD que existe de fato no Brasil).
- **Funil** — cada contato fica em uma etapa: `novo`, `em contato`, `proposta`
  ou `cliente`. A etiqueta colorida é também o controle: clique nela para mover.
- **Anotações** — o histórico de cada relacionamento, com data. Vários registros
  por contato, com edição e exclusão.
- **Follow-up por IA** — lê o nome, a etapa e as anotações do contato e escreve
  uma mensagem curta, pronta para copiar e enviar.
- **Painel** — o total de contatos e a contagem por etapa, em números grandes.
  É a tela inicial.
- **Acesso controlado** — login por senha, com dois papéis e aprovação de novos
  cadastros pelo administrador.

---

## Papéis

| | administrador | comum |
|---|---|---|
| Ler contatos e anotações | sim | sim |
| Cadastrar contato | sim | sim |
| Mover contato de etapa | sim | não |
| Escrever, editar e excluir anotação | sim | não |
| Gerar follow-up | sim | não |
| Aprovar novos cadastros | sim | não |

Quem se cadastra entra como **comum** e **pendente** — não acessa nada até um
administrador aprovar. Cada restrição existe em duas camadas: o controle não
aparece na tela, e o servidor recusa se alguém contornar a interface.

---

## Como rodar

### 1. Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou mais novo
- Uma conta no [Supabase](https://supabase.com) (banco de dados)
- Uma chave da [API do Claude](https://console.anthropic.com) (para o follow-up)

### 2. Instalar

```bash
npm install
```

### 3. Criar as tabelas

No painel do Supabase: **SQL Editor** → **New query** → cole e rode.

```sql
create table contatos (
  id         bigint generated always as identity primary key,
  nome       text not null,
  email      text,
  telefone   text,
  etapa      text not null default 'novo'
             check (etapa in ('novo', 'em contato', 'proposta', 'cliente')),
  criado_em  timestamptz not null default now()
);

create table anotacoes (
  id         bigint generated always as identity primary key,
  contato_id bigint not null references contatos(id) on delete cascade,
  texto      text not null,
  criado_em  timestamptz not null default now()
);

create index anotacoes_contato_idx on anotacoes (contato_id, criado_em desc);

create table usuarios (
  id         bigint generated always as identity primary key,
  usuario    text not null unique,
  senha_hash text not null,
  papel      text not null default 'comum'
             check (papel in ('admin', 'comum')),
  status     text not null default 'pendente'
             check (status in ('pendente', 'aprovado')),
  criado_em  timestamptz not null default now()
);
```

### 4. Definir usuário e senha do administrador

```bash
npm run gerar-senha
```

Ele pergunta usuário e senha (a senha não aparece na tela) e imprime três
linhas prontas para colar no `.env.local`. A senha em si não é guardada em
lugar nenhum — só o resultado embaralhado dela.

### 5. Preencher o arquivo de segredos

Crie um arquivo `.env.local` na raiz do projeto:

```
# Supabase — Settings > API
SUPABASE_URL=
SUPABASE_SECRET_KEY=

# API do Claude — console.anthropic.com > Settings > API keys
ANTHROPIC_API_KEY=

# As três linhas que o "npm run gerar-senha" imprimiu
CRM_USUARIO=
CRM_SENHA_HASH=
CRM_SESSAO_SEGREDO=
```

Nenhuma variável tem o prefixo `NEXT_PUBLIC_`, e isso é de propósito: tudo que
começa assim é embutido no site e fica visível para qualquer visitante. Todas
essas ficam só no servidor.

O `.env.local` está no `.gitignore` e nunca deve ir para o repositório.

### 6. Criar o administrador no banco

```bash
npm run criar-admin
```

Leva o acesso do `.env.local` para a tabela de usuários, já como administrador
aprovado. **Rodar uma vez só.** Depois disso, `CRM_USUARIO` e `CRM_SENHA_HASH`
servem apenas para esse comando — o login passa a consultar o banco.

`CRM_SESSAO_SEGREDO` continua em uso permanente: é ele que assina o cookie de
sessão. Trocá-lo derruba todas as sessões abertas na hora, o que é útil se você
suspeitar que alguém entrou.

### 7. Ligar

```bash
npm run dev
```

Abra **http://localhost:3000** e entre com o usuário e a senha do passo 4.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Liga o servidor de desenvolvimento em `localhost:3000` |
| `npm run build` | Prepara a versão para publicação |
| `npm start` | Roda a versão publicada |
| `npm run gerar-senha` | Gera usuário, senha embaralhada e segredo de sessão |
| `npm run criar-admin` | Cria o administrador no banco a partir do `.env.local` |
| `npm run mudar-etapa <nome> <etapa>` | Move um contato de etapa pelo terminal |

---

## Como o projeto é organizado

```
app/
  (interno)/          telas de dentro do sistema — o layout aqui exige sessão,
    page.jsx          então toda página nova já nasce protegida
    contatos/
    usuarios/
  login/
  cadastro/
  acoes*.js           tudo que grava no banco ("use server")
  *.jsx               componentes de tela

lib/
  supabase.js         conexão com o banco
  sessao.js           cookie assinado, quem está logado, papéis
  senha.js            embaralhamento e conferência de senha
  usuarios.js         consultas à tabela de usuários
  validacao.js        regras de validação, usadas na tela e no servidor
  followup.js         a chamada à IA

scripts/              comandos de terminal (senha, admin, etapa)

prd.md                o que o produto é e faz
design.md             a identidade visual — manda em todas as telas
```

Duas decisões que explicam o resto:

**Nada fala com o banco pelo navegador.** As telas pedem os dados ao servidor,
que responde com o resultado pronto. Por isso as chaves nunca precisam sair
do servidor.

**As regras de validação moram num arquivo só** (`lib/validacao.js`), usado
pelo formulário e pela ação que grava. O navegador avisa rápido; o servidor é
quem realmente decide.

---

## Como as senhas são guardadas

Nunca em texto. O que fica salvo é o resultado de uma conta que só vai num
sentido — dá para conferir se uma senha bate, mas não dá para voltar do
resultado até a senha original.

Usamos **scrypt**, que já vem no Node e é lento de propósito: isso torna
inviável testar bilhões de senhas por segundo. Cada senha leva um punhado de
bytes aleatórios misturado antes da conta (o "sal"), então duas pessoas com a
mesma senha têm resultados diferentes.

---

## Base técnica

- **Next.js** — telas e servidor no mesmo projeto
- **Supabase** — banco de dados PostgreSQL
- **API do Claude** (`claude-sonnet-5`) — escreve os follow-ups
- Sem biblioteca de componentes: o CSS segue o `design.md`, em variáveis
- Sem biblioteca de autenticação: sessão por cookie assinado com HMAC

---

## O que ainda não existe

- **Limite de tentativas de login.** Nada impede alguém de testar senhas
  indefinidamente. É o principal item a resolver antes de publicar.
- **Promover alguém a administrador pela tela.** Só direto no banco.
- **Editar ou excluir contato.** Só anotações têm isso.
- **Campo "empresa" no contato.** Está no `prd.md`, não foi construído.
- **Recuperação de senha.**

Vale saber: ao gerar um follow-up, as anotações daquele contato são enviadas
para a API do Claude.
