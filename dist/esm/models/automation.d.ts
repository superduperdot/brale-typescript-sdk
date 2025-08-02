/**
 * Automation models for automated transfer workflows and rules
 */
import type { ValueType, Network } from '../types/common';
import type { CreateTransferEndpoint } from './transfer';
/**
 * Automation rule for automated transfers
 */
export interface AutomationRule {
    /** Unique rule identifier */
    id: string;
    /** Account ID that owns this rule */
    accountId: string;
    /** Rule name */
    name: string;
    /** Rule description */
    description?: string;
    /** Rule status */
    status: AutomationStatus;
    /** Rule type */
    type: AutomationType;
    /** Rule triggers */
    triggers: AutomationTrigger[];
    /** Rule conditions */
    conditions: AutomationCondition[];
    /** Rule actions */
    actions: AutomationAction[];
    /** Rule configuration */
    config: AutomationConfig;
    /** Rule creation timestamp */
    createdAt: Date;
    /** Last updated timestamp */
    updatedAt: Date;
    /** Last execution timestamp */
    lastExecutedAt?: Date;
    /** Next scheduled execution */
    nextExecutionAt?: Date;
    /** Execution statistics */
    stats?: AutomationStats;
    /** Rule metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Automation status
 */
export declare enum AutomationStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PAUSED = "paused",
    ERROR = "error"
}
/**
 * Automation types
 */
export declare enum AutomationType {
    SCHEDULED_TRANSFER = "scheduled_transfer",
    BALANCE_REBALANCING = "balance_rebalancing",
    THRESHOLD_TRANSFER = "threshold_transfer",
    CROSS_CHAIN_OPTIMIZATION = "cross_chain_optimization",
    YIELD_FARMING = "yield_farming",
    DOLLAR_COST_AVERAGING = "dollar_cost_averaging"
}
/**
 * Automation trigger types
 */
export interface AutomationTrigger {
    /** Trigger type */
    type: TriggerType;
    /** Trigger configuration */
    config: TriggerConfig;
    /** Whether trigger is enabled */
    enabled: boolean;
}
/**
 * Trigger types
 */
export declare enum TriggerType {
    SCHEDULED = "scheduled",
    BALANCE_THRESHOLD = "balance_threshold",
    PRICE_CHANGE = "price_change",
    MANUAL = "manual",
    WEBHOOK = "webhook"
}
/**
 * Trigger configuration (union type based on trigger type)
 */
export type TriggerConfig = ScheduledTriggerConfig | BalanceThresholdTriggerConfig | PriceChangeTriggerConfig | WebhookTriggerConfig;
/**
 * Scheduled trigger configuration
 */
export interface ScheduledTriggerConfig {
    /** Cron expression for scheduling */
    schedule: string;
    /** Timezone for schedule */
    timezone?: string;
    /** Start date for schedule */
    startDate?: Date;
    /** End date for schedule */
    endDate?: Date;
}
/**
 * Balance threshold trigger configuration
 */
export interface BalanceThresholdTriggerConfig {
    /** Value type to monitor */
    token: ValueType;
    /** Network to monitor */
    network: Network;
    /** Threshold type */
    thresholdType: 'minimum' | 'maximum';
    /** Threshold amount */
    threshold: string;
}
/**
 * Price change trigger configuration
 */
export interface PriceChangeTriggerConfig {
    /** Value type to monitor */
    token: ValueType;
    /** Reference value type */
    referenceCurrency: ValueType;
    /** Change type */
    changeType: 'percentage' | 'absolute';
    /** Change threshold */
    threshold: string;
    /** Change direction */
    direction: 'up' | 'down' | 'both';
}
/**
 * Webhook trigger configuration
 */
export interface WebhookTriggerConfig {
    /** Webhook endpoint */
    endpoint: string;
    /** Expected payload schema */
    payloadSchema?: Record<string, unknown>;
    /** Authentication configuration */
    auth?: {
        type: 'bearer' | 'basic' | 'api_key';
        credentials: Record<string, string>;
    };
}
/**
 * Automation condition
 */
export interface AutomationCondition {
    /** Condition type */
    type: ConditionType;
    /** Condition configuration */
    config: ConditionConfig;
    /** Condition operator */
    operator: 'AND' | 'OR';
}
/**
 * Condition types
 */
export declare enum ConditionType {
    BALANCE_CHECK = "balance_check",
    TIME_WINDOW = "time_window",
    MARKET_HOURS = "market_hours",
    PRICE_RANGE = "price_range",
    CUSTOM = "custom"
}
/**
 * Condition configuration (union type)
 */
export type ConditionConfig = BalanceCheckConfig | TimeWindowConfig | MarketHoursConfig | PriceRangeConfig | CustomConditionConfig;
/**
 * Balance check condition
 */
export interface BalanceCheckConfig {
    /** Value type to check */
    token: ValueType;
    /** Network to check */
    network: Network;
    /** Minimum balance required */
    minBalance?: string;
    /** Maximum balance allowed */
    maxBalance?: string;
}
/**
 * Time window condition
 */
export interface TimeWindowConfig {
    /** Start time (HH:MM format) */
    startTime: string;
    /** End time (HH:MM format) */
    endTime: string;
    /** Days of week (0-6, Sunday = 0) */
    daysOfWeek?: number[];
    /** Timezone */
    timezone?: string;
}
/**
 * Market hours condition
 */
export interface MarketHoursConfig {
    /** Market to check */
    market: 'NYSE' | 'NASDAQ' | 'LSE' | 'TSE' | 'custom';
    /** Custom market hours */
    customHours?: {
        open: string;
        close: string;
        timezone: string;
        weekdays: number[];
    };
}
/**
 * Price range condition
 */
export interface PriceRangeConfig {
    /** Value type to check */
    token: ValueType;
    /** Reference value type */
    referenceCurrency: ValueType;
    /** Minimum price */
    minPrice?: string;
    /** Maximum price */
    maxPrice?: string;
}
/**
 * Custom condition configuration
 */
export interface CustomConditionConfig {
    /** JavaScript expression to evaluate */
    expression: string;
    /** Available variables */
    variables?: Record<string, unknown>;
}
/**
 * Automation action
 */
export interface AutomationAction {
    /** Action type */
    type: ActionType;
    /** Action configuration */
    config: ActionConfig;
    /** Action order/priority */
    order: number;
}
/**
 * Action types
 */
export declare enum ActionType {
    TRANSFER = "transfer",
    NOTIFICATION = "notification",
    WEBHOOK = "webhook",
    PAUSE_RULE = "pause_rule",
    CUSTOM = "custom"
}
/**
 * Action configuration (union type)
 */
export type ActionConfig = TransferActionConfig | NotificationActionConfig | WebhookActionConfig | PauseRuleActionConfig | CustomActionConfig;
/**
 * Transfer action configuration
 */
export interface TransferActionConfig {
    /** Transfer amount (can be dynamic) */
    amount: string | DynamicAmount;
    /** Currency/value type */
    currency: ValueType;
    /** Source configuration */
    source: CreateTransferEndpoint;
    /** Destination configuration */
    destination: CreateTransferEndpoint;
    /** Transfer note */
    note?: string;
    /** Enable smart recovery */
    smartRecovery?: boolean;
}
/**
 * Dynamic amount calculation
 */
export interface DynamicAmount {
    /** Calculation type */
    type: 'percentage' | 'fixed' | 'balance' | 'formula';
    /** Base value */
    base?: string;
    /** Percentage (for percentage type) */
    percentage?: string;
    /** Formula (for formula type) */
    formula?: string;
    /** Reference value type/network */
    reference?: {
        token: ValueType;
        network: Network;
    };
}
/**
 * Notification action configuration
 */
export interface NotificationActionConfig {
    /** Notification channels */
    channels: ('email' | 'sms' | 'webhook')[];
    /** Notification message */
    message: string;
    /** Message variables */
    variables?: Record<string, string>;
}
/**
 * Webhook action configuration
 */
export interface WebhookActionConfig {
    /** Webhook URL */
    url: string;
    /** HTTP method */
    method: 'POST' | 'PUT' | 'PATCH';
    /** Request payload */
    payload: Record<string, unknown>;
    /** Request headers */
    headers?: Record<string, string>;
    /** Authentication */
    auth?: {
        type: 'bearer' | 'basic' | 'api_key';
        credentials: Record<string, string>;
    };
}
/**
 * Pause rule action configuration
 */
export interface PauseRuleActionConfig {
    /** Rule ID to pause */
    ruleId?: string;
    /** Pause duration in seconds */
    duration?: number;
    /** Pause reason */
    reason?: string;
}
/**
 * Custom action configuration
 */
export interface CustomActionConfig {
    /** Custom action code */
    code: string;
    /** Action parameters */
    parameters?: Record<string, unknown>;
}
/**
 * Automation configuration
 */
export interface AutomationConfig {
    /** Maximum executions per day */
    maxExecutionsPerDay?: number;
    /** Maximum execution time in seconds */
    maxExecutionTime?: number;
    /** Retry configuration */
    retry?: {
        maxAttempts: number;
        backoffMs: number;
    };
    /** Notification settings */
    notifications?: {
        onSuccess: boolean;
        onFailure: boolean;
        onPause: boolean;
    };
    /** Custom configuration */
    custom?: Record<string, unknown>;
}
/**
 * Automation execution statistics
 */
export interface AutomationStats {
    /** Total executions */
    totalExecutions: number;
    /** Successful executions */
    successfulExecutions: number;
    /** Failed executions */
    failedExecutions: number;
    /** Average execution time */
    averageExecutionTime: number;
    /** Last execution result */
    lastExecutionResult?: ExecutionResult;
    /** Statistics period */
    period: {
        start: Date;
        end: Date;
    };
}
/**
 * Execution result
 */
export interface ExecutionResult {
    /** Execution ID */
    id: string;
    /** Execution status */
    status: 'success' | 'failure' | 'partial';
    /** Execution timestamp */
    timestamp: Date;
    /** Execution duration in milliseconds */
    duration: number;
    /** Triggered by */
    triggeredBy: string;
    /** Actions performed */
    actions: ExecutionAction[];
    /** Error information (if failed) */
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
/**
 * Executed action result
 */
export interface ExecutionAction {
    /** Action type */
    type: ActionType;
    /** Action status */
    status: 'success' | 'failure' | 'skipped';
    /** Action result */
    result?: Record<string, unknown>;
    /** Error (if failed) */
    error?: string;
}
/**
 * Create automation rule request
 */
export interface CreateAutomationRequest {
    /** Rule name */
    name: string;
    /** Rule description */
    description?: string;
    /** Rule type */
    type: AutomationType;
    /** Rule triggers */
    triggers: Omit<AutomationTrigger, 'enabled'>[];
    /** Rule conditions */
    conditions?: AutomationCondition[];
    /** Rule actions */
    actions: AutomationAction[];
    /** Rule configuration */
    config?: Partial<AutomationConfig>;
    /** Start immediately */
    startImmediately?: boolean;
    /** Rule metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Update automation rule request
 */
export interface UpdateAutomationRequest {
    /** Updated name */
    name?: string;
    /** Updated description */
    description?: string;
    /** Updated status */
    status?: AutomationStatus;
    /** Updated triggers */
    triggers?: AutomationTrigger[];
    /** Updated conditions */
    conditions?: AutomationCondition[];
    /** Updated actions */
    actions?: AutomationAction[];
    /** Updated configuration */
    config?: Partial<AutomationConfig>;
    /** Updated metadata */
    metadata?: Record<string, unknown>;
}
//# sourceMappingURL=automation.d.ts.map