-- Fix critical security warnings from linter

-- 1. Fix function search path issues by ensuring all functions have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 2. Fix anonymous access policies to be more restrictive where needed
-- Keep chat functionality working for anonymous users but tighten other policies

-- Update loyalty_transactions policy to be more specific about anonymous access
DROP POLICY IF EXISTS "Authenticated users can view their own transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Authenticated users can insert their own transactions" ON public.loyalty_transactions;

CREATE POLICY "Users can view their own transactions" 
ON public.loyalty_transactions 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to loyalty transactions
  END
);

CREATE POLICY "Users can insert their own transactions" 
ON public.loyalty_transactions 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to loyalty transactions
  END
);

-- Update profiles policies to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to profiles
  END
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to profiles
  END
);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to profiles
  END
);

-- Update user_reward_redemptions policies
DROP POLICY IF EXISTS "Authenticated users can view their own redemptions" ON public.user_reward_redemptions;
DROP POLICY IF EXISTS "Authenticated users can insert their own redemptions" ON public.user_reward_redemptions;

CREATE POLICY "Users can view their own redemptions" 
ON public.user_reward_redemptions 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to redemptions
  END
);

CREATE POLICY "Users can insert their own redemptions" 
ON public.user_reward_redemptions 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to redemptions
  END
);

-- Update user_activity_limits policies
DROP POLICY IF EXISTS "Users can manage their own activity limits" ON public.user_activity_limits;

CREATE POLICY "Users can manage their own activity limits" 
ON public.user_activity_limits 
FOR ALL 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to activity limits
  END
)
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE false  -- No anonymous access to activity limits
  END
);

-- 3. Add input sanitization function for chat messages
CREATE OR REPLACE FUNCTION public.sanitize_chat_input(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Basic sanitization: remove null bytes, excessive whitespace, and limit length
  IF input_text IS NULL THEN
    RETURN '';
  END IF;
  
  -- Remove null bytes and control characters except newlines and tabs
  input_text := regexp_replace(input_text, '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g');
  
  -- Trim and limit length to prevent abuse
  input_text := trim(input_text);
  
  IF length(input_text) > 10000 THEN
    input_text := left(input_text, 10000);
  END IF;
  
  RETURN input_text;
END;
$function$;