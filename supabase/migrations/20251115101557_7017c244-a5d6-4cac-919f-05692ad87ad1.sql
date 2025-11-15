-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create complaint_ratings table
CREATE TABLE IF NOT EXISTS public.complaint_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(complaint_id, user_id)
);

-- Enable RLS
ALTER TABLE public.complaint_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view ratings for their own complaints
CREATE POLICY "Users can view ratings for their complaints"
ON public.complaint_ratings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.complaints
    WHERE complaints.id = complaint_ratings.complaint_id
    AND complaints.user_id = auth.uid()
  )
);

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
ON public.complaint_ratings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can insert ratings for their resolved complaints
CREATE POLICY "Users can rate their resolved complaints"
ON public.complaint_ratings
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.complaints
    WHERE complaints.id = complaint_ratings.complaint_id
    AND complaints.user_id = auth.uid()
    AND complaints.status = 'resolved'
  )
);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
ON public.complaint_ratings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_complaint_ratings_updated_at
BEFORE UPDATE ON public.complaint_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_complaint_ratings_complaint_id ON public.complaint_ratings(complaint_id);
CREATE INDEX idx_complaint_ratings_user_id ON public.complaint_ratings(user_id);