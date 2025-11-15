-- Add assignment tracking column to complaints
ALTER TABLE public.complaints 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX idx_complaints_assigned_to ON public.complaints(assigned_to);

-- Add assignment method to admin_settings
ALTER TABLE public.admin_settings 
ADD COLUMN assignment_method TEXT DEFAULT 'workload' CHECK (assignment_method IN ('workload', 'round_robin', 'manual'));

-- Create admin availability table
CREATE TABLE public.admin_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_available BOOLEAN DEFAULT true NOT NULL,
  last_assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.admin_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_availability
CREATE POLICY "Admins can view all availability"
ON public.admin_availability
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update their own availability"
ON public.admin_availability
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to auto-assign complaints
CREATE OR REPLACE FUNCTION public.auto_assign_complaint(complaint_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_admin_id UUID;
  assignment_method TEXT;
  auto_assign_enabled BOOLEAN;
BEGIN
  -- Get admin settings
  SELECT auto_assign_complaints, assignment_method
  INTO auto_assign_enabled, assignment_method
  FROM public.admin_settings
  LIMIT 1;

  -- Exit if auto-assignment is disabled
  IF NOT auto_assign_enabled THEN
    RETURN NULL;
  END IF;

  -- Workload-based assignment (default)
  IF assignment_method = 'workload' THEN
    SELECT ur.user_id INTO assigned_admin_id
    FROM public.user_roles ur
    LEFT JOIN public.admin_availability aa ON aa.user_id = ur.user_id
    LEFT JOIN (
      SELECT assigned_to, COUNT(*) as complaint_count
      FROM public.complaints
      WHERE status IN ('pending', 'in_progress')
      GROUP BY assigned_to
    ) c ON c.assigned_to = ur.user_id
    WHERE ur.role = 'admin'
      AND (aa.is_available IS NULL OR aa.is_available = true)
    ORDER BY COALESCE(c.complaint_count, 0) ASC
    LIMIT 1;

  -- Round-robin assignment
  ELSIF assignment_method = 'round_robin' THEN
    SELECT ur.user_id INTO assigned_admin_id
    FROM public.user_roles ur
    LEFT JOIN public.admin_availability aa ON aa.user_id = ur.user_id
    WHERE ur.role = 'admin'
      AND (aa.is_available IS NULL OR aa.is_available = true)
    ORDER BY COALESCE(aa.last_assigned_at, '1970-01-01'::timestamp) ASC
    LIMIT 1;
  END IF;

  -- Update complaint with assigned admin
  IF assigned_admin_id IS NOT NULL THEN
    UPDATE public.complaints
    SET assigned_to = assigned_admin_id
    WHERE id = complaint_id;

    -- Update last assigned timestamp
    INSERT INTO public.admin_availability (user_id, last_assigned_at)
    VALUES (assigned_admin_id, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET last_assigned_at = NOW();
  END IF;

  RETURN assigned_admin_id;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_admin_availability_updated_at
BEFORE UPDATE ON public.admin_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Update RLS policies for complaints to include assigned_to
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
CREATE POLICY "Admins can view all complaints"
ON public.complaints
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  assigned_to = auth.uid()
);