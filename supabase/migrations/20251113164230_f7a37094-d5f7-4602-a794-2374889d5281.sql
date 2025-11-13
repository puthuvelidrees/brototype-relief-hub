-- Enable realtime for activity_logs table
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;

-- Add activity_logs table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;