-- Clubs Schema with RBAC

-- 1. Clubs Table
create table public.clubs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  owner_id uuid references auth.users(id) not null,
  
  constraint slug_length check (char_length(slug) >= 3)
);

-- 2. Club Roles Table
create type club_role as enum ('owner', 'organizer', 'member');

create table public.club_roles (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role club_role not null default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(club_id, user_id)
);

-- 3. Events Table (Scoped to Club)
create table public.events (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  created_by uuid references auth.users(id),
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  location text,
  is_virtual boolean default false,
  max_attendees integer,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Event Attendees
create table public.event_attendees (
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'registered', -- registered, attended, cancelled
  attended_at timestamp with time zone,
  
  primary key (event_id, user_id)
);

-- 5. Announcements
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  author_id uuid references auth.users(id) not null,
  title text not null,
  content text not null,
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

alter table public.clubs enable row level security;
alter table public.club_roles enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.announcements enable row level security;

-- Clubs: Public read, Owner update
create policy "Clubs are viewable by everyone" on public.clubs for select using (true);
create policy "Users can create clubs" on public.clubs for insert with check (auth.uid() = owner_id);
create policy "Owners can update their clubs" on public.clubs for update using (auth.uid() = owner_id);

-- Roles: Public read, Owner manage
create policy "Roles are viewable by everyone" on public.club_roles for select using (true);
create policy "Owners can manage roles" on public.club_roles for all using (
  exists (select 1 from public.clubs where id = club_id and owner_id = auth.uid())
);
-- Self-join
create policy "Users can join clubs" on public.club_roles for insert with check (auth.uid() = user_id);

-- Events: Public read, Organizer/Owner write
create policy "Events are viewable by everyone" on public.events for select using (true);
create policy "Leaders can manage events" on public.events for all using (
  exists (
    select 1 from public.club_roles 
    where club_id = events.club_id 
    and user_id = auth.uid() 
    and role in ('owner', 'organizer')
  )
);

-- Announcements: Members read, Leaders write
create policy "Members can view announcements" on public.announcements for select using (
  exists (
    select 1 from public.club_roles 
    where club_id = announcements.club_id 
    and user_id = auth.uid()
  )
);
create policy "Leaders can post announcements" on public.announcements for insert with check (
  exists (
    select 1 from public.club_roles 
    where club_id = announcements.club_id 
    and user_id = auth.uid() 
    and role in ('owner', 'organizer')
  )
);
