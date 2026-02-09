
-- Drop the overly permissive policy and replace with restrictive ones
DROP POLICY "Service role can manage api_usage" ON public.api_usage;

-- No insert/update/delete from client - only service role (edge functions) can modify
-- The SELECT policy "Anyone can view api_usage" remains for leaderboard reads
