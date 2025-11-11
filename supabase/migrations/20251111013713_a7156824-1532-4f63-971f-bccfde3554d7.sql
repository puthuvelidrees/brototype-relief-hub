-- Create enum for complaint status
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create locations table for dropdown
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default locations
INSERT INTO public.locations (name) VALUES 
  ('Kochi'),
  ('Trivandrum'),
  ('Kozhikode'),
  ('Thrissur'),
  ('Kannur');

-- Create user_roles table (SECURITY: separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  location_id UUID REFERENCES public.locations(id) NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  status complaint_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create function to check user role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to generate ticket ID
CREATE OR REPLACE FUNCTION public.generate_ticket_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_ticket_id TEXT;
BEGIN
  new_ticket_id := 'BTC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_ticket_id;
END;
$$;

-- Create trigger for ticket ID generation
CREATE OR REPLACE FUNCTION public.set_ticket_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_id IS NULL THEN
    NEW.ticket_id := public.generate_ticket_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_complaint_ticket_id
BEFORE INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.set_ticket_id();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'mobile'
  );
  
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations (public read)
CREATE POLICY "Locations are viewable by everyone"
ON public.locations FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for complaints
CREATE POLICY "Students can view their own complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Students can create complaints"
ON public.complaints FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints"
ON public.complaints FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all complaints"
ON public.complaints FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete complaints"
ON public.complaints FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for complaint files
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-files', 'complaint-files', true);

-- Storage policies for complaint files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-files');

CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'complaint-files');

CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'complaint-files' 
  AND public.has_role(auth.uid(), 'admin')
);