"use strict";
/**
 * mortctl eligible command - Check loan program eligibility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEligibleCommand = createEligibleCommand;
const commander_1 = require("commander");
const eligibility_1 = require("../lib/eligibility");
function createEligibleCommand() {
    const eligible = new commander_1.Command('eligible')
        .description('Check eligibility for loan programs')
        .requiredOption('--property-value <amount>', 'Property value')
        .requiredOption('--loan-amount <amount>', 'Loan amount')
        .requiredOption('--credit-score <score>', 'Credit score')
        .option('--property-type <type>', 'Property type', 'single-family')
        .option('--occupancy <type>', 'Occupancy type', 'primary')
        .option('--purpose <type>', 'Loan purpose', 'purchase')
        .option('--units <n>', 'Number of units', '1')
        .option('--county <name>', 'County for loan limits')
        .option('--state <abbr>', 'State abbreviation')
        .option('--veteran', 'Veteran/military eligibility', false)
        .option('--rural', 'Rural/USDA eligible location', false)
        .option('--first-time', 'First-time homebuyer', false)
        .option('--format <type>', 'Output format (json|table)', 'table')
        .action(async (options) => {
        try {
            const scenario = {
                propertyValue: parseFloat(options.propertyValue),
                loanAmount: parseFloat(options.loanAmount),
                downPayment: parseFloat(options.propertyValue) - parseFloat(options.loanAmount),
                creditScore: parseInt(options.creditScore),
                propertyType: options.propertyType,
                occupancy: options.occupancy,
                purpose: options.purpose,
                units: parseInt(options.units),
                county: options.county,
                state: options.state,
                veteran: options.veteran,
                rural: options.rural,
                firstTimeHomebuyer: options.firstTime,
                interestRate: 6.5, // Default for calculations
                termYears: 30,
            };
            const eligibility = (0, eligibility_1.checkAllEligibility)(scenario);
            const recommended = (0, eligibility_1.findBestProgram)(eligibility);
            if (options.format === 'json') {
                console.log(JSON.stringify({
                    scenario: {
                        propertyValue: scenario.propertyValue,
                        loanAmount: scenario.loanAmount,
                        ltv: (scenario.loanAmount / scenario.propertyValue * 100).toFixed(2),
                        creditScore: scenario.creditScore,
                    },
                    eligibility,
                    recommendedProgram: recommended,
                }, null, 2));
            }
            else {
                const ltv = (scenario.loanAmount / scenario.propertyValue * 100);
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('LOAN PROGRAM ELIGIBILITY');
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('');
                console.log(`Property Value:     $${scenario.propertyValue.toLocaleString()}`);
                console.log(`Loan Amount:        $${scenario.loanAmount.toLocaleString()}`);
                console.log(`LTV:                ${ltv.toFixed(1)}%`);
                console.log(`Credit Score:       ${scenario.creditScore}`);
                console.log(`Property:           ${scenario.propertyType}, ${scenario.occupancy}`);
                console.log('');
                console.log('PROGRAM ELIGIBILITY');
                console.log('───────────────────────────────────────────────────────────────');
                for (const result of eligibility) {
                    const status = result.eligible ? '✓' : '✗';
                    const programName = result.program.toUpperCase().padEnd(15);
                    console.log(`${status} ${programName}`);
                    if (!result.eligible && result.reasons) {
                        for (const reason of result.reasons) {
                            console.log(`    ✗ ${reason}`);
                        }
                    }
                    if (result.eligible) {
                        if (result.minDownPayment !== undefined) {
                            console.log(`    Min down: $${result.minDownPayment.toLocaleString()}`);
                        }
                        if (result.rateAdjustment) {
                            const adj = result.rateAdjustment > 0 ? `+${result.rateAdjustment}%` : `${result.rateAdjustment}%`;
                            console.log(`    Rate adj: ${adj}`);
                        }
                    }
                    if (result.warnings) {
                        for (const warning of result.warnings) {
                            console.log(`    ⚠ ${warning}`);
                        }
                    }
                    console.log('');
                }
                if (recommended) {
                    console.log('───────────────────────────────────────────────────────────────');
                    console.log(`💡 RECOMMENDED: ${recommended.toUpperCase()}`);
                }
                else {
                    console.log('───────────────────────────────────────────────────────────────');
                    console.log('⚠ No programs eligible - review requirements');
                }
                console.log('═══════════════════════════════════════════════════════════════');
            }
        }
        catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });
    return eligible;
}
//# sourceMappingURL=eligible.js.map