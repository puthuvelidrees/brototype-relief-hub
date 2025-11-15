-- Add SLA settings columns to admin_settings
ALTER TABLE public.admin_settings
ADD COLUMN IF NOT EXISTS sla_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sla_response_time_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS sla_resolution_time_hours INTEGER DEFAULT 72,
ADD COLUMN IF NOT EXISTS sla_critical_response_hours INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS sla_critical_resolution_hours INTEGER DEFAULT 24;

-- Add SLA tracking columns to complaints
ALTER TABLE public.complaints
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_response_breached BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sla_resolution_breached BOOLEAN DEFAULT false;

-- Function to check and update SLA status
CREATE OR REPLACE FUNCTION public.check_sla_status()
RETURNS TRIGGER AS $$
DECLARE
  settings RECORD;
  response_deadline TIMESTAMP WITH TIME ZONE;
  resolution_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get SLA settings
  SELECT * INTO settings FROM public.admin_settings LIMIT 1;
  
  IF settings.sla_enabled THEN
    -- Calculate response deadline based on priority
    IF NEW.priority = 'critical' THEN
      response_deadline := NEW.created_at + (settings.sla_critical_response_hours || ' hours')::INTERVAL;
    ELSE
      response_deadline := NEW.created_at + (settings.sla_response_time_hours || ' hours')::INTERVAL;
    END IF;
    
    -- Check response SLA
    IF NEW.first_response_at IS NULL AND NOW() > response_deadline THEN
      NEW.sla_response_breached := true;
    ELSIF NEW.first_response_at IS NOT NULL AND NEW.first_response_at > response_deadline THEN
      NEW.sla_response_breached := true;
    ELSE
      NEW.sla_response_breached := false;
    END IF;
    
    -- Calculate resolution deadline based on priority
    IF NEW.priority = 'critical' THEN
      resolution_deadline := NEW.created_at + (settings.sla_critical_resolution_hours || ' hours')::INTERVAL;
    ELSE
      resolution_deadline := NEW.created_at + (settings.sla_resolution_time_hours || ' hours')::INTERVAL;
    END IF;
    
    -- Check resolution SLA
    IF NEW.status != 'resolved' AND NOW() > resolution_deadline THEN
      NEW.sla_resolution_breached := true;
    ELSIF NEW.resolved_at IS NOT NULL AND NEW.resolved_at > resolution_deadline THEN
      NEW.sla_resolution_breached := true;
    ELSE
      NEW.sla_resolution_breached := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check SLA on insert and update
DROP TRIGGER IF EXISTS check_complaint_sla ON public.complaints;
CREATE TRIGGER check_complaint_sla
  BEFORE INSERT OR UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.check_sla_status();

-- Function to automatically set first_response_at when status changes from pending
CREATE OR REPLACE FUNCTION public.set_first_response()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing from pending and first_response_at is not set
  IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.first_response_at IS NULL THEN
    NEW.first_response_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set first response time
DROP TRIGGER IF EXISTS set_first_response_trigger ON public.complaints;
CREATE TRIGGER set_first_response_trigger
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_first_response();

-- Create SLA breach notifications
CREATE OR REPLACE FUNCTION public.notify_sla_breach()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- If response SLA just breached
  IF NEW.sla_response_breached = true AND (OLD.sla_response_breached IS NULL OR OLD.sla_response_breached = false) THEN
    -- Notify assigned admin or all admins
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
      VALUES (
        NEW.assigned_to,
        'SLA Response Breach',
        'Complaint ' || NEW.ticket_id || ' has breached the response time SLA.',
        'alert',
        'complaint',
        NEW.id
      );
    ELSE
      -- Notify all admins
      FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
      LOOP
        INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
        VALUES (
          admin_id,
          'SLA Response Breach',
          'Complaint ' || NEW.ticket_id || ' has breached the response time SLA and needs attention.',
          'alert',
          'complaint',
          NEW.id
        );
      END LOOP;
    END IF;
  END IF;
  
  -- If resolution SLA just breached
  IF NEW.sla_resolution_breached = true AND (OLD.sla_resolution_breached IS NULL OR OLD.sla_resolution_breached = false) THEN
    -- Notify assigned admin or all admins
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
      VALUES (
        NEW.assigned_to,
        'SLA Resolution Breach',
        'Complaint ' || NEW.ticket_id || ' has breached the resolution time SLA.',
        'alert',
        'complaint',
        NEW.id
      );
    ELSE
      -- Notify all admins
      FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
      LOOP
        INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
        VALUES (
          admin_id,
          'SLA Resolution Breach',
          'Complaint ' || NEW.ticket_id || ' has breached the resolution time SLA and requires immediate action.',
          'alert',
          'complaint',
          NEW.id
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for SLA breach notifications
DROP TRIGGER IF EXISTS notify_sla_breach_trigger ON public.complaints;
CREATE TRIGGER notify_sla_breach_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sla_breach();