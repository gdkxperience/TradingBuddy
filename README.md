# Trading Buddy - Position Size Calculator

A React application built with shadcn/ui and Tailwind CSS to help traders calculate optimal position sizes and manage risk.

## Features

### Forward Calculation
Calculate position size based on:
- Account size and risk percentage (max 5% recommended)
- Entry price and stop loss price
- Trade type (Long/Short) with appropriate margin requirements
- Excess liquidity check to ensure affordability

### Reverse Calculation
Start with available cash and calculate:
- Maximum trade size based on cash and margin requirements
- Maximum number of shares you can afford
- Risk assessment if stop loss is provided

## Calculations

### Forward Calculation Formula:
1. **Max Loss** = Account Size × Risk Percentage (default 5%)
2. **Risk Per Share** = |Stop Loss Price - Entry Price|
3. **Max Shares** = Max Loss ÷ Risk Per Share
4. **Trade Value** = Max Shares × Entry Price
5. **Initial Margin Cost** = Trade Value × Margin Requirement
   - Long: 50% margin
   - Short: 100% margin
6. **Affordability Check**: Initial Margin Cost < Excess Liquidity ÷ 2

### Reverse Calculation Formula:
1. **Usable Cash** = Excess Liquidity × Cash Usage Percentage (default 50%)
2. **Max Trade Value** = Usable Cash ÷ Margin Requirement
3. **Max Shares** = Max Trade Value ÷ Entry Price
4. **Risk Check** (if stop loss provided): Max Loss ÷ Account Size ≤ 5%

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Deploy to Vercel

This app is ready to deploy on Vercel! You have two options:

#### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project and deploy.

#### Option 2: Deploy via GitHub (Recommended)

1. Push your code to a GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "Add New Project"

4. Import your GitHub repository

5. Vercel will automatically detect it's a Vite project and configure it correctly

6. Click "Deploy" - that's it!

The app will be live at `https://your-project-name.vercel.app`

**Note:** The `vercel.json` configuration file is included to ensure optimal deployment settings, but Vercel can auto-detect Vite projects without it.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Lucide React** - Icons

## Usage Tips

1. **Forward Calculation**: Use when you know your account size and want to determine the optimal position size for a trade.

2. **Reverse Calculation**: Use when you have a specific amount of cash available and want to know the maximum trade size.

3. **Risk Management**: Always keep risk below 5% of your account size per trade.

4. **Margin Safety**: Keep initial margin cost below 50% of excess liquidity to avoid margin calls.

## License

MIT
