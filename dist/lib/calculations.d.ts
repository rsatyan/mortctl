/**
 * Core mortgage calculations
 */
import { LtvResult, PmiInputs, PmiResult, LoanScenario, PaymentBreakdown, LoanLimits } from '../types';
/**
 * 2026 Conforming Loan Limits (estimated)
 */
export declare const LOAN_LIMITS_2026: LoanLimits;
/**
 * High-cost counties (sample - would be comprehensive in production)
 */
export declare const HIGH_COST_COUNTIES: Record<string, number>;
/**
 * Get conforming loan limit for a county
 */
export declare function getConformingLimit(county?: string, units?: number): number;
/**
 * Calculate monthly P&I payment
 */
export declare function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number;
/**
 * Calculate LTV/CLTV/HCLTV
 */
export declare function calculateLtv(propertyValue: number, loanAmount: number, secondLien?: number, heloc?: number): LtvResult;
/**
 * Calculate PMI
 */
export declare function calculatePmi(inputs: PmiInputs): PmiResult;
/**
 * Calculate full payment breakdown
 */
export declare function calculatePaymentBreakdown(scenario: LoanScenario): PaymentBreakdown;
/**
 * Calculate FHA MIP (Mortgage Insurance Premium)
 */
export declare function calculateFhaMip(loanAmount: number, ltv: number, termYears: number): {
    upfront: number;
    monthly: number;
    annualRate: number;
};
/**
 * Calculate VA Funding Fee
 */
export declare function calculateVaFundingFee(loanAmount: number, downPaymentPercent: number, firstTimeUse: boolean, reservist?: boolean): number;
/**
 * Calculate USDA Guarantee Fee
 */
export declare function calculateUsdaFee(loanAmount: number): {
    upfront: number;
    annual: number;
};
//# sourceMappingURL=calculations.d.ts.map