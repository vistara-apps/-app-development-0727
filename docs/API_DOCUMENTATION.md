# Base Liquidity Navigator - API Documentation

## Overview

The Base Liquidity Navigator provides a comprehensive API for accessing DEX liquidity data, calculating optimal trading routes, and managing user analytics on the Base blockchain.

## Table of Contents

1. [Authentication](#authentication)
2. [DEX API](#dex-api)
3. [User Management](#user-management)
4. [Trade History](#trade-history)
5. [Notifications](#notifications)
6. [Error Handling](#error-handling)
7. [Rate Limits](#rate-limits)

## Authentication

### Wallet Connection
The application uses RainbowKit for wallet authentication. Users must connect their wallet to access premium features.

```javascript
import { useAccount } from 'wagmi';

const { address, isConnected } = useAccount();
```

### Payment Integration
Premium features require payment through the x402-axios integration:

```javascript
import { usePaymentContext } from '../hooks/usePaymentContext';

const { createSession } = usePaymentContext();
await createSession(); // Costs $0.001 per route analysis
```

## DEX API

### Base DEX Configurations

The application supports the following DEXs on Base:

| DEX | Factory Address | Router Address |
|-----|----------------|----------------|
| Uniswap V3 | `0x33128a8fC17869897dcE68Ed026d694621f6FDfD` | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| SushiSwap | `0x71524B4f93c58fcbF659783284E38825f0622859` | `0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891` |
| Aerodrome | `0x420DD381b31aEf6683db6B902084cB0FFECe40Da` | `0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43` |
| BaseSwap | `0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB` | `0x327Df1E6de05895d2ab08513aaDD9313Fe505d86` |

### Supported Tokens

| Token | Address |
|-------|---------|
| ETH (WETH) | `0x4200000000000000000000000000000000000006` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| DAI | `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` |
| USDT | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` |

### Fetch Liquidity Data

```javascript
import { fetchLiquidityData } from '../utils/dexApi';

const liquidityData = await fetchLiquidityData('ETH/USDC');
```

**Response:**
```json
[
  {
    "dex": "Aerodrome",
    "pair": "ETH/USDC",
    "liquidity": "$4.2M",
    "change24h": 3.1,
    "tvl": 4200000,
    "volume24h": 890000,
    "lastUpdated": "2024-01-15T10:30:00Z",
    "source": "https://api.thegraph.com/subgraphs/name/aerodrome-finance/aerodrome-base"
  }
]
```

### Calculate Optimal Route

```javascript
import { calculateOptimalRoute } from '../utils/dexApi';

const route = await calculateOptimalRoute('ETH', 'USDC', '1.0');
```

**Response:**
```json
{
  "bestPrice": "2847.23",
  "estimatedSlippage": "0.08%",
  "totalFees": "$1.85",
  "route": ["Aerodrome", "Uniswap V3"],
  "savings": "$18.50",
  "priceImpact": "0.05%",
  "gasEstimate": "0.0012 ETH",
  "confidence": "High",
  "timestamp": "2024-01-15T10:30:00Z",
  "liquidityUtilized": 7000000
}
```

### Real-time Price Monitoring

```javascript
import { monitorPriceChanges } from '../utils/dexApi';

const stopMonitoring = await monitorPriceChanges('ETH/USDC', (data) => {
  console.log('Price update:', data);
});

// Stop monitoring
stopMonitoring();
```

### Slippage Analysis

```javascript
import { analyzeSlippageHistory } from '../utils/dexApi';

const analysis = await analyzeSlippageHistory('user-address', 30);
```

**Response:**
```json
{
  "history": [
    {
      "date": "2024-01-15",
      "avgSlippage": 0.12,
      "totalFees": 45.20,
      "trades": 8
    }
  ],
  "averageSlippage": 0.13,
  "totalFees": 196.50,
  "totalTrades": 35,
  "bestPerformingDex": "Aerodrome",
  "worstPerformingDex": "BaseSwap"
}
```

## User Management

### Supabase Integration

The application uses Supabase for user data persistence and analytics.

### Create or Update User

```javascript
import { createOrUpdateUser } from '../utils/supabase';

const user = await createOrUpdateUser('0x1234...', {
  subscriptionTier: 'premium'
});
```

### Get User by Wallet

```javascript
import { getUserByWallet } from '../utils/supabase';

const user = await getUserByWallet('0x1234...');
```

**Response:**
```json
{
  "id": "uuid",
  "wallet_address": "0x1234...",
  "subscription_tier": "free",
  "preferences": {},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Trade History

### Save Trade History

```javascript
import { saveTradeHistory } from '../utils/supabase';

const trade = await saveTradeHistory({
  userId: 'user-uuid',
  tokenIn: 'ETH',
  tokenOut: 'USDC',
  amountIn: '1.0',
  amountOut: '2847.23',
  estimatedSlippage: '0.08%',
  actualSlippage: '0.09%',
  fees: '1.85',
  routedDEXs: ['Aerodrome', 'Uniswap V3'],
  transactionHash: '0xabc123...'
});
```

### Get User Trade History

```javascript
import { getUserTradeHistory } from '../utils/supabase';

const trades = await getUserTradeHistory('user-uuid', 50);
```

### Get User Analytics

```javascript
import { getUserAnalytics } from '../utils/supabase';

const analytics = await getUserAnalytics('user-uuid', 30);
```

**Response:**
```json
{
  "totalTrades": 127,
  "totalVolume": 84320.50,
  "avgSlippage": 0.12,
  "totalFees": 234.56,
  "trades": [...]
}
```

## Notifications

### Notification System

The application includes a comprehensive notification system for better routes, high slippage alerts, and trade completions.

```javascript
import { useNotifications } from '../utils/notifications';

const {
  showBetterRoute,
  showHighSlippage,
  showTradeComplete,
  startRouteMonitoring,
  stopRouteMonitoring
} = useNotifications();
```

### Notification Types

| Type | Description | Trigger |
|------|-------------|---------|
| `BETTER_ROUTE` | Better route found | 10% improvement in savings |
| `HIGH_SLIPPAGE` | High slippage warning | Slippage > 0.5% |
| `TRADE_COMPLETE` | Trade execution complete | Transaction confirmed |
| `PRICE_ALERT` | Significant price change | Price change > 5% |
| `SYSTEM_UPDATE` | System notifications | App updates |

### Route Monitoring

```javascript
// Start monitoring for better routes
startRouteMonitoring(currentRoute, 'ETH/USDC', '1.0');

// Stop monitoring
stopRouteMonitoring('ETH/USDC-1.0');
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "INSUFFICIENT_LIQUIDITY",
    "message": "Not enough liquidity for this trade size",
    "details": {
      "requestedAmount": "1000000",
      "availableLiquidity": "500000"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `WALLET_NOT_CONNECTED` | User wallet not connected |
| `PAYMENT_REQUIRED` | Premium feature requires payment |
| `INSUFFICIENT_LIQUIDITY` | Not enough liquidity for trade |
| `SLIPPAGE_TOO_HIGH` | Slippage exceeds maximum threshold |
| `NETWORK_ERROR` | Blockchain network error |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |

## Rate Limits

### API Rate Limits

| Endpoint | Free Tier | Premium Tier |
|----------|-----------|--------------|
| Route Calculation | 10/hour | Unlimited |
| Liquidity Data | 100/hour | Unlimited |
| Price Monitoring | 1 pair | 10 pairs |
| Historical Data | 7 days | 90 days |

### Subscription Tiers

| Feature | Free | Basic ($5/mo) | Premium ($15/mo) |
|---------|------|---------------|------------------|
| Route Analyses | 10/month | 100/month | Unlimited |
| Price Monitoring | 1 pair | 5 pairs | 10 pairs |
| Historical Data | 7 days | 30 days | 90 days |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

## SDK Usage Examples

### Complete Trading Flow

```javascript
import { 
  fetchLiquidityData, 
  calculateOptimalRoute,
  saveTradeHistory 
} from '../utils/dexApi';
import { useNotifications } from '../utils/notifications';

async function executeTrade(tokenFrom, tokenTo, amount) {
  try {
    // 1. Check liquidity
    const liquidity = await fetchLiquidityData(`${tokenFrom}/${tokenTo}`);
    
    // 2. Calculate optimal route
    const route = await calculateOptimalRoute(tokenFrom, tokenTo, amount);
    
    // 3. Check slippage
    if (parseFloat(route.estimatedSlippage.replace('%', '')) > 0.5) {
      showHighSlippage({
        slippage: route.estimatedSlippage,
        suggestions: ['Reduce trade size', 'Wait for better conditions']
      });
      return;
    }
    
    // 4. Execute trade (integrate with your DEX contract)
    const txHash = await executeTradeOnChain(route);
    
    // 5. Save trade history
    await saveTradeHistory({
      userId: 'user-id',
      tokenIn: tokenFrom,
      tokenOut: tokenTo,
      amountIn: amount,
      transactionHash: txHash,
      // ... other trade data
    });
    
    // 6. Show completion notification
    showTradeComplete({
      actualSlippage: route.estimatedSlippage,
      estimatedSlippage: route.estimatedSlippage
    });
    
  } catch (error) {
    console.error('Trade execution failed:', error);
  }
}
```

## Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI/OpenRouter for AI insights
OPENROUTER_API_KEY=your-openrouter-key
OPENAI_API_KEY=your-openai-key

# RainbowKit Project ID
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Trade History Table
```sql
CREATE TABLE trade_history (
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
```

### Liquidity Pools Table
```sql
CREATE TABLE liquidity_pools (
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
```

## Support

For technical support and API questions:
- Email: support@baseliquiditynavigator.com
- Discord: [Join our community](https://discord.gg/base-liquidity)
- Documentation: [docs.baseliquiditynavigator.com](https://docs.baseliquiditynavigator.com)

## Changelog

### v1.0.0 (Current)
- Initial release with core DEX integration
- Real-time liquidity scanning
- Automated trade routing
- Slippage and fee analytics
- Notification system
- Supabase integration
- Payment system integration
