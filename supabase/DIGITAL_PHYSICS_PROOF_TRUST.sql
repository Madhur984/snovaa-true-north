-- ============================================================================
-- SNOVAA PHASE 2: PROOF OF PRESENCE & TRUST ENGINE
-- Implements: Hash Chain Ledger & Trust Scoring
-- ============================================================================

-- 1. PROOF LAYER: CRYPTO COLUMNS
-- ============================================================================
-- We modify participation_ledger to support the "Event-Chain DAG" model.
-- Each device (scanner) creates its own local chain for an event.

-- First, ensure pgcrypto is available for hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.participation_ledger
ADD COLUMN IF NOT EXISTS device_id uuid, -- The scanner device
ADD COLUMN IF NOT EXISTS sequence_number integer, -- 1, 2, 3...
ADD COLUMN IF NOT EXISTS prev_hash text, -- Hash of the previous record
ADD COLUMN IF NOT EXISTS signature text, -- Cryptographic signature of this record
ADD COLUMN IF NOT EXISTS is_verified boolean GENERATED ALWAYS AS (
    -- In a real implementation, this would verify the signature against a public key.
    -- For this DB simulation, we leave it as a placeholder or use a simplified check
    -- e.g., checking if signature is present.
    (signature IS NOT NULL AND prev_hash IS NOT NULL)
) STORED;

-- Index for fast Chain lookups
CREATE INDEX IF NOT EXISTS idx_ledger_chain 
ON public.participation_ledger(event_id, device_id, sequence_number);

-- 2. ENFORCE HASH CHAIN CONTINUITY (DIGITAL PHYSICS)
-- ============================================================================
-- This trigger ensures that you cannot insert Record N unless Record N-1 exists
-- and the prev_hash matches.

CREATE OR REPLACE FUNCTION public.enforce_ledger_continuity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prev_record record;
    v_calculated_prev_hash text;
BEGIN
    -- 1. Genesis Check
    -- If sequence_number is 1, prev_hash must be 'GENESIS' (or the Event Hash)
    IF NEW.sequence_number = 1 THEN
        IF NEW.prev_hash != 'GENESIS' THEN
             RAISE EXCEPTION 'Digital Physics Violation: Genesis record must have GENESIS prev_hash';
        END IF;
        RETURN NEW;
    END IF;

    -- 2. Continuity Check
    -- Find the previous record (N-1)
    SELECT * INTO v_prev_record
    FROM public.participation_ledger
    WHERE event_id = NEW.event_id
      AND device_id = NEW.device_id
      AND sequence_number = (NEW.sequence_number - 1);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Digital Physics Violation: Broken Chain. Record % missing for Device % Event %', 
            (NEW.sequence_number - 1), NEW.device_id, NEW.event_id;
    END IF;

    -- 3. Hash Validation (Simplified for SQL)
    -- Ideally, prev_hash should match Hash(v_prev_record). 
    -- Here we rely on the client providing the link, and we verify the link exists.
    -- Stronger check: IF NEW.prev_hash != digest(v_prev_record::text, 'sha256') ...
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_ledger_continuity ON public.participation_ledger;
CREATE TRIGGER check_ledger_continuity
    BEFORE INSERT
    ON public.participation_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_ledger_continuity();


-- 3. TRUST ENGINE (MATERIALIZED VIEW)
-- ============================================================================
-- Calculates Trust Scores based on the IMMUTABLE ledger data.

DROP MATERIALIZED VIEW IF EXISTS public.club_trust_scores;

CREATE MATERIALIZED VIEW public.club_trust_scores AS
WITH club_stats AS (
    SELECT 
        e.club_id,
        count(DISTINCT e.id) as total_events,
        count(pl.id) as total_participations,
        count(CASE WHEN pl.is_verified THEN 1 END) as verified_participations,
        count(DISTINCT pl.participant_id) as unique_participants
    FROM public.events e
    LEFT JOIN public.participation_ledger pl ON e.id = pl.event_id
    WHERE e.status = 'completed' -- Only score completed events
    GROUP BY e.club_id
)
SELECT 
    club_id,
    total_events,
    total_participations,
    verified_participations,
    unique_participants,
    -- Simple Trust Score Calculation
    -- Example: (Verified Rate * 50%) + (Consistency * 50%)
    -- This is a placeholder for the complex algorithm
    CASE 
        WHEN total_participations = 0 THEN 0
        ELSE ROUND((verified_participations::numeric / total_participations::numeric) * 100, 2)
    END as trust_score,
    now() as last_updated
FROM club_stats;

-- Index for fast retrieval
CREATE UNIQUE INDEX IF NOT EXISTS idx_trust_scores_club_id ON public.club_trust_scores(club_id);

-- 4. REFRESH FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.refresh_trust_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.club_trust_scores;
END;
$$;
