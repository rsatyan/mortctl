/**
 * Loan program eligibility checking
 */

import {
  LoanScenario,
  EligibilityResult,
  LoanProgram,
  OccupancyType,
} from '../types';
import { getConformingLimit, LOAN_LIMITS_2026 } from './calculations';

/**
 * Check conventional loan eligibility
 */
export function checkConventionalEligibility(scenario: LoanScenario): EligibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let eligible = true;

  const ltv = (scenario.loanAmount / scenario.propertyValue) * 100;
  const conformingLimit = getConformingLimit(
    scenario.county ? `${scenario.county}, ${scenario.state}` : undefined,
    scenario.units || 1
  );

  // Credit score check
  if (scenario.creditScore < 620) {
    eligible = false;
    reasons.push('Credit score below 620 minimum');
  } else if (scenario.creditScore < 680) {
    warnings.push('Credit score below 680 may result in pricing adjustments');
  }

  // LTV check
  if (ltv > 97) {
    eligible = false;
    reasons.push('LTV exceeds 97% maximum');
  } else if (ltv > 95) {
    warnings.push('LTV >95% requires additional eligibility criteria');
  }

  // Loan amount check (conforming vs jumbo)
  if (scenario.loanAmount > conformingLimit) {
    warnings.push(`Loan exceeds conforming limit ($${conformingLimit.toLocaleString()}), jumbo pricing applies`);
  }

  // Occupancy check for high LTV
  if (ltv > 90 && scenario.occupancy !== 'primary') {
    eligible = false;
    reasons.push('LTV >90% only available for primary residence');
  }

  // Investment property restrictions
  if (scenario.occupancy === 'investment') {
    if (ltv > 85) {
      eligible = false;
      reasons.push('Investment property maximum LTV is 85%');
    }
    if (scenario.creditScore < 680) {
      eligible = false;
      reasons.push('Investment property requires 680+ credit score');
    }
  }

  // Property type restrictions
  if (scenario.propertyType === 'manufactured' && ltv > 95) {
    eligible = false;
    reasons.push('Manufactured homes limited to 95% LTV');
  }

  // Calculate min down payment
  let minDownPct = scenario.occupancy === 'investment' ? 15 : 3;
  if (scenario.occupancy === 'second-home') minDownPct = 10;
  const minDownPayment = scenario.propertyValue * (minDownPct / 100);

  return {
    program: 'conventional',
    eligible,
    reasons: reasons.length > 0 ? reasons : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    maxLoanAmount: conformingLimit,
    minDownPayment,
    rateAdjustment: scenario.creditScore < 740 ? 0.25 : 0,
  };
}

/**
 * Check FHA loan eligibility
 */
export function checkFhaEligibility(scenario: LoanScenario): EligibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let eligible = true;

  const ltv = (scenario.loanAmount / scenario.propertyValue) * 100;
  const fhaLimit = LOAN_LIMITS_2026.fhaCeiling; // Would be county-specific in production

  // Credit score check
  if (scenario.creditScore < 500) {
    eligible = false;
    reasons.push('Credit score below 500 minimum');
  } else if (scenario.creditScore < 580) {
    if (ltv > 90) {
      eligible = false;
      reasons.push('Credit score 500-579 requires 10% down payment (90% LTV max)');
    }
    warnings.push('Credit score 500-579 requires manual underwriting');
  }

  // LTV check
  if (scenario.creditScore >= 580 && ltv > 96.5) {
    eligible = false;
    reasons.push('FHA maximum LTV is 96.5%');
  }

  // Occupancy - FHA is owner-occupied only
  if (scenario.occupancy !== 'primary') {
    eligible = false;
    reasons.push('FHA loans require owner occupancy');
  }

  // Loan amount check
  if (scenario.loanAmount > fhaLimit) {
    eligible = false;
    reasons.push(`Loan exceeds FHA limit ($${fhaLimit.toLocaleString()})`);
  }

  // Property type restrictions
  if (scenario.propertyType === 'coop') {
    warnings.push('Co-ops require FHA approval');
  }

  // Calculate min down payment
  const minDownPct = scenario.creditScore >= 580 ? 3.5 : 10;
  const minDownPayment = scenario.propertyValue * (minDownPct / 100);

  return {
    program: 'fha',
    eligible,
    reasons: reasons.length > 0 ? reasons : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    maxLoanAmount: fhaLimit,
    minDownPayment,
    rateAdjustment: 0, // FHA rates are generally competitive
  };
}

/**
 * Check VA loan eligibility
 */
export function checkVaEligibility(scenario: LoanScenario): EligibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let eligible = true;

  const ltv = (scenario.loanAmount / scenario.propertyValue) * 100;

  // Veteran status required
  if (!scenario.veteran) {
    eligible = false;
    reasons.push('VA loans require veteran/military eligibility');
  }

  // Credit score - VA has no official minimum but lenders typically require 580-620
  if (scenario.creditScore < 580) {
    warnings.push('Most VA lenders require 580+ credit score');
  }

  // LTV - VA allows 100% financing
  if (ltv > 100) {
    eligible = false;
    reasons.push('VA maximum LTV is 100%');
  }

  // Occupancy - VA is owner-occupied only
  if (scenario.occupancy !== 'primary') {
    eligible = false;
    reasons.push('VA loans require owner occupancy');
  }

  // No loan limit for full entitlement (post-2020)
  // But there are limits for partial entitlement

  // Property type restrictions
  if (scenario.propertyType === 'coop') {
    eligible = false;
    reasons.push('VA does not allow co-op properties');
  }

  return {
    program: 'va',
    eligible,
    reasons: reasons.length > 0 ? reasons : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    minDownPayment: 0, // VA allows 0% down
    rateAdjustment: -0.25, // VA rates typically lower
  };
}

/**
 * Check USDA loan eligibility
 */
export function checkUsdaEligibility(scenario: LoanScenario): EligibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let eligible = true;

  const ltv = (scenario.loanAmount / scenario.propertyValue) * 100;

  // Rural location required
  if (!scenario.rural) {
    eligible = false;
    reasons.push('USDA loans require rural/eligible suburban location');
  }

  // Credit score
  if (scenario.creditScore < 640) {
    warnings.push('Credit score below 640 requires manual underwriting');
  }

  // LTV - USDA allows 100% financing
  if (ltv > 100) {
    eligible = false;
    reasons.push('USDA maximum LTV is 100%');
  }

  // Occupancy - owner-occupied only
  if (scenario.occupancy !== 'primary') {
    eligible = false;
    reasons.push('USDA loans require owner occupancy');
  }

  // Property type - single family only
  if (scenario.units && scenario.units > 1) {
    eligible = false;
    reasons.push('USDA loans are for single-family homes only');
  }

  // Income limits would apply (not modeled here)
  warnings.push('USDA has household income limits - verify eligibility');

  return {
    program: 'usda',
    eligible,
    reasons: reasons.length > 0 ? reasons : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    minDownPayment: 0,
    rateAdjustment: 0,
  };
}

/**
 * Check jumbo loan eligibility
 */
export function checkJumboEligibility(scenario: LoanScenario): EligibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let eligible = true;

  const ltv = (scenario.loanAmount / scenario.propertyValue) * 100;
  const conformingLimit = getConformingLimit(
    scenario.county ? `${scenario.county}, ${scenario.state}` : undefined,
    scenario.units || 1
  );

  // Check if actually jumbo
  if (scenario.loanAmount <= conformingLimit) {
    eligible = false;
    reasons.push('Loan amount is within conforming limits - use conventional');
  }

  // Credit score - jumbo typically requires higher scores
  if (scenario.creditScore < 700) {
    eligible = false;
    reasons.push('Jumbo loans typically require 700+ credit score');
  } else if (scenario.creditScore < 720) {
    warnings.push('Credit score below 720 may limit options');
  }

  // LTV - jumbo typically more restrictive
  const maxLtv = scenario.occupancy === 'primary' ? 90 : 80;
  if (ltv > maxLtv) {
    eligible = false;
    reasons.push(`Jumbo maximum LTV is ${maxLtv}% for ${scenario.occupancy}`);
  }

  // Reserves typically required
  warnings.push('Jumbo loans typically require 6-12 months reserves');

  // Min down payment
  const minDownPct = scenario.occupancy === 'primary' ? 10 : 20;
  const minDownPayment = scenario.propertyValue * (minDownPct / 100);

  return {
    program: 'jumbo',
    eligible,
    reasons: reasons.length > 0 ? reasons : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    minDownPayment,
    rateAdjustment: 0.25, // Jumbo typically slightly higher
  };
}

/**
 * Check all program eligibility
 */
export function checkAllEligibility(scenario: LoanScenario): EligibilityResult[] {
  return [
    checkConventionalEligibility(scenario),
    checkFhaEligibility(scenario),
    checkVaEligibility(scenario),
    checkUsdaEligibility(scenario),
    checkJumboEligibility(scenario),
  ];
}

/**
 * Find best recommended program
 */
export function findBestProgram(
  eligibility: EligibilityResult[]
): LoanProgram | undefined {
  const eligible = eligibility.filter(e => e.eligible);
  if (eligible.length === 0) return undefined;

  // Priority order: VA (if eligible), then lowest down payment, then best rate
  const va = eligible.find(e => e.program === 'va');
  if (va) return 'va';

  const usda = eligible.find(e => e.program === 'usda');
  if (usda) return 'usda';

  // Sort by min down payment, then rate adjustment
  eligible.sort((a, b) => {
    const downA = a.minDownPayment || 0;
    const downB = b.minDownPayment || 0;
    if (downA !== downB) return downA - downB;
    return (a.rateAdjustment || 0) - (b.rateAdjustment || 0);
  });

  return eligible[0].program;
}
