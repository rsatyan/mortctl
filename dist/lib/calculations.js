"use strict";
/**
 * Core mortgage calculations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIGH_COST_COUNTIES = exports.LOAN_LIMITS_2026 = void 0;
exports.getConformingLimit = getConformingLimit;
exports.calculateMonthlyPayment = calculateMonthlyPayment;
exports.calculateLtv = calculateLtv;
exports.calculatePmi = calculatePmi;
exports.calculatePaymentBreakdown = calculatePaymentBreakdown;
exports.calculateFhaMip = calculateFhaMip;
exports.calculateVaFundingFee = calculateVaFundingFee;
exports.calculateUsdaFee = calculateUsdaFee;
/**
 * 2026 Conforming Loan Limits (estimated)
 */
exports.LOAN_LIMITS_2026 = {
    baseline: 766550, // Standard conforming limit
    highCost: 1149825, // High-cost area ceiling (150% of baseline)
    fhaFloor: 498257, // FHA floor
    fhaCeiling: 1149825, // FHA ceiling (same as high-cost)
};
/**
 * High-cost counties (sample - would be comprehensive in production)
 */
exports.HIGH_COST_COUNTIES = {
    'Los Angeles, CA': 1149825,
    'San Francisco, CA': 1149825,
    'New York, NY': 1149825,
    'Kings, NY': 1149825,
    'Queens, NY': 1149825,
    'Bronx, NY': 1149825,
    'San Diego, CA': 1006250,
    'Orange, CA': 1149825,
    'Santa Clara, CA': 1149825,
    'Alameda, CA': 1149825,
    'Seattle, WA': 977500,
    'King, WA': 977500,
    'Honolulu, HI': 1149825,
    'Washington, DC': 1149825,
    'Montgomery, MD': 1149825,
    'Fairfax, VA': 1149825,
};
/**
 * Get conforming loan limit for a county
 */
function getConformingLimit(county, units = 1) {
    let baseLimit = exports.LOAN_LIMITS_2026.baseline;
    if (county && exports.HIGH_COST_COUNTIES[county]) {
        baseLimit = exports.HIGH_COST_COUNTIES[county];
    }
    // Multi-unit adjustments
    const unitMultipliers = {
        1: 1,
        2: 1.28,
        3: 1.55,
        4: 1.92,
    };
    return Math.round(baseLimit * (unitMultipliers[units] || 1));
}
/**
 * Calculate monthly P&I payment
 */
function calculateMonthlyPayment(principal, annualRate, termYears) {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    if (monthlyRate === 0) {
        return principal / numPayments;
    }
    const payment = principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    return Math.round(payment * 100) / 100;
}
/**
 * Calculate LTV/CLTV/HCLTV
 */
function calculateLtv(propertyValue, loanAmount, secondLien = 0, heloc = 0) {
    const ltv = (loanAmount / propertyValue) * 100;
    const cltv = ((loanAmount + secondLien) / propertyValue) * 100;
    const hcltv = ((loanAmount + secondLien + heloc) / propertyValue) * 100;
    const pmiRequired = ltv > 80;
    return {
        ltv: Math.round(ltv * 100) / 100,
        cltv: Math.round(cltv * 100) / 100,
        hcltv: Math.round(hcltv * 100) / 100,
        pmiRequired,
        pmiRemovalLtv: pmiRequired ? 78 : undefined,
    };
}
/**
 * PMI rate lookup table (approximate)
 * Format: [LTV range][Credit score range] = annual rate %
 */
const PMI_RATES = {
    '95-97': { '760+': 0.55, '740-759': 0.65, '720-739': 0.78, '700-719': 0.95, '680-699': 1.15, '<680': 1.40 },
    '90-95': { '760+': 0.38, '740-759': 0.45, '720-739': 0.55, '700-719': 0.70, '680-699': 0.90, '<680': 1.15 },
    '85-90': { '760+': 0.25, '740-759': 0.30, '720-739': 0.38, '700-719': 0.50, '680-699': 0.65, '<680': 0.85 },
    '80-85': { '760+': 0.15, '740-759': 0.18, '720-739': 0.23, '700-719': 0.30, '680-699': 0.40, '<680': 0.55 },
};
/**
 * Get credit score bracket for PMI lookup
 */
function getCreditBracket(score) {
    if (score >= 760)
        return '760+';
    if (score >= 740)
        return '740-759';
    if (score >= 720)
        return '720-739';
    if (score >= 700)
        return '700-719';
    if (score >= 680)
        return '680-699';
    return '<680';
}
/**
 * Get LTV bracket for PMI lookup
 */
function getLtvBracket(ltv) {
    if (ltv > 95)
        return '95-97';
    if (ltv > 90)
        return '90-95';
    if (ltv > 85)
        return '85-90';
    if (ltv > 80)
        return '80-85';
    return '80-85'; // Below 80 - no PMI normally
}
/**
 * Calculate PMI
 */
function calculatePmi(inputs) {
    const { ltv, creditScore, loanAmount, termYears = 30 } = inputs;
    // No PMI below 80% LTV
    if (ltv <= 80) {
        return {
            required: false,
            monthlyAmount: 0,
            annualAmount: 0,
            ratePercent: 0,
            cancellationLtv: 80,
        };
    }
    const ltvBracket = getLtvBracket(ltv);
    const creditBracket = getCreditBracket(creditScore);
    const ratePercent = PMI_RATES[ltvBracket]?.[creditBracket] || 0.85;
    const annualAmount = (loanAmount * ratePercent) / 100;
    const monthlyAmount = annualAmount / 12;
    // Estimate months to reach 78% LTV (automatic cancellation)
    // Simplified - assumes 30-year at average rate
    const avgRate = 6.5; // Approximate
    const monthlyPayment = calculateMonthlyPayment(loanAmount, avgRate, termYears);
    // Very rough estimate of months to 78% LTV
    const targetLoanAmount = loanAmount * (78 / ltv);
    const reductionNeeded = loanAmount - targetLoanAmount;
    // Approximate based on early amortization (mostly interest)
    const avgMonthlyPrincipal = monthlyPayment * 0.25; // Rough estimate
    const monthsToCancel = Math.ceil(reductionNeeded / avgMonthlyPrincipal);
    return {
        required: true,
        monthlyAmount: Math.round(monthlyAmount * 100) / 100,
        annualAmount: Math.round(annualAmount * 100) / 100,
        ratePercent,
        cancellationLtv: 78,
        monthsToCancel,
    };
}
/**
 * Calculate full payment breakdown
 */
function calculatePaymentBreakdown(scenario) {
    const principalAndInterest = calculateMonthlyPayment(scenario.loanAmount, scenario.interestRate, scenario.termYears);
    const propertyTaxes = (scenario.propertyTaxes || scenario.propertyValue * 0.0125) / 12;
    const homeownersInsurance = (scenario.homeownersInsurance || scenario.propertyValue * 0.0035) / 12;
    const hoaDues = scenario.hoaDues || 0;
    // Calculate PMI if needed
    const ltv = (scenario.loanAmount / scenario.propertyValue) * 100;
    const pmiResult = calculatePmi({
        ltv,
        creditScore: scenario.creditScore,
        loanAmount: scenario.loanAmount,
        termYears: scenario.termYears,
    });
    const totalPayment = principalAndInterest + propertyTaxes + homeownersInsurance +
        pmiResult.monthlyAmount + hoaDues;
    return {
        principalAndInterest: Math.round(principalAndInterest * 100) / 100,
        propertyTaxes: Math.round(propertyTaxes * 100) / 100,
        homeownersInsurance: Math.round(homeownersInsurance * 100) / 100,
        mortgageInsurance: pmiResult.monthlyAmount,
        hoaDues,
        totalPayment: Math.round(totalPayment * 100) / 100,
    };
}
/**
 * Calculate FHA MIP (Mortgage Insurance Premium)
 */
function calculateFhaMip(loanAmount, ltv, termYears) {
    // Upfront MIP: 1.75% of loan amount
    const upfront = loanAmount * 0.0175;
    // Annual MIP rates (as of 2024, may change)
    // For loans > 15 years and LTV > 90%: 0.85%
    // For loans > 15 years and LTV <= 90%: 0.80%
    // For loans <= 15 years: 0.45% to 0.70% depending on LTV
    let annualRate;
    if (termYears > 15) {
        annualRate = ltv > 90 ? 0.85 : 0.80;
    }
    else {
        annualRate = ltv > 90 ? 0.70 : 0.45;
    }
    const monthly = (loanAmount * annualRate / 100) / 12;
    return {
        upfront: Math.round(upfront * 100) / 100,
        monthly: Math.round(monthly * 100) / 100,
        annualRate,
    };
}
/**
 * Calculate VA Funding Fee
 */
function calculateVaFundingFee(loanAmount, downPaymentPercent, firstTimeUse, reservist = false) {
    // VA Funding Fee rates (2024)
    // First use, no down: 2.15% (2.40% for reserves/NG)
    // First use, 5-10% down: 1.50% (1.75% for reserves/NG)
    // First use, 10%+ down: 1.25% (1.50% for reserves/NG)
    // Subsequent use, no down: 3.30%
    // Subsequent use, 5-10% down: 1.50%
    // Subsequent use, 10%+ down: 1.25%
    let rate;
    if (firstTimeUse) {
        if (downPaymentPercent >= 10) {
            rate = reservist ? 1.50 : 1.25;
        }
        else if (downPaymentPercent >= 5) {
            rate = reservist ? 1.75 : 1.50;
        }
        else {
            rate = reservist ? 2.40 : 2.15;
        }
    }
    else {
        if (downPaymentPercent >= 10) {
            rate = 1.25;
        }
        else if (downPaymentPercent >= 5) {
            rate = 1.50;
        }
        else {
            rate = 3.30;
        }
    }
    return Math.round((loanAmount * rate / 100) * 100) / 100;
}
/**
 * Calculate USDA Guarantee Fee
 */
function calculateUsdaFee(loanAmount) {
    // USDA fees (2024)
    // Upfront: 1.0%
    // Annual: 0.35%
    return {
        upfront: Math.round((loanAmount * 0.01) * 100) / 100,
        annual: Math.round((loanAmount * 0.0035) * 100) / 100,
    };
}
//# sourceMappingURL=calculations.js.map