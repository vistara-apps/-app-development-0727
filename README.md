# Base Liquidity Navigator

**Instantly find and route the best DEX liquidity for optimal trades on Base.**

A comprehensive DeFi application that helps traders on Base find and access the best DEX liquidity sources automatically, reducing slippage and improving trade execution.

![Base Liquidity Navigator](https://via.placeholder.com/800x400/1a1a1a/00d4aa?text=Base+Liquidity+Navigator)

## 🚀 Features

### Core Features
- **Real-time DEX Liquidity Scanner** - Scans and ranks liquidity across major DEXs on Base in real-time
- **Automated Trade Routing** - Intelligently routes trades across aggregated liquidity pools to minimize slippage
- **Slippage & Fee Analytics** - Comprehensive dashboard visualizing historical slippage and fees
- **Smart Notifications** - Alerts for better routes and high slippage warnings
- **User Data Persistence** - Trade history and analytics stored securely

### Supported DEXs
- **Aerodrome** - Base's leading DEX with concentrated liquidity
- **Uniswap V3** - Industry-standard AMM with advanced features
- **SushiSwap** - Multi-chain DEX with competitive rates
- **BaseSwap** - Native Base DEX with optimized gas costs

### Business Model
- **Micro-transactions**: $0.01 per route analysis
- **Subscription tiers**: 
  - Free: 10 analyses/month
  - Basic ($5/mo): 100 analyses/month
  - Premium ($15/mo): Unlimited analyses + advanced features

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom design system
- **Wallet Integration**: RainbowKit + Wagmi
- **Blockchain**: Base (Ethereum L2)
- **Database**: Supabase (PostgreSQL)
- **Payments**: x402-axios micro-payments
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **AI Insights**: OpenAI/OpenRouter integration

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Git
- A Supabase account (for database)
- WalletConnect Project ID
- OpenAI/OpenRouter API key (optional, for AI insights)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/-app-development-0727.git
cd -app-development-0727
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI/OpenRouter for AI insights (optional)
OPENROUTER_API_KEY=your-openrouter-key
OPENAI_API_KEY=your-openai-key

# RainbowKit Project ID
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL migrations from `docs/API_DOCUMENTATION.md`
3. Update your environment variables with the Supabase credentials

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173` to see the application.

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── Analytics.jsx    # Analytics dashboard
│   ├── TradeInterface.jsx # Main trading interface
│   ├── AppShell.jsx     # Layout wrapper
│   └── ...
├── hooks/              # Custom React hooks
│   └── usePaymentContext.js
├── utils/              # Utility functions
│   ├── dexApi.js       # DEX integration & routing
│   ├── supabase.js     # Database operations
│   └── notifications.js # Notification system
├── App.jsx             # Main app component
└── main.jsx           # App entry point

docs/
└── API_DOCUMENTATION.md # Complete API documentation
```

## 🔧 Configuration

### Tailwind Design System

The app uses a custom design system defined in `tailwind.config.js`:

```javascript
colors: {
  bg: 'hsl(215, 25%, 15%)',           // Dark background
  surface: 'hsl(215, 25%, 20%)',     // Card backgrounds
  primary: 'hsl(210, 80%, 50%)',     // Primary blue
  accent: 'hsl(170, 70%, 40%)',      // Teal accent
  success: 'hsl(130, 70%, 45%)',     // Green
  warning: 'hsl(30, 70%, 50%)',      // Orange
  error: 'hsl(0, 70%, 50%)',         // Red
  textPrimary: 'hsl(0, 0%, 95%)',    // Light text
  textSecondary: 'hsl(0, 0%, 70%)',  // Muted text
}
```

### DEX Integration

The app integrates with multiple DEXs on Base:

```javascript
const BASE_DEXS = {
  AERODROME: {
    name: 'Aerodrome',
    factoryAddress: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
    routerAddress: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43'
  },
  // ... other DEXs
};
```

## 📊 Features Deep Dive

### Real-time Liquidity Scanner

```javascript
import { fetchLiquidityData } from './utils/dexApi';

const liquidityData = await fetchLiquidityData('ETH/USDC');
// Returns real-time liquidity data from all supported DEXs
```

### Automated Route Optimization

```javascript
import { calculateOptimalRoute } from './utils/dexApi';

const route = await calculateOptimalRoute('ETH', 'USDC', '1.0');
// Returns optimal routing path with slippage and fee estimates
```

### Smart Notifications

```javascript
import { useNotifications } from './utils/notifications';

const { showBetterRoute, startRouteMonitoring } = useNotifications();

// Monitor for better routes automatically
startRouteMonitoring(currentRoute, 'ETH/USDC', '1.0');
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

## 📈 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting with Vite
- **Lazy Loading**: Components loaded on demand
- **Caching**: Liquidity data cached for 5 minutes
- **Debounced API Calls**: Route calculations debounced to prevent spam
- **Optimistic Updates**: UI updates immediately for better UX

## 🔒 Security Features

- **TruffleHog Integration**: Automatic secret scanning
- **Wallet Security**: Non-custodial wallet integration
- **API Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: All user inputs validated and sanitized
- **HTTPS Only**: All API calls use secure connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting PR

## 📚 API Documentation

Complete API documentation is available in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

Key endpoints:
- `fetchLiquidityData(tokenPair)` - Get real-time liquidity data
- `calculateOptimalRoute(from, to, amount)` - Calculate best trading route
- `analyzeSlippageHistory(userAddress, days)` - Get slippage analytics
- `monitorPriceChanges(tokenPair, callback)` - Real-time price monitoring

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Issues**
```bash
# Clear browser cache and cookies
# Ensure MetaMask is connected to Base network
# Check WalletConnect Project ID in environment variables
```

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Errors**
```bash
# Check environment variables
# Verify Supabase connection
# Ensure Base RPC is accessible
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Base](https://base.org) - For the amazing L2 infrastructure
- [Aerodrome](https://aerodrome.finance) - Leading DEX on Base
- [RainbowKit](https://rainbowkit.com) - Excellent wallet connection UX
- [Supabase](https://supabase.com) - Backend-as-a-Service platform
- [Vite](https://vitejs.dev) - Lightning-fast build tool

## 📞 Support

- **Email**: support@baseliquiditynavigator.com
- **Discord**: [Join our community](https://discord.gg/base-liquidity)
- **Twitter**: [@BaseLiquidityNav](https://twitter.com/BaseLiquidityNav)
- **Documentation**: [docs.baseliquiditynavigator.com](https://docs.baseliquiditynavigator.com)

---

**Built with ❤️ for the Base ecosystem**
