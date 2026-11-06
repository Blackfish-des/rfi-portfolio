-- Tighten sharing and signed-out access before real learner work goes in.
-- Everything is private by default. Assessors reach a portfolio only through
-- get_shared_portfolio, using a token that expires.

-- 1. Share links: remove the rule that let anyone list every link and token.
drop policy "Anyone can read assessor links by token" on public.assessor_links;

-- Every share link expires. Students can delete one sooner.
update public.assessor_links
  set expires_at = now() + interval '30 days'
  where expires_at is null;
alter table public.assessor_links
  alter column expires_at set default now() + interval '30 days',
  alter column expires_at set not null;

-- 2. Portfolios: "cohort" and "public" were readable by anyone, with no cohort
-- check. Remove those rules until cohorts exist and the sharing review is built.
drop policy "Cohort members can view cohort portfolios" on public.portfolios;
drop policy "Cohort members can view cohort entries" on public.journal_entries;
drop policy "Cohort members can view cohort entry skills" on public.entry_skills;

update public.portfolios
  set visibility = 'private'
  where visibility <> 'private';

-- 3. Channels and messages: signed-in users only.
drop policy "channels: read public or member" on public.channels;
create policy "channels: read public or member" on public.channels
  for select to authenticated
  using (
    type = 'public'
    or id in (
      select channel_members.channel_id
      from public.channel_members
      where channel_members.student_id = (
        select students.id from public.students
        where students.auth_user_id = (select auth.uid())
      )
    )
  );

drop policy "messages: read in visible channels" on public.messages;
create policy "messages: read in visible channels" on public.messages
  for select to authenticated
  using (
    channel_id in (
      select channels.id from public.channels
      where channels.type = 'public'
        or channels.id in (
          select channel_members.channel_id
          from public.channel_members
          where channel_members.student_id = (
            select students.id from public.students
            where students.auth_user_id = (select auth.uid())
          )
        )
    )
  );

-- 4. Assessor view: one narrow function, gated by a current token. It returns
-- only what the page shows: no email address, entry content or skill reflections.
create function public.get_shared_portfolio(share_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'name', s.name,
    'cohort_year', s.cohort_year,
    'profile_statement', p.profile_statement,
    'bio', p.bio,
    'entries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id,
        'title', e.title,
        'entry_date', e.entry_date,
        'course_title', e.course_title
      ) order by e.entry_date desc)
      from public.journal_entries e
      where e.portfolio_id = p.id
    ), '[]'::jsonb),
    'skills', coalesce((
      select jsonb_agg(jsonb_build_object(
        'skill_id', es.skill_id,
        'skill_name', es.skill_name,
        'domain_id', es.domain_id,
        'dreyfus_level', es.dreyfus_level
      ))
      from public.entry_skills es
      join public.journal_entries e on e.id = es.entry_id
      where e.portfolio_id = p.id
    ), '[]'::jsonb),
    'methods', coalesce((
      select jsonb_agg(distinct em.method_name)
      from public.entry_methods em
      join public.journal_entries e on e.id = em.entry_id
      where e.portfolio_id = p.id
    ), '[]'::jsonb)
  )
  from public.assessor_links l
  join public.portfolios p on p.id = l.portfolio_id
  join public.students s on s.id = p.student_id
  where l.token = share_token
    and l.expires_at > now();
$$;

revoke execute on function public.get_shared_portfolio(text) from public;
grant execute on function public.get_shared_portfolio(text) to anon, authenticated;

-- 5. Signed-out visitors get no direct table access, now or on future tables.
-- Row-level security stays on as the second layer.
revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;

-- 6. Supabase security warnings. The sign-up trigger still fires after the revoke.
alter function public.handle_new_user() set search_path = '';
alter function public.update_updated_at() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
