-- ============================================================================
-- SNOVAA MIGRATION: DIGITAL PHYSICS - IMMUTABLE CORE (IDEMPOTENT FIX)
-- Implements: Cryptographic Identity & Multi-Sig Governance
-- ============================================================================

-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch"; -- For soundex, metaphone
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- For similarity search

-- 2. IDENTITY LAYER (Clubs)
-- ============================================================================

-- Add Generated Columns for Identity
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS normalized_name text 
GENERATED ALWAYS AS (
    regexp_replace(lower(trim(name)), '[^a-z0-9]', '', 'g')
) STORED;

ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS phonetic_hash text 
GENERATED ALWAYS AS (
    soundex(name)
) STORED;

-- Enforce Strict Uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS clubs_identity_idx 
ON public.clubs (normalized_name, phonetic_hash);

-- Anti-Squatting Trigger Function
-- FIX: Explicitly compute values because NEW.generated_column might not be reliable in BEFORE trigger context depending on PG version/timing
CREATE OR REPLACE FUNCTION public.prevent_name_squatting()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    SIMILARITY_THRESHOLD constant real := 0.6; 
    v_new_normalized text;
    v_new_phonetic text;
    conflicting_club record;
BEGIN
    -- Explicitly compute values for the check
    v_new_normalized := regexp_replace(lower(trim(NEW.name)), '[^a-z0-9]', '', 'g');
    v_new_phonetic := soundex(NEW.name);

    -- Check for similar names
    SELECT id, name INTO conflicting_club
    FROM public.clubs
    WHERE id != NEW.id
      AND (
          -- Trigram similarity
          similarity(normalized_name, v_new_normalized) > SIMILARITY_THRESHOLD
          OR
          -- Soundex match
          (phonetic_hash = v_new_phonetic) 
      )
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'Club validation error: Name "%" is too similar to existing club "%" (ID: %). Digital Physics Violation: Identity Collision.', 
            NEW.name, conflicting_club.name, conflicting_club.id
            USING HINT = 'Choose a more distinct name.';
    END IF;

    RETURN NEW;
END;
$$;

-- Attach Trigger to Clubs
DROP TRIGGER IF EXISTS check_club_identity ON public.clubs;
CREATE TRIGGER check_club_identity
    BEFORE INSERT OR UPDATE OF name
    ON public.clubs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_name_squatting();


-- 3. GOVERNANCE LAYER (Multi-Sig)
-- ============================================================================

-- Proposal Types Enum
DO $$ BEGIN
    CREATE TYPE public.governance_action_type AS ENUM (
        'update_details', 
        'transfer_ownership', 
        'add_organizer', 
        'remove_organizer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Governance Proposals Table
CREATE TABLE IF NOT EXISTS public.club_governance_proposals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    proposer_id uuid REFERENCES public.profiles(id) NOT NULL,
    action_type public.governance_action_type NOT NULL,
    payload jsonb NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'executed', 'rejected', 'expired')),
    threshold integer NOT NULL DEFAULT 2, 
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
    executed_at timestamp with time zone
);

ALTER TABLE public.club_governance_proposals ENABLE ROW LEVEL SECURITY;

-- Governance Approvals Table (The Signatures)
CREATE TABLE IF NOT EXISTS public.club_governance_approvals (
    proposal_id uuid REFERENCES public.club_governance_proposals(id) ON DELETE CASCADE NOT NULL,
    approver_id uuid REFERENCES public.profiles(id) NOT NULL,
    signature_hash text,
    signed_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(proposal_id, approver_id)
);

ALTER TABLE public.club_governance_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Proposals
DROP POLICY IF EXISTS "Organizers can view proposals" ON public.club_governance_proposals;
CREATE POLICY "Organizers can view proposals" ON public.club_governance_proposals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.club_organizers 
            WHERE club_id = club_governance_proposals.club_id 
            AND profile_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create proposals" ON public.club_governance_proposals;
CREATE POLICY "Owners can create proposals" ON public.club_governance_proposals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.club_organizers 
            WHERE club_id = club_governance_proposals.club_id 
            AND profile_id = auth.uid()
            AND role = 'owner'
        )
    );

-- Approvals
DROP POLICY IF EXISTS "Organizers can view approvals" ON public.club_governance_approvals;
CREATE POLICY "Organizers can view approvals" ON public.club_governance_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.club_governance_proposals p
            JOIN public.club_organizers co ON p.club_id = co.club_id
            WHERE p.id = club_governance_approvals.proposal_id
            AND co.profile_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can sign approvals" ON public.club_governance_approvals;
CREATE POLICY "Owners can sign approvals" ON public.club_governance_approvals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.club_governance_proposals p
            JOIN public.club_organizers co ON p.club_id = co.club_id
            WHERE p.id = club_governance_approvals.proposal_id
            AND co.profile_id = auth.uid()
            AND co.role = 'owner'
        )
    );


-- 4. CONSENSUS EXECUTION ENGINE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.execute_governance_proposal()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_club_id uuid;
    v_action_type public.governance_action_type;
    v_payload jsonb;
    v_status text;
    v_threshold integer;
    v_approval_count integer;
BEGIN
    SELECT club_id, action_type, payload, status, threshold 
    INTO v_club_id, v_action_type, v_payload, v_status, v_threshold
    FROM public.club_governance_proposals
    WHERE id = NEW.proposal_id;

    IF v_status != 'active' THEN
        RETURN NEW;
    END IF;

    SELECT count(*) INTO v_approval_count
    FROM public.club_governance_approvals
    WHERE proposal_id = NEW.proposal_id;

    IF v_approval_count >= v_threshold THEN
        CASE v_action_type
            WHEN 'update_details' THEN
                UPDATE public.clubs 
                SET 
                    name = COALESCE((v_payload->>'name')::text, name),
                    description = COALESCE((v_payload->>'description')::text, description),
                    verified_at = now()
                WHERE id = v_club_id;
            
            WHEN 'add_organizer' THEN
                INSERT INTO public.club_organizers (club_id, profile_id, role)
                VALUES (
                    v_club_id, 
                    (v_payload->>'profile_id')::uuid, 
                    (v_payload->>'role')::text
                );

            ELSE
                RAISE NOTICE 'Action type % not yet implemented', v_action_type;
        END CASE;

        UPDATE public.club_governance_proposals
        SET status = 'executed', executed_at = now()
        WHERE id = NEW.proposal_id;
        
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_consensus ON public.club_governance_approvals;
CREATE TRIGGER check_consensus
    AFTER INSERT
    ON public.club_governance_approvals
    FOR EACH ROW
    EXECUTE FUNCTION public.execute_governance_proposal();
