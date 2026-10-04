-- supabase_schema.sql
-- LOGIKA: Jedna tabulka `documents` slouží OBĚMA konzumentům (Dokumentace i ChatBot),
--         rozlišuje se přes sloupec `domain` (viz komentář v DocumentSaver.js):
--   'chatbot_qa'   -> otázky/odpovědi z JSON/ (platformové know-how)
--   'chatbot_fact' -> fakta z JSON_Svářečská_škola/ (a další budoucí kurzy)
--
-- Spusť v Supabase SQL editoru JEDNOU, před prvním voláním SeedTrainingData.js.

create extension if not exists vector;

create table if not exists documents (
    id bigint generated always as identity primary key,
    domain text not null,
    ref_id text not null,
    nadpis text,
    content text not null,      -- text, na kterém se počítal embedding (otázka / fakt)
    odpoved text not null,      -- text, který se vrací uživateli
    embedding vector(512),      -- Universal Sentence Encoder = 512 dimenzí
    created_at timestamptz not null default now(),
    unique (domain, ref_id)     -- umožňuje UPSERT v DocumentSaver.js (bez duplicit při re-seedu)
);

create index if not exists documents_embedding_idx
    on documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- LOGIKA: `domain_filter` je pole domén, ve kterých se má hledat (null = všude).
--         SearchDocument.js posílá buď ['chatbot_qa'] (Dokumentace), nebo
--         ['chatbot_qa','chatbot_fact'] (ChatBot).
create or replace function match_documents (
    query_embedding vector(512),
    match_threshold float,
    match_count int,
    domain_filter text[] default null
)
returns table (
    id bigint,
    domain text,
    ref_id text,
    nadpis text,
    content text,
    odpoved text,
    similarity float
)
language sql stable
as $$
    select
        documents.id,
        documents.domain,
        documents.ref_id,
        documents.nadpis,
        documents.content,
        documents.odpoved,
        1 - (documents.embedding <=> query_embedding) as similarity
    from documents
    where (domain_filter is null or documents.domain = any(domain_filter))
        and 1 - (documents.embedding <=> query_embedding) > match_threshold
    order by documents.embedding <=> query_embedding
    limit match_count;
$$;
