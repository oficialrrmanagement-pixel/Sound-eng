-- Team Duck next-package migration: city base for technical members
alter table public.profiles
  add column if not exists base_city text;

comment on column public.profiles.base_city is 'Cidade base / residência operacional do técnico, visível como identificação resumida.';
