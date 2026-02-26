import {
  calculateLtv,
  calculatePmi,
  calculateMonthlyPayment,
  calculatePaymentBreakdown,
  getConformingLimit,
  calculateFhaMip,
  calculateVaFundingFee,
  LOAN_LIMITS_2026,
} from '../src/lib/calculations';
import { LoanScenario } from '../src/types';

describe('calculateMonthlyPayment', () => {
  it('should calculate correct P&I for 30-year loan', () => {
    const payment = calculateMonthlyPayment(300000, 6.5, 30);
    expect(payment).toBeCloseTo(1896.20, 0);
  });

  it('should calculate correct P&I for 15-year loan', () => {
    const payment = calculateMonthlyPayment(300000, 6.0, 15);
    expect(payment).toBeCloseTo(2531.57, 0);
  });

  it('should handle 0% interest', () => {
    const payment = calculateMonthlyPayment(120000, 0, 30);
    expect(payment).toBeCloseTo(333.33, 0);
  });
});

describe('calculateLtv', () => {
  it('should calculate LTV correctly', () => {
    const result = calculateLtv(400000, 320000);
    expect(result.ltv).toBe(80);
    expect(result.pmiRequired).toBe(false);
  });

  it('should identify PMI required above 80%', () => {
    const result = calculateLtv(400000, 380000);
    expect(result.ltv).toBe(95);
    expect(result.pmiRequired).toBe(true);
  });

  it('should calculate CLTV with second lien', () => {
    const result = calculateLtv(400000, 320000, 40000);
    expect(result.ltv).toBe(80);
    expect(result.cltv).toBe(90);
  });

  it('should calculate HCLTV with HELOC', () => {
    const result = calculateLtv(400000, 320000, 0, 50000);
    expect(result.ltv).toBe(80);
    expect(result.hcltv).toBe(92.5);
  });
});

describe('calculatePmi', () => {
  it('should return no PMI for 80% LTV', () => {
    const result = calculatePmi({ ltv: 80, creditScore: 720, loanAmount: 320000 });
    expect(result.required).toBe(false);
    expect(result.monthlyAmount).toBe(0);
  });

  it('should calculate PMI for 95% LTV', () => {
    const result = calculatePmi({ ltv: 95, creditScore: 720, loanAmount: 380000 });
    expect(result.required).toBe(true);
    expect(result.monthlyAmount).toBeGreaterThan(0);
    expect(result.cancellationLtv).toBe(78);
  });

  it('should have lower PMI for higher credit scores', () => {
    const low = calculatePmi({ ltv: 90, creditScore: 680, loanAmount: 360000 });
    const high = calculatePmi({ ltv: 90, creditScore: 760, loanAmount: 360000 });
    expect(high.monthlyAmount).toBeLessThan(low.monthlyAmount);
  });
});

describe('getConformingLimit', () => {
  it('should return baseline for standard county', () => {
    const limit = getConformingLimit(undefined, 1);
    expect(limit).toBe(LOAN_LIMITS_2026.baseline);
  });

  it('should return high-cost limit for high-cost county', () => {
    const limit = getConformingLimit('Los Angeles, CA', 1);
    expect(limit).toBe(LOAN_LIMITS_2026.highCost);
  });

  it('should apply unit multipliers', () => {
    const oneUnit = getConformingLimit(undefined, 1);
    const twoUnit = getConformingLimit(undefined, 2);
    expect(twoUnit).toBeGreaterThan(oneUnit);
    expect(twoUnit).toBeCloseTo(oneUnit * 1.28, -2);
  });
});

describe('calculateFhaMip', () => {
  it('should calculate upfront MIP at 1.75%', () => {
    const result = calculateFhaMip(300000, 96.5, 30);
    expect(result.upfront).toBe(5250);
  });

  it('should calculate annual MIP based on LTV and term', () => {
    const highLtv = calculateFhaMip(300000, 95, 30);
    const lowLtv = calculateFhaMip(300000, 85, 30);
    expect(highLtv.annualRate).toBeGreaterThan(lowLtv.annualRate);
  });
});

describe('calculateVaFundingFee', () => {
  it('should calculate lower fee with down payment', () => {
    const noDown = calculateVaFundingFee(300000, 0, true);
    const withDown = calculateVaFundingFee(300000, 10, true);
    expect(withDown).toBeLessThan(noDown);
  });

  it('should calculate higher fee for subsequent use', () => {
    const first = calculateVaFundingFee(300000, 0, true);
    const subsequent = calculateVaFundingFee(300000, 0, false);
    expect(subsequent).toBeGreaterThan(first);
  });
});

describe('calculatePaymentBreakdown', () => {
  const scenario: LoanScenario = {
    propertyValue: 400000,
    loanAmount: 320000,
    downPayment: 80000,
    interestRate: 6.5,
    termYears: 30,
    creditScore: 720,
    propertyType: 'single-family',
    occupancy: 'primary',
    purpose: 'purchase',
  };

  it('should calculate all payment components', () => {
    const breakdown = calculatePaymentBreakdown(scenario);
    expect(breakdown.principalAndInterest).toBeGreaterThan(0);
    expect(breakdown.propertyTaxes).toBeGreaterThan(0);
    expect(breakdown.homeownersInsurance).toBeGreaterThan(0);
    expect(breakdown.totalPayment).toBeGreaterThan(breakdown.principalAndInterest);
  });

  it('should not include PMI at 80% LTV', () => {
    const breakdown = calculatePaymentBreakdown(scenario);
    expect(breakdown.mortgageInsurance).toBe(0);
  });

  it('should include PMI above 80% LTV', () => {
    const highLtvScenario = { ...scenario, loanAmount: 380000, downPayment: 20000 };
    const breakdown = calculatePaymentBreakdown(highLtvScenario);
    expect(breakdown.mortgageInsurance).toBeGreaterThan(0);
  });
});
