import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/AppShell';
import TradeInterface from './components/TradeInterface';
import Analytics from './components/Analytics';
import Sidebar from './components/Sidebar';
import { BarChart3, Repeat, Settings, Menu } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('trade');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'trade', label: 'Trade', icon: Repeat },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-bg text-textPrimary">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(215, 25%, 20%)',
            color: 'hsl(0, 0%, 95%)',
            border: '1px solid hsl(215, 25%, 30%)',
          },
        }}
      />
      <div className="flex h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-700
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-surface border-b border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-textPrimary">Base Liquidity Navigator</h1>
                <p className="text-sm text-textSecondary">Find optimal DEX liquidity for your trades</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="bg-surface border-b border-gray-700 px-4">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-accent text-white border-b-2 border-accent' 
                        : 'text-textSecondary hover:text-textPrimary hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <AppShell>
              {activeTab === 'trade' && <TradeInterface />}
              {activeTab === 'analytics' && <Analytics />}
            </AppShell>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
