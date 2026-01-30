-- ============================================================================
-- DIGITAL PHYSICS: RELAXED SOCIAL RULES
-- 1. Chat: Allow immediate access (drop 3-event rule).
-- 2. Announcements: Enforce strict Owner/Volunteer access.
-- ============================================================================

-- 1. RELAX CHAT PERMISSIONS
-- ============================================================================
-- Drop the strict "Social Capital" policy
DROP POLICY IF EXISTS "Earned access to post" ON public.club_chat_messages;

-- Create the relaxed "Members Only" policy
CREATE POLICY "Members can post" ON public.club_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.club_members 
            WHERE club_id = club_chat_messages.club_id 
              AND profile_id = auth.uid()
              AND status = 'active'
        )
    );

-- 2. ENFORCE ANNOUNCEMENT PERMISSIONS
-- ============================================================================
-- Ensure we have strict policies.
-- First, drop existing insert policy if it exists (to be safe and replace it)
DROP POLICY IF EXISTS "Owners can broadcast" ON public.club_announcements;

-- Create strict policy for Owners AND Volunteers
CREATE POLICY "Privileged broadcast" ON public.club_announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.club_organizers 
            WHERE club_id = club_announcements.club_id 
              AND profile_id = auth.uid()
              AND role IN ('owner', 'organizer')
        )
    );
