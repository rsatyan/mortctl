#!/usr/bin/env node

/**
 * mortctl - Mortgage underwriting calculations and eligibility
 * Part of the LendCtl Suite
 */

import { Command } from 'commander';
import { createLtvCommand } from './commands/ltv';
import { createEligibleCommand } from './commands/eligible';
import { createPaymentCommand } from './commands/payment';
import { createLimitsCommand } from './commands/limits';

const program = new Command();

program
  .name('mortctl')
  .description('Mortgage underwriting calculations and eligibility - part of the LendCtl Suite')
  .version('0.1.0');

// Add commands
program.addCommand(createLtvCommand());
program.addCommand(createEligibleCommand());
program.addCommand(createPaymentCommand());
program.addCommand(createLimitsCommand());

program.parse();

// Export library components for programmatic use
export * from './lib/calculations';
export * from './lib/eligibility';
export * from './types';
