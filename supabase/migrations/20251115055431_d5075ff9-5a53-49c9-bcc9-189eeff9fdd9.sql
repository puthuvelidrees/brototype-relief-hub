-- Fix the notifications RLS policy to prevent spoofing
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Users can create their own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a SECURITY DEFINER function for system notifications that only admins can use
CREATE OR REPLACE FUNCTION public.insert_system_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  -- Only allow admins to create notifications for other users
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can create system notifications';
  END IF;

  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    entity_type,
    entity_id,
    is_read
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_entity_type,
    p_entity_id,
    false
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Add DELETE policy for notifications (users should be able to delete their own)
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);