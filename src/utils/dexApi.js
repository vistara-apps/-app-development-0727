import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

// Base chain DEX configurations
const BASE_DEXS = {
  UNISWAP_V3: {
    name: 'Uniswap V3',
    factoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    routerAddress: '0x2626664c2603336E57B271c5C0b26F421741e481',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-base'
  },
  SUSHISWAP: {
    name: 'SushiSwap',
    factoryAddress: '0x71524B4f93c58fcbF659783284E38825f0622859',
    routerAddress: '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-base'
  },
  AERODROME: {
    name: 'Aerodrome',
    factoryAddress: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
    routerAddress: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aerodrome-finance/aerodrome-base'
  },
  BASESWAP: {
    name: 'BaseSwap',
    factoryAddress: '0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB',
    routerAddress: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/baseswap/baseswap-v2'
  }
};

// Common Base token addresses
const BASE_TOKENS = {
  ETH: '0x4200000000000000000000000000000000000006', // Wrapped ETH on Base
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  WETH: '0x4200000000000000000000000000000000000006',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
};

// Enhanced mock data with more realistic Base DEX information
export const mockDexData = {
  liquidity: [
    { dex: 'Aerodrome', pair: 'ETH/USDC', liquidity: '$4.2M', change24h: 3.1, tvl: 4200000, volume24h: 890000 },
    { dex: 'Uniswap V3', pair: 'ETH/USDC', liquidity: '$2.8M', change24h: 1.8, tvl: 2800000, volume24h: 1200000 },
    { dex: 'BaseSwap', pair: 'ETH/USDC', liquidity: '$1.9M', change24h: -0.5, tvl: 1900000, volume24h: 450000 },
    { dex: 'SushiSwap', pair: 'ETH/USDC', liquidity: '$1.1M', change24h: 0.9, tvl: 1100000, volume24h: 320000 }
  ],
  
  routes: {
    'ETH/USDC': {
      bestPrice: '2847.23',
      estimatedSlippage: '0.08%',
      totalFees: '$1.85',
      route: ['Aerodrome', 'Uniswap V3'],
      savings: '$18.50',
      priceImpact: '0.05%',
      gasEstimate: '0.0012 ETH'
    },
    'USDC/ETH': {
      bestPrice: '0.000351',
      estimatedSlippage: '0.09%',
      totalFees: '$1.92',
      route: ['Uniswap V3', 'Aerodrome'],
      savings: '$15.20',
      priceImpact: '0.06%',
      gasEstimate: '0.0015 ETH'
    }
  }
};

// Real-time liquidity scanner
export async function fetchLiquidityData(tokenPair = 'ETH/USDC') {
  try {
    // In production, this would query multiple DEX subgraphs simultaneously
    const liquidityPromises = Object.values(BASE_DEXS).map(async (dex) => {
      try {
        // Simulate real API calls with realistic delays and data
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        const mockLiquidity = mockDexData.liquidity.find(l => l.dex === dex.name);
        return {
          ...mockLiquidity,
          lastUpdated: new Date().toISOString(),
          source: dex.subgraphUrl
        };
      } catch (error) {
        console.warn(`Failed to fetch liquidity from ${dex.name}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(liquidityPromises);
    const liquidityData = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .sort((a, b) => b.tvl - a.tvl); // Sort by TVL descending

    return liquidityData.length > 0 ? liquidityData : mockDexData.liquidity;
  } catch (error) {
    console.error('Error fetching liquidity data:', error);
    return mockDexData.liquidity;
  }
}

// Advanced routing algorithm with multi-DEX optimization
export async function calculateOptimalRoute(tokenFrom, tokenTo, amount) {
  try {
    const amountNum = parseFloat(amount) || 1;
    const pair = `${tokenFrom}/${tokenTo}`;
    
    // Simulate complex routing calculations
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get base route data
    const baseRoute = mockDexData.routes[pair] || mockDexData.routes['ETH/USDC'];
    
    // Calculate dynamic pricing based on amount and current liquidity
    const liquidityData = await fetchLiquidityData(pair);
    const totalLiquidity = liquidityData.reduce((sum, pool) => sum + pool.tvl, 0);
    
    // Adjust slippage based on trade size vs liquidity
    const tradeSize = amountNum * parseFloat(baseRoute.bestPrice.replace(/,/g, ''));
    const liquidityRatio = tradeSize / totalLiquidity;
    
    let adjustedSlippage = parseFloat(baseRoute.estimatedSlippage.replace('%', ''));
    if (liquidityRatio > 0.01) { // Large trade
      adjustedSlippage *= (1 + liquidityRatio * 10);
    }
    
    // Calculate price impact
    let priceImpact = Math.min(liquidityRatio * 100, 5); // Cap at 5%
    
    // Optimize route selection based on current conditions
    const availableDexs = liquidityData.map(pool => pool.dex);
    const optimalRoute = selectOptimalRoute(availableDexs, amountNum);
    
    return {
      ...baseRoute,
      estimatedSlippage: `${adjustedSlippage.toFixed(3)}%`,
      priceImpact: `${priceImpact.toFixed(3)}%`,
      route: optimalRoute,
      confidence: calculateRouteConfidence(liquidityData, amountNum),
      timestamp: new Date().toISOString(),
      liquidityUtilized: totalLiquidity
    };
  } catch (error) {
    console.error('Error calculating optimal route:', error);
    return mockDexData.routes['ETH/USDC'];
  }
}

// Helper function to select optimal routing path
function selectOptimalRoute(availableDexs, amount) {
  // Simple routing logic - in production this would be much more sophisticated
  if (amount < 1000) {
    return availableDexs.slice(0, 1); // Single DEX for small trades
  } else if (amount < 10000) {
    return availableDexs.slice(0, 2); // Split across 2 DEXs
  } else {
    return availableDexs.slice(0, 3); // Split across multiple DEXs for large trades
  }
}

// Calculate confidence score for route recommendation
function calculateRouteConfidence(liquidityData, amount) {
  const totalLiquidity = liquidityData.reduce((sum, pool) => sum + pool.tvl, 0);
  const tradeSize = amount * 2800; // Approximate USD value
  
  if (tradeSize < totalLiquidity * 0.001) return 'High';
  if (tradeSize < totalLiquidity * 0.01) return 'Medium';
  return 'Low';
}

// Real-time price monitoring
export async function monitorPriceChanges(tokenPair, callback) {
  const interval = setInterval(async () => {
    try {
      const currentData = await fetchLiquidityData(tokenPair);
      callback(currentData);
    } catch (error) {
      console.error('Price monitoring error:', error);
    }
  }, 30000); // Update every 30 seconds

  return () => clearInterval(interval);
}

// Slippage and fee analytics
export async function analyzeSlippageHistory(userAddress, days = 30) {
  try {
    // In production, this would query user's transaction history
    const mockHistory = [
      { date: '2024-01-15', avgSlippage: 0.12, totalFees: 45.20, trades: 8 },
      { date: '2024-01-14', avgSlippage: 0.15, totalFees: 32.10, trades: 5 },
      { date: '2024-01-13', avgSlippage: 0.09, totalFees: 28.50, trades: 6 },
      { date: '2024-01-12', avgSlippage: 0.18, totalFees: 51.80, trades: 9 },
      { date: '2024-01-11', avgSlippage: 0.11, totalFees: 38.90, trades: 7 }
    ];

    return {
      history: mockHistory,
      averageSlippage: mockHistory.reduce((sum, day) => sum + day.avgSlippage, 0) / mockHistory.length,
      totalFees: mockHistory.reduce((sum, day) => sum + day.totalFees, 0),
      totalTrades: mockHistory.reduce((sum, day) => sum + day.trades, 0),
      bestPerformingDex: 'Aerodrome',
      worstPerformingDex: 'BaseSwap'
    };
  } catch (error) {
    console.error('Error analyzing slippage history:', error);
    return null;
  }
}

export async function generateTradingInsights(tradeData) {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a DeFi trading expert. Analyze the provided trade data and give brief insights about slippage optimization and cost savings."
        },
        {
          role: "user",
          content: `Analyze this trade: ${JSON.stringify(tradeData)}`
        }
      ],
      max_tokens: 150
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating insights:', error);
    return "Unable to generate insights at this time.";
  }
}
