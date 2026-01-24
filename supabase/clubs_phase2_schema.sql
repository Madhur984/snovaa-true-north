-- Clubs Phase 2: Engagement Schema

-- 1. Club Chat Messages
create table public.club_chat_messages (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint message_length check (char_length(content) > 0 and char_length(content) <= 2000)
);

-- 2. Function to check attendance threshold (Earned Access)
create or replace function public.check_chat_access(check_user_id uuid, check_club_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  attendance_count integer;
  user_role public.club_role;
begin
  -- First check if user has a role in the club
  select role into user_role
  from public.club_roles
  where club_id = check_club_id and user_id = check_user_id;

  -- Owners and Organizers always have access
  if user_role in ('owner', 'organizer') then
    return true;
  end if;

  -- For Members, check attendance count
  select count(*) into attendance_count
  from public.event_attendees ea
  join public.events e on e.id = ea.event_id
  where e.club_id = check_club_id
  and ea.user_id = check_user_id
  and ea.status = 'attended';

  -- Threshold is 3 events
  return attendance_count >= 3;
end;
$$;

-- 3. RLS Policies for Chat
alter table public.club_chat_messages enable row level security;

-- Read policy: accessible if you have access
create policy "Users with access can view chat" on public.club_chat_messages for select using (
  public.check_chat_access(auth.uid(), club_id)
);

-- Write policy: accessible if you have access
create policy "Users with access can send messages" on public.club_chat_messages for insert with check (
  auth.uid() = user_id and
  public.check_chat_access(auth.uid(), club_id)
);
