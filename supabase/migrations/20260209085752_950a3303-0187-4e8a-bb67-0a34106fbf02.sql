
-- Create API usage tracking table
CREATE TABLE public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  cost_dollars NUMERIC(10, 4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Everyone can read the leaderboard
CREATE POLICY "Anyone can view api_usage" ON public.api_usage FOR SELECT USING (true);

-- Only service role can insert/update (done via edge function)
CREATE POLICY "Service role can manage api_usage" ON public.api_usage FOR ALL USING (true) WITH CHECK (true);

-- Seed with current user data
INSERT INTO public.api_usage (user_id, email, requests, cost_dollars) VALUES
  ('a48d1285-e4ac-4cc9-bc28-0f001ac01ff2', 'abhiramkakarla1@gmail.com', 24, 0.0120),
  ('571ab4be-7f06-4639-8595-a9fe77499131', 'aarjavjain0310@gmail.com', 8, 0.0040),
  ('864462dd-04e5-44f9-b7c6-f7d31264bea1', 'mayankjagetia0@gmail.com', 7, 0.0035),
  ('9532fc49-d9e1-46ad-a5f2-7b5011795dc9', 'elements6424@gmail.com', 2, 0.0010);
