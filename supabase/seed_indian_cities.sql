-- ============================================================================
-- SEED DATA: Major Indian Cities
-- Run this in Supabase SQL Editor to add these cities to your database
-- ============================================================================

INSERT INTO public.cities (name, country, latitude, longitude) VALUES
  ('Bengaluru', 'India', 12.9716, 77.5946),
  ('Mumbai', 'India', 19.0760, 72.8777),
  ('New Delhi', 'India', 28.6139, 77.2090),
  ('Hyderabad', 'India', 17.3850, 78.4867),
  ('Chennai', 'India', 13.0827, 80.2707),
  ('Pune', 'India', 18.5204, 73.8567),
  ('Kolkata', 'India', 22.5726, 88.3639),
  ('Gurugram', 'India', 28.4595, 77.0266),
  ('Noida', 'India', 28.5355, 77.3910),
  ('Goa', 'India', 15.2993, 74.1240)
ON CONFLICT (name, country) DO NOTHING;
