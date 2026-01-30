-- ============================================================================
-- DIGITAL PHYSICS: ADVANCED GOVERNANCE
-- 1. Roles: Owner, Co-Organizer, Volunteer.
-- 2. Limits: Max 2 Co-Organizers, Max 3 Volunteers.
-- 3. Hierarchy: Secure RPC for role management.
-- ============================================================================

-- 1. SCHEMA UPDATE
-- ============================================================================
-- Drop old constraint
ALTER TABLE public.club_organizers DROP CONSTRAINT IF EXISTS club_organizers_role_check;

-- Migrate Data (Map old roles to new user-defined terms)
UPDATE public.club_organizers SET role = 'co-organizer' WHERE role = 'organizer';
UPDATE public.club_organizers SET role = 'volunteer' WHERE role = 'moderator';

-- Add new constraint
ALTER TABLE public.club_organizers 
ADD CONSTRAINT club_organizers_role_check 
CHECK (role IN ('owner', 'co-organizer', 'volunteer'));

-- 2. ROLE LIMITS (TRIGGER)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_role_limits()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    v_co_org_count integer;
    v_vol_count integer;
BEGIN
    -- Only check limit if adding/changing to restricted role
    IF NEW.role = 'co-organizer' THEN
        SELECT count(*) INTO v_co_org_count 
        FROM public.club_organizers 
        WHERE club_id = NEW.club_id AND role = 'co-organizer' AND profile_id != NEW.profile_id;
        
        -- Limit is 2
        IF v_co_org_count >= 2 THEN
            RAISE EXCEPTION 'Governance Violation: A club can have at most 2 Co-Organizers.';
        END IF;
        
    ELSIF NEW.role = 'volunteer' THEN
        SELECT count(*) INTO v_vol_count 
        FROM public.club_organizers 
        WHERE club_id = NEW.club_id AND role = 'volunteer' AND profile_id != NEW.profile_id;
        
        -- Limit is 3
        IF v_vol_count >= 3 THEN
            RAISE EXCEPTION 'Governance Violation: A club can have at most 3 Volunteers.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_role_limits ON public.club_organizers;
CREATE TRIGGER trg_enforce_role_limits
    BEFORE INSERT OR UPDATE ON public.club_organizers
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_role_limits();

-- 3. PERMISSION HIERARCHY (RPC)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.manage_club_role(
    p_club_id uuid,
    p_target_profile_id uuid,
    p_target_role text, -- 'co-organizer', 'volunteer', or NULL to remove
    p_action text -- 'augment' (add/update) or 'dismiss' (remove)
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_actor_role text;
BEGIN
    -- 1. Get Actor's Role
    SELECT role INTO v_actor_role
    FROM public.club_organizers
    WHERE club_id = p_club_id AND profile_id = auth.uid();

    IF v_actor_role IS NULL THEN
        RAISE EXCEPTION 'Access Denied: You are not an organizer of this club.';
    END IF;

    -- 2. Enforce Hierarchy
    IF v_actor_role = 'owner' THEN
        -- Owner can do anything EXCEPT remove themselves via this function (safety)
        IF p_target_profile_id = auth.uid() AND p_action = 'dismiss' THEN
             RAISE EXCEPTION 'Safety: Owners cannot dismiss themselves via this function. Transfer ownership first.';
        END IF;
        -- Proceed
        
    ELSIF v_actor_role = 'co-organizer' THEN
        -- Co-Organizer can ONLY manage volunteers
        IF p_target_role = 'co-organizer' OR p_target_role = 'owner' THEN
            RAISE EXCEPTION 'Hierarchy Violation: Co-Organizers cannot manage peers or owners.';
        END IF;
        
        -- Also check if they are trying to dismiss an existing higher rank
        IF p_action = 'dismiss' THEN
            DECLARE
                v_existing_target_role text;
            BEGIN
                SELECT role INTO v_existing_target_role 
                FROM public.club_organizers 
                WHERE club_id = p_club_id AND profile_id = p_target_profile_id;
                
                IF v_existing_target_role IN ('owner', 'co-organizer') THEN
                     RAISE EXCEPTION 'Hierarchy Violation: You cannot dismiss this user.';
                END IF;
            END;
        END IF;
        
    ELSE
        RAISE EXCEPTION 'Access Denied: Volunteers have no management powers.';
    END IF;

    -- 3. Execute Action
    IF p_action = 'dismiss' THEN
        DELETE FROM public.club_organizers 
        WHERE club_id = p_club_id AND profile_id = p_target_profile_id;
        RETURN jsonb_build_object('success', true, 'message', 'User dismissed.');
        
    ELSIF p_action = 'augment' THEN
        INSERT INTO public.club_organizers (club_id, profile_id, role)
        VALUES (p_club_id, p_target_profile_id, p_target_role)
        ON CONFLICT (club_id, profile_id) 
        DO UPDATE SET role = EXCLUDED.role;
        RETURN jsonb_build_object('success', true, 'message', 'Role assigned.');
    ELSE
        RAISE EXCEPTION 'Invalid action. Use "augment" or "dismiss".';
    END IF;
END;
$$;
