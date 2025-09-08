import React, { useState, useEffect } from 'react';
import TokenInput from './TokenInput';
import LiquiditySummaryCard from './LiquiditySummaryCard';
import TradeButton from './TradeButton';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { useNotifications } from '../utils/notifications';
import { calculateOptimalRoute, fetchLiquidityData } from '../utils/dexApi';
import { ArrowDownUp, Settings, Info, AlertTriangle, TrendingUp } from 'lucide-react';

function TradeInterface() {
  const [tokenFrom, setTokenFrom] = useState('ETH');
  const [tokenTo, setTokenTo] = useState('USDC');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [paid, setPaid] = useState(false);
  const [liquidityData, setLiquidityData] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const { createSession } = usePaymentContext();
  const { 
    showHighSlippage, 
    startRouteMonitoring, 
    stopRouteMonitoring,
    showSystemUpdate 
  } = useNotifications();

  const handleSwapTokens = () => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
    setAmountFrom(amountTo);
    setAmountTo(amountFrom);
  };

  // Load liquidity data on component mount
  useEffect(() => {
    const loadLiquidityData = async () => {
      try {
        const data = await fetchLiquidityData(`${tokenFrom}/${tokenTo}`);
        setLiquidityData(data);
      } catch (error) {
        console.error('Failed to load liquidity data:', error);
      }
    };

    loadLiquidityData();
  }, [tokenFrom, tokenTo]);

  // Listen for better route selections
  useEffect(() => {
    const handleBetterRoute = (event) => {
      setRouteData(event.detail);
      showSystemUpdate({
        title: 'Route Updated',
        message: 'Applied better route with improved savings!'
      });
    };

    window.addEventListener('selectBetterRoute', handleBetterRoute);
    return () => window.removeEventListener('selectBetterRoute', handleBetterRoute);
  }, [showSystemUpdate]);

  const handleGetBestRoute = async () => {
    if (!paid) {
      try {
        await createSession();
        setPaid(true);
      } catch (error) {
        console.error('Payment failed:', error);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // Use real API to calculate optimal route
      const route = await calculateOptimalRoute(tokenFrom, tokenTo, amountFrom);
      setRouteData(route);
      
      // Check for high slippage and show warning if needed
      const slippagePercent = parseFloat(route.estimatedSlippage?.replace('%', '') || '0');
      if (slippagePercent > 0.5) {
        showHighSlippage({
          slippage: route.estimatedSlippage,
          route: route.route,
          suggestions: ['Consider reducing trade size', 'Wait for better market conditions']
        });
      }

      // Start monitoring for better routes
      if (amountFrom && parseFloat(amountFrom) > 0) {
        startRouteMonitoring(route, `${tokenFrom}/${tokenTo}`, amountFrom);
        setIsMonitoring(true);
      }
      
    } catch (error) {
      console.error('Failed to calculate route:', error);
      showSystemUpdate({
        title: 'Route Calculation Failed',
        message: 'Please try again or check your connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMonitoring = () => {
    stopRouteMonitoring(`${tokenFrom}/${tokenTo}-${amountFrom}`);
    setIsMonitoring(false);
  };

  return (
    <div className="lg:col-span-8 space-y-6">
      {/* Trade Card */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-textPrimary">Swap Tokens</h2>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-textSecondary" />
          </button>
        </div>

        <div className="space-y-4">
          {/* From Token */}
          <TokenInput
            label="From"
            token={tokenFrom}
            amount={amountFrom}
            onTokenChange={setTokenFrom}
            onAmountChange={setAmountFrom}
            balance="12.4532"
          />

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapTokens}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowDownUp className="w-5 h-5 text-textSecondary" />
            </button>
          </div>

          {/* To Token */}
          <TokenInput
            label="To"
            token={tokenTo}
            amount={amountTo}
            onTokenChange={setTokenTo}
            onAmountChange={setAmountTo}
            balance="0.0000"
            readOnly
          />

          {/* Route Information */}
          {routeData && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-textPrimary">Best Route Found</span>
                  {routeData.confidence && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      routeData.confidence === 'High' ? 'bg-success/20 text-success' :
                      routeData.confidence === 'Medium' ? 'bg-warning/20 text-warning' :
                      'bg-error/20 text-error'
                    }`}>
                      {routeData.confidence} Confidence
                    </span>
                  )}
                </div>
                
                {isMonitoring && (
                  <button
                    onClick={handleStopMonitoring}
                    className="flex items-center space-x-1 text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Monitoring</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-textSecondary">Price:</span>
                  <span className="text-textPrimary ml-1">${routeData.bestPrice}</span>
                </div>
                <div>
                  <span className="text-textSecondary">Slippage:</span>
                  <span className={`ml-1 ${
                    parseFloat(routeData.estimatedSlippage?.replace('%', '') || '0') > 0.5 
                      ? 'text-warning' : 'text-success'
                  }`}>
                    {routeData.estimatedSlippage}
                  </span>
                </div>
                <div>
                  <span className="text-textSecondary">Fees:</span>
                  <span className="text-textPrimary ml-1">{routeData.totalFees}</span>
                </div>
                <div>
                  <span className="text-textSecondary">Savings:</span>
                  <span className="text-success ml-1">{routeData.savings}</span>
                </div>
                {routeData.priceImpact && (
                  <div>
                    <span className="text-textSecondary">Price Impact:</span>
                    <span className={`ml-1 ${
                      parseFloat(routeData.priceImpact?.replace('%', '') || '0') > 1 
                        ? 'text-warning' : 'text-textPrimary'
                    }`}>
                      {routeData.priceImpact}
                    </span>
                  </div>
                )}
                {routeData.gasEstimate && (
                  <div>
                    <span className="text-textSecondary">Gas:</span>
                    <span className="text-textPrimary ml-1">{routeData.gasEstimate}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-textSecondary">Route: </span>
                    <span className="text-xs text-accent">{routeData.route?.join(' → ')}</span>
                  </div>
                  {routeData.timestamp && (
                    <span className="text-xs text-textSecondary">
                      Updated {new Date(routeData.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {/* High slippage warning */}
              {parseFloat(routeData.estimatedSlippage?.replace('%', '') || '0') > 0.5 && (
                <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm text-warning font-medium">High Slippage Warning</span>
                  </div>
                  <p className="text-xs text-textSecondary mt-1">
                    Consider reducing trade size or waiting for better market conditions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Get Best Route Button */}
          <TradeButton
            variant="primary"
            onClick={handleGetBestRoute}
            isLoading={isLoading}
            disabled={!amountFrom || !tokenFrom || !tokenTo}
          >
            {paid ? 'Get Best Route' : 'Get Best Route ($0.01)'}
          </TradeButton>

          {/* Execute Trade Button */}
          {routeData && (
            <TradeButton
              variant="secondary"
              onClick={() => console.log('Execute trade')}
            >
              Execute Trade
            </TradeButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradeInterface;
