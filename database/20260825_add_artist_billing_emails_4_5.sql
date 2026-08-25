alter table public.artists
  add column if not exists billing_email_4 text,
  add column if not exists billing_email_5 text;
