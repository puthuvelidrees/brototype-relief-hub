-- Add real-time notification preferences to admin_settings
ALTER TABLE public.admin_settings
ADD COLUMN realtime_notifications BOOLEAN DEFAULT true,
ADD COLUMN realtime_new_complaint BOOLEAN DEFAULT true,
ADD COLUMN realtime_status_change BOOLEAN DEFAULT true,
ADD COLUMN notification_sound BOOLEAN DEFAULT true;