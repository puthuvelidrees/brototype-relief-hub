-- Create table to track login attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for system to insert login attempts (will be done via edge function)
CREATE POLICY "System can insert login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (true);

-- Create policy for admins to view all login attempts
CREATE POLICY "Admins can view all login attempts"
ON public.login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index on email and attempt_time for faster queries
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempt_time DESC);

-- Create function to clean up old login attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempt_time < NOW() - INTERVAL '24 hours';
END;
$$;