-- ============================================================================
-- DIGITAL PHYSICS FIXES
-- Implements missing RPCs required by Frontend components.
-- ============================================================================

-- Fix for Feature 10 (Announcements) - Frontend expects this RPC
CREATE OR REPLACE FUNCTION public.broadcast_to_members(
    p_club_id uuid,
    p_title text,
    p_message text,
    p_type text DEFAULT 'announcement'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_announcement_id uuid;
    v_recipient_count integer;
BEGIN
    -- 1. Security Check: Must be Owner
    IF NOT EXISTS (
        SELECT 1 FROM public.club_organizers 
        WHERE club_id = p_club_id 
          AND profile_id = auth.uid()
          AND role = 'owner'
    ) THEN
        RAISE EXCEPTION 'Access Denied: Only club owners can broadcast.';
    END IF;

    -- 2. Create Immutable Announcement
    INSERT INTO public.club_announcements (club_id, author_id, title, content, priority)
    VALUES (p_club_id, auth.uid(), p_title, p_message, 
            CASE WHEN p_type = 'alert' THEN 'emergency' ELSE 'normal' END)
    RETURNING id INTO v_announcement_id;

    -- 3. (Optional) Create Receipts or Notification Jobs
    -- For now, we just count members to return "delivered to X members"
    SELECT count(*) INTO v_recipient_count
    FROM public.club_members
    WHERE club_id = p_club_id AND status = 'active';

    RETURN jsonb_build_object(
        'success', true,
        'announcement_id', v_announcement_id,
        'recipient_count', v_recipient_count
    );
END;
$$;
