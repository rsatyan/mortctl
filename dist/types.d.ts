/**
 * Mortgage underwriting types for mortctl
 */
/** Loan program types */
export type LoanProgram = 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo' | 'non-qm';
/** Property types */
export type PropertyType = 'single-family' | 'condo' | 'townhouse' | 'multi-family-2' | 'multi-family-3' | 'multi-family-4' | 'manufactured' | 'coop';
/** Occupancy types */
export type OccupancyType = 'primary' | 'second-home' | 'investment';
/** Loan purpose */
export type LoanPurpose = 'purchase' | 'rate-term-refi' | 'cash-out-refi';
/** Amortization type */
export type AmortizationType = 'fixed' | 'arm-5-1' | 'arm-7-1' | 'arm-10-1' | 'interest-only';
/**
 * Conforming loan limits by year and area
 * 2026 limits (estimated based on trends)
 */
export interface LoanLimits {
    /** Standard conforming limit (baseline counties) */
    baseline: number;
    /** High-cost area ceiling */
    highCost: number;
    /** FHA floor */
    fhaFloor: number;
    /** FHA ceiling */
    fhaCeiling: number;
}
/**
 * LTV calculation result
 */
export interface LtvResult {
    /** Loan-to-value ratio (primary mortgage only) */
    ltv: number;
    /** Combined loan-to-value (includes second liens) */
    cltv: number;
    /** Home equity combined LTV (includes HELOCs) */
    hcltv: number;
    /** Whether PMI is required */
    pmiRequired: boolean;
    /** Estimated PMI amount (monthly) */
    estimatedPmi?: number;
    /** When PMI can be removed (at what LTV) */
    pmiRemovalLtv?: number;
}
/**
 * PMI calculation inputs
 */
export interface PmiInputs {
    /** LTV percentage */
    ltv: number;
    /** Credit score */
    creditScore: number;
    /** Loan amount */
    loanAmount: number;
    /** Loan term in years */
    termYears?: number;
    /** Property type */
    propertyType?: PropertyType;
    /** Occupancy */
    occupancy?: OccupancyType;
}
/**
 * PMI calculation result
 */
export interface PmiResult {
    /** Whether PMI is required */
    required: boolean;
    /** Monthly PMI amount */
    monthlyAmount: number;
    /** Annual PMI amount */
    annualAmount: number;
    /** PMI rate (percentage of loan) */
    ratePercent: number;
    /** LTV at which PMI can be cancelled */
    cancellationLtv: number;
    /** Estimated months until cancellation (based on normal amortization) */
    monthsToCancel?: number;
}
/**
 * Loan eligibility result
 */
export interface EligibilityResult {
    /** Program name */
    program: LoanProgram;
    /** Whether eligible */
    eligible: boolean;
    /** Reasons if not eligible */
    reasons?: string[];
    /** Warnings/conditions */
    warnings?: string[];
    /** Maximum loan amount for this program */
    maxLoanAmount?: number;
    /** Minimum down payment required */
    minDownPayment?: number;
    /** Estimated rate adjustment vs baseline */
    rateAdjustment?: number;
}
/**
 * Complete loan scenario
 */
export interface LoanScenario {
    /** Purchase price or appraised value */
    propertyValue: number;
    /** Down payment amount */
    downPayment: number;
    /** Base loan amount */
    loanAmount: number;
    /** Second lien amount (if any) */
    secondLien?: number;
    /** HELOC amount (if any) */
    heloc?: number;
    /** Interest rate */
    interestRate: number;
    /** Loan term in years */
    termYears: number;
    /** Credit score */
    creditScore: number;
    /** Property type */
    propertyType: PropertyType;
    /** Occupancy */
    occupancy: OccupancyType;
    /** Loan purpose */
    purpose: LoanPurpose;
    /** Number of units (for multi-family) */
    units?: number;
    /** County for loan limits */
    county?: string;
    /** State */
    state?: string;
    /** First-time homebuyer */
    firstTimeHomebuyer?: boolean;
    /** Veteran status (for VA) */
    veteran?: boolean;
    /** Rural location (for USDA) */
    rural?: boolean;
    /** Annual property taxes */
    propertyTaxes?: number;
    /** Annual homeowners insurance */
    homeownersInsurance?: number;
    /** Monthly HOA */
    hoaDues?: number;
}
/**
 * Monthly payment breakdown
 */
export interface PaymentBreakdown {
    /** Principal and interest */
    principalAndInterest: number;
    /** Property taxes (monthly) */
    propertyTaxes: number;
    /** Homeowners insurance (monthly) */
    homeownersInsurance: number;
    /** PMI/MIP (if applicable) */
    mortgageInsurance: number;
    /** HOA dues */
    hoaDues: number;
    /** Total PITI + HOA */
    totalPayment: number;
}
/**
 * Full underwriting analysis
 */
export interface UnderwritingAnalysis {
    /** Loan scenario */
    scenario: LoanScenario;
    /** LTV analysis */
    ltv: LtvResult;
    /** Payment breakdown */
    payment: PaymentBreakdown;
    /** Program eligibility for each program */
    eligibility: EligibilityResult[];
    /** Best recommended program */
    recommendedProgram?: LoanProgram;
    /** Risk flags */
    riskFlags: string[];
    /** Recommendations */
    recommendations: string[];
}
//# sourceMappingURL=types.d.ts.map