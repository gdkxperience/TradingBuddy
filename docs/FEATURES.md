# Features Specification

## Forward Calculation Mode

Calculates position size starting from account parameters.

### Inputs
- Account size
- Risk percentage (default: 5%)
- Entry price
- Stop loss price
- **Target price** (optional) - For R-Multiple calculation
- Trade type (Long/Short)
- Excess liquidity

### Outputs
- Maximum loss amount
- Risk per share
- Maximum number of shares
- Trade value (position size)
- Initial margin cost
- Affordability assessment
- **R-Multiple (Risk:Reward Ratio)** - Dynamic calculation based on target price
- **Potential profit** - Calculated from target price
- **Visual warning** - Alerts if Risk:Reward ratio is less than 1:2

## Reverse Calculation Mode

Calculates maximum trade size starting from available cash.

### Inputs
- Excess liquidity
- Cash usage percentage (default: 50%)
- Entry price
- Trade type (Long/Short)
- Optional: Stop loss price
- Optional: Account size (for risk assessment)

### Outputs
- Usable cash amount
- Maximum trade value
- Maximum number of shares
- Risk per share (if stop loss provided)
- Maximum loss (if stop loss provided)
- Risk assessment (if account size provided)

## Risk Management Features

- Automatic risk percentage validation (recommends max 5%)
- Margin requirement calculations
- Affordability checks based on excess liquidity
- Visual indicators for safe/risky trades

## R-Multiple Simulator (Risk:Reward Ratio)

### Overview
Visualizes the payoff and calculates the Risk:Reward ratio dynamically based on target price.

### Features
- **Target Price Input**: Optional field to set profit target
- **Dynamic R-Multiple Calculation**: Calculates Risk:Reward ratio in real-time
- **Visual Payoff Display**: Shows potential profit vs. maximum loss
- **Smart Warnings**: 
  - Red warning if R-Multiple < 1:2 (e.g., "Bad Bet. Find a better entry.")
  - Green indicator if R-Multiple ≥ 1:2
- **R-Multiple Display**: Shows ratio in format "1:R" (e.g., "1:2.5")

### Calculation
```
Risk = |Entry Price - Stop Loss Price|
Reward = |Target Price - Entry Price|
R-Multiple = Reward / Risk

Example:
- Entry: €85.00
- Stop Loss: €80.00
- Target: €95.00
- Risk = €5.00
- Reward = €10.00
- R-Multiple = 1:2.0 ✅ Good trade
```

### Business Rules
- **Minimum R-Multiple**: 1:2 (recommended)
- **Warning Threshold**: R-Multiple < 1:2 triggers red warning
- **Display Format**: Shows as "1:R" ratio (e.g., "1:2.5" means risking €1 to make €2.50)

## Account Heat Dashboard (Portfolio Risk)

### Overview
The Account Heat Dashboard provides a portfolio-level view of risk by aggregating all open positions. This prevents the common mistake of opening multiple "safe" trades that correlate and blow up your account together.

### Features

#### A. Open Positions List
- **Display**: Simple list showing all trades with status "open"
- **Columns**:
  - Ticker Symbol
  - Direction (Long/Short)
  - Risk Amount ($)
  - Position Size (shares)

#### B. Total Heat Calculation
- **Formula**: `Total Heat = Sum(Risk of all open positions) / Account Balance`
- **Display**: Shows total heat as a percentage (e.g., "4.2%")
- **Visual Indicators**:
  - Green: Total Heat ≤ 6% (Safe)
  - Yellow: Total Heat 4-6% (Caution)
  - Red: Total Heat > 6% (Danger - New Trade button disabled)

#### C. Risk Aggregation Logic
- Sums up the Risk ($) of all open trades
- Example: Short RKLB (-€50) + Long VICR (-€30) = Total Risk: €80
- If Account Balance = €10,000, then Total Heat = 0.8%

#### D. New Trade Protection
- **Edge Case Prevention**: If Total Heat > 6%, the "Save to Journal" button is disabled
- **User Feedback**: Clear message explaining why new trades are blocked
- **Rationale**: Prevents opening 10 "safe" trades that correlate and blow up your account together

### Business Rules

**Total Heat Thresholds:**
- **Safe Zone**: ≤ 4% - Green indicator, all features enabled
- **Caution Zone**: 4-6% - Yellow indicator, warning displayed
- **Danger Zone**: > 6% - Red indicator, "Save to Journal" button disabled

**Risk Calculation:**
- Only includes trades with status "open"
- Uses `riskAmount` field from journal entries
- If `riskAmount` is null/unknown, that trade is excluded from total (with warning)

### User Flow

1. **View Dashboard**: User sees Account Heat Dashboard above or below Journal
2. **See Open Positions**: List shows all active trades with their individual risks
3. **Monitor Total Heat**: Real-time calculation shows current portfolio risk
4. **Attempt New Trade**: User calculates a new position
5. **Check Heat**: If Total Heat > 6%, "Save to Journal" button is disabled
6. **User Action**: User must close existing positions before opening new ones

### Edge Cases

**Missing Account Balance:**
- If account balance is not set, Total Heat cannot be calculated
- Dashboard shows: "Set account size to view portfolio risk"
- New Trade button remains enabled (no protection without account balance)

**Unknown Risk Amounts:**
- Trades without riskAmount (e.g., from Reverse Calculation without stop loss) are excluded
- Warning displayed: "X trades excluded (no risk defined)"

**No Open Positions:**
- Dashboard shows: "No open positions. Total Heat: 0%"
- All features enabled

### Technical Implementation

**Component**: `AccountHeatDashboard`
- Reads from journal entries (localStorage)
- Filters entries where `status === 'open'`
- Calculates sum of `riskAmount` fields
- Divides by account balance (from Forward Calculation inputs or separate setting)

**Integration Points:**
- Reads account balance from Forward Calculation inputs (`accountSize`)
- Monitors journal entries for changes
- Updates in real-time when trades are opened/closed

## Drawdown Simulator (Reality Check)

### Overview
The Drawdown Simulator provides a "What If" scenario calculator to visualize the worst-case scenario of consecutive losses. This helps traders understand if their risk sizing is too aggressive by showing the actual account balance after losing multiple trades in a row.

### Features

#### A. What If Toggle
- **Location**: Toggle switch in the Account Heat Dashboard
- **Function**: Enables/disables the drawdown simulation
- **Default**: Off (hidden until enabled)

#### B. Drawdown Calculation
- **Scenario**: "If I lose my next 5 trades in a row, what is my balance?"
- **Formula**: 
  ```
  Remaining Balance = Current Balance - (Number of Losses × Average Risk Per Trade)
  ```
- **Inputs**:
  - Current Account Balance (from calculator inputs)
  - Number of consecutive losses (default: 5, configurable)
  - Average Risk Per Trade (calculated from recent trades or user input)

#### C. Visual Display
- **Current Balance**: Shows starting balance prominently
- **After X Losses**: Shows calculated remaining balance
- **Drawdown Amount**: Shows total amount lost
- **Drawdown Percentage**: Shows percentage of account lost
- **Visual Warning**: Red indicator if drawdown exceeds safe thresholds

#### D. Risk Assessment
- **Safe Zone**: Drawdown < 10% of account (e.g., €2,600 → €2,340)
- **Caution Zone**: Drawdown 10-20% (e.g., €2,600 → €2,080)
- **Danger Zone**: Drawdown > 20% (e.g., €2,600 → €1,820)

### Business Rules

**Default Settings:**
- Number of consecutive losses: 5 trades
- Risk calculation: Uses average risk from recent trades, or default 2% per trade

**Risk Calculation Methods:**
1. **From Recent Trades**: Average of risk amounts from last 10 trades
2. **From Account Balance**: Uses risk percentage (default 2%) × account balance
3. **Manual Input**: User can override with custom risk amount

**Visual Indicators:**
- **Green**: Drawdown < 10% - Acceptable risk
- **Yellow**: Drawdown 10-20% - Caution, consider reducing position sizes
- **Red**: Drawdown > 20% - Too aggressive, reduce risk per trade

### User Flow

1. **Enable Simulator**: User toggles "What If" switch in dashboard
2. **View Current Balance**: Sees starting account balance
3. **See Drawdown**: Calculates and displays balance after 5 consecutive losses
4. **Assess Risk**: Visual indicator shows if risk sizing is acceptable
5. **Adjust Strategy**: If drawdown is too high, user reduces risk per trade

### Example Scenarios

**Scenario 1: Conservative Risk (2% per trade)**
- Starting Balance: €2,600
- Risk Per Trade: €52 (2%)
- After 5 Losses: €2,600 - (5 × €52) = €2,340
- Drawdown: €260 (10%)
- **Result**: ✅ Acceptable risk

**Scenario 2: Aggressive Risk (5% per trade)**
- Starting Balance: €2,600
- Risk Per Trade: €130 (5%)
- After 5 Losses: €2,600 - (5 × €130) = €1,950
- Drawdown: €650 (25%)
- **Result**: ⚠️ Too aggressive, reduce risk

### Edge Cases

**No Account Balance:**
- Simulator shows: "Set account size to use drawdown simulator"
- Toggle remains disabled

**No Recent Trades:**
- Uses default risk percentage (2% of account balance)
- Shows message: "Using default 2% risk per trade"

**Insufficient Balance:**
- If calculated drawdown would result in negative balance
- Shows warning: "Risk per trade too high for account size"

### Technical Implementation

**Component**: `DrawdownSimulator`
- Toggle to show/hide simulator
- Input for number of consecutive losses (default: 5)
- Calculates average risk from recent trades or uses default
- Displays visual comparison of before/after balance
- Color-coded risk assessment

**Integration Points:**
- Reads account balance from Forward Calculation inputs
- Optionally reads risk amounts from recent journal entries
- Updates when account balance changes

## Trade Checklist Gatekeeper

### Overview
An optional checklist modal that appears after clicking "Save to Journal". This acts as a digital circuit breaker for impulse trades, forcing traders to follow rules before saving trades. The feature can be enabled or disabled in Settings.

### Features

#### A. Post-Save Checklist Modal
- **Trigger**: Appears after clicking "Save to Journal" button (if enabled)
- **Purpose**: Gatekeeper that prevents saving trades until checklist is complete
- **Behavior**: Results are always visible; checklist appears only when saving
- **Settings**: Can be enabled/disabled from Settings page

#### B. Three-Phase Checklist Structure

**Phase 1: The Setup (Technical)**

1. **Trend Confirmation**
   - **Rule**: Is the price above the EMA 25 (for Longs) or below it (for Shorts)?
   - **Why**: Keeps you from fighting the immediate trend. "The trend is your friend."
   - **Checkbox**: "Price is above EMA 25 (Long) or below EMA 25 (Short)"

2. **No Resistance / Support Traffic**
   - **Rule**: Is there at least 2:1 room to the next major support/resistance level?
   - **Why**: Prevents buying right into a ceiling (Resistance) or shorting right into a floor (Support).
   - **Checkbox**: "At least 2:1 room to next major support/resistance level"

3. **Volume Validation**
   - **Rule**: Is volume (or OBV) confirming the move? (e.g., Rising volume on breakout).
   - **Why**: Filters out "fakeouts" and low-quality moves that are likely to reverse.
   - **Checkbox**: "Volume/OBV confirms the move"

**Phase 2: The Math (Risk)**

4. **The Golden Ratio (1:2+)**
   - **Rule**: Is the Potential Profit (Target - Entry) at least 2x the Risk (Entry - Stop)?
   - **Why**: Mathematical survival. You can be wrong 60% of the time and still make money if you follow this rule.
   - **Checkbox**: "Risk:Reward ratio is at least 1:2"
   - **Auto-validation**: If target price is provided, automatically checks if R-Multiple ≥ 2.0

5. **Stop Loss Logic**
   - **Rule**: Is the stop loss placed at a technical invalidation point (e.g., below a swing low), not just an arbitrary dollar amount?
   - **Why**: Prevents "fear stops" where you exit just before the trade works.
   - **Checkbox**: "Stop loss is at a technical invalidation point (not arbitrary)"

**Phase 3: The Mind (Psychology)**

6. **No FOMO / Revenge**
   - **Rule**: Am I entering this trade because the setup is perfect, or because I'm bored/angry/trying to make back a loss?
   - **Why**: Filters out emotional impulse trades, which account for 90% of large losses.
   - **Checkbox**: "I'm entering because the setup is perfect, not due to emotion"

7. **Event Awareness**
   - **Rule**: Have I checked for Earnings, Fed announcements, or major news in the next 24 hours?
   - **Why**: Prevents getting gapped overnight by a binary event (like your GLUE trade during an offering).
   - **Checkbox**: "I've checked for earnings/news/events in next 24 hours"

#### C. Save Flow Logic
- **When Enabled**: Clicking "Save to Journal" opens checklist modal first
- **When Disabled**: Clicking "Save to Journal" goes directly to Trade Details modal
- **After Checklist Complete**: Proceeds to Trade Details modal to save trade
- **Visual Indicator**: Progress bar showing X/7 items completed
- **Auto-validation**: Some items (like R-Multiple) are auto-checked if conditions are met
- **Cancel Option**: User can cancel and return to calculator without saving

### Business Rules

**Optional Completion (When Enabled):**
- All 7 checklist items must be checked before proceeding to save trade
- Cannot proceed to Trade Details modal until checklist is complete
- Checklist resets for each new save attempt

**Settings Control:**
- **Default**: Checklist Gatekeeper is enabled by default
- **Location**: Settings page (accessible from navigation)
- **Toggle**: Users can enable/disable the feature at any time
- **Persistence**: Setting is saved to localStorage

**Auto-Validation:**
- **R-Multiple Check**: Automatically checked if target price is provided and R-Multiple ≥ 2.0
- **Stop Loss Check**: Can be auto-checked if stop loss is provided (user still needs to confirm it's technical)

**User Experience:**
- Modal can be cancelled to return to calculator
- Clear visual feedback on progress
- Explanations shown for each rule
- Results are always visible (no blocking)

### User Flow

**When Checklist is Enabled:**
1. **Calculate Position**: User enters all calculation inputs
2. **View Results**: Results are immediately visible (no blocking)
3. **Click Save**: User clicks "Save to Journal" button
4. **Checklist Modal Appears**: Modal pops up before saving
5. **Review Checklist**: User goes through 7 items, checking each one
6. **Auto-Validation**: Some items auto-check based on calculation data
7. **Complete Checklist**: User checks remaining items manually
8. **Continue to Save**: Once all 7 items are checked, proceeds to Trade Details modal
9. **Save Trade**: User completes trade details and saves to journal

**When Checklist is Disabled:**
1. **Calculate Position**: User enters all calculation inputs
2. **View Results**: Results are immediately visible
3. **Click Save**: User clicks "Save to Journal" button
4. **Trade Details Modal**: Opens directly without checklist
5. **Save Trade**: User completes trade details and saves to journal

### Edge Cases

**Missing Target Price:**
- R-Multiple item cannot be auto-validated
- User must manually check if they've verified the risk:reward ratio

**No Stop Loss:**
- Stop Loss Logic item cannot be auto-validated
- User must confirm they understand the risk

**Checklist Disabled:**
- Feature is bypassed completely
- Save flow proceeds directly to Trade Details modal
- Setting persists across sessions

**User Cancels Checklist:**
- Returns to calculator view
- No trade is saved
- Toast notification confirms cancellation

**First-Time Users:**
- Tooltips/explanations help users understand each rule
- Modal includes "Why" explanations for each item
- Default setting is enabled (recommended)

### Technical Implementation

**Component**: `TradeChecklistModal`
- Modal that appears after "Save to Journal" click (if enabled)
- 7 checkboxes organized in 3 phases
- Progress indicator (X/7 completed)
- Auto-validation for calculable items
- Cancel button to return without saving

**Settings Management**:
- `src/lib/settings.ts`: Utility functions for managing preferences
- `src/components/Settings.tsx`: Settings UI component
- Stored in localStorage with key `trading-buddy-settings`
- Default: `checklistGatekeeperEnabled: true`

**Integration Points:**
- Triggered in `handleSaveToJournal` (app/page.tsx)
- Checks `isChecklistGatekeeperEnabled()` before showing modal
- Receives calculation data for auto-validation
- Proceeds to Trade Details modal after completion
- Results are always visible (no blocking)

**State Management:**
- Checklist completion state stored in page component
- Resets after each save attempt
- Settings persist across sessions via localStorage

## Smart Save & Journal Feature

### Overview
Seamlessly save calculated trades to a personal trading journal with one click, collecting missing context (ticker, strategy) before saving.

### Features

#### A. Smart Save Button
- **Location**: Prominent primary button "Save to Journal" at bottom of Calculation Results card
- **State**: Disabled until valid calculation (Max Shares > 0)
- **Action**: Opens "Complete Trade Details" modal

#### B. Complete Trade Details Modal
Collects missing metadata that calculator doesn't track:

**Pre-filled Data (Read-Only):**
- Entry Price (from calculator)
- Stop Loss (from calculator)
- Position Size (calculated result)
- Risk Amount (calculated result)
- Direction (Long/Short)

**Required User Inputs:**
- **Ticker Symbol**: Text input, auto-capitalized (e.g., "TSLA", "AAPL")
- **Setup Type**: Dropdown selection
  - Options: "Breakout", "Pullback", "Reversal", "Gap Fill", "Trend Following", "Other"
- **Validation**: Save button disabled until both fields are filled

#### C. Journal Storage
- **Storage**: Browser LocalStorage (persists across sessions)
- **Data Structure**: Combines Calculator Data + Modal Inputs + Metadata
  - Timestamp
  - Unique ID
  - Status: "Open" (default)
- **Format**: JSON array of trade entries

#### D. Journal View
- **Location**: New section/tab below calculator area
- **Display**: Data table showing recent entries
- **Columns**: 
  - Date/Time
  - Ticker (badge style)
  - Setup Type (badge style)
  - Direction (Long/Short indicator)
  - Position Size (shares)
  - Risk Amount (styled in red, e.g., "-€50.00")
  - Status (badge: Open/Closed)
- **Features**:
  - Sortable columns
  - Filter by status
  - Delete entries
  - Visual indicators for risk amounts

### User Flow

1. **Calculate**: User enters Entry (€100) & Stop (€95) → App shows "Size: 200 Shares"
2. **Click Save**: User clicks "Save to Journal" button
3. **Modal Opens**: Shows pre-filled data "200 Shares @ €100"
4. **Input**: User types "AAPL" and selects "Pullback" from dropdown
5. **Confirm**: User hits Enter or clicks "Save"
6. **Feedback**: Modal closes, "Trade Saved" toast notification appears
7. **Verify**: New row appears instantly in Journal Table below

### Edge Cases

**Missing Stop Loss:**
- If user is in "Reverse Calculation" mode without stop loss
- Modal shows warning: "No risk defined. Saving this trade with Risk = Unknown."
- Trade still saves, but Risk Amount shows as "Unknown"

**Duplicate Entry:**
- If user clicks "Save" twice for same calculation
- System treats as new trade (scaling in)
- Warning toast: "Similar active trade exists for [TICKER]"

**Data Validation:**
- Ticker must be 1-10 characters (alphanumeric)
- Setup Type must be selected from dropdown
- All pre-filled data is read-only and cannot be modified

### Technical Implementation

**LocalStorage Key**: `trading-buddy-journal`

**Trade Entry Structure**:
```typescript
{
  id: string (cuid/uuid)
  timestamp: Date (ISO string)
  ticker: string
  setupType: string
  entryPrice: number
  stopLossPrice: number | null
  positionSize: number (shares)
  riskAmount: number | null
  direction: "long" | "short"
  status: "open" | "closed"
  // Additional calculated fields
  tradeValue?: number
  rMultiple?: number
}
```

## User Flows

### Forward Calculation Flow

1. User selects "Forward Calculation" mode
2. User enters:
   - Account Size (e.g., €10,000)
   - Risk Percentage (default: 5%)
   - Entry Price (e.g., €85.00)
   - Stop Loss Price (e.g., €80.00)
   - Trade Type (Long/Short)
   - Excess Liquidity (e.g., €1,600)
3. Application calculates in real-time:
   - Maximum loss
   - Risk per share
   - Maximum shares
   - Trade value
   - Initial margin cost
4. Application displays affordability status
5. User reviews results and adjusts inputs if needed

### Reverse Calculation Flow

1. User selects "Reverse Calculation" mode
2. User enters:
   - Excess Liquidity (e.g., €1,600)
   - Cash Usage Percentage (default: 50%)
   - Entry Price (e.g., €85.00)
   - Trade Type (Long/Short)
   - Optional: Stop Loss Price
   - Optional: Account Size
3. Application calculates:
   - Usable cash
   - Maximum trade value
   - Maximum shares
   - Risk metrics (if stop loss provided)
4. Application displays risk assessment (if account size provided)
5. User reviews results

## Validation Rules

### Input Validation

**Required Fields (Forward Mode):**
- Account Size: Must be > 0
- Risk Percentage: Must be > 0 and ≤ 100
- Entry Price: Must be > 0
- Stop Loss Price: Must be > 0 and ≠ Entry Price
- Excess Liquidity: Must be > 0

**Required Fields (Reverse Mode):**
- Excess Liquidity: Must be > 0
- Cash Usage Percentage: Must be > 0 and ≤ 100
- Entry Price: Must be > 0

**Optional Fields (Reverse Mode):**
- Stop Loss Price: If provided, must be > 0 and ≠ Entry Price
- Account Size: If provided, must be > 0

### Business Rules

**Risk Management:**
- Recommended maximum risk: 5% of account size
- Warning displayed if risk exceeds 5%

**Margin Management:**
- Long positions: 50% margin requirement
- Short positions: 100% margin requirement
- Margin cost must be < 50% of excess liquidity to be affordable

**Cash Usage:**
- Recommended cash usage: 50% of excess liquidity
- Prevents margin calls by keeping buffer

## Error Handling

### Calculation Errors

**Invalid Inputs:**
- Missing required fields: Results not displayed
- Invalid numeric values: Parsed as NaN, results not displayed
- Division by zero: Handled gracefully (e.g., risk per share = 0)

**Edge Cases:**
- Stop loss equals entry price: Risk per share = 0, max shares = 0
- Negative values: Handled by absolute value calculations
- Very large numbers: Handled by JavaScript number limits

### User Feedback

**Empty State:**
- Message: "Fill in all fields to see calculations"
- Icon: TrendingUp (neutral)

**Invalid State:**
- No error messages displayed
- Results simply not shown until valid inputs provided

## Trading Dashboard (Cockpit View)

### Overview
The Trading Dashboard is a comprehensive "Cockpit" view that shows account health, exposure, and next moves at a single glance. It's organized into 5 priority zones to prevent information overload and focus on what matters most.

### Layout Structure

The dashboard uses a CSS Grid layout:
- **Zone 1**: Full width at top (Kill Switch Bar)
- **Zone 2 & 3**: Split middle (Open Positions right, Calculator left)
- **Zone 4 & 5**: Split bottom (Watchlist left, Performance right)

### Zone 1: The "Kill Switch" (Top Bar / Header)

**Purpose**: Immediate Account Health Checks. If these are Red, stop trading.

#### Components:

**Net Liquidation Value**
- Display: Large, bold number (e.g., €2,678)
- Source: Account balance from calculator inputs
- Updates: Real-time when account balance changes

**Excess Liquidity Gauge**
- Visual: Progress bar with color coding
- Thresholds:
  - **Green**: > €1,000 (Safe)
  - **Yellow**: €500 - €1,000 (Caution)
  - **Red**: < €500 (Danger - Stop trading)
- Why: Prevents margin calls by monitoring available liquidity
- Updates: From Forward Calculation `excessLiquidity` input

**Day P&L (Profit & Loss)**
- Display: +€45 / -€120 with trend icon
- Color coding:
  - Green for positive
  - Red for negative
- Tilt Limit: Shows warning if Day P&L < -€100
- Why: Tracks "Tilt" limit to prevent emotional trading after losses
- Note: Currently placeholder (requires broker API integration for real-time data)

**Open Risk (Account Heat)**
- Display: Percentage (e.g., "1.8% Risked")
- Calculation: Sum of all stop losses vs. account balance
- Color coding:
  - Green: ≤ 4% (Safe)
  - Yellow: 4-6% (Caution)
  - Red: > 6% (Danger - Stop trading)
- Why: Prevents over-leveraging across multiple trades
- Updates: Real-time from Account Heat Dashboard calculation

**Kill Switch Alert**
- Appears when any critical threshold is breached:
  - Excess Liquidity < €500
  - Day P&L < -€100
  - Account Heat > 6%
- Visual: Red border, warning message
- Action: User should stop trading immediately

### Zone 2: Open Positions (The "Active Battle")

**Purpose**: Table showing all currently held positions with real-time P&L tracking.

#### Table Columns:

**Ticker**: Stock symbol (e.g., VICR, RKLB)

**Side**: Long (green) or Short (red) with directional icon

**Size**: Number of shares

**Entry**: Entry price (€)

**Current**: Current price (€) - Editable input field
- Users can manually update current price to see live P&L
- In production, this would integrate with broker API

**P&L**: Profit/Loss in euros
- Color coded (green for profit, red for loss)
- Calculated: `(Current Price - Entry Price) × Position Size × Direction`

**R-Multiple**: Risk units (e.g., +1.5R, -0.3R)
- **Key Feature**: Shows performance in "Units of Risk" instead of dollars
- Calculation: `P&L / Risk Amount`
- Why: Detaches trader from money, focuses on risk management
- Color coded (green for positive, red for negative)

**Action**: Close button
- Closes position (sets status to 'closed')
- Updates dashboard metrics

#### Features:
- Real-time P&L calculation as current price changes
- R-Multiple display for risk-focused performance tracking
- One-click position closing
- Empty state when no open positions

### Zone 3: The "Trade Calculator" (The Workhorse)

**Purpose**: Where traders spend 80% of their time calculating position sizes.

This is the existing Calculator View integrated into the dashboard layout.

#### Features:
- Forward and Reverse calculation modes
- Dynamic outputs (Max Shares, Risk, Reward, Ratio)
- Trade Checklist Gatekeeper integration
- Save to Journal functionality

### Zone 4: Watchlist / Plan (Bottom Panel)

**Purpose**: Your "Menu" for the day - prevents random stock searching during market hours.

#### Format:
Each watchlist item contains:
- **Ticker**: Stock symbol
- **Setup**: Setup type (Breakout, Pullback, Reversal, Gap Fill, Trend Following, Other)
- **Trigger Price**: Price level to watch (€)
- **Notes**: Additional context (e.g., "Wait for 4H close")

#### Features:
- Add new setups with form
- Delete items
- Persistent storage (localStorage)
- Empty state with call-to-action

#### Business Rules:
- Only trade what's on the watchlist
- Prevents impulsive trades during market hours
- Helps maintain trading discipline

### Zone 5: Performance / Psychology (Side Panel)

**Purpose**: Track trading performance and mental state.

#### Components:

**Win Rate (Last 20 Trades)**
- Display: Percentage (e.g., "60%")
- Calculation: Wins / Total closed trades (last 20)
- Updates: When trades are closed
- Empty state: "No closed trades yet"

**Average R-Multiple**
- Display: Average R-Multiple (e.g., "+1.8R")
- Calculation: Sum of R-Multiples / Count (last 20 trades)
- Color coding:
  - Green for positive
  - Red for negative
- Why: Measures risk-adjusted performance

**Mental State Check**
- Dropdown selection:
  - Calm
  - Focused
  - Anxious
  - Greedy
  - Tilted
- Color coding:
  - Green: Calm, Focused
  - Yellow: Greedy
  - Red: Anxious, Tilted
- Warning: Shows alert if state is "Tilted"
- Persistent: Saves to localStorage
- Why: Self-awareness prevents emotional trading

### User Flow

1. **Open Dashboard**: User navigates to Dashboard view
2. **View Kill Switch**: Check all health metrics at top
3. **Review Positions**: See open positions and current P&L
4. **Calculate Trade**: Use calculator to size new position
5. **Check Watchlist**: Review planned setups before trading
6. **Monitor Performance**: Track win rate and mental state
7. **Take Action**: Close positions or add new trades based on dashboard data

### Technical Implementation

**Components**:
- `KillSwitchBar`: Zone 1 - Health metrics
- `OpenPositionsTable`: Zone 2 - Active positions
- `CalculatorView`: Zone 3 - Position sizing (existing)
- `WatchlistPanel`: Zone 4 - Planned setups
- `PerformancePanel`: Zone 5 - Stats and psychology
- `TradingDashboard`: Main layout component

**Data Sources**:
- Account balance: From calculator inputs
- Excess liquidity: From Forward Calculation inputs
- Open positions: Journal entries with status 'open'
- Account heat: Calculated from open positions' risk amounts
- Performance: Calculated from closed journal entries
- Watchlist: localStorage
- Mental state: localStorage

**State Management**:
- Dashboard refreshes when `refreshTrigger` changes
- Positions update when journal entries change
- Metrics recalculate on account balance changes

### Edge Cases

**No Account Balance**:
- Net Liquidation Value shows "N/A"
- Account Heat shows "N/A"
- Excess Liquidity shows "N/A"

**No Open Positions**:
- Open Positions table shows empty state
- Account Heat = 0%

**No Closed Trades**:
- Win Rate shows "N/A"
- Average R-Multiple shows "N/A"
- Message: "No closed trades yet"

**Missing Current Prices**:
- Uses entry price as default
- User can manually update current price
- P&L and R-Multiple calculated from entry price until updated

**Kill Switch Active**:
- Red border around Kill Switch Bar
- Warning message displayed
- User should stop trading

### Future Enhancements

**Broker API Integration**:
- Real-time price updates for open positions
- Automatic Day P&L calculation
- Net Liquidation Value from broker
- Excess Liquidity from broker

**Advanced Features**:
- Historical performance charts
- Trade analysis and statistics
- Risk metrics over time
- Alert system for kill switch triggers

---

**Last Updated:** 2025-01-27
