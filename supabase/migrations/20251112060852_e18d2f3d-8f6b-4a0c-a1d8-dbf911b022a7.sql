-- Create domains table
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view domains
CREATE POLICY "Domains are viewable by everyone"
ON public.domains
FOR SELECT
USING (true);

-- Insert Brototype domains
INSERT INTO public.domains (name) VALUES 
  ('Classroom'),
  ('Work Space'),
  ('Hall'),
  ('Cafeteria'),
  ('Meeting Room'),
  ('Common Area');

-- Add domain_id to complaints table
ALTER TABLE public.complaints
ADD COLUMN domain_id UUID REFERENCES public.domains(id);

-- Create index for better performance
CREATE INDEX idx_complaints_domain_id ON public.complaints(domain_id);