-- =====================================================
-- SNOVAA SCHEMA PART 2: Core Tables
-- =====================================================

-- 1. Create user_roles table (security-first approach)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_at timestamp with time zone NOT NULL DEFAULT now(),
    granted_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Create clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    category text NOT NULL,
    city_id uuid REFERENCES public.cities(id),
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    verified_at timestamp with time zone,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived'))
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- 3. Create club_organizers table
CREATE TABLE IF NOT EXISTS public.club_organizers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL DEFAULT 'organizer' CHECK (role IN ('owner', 'organizer', 'moderator')),
    added_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (club_id, profile_id)
);

ALTER TABLE public.club_organizers ENABLE ROW LEVEL SECURITY;

-- 4. Create club_members table
CREATE TABLE IF NOT EXISTS public.club_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    UNIQUE (club_id, profile_id)
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- 5. Add club_id to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES public.clubs(id);

-- 6. Create event_lifecycle_log
CREATE TABLE IF NOT EXISTS public.event_lifecycle_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    previous_status text,
    new_status text NOT NULL,
    changed_by uuid NOT NULL,
    changed_at timestamp with time zone NOT NULL DEFAULT now(),
    reason text
);

ALTER TABLE public.event_lifecycle_log ENABLE ROW LEVEL SECURITY;

-- 7. Create event_blueprints table
CREATE TABLE IF NOT EXISTS public.event_blueprints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    category text NOT NULL,
    default_modules jsonb NOT NULL DEFAULT '[]',
    default_config jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.event_blueprints ENABLE ROW LEVEL SECURITY;

-- 8. Add blueprint_id to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS blueprint_id uuid REFERENCES public.event_blueprints(id);

-- 9. Create event_checkpoints table
CREATE TABLE IF NOT EXISTS public.event_checkpoints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    sequence_order integer NOT NULL,
    location text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.event_checkpoints ENABLE ROW LEVEL SECURITY;

-- 10. Create checkpoint_records table (append-only)
CREATE TABLE IF NOT EXISTS public.checkpoint_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id uuid REFERENCES public.event_checkpoints(id) ON DELETE CASCADE NOT NULL,
    participant_id uuid REFERENCES public.profiles(id) NOT NULL,
    recorded_at timestamp with time zone NOT NULL DEFAULT now(),
    recorded_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.checkpoint_records ENABLE ROW LEVEL SECURITY;