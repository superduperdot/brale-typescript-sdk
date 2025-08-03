#!/usr/bin/env node

/**
 * End-to-End CLI Example: Automation Manager
 * 
 * This comprehensive example demonstrates:
 * - Environment configuration
 * - Authentication and connection testing
 * - Account management
 * - Automation creation and management
 * - Error handling and recovery
 * - Real-world CLI patterns
 * 
 * Usage:
 *   node examples/cli-automation-manager.js list
 *   node examples/cli-automation-manager.js create --account-id=acc-123 --amount=100.00
 *   node examples/cli-automation-manager.js status --automation-id=auto-456
 *   node examples/cli-automation-manager.js pause --automation-id=auto-456
 *   node examples/cli-automation-manager.js resume --automation-id=auto-456
 */

const { BraleClient, Amount, BraleAPIError } = require('../dist/cjs/index.js');

// Configuration with environment variables
const config = {
  clientId: process.env.BRALE_CLIENT_ID || 'your-client-id-here',
  clientSecret: process.env.BRALE_CLIENT_SECRET || 'your-client-secret-here',
  environment: process.env.BRALE_ENVIRONMENT || 'sandbox',
  debug: process.env.DEBUG === 'true'
};

// CLI colors for better UX
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Initialize client
const client = new BraleClient(config);

async function testConnection() {
  try {
    info('Testing connection to Brale API...');
    const connection = await client.testConnection();
    
    if (connection.connected && connection.authenticated) {
      success(`Connected to Brale ${config.environment} (${connection.latencyMs}ms)`);
      return true;
    } else if (connection.connected && !connection.authenticated) {
      warning(`Connected to API but authentication failed (${connection.latencyMs}ms)`);
      error('Invalid credentials - please check your BRALE_CLIENT_ID and BRALE_CLIENT_SECRET');
      return false;
    } else {
      error('Failed to connect to Brale API');
      return false;
    }
  } catch (err) {
    error(`Connection failed: ${err.message}`);
    if (config.debug) {
      console.error('Stack trace:', err.stack);
    }
    return false;
  }
}

async function listAutomations(accountId) {
  try {
    info(`Fetching automations for account: ${accountId}`);
    
    const automations = await client.automations.list(accountId);
    
    if (automations.data.length === 0) {
      warning('No automations found');
      return;
    }
    
    log(`\n${colors.bright}Found ${automations.data.length} automation(s):${colors.reset}`);
    
    automations.data.forEach((automation, index) => {
      log(`\n${colors.cyan}${index + 1}. ${automation.name}${colors.reset}`);
      log(`   ID: ${automation.id}`);
      log(`   Type: ${automation.type}`);
      log(`   Status: ${getStatusIcon(automation.status)} ${automation.status}`);
      log(`   Created: ${new Date(automation.createdAt).toLocaleDateString()}`);
      
      if (automation.triggers && automation.triggers.length > 0) {
        log(`   Triggers: ${automation.triggers.length}`);
      }
      
      if (automation.actions && automation.actions.length > 0) {
        log(`   Actions: ${automation.actions.length}`);
      }
    });
    
    log(`\nTotal: ${automations.pagination.total} automations`);
    
  } catch (err) {
    handleError('Failed to list automations', err);
  }
}

async function createDailyTransferAutomation(accountId, amount, destination) {
  try {
    info(`Creating daily transfer automation...`);
    
    // Validate amount using SDK's Amount class
    const transferAmount = new Amount(amount, 'SBC');
    log(`Transfer amount: ${transferAmount.toString()}`);
    
    const automationConfig = {
      name: `Daily Transfer - ${transferAmount.toString()}`,
      type: 'scheduled_transfer',
      triggers: [
        {
          type: 'schedule',
          schedule: {
            frequency: 'daily',
            time: '09:00',
            timezone: 'UTC'
          }
        }
      ],
      actions: [
        {
          type: 'transfer',
          transfer: {
            amount: transferAmount.toString(),
            valueType: 'SBC',
            destination: destination,
            network: 'base'
          }
        }
      ],
      metadata: {
        createdBy: 'cli-automation-manager',
        version: '1.0.0'
      }
    };
    
    // Test the automation first
    info('Testing automation configuration...');
    const testResult = await client.automations.test(accountId, automationConfig);
    
    if (!testResult.valid) {
      error('Automation configuration is invalid:');
      testResult.errors?.forEach(err => log(`  - ${err}`, colors.red));
      return;
    }
    
    if (testResult.warnings && testResult.warnings.length > 0) {
      warning('Configuration warnings:');
      testResult.warnings.forEach(warn => log(`  - ${warn}`, colors.yellow));
    }
    
    if (testResult.estimatedCost) {
      info(`Estimated cost per execution: $${testResult.estimatedCost}`);
    }
    
    // Create the automation
    const automation = await client.automations.create(accountId, automationConfig);
    
    success(`Created automation: ${automation.name}`);
    log(`ID: ${automation.id}`);
    log(`Status: ${automation.status}`);
    
    if (testResult.nextExecution) {
      info(`Next execution: ${new Date(testResult.nextExecution).toLocaleString()}`);
    }
    
  } catch (err) {
    handleError('Failed to create automation', err);
  }
}

async function getAutomationStatus(automationId, accountId) {
  try {
    info(`Fetching status for automation: ${automationId}`);
    
    const automation = await client.automations.get(accountId, automationId);
    
    log(`\n${colors.bright}Automation Details:${colors.reset}`);
    log(`Name: ${automation.name}`);
    log(`Status: ${getStatusIcon(automation.status)} ${automation.status}`);
    log(`Type: ${automation.type}`);
    log(`Created: ${new Date(automation.createdAt).toLocaleDateString()}`);
    
    if (automation.lastExecution) {
      log(`Last Execution: ${new Date(automation.lastExecution).toLocaleString()}`);
    }
    
    // Get recent executions
    info('\nFetching recent executions...');
    const executions = await client.automations.getExecutions(accountId, automationId, { limit: 5 });
    
    if (executions.data.length > 0) {
      log(`\n${colors.bright}Recent Executions:${colors.reset}`);
      executions.data.forEach((execution, index) => {
        log(`${index + 1}. ${execution.id} - ${getStatusIcon(execution.status)} ${execution.status}`);
        log(`   Started: ${new Date(execution.startedAt).toLocaleString()}`);
        if (execution.completedAt) {
          log(`   Completed: ${new Date(execution.completedAt).toLocaleString()}`);
        }
        if (execution.error) {
          log(`   Error: ${execution.error}`, colors.red);
        }
      });
    } else {
      info('No executions found');
    }
    
  } catch (err) {
    handleError('Failed to get automation status', err);
  }
}

async function pauseAutomation(automationId, accountId, duration) {
  try {
    info(`Pausing automation: ${automationId}`);
    
    const result = await client.automations.pause(accountId, automationId, duration);
    
    success(`Automation paused successfully`);
    log(`Status: ${result.status}`);
    
    if (result.pausedUntil) {
      log(`Paused until: ${new Date(result.pausedUntil).toLocaleString()}`);
    }
    
  } catch (err) {
    handleError('Failed to pause automation', err);
  }
}

async function resumeAutomation(automationId, accountId) {
  try {
    info(`Resuming automation: ${automationId}`);
    
    const result = await client.automations.resume(accountId, automationId);
    
    success(`Automation resumed successfully`);
    log(`Status: ${result.status}`);
    
  } catch (err) {
    handleError('Failed to resume automation', err);
  }
}

function getStatusIcon(status) {
  const icons = {
    active: '🟢',
    paused: '⏸️',
    inactive: '🔴',
    completed: '✅',
    failed: '❌',
    pending: '⏳',
    running: '🔄'
  };
  return icons[status] || '❓';
}

function handleError(message, err) {
  error(message);
  
  if (err instanceof BraleAPIError) {
    log(`API Error (${err.statusCode}): ${err.message}`, colors.red);
    if (err.code) {
      log(`Error Code: ${err.code}`, colors.red);
    }
    if (err.details) {
      log(`Details: ${JSON.stringify(err.details, null, 2)}`, colors.red);
    }
  } else {
    log(`Error: ${err.message}`, colors.red);
  }
  
  if (config.debug && err.stack) {
    log(`\nStack trace:\n${err.stack}`, colors.red);
  }
}

function printUsage() {
  log(`\n${colors.bright}Brale SDK - Automation Manager CLI${colors.reset}`);
  log(`\n${colors.cyan}Usage:${colors.reset}`);
  log('  node cli-automation-manager.js <command> [options]');
  log(`\n${colors.cyan}Commands:${colors.reset}`);
  log('  list --account-id=<id>                    List all automations');
  log('  create --account-id=<id> --amount=<amt>   Create daily transfer automation');
  log('         --destination=<addr>');
  log('  status --automation-id=<id>               Get automation status');
  log('         --account-id=<id>');
  log('  pause --automation-id=<id>                Pause automation');
  log('        --account-id=<id> [--duration=<sec>]');
  log('  resume --automation-id=<id>               Resume automation');
  log('         --account-id=<id>');
  log(`\n${colors.cyan}Environment Variables:${colors.reset}`);
  log('  BRALE_CLIENT_ID       - Your Brale client ID');
  log('  BRALE_CLIENT_SECRET   - Your Brale client secret');
  log('  BRALE_ENVIRONMENT     - sandbox or production (default: sandbox)');
  log('  DEBUG                 - Set to "true" for detailed error logs');
  log(`\n${colors.cyan}Examples:${colors.reset}`);
  log('  node cli-automation-manager.js list --account-id=acc-123');
  log('  node cli-automation-manager.js create --account-id=acc-123 --amount=100.00 --destination=0x123...');
  log('  node cli-automation-manager.js status --automation-id=auto-456 --account-id=acc-123');
}

// Parse command line arguments
function parseArgs(args) {
  const command = args[2];
  const options = {};
  
  args.slice(3).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value;
    }
  });
  
  return { command, options };
}

// Main CLI function
async function main() {
  const { command, options } = parseArgs(process.argv);
  
  if (!command || command === 'help') {
    printUsage();
    return;
  }
  
  // Validate command arguments first
  switch (command) {
    case 'list':
      if (!options['account-id']) {
        error('--account-id is required for list command');
        process.exit(1);
      }
      break;
      
    case 'create':
      if (!options['account-id'] || !options['amount'] || !options['destination']) {
        error('--account-id, --amount, and --destination are required for create command');
        process.exit(1);
      }
      break;
      
    case 'status':
      if (!options['automation-id'] || !options['account-id']) {
        error('--automation-id and --account-id are required for status command');
        process.exit(1);
      }
      break;
      
    case 'pause':
      if (!options['automation-id'] || !options['account-id']) {
        error('--automation-id and --account-id are required for pause command');
        process.exit(1);
      }
      break;
      
    case 'resume':
      if (!options['automation-id'] || !options['account-id']) {
        error('--automation-id and --account-id are required for resume command');
        process.exit(1);
      }
      break;
      
    default:
      error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
  
  // Check for required environment variables
  if (config.clientId === 'your-client-id-here' || config.clientSecret === 'your-client-secret-here') {
    error('Please set BRALE_CLIENT_ID and BRALE_CLIENT_SECRET environment variables');
    log('\nExample:');
    log('export BRALE_CLIENT_ID="your-actual-client-id"');
    log('export BRALE_CLIENT_SECRET="your-actual-client-secret"');
    process.exit(1);
  }
  
  // Test connection before executing commands
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  // Execute command
  try {
    switch (command) {
      case 'list':
        await listAutomations(options['account-id']);
        break;
        
      case 'create':
        await createDailyTransferAutomation(
          options['account-id'],
          options['amount'],
          options['destination']
        );
        break;
        
      case 'status':
        await getAutomationStatus(options['automation-id'], options['account-id']);
        break;
        
      case 'pause':
        const duration = options['duration'] ? parseInt(options['duration']) : undefined;
        await pauseAutomation(options['automation-id'], options['account-id'], duration);
        break;
        
      case 'resume':
        await resumeAutomation(options['automation-id'], options['account-id']);
        break;
    }
  } catch (err) {
    handleError('Command failed', err);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  error('Uncaught Exception:', err.message);
  if (config.debug) {
    console.error(err.stack);
  }
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };