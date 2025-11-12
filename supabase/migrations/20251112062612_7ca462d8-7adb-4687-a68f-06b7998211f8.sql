-- Create a trigger function to auto-assign admin role to specific test account
CREATE OR REPLACE FUNCTION public.auto_assign_test_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin role to test admin account
  IF NEW.email = 'admin@test.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created_assign_test_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_test_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_test_admin();