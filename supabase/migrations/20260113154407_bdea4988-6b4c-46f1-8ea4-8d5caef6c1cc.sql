-- =====================================================
-- SNOVAA SCHEMA PART 3: RLS Policies and Functions
-- =====================================================

-- Clubs policies
CREATE POLICY "Anyone can view active clubs"
ON public.clubs FOR SELECT
USING (status = 'active');

CREATE POLICY "Organizers can create clubs"
ON public.clubs FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'organizer')
);

CREATE POLICY "Club owners can update their clubs"
ON public.clubs FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM club_organizers co
        JOIN profiles p ON co.profile_id = p.id
        WHERE co.club_id = clubs.id 
        AND p.user_id = auth.uid()
        AND co.role = 'owner'
    )
);

-- Club organizers policies
CREATE POLICY "Anyone can view club organizers"
ON public.club_organizers FOR SELECT
USING (true);

CREATE POLICY "Club owners can manage organizers"
ON public.club_organizers FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM club_organizers co
        JOIN profiles p ON co.profile_id = p.id
        WHERE co.club_id = club_organizers.club_id 
        AND p.user_id = auth.uid()
        AND co.role = 'owner'
    )
    OR
    -- Allow self-insert when creating new club
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Club members policies
CREATE POLICY "View own membership or club organizers can view"
ON public.club_members FOR SELECT
USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM club_organizers co
        JOIN profiles p ON co.profile_id = p.id
        WHERE co.club_id = club_members.club_id 
        AND p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can join clubs"
ON public.club_members FOR INSERT
WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Event lifecycle log policies
CREATE POLICY "Organizers can view lifecycle for their events"
ON public.event_lifecycle_log FOR SELECT
USING (
    event_id IN (
        SELECT e.id FROM events e
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Organizers can insert lifecycle records"
ON public.event_lifecycle_log FOR INSERT
WITH CHECK (
    event_id IN (
        SELECT e.id FROM events e
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- Event blueprints policies
CREATE POLICY "Anyone can view blueprints"
ON public.event_blueprints FOR SELECT
USING (true);

-- Event checkpoints policies
CREATE POLICY "View checkpoints for published events or own events"
ON public.event_checkpoints FOR SELECT
USING (
    event_id IN (SELECT id FROM events WHERE status IN ('published', 'completed', 'live'))
    OR
    event_id IN (
        SELECT e.id FROM events e
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Organizers can insert checkpoints"
ON public.event_checkpoints FOR INSERT
WITH CHECK (
    event_id IN (
        SELECT e.id FROM events e
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Organizers can update checkpoints"
ON public.event_checkpoints FOR UPDATE
USING (
    event_id IN (
        SELECT e.id FROM events e
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Organizers can delete checkpoints"
ON public.event_checkpoints FOR DELETE
USING (
    event_id IN (
        SELECT e.id FROM events e
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- Checkpoint records policies (append-only)
CREATE POLICY "View checkpoint records for own events or participation"
ON public.checkpoint_records FOR SELECT
USING (
    checkpoint_id IN (
        SELECT ec.id FROM event_checkpoints ec
        JOIN events e ON ec.event_id = e.id
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    OR
    participant_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Organizers can record checkpoint passes"
ON public.checkpoint_records FOR INSERT
WITH CHECK (
    checkpoint_id IN (
        SELECT ec.id FROM event_checkpoints ec
        JOIN events e ON ec.event_id = e.id
        WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- Function to transition event lifecycle
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

-- Function to get user participation stats
CREATE OR REPLACE FUNCTION public.get_user_participation_stats(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    total_registered bigint,
    total_attended bigint,
    unique_clubs bigint,
    unique_cities bigint,
    attendance_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id uuid;
BEGIN
    IF p_user_id IS NULL THEN
        SELECT id INTO v_profile_id FROM profiles WHERE user_id = auth.uid();
    ELSE
        SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id;
    END IF;
    
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT pl.event_id) FILTER (WHERE pl.action = 'registered') as registered,
            COUNT(DISTINCT pl.event_id) FILTER (WHERE pl.action = 'attended') as attended,
            COUNT(DISTINCT e.club_id) as clubs,
            COUNT(DISTINCT e.city_id) as cities
        FROM participation_ledger pl
        JOIN events e ON pl.event_id = e.id
        WHERE pl.participant_id = v_profile_id
    )
    SELECT 
        stats.registered,
        stats.attended,
        stats.clubs,
        stats.cities,
        CASE WHEN stats.registered > 0 THEN 
            ROUND((stats.attended::numeric / stats.registered) * 100, 2)
        ELSE 0 END
    FROM stats;
END;
$$;

-- Insert default event blueprints
INSERT INTO public.event_blueprints (name, description, category, default_modules, default_config) VALUES
('Running Event', 'Standard running event with distance tracking', 'run', 
 '["registration", "attendance", "media"]'::jsonb, 
 '{"allow_checkpoints": true, "require_qr": true}'::jsonb),
('Tournament', 'Competitive tournament with brackets', 'tournament', 
 '["registration", "attendance"]'::jsonb, 
 '{"max_participants": 32, "bracket_type": "single_elimination"}'::jsonb),
('Workshop', 'Educational or skill-building workshop', 'workshop', 
 '["registration", "attendance", "media"]'::jsonb, 
 '{"require_materials": false}'::jsonb),
('Meetup', 'Casual community meetup', 'meetup', 
 '["registration", "attendance", "media"]'::jsonb, 
 '{"informal": true}'::jsonb),
('Fitness Class', 'Group fitness or training session', 'fitness', 
 '["registration", "attendance"]'::jsonb, 
 '{"recurring": false, "intensity_level": "moderate"}'::jsonb)
ON CONFLICT DO NOTHING;