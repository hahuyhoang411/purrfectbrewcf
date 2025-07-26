-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  visits_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create loyalty transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired')),
  description TEXT NOT NULL,
  order_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on loyalty transactions
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create loyalty rewards table
CREATE TABLE public.loyalty_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on loyalty rewards (public read access)
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Create user rewards redemptions table
CREATE TABLE public.user_reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.loyalty_rewards(id),
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Enable RLS on user reward redemptions
ALTER TABLE public.user_reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for loyalty transactions
CREATE POLICY "Users can view their own transactions" 
ON public.loyalty_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.loyalty_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for loyalty rewards (public read)
CREATE POLICY "Anyone can view active rewards" 
ON public.loyalty_rewards 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user reward redemptions
CREATE POLICY "Users can view their own redemptions" 
ON public.user_reward_redemptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own redemptions" 
ON public.user_reward_redemptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update loyalty points
CREATE OR REPLACE FUNCTION public.add_loyalty_points(
  p_user_id UUID,
  p_points INTEGER,
  p_description TEXT,
  p_order_amount DECIMAL DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
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
END;
$$;

-- Create function to redeem loyalty points
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(
  p_user_id UUID,
  p_reward_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  required_points INTEGER;
  current_points INTEGER;
BEGIN
  -- Get reward points requirement
  SELECT points_required INTO required_points
  FROM public.loyalty_rewards 
  WHERE id = p_reward_id AND is_active = true;
  
  IF required_points IS NULL THEN
    RETURN FALSE; -- Reward not found or inactive
  END IF;
  
  -- Get user's current points
  SELECT loyalty_points INTO current_points
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  IF current_points < required_points THEN
    RETURN FALSE; -- Insufficient points
  END IF;
  
  -- Deduct points
  UPDATE public.profiles 
  SET loyalty_points = loyalty_points - required_points,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.loyalty_transactions (user_id, points_change, transaction_type, description)
  VALUES (p_user_id, -required_points, 'redeemed', 'Reward redemption');
  
  -- Record redemption
  INSERT INTO public.user_reward_redemptions (user_id, reward_id, points_spent)
  VALUES (p_user_id, p_reward_id, required_points);
  
  RETURN TRUE;
END;
$$;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample loyalty rewards
INSERT INTO public.loyalty_rewards (name, description, points_required) VALUES
('Free Coffee', 'Get a free regular coffee of your choice', 100),
('Free Pastry', 'Choose any pastry from our selection', 150),
('Cat Treat Bundle', 'A bundle of treats for our café cats', 200),
('Free Lunch Combo', 'Any sandwich + drink combo', 300),
('VIP Cat Experience', '30 minutes of exclusive time with our cats', 500);