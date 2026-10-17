-- Integration test. Synthetic identities/review are rolled back, never published.
begin;
insert into auth.users (id, email, email_confirmed_at)
values ('a341ea34-1c95-466b-b91c-f33fbe96d301', 'review-test@example.invalid', now());
insert into web_private.admin_members (user_id, role)
values ('a341ea34-1c95-466b-b91c-f33fbe96d301', 'owner');
insert into public.customer_reviews (id, display_name, body, rating)
values ('a341ea34-1c95-466b-b91c-f33fbe96d302', 'Integration test', 'Synthetic review rolled back after testing.', 3);
select set_config('request.jwt.claim.sub', 'a341ea34-1c95-466b-b91c-f33fbe96d301', true);
set local role authenticated;
do $$
begin
  update public.customer_reviews set status='published' where id='a341ea34-1c95-466b-b91c-f33fbe96d302';
  if not found then raise exception 'owner could not publish'; end if;
  begin
    update public.customer_reviews set rating=5 where id='a341ea34-1c95-466b-b91c-f33fbe96d302';
    raise exception 'moderator rewrote a rating';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
update web_private.admin_members set role='publisher' where user_id='a341ea34-1c95-466b-b91c-f33fbe96d301';
set local role authenticated;
do $$
begin
  update public.customer_reviews set status='rejected' where id='a341ea34-1c95-466b-b91c-f33fbe96d302';
  if not found then raise exception 'publisher could not withdraw'; end if;
end $$;
reset role;
update web_private.admin_members set role='editor' where user_id='a341ea34-1c95-466b-b91c-f33fbe96d301';
set local role authenticated;
do $$
begin
  if exists(select 1 from public.customer_reviews where id='a341ea34-1c95-466b-b91c-f33fbe96d302') then
    raise exception 'editor read private review';
  end if;
  update public.customer_reviews set status='published' where id='a341ea34-1c95-466b-b91c-f33fbe96d302';
  if found then raise exception 'editor published review'; end if;
end $$;
reset role;
set local role anon;
do $$
begin
  if exists(select 1 from public.customer_reviews where id='a341ea34-1c95-466b-b91c-f33fbe96d302') then
    raise exception 'visitor read rejected review';
  end if;
  begin
    update public.customer_reviews set status='published' where id='a341ea34-1c95-466b-b91c-f33fbe96d302';
    raise exception 'visitor published review';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
