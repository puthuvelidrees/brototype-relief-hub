-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (true);

-- Add category_id to complaints table
ALTER TABLE public.complaints
ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- Insert default categories
INSERT INTO public.categories (name, icon_name) VALUES
  ('Infrastructure', 'Building2'),
  ('Academics', 'GraduationCap'),
  ('Hostel', 'Home'),
  ('Transport', 'Bus'),
  ('Library', 'BookOpen'),
  ('Sports', 'Trophy'),
  ('Cafeteria', 'Utensils'),
  ('IT Services', 'Laptop'),
  ('Health', 'Heart'),
  ('Other', 'MoreHorizontal');