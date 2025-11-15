-- Add escalation tracking columns to complaints
ALTER TABLE public.complaints
ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

-- Add senior admin flag to user_roles
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS is_senior BOOLEAN DEFAULT false;

-- Add escalation settings to admin_settings
ALTER TABLE public.admin_settings
ADD COLUMN IF NOT EXISTS escalation_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS escalation_sla_breach_auto BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS escalation_unresolved_hours INTEGER DEFAULT 48,
ADD COLUMN IF NOT EXISTS escalation_max_level INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS escalation_auto_priority BOOLEAN DEFAULT true;

-- Function to escalate complaint
CREATE OR REPLACE FUNCTION public.escalate_complaint(
  p_complaint_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
  v_complaint RECORD;
  v_settings RECORD;
  v_senior_admin_id UUID;
  v_new_priority TEXT;
  admin_id UUID;
BEGIN
  -- Get complaint details
  SELECT * INTO v_complaint FROM public.complaints WHERE id = p_complaint_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Complaint not found';
  END IF;
  
  -- Get escalation settings
  SELECT * INTO v_settings FROM public.admin_settings WHERE escalation_enabled = true LIMIT 1;
  
  IF NOT FOUND OR NOT v_settings.escalation_enabled THEN
    RETURN;
  END IF;
  
  -- Check if max escalation level reached
  IF v_complaint.escalation_level >= v_settings.escalation_max_level THEN
    RETURN;
  END IF;
  
  -- Increment escalation level
  UPDATE public.complaints
  SET 
    escalation_level = escalation_level + 1,
    escalated_at = NOW(),
    escalation_reason = p_reason
  WHERE id = p_complaint_id;
  
  -- Auto-increase priority if enabled
  IF v_settings.escalation_auto_priority THEN
    CASE v_complaint.priority
      WHEN 'low' THEN v_new_priority := 'medium';
      WHEN 'medium' THEN v_new_priority := 'high';
      WHEN 'high' THEN v_new_priority := 'critical';
      ELSE v_new_priority := v_complaint.priority;
    END CASE;
    
    IF v_new_priority != v_complaint.priority THEN
      UPDATE public.complaints
      SET priority = v_new_priority::complaint_priority
      WHERE id = p_complaint_id;
    END IF;
  END IF;
  
  -- Try to reassign to senior admin with least workload
  SELECT ur.user_id INTO v_senior_admin_id
  FROM public.user_roles ur
  LEFT JOIN public.admin_availability aa ON aa.user_id = ur.user_id
  LEFT JOIN (
    SELECT assigned_to, COUNT(*) as complaint_count
    FROM public.complaints
    WHERE status IN ('pending', 'in_progress')
    GROUP BY assigned_to
  ) c ON c.assigned_to = ur.user_id
  WHERE ur.role = 'admin' 
    AND ur.is_senior = true
    AND (aa.is_available IS NULL OR aa.is_available = true)
  ORDER BY COALESCE(c.complaint_count, 0) ASC
  LIMIT 1;
  
  IF v_senior_admin_id IS NOT NULL AND v_senior_admin_id != v_complaint.assigned_to THEN
    UPDATE public.complaints
    SET assigned_to = v_senior_admin_id
    WHERE id = p_complaint_id;
    
    -- Notify new assigned admin
    INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (
      v_senior_admin_id,
      'Escalated Complaint Assigned',
      'Critical escalated complaint ' || v_complaint.ticket_id || ' has been assigned to you. Level: ' || (v_complaint.escalation_level + 1),
      'alert',
      'complaint',
      p_complaint_id
    );
  END IF;
  
  -- Notify all senior admins about escalation
  FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' AND is_senior = true
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (
      admin_id,
      'Complaint Escalated',
      'Complaint ' || v_complaint.ticket_id || ' has been escalated. Reason: ' || p_reason || '. Escalation level: ' || (v_complaint.escalation_level + 1),
      'alert',
      'complaint',
      p_complaint_id
    );
  END LOOP;
  
  -- Log activity
  INSERT INTO public.activity_logs (
    user_id,
    action_type,
    action_description,
    entity_type,
    entity_id
  ) VALUES (
    COALESCE(v_complaint.assigned_to, (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)),
    'complaint_escalated',
    'Complaint escalated to level ' || (v_complaint.escalation_level + 1) || ': ' || p_reason,
    'complaint',
    p_complaint_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-escalate on SLA breach
CREATE OR REPLACE FUNCTION public.auto_escalate_on_sla_breach()
RETURNS TRIGGER AS $$
DECLARE
  v_settings RECORD;
BEGIN
  -- Get escalation settings
  SELECT * INTO v_settings 
  FROM public.admin_settings 
  WHERE escalation_enabled = true 
    AND escalation_sla_breach_auto = true 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Escalate if response SLA just breached
  IF NEW.sla_response_breached = true 
     AND (OLD.sla_response_breached IS NULL OR OLD.sla_response_breached = false)
     AND NEW.status = 'pending' THEN
    PERFORM public.escalate_complaint(NEW.id, 'Response SLA breached');
  END IF;
  
  -- Escalate if resolution SLA just breached
  IF NEW.sla_resolution_breached = true 
     AND (OLD.sla_resolution_breached IS NULL OR OLD.sla_resolution_breached = false)
     AND NEW.status != 'resolved' THEN
    PERFORM public.escalate_complaint(NEW.id, 'Resolution SLA breached');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-escalation
DROP TRIGGER IF EXISTS auto_escalate_trigger ON public.complaints;
CREATE TRIGGER auto_escalate_trigger
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_escalate_on_sla_breach();