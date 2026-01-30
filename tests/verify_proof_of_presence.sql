-- ============================================================================
-- VERIFICATION SCRIPT: PHASE 2 - PROOF & TRUST
-- Verifies Hash Chain continuity and Trust Score generation
-- ============================================================================

DO $$
DECLARE
    v_club_id uuid;
    v_event_id uuid;
    v_device_id uuid := gen_random_uuid();
    v_participant_id uuid := '8aade6f7-dd4c-471e-84ea-57776a830cc2'; -- Valid user
    v_trust_score numeric;
BEGIN
    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'STARTING PROOF & TRUST VERIFICATION';
    RAISE NOTICE '---------------------------------------------------';

    -- 1. SETUP
    -- Create a Club and an Event
    INSERT INTO public.clubs (name, category, created_by)
    VALUES ('Proof Test Club' || gen_random_uuid()::text, 'Tech', v_participant_id)
    RETURNING id INTO v_club_id;

    -- FIX: Provide 'venue', 'event_date', 'max_participants' etc if required
    INSERT INTO public.events (
        club_id, 
        title, 
        event_date, 
        start_time, 
        end_time, 
        organizer_id, 
        status,
        venue, 
        max_participants
    )
    VALUES (
        v_club_id, 
        'Genesis Event', 
        CURRENT_DATE, 
        '10:00:00', 
        '11:00:00', 
        v_participant_id, 
        'completed',
        'Test Venue Location',
        100
    )
    RETURNING id INTO v_event_id;

    RAISE NOTICE '  -> Setup: Created Club and Event';

    -- 2. TEST HASH CHAIN PHYSICS
    -- ----------------------------------------------------------------------------
    RAISE NOTICE '[TEST 1/2] Hash Chain Physics';

    -- A. Insert Genesis Record (Seq 1)
    -- FIX: Action must be 'attended'
    INSERT INTO public.participation_ledger 
        (event_id, participant_id, action, device_id, sequence_number, prev_hash, signature)
    VALUES 
        (v_event_id, v_participant_id, 'attended', v_device_id, 1, 'GENESIS', 'sig_1');
    
    RAISE NOTICE '  -> PROOF: Genesis record accepted.';

    -- B. Attempt Broken Chain (Seq 3 without Seq 2)
    BEGIN
        INSERT INTO public.participation_ledger 
            (event_id, participant_id, action, device_id, sequence_number, prev_hash, signature)
        VALUES 
            (v_event_id, v_participant_id, 'attended', v_device_id, 3, 'some_hash', 'sig_3');
        
        RAISE EXCEPTION 'Chain violation check FAILED. Allowed non-sequential insert.';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Digital Physics Violation%' THEN
            RAISE NOTICE '  -> PROOF: Broken chain rejected correctly.';
        ELSE
            RAISE NOTICE '  -> ERROR: Unexpected error: %', SQLERRM;
            RAISE;
        END IF;
    END;

    -- C. Insert Valid Next Record (Seq 2)
    INSERT INTO public.participation_ledger 
        (event_id, participant_id, action, device_id, sequence_number, prev_hash, signature)
    VALUES 
        (v_event_id, v_participant_id, 'attended', v_device_id, 2, 'hash_of_1', 'sig_2');
    
    RAISE NOTICE '  -> PROOF: Sequential record accepted.';


    -- 3. TEST TRUST ENGINE
    -- ----------------------------------------------------------------------------
    RAISE NOTICE '[TEST 2/2] Trust Engine';

    -- Refresh the view
    PERFORM public.refresh_trust_scores();

    -- Check if our club has a score
    SELECT trust_score INTO v_trust_score
    FROM public.club_trust_scores
    WHERE club_id = v_club_id;

    RAISE NOTICE '  -> Trust Score computed: %', v_trust_score;

    IF v_trust_score IS NULL THEN
        RAISE EXCEPTION 'Trust Engine failed to compute score';
    END IF;

    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'VERIFICATION COMPLETE: PROOF & TRUST HOLDING';
    RAISE NOTICE '---------------------------------------------------';

    -- Rollback
    RAISE EXCEPTION 'Test finished successfully, rolling back transaction.';

EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'Test finished successfully, rolling back transaction.' THEN
        RAISE NOTICE 'Test run complete. Data rolled back.';
    ELSE
        RAISE EXCEPTION 'Test failed: %', SQLERRM;
    END IF;
END $$;
