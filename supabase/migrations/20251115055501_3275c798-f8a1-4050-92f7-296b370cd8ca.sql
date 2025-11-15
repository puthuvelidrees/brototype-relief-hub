-- Fix search_path for all functions without it set

-- Fix generate_ticket_id function
CREATE OR REPLACE FUNCTION public.generate_ticket_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  new_ticket_id TEXT;
BEGIN
  new_ticket_id := 'BTC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_ticket_id;
END;
$function$;

-- Fix set_ticket_id trigger function
CREATE OR REPLACE FUNCTION public.set_ticket_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.ticket_id IS NULL THEN
    NEW.ticket_id := public.generate_ticket_id();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;