begin;

-- Reuse the existing verified, active membership authorization.
-- Only status is writable: moderators cannot rewrite customer testimony.
grant select (id, display_name, body, rating, status, created_at)
  on public.customer_reviews to authenticated;
grant update (status) on public.customer_reviews to authenticated;

create policy "Moderators may read customer reviews"
  on public.customer_reviews for select to authenticated
  using ((select web_private.has_role(array['owner', 'publisher'])));

create policy "Moderators may change review status"
  on public.customer_reviews for update to authenticated
  using ((select web_private.has_role(array['owner', 'publisher'])))
  with check ((select web_private.has_role(array['owner', 'publisher'])));

commit;
