-- Create table to track sent reminders (prevent duplicates)
CREATE TABLE public.reminder_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'event_reminder',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, participant_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.reminder_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (edge function)
CREATE POLICY "Service role can manage reminder_log"
ON public.reminder_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX idx_reminder_log_event_participant ON public.reminder_log(event_id, participant_id, reminder_type);

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create the cron job to run every hour
SELECT cron.schedule(
  'send-event-reminders',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT extensions.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-event-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);