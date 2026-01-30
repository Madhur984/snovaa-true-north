-- ============================================================================
-- COMPLETE DATABASE SETUP FOR SNOVAA (TRULY COMPLETE)
-- Run this ENTIRE file in Supabase SQL Editor to reset and setup everything.
-- ============================================================================

-- RESET: Drop existing objects to prevent "already exists" errors
-- WARNING: This deletes existing data in these tables.
DROP TABLE IF EXISTS public.checkpoint_records CASCADE;
DROP TABLE IF EXISTS public.event_checkpoints CASCADE;
DROP TABLE IF EXISTS public.sponsor_access CASCADE;
DROP TABLE IF EXISTS public.ai_suggestions CASCADE;
DROP TABLE IF EXISTS public.event_modules CASCADE;
DROP TABLE IF EXISTS public.event_media CASCADE;
DROP TABLE IF EXISTS public.event_lifecycle_log CASCADE;
DROP TABLE IF EXISTS public.event_blueprints CASCADE;
DROP TABLE IF EXISTS public.participation_ledger CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.club_members CASCADE;
DROP TABLE IF EXISTS public.club_organizers CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;
DROP TABLE IF EXISTS public.cities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- PHASE 0: Foundation - Core domain models and invariants

-- User roles enum
CREATE TYPE public.app_role AS ENUM ('participant', 'organizer', 'sponsor');

-- User profiles (identity foundation)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT,
  role app_role NOT NULL DEFAULT 'participant',
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cities for participation density mapping
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, country)
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Clubs System
CREATE TABLE public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    city_id UUID REFERENCES public.cities(id),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    verified_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived'))
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.club_organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('owner', 'organizer', 'moderator')),
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (club_id, profile_id)
);
ALTER TABLE public.club_organizers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    UNIQUE (club_id, profile_id)
);
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- Event Blueprints
CREATE TABLE public.event_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    default_modules JSONB NOT NULL DEFAULT '[]',
    default_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.event_blueprints ENABLE ROW LEVEL SECURITY;

-- Events - core truth record
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  city_id UUID REFERENCES public.cities(id),
  club_id UUID REFERENCES public.clubs(id),
  blueprint_id UUID REFERENCES public.event_blueprints(id),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'live', 'completed', 'cancelled')),
  live_started_at TIMESTAMPTZ,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Event Lifecycle Log
CREATE TABLE public.event_lifecycle_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reason TEXT
);
ALTER TABLE public.event_lifecycle_log ENABLE ROW LEVEL SECURITY;

-- IMMUTABLE Participation Ledger - APPEND ONLY
CREATE TABLE public.participation_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT NOT NULL,
  participant_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('registered', 'confirmed', 'attended', 'cancelled')),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recorded_by UUID REFERENCES public.profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.participation_ledger ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_participation_event ON public.participation_ledger(event_id);
CREATE INDEX idx_participation_participant ON public.participation_ledger(participant_id);
CREATE INDEX idx_participation_action ON public.participation_ledger(action);

-- Event Media
CREATE TABLE public.event_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;

-- Event Modules
CREATE TABLE public.event_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('agenda', 'speakers', 'resources', 'qna', 'networking')),
  config JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.event_modules ENABLE ROW LEVEL SECURITY;

-- AI Suggestions
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('schedule', 'description', 'modules', 'venue')),
  suggestion_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Sponsor Access
CREATE TABLE public.sponsor_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  sponsor_name TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  permissions JSONB DEFAULT '{"view_attendance": true, "view_demographics": false}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsor_access ENABLE ROW LEVEL SECURITY;

-- Event Checkpoints
CREATE TABLE public.event_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.event_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.checkpoint_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id UUID REFERENCES public.event_checkpoints(id) ON DELETE CASCADE NOT NULL,
    participant_id UUID REFERENCES public.profiles(id) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    recorded_by UUID REFERENCES public.profiles(id)
);
ALTER TABLE public.checkpoint_records ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Handle New User (Auto Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Transition Event Status
CREATE OR REPLACE FUNCTION public.transition_event_status(
    p_event_id UUID,
    p_new_status TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_status TEXT;
    v_profile_id UUID;
    v_is_organizer BOOLEAN;
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
    
    INSERT INTO event_lifecycle_log (event_id, previous_status, new_status, changed_by, reason)
    VALUES (p_event_id, v_current_status, p_new_status, v_profile_id, p_reason);
    
    UPDATE events SET 
        status = p_new_status,
        published_at = CASE WHEN p_new_status = 'published' THEN now() ELSE published_at END
    WHERE id = p_event_id;
    
    RETURN TRUE;
END;
$$;

-- Get Participation Status
CREATE OR REPLACE FUNCTION public.get_participation_status(p_event_id UUID, p_participant_id UUID)
RETURNS TEXT AS $$
DECLARE
  latest_action TEXT;
BEGIN
  SELECT action INTO latest_action
  FROM public.participation_ledger
  WHERE event_id = p_event_id AND participant_id = p_participant_id
  ORDER BY recorded_at DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_action, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Get Event Participation Count
CREATE OR REPLACE FUNCTION public.get_event_participation_count(p_event_id UUID)
RETURNS TABLE(registered BIGINT, confirmed BIGINT, attended BIGINT, cancelled BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH latest_status AS (
    SELECT DISTINCT ON (participant_id) participant_id, action
    FROM public.participation_ledger
    WHERE event_id = p_event_id
    ORDER BY participant_id, recorded_at DESC
  )
  SELECT 
    COUNT(*) FILTER (WHERE action = 'registered'),
    COUNT(*) FILTER (WHERE action = 'confirmed'),
    COUNT(*) FILTER (WHERE action = 'attended'),
    COUNT(*) FILTER (WHERE action = 'cancelled')
  FROM latest_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- POLICIES (Consolidated)
-- ============================================================================

-- Profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cities
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Organizers can create cities" ON public.cities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'organizer')
);

-- Clubs
CREATE POLICY "Anyone can view active clubs" ON public.clubs FOR SELECT USING (status = 'active');
CREATE POLICY "Organizers can create clubs" ON public.clubs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Club owners can update their clubs" ON public.clubs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM club_organizers co JOIN profiles p ON co.profile_id = p.id WHERE co.club_id = clubs.id AND p.user_id = auth.uid() AND co.role = 'owner')
);

-- Club Organizers
CREATE POLICY "Anyone can view club organizers" ON public.club_organizers FOR SELECT USING (true);
CREATE POLICY "Club owners can manage organizers" ON public.club_organizers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM club_organizers co JOIN profiles p ON co.profile_id = p.id WHERE co.club_id = club_organizers.club_id AND p.user_id = auth.uid() AND co.role = 'owner')
    OR profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Club Members
CREATE POLICY "View own membership or club organizers can view" ON public.club_members FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM club_organizers co JOIN profiles p ON co.profile_id = p.id WHERE co.club_id = club_members.club_id AND p.user_id = auth.uid())
);
CREATE POLICY "Users can join clubs" ON public.club_members FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Events
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published' OR status = 'completed' OR organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (
  organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (
  organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Lifecycle Logs
CREATE POLICY "Organizers can view lifecycle for their events" ON public.event_lifecycle_log FOR SELECT USING (
    event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Organizers can insert lifecycle records" ON public.event_lifecycle_log FOR INSERT WITH CHECK (
    event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Participation Ledger
CREATE POLICY "Users can view participation for events they organize or participate in" ON public.participation_ledger FOR SELECT USING (
  participant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can record their own participation" ON public.participation_ledger FOR INSERT WITH CHECK (
  participant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  recorded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Event Media
CREATE POLICY "Anyone can view approved media" ON public.event_media FOR SELECT USING (status = 'approved' OR uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Participants can upload media" ON public.event_media FOR INSERT WITH CHECK (
  uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Organizers can update media status" ON public.event_media FOR UPDATE USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Modules
CREATE POLICY "Anyone can view enabled modules" ON public.event_modules FOR SELECT USING (enabled = true);
CREATE POLICY "Organizers can manage modules" ON public.event_modules FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- AI Suggestions
CREATE POLICY "Organizers can view suggestions for their events" ON public.ai_suggestions FOR SELECT USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "System can create suggestions" ON public.ai_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Organizers can update suggestion status" ON public.ai_suggestions FOR UPDATE USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Sponsor Access
CREATE POLICY "Organizers can manage sponsor access" ON public.sponsor_access FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Event Blueprints
CREATE POLICY "Anyone can view blueprints" ON public.event_blueprints FOR SELECT USING (true);

-- Event Checkpoints
CREATE POLICY "View checkpoints for published events or own events" ON public.event_checkpoints FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE status IN ('published', 'completed', 'live'))
    OR event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Organizers can insert checkpoints" ON public.event_checkpoints FOR INSERT WITH CHECK (
    event_id IN (SELECT e.id FROM events e WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Checkpoint Records
CREATE POLICY "View checkpoint records for own events or participation" ON public.checkpoint_records FOR SELECT USING (
    checkpoint_id IN (SELECT ec.id FROM event_checkpoints ec JOIN events e ON ec.event_id = e.id WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR participant_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Organizers can record checkpoint passes" ON public.checkpoint_records FOR INSERT WITH CHECK (
    checkpoint_id IN (SELECT ec.id FROM event_checkpoints ec JOIN events e ON ec.event_id = e.id WHERE e.organizer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);


-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO public.cities (name, country, latitude, longitude) VALUES
  ('Bengaluru', 'India', 12.9716, 77.5946),
  ('Mumbai', 'India', 19.0760, 72.8777),
  ('New Delhi', 'India', 28.6139, 77.2090),
  ('Chennai', 'India', 13.0827, 80.2707),
  ('Hyderabad', 'India', 17.3850, 78.4867),
  ('Kolkata', 'India', 22.5726, 88.3639),
  ('Pune', 'India', 18.5204, 73.8567),
  ('Ahmedabad', 'India', 23.0225, 72.5714),
  ('Gurugram', 'India', 28.4595, 77.0266),
  ('Noida', 'India', 28.5355, 77.3910),
  ('New York', 'USA', 40.7128, -74.0060),
  ('London', 'UK', 51.5074, -0.1278),
  ('Singapore', 'Singapore', 1.3521, 103.8198),
  ('Tokyo', 'Japan', 35.6762, 139.6503)
ON CONFLICT (name, country) DO UPDATE SET 
  latitude = EXCLUDED.latitude, 
  longitude = EXCLUDED.longitude;

-- Insert default blueprints
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
