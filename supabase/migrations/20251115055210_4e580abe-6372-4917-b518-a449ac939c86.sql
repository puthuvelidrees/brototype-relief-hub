-- Fix 1: Make complaint-files storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'complaint-files';

-- Add RLS policies for private complaint files access
CREATE POLICY "Users can view their own complaint files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'complaint-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own complaint files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all complaint files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'complaint-files' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Tighten activity logs RLS policy to prevent spoofing
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.activity_logs;

CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a SECURITY DEFINER function for system-generated logs
CREATE OR REPLACE FUNCTION public.insert_system_activity_log(
  p_user_id uuid,
  p_action_type text,
  p_action_description text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Only allow admins to insert logs for other users
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can create system activity logs';
  END IF;

  INSERT INTO public.activity_logs (
    user_id,
    action_type,
    action_description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_user_id,
    p_action_type,
    p_action_description,
    p_entity_type,
    p_entity_id,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;