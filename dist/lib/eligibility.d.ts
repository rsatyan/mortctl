/**
 * Loan program eligibility checking
 */
import { LoanScenario, EligibilityResult, LoanProgram } from '../types';
/**
 * Check conventional loan eligibility
 */
export declare function checkConventionalEligibility(scenario: LoanScenario): EligibilityResult;
/**
 * Check FHA loan eligibility
 */
export declare function checkFhaEligibility(scenario: LoanScenario): EligibilityResult;
/**
 * Check VA loan eligibility
 */
export declare function checkVaEligibility(scenario: LoanScenario): EligibilityResult;
/**
 * Check USDA loan eligibility
 */
export declare function checkUsdaEligibility(scenario: LoanScenario): EligibilityResult;
/**
 * Check jumbo loan eligibility
 */
export declare function checkJumboEligibility(scenario: LoanScenario): EligibilityResult;
/**
 * Check all program eligibility
 */
export declare function checkAllEligibility(scenario: LoanScenario): EligibilityResult[];
/**
 * Find best recommended program
 */
export declare function findBestProgram(eligibility: EligibilityResult[]): LoanProgram | undefined;
//# sourceMappingURL=eligibility.d.ts.map