-- Tabela de contatos do CRM
create table contatos (
  id         bigint generated always as identity primary key,
  nome       text not null,
  email      text,
  telefone   text,
  etapa      text not null default 'novo'
             check (etapa in ('novo', 'em contato', 'proposta', 'cliente')),
  anotacoes  text,
  criado_em  timestamptz not null default now()
);

-- 3 contatos de exemplo
insert into contatos (nome, email, telefone, etapa, anotacoes) values
  ('Ana Ribeiro',   'ana.ribeiro@exemplo.com.br',  '(11) 98877-1234', 'em contato',
   'Pediu proposta para 20 licenças. Retornar na quinta.'),
  ('Bruno Tavares', 'bruno@tavaresconsult.com.br', '(21) 99123-4567', 'proposta',
   'Proposta enviada dia 02. Aguardando resposta do sócio.'),
  ('Carla Menezes', 'carla.menezes@exemplo.com.br','(31) 98555-7788', 'novo',
   'Veio pelo formulário do site. Ainda não teve contato.');

   alter table contatos
  alter column email    set not null,
  alter column telefone set not null;

  -- 1. Tabela de anotações: vários registros por contato, cada um com sua data
create table anotacoes (
  id         bigint generated always as identity primary key,
  contato_id bigint not null references contatos(id) on delete cascade,
  texto      text not null,
  criado_em  timestamptz not null default now()
);

-- Deixa rápida a busca das anotações de um contato
create index anotacoes_contato_idx on anotacoes (contato_id, criado_em desc);

-- 2. Leva as anotações que já existem para a tabela nova, sem perder nada
insert into anotacoes (contato_id, texto, criado_em)
select id, anotacoes, criado_em
from contatos
where anotacoes is not null and trim(anotacoes) <> '';

-- 3. A coluna antiga sai de cena (o conteúdo dela já foi copiado no passo 2)
alter table contatos drop column anotacoes;

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