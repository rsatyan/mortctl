"use strict";
/**
 * mortctl ltv command - Calculate LTV/CLTV/HCLTV
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLtvCommand = createLtvCommand;
const commander_1 = require("commander");
const calculations_1 = require("../lib/calculations");
function createLtvCommand() {
    const ltv = new commander_1.Command('ltv')
        .description('Calculate loan-to-value ratios')
        .requiredOption('--property-value <amount>', 'Property value or purchase price')
        .option('--loan-amount <amount>', 'Loan amount (or use --down-payment)')
        .option('--down-payment <amount>', 'Down payment amount')
        .option('--second-lien <amount>', 'Second mortgage/lien amount', '0')
        .option('--heloc <amount>', 'HELOC amount', '0')
        .option('--credit-score <score>', 'Credit score for PMI estimate', '720')
        .option('--format <type>', 'Output format (json|table)', 'table')
        .action(async (options) => {
        try {
            const propertyValue = parseFloat(options.propertyValue);
            let loanAmount;
            if (options.loanAmount) {
                loanAmount = parseFloat(options.loanAmount);
            }
            else if (options.downPayment) {
                loanAmount = propertyValue - parseFloat(options.downPayment);
            }
            else {
                console.error('Error: Must specify either --loan-amount or --down-payment');
                process.exit(1);
            }
            const secondLien = parseFloat(options.secondLien);
            const heloc = parseFloat(options.heloc);
            const creditScore = parseInt(options.creditScore);
            const ltvResult = (0, calculations_1.calculateLtv)(propertyValue, loanAmount, secondLien, heloc);
            const pmiResult = (0, calculations_1.calculatePmi)({
                ltv: ltvResult.ltv,
                creditScore,
                loanAmount,
            });
            const downPayment = propertyValue - loanAmount;
            const downPaymentPct = (downPayment / propertyValue) * 100;
            if (options.format === 'json') {
                console.log(JSON.stringify({
                    propertyValue,
                    loanAmount,
                    downPayment,
                    downPaymentPct: Math.round(downPaymentPct * 100) / 100,
                    ...ltvResult,
                    pmi: pmiResult,
                }, null, 2));
            }
            else {
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('LTV CALCULATION');
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('');
                console.log(`Property Value:     $${propertyValue.toLocaleString()}`);
                console.log(`Loan Amount:        $${loanAmount.toLocaleString()}`);
                console.log(`Down Payment:       $${downPayment.toLocaleString()} (${downPaymentPct.toFixed(1)}%)`);
                console.log('');
                console.log('LTV RATIOS');
                console.log('───────────────────────────────────────────────────────────────');
                console.log(`LTV:                ${ltvResult.ltv.toFixed(2)}%`);
                if (secondLien > 0 || heloc > 0) {
                    console.log(`CLTV:               ${ltvResult.cltv.toFixed(2)}%`);
                    console.log(`HCLTV:              ${ltvResult.hcltv.toFixed(2)}%`);
                }
                console.log('');
                if (pmiResult.required) {
                    console.log('PMI ESTIMATE');
                    console.log('───────────────────────────────────────────────────────────────');
                    console.log(`PMI Required:       Yes`);
                    console.log(`Monthly PMI:        $${pmiResult.monthlyAmount.toLocaleString()}`);
                    console.log(`Annual PMI:         $${pmiResult.annualAmount.toLocaleString()}`);
                    console.log(`PMI Rate:           ${pmiResult.ratePercent}%`);
                    console.log(`Auto-Cancel at:     ${pmiResult.cancellationLtv}% LTV`);
                    if (pmiResult.monthsToCancel) {
                        console.log(`Est. Months to Cancel: ~${pmiResult.monthsToCancel}`);
                    }
                }
                else {
                    console.log('PMI:                Not required (LTV ≤ 80%)');
                }
                console.log('═══════════════════════════════════════════════════════════════');
            }
        }
        catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });
    return ltv;
}
//# sourceMappingURL=ltv.js.map