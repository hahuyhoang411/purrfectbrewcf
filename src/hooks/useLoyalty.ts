import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  loyalty_points: number;
  total_spent: number;
  visits_count: number;
  created_at: string;
  updated_at: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  is_active: boolean;
  created_at: string;
}

interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points_change: number;
  transaction_type: 'earned' | 'redeemed' | 'expired';
  description: string;
  order_amount: number | null;
  created_at: string;
}

export const useLoyalty = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch available rewards
  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error: any) {
      console.error('Error fetching rewards:', error);
    }
  };

  // Fetch user transactions
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions((data || []) as LoyaltyTransaction[]);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Add loyalty points (for testing or cafe staff)
  const addPoints = async (points: number, description: string, orderAmount?: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase.rpc('add_loyalty_points', {
        p_user_id: user.id,
        p_points: points,
        p_description: description,
        p_order_amount: orderAmount || null
      });

      if (error) throw error;

      // Refresh data
      await Promise.all([fetchProfile(), fetchTransactions()]);

      toast({
        title: "Points earned!",
        description: `You earned ${points} loyalty points: ${description}`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error earning points",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Redeem loyalty points
  const redeemReward = async (rewardId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase.rpc('redeem_loyalty_points', {
        p_user_id: user.id,
        p_reward_id: rewardId
      });

      if (error) throw error;

      if (data) {
        // Refresh data
        await Promise.all([fetchProfile(), fetchTransactions()]);

        const reward = rewards.find(r => r.id === rewardId);
        toast({
          title: "Reward redeemed!",
          description: `You successfully redeemed: ${reward?.name}`,
        });

        return { error: null, success: true };
      } else {
        toast({
          title: "Redemption failed",
          description: "Insufficient points or reward unavailable",
          variant: "destructive",
        });
        return { error: 'Redemption failed', success: false };
      }
    } catch (error: any) {
      toast({
        title: "Error redeeming reward",
        description: error.message,
        variant: "destructive",
      });
      return { error, success: false };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchRewards(),
        fetchTransactions()
      ]);
      setLoading(false);
    };

    if (user) {
      fetchData();
    } else {
      // Still fetch rewards for non-authenticated users
      fetchRewards();
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    rewards,
    transactions,
    loading,
    addPoints,
    redeemReward,
    refetch: () => Promise.all([fetchProfile(), fetchRewards(), fetchTransactions()])
  };
};