-- Supabase Custom Claims hook for RBAC (Role-Based Access Control)
-- This hook runs before a token is issued and injects 'role' and 'barbershop_id' into the JWT.

-- 1. Create a function to handle the custom claims
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  DECLARE
    claims jsonb;
    user_role text;
    user_barbershop_id uuid;
  BEGIN
    -- Extract claims
    claims := event->'claims';

    -- Check if user is a barbershop owner
    SELECT id, 'admin' INTO user_barbershop_id, user_role
    FROM public.barbershops
    WHERE owner_id = (event->>'user_id')::uuid
    LIMIT 1;

    -- If not an admin, check if user is a barber
    IF user_role IS NULL THEN
      SELECT barbershop_id, 'barber' INTO user_barbershop_id, user_role
      FROM public.barbers
      WHERE user_id = (event->>'user_id')::uuid
      LIMIT 1;
    END IF;

    -- If still null, then it's a customer
    IF user_role IS NULL THEN
      user_role := 'customer';
    END IF;

    -- Inject claims
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
    
    IF user_barbershop_id IS NOT NULL THEN
      claims := jsonb_set(claims, '{barbershop_id}', to_jsonb(user_barbershop_id));
    END IF;

    -- Update event with new claims
    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
  END;
$$;

-- Grant permissions for Supabase auth schema to execute the hook
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Configure Supabase to use this hook
-- (In a real Supabase project, you would set this in the Auth Settings or via SQL)
-- For local development with Supabase CLI:
-- You need to add this to config.toml or run the equivalent API call.
