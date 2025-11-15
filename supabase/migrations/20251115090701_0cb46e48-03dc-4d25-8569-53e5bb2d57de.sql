-- Add priority enum type
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Add priority column to complaints table
ALTER TABLE public.complaints 
ADD COLUMN priority public.complaint_priority NOT NULL DEFAULT 'medium';

-- Add index for better query performance
CREATE INDEX idx_complaints_priority ON public.complaints(priority);

-- Add index for combined status and priority queries
CREATE INDEX idx_complaints_status_priority ON public.complaints(status, priority);