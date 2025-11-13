-- Create admin_settings table to store admin preferences
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_assign_complaints BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT false,
  max_complaints_per_day INTEGER DEFAULT 10,
  default_complaint_status TEXT DEFAULT 'pending',
  email_notifications BOOLEAN DEFAULT true,
  new_complaint_notification BOOLEAN DEFAULT true,
  status_change_notification BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  notification_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view their own settings
CREATE POLICY "Admins can view their own settings"
ON public.admin_settings
FOR SELECT
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Admins can insert their own settings
CREATE POLICY "Admins can insert their own settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Admins can update their own settings
CREATE POLICY "Admins can update their own settings"
ON public.admin_settings
FOR UPDATE
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();