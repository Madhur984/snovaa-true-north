-- Fix the permissive RLS policy for ai_suggestions INSERT
-- Change from allowing anyone to insert to only allowing authenticated users
DROP POLICY IF EXISTS "System can create suggestions" ON public.ai_suggestions;

CREATE POLICY "Authenticated users can create suggestions" ON public.ai_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);