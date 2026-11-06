// Tests the access-rule migration against a throwaway in-memory Postgres, using a
// stand-in copy of the affected tables and their previous rules. It never touches
// the live database.
//   npm i --no-save @electric-sql/pglite@0.2.17
//   node supabase/tests/access-rules.test.mjs supabase/migrations/20261106003128_tighten_sharing_access.sql
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
const db = new PGlite();
const student='11111111-1111-1111-1111-111111111111', other='22222222-2222-2222-2222-222222222222';
await db.exec(`
create role anon nologin; create role authenticated nologin;
create schema auth; create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
grant usage on schema auth to anon, authenticated; grant usage on schema public to anon, authenticated;
create table public.students(id uuid primary key default gen_random_uuid(), auth_user_id uuid not null, name text not null, email text not null, cohort_year int);
create table public.portfolios(id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students, visibility text not null default 'private' check (visibility in ('private','cohort','public')), bio text, profile_statement text, updated_at timestamptz default now());
create table public.assessor_links(id uuid primary key default gen_random_uuid(), portfolio_id uuid not null references public.portfolios, token text not null, label text, expires_at timestamptz, created_at timestamptz not null default now());
create table public.journal_entries(id uuid primary key default gen_random_uuid(), portfolio_id uuid not null references public.portfolios, course_title text, title text not null, content jsonb not null default '{}', entry_date date not null default current_date, updated_at timestamptz default now());
create table public.entry_skills(id uuid primary key default gen_random_uuid(), entry_id uuid not null references public.journal_entries, skill_id text not null, skill_name text not null, domain_id text not null, dreyfus_level int not null, reflection text);
create table public.entry_methods(id uuid primary key default gen_random_uuid(), entry_id uuid not null references public.journal_entries, method_name text not null);
create table public.channels(id uuid primary key default gen_random_uuid(), name text not null, type text not null default 'public');
create table public.channel_members(id uuid primary key default gen_random_uuid(), channel_id uuid not null references public.channels, student_id uuid not null);
create table public.messages(id uuid primary key default gen_random_uuid(), channel_id uuid not null references public.channels, student_id uuid not null, body text not null);
alter table public.students enable row level security; alter table public.portfolios enable row level security; alter table public.assessor_links enable row level security; alter table public.journal_entries enable row level security; alter table public.entry_skills enable row level security; alter table public.entry_methods enable row level security; alter table public.channels enable row level security; alter table public.channel_members enable row level security; alter table public.messages enable row level security;
grant all on all tables in schema public to anon, authenticated;
create policy "Students can read own record" on public.students for select using ((select auth.uid())=auth_user_id);
create policy "Students can manage own portfolio" on public.portfolios for all using (student_id=(select s.id from public.students s where s.auth_user_id=(select auth.uid())));
create policy "Cohort members can view cohort portfolios" on public.portfolios for select using (visibility = any(array['cohort','public']));
create policy "Students can manage own assessor links" on public.assessor_links for all using (portfolio_id in (select id from public.portfolios where student_id=(select s.id from public.students s where s.auth_user_id=(select auth.uid()))));
create policy "Anyone can read assessor links by token" on public.assessor_links for select using (true);
create policy "Students can manage own entries" on public.journal_entries for all using (portfolio_id in (select id from public.portfolios where student_id=(select s.id from public.students s where s.auth_user_id=(select auth.uid()))));
create policy "Cohort members can view cohort entries" on public.journal_entries for select using (portfolio_id in (select id from public.portfolios where visibility=any(array['cohort','public'])));
create policy "Cohort members can view cohort entry skills" on public.entry_skills for select using (entry_id in (select je.id from public.journal_entries je join public.portfolios p on p.id=je.portfolio_id where p.visibility=any(array['cohort','public'])));
create policy "channels: read public or member" on public.channels for select using (type='public');
create policy "messages: read in visible channels" on public.messages for select using (channel_id in (select id from public.channels where type='public'));
create function public.handle_new_user() returns trigger language plpgsql security definer as $f$
begin
  insert into public.students (auth_user_id, name, email, cohort_year) values (new.id, coalesce(split_part(new.email,'@',1),'x'), new.email, extract(year from now())::int);
  insert into public.portfolios (student_id, visibility) values ((select id from public.students where auth_user_id=new.id),'private');
  return new;
end; $f$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.update_updated_at() returns trigger language plpgsql as $f$ begin new.updated_at=now(); return new; end; $f$;
create trigger pu before update on public.portfolios for each row execute function public.update_updated_at();
`);
const ins=async()=>{ await db.exec(`
insert into auth.users values ('${student}','a@x.org'),('${other}','b@x.org');
update public.portfolios set visibility='cohort' where student_id=(select id from public.students where auth_user_id='${other}');
insert into public.assessor_links(portfolio_id,token,expires_at) select p.id,'good',now()+interval '1 day' from public.portfolios p join public.students s on s.id=p.student_id where s.auth_user_id='${student}';
insert into public.assessor_links(portfolio_id,token,expires_at) select p.id,'old',now()-interval '1 day' from public.portfolios p join public.students s on s.id=p.student_id where s.auth_user_id='${student}';
insert into public.assessor_links(portfolio_id,token) select p.id,'noexpiry' from public.portfolios p join public.students s on s.id=p.student_id where s.auth_user_id='${student}';
insert into public.journal_entries(portfolio_id,title,content) select p.id,'E1','{"secret":"body"}' from public.portfolios p join public.students s on s.id=p.student_id where s.auth_user_id='${student}';
insert into public.journal_entries(portfolio_id,title) select p.id,'OTHER' from public.portfolios p join public.students s on s.id=p.student_id where s.auth_user_id='${other}';
insert into public.entry_skills(entry_id,skill_id,skill_name,domain_id,dreyfus_level,reflection) select id,'s','S','d',2,'private reflection' from public.journal_entries where title='E1';
insert into public.entry_methods(entry_id,method_name) select id,'M' from public.journal_entries where title='E1';
insert into public.channels(name) values ('general'); insert into public.messages(channel_id,student_id,body) select id,'${student}','hello' from public.channels;
`)}; await ins();
const asRole=async(role,uid,sql)=>{ try { const r=await db.transaction(async t=>{ await t.exec(`set local role ${role}; select set_config('test.uid','${uid||''}',true);`); return await t.query(sql); }); return r.rows; } catch(e){ return 'DENIED: '+e.message.slice(0,60);} };
const res=[]; const check=(n,ok,x)=>{res.push(ok); console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  -> '+JSON.stringify(x)))};
const before=await asRole('anon','',"select count(*)::int n from public.assessor_links"); console.log('before: anon lists links =',before[0].n);
const before2=await asRole('anon','',"select count(*)::int n from public.journal_entries"); console.log('before: anon reads cohort-visible entries =',before2[0].n);
await db.exec(readFileSync(process.argv[2],'utf8'));
for (const t of ['assessor_links','portfolios','students','journal_entries','entry_skills','entry_methods','channels','messages']) { const r=await asRole('anon','',`select count(*) from public.${t}`); check('anon denied '+t, typeof r==='string', r); }
for (const op of ["insert into public.channels(name) values ('x')","update public.students set name='x'","delete from public.assessor_links"]) { const r=await asRole('anon','',op); check('anon denied: '+op.slice(0,28), typeof r==='string', r); }
const good=await asRole('anon','',"select public.get_shared_portfolio('good') r"); const g=good[0]?.r;
check('valid token returns the portfolio', g?.name==='a' && g.entries.length===1 && g.methods[0]==='M', good);
check('no email, entry content or reflection returned', !JSON.stringify(g).match(/x\.org|secret|private reflection/), g);
check('other student work not in result', !JSON.stringify(g).includes('OTHER'), g);
check('expired token returns nothing', (await asRole('anon','',"select public.get_shared_portfolio('old') r"))[0].r===null);
check('unknown token returns nothing', (await asRole('anon','',"select public.get_shared_portfolio('nope') r"))[0].r===null);
check('old no-expiry link now has an expiry', (await db.query("select expires_at from public.assessor_links where token='noexpiry'")).rows[0].expires_at!==null);
const a=await asRole('authenticated',student,"select count(*)::int n from public.assessor_links"); check('student sees only own links', a[0].n===3, a);
const b=await asRole('authenticated',other,"select count(*)::int n from public.assessor_links"); check('other student cannot list them', b[0].n===0, b);
const c=await asRole('authenticated',student,"select title from public.journal_entries"); check('student reads own entries only', c.length===1&&c[0].title==='E1', c);
const c2=await asRole('authenticated',student,"select visibility from public.portfolios"); check('cohort portfolio no longer readable by another student; all private', c2.length===1&&c2[0].visibility==='private', c2);
const d=await asRole('authenticated',student,"select count(*)::int n from public.messages"); check('signed-in user reads public channel', d[0].n===1, d);
const e=await asRole('authenticated',student,"select public.handle_new_user()"); check('handle_new_user not callable directly', typeof e==='string', e);
await db.exec("insert into auth.users values ('33333333-3333-3333-3333-333333333333','c@x.org')");
check('sign-up trigger still creates student and portfolio', (await db.query("select count(*)::int n from public.portfolios p join public.students s on s.id=p.student_id where s.email='c@x.org' and p.visibility='private'")).rows[0].n===1);
await db.exec("update public.portfolios set bio='z'"); check('updated_at trigger still runs', true);
await db.exec("insert into public.assessor_links(portfolio_id,token) select id,'def' from public.portfolios limit 1");
check('new links get a default expiry', (await db.query("select expires_at > now()+interval '29 days' ok from public.assessor_links where token='def'")).rows[0].ok);
await db.exec("create table public.future_t(id int)"); const f=await db.query("select has_table_privilege('anon','public.future_t','select') p"); check('future tables closed to anon', f.rows[0].p===false, f.rows);
console.log(`\n${res.filter(Boolean).length}/${res.length} passed`);
