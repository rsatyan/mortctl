"use strict";
/**
 * mortctl limits command - Show conforming loan limits
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLimitsCommand = createLimitsCommand;
const commander_1 = require("commander");
const calculations_1 = require("../lib/calculations");
function createLimitsCommand() {
    const limits = new commander_1.Command('limits')
        .description('Show conforming loan limits')
        .option('--county <name>', 'County name (e.g., "Los Angeles")')
        .option('--state <abbr>', 'State abbreviation (e.g., "CA")')
        .option('--units <n>', 'Number of units (1-4)', '1')
        .option('--list-high-cost', 'List all high-cost counties', false)
        .option('--format <type>', 'Output format (json|table)', 'table')
        .action(async (options) => {
        try {
            const units = parseInt(options.units);
            if (options.listHighCost) {
                if (options.format === 'json') {
                    console.log(JSON.stringify(calculations_1.HIGH_COST_COUNTIES, null, 2));
                }
                else {
                    console.log('═══════════════════════════════════════════════════════════════');
                    console.log('HIGH-COST COUNTIES (2026)');
                    console.log('═══════════════════════════════════════════════════════════════');
                    console.log('');
                    for (const [county, limit] of Object.entries(calculations_1.HIGH_COST_COUNTIES)) {
                        console.log(`${county.padEnd(30)} $${limit.toLocaleString()}`);
                    }
                    console.log('═══════════════════════════════════════════════════════════════');
                }
                return;
            }
            const countyKey = options.county && options.state
                ? `${options.county}, ${options.state}`
                : undefined;
            const conformingLimit = (0, calculations_1.getConformingLimit)(countyKey, units);
            const isHighCost = countyKey && calculations_1.HIGH_COST_COUNTIES[countyKey];
            // Unit multipliers for display
            const unitLimits = {};
            for (let u = 1; u <= 4; u++) {
                unitLimits[u] = (0, calculations_1.getConformingLimit)(countyKey, u);
            }
            const result = {
                year: 2026,
                county: countyKey || 'Baseline (standard counties)',
                isHighCost: !!isHighCost,
                units,
                conformingLimit,
                allUnitLimits: unitLimits,
                baseline: calculations_1.LOAN_LIMITS_2026,
            };
            if (options.format === 'json') {
                console.log(JSON.stringify(result, null, 2));
            }
            else {
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('CONFORMING LOAN LIMITS (2026)');
                console.log('═══════════════════════════════════════════════════════════════');
                console.log('');
                console.log(`Area:               ${result.county}`);
                console.log(`High-Cost:          ${result.isHighCost ? 'Yes' : 'No'}`);
                console.log('');
                console.log('LIMITS BY UNIT COUNT');
                console.log('───────────────────────────────────────────────────────────────');
                console.log(`1-Unit:             $${unitLimits[1].toLocaleString()}`);
                console.log(`2-Unit:             $${unitLimits[2].toLocaleString()}`);
                console.log(`3-Unit:             $${unitLimits[3].toLocaleString()}`);
                console.log(`4-Unit:             $${unitLimits[4].toLocaleString()}`);
                console.log('');
                console.log('NATIONAL BASELINE');
                console.log('───────────────────────────────────────────────────────────────');
                console.log(`Conforming Floor:   $${calculations_1.LOAN_LIMITS_2026.baseline.toLocaleString()}`);
                console.log(`High-Cost Ceiling:  $${calculations_1.LOAN_LIMITS_2026.highCost.toLocaleString()}`);
                console.log(`FHA Floor:          $${calculations_1.LOAN_LIMITS_2026.fhaFloor.toLocaleString()}`);
                console.log(`FHA Ceiling:        $${calculations_1.LOAN_LIMITS_2026.fhaCeiling.toLocaleString()}`);
                console.log('═══════════════════════════════════════════════════════════════');
            }
        }
        catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });
    return limits;
}
//# sourceMappingURL=limits.js.map