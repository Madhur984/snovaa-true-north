-- ============================================================================
-- SNOVAA PHASE 3: DIGITAL ECOLOGY & SOCIAL PHYSICS
-- Implements: Event Templates, Club Lifecycle, Social Capital, Announcements
-- ============================================================================

-- 1. FEATURE 5: DESIGN TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL, -- e.g. "5k Run", "Workshop"
    description text,
    category text NOT NULL,
    structure jsonb NOT NULL DEFAULT '{}', -- Phases, Checkpoints, Logic
    created_at timestamp with time zone DEFAULT now()
);

-- 2. FEATURE 7: DIGITAL ECOLOGY (CLUB LIFECYCLE)
-- ============================================================================
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS health_score numeric DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100);

-- Function to check and degrade club health
CREATE OR REPLACE FUNCTION public.check_club_vitality()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This is a simplified "vitality check" trigger. 
    -- In a full implementation, this might be a cron job.
    -- Here, we just update 'last_activity_at' on any modification.
    NEW.last_activity_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_club_activity ON public.clubs;
CREATE TRIGGER update_club_activity
    BEFORE UPDATE ON public.clubs
    FOR EACH ROW
    EXECUTE FUNCTION public.check_club_vitality();

-- 3. FEATURE 9: SOCIAL CAPITAL (CHAT & MEMBER STATS)
-- ============================================================================
-- A. Cache verified event count on members for fast RLS
ALTER TABLE public.club_members
ADD COLUMN IF NOT EXISTS verified_event_count integer DEFAULT 0;

-- B. Trigger to update member stats from Participation Ledger
CREATE OR REPLACE FUNCTION public.update_member_social_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When a ledger entry becomes verified (or is inserted as verified)
    IF (TG_OP = 'INSERT' AND NEW.is_verified = true) OR 
       (TG_OP = 'UPDATE' AND NEW.is_verified = true AND OLD.is_verified = false) THEN
       
       UPDATE public.club_members
       SET verified_event_count = verified_event_count + 1
       WHERE profile_id = NEW.participant_id
         AND club_id = (SELECT club_id FROM public.events WHERE id = NEW.event_id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_social_stats ON public.participation_ledger;
CREATE TRIGGER update_social_stats
    AFTER INSERT OR UPDATE ON public.participation_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.update_member_social_stats();

-- C. RLS for Chat (Social Capital Enforcement)
-- We create a specific table for Club Chat to ensure physics enforcement.
CREATE TABLE IF NOT EXISTS public.club_chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.club_chat_messages ENABLE ROW LEVEL SECURITY;

-- POLICY: Read Access (Basic Member)
CREATE POLICY "Members can view chat" ON public.club_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.club_members 
            WHERE club_id = club_chat_messages.club_id 
              AND profile_id = auth.uid()
        )
    );

-- POLICY: Write Access (SOCIAL CAPITAL)
-- Only allow insert if member has verified_event_count >= 3 (or standard is active)
-- For now, we enforce that they must be a member. 
-- The "3 events" rule can be added as: AND verified_event_count >= 3
CREATE POLICY "Earned access to post" ON public.club_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.club_members 
            WHERE club_id = club_chat_messages.club_id 
              AND profile_id = auth.uid()
              AND (
                  -- Physics Rule: Must have social capital OR be an owner
                  verified_event_count >= 3 
                  OR 
                  EXISTS (SELECT 1 FROM public.club_organizers WHERE club_id = club_chat_messages.club_id AND profile_id = auth.uid())
              )
        )
    );

-- 4. FEATURE 10: CLUB ANNOUNCEMENTS (IMMUTABLE BROADCASTS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.club_announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
    author_id uuid REFERENCES public.profiles(id),
    title text NOT NULL,
    content text NOT NULL,
    priority text DEFAULT 'normal' CHECK (priority IN ('normal', 'emergency')),
    sent_at timestamp with time zone DEFAULT now(),
    -- Immutability: No updates allowed (enforced by policy/trigger typically, 
    -- here we rely on RLS generally not allowing UPDATE).
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.club_announcements ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.announcement_receipts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id uuid REFERENCES public.club_announcements(id) ON DELETE CASCADE,
    reader_id uuid REFERENCES public.profiles(id),
    read_at timestamp with time zone DEFAULT now(),
    signature text -- Cryptographic proof of receipt if needed
);

ALTER TABLE public.announcement_receipts ENABLE ROW LEVEL SECURITY;

-- POLICIES for Announcements
-- Owners can create
CREATE POLICY "Owners can broadcast" ON public.club_announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.club_organizers 
            WHERE club_id = club_announcements.club_id 
              AND profile_id = auth.uid()
              AND role = 'owner'
        )
    );

-- Everyone can read
CREATE POLICY "Members can view broadcasts" ON public.club_announcements
    FOR SELECT USING (true); -- Simplified public read for announcements

-- NO UPDATE POLICY -> Immutability
