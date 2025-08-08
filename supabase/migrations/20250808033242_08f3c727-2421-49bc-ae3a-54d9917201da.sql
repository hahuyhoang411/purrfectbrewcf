-- Fix critical database relationship issues

-- 1. Add missing foreign key constraint for user_activity_limits
ALTER TABLE public.user_activity_limits 
ADD CONSTRAINT user_activity_limits_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add performance indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON public.loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON public.loyalty_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON public.loyalty_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_user_reward_redemptions_user_id ON public.user_reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_redemptions_reward_id ON public.user_reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_redemptions_redeemed_at ON public.user_reward_redemptions(redeemed_at);

CREATE INDEX IF NOT EXISTS idx_user_activity_limits_user_id ON public.user_activity_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_limits_window_start ON public.user_activity_limits(window_start);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 3. Add check constraints for data integrity
ALTER TABLE public.loyalty_transactions 
ADD CONSTRAINT loyalty_transactions_points_change_valid 
CHECK (points_change >= -100000 AND points_change <= 100000);

ALTER TABLE public.loyalty_rewards 
ADD CONSTRAINT loyalty_rewards_points_required_valid 
CHECK (points_required > 0 AND points_required <= 100000);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_loyalty_points_valid 
CHECK (loyalty_points >= 0);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_total_spent_valid 
CHECK (total_spent >= 0);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_visits_count_valid 
CHECK (visits_count >= 0);

-- 4. Add updated_at trigger to loyalty_transactions for audit trail
CREATE TRIGGER update_loyalty_transactions_updated_at
    BEFORE UPDATE ON public.loyalty_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Ensure data consistency - clean up any potential inconsistencies
UPDATE public.profiles 
SET loyalty_points = 0 
WHERE loyalty_points < 0;

UPDATE public.profiles 
SET total_spent = 0 
WHERE total_spent < 0;

UPDATE public.profiles 
SET visits_count = 0 
WHERE visits_count < 0;