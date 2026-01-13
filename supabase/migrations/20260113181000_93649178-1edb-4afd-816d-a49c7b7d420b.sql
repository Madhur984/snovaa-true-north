-- Fix RLS policy to be more restrictive (only service role via authenticated check)
DROP POLICY IF EXISTS "Service role can manage reminder_log" ON public.reminder_log;

-- No user-facing policies needed - only service role accesses this table
-- The table is only written to by edge functions using service_role key