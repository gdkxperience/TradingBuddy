# Calculation Formulas

This document details all calculation formulas used in Trading Buddy.

## Forward Calculation

### Step 1: Calculate Maximum Loss

```
Max Loss = Account Size × (Risk Percentage / 100)
Default Risk Percentage: 5%
```

### Step 2: Calculate Risk Per Share

```
Risk Per Share = |Stop Loss Price - Entry Price|
```

### Step 3: Calculate Maximum Shares

```
Max Shares = Max Loss / Risk Per Share
```

### Step 4: Calculate Trade Value

```
Trade Value = Max Shares × Entry Price
```

### Step 5: Calculate Initial Margin Cost

```
Margin Requirement:
  - Long positions: 50%
  - Short positions: 100%

Initial Margin Cost = Trade Value × Margin Requirement
```

### Step 6: Affordability Check

```
Maximum Allowed Margin = Excess Liquidity / 2

Affordable if: Initial Margin Cost < Maximum Allowed Margin
```

## Reverse Calculation

### Step 1: Calculate Usable Cash

```
Usable Cash = Excess Liquidity × (Cash Usage Percentage / 100)
Default Cash Usage: 50%
```

### Step 2: Calculate Maximum Trade Value

```
Margin Requirement:
  - Long positions: 50%
  - Short positions: 100%

Max Trade Value = Usable Cash / Margin Requirement
```

### Step 3: Calculate Maximum Shares

```
Max Shares = Max Trade Value / Entry Price
```

### Step 4: Calculate Risk (if stop loss provided)

```
Risk Per Share = |Stop Loss Price - Entry Price|
Max Loss = Max Shares × Risk Per Share
```

### Step 5: Risk Assessment (if account size provided)

```
Risk Percentage = (Max Loss / Account Size) × 100

Acceptable if: Risk Percentage ≤ 5%
```

## Margin Requirements

### Long Positions
- **Margin Requirement:** 50%
- **Rationale:** Standard margin for long stock positions
- **Example:** €1,000 trade value requires €500 margin

### Short Positions
- **Margin Requirement:** 100%
- **Rationale:** Higher margin requirement for short positions due to increased risk
- **Example:** €1,000 trade value requires €1,000 margin

## Risk Management Rules

### Maximum Risk Percentage
- **Recommended:** 5% of account size
- **Rationale:** Limits exposure to any single trade
- **Calculation:** Max Loss ≤ Account Size × 0.05

### Cash Usage Limit
- **Recommended:** 50% of excess liquidity
- **Rationale:** Maintains buffer to prevent margin calls
- **Calculation:** Usable Cash ≤ Excess Liquidity × 0.5

### Affordability Threshold
- **Rule:** Initial Margin Cost < 50% of Excess Liquidity
- **Rationale:** Ensures sufficient buffer for market volatility
- **Calculation:** Margin Cost < Excess Liquidity / 2

## Example Calculations

### Forward Calculation Example

**Inputs:**
- Account Size: €10,000
- Risk Percentage: 5%
- Entry Price: €85.00
- Stop Loss Price: €80.00
- Trade Type: Long
- Excess Liquidity: €1,600

**Calculations:**
1. Max Loss = €10,000 × 0.05 = €500
2. Risk Per Share = |€80.00 - €85.00| = €5.00
3. Max Shares = €500 / €5.00 = 100 shares
4. Trade Value = 100 × €85.00 = €8,500
5. Initial Margin Cost = €8,500 × 0.5 = €4,250
6. Max Allowed Margin = €1,600 / 2 = €800
7. Affordable? No (€4,250 > €800)

### Reverse Calculation Example

**Inputs:**
- Excess Liquidity: €1,600
- Cash Usage: 50%
- Entry Price: €85.00
- Trade Type: Short
- Stop Loss Price: €90.00
- Account Size: €10,000

**Calculations:**
1. Usable Cash = €1,600 × 0.5 = €800
2. Max Trade Value = €800 / 1.0 = €800 (100% margin for short)
3. Max Shares = €800 / €85.00 = 9.41 ≈ 9 shares
4. Risk Per Share = |€90.00 - €85.00| = €5.00
5. Max Loss = 9 × €5.00 = €45
6. Risk Percentage = (€45 / €10,000) × 100 = 0.45%
7. Acceptable? Yes (0.45% < 5%)

---

**Last Updated:** 2025-01-27
