-- Apply with Supabase SQL editor before enabling customer reviews.
-- Reviews are never automatically public; the restaurant approves them manually.
create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 60),
  body text not null check (char_length(body) between 10 and 1000),
  rating smallint not null check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists customer_reviews_published_idx on public.customer_reviews (created_at desc) where status = 'published';
alter table public.customer_reviews enable row level security;
revoke all on public.customer_reviews from anon, authenticated;
grant select (id, display_name, body, rating, created_at, status) on public.customer_reviews to anon;
grant insert (display_name, body, rating) on public.customer_reviews to anon;
drop policy if exists "Anyone may read published reviews" on public.customer_reviews;
create policy "Anyone may read published reviews" on public.customer_reviews for select to anon using (status = 'published');
drop policy if exists "Visitors may submit pending reviews" on public.customer_reviews;
create policy "Visitors may submit pending reviews" on public.customer_reviews for insert to anon with check (status = 'pending');
-- Approve in Supabase dashboard with an authorized administrator only:
-- update public.customer_reviews set status='published' where id='<review UUID>';
