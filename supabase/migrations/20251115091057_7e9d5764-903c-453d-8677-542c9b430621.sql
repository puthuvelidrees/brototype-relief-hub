-- Create complaint_comments table
CREATE TABLE public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add index for better query performance
CREATE INDEX idx_complaint_comments_complaint_id ON public.complaint_comments(complaint_id);
CREATE INDEX idx_complaint_comments_created_at ON public.complaint_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for complaint_comments
-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
ON public.complaint_comments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Students can view comments on their own complaints
CREATE POLICY "Students can view comments on their complaints"
ON public.complaint_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.complaints
    WHERE complaints.id = complaint_comments.complaint_id
    AND complaints.user_id = auth.uid()
  )
);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
ON public.complaint_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.complaint_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.complaint_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_complaint_comments_updated_at
BEFORE UPDATE ON public.complaint_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();