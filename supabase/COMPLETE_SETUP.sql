-- ============================================================================
-- COMPLETE DATABASE SETUP FOR SNOVAA
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================================================

-- This combines all migrations into one file for easy setup
-- After running this, your database will be fully configured

-- PHASE 0: Foundation - Core domain models and invariants
-- PHASE 1: Immutable Core - User identity and append-only ledger

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

-- Cities for participation density mapping (Phase 8)
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, country)
);

-- Events - core truth record
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  city_id UUID REFERENCES public.cities(id),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- IMMUTABLE Participation Ledger - APPEND ONLY, never update or delete
-- This is the core truth record
CREATE TABLE public.participation_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT NOT NULL,
  participant_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('registered', 'confirmed', 'attended', 'cancelled')),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recorded_by UUID REFERENCES public.profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for efficient querying
CREATE INDEX idx_participation_event ON public.participation_ledger(event_id);
CREATE INDEX idx_participation_participant ON public.participation_ledger(participant_id);
CREATE INDEX idx_participation_action ON public.participation_ledger(action);

-- Phase 4: Event Memory - Media with approval workflow
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

-- Phase 5: Module System - Predefined modules attached to events
CREATE TABLE public.event_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('agenda', 'speakers', 'resources', 'qna', 'networking')),
  config JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 6: AI Blueprint suggestions (read-only, never writes to core)
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('schedule', 'description', 'modules', 'venue')),
  suggestion_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 7: Sponsor access tokens (read-only views)
CREATE TABLE public.sponsor_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  sponsor_name TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  permissions JSONB DEFAULT '{"view_attendance": true, "view_demographics": false}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participation_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_access ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cities policies (public read)
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Organizers can create cities" ON public.cities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'organizer')
);

-- Events policies
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published' OR status = 'completed' OR organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (
  organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (
  organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Participation ledger policies (APPEND ONLY - no update or delete policies)
CREATE POLICY "Users can view participation for events they organize or participate in" ON public.participation_ledger FOR SELECT USING (
  participant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can record their own participation" ON public.participation_ledger FOR INSERT WITH CHECK (
  participant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  recorded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Event media policies
CREATE POLICY "Anyone can view approved media" ON public.event_media FOR SELECT USING (status = 'approved' OR uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Participants can upload media" ON public.event_media FOR INSERT WITH CHECK (
  uploaded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Organizers can update media status" ON public.event_media FOR UPDATE USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Event modules policies
CREATE POLICY "Anyone can view enabled modules" ON public.event_modules FOR SELECT USING (enabled = true);
CREATE POLICY "Organizers can manage modules" ON public.event_modules FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- AI suggestions policies
CREATE POLICY "Organizers can view suggestions for their events" ON public.ai_suggestions FOR SELECT USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "System can create suggestions" ON public.ai_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Organizers can update suggestion status" ON public.ai_suggestions FOR UPDATE USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Sponsor access policies
CREATE POLICY "Organizers can manage sponsor access" ON public.sponsor_access FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get current participation status (reads from ledger)
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

-- Function to get participation count for an event
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

-- Insert some sample cities
INSERT INTO public.cities (name, country, latitude, longitude) VALUES
  ('San Francisco', 'USA', 37.7749, -122.4194),
  ('New York', 'USA', 40.7128, -74.0060),
  ('London', 'UK', 51.5074, -0.1278),
  ('Berlin', 'Germany', 52.5200, 13.4050),
  ('Tokyo', 'Japan', 35.6762, 139.6503),
  ('Singapore', 'Singapore', 1.3521, 103.8198),
  ('Sydney', 'Australia', -33.8688, 151.2093),
  ('Toronto', 'Canada', 43.6532, -79.3832),
  ('Bengaluru', 'India', 12.9716, 77.5946),
  ('Mumbai', 'India', 19.0760, 72.8777),
  ('New Delhi', 'India', 28.6139, 77.2090),
  ('Hyderabad', 'India', 17.3850, 78.4867),
  ('Chennai', 'India', 13.0827, 80.2707),
  ('Pune', 'India', 18.5204, 73.8567),
  ('Kolkata', 'India', 22.5726, 88.3639),
  ('Gurugram', 'India', 28.4595, 77.0266),
  ('Noida', 'India', 28.5355, 77.3910),
  ('Goa', 'India', 15.2993, 74.1240);


-- ============================================================================
-- FIX: Add 'live' status to events table
-- ============================================================================

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE public.events ADD CONSTRAINT events_status_check CHECK (status IN ('draft', 'published', 'live', 'completed', 'cancelled'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS live_started_at TIMESTAMPTZ;
