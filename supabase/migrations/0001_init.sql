-- 커플 캘린더 & 주말 플래너 초기 스키마
-- Supabase SQL Editor에서 한 번에 실행한다.

-- ───────────────────────── 테이블 ─────────────────────────

-- 프로필: auth.users 생성 시 자동 생성
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '나',
  emoji text not null default '🙂',
  color text not null default '#F4A6A6',   -- 캘린더에서 작성자 구분용
  created_at timestamptz not null default now()
);

-- 하고 싶은 것 / 먹고 싶은 것 후보
create table wishes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references profiles(id) default auth.uid(),
  title text not null check (char_length(title) between 1 and 60),
  category text not null default 'activity'
    check (category in ('food','activity','place','etc')),
  link text,
  note text,
  status text not null default 'open'
    check (status in ('open','done','archived')),
  created_at timestamptz not null default now()
);

-- 일정 (캘린더의 기본 단위). 하루에 여러 개 가능
create table plans (
  id uuid primary key default gen_random_uuid(),
  plan_date date not null,
  start_time time,                         -- 선택
  title text not null check (char_length(title) between 1 and 60),
  emoji text,                              -- 캘린더 칸에 표시할 대표 이모지
  category text check (category in ('food','activity','place','etc')),
  location text,
  note text,                               -- 그날의 기록(자유 메모)
  wish_id uuid references wishes(id) on delete set null,
  week_of date,                            -- 투표로 생성된 경우 해당 주
  created_by uuid not null references profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index plans_date_idx on plans (plan_date);

-- 주간 투표 (한 사람당 주 1표, 변경 가능)
create table votes (
  id uuid primary key default gen_random_uuid(),
  week_of date not null,                   -- 해당 주 월요일 (Asia/Seoul 기준)
  user_id uuid not null references profiles(id) default auth.uid(),
  wish_id uuid not null references wishes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (week_of, user_id)
);

-- 사진 (파일은 R2, 여기에는 메타데이터와 키만)
create table photos (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) default auth.uid(),
  object_key text not null unique,         -- 예: plans/{plan_id}/{uuid}.jpg
  thumb_key text not null unique,          -- 예: plans/{plan_id}/{uuid}_thumb.jpg
  taken_at timestamptz,
  lat double precision,
  lng double precision,
  width int,
  height int,
  created_at timestamptz not null default now()
);
create index photos_plan_idx on photos (plan_id);

-- 코멘트 (일정마다 여러 개, 두 사람 모두 작성 가능)
create table comments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  author_id uuid not null references profiles(id) default auth.uid(),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index comments_plan_idx on comments (plan_id);

-- 각자의 별점 (일정당 한 사람 1개)
create table ratings (
  plan_id uuid not null references plans(id) on delete cascade,
  author_id uuid not null references profiles(id) default auth.uid(),
  rating int not null check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (plan_id, author_id)
);

-- ───────────────────── 헬퍼 함수와 트리거 ─────────────────────

-- 가입 시 프로필 자동 생성
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

-- updated_at 자동 갱신 (comments, ratings)
create function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger comments_set_updated_at
before update on comments for each row execute function public.set_updated_at();
create trigger ratings_set_updated_at
before update on ratings for each row execute function public.set_updated_at();

-- 멤버 여부
create function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

-- 해당 주에 두 사람 모두 투표했는지
-- (votes 정책 안에서 votes를 다시 조회하면 RLS 재귀가 생기므로 security definer 함수로 분리)
create function public.both_voted(w date) returns boolean
language sql stable security definer set search_path = public as $$
  select count(distinct user_id) >= 2 from votes where week_of = w;
$$;

-- 상대 투표 여부만 반환 (어떤 후보를 골랐는지는 노출하지 않음)
create function public.partner_voted(w date) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from votes where week_of = w and user_id <> auth.uid());
$$;

-- 월간 캘린더용 요약: 날짜별 일정 수, 대표 이모지, 대표 사진 썸네일 키
create function public.calendar_month(from_date date, to_date date)
returns table (plan_date date, plan_count int, emojis text[], thumb_key text)
language sql stable security invoker set search_path = public as $$
  select p.plan_date,
         count(*)::int,
         array_agg(coalesce(p.emoji, '📌') order by p.start_time nulls last, p.created_at),
         (select ph.thumb_key from photos ph
            join plans p2 on p2.id = ph.plan_id
           where p2.plan_date = p.plan_date
           order by ph.taken_at nulls last, ph.created_at
           limit 1)
    from plans p
   where p.plan_date between from_date and to_date
   group by p.plan_date;
$$;

-- 함수 실행 권한: 로그인한 사용자만 (트리거 함수는 직접 호출 불가)
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.is_member(),
  public.both_voted(date),
  public.partner_voted(date),
  public.calendar_month(date, date)
to authenticated;

-- ───────────────────────── RLS ─────────────────────────

alter table profiles enable row level security;
alter table wishes   enable row level security;
alter table plans    enable row level security;
alter table votes    enable row level security;
alter table photos   enable row level security;
alter table comments enable row level security;
alter table ratings  enable row level security;

-- profiles
create policy profiles_select on profiles for select to authenticated using (is_member());
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- wishes
create policy wishes_select on wishes for select to authenticated using (is_member());
create policy wishes_insert on wishes for insert to authenticated with check (is_member());
create policy wishes_update on wishes for update to authenticated
  using (is_member()) with check (is_member());
create policy wishes_delete on wishes for delete to authenticated using (created_by = auth.uid());

-- plans (두 사람이 같이 관리)
create policy plans_select on plans for select to authenticated using (is_member());
create policy plans_insert on plans for insert to authenticated with check (is_member());
create policy plans_update on plans for update to authenticated
  using (is_member()) with check (is_member());
create policy plans_delete on plans for delete to authenticated using (is_member());

-- votes: 상대가 투표하기 전에는 상대의 표가 조회되지 않는다 (핵심)
create policy votes_select on votes for select to authenticated
  using (user_id = auth.uid() or both_voted(week_of));
create policy votes_insert on votes for insert to authenticated
  with check (user_id = auth.uid() and is_member());
create policy votes_update on votes for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy votes_delete on votes for delete to authenticated using (user_id = auth.uid());

-- photos (수정 불가)
create policy photos_select on photos for select to authenticated using (is_member());
create policy photos_insert on photos for insert to authenticated
  with check (uploaded_by = auth.uid() and is_member());
create policy photos_delete on photos for delete to authenticated using (uploaded_by = auth.uid());

-- comments
create policy comments_select on comments for select to authenticated using (is_member());
create policy comments_insert on comments for insert to authenticated
  with check (author_id = auth.uid() and is_member());
create policy comments_update on comments for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy comments_delete on comments for delete to authenticated using (author_id = auth.uid());

-- ratings
create policy ratings_select on ratings for select to authenticated using (is_member());
create policy ratings_insert on ratings for insert to authenticated
  with check (author_id = auth.uid() and is_member());
create policy ratings_update on ratings for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy ratings_delete on ratings for delete to authenticated using (author_id = auth.uid());
