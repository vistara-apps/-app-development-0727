import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// User management
export async function createOrUpdateUser(walletAddress, userData = {}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        wallet_address: walletAddress,
        subscription_tier: userData.subscriptionTier || 'free',
        created_at: new Date().toISOString(),
        ...userData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
}

export async function getUserByWallet(walletAddress) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Trade history management
export async function saveTradeHistory(tradeData) {
  try {
    const { data, error } = await supabase
      .from('trade_history')
      .insert({
        user_id: tradeData.userId,
        token_in: tradeData.tokenIn,
        token_out: tradeData.tokenOut,
        amount_in: tradeData.amountIn,
        amount_out: tradeData.amountOut,
        estimated_slippage: tradeData.estimatedSlippage,
        actual_slippage: tradeData.actualSlippage,
        fees: tradeData.fees,
        routed_dexs: tradeData.routedDEXs,
        transaction_hash: tradeData.transactionHash,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving trade history:', error);
    return null;
  }
}

export async function getUserTradeHistory(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('trade_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return [];
  }
}

// Liquidity pool data caching
export async function cacheLiquidityData(poolData) {
  try {
    const { data, error } = await supabase
      .from('liquidity_pools')
      .upsert({
        pool_id: poolData.poolId,
        dex_name: poolData.dexName,
        token_a: poolData.tokenA,
        token_b: poolData.tokenB,
        reserve_a: poolData.reserveA,
        reserve_b: poolData.reserveB,
        liquidity: poolData.liquidity,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error caching liquidity data:', error);
    return null;
  }
}

export async function getCachedLiquidityData(tokenPair, maxAge = 300000) { // 5 minutes default
  try {
    const cutoffTime = new Date(Date.now() - maxAge).toISOString();
    
    const { data, error } = await supabase
      .from('liquidity_pools')
      .select('*')
      .or(`token_a.eq.${tokenPair.split('/')[0]},token_b.eq.${tokenPair.split('/')[0]}`)
      .or(`token_a.eq.${tokenPair.split('/')[1]},token_b.eq.${tokenPair.split('/')[1]}`)
      .gte('timestamp', cutoffTime)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cached liquidity data:', error);
    return [];
  }
}

// User preferences and settings
export async function updateUserPreferences(userId, preferences) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
}

// Analytics and insights
export async function getUserAnalytics(userId, days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('trade_history')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate);

    if (error) throw error;

    // Calculate analytics
    const trades = data || [];
    const totalTrades = trades.length;
    const totalVolume = trades.reduce((sum, trade) => sum + parseFloat(trade.amount_in || 0), 0);
    const avgSlippage = trades.length > 0 
      ? trades.reduce((sum, trade) => sum + parseFloat(trade.actual_slippage || 0), 0) / trades.length 
      : 0;
    const totalFees = trades.reduce((sum, trade) => sum + parseFloat(trade.fees || 0), 0);

    return {
      totalTrades,
      totalVolume,
      avgSlippage,
      totalFees,
      trades: trades.slice(0, 10) // Return last 10 trades
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return {
      totalTrades: 0,
      totalVolume: 0,
      avgSlippage: 0,
      totalFees: 0,
      trades: []
    };
  }
}

// Subscription management
export async function updateSubscriptionTier(userId, tier) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    return null;
  }
}

// Database schema creation (for reference)
export const createTables = async () => {
  // This would typically be run as SQL migrations
  const schemas = {
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        wallet_address TEXT UNIQUE NOT NULL,
        subscription_tier TEXT DEFAULT 'free',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    trade_history: `
      CREATE TABLE IF NOT EXISTS trade_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        token_in TEXT NOT NULL,
        token_out TEXT NOT NULL,
        amount_in DECIMAL NOT NULL,
        amount_out DECIMAL,
        estimated_slippage DECIMAL,
        actual_slippage DECIMAL,
        fees DECIMAL,
        routed_dexs TEXT[],
        transaction_hash TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    liquidity_pools: `
      CREATE TABLE IF NOT EXISTS liquidity_pools (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        pool_id TEXT UNIQUE NOT NULL,
        dex_name TEXT NOT NULL,
        token_a TEXT NOT NULL,
        token_b TEXT NOT NULL,
        reserve_a DECIMAL,
        reserve_b DECIMAL,
        liquidity DECIMAL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  };

  console.log('Database schemas for reference:', schemas);
  return schemas;
};
