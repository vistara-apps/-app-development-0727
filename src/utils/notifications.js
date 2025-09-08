// Notification system for Base Liquidity Navigator
import { toast } from 'react-hot-toast';

// Notification types
export const NOTIFICATION_TYPES = {
  BETTER_ROUTE: 'better_route',
  HIGH_SLIPPAGE: 'high_slippage',
  TRADE_COMPLETE: 'trade_complete',
  PRICE_ALERT: 'price_alert',
  SYSTEM_UPDATE: 'system_update'
};

// Notification manager class
class NotificationManager {
  constructor() {
    this.activeAlerts = new Map();
    this.userPreferences = {
      enableBetterRouteAlerts: true,
      enableHighSlippageAlerts: true,
      enablePriceAlerts: true,
      slippageThreshold: 0.5, // 0.5%
      priceChangeThreshold: 5, // 5%
      notificationSound: true
    };
  }

  // Set user preferences
  setPreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  // Show better route notification
  showBetterRouteAlert(routeData) {
    if (!this.userPreferences.enableBetterRouteAlerts) return;

    const message = `🚀 Better route found! Save ${routeData.savings} with ${routeData.estimatedSlippage} slippage`;
    
    toast.success(message, {
      duration: 8000,
      position: 'top-right',
      style: {
        background: 'hsl(170, 70%, 40%)',
        color: 'white',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '14px'
      },
      icon: '🔄',
      action: {
        label: 'View Route',
        onClick: () => this.handleRouteClick(routeData)
      }
    });

    this.playNotificationSound();
  }

  // Show high slippage warning
  showHighSlippageAlert(slippageData) {
    if (!this.userPreferences.enableHighSlippageAlerts) return;

    const slippagePercent = parseFloat(slippageData.slippage.replace('%', ''));
    if (slippagePercent < this.userPreferences.slippageThreshold) return;

    const message = `⚠️ High slippage detected: ${slippageData.slippage}. Consider reducing trade size or waiting for better conditions.`;
    
    toast.error(message, {
      duration: 10000,
      position: 'top-right',
      style: {
        background: 'hsl(0, 70%, 50%)',
        color: 'white',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '14px'
      },
      icon: '⚠️'
    });

    this.playNotificationSound();
  }

  // Show trade completion notification
  showTradeCompleteAlert(tradeData) {
    const actualSlippage = parseFloat(tradeData.actualSlippage?.replace('%', '') || '0');
    const estimatedSlippage = parseFloat(tradeData.estimatedSlippage?.replace('%', '') || '0');
    
    const isGoodTrade = actualSlippage <= estimatedSlippage;
    const icon = isGoodTrade ? '✅' : '⚠️';
    const bgColor = isGoodTrade ? 'hsl(130, 70%, 45%)' : 'hsl(30, 70%, 50%)';
    
    const message = `${icon} Trade completed! Actual slippage: ${tradeData.actualSlippage || 'N/A'}`;
    
    toast(message, {
      duration: 6000,
      position: 'top-right',
      style: {
        background: bgColor,
        color: 'white',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '14px'
      }
    });

    this.playNotificationSound();
  }

  // Show price alert
  showPriceAlert(priceData) {
    if (!this.userPreferences.enablePriceAlerts) return;

    const changePercent = Math.abs(priceData.changePercent);
    if (changePercent < this.userPreferences.priceChangeThreshold) return;

    const direction = priceData.changePercent > 0 ? '📈' : '📉';
    const message = `${direction} ${priceData.token} price ${priceData.changePercent > 0 ? 'up' : 'down'} ${changePercent.toFixed(2)}%`;
    
    toast(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: 'hsl(210, 80%, 50%)',
        color: 'white',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '14px'
      }
    });

    this.playNotificationSound();
  }

  // Show system update notification
  showSystemUpdate(updateData) {
    const message = `🔄 ${updateData.title}: ${updateData.message}`;
    
    toast(message, {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: 'hsl(215, 25%, 20%)',
        color: 'hsl(0, 0%, 95%)',
        border: '1px solid hsl(170, 70%, 40%)',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '14px'
      },
      icon: 'ℹ️'
    });
  }

  // Play notification sound
  playNotificationSound() {
    if (!this.userPreferences.notificationSound) return;
    
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Handle route click action
  handleRouteClick(routeData) {
    // Emit custom event for route selection
    window.dispatchEvent(new CustomEvent('selectBetterRoute', { 
      detail: routeData 
    }));
  }

  // Monitor for better routes
  startRouteMonitoring(currentRoute, tokenPair, amount) {
    const monitoringKey = `${tokenPair}-${amount}`;
    
    // Clear existing monitoring for this pair
    if (this.activeAlerts.has(monitoringKey)) {
      clearInterval(this.activeAlerts.get(monitoringKey));
    }

    // Start new monitoring
    const interval = setInterval(async () => {
      try {
        const { calculateOptimalRoute } = await import('./dexApi.js');
        const [tokenFrom, tokenTo] = tokenPair.split('/');
        const newRoute = await calculateOptimalRoute(tokenFrom, tokenTo, amount);
        
        // Compare with current route
        const currentSavings = parseFloat(currentRoute.savings?.replace('$', '') || '0');
        const newSavings = parseFloat(newRoute.savings?.replace('$', '') || '0');
        
        if (newSavings > currentSavings * 1.1) { // 10% better savings
          this.showBetterRouteAlert(newRoute);
          // Update current route reference
          currentRoute = newRoute;
        }
      } catch (error) {
        console.error('Route monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds

    this.activeAlerts.set(monitoringKey, interval);
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      this.stopRouteMonitoring(monitoringKey);
    }, 600000);
  }

  // Stop route monitoring
  stopRouteMonitoring(monitoringKey) {
    if (this.activeAlerts.has(monitoringKey)) {
      clearInterval(this.activeAlerts.get(monitoringKey));
      this.activeAlerts.delete(monitoringKey);
    }
  }

  // Stop all monitoring
  stopAllMonitoring() {
    this.activeAlerts.forEach((interval) => {
      clearInterval(interval);
    });
    this.activeAlerts.clear();
  }

  // Check slippage threshold
  checkSlippageThreshold(routeData) {
    const slippagePercent = parseFloat(routeData.estimatedSlippage?.replace('%', '') || '0');
    
    if (slippagePercent > this.userPreferences.slippageThreshold) {
      this.showHighSlippageAlert({
        slippage: routeData.estimatedSlippage,
        route: routeData.route,
        suggestions: this.getSlippageReductionSuggestions(slippagePercent)
      });
    }
  }

  // Get suggestions for reducing slippage
  getSlippageReductionSuggestions(slippagePercent) {
    const suggestions = [];
    
    if (slippagePercent > 1.0) {
      suggestions.push('Consider reducing trade size');
      suggestions.push('Try trading during higher liquidity periods');
    }
    
    if (slippagePercent > 0.5) {
      suggestions.push('Split trade across multiple transactions');
      suggestions.push('Wait for better market conditions');
    }
    
    suggestions.push('Check if alternative routes are available');
    
    return suggestions;
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Convenience functions
export const showBetterRoute = (routeData) => notificationManager.showBetterRouteAlert(routeData);
export const showHighSlippage = (slippageData) => notificationManager.showHighSlippageAlert(slippageData);
export const showTradeComplete = (tradeData) => notificationManager.showTradeCompleteAlert(tradeData);
export const showPriceAlert = (priceData) => notificationManager.showPriceAlert(priceData);
export const showSystemUpdate = (updateData) => notificationManager.showSystemUpdate(updateData);

// React hook for notifications
export const useNotifications = () => {
  return {
    showBetterRoute,
    showHighSlippage,
    showTradeComplete,
    showPriceAlert,
    showSystemUpdate,
    setPreferences: (prefs) => notificationManager.setPreferences(prefs),
    startRouteMonitoring: (currentRoute, tokenPair, amount) => 
      notificationManager.startRouteMonitoring(currentRoute, tokenPair, amount),
    stopRouteMonitoring: (key) => notificationManager.stopRouteMonitoring(key),
    stopAllMonitoring: () => notificationManager.stopAllMonitoring()
  };
};
