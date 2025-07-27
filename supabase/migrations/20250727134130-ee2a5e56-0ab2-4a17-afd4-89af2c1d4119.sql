-- Phase 1: Critical Security Fixes

-- 1. Update RLS policies to restrict anonymous access to sensitive operations

-- Drop existing permissive policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create stricter policies that require authentication
CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update loyalty transactions policies to require authentication
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.loyalty_transactions;

CREATE POLICY "Authenticated users can view their own transactions" 
ON public.loyalty_transactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own transactions" 
ON public.loyalty_transactions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update user reward redemptions policies
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.user_reward_redemptions;
DROP POLICY IF EXISTS "Users can insert their own redemptions" ON public.user_reward_redemptions;

CREATE POLICY "Authenticated users can view their own redemptions" 
ON public.user_reward_redemptions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own redemptions" 
ON public.user_reward_redemptions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 2. Enhance database functions with validation and security

-- Create rate limiting table for reward redemptions
CREATE TABLE IF NOT EXISTS public.user_activity_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_type, window_start)
);

-- Enable RLS on rate limiting table
ALTER TABLE public.user_activity_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limiting table
CREATE POLICY "Users can manage their own activity limits" 
ON public.user_activity_limits 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Enhanced add_loyalty_points function with validation
CREATE OR REPLACE FUNCTION public.add_loyalty_points(
  p_user_id uuid, 
  p_points integer, 
  p_description text, 
  p_order_amount numeric DEFAULT NULL::numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Validate user can only add points for themselves
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot add points for other users';
  END IF;
  
  -- Input validation
  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be a positive integer';
  END IF;
  
  IF p_points > 10000 THEN
    RAISE EXCEPTION 'Points amount too large (max 10000 per transaction)';
  END IF;
  
  IF p_description IS NULL OR length(trim(p_description)) = 0 THEN
    RAISE EXCEPTION 'Description is required';
  END IF;
  
  IF length(p_description) > 500 THEN
    RAISE EXCEPTION 'Description too long (max 500 characters)';
  END IF;
  
  IF p_order_amount IS NOT NULL AND p_order_amount < 0 THEN
    RAISE EXCEPTION 'Order amount cannot be negative';
  END IF;
  
  IF p_order_amount IS NOT NULL AND p_order_amount > 100000 THEN
    RAISE EXCEPTION 'Order amount too large (max 100000)';
  END IF;
  
  -- Insert transaction record
  INSERT INTO public.loyalty_transactions (user_id, points_change, transaction_type, description, order_amount)
  VALUES (p_user_id, p_points, 'earned', p_description, p_order_amount);
  
  -- Update user's total points
  UPDATE public.profiles 
  SET loyalty_points = loyalty_points + p_points,
      visits_count = visits_count + 1,
      total_spent = COALESCE(total_spent, 0) + COALESCE(p_order_amount, 0),
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log successful operation
  INSERT INTO public.loyalty_transactions (user_id, points_change, transaction_type, description)
  VALUES (p_user_id, 0, 'audit', 'Points added successfully: ' || p_points::text);
END;
$function$;

-- Enhanced redeem_loyalty_points function with rate limiting and validation
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(p_user_id uuid, p_reward_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  required_points INTEGER;
  current_points INTEGER;
  redemption_count INTEGER;
  current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Validate user can only redeem for themselves
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot redeem rewards for other users';
  END IF;
  
  -- Input validation
  IF p_reward_id IS NULL THEN
    RAISE EXCEPTION 'Reward ID is required';
  END IF;
  
  -- Rate limiting: max 5 redemptions per hour
  current_hour := date_trunc('hour', now());
  
  SELECT COUNT(*) INTO redemption_count
  FROM public.user_reward_redemptions
  WHERE user_id = p_user_id 
    AND redeemed_at >= current_hour
    AND redeemed_at < current_hour + interval '1 hour';
  
  IF redemption_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 5 redemptions per hour';
  END IF;
  
  -- Get reward points requirement
  SELECT points_required INTO required_points
  FROM public.loyalty_rewards 
  WHERE id = p_reward_id AND is_active = true;
  
  IF required_points IS NULL THEN
    RETURN FALSE; -- Reward not found or inactive
  END IF;
  
  -- Additional validation for reward points
  IF required_points <= 0 THEN
    RAISE EXCEPTION 'Invalid reward configuration';
  END IF;
  
  -- Get user's current points
  SELECT loyalty_points INTO current_points
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  IF current_points IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  IF current_points < required_points THEN
    RETURN FALSE; -- Insufficient points
  END IF;
  
  -- Deduct points
  UPDATE public.profiles 
  SET loyalty_points = loyalty_points - required_points,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction with audit trail
  INSERT INTO public.loyalty_transactions (user_id, points_change, transaction_type, description)
  VALUES (p_user_id, -required_points, 'redeemed', 'Reward redemption: ' || p_reward_id::text);
  
  -- Record redemption
  INSERT INTO public.user_reward_redemptions (user_id, reward_id, points_spent)
  VALUES (p_user_id, p_reward_id, required_points);
  
  -- Update rate limiting tracker
  INSERT INTO public.user_activity_limits (user_id, activity_type, activity_count, window_start)
  VALUES (p_user_id, 'reward_redemption', 1, current_hour)
  ON CONFLICT (user_id, activity_type, window_start)
  DO UPDATE SET activity_count = user_activity_limits.activity_count + 1;
  
  RETURN TRUE;
END;
$function$;

-- Create audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.loyalty_transactions (user_id, points_change, transaction_type, description)
    VALUES (OLD.user_id, 0, 'audit', 'Record deleted from ' || TG_TABLE_NAME);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.loyalty_transactions (user_id, points_change, transaction_type, description)
    VALUES (NEW.user_id, 0, 'audit', 'Record updated in ' || TG_TABLE_NAME);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_profiles_changes
  AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

CREATE TRIGGER audit_redemptions_changes
  AFTER UPDATE OR DELETE ON public.user_reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();