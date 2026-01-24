-- Fix event status constraint to allow 'live' status
-- This migration resolves the "events_status_check" constraint violation

-- 1. Drop the existing restrictive constraint
ALTER TABLE public.events 
DROP CONSTRAINT IF EXISTS events_status_check;

-- 2. Add new constraint that includes all valid statuses
ALTER TABLE public.events
ADD CONSTRAINT events_status_check 
CHECK (status IN ('draft', 'published', 'live', 'completed', 'cancelled'));

-- 3. Add live_started_at timestamp for tracking when event goes live
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS live_started_at TIMESTAMPTZ;

-- 4. Add trigger to automatically set live_started_at when status changes to 'live'
CREATE OR REPLACE FUNCTION set_live_started_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'live' AND (OLD.status IS NULL OR OLD.status != 'live') THEN
    NEW.live_started_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_set_live_started_at ON public.events;

CREATE TRIGGER events_set_live_started_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION set_live_started_at();

-- 5. Add comment explaining the lifecycle
COMMENT ON COLUMN public.events.status IS 'Event lifecycle: draft → published → live → completed (or cancelled at any stage)';
COMMENT ON COLUMN public.events.live_started_at IS 'Timestamp when event status changed to live';
