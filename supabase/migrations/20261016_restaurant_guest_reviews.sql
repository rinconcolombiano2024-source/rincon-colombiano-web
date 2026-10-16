-- Public reviews are visible only after an authorized staff member approves them.
create table if not exists public.restaurant_guest_reviews (
 id uuid primary key default gen_random_uuid(),
 display_name text not null check (char_length(display_name) between 2 and 60),
 rating smallint not null check (rating between 1 and 5),
 comment text not null check (char_length(comment) between 10 and 1000),
 locale text not null check (locale in ('es','pl','en')),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);
create index if not exists restaurant_guest_reviews_public_idx on public.restaurant_guest_reviews (created_at desc) where status = 'approved';
alter table public.restaurant_guest_reviews enable row level security;
revoke all on public.restaurant_guest_reviews from public, anon, authenticated;
grant select (id, display_name, rating, comment, locale, created_at) on public.restaurant_guest_reviews to anon, authenticated;
grant insert (display_name, rating, comment, locale) on public.restaurant_guest_reviews to anon;
drop policy if exists guest_reviews_public_read on public.restaurant_guest_reviews;
create policy guest_reviews_public_read on public.restaurant_guest_reviews for select to anon, authenticated using (status = 'approved');
drop policy if exists guest_reviews_public_submit on public.restaurant_guest_reviews;
create policy guest_reviews_public_submit on public.restaurant_guest_reviews for insert to anon with check (status = 'pending' and reviewed_at is null);
-- No client-side update/delete policies. Review moderation must use an authorized server-side process.
