-- ============================================================================
-- SNOVAA REPAIR SCRIPT: Missing Tables & Functions
-- Run this to fix "Function not found" and "Table not found" errors
-- ============================================================================

-- PART 1: MISSING TABLES
-- ============================================================================

-- 1. Create clubs table
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

-- 2. Create club_organizers table
CREATE TABLE IF NOT EXISTS public.club_organizers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL DEFAULT 'organizer' CHECK (role IN ('owner', 'organizer', 'moderator')),
    added_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (club_id, profile_id)
);
ALTER TABLE public.club_organizers ENABLE ROW LEVEL SECURITY;

-- 3. Create club_members table
CREATE TABLE IF NOT EXISTS public.club_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    UNIQUE (club_id, profile_id)
);
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- 4. Add club_id to events table (if not exists)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES public.clubs(id);

-- 5. Create event_lifecycle_log (REQUIRED FOR PUBLISHING)
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

-- 6. Create event_blueprints table
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

-- 7. Add blueprint_id to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS blueprint_id uuid REFERENCES public.event_blueprints(id);

-- 8. Create event_checkpoints table
CREATE TABLE IF NOT EXISTS public.event_checkpoints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    sequence_order integer NOT NULL,
    location text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.event_checkpoints ENABLE ROW LEVEL SECURITY;

-- 9. Create checkpoint_records table
CREATE TABLE IF NOT EXISTS public.checkpoint_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id uuid REFERENCES public.event_checkpoints(id) ON DELETE CASCADE NOT NULL,
    participant_id uuid REFERENCES public.profiles(id) NOT NULL,
    recorded_at timestamp with time zone NOT NULL DEFAULT now(),
    recorded_by uuid REFERENCES public.profiles(id)
);
ALTER TABLE public.checkpoint_records ENABLE ROW LEVEL SECURITY;


-- PART 2: FUNCTIONS (Fixes "Transition failed" error)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.transition_event_status(
    p_event_id uuid,
    p_new_status text,
    p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_status text;
    v_profile_id uuid;
    v_is_organizer boolean;
BEGIN
    SELECT status INTO v_current_status FROM events WHERE id = p_event_id;
    
    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
    
    SELECT id INTO v_profile_id FROM profiles WHERE user_id = auth.uid();
    
    SELECT EXISTS(
        SELECT 1 FROM events 
        WHERE id = p_event_id AND organizer_id = v_profile_id
    ) INTO v_is_organizer;
    
    IF NOT v_is_organizer THEN
        RAISE EXCEPTION 'Not authorized to change event status';
    END IF;
    
    -- Validate transition
    IF v_current_status = 'draft' AND p_new_status NOT IN ('published', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status transition from draft';
    ELSIF v_current_status = 'published' AND p_new_status NOT IN ('live', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status transition from published';
    ELSIF v_current_status = 'live' AND p_new_status NOT IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status transition from live';
    ELSIF v_current_status IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot change status of completed or cancelled events';
    END IF;
    
    INSERT INTO event_lifecycle_log (event_id, previous_status, new_status, changed_by, reason)
    VALUES (p_event_id, v_current_status, p_new_status, v_profile_id, p_reason);
    
    UPDATE events SET 
        status = p_new_status,
        published_at = CASE WHEN p_new_status = 'published' THEN now() ELSE published_at END
    WHERE id = p_event_id;
    
    RETURN true;
END;
$$;


-- PART 3: POLICIES (RLS)
-- ============================================================================

-- Clubs policies
CREATE POLICY "Anyone can view active clubs" ON public.clubs FOR SELECT USING (status = 'active');
CREATE POLICY "Organizers can create clubs" ON public.clubs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Club owners can update their clubs" ON public.clubs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM club_organizers co JOIN profiles p ON co.profile_id = p.id WHERE co.club_id = clubs.id AND p.user_id = auth.uid() AND co.role = 'owner')
);

-- Club organizers policies
CREATE POLICY "Anyone can view club organizers" ON public.club_organizers FOR SELECT USING (true);
CREATE POLICY "Club owners can manage organizers" ON public.club_organizers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM club_organizers co JOIN profiles p ON co.profile_id = p.id WHERE co.club_id = club_organizers.club_id AND p.user_id = auth.uid() AND co.role = 'owner')
    OR profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Club members policies
CREATE POLICY "View own membership or club organizers can view" ON public.club_members FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM club_organizers co JOIN profiles p ON co.profile_id = p.id WHERE co.club_id = club_members.club_id AND p.user_id = auth.uid())
);
CREATE POLICY "Users can join clubs" ON public.club_members FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Event lifecycle log policies
CREATE POLICY "Organizers can view lifecycle for their events" ON public.event_lifecycle_log FOR SELECT USING (
    event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Organizers can insert lifecycle records" ON public.event_lifecycle_log FOR INSERT WITH CHECK (
    event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Event blueprints policies
CREATE POLICY "Anyone can view blueprints" ON public.event_blueprints FOR SELECT USING (true);

-- Event checkpoints policies
CREATE POLICY "View checkpoints for published events or own events" ON public.event_checkpoints FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE status IN ('published', 'completed', 'live'))
    OR event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Organizers can insert checkpoints" ON public.event_checkpoints FOR INSERT WITH CHECK (
    event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Checkpoint records policies
CREATE POLICY "View checkpoint records for own events or participation" ON public.checkpoint_records FOR SELECT USING (
    checkpoint_id IN (SELECT ec.id FROM event_checkpoints ec JOIN events e ON ec.event_id = e.id WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR participant_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Organizers can record checkpoint passes" ON public.checkpoint_records FOR INSERT WITH CHECK (
    checkpoint_id IN (SELECT ec.id FROM event_checkpoints ec JOIN events e ON ec.event_id = e.id WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
