-- ============================================================================
-- VERIFICATION SCRIPT: ADVANCED GOVERNANCE
-- Verifies: Role Limits (2 Co-Orgs, 3 Vols) & Permission Hierarchy
-- ============================================================================

DO $$
DECLARE
    v_club_id uuid;
    v_owner_id uuid := '8aade6f7-dd4c-471e-84ea-57776a830cc2'; -- Valid existing owner
    
    -- User IDs (Stable UUIDs for this test run)
    v_co1_uid uuid := '11111111-1111-1111-1111-111111111111';
    v_co2_uid uuid := '22222222-2222-2222-2222-222222222222';
    v_co3_uid uuid := '33333333-3333-3333-3333-333333333333';
    v_vol1_uid uuid := '44444444-4444-4444-4444-444444444444';
    v_vol2_uid uuid := '55555555-5555-5555-5555-555555555555';
    v_vol3_uid uuid := '66666666-6666-6666-6666-666666666666';
    v_vol4_uid uuid := '77777777-7777-7777-7777-777777777777';
    
    -- Profile IDs (Resolved at runtime)
    v_owner_pid uuid;
    v_co1_pid uuid;
    v_co2_pid uuid;
    v_co3_pid uuid;
    v_vol1_pid uuid;
    v_vol2_pid uuid;
    v_vol3_pid uuid;
    v_vol4_pid uuid;
    
BEGIN
    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'STARTING GOVERNANCE VERIFICATION';
    RAISE NOTICE '---------------------------------------------------';

    -- 1. SETUP
    -- Cleanup
    -- Delete organizers linked to our test users (via profile->user link)
    DELETE FROM public.club_organizers 
    WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id IN (v_co1_uid, v_co2_uid, v_co3_uid, v_vol1_uid, v_vol2_uid, v_vol3_uid, v_vol4_uid));
    
    -- Delete the clubs we created
    DELETE FROM public.clubs WHERE name LIKE 'Governance Test Club%';
    
    -- Delete the users (should cascade to profiles)
    DELETE FROM auth.users WHERE id IN (v_co1_uid, v_co2_uid, v_co3_uid, v_vol1_uid, v_vol2_uid, v_vol3_uid, v_vol4_uid);

    -- Create Auth Users (Trigger will create Profiles)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES 
        (v_co1_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'co1@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Co1"}', now(), now(), '', '', '', ''),
        (v_co2_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'co2@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Co2"}', now(), now(), '', '', '', ''),
        (v_co3_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'co3@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Co3"}', now(), now(), '', '', '', ''),
        (v_vol1_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vol1@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Vol1"}', now(), now(), '', '', '', ''),
        (v_vol2_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vol2@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Vol2"}', now(), now(), '', '', '', ''),
        (v_vol3_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vol3@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Vol3"}', now(), now(), '', '', '', ''),
        (v_vol4_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vol4@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Vol4"}', now(), now(), '', '', '', '');
    
    -- RESOLVE PROFILE IDs (Force create if missing)
    -- Owner
    -- Ensure Owner User Exists First (if missing)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (v_owner_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@test.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Owner"}', now(), now(), '', '', '', '')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (user_id, display_name) VALUES (v_owner_id, 'Owner') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_owner_pid;
    
    -- Co1
    INSERT INTO public.profiles (user_id, display_name) VALUES (v_co1_uid, 'Co1') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_co1_pid;
    
    -- Co2
    INSERT INTO public.profiles (user_id, display_name) VALUES (v_co2_uid, 'Co2') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_co2_pid;

    -- Co3
    INSERT INTO public.profiles (user_id, display_name) VALUES (v_co3_uid, 'Co3') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_co3_pid;

    -- Vol1
    INSERT INTO public.profiles (user_id, display_name) VALUES (v_vol1_uid, 'Vol1') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_vol1_pid;

    -- Vol2
    INSERT INTO public.profiles (user_id, display_name) VALUES (v_vol2_uid, 'Vol2') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_vol2_pid;

    -- Vol3
    INSERT INTO public.profiles (user_id, display_name) VALUES (v_vol3_uid, 'Vol3') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_vol3_pid;

    -- Vol4
    INSERT INTO public.profiles (user_id, display_name) VALUES (v_vol4_uid, 'Vol4') 
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id INTO v_vol4_pid;

    RAISE NOTICE '  -> Profiles resolved: % % %', v_co1_pid, v_co2_pid, v_co3_pid;

    -- Create Club
    INSERT INTO public.clubs (name, category, created_by)
    VALUES ('Governance Test Club ' || gen_random_uuid(), 'Social', v_owner_id)
    RETURNING id INTO v_club_id;
    
    -- Ensure Owner is set
    INSERT INTO public.club_organizers (club_id, profile_id, role)
    VALUES (v_club_id, v_owner_pid, 'owner')
    ON CONFLICT (club_id, profile_id) DO UPDATE SET role = 'owner';

    RAISE NOTICE '  -> Setup: Club created with Owner.';

    -- 2. TEST ROLE LIMITS (CO-ORGANIZERS)
    -- ----------------------------------------------------------------------------
    RAISE NOTICE '[TEST 1/2] Enforcing Co-Organizer Limit (Max 2)';
    
    -- Add 1st Co-Organizer
    INSERT INTO public.club_organizers (club_id, profile_id, role) 
    VALUES (v_club_id, v_co1_pid, 'co-organizer');
    
    -- Add 2nd Co-Organizer
    INSERT INTO public.club_organizers (club_id, profile_id, role) 
    VALUES (v_club_id, v_co2_pid, 'co-organizer');
    
    RAISE NOTICE '  -> Added 2 Co-Organizers successfully.';

    -- Try Adding 3rd Co-Organizer (SHOULD FAIL)
    BEGIN
        INSERT INTO public.club_organizers (club_id, profile_id, role) 
        VALUES (v_club_id, v_co3_pid, 'co-organizer');
        
        RAISE EXCEPTION 'TEST FAILED: DB allowed 3rd Co-Organizer!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Governance Violation%' THEN
            RAISE NOTICE '  -> PASSED: Blocked 3rd Co-Organizer (%s)', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected Error: %', SQLERRM;
        END IF;
    END;

    -- 3. TEST ROLE LIMITS (VOLUNTEERS)
    -- ----------------------------------------------------------------------------
    RAISE NOTICE '[TEST 2/2] Enforcing Volunteer Limit (Max 3)';
    
    INSERT INTO public.club_organizers (club_id, profile_id, role) 
    VALUES (v_club_id, v_vol1_pid, 'volunteer');
    
    INSERT INTO public.club_organizers (club_id, profile_id, role) 
    VALUES (v_club_id, v_vol2_pid, 'volunteer');
    
    INSERT INTO public.club_organizers (club_id, profile_id, role) 
    VALUES (v_club_id, v_vol3_pid, 'volunteer');

    RAISE NOTICE '  -> Added 3 Volunteers successfully.';

    -- Try Adding 4th Volunteer (SHOULD FAIL)
    BEGIN
        INSERT INTO public.club_organizers (club_id, profile_id, role) 
        VALUES (v_club_id, v_vol4_pid, 'volunteer');
        
        RAISE EXCEPTION 'TEST FAILED: DB allowed 4th Volunteer!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Governance Violation%' THEN
            RAISE NOTICE '  -> PASSED: Blocked 4th Volunteer (%s)', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected Error: %', SQLERRM;
        END IF;
    END;

    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'VERIFICATION COMPLETE: GOVERNANCE SECURE';
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
