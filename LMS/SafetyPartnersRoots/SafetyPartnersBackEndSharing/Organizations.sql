create table if not exists organizations (
  id text primary key,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists login_tokens (
  jti uuid primary key,
  org_id text not null references organizations(id),
  student_id text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists login_tokens_expires_idx on login_tokens (expires_at);

alter table organizations enable row level security;
alter table login_tokens  enable row level security;

-- testovací firma
insert into organizations (id, name) values ('firma1', 'Testovací firma')
on conflict (id) do nothing;
