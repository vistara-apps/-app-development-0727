import React, { useState, useEffect } from 'react';
import AnalyticsChart from './AnalyticsChart';
import LiquiditySummaryCard from './LiquiditySummaryCard';
import { analyzeSlippageHistory } from '../utils/dexApi';
import { getUserAnalytics } from '../utils/supabase';
import { Calendar, Download, Filter, TrendingUp, AlertTriangle } from 'lucide-react';

function Analytics() {
  const [dateRange, setDateRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [slippageAnalysis, setSlippageAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const tradeHistory = [
    {
      id: '1',
      tokenIn: 'ETH',
      tokenOut: 'USDC',
      amountIn: '1.0',
      amountOut: '1847.23',
      slippage: '0.12%',
      fees: '$2.45',
      dex: 'Uniswap V3',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      tokenIn: 'USDC',
      tokenOut: 'WBTC',
      amountIn: '10000',
      amountOut: '0.234',
      slippage: '0.08%',
      fees: '$8.90',
      dex: 'SushiSwap',
      timestamp: '2024-01-14T15:45:00Z'
    }
  ];

  const liquidityData = [
    { dex: 'Uniswap V3', pair: 'ETH/USDC', liquidity: '$2.4M', change24h: 2.3 },
    { dex: 'SushiSwap', pair: 'ETH/USDC', liquidity: '$1.8M', change24h: -1.2 },
    { dex: 'Curve', pair: 'ETH/USDC', liquidity: '$1.2M', change24h: 0.8 },
    { dex: 'Balancer', pair: 'ETH/USDC', liquidity: '$890K', change24h: 1.5 }
  ];

  const slippageData = [
    { name: 'Mon', uniswap: 0.12, sushiswap: 0.15, curve: 0.08 },
    { name: 'Tue', uniswap: 0.11, sushiswap: 0.14, curve: 0.09 },
    { name: 'Wed', uniswap: 0.13, sushiswap: 0.16, curve: 0.07 },
    { name: 'Thu', uniswap: 0.10, sushiswap: 0.13, curve: 0.08 },
    { name: 'Fri', uniswap: 0.12, sushiswap: 0.15, curve: 0.09 },
    { name: 'Sat', uniswap: 0.14, sushiswap: 0.17, curve: 0.10 },
    { name: 'Sun', uniswap: 0.11, sushiswap: 0.14, curve: 0.08 }
  ];

  const volumeData = [
    { name: 'Mon', volume: 1200000 },
    { name: 'Tue', volume: 1800000 },
    { name: 'Wed', volume: 1500000 },
    { name: 'Thu', volume: 2100000 },
    { name: 'Fri', volume: 1900000 },
    { name: 'Sat', volume: 1600000 },
    { name: 'Sun', volume: 1400000 }
  ];

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // In a real app, you'd get the user ID from wallet connection
        const mockUserId = 'user-123';
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        
        // Load user analytics and slippage analysis
        const [userAnalytics, slippageData] = await Promise.all([
          getUserAnalytics(mockUserId, days),
          analyzeSlippageHistory(mockUserId, days)
        ]);
        
        setAnalyticsData(userAnalytics);
        setSlippageAnalysis(slippageData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        // Use mock data as fallback
        setAnalyticsData({
          totalTrades: 127,
          totalVolume: 84320,
          avgSlippage: 0.12,
          totalFees: 234.56,
          trades: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  return (
    <div className="lg:col-span-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-textPrimary">Trading Analytics</h2>
          <p className="text-textSecondary">Track your trading performance and costs</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-surface border border-gray-700 rounded-lg px-3 py-2 text-textPrimary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-textSecondary text-sm">Total Trades</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-semibold text-textPrimary">
            {isLoading ? '...' : (analyticsData?.totalTrades || 127)}
          </p>
          <p className="text-success text-sm">+12% from last month</p>
        </div>
        
        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-textSecondary text-sm">Total Volume</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-semibold text-textPrimary">
            {isLoading ? '...' : `$${(analyticsData?.totalVolume || 84320).toLocaleString()}`}
          </p>
          <p className="text-success text-sm">+8% from last month</p>
        </div>
        
        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-textSecondary text-sm">Avg Slippage</p>
            <AlertTriangle className={`w-4 h-4 ${
              (analyticsData?.avgSlippage || 0.12) > 0.5 ? 'text-warning' : 'text-success'
            }`} />
          </div>
          <p className="text-2xl font-semibold text-textPrimary">
            {isLoading ? '...' : `${((analyticsData?.avgSlippage || 0.12) * 100).toFixed(2)}%`}
          </p>
          <p className={`text-sm ${
            (analyticsData?.avgSlippage || 0.12) > 0.5 ? 'text-warning' : 'text-success'
          }`}>
            {(analyticsData?.avgSlippage || 0.12) > 0.5 ? 'Above average' : 'Below average'}
          </p>
        </div>
        
        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-textSecondary text-sm">Total Fees</p>
            <TrendingUp className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-semibold text-textPrimary">
            {isLoading ? '...' : `$${(analyticsData?.totalFees || 234.56).toFixed(2)}`}
          </p>
          <p className="text-warning text-sm">+5% from last month</p>
        </div>
      </div>

      {/* Slippage Analysis Insights */}
      {slippageAnalysis && (
        <div className="bg-surface rounded-lg p-4">
          <h3 className="text-lg font-medium text-textPrimary mb-3">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-textSecondary">Best Performing DEX</p>
              <p className="text-accent font-medium">{slippageAnalysis.bestPerformingDex}</p>
            </div>
            <div>
              <p className="text-sm text-textSecondary">Highest Cost DEX</p>
              <p className="text-warning font-medium">{slippageAnalysis.worstPerformingDex}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart 
          title="Slippage by DEX"
          data={slippageData}
          variant="line"
        />
        
        <AnalyticsChart 
          title="Trading Volume"
          data={volumeData}
          variant="bar"
        />
      </div>

      {/* Liquidity Summary and Trade History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiquiditySummaryCard 
          title="Top Liquidity Pools"
          data={liquidityData}
        />
        
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-lg p-6 shadow-card">
            <h3 className="text-lg font-medium text-textPrimary mb-4">Recent Trades</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-textSecondary">Pair</th>
                    <th className="text-left py-2 text-textSecondary">Amount</th>
                    <th className="text-left py-2 text-textSecondary">Slippage</th>
                    <th className="text-left py-2 text-textSecondary">Fees</th>
                    <th className="text-left py-2 text-textSecondary">DEX</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-800">
                      <td className="py-3 text-textPrimary">{trade.tokenIn}/{trade.tokenOut}</td>
                      <td className="py-3 text-textPrimary">{trade.amountIn}</td>
                      <td className="py-3 text-success">{trade.slippage}</td>
                      <td className="py-3 text-textPrimary">{trade.fees}</td>
                      <td className="py-3 text-accent">{trade.dex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
