-- Create complaint_history table to track all changes
CREATE TABLE IF NOT EXISTS public.complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'status_change', 'priority_change', 'assignment', 'escalation', 'comment', 'created'
  old_value TEXT,
  new_value TEXT,
  changed_by UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view history of their complaints"
ON public.complaint_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.complaints
    WHERE complaints.id = complaint_history.complaint_id
    AND complaints.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all history"
ON public.complaint_history FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert history"
ON public.complaint_history FOR INSERT
WITH CHECK (true);

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION public.log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.complaint_history (
      complaint_id, event_type, old_value, new_value, changed_by, metadata
    ) VALUES (
      NEW.id,
      'status_change',
      OLD.status,
      NEW.status,
      auth.uid(),
      jsonb_build_object('ticket_id', NEW.ticket_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS log_status_change_trigger ON public.complaints;
CREATE TRIGGER log_status_change_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.log_complaint_status_change();

-- Trigger to log priority changes
CREATE OR REPLACE FUNCTION public.log_complaint_priority_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.complaint_history (
      complaint_id, event_type, old_value, new_value, changed_by, metadata
    ) VALUES (
      NEW.id,
      'priority_change',
      OLD.priority,
      NEW.priority,
      auth.uid(),
      jsonb_build_object('ticket_id', NEW.ticket_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS log_priority_change_trigger ON public.complaints;
CREATE TRIGGER log_priority_change_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.log_complaint_priority_change();

-- Trigger to log assignments
CREATE OR REPLACE FUNCTION public.log_complaint_assignment()
RETURNS TRIGGER AS $$
DECLARE
  old_admin_name TEXT;
  new_admin_name TEXT;
BEGIN
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    -- Get admin names
    IF OLD.assigned_to IS NOT NULL THEN
      SELECT full_name INTO old_admin_name FROM public.profiles WHERE id = OLD.assigned_to;
    END IF;
    
    IF NEW.assigned_to IS NOT NULL THEN
      SELECT full_name INTO new_admin_name FROM public.profiles WHERE id = NEW.assigned_to;
    END IF;
    
    INSERT INTO public.complaint_history (
      complaint_id, event_type, old_value, new_value, changed_by, metadata
    ) VALUES (
      NEW.id,
      'assignment',
      old_admin_name,
      new_admin_name,
      auth.uid(),
      jsonb_build_object(
        'ticket_id', NEW.ticket_id,
        'old_admin_id', OLD.assigned_to,
        'new_admin_id', NEW.assigned_to
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS log_assignment_trigger ON public.complaints;
CREATE TRIGGER log_assignment_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.log_complaint_assignment();

-- Trigger to log escalations
CREATE OR REPLACE FUNCTION public.log_complaint_escalation_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.escalation_level IS DISTINCT FROM NEW.escalation_level AND NEW.escalation_level > OLD.escalation_level THEN
    INSERT INTO public.complaint_history (
      complaint_id, event_type, old_value, new_value, changed_by, metadata
    ) VALUES (
      NEW.id,
      'escalation',
      OLD.escalation_level::TEXT,
      NEW.escalation_level::TEXT,
      auth.uid(),
      jsonb_build_object(
        'ticket_id', NEW.ticket_id,
        'reason', NEW.escalation_reason,
        'level', NEW.escalation_level
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS log_escalation_history_trigger ON public.complaints;
CREATE TRIGGER log_escalation_history_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.log_complaint_escalation_history();

-- Trigger to log complaint creation
CREATE OR REPLACE FUNCTION public.log_complaint_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.complaint_history (
    complaint_id, event_type, old_value, new_value, changed_by, metadata
  ) VALUES (
    NEW.id,
    'created',
    NULL,
    'Complaint submitted',
    NEW.user_id,
    jsonb_build_object(
      'ticket_id', NEW.ticket_id,
      'priority', NEW.priority,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS log_creation_trigger ON public.complaints;
CREATE TRIGGER log_creation_trigger
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.log_complaint_creation();