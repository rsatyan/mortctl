"use strict";
/**
 * mortctl payment command - Calculate monthly payment breakdown
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentCommand = createPaymentCommand;
const commander_1 = require("commander");
const calculations_1 = require("../lib/calculations");
function createPaymentCommand() {
    const payment = new commander_1.Command('payment')
        .description('Calculate monthly payment breakdown (PITI)')
        .requiredOption('--loan-amount <amount>', 'Loan amount')
        .requiredOption('--rate <percent>', 'Interest rate (e.g., 6.5)')
        .option('--term <years>', 'Loan term in years', '30')
        .option('--property-value <amount>', 'Property value (for PMI/tax estimates)')
        .option('--credit-score <score>', 'Credit score (for PMI)', '720')
        .option('--taxes <amount>', 'Annual property taxes')
        .option('--insurance <amount>', 'Annual homeowners insurance')
        .option('--hoa <amount>', 'Monthly HOA dues', '0')
        .option('--format <type>', 'Output format (json|table)', 'table')
        .action(async (options) => {
        try {
            const loanAmount = parseFloat(options.loanAmount);
            const rate = parseFloat(options.rate);
            const term = parseInt(options.term);
            const propertyValue = options.propertyValue ? parseFloat(options.propertyValue) : loanAmount * 1.25;
            const scenario = {
                propertyValue,
                loanAmount,
                downPayment: propertyValue - loanAmount,
                interestRate: rate,
                termYears: term,
                creditScore: parseInt(options.creditScore),
                propertyType: 'single-family',
                occupancy: 'primary',
                purpose: 'purchase',
                propertyTaxes: options.taxes ? parseFloat(options.taxes) : undefined,
                homeownersInsurance: options.insurance ? parseFloat(options.insurance) : undefined,
                hoaDues: parseFloat(options.hoa),
            };
            const breakdown = (0, calculations_1.calculatePaymentBreakdown)(scenario);
            const ltv = (loanAmount / propertyValue * 100);
            // Calculate total interest over life of loan
            const piOnly = (0, calculations_1.calculateMonthlyPayment)(loanAmount, rate, term);
            const totalPayments = piOnly * term * 12;
            const totalInterest = totalPayments - loanAmount;
            if (options.format === 'json') {
                console.log(JSON.stringify({
                    loanAmount,
                    interestRate: rate,
                    termYears: term,
                    ltv: Math.round(ltv * 100) / 100,
                    breakdown,
                    lifetime: {
                        totalPayments: Math.round(totalPayments),
                        totalInterest: Math.round(totalInterest),
                    },
                }, null, 2));
            }
            else {
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('MONTHLY PAYMENT BREAKDOWN');
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('');
                console.log(`Loan Amount:        $${loanAmount.toLocaleString()}`);
                console.log(`Interest Rate:      ${rate}%`);
                console.log(`Term:               ${term} years`);
                console.log(`LTV:                ${ltv.toFixed(1)}%`);
                console.log('');
                console.log('PAYMENT BREAKDOWN');
                console.log('───────────────────────────────────────────────────────────────');
                console.log(`Principal & Interest:    $${breakdown.principalAndInterest.toLocaleString().padStart(10)}`);
                console.log(`Property Taxes:          $${breakdown.propertyTaxes.toLocaleString().padStart(10)}`);
                console.log(`Homeowners Insurance:    $${breakdown.homeownersInsurance.toLocaleString().padStart(10)}`);
                if (breakdown.mortgageInsurance > 0) {
                    console.log(`Mortgage Insurance:      $${breakdown.mortgageInsurance.toLocaleString().padStart(10)}`);
                }
                if (breakdown.hoaDues > 0) {
                    console.log(`HOA Dues:                $${breakdown.hoaDues.toLocaleString().padStart(10)}`);
                }
                console.log('───────────────────────────────────────────────────────────────');
                console.log(`TOTAL PAYMENT:           $${breakdown.totalPayment.toLocaleString().padStart(10)}`);
                console.log('');
                console.log('LOAN LIFETIME');
                console.log('───────────────────────────────────────────────────────────────');
                console.log(`Total Payments:      $${Math.round(totalPayments).toLocaleString()}`);
                console.log(`Total Interest:      $${Math.round(totalInterest).toLocaleString()}`);
                console.log('═══════════════════════════════════════════════════════════════');
            }
        }
        catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });
    return payment;
}
//# sourceMappingURL=payment.js.map