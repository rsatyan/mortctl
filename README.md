# mortctl

Mortgage underwriting calculations and eligibility. Part of the **LendCtl Suite**.

## Features

- **LTV Calculation** — LTV, CLTV, HCLTV with PMI estimates
- **Program Eligibility** — Conventional, FHA, VA, USDA, Jumbo
- **Payment Breakdown** — Full PITI calculation
- **Loan Limits** — 2026 conforming limits by county
- **PMI Estimation** — Based on LTV and credit score

## Installation

```bash
npm install -g mortctl
```

Or use directly with npx:

```bash
npx mortctl --help
```

## Quick Start

### Calculate LTV

```bash
mortctl ltv --property-value 400000 --down-payment 80000
```

Output:
```
═══════════════════════════════════════════════════════════════
LTV CALCULATION
═══════════════════════════════════════════════════════════════

Property Value:     $400,000
Loan Amount:        $320,000
Down Payment:       $80,000 (20.0%)

LTV RATIOS
───────────────────────────────────────────────────────────────
LTV:                80.00%

PMI:                Not required (LTV ≤ 80%)
═══════════════════════════════════════════════════════════════
```

### Check Program Eligibility

```bash
mortctl eligible \
  --property-value 400000 \
  --loan-amount 380000 \
  --credit-score 720
```

Output:
```
═══════════════════════════════════════════════════════════════
LOAN PROGRAM ELIGIBILITY
═══════════════════════════════════════════════════════════════

Property Value:     $400,000
Loan Amount:        $380,000
LTV:                95.0%
Credit Score:       720

PROGRAM ELIGIBILITY
───────────────────────────────────────────────────────────────
✓ CONVENTIONAL    
    Min down: $12,000
    ⚠ LTV >95% requires additional eligibility criteria

✓ FHA             
    Min down: $14,000

✗ VA              
    ✗ VA loans require veteran/military eligibility

✗ USDA            
    ✗ USDA loans require rural/eligible suburban location

✗ JUMBO           
    ✗ Loan amount is within conforming limits - use conventional

───────────────────────────────────────────────────────────────
💡 RECOMMENDED: FHA
═══════════════════════════════════════════════════════════════
```

### Calculate Monthly Payment

```bash
mortctl payment \
  --loan-amount 320000 \
  --rate 6.5 \
  --property-value 400000
```

### Show Loan Limits

```bash
# Baseline limits
mortctl limits

# Specific county
mortctl limits --county "Los Angeles" --state CA

# List all high-cost counties
mortctl limits --list-high-cost
```

## Commands

### `mortctl ltv`
Calculate loan-to-value ratios with PMI estimates.

Options:
- `--property-value <amount>` - Property value (required)
- `--loan-amount <amount>` - Loan amount
- `--down-payment <amount>` - Down payment (alternative to loan-amount)
- `--second-lien <amount>` - Second mortgage amount
- `--heloc <amount>` - HELOC amount
- `--credit-score <score>` - Credit score for PMI estimate

### `mortctl eligible`
Check eligibility for all loan programs.

Options:
- `--property-value <amount>` - Property value (required)
- `--loan-amount <amount>` - Loan amount (required)
- `--credit-score <score>` - Credit score (required)
- `--property-type <type>` - single-family, condo, etc.
- `--occupancy <type>` - primary, second-home, investment
- `--veteran` - Veteran/military eligibility
- `--rural` - Rural/USDA eligible location

### `mortctl payment`
Calculate monthly payment with full PITI breakdown.

Options:
- `--loan-amount <amount>` - Loan amount (required)
- `--rate <percent>` - Interest rate (required)
- `--term <years>` - Loan term (default: 30)
- `--property-value <amount>` - For tax/insurance estimates
- `--taxes <amount>` - Annual property taxes
- `--insurance <amount>` - Annual homeowners insurance
- `--hoa <amount>` - Monthly HOA dues

### `mortctl limits`
Show conforming loan limits.

Options:
- `--county <name>` - County name
- `--state <abbr>` - State abbreviation
- `--units <n>` - Number of units (1-4)
- `--list-high-cost` - List all high-cost counties

## Programmatic Usage

```typescript
import { 
  calculateLtv, 
  calculatePmi, 
  calculatePaymentBreakdown,
  checkAllEligibility,
  findBestProgram,
  getConformingLimit 
} from 'mortctl';

// Calculate LTV
const ltv = calculateLtv(400000, 320000);
console.log(`LTV: ${ltv.ltv}%, PMI required: ${ltv.pmiRequired}`);

// Calculate PMI
const pmi = calculatePmi({ ltv: 95, creditScore: 720, loanAmount: 380000 });
console.log(`Monthly PMI: $${pmi.monthlyAmount}`);

// Check eligibility
const eligibility = checkAllEligibility({
  propertyValue: 400000,
  loanAmount: 380000,
  creditScore: 720,
  // ... other scenario options
});
const recommended = findBestProgram(eligibility);
console.log(`Recommended program: ${recommended}`);

// Get loan limits
const limit = getConformingLimit('Los Angeles, CA', 1);
console.log(`Conforming limit: $${limit}`);
```

## 2026 Loan Limits

| Type | Limit |
|------|-------|
| Conforming (baseline) | $766,550 |
| High-cost ceiling | $1,149,825 |
| FHA floor | $498,257 |
| FHA ceiling | $1,149,825 |

Multi-unit multipliers:
- 2-unit: 1.28x baseline
- 3-unit: 1.55x baseline
- 4-unit: 1.92x baseline

## PMI Rate Factors

PMI rates vary by:
- **LTV**: Higher LTV = higher rate
- **Credit Score**: Higher score = lower rate
- **Property Type**: Single-family vs condo
- **Occupancy**: Primary vs investment

Typical range: 0.15% - 1.40% annually

## Part of LendCtl Suite

mortctl works with other LendCtl tools:

```bash
# Full underwriting workflow
finctl analyze -f borrower.json | \
  creditctl analyze --stdin | \
  mortctl eligible --stdin
```

## License

Apache-2.0 © Satyan Avatara
