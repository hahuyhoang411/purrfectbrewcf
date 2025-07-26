import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Trophy, Coffee, Gift, History } from 'lucide-react';

const Loyalty = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, rewards, transactions, loading, redeemReward, addPoints } = useLoyalty();

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your loyalty data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const canRedeem = (pointsRequired: number) => {
    return profile && profile.loyalty_points >= pointsRequired;
  };

  const handleTestEarnPoints = () => {
    addPoints(50, 'Test visit to café', 15.99);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Loyalty Program</h1>
          <p className="text-muted-foreground">Earn points with every visit and redeem amazing rewards!</p>
        </div>

        {/* Profile Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{profile?.loyalty_points || 0}</div>
              <p className="text-xs text-muted-foreground">
                Available to redeem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.visits_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Times you've visited
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(profile?.total_spent || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime spending
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
            <TabsTrigger value="history">Points History</TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Redeem Your Points</h2>
              <Button onClick={handleTestEarnPoints} variant="outline" size="sm">
                <Gift className="h-4 w-4 mr-2" />
                Test Earn 50 Points
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className={canRedeem(reward.points_required) ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      <Badge variant={canRedeem(reward.points_required) ? 'default' : 'secondary'}>
                        {reward.points_required} pts
                      </Badge>
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      disabled={!canRedeem(reward.points_required)}
                      onClick={() => redeemReward(reward.id)}
                    >
                      {canRedeem(reward.points_required) ? 'Redeem Now' : 'Need More Points'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <History className="h-5 w-5 mr-2" />
              Points History
            </h2>

            <Card>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No transactions yet. Start earning points by visiting our café!
                  </div>
                ) : (
                  <div className="divide-y">
                    {transactions.map((transaction, index) => (
                      <div key={transaction.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                            {transaction.order_amount && (
                              <p className="text-sm text-muted-foreground">
                                Order total: ${transaction.order_amount.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.points_change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.points_change > 0 ? '+' : ''}{transaction.points_change} pts
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.transaction_type}
                            </Badge>
                          </div>
                        </div>
                        {index < transactions.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Loyalty;