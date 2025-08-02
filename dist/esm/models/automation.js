/**
 * Automation models for automated transfer workflows and rules
 */
/**
 * Automation status
 */
export var AutomationStatus;
(function (AutomationStatus) {
    AutomationStatus["ACTIVE"] = "active";
    AutomationStatus["INACTIVE"] = "inactive";
    AutomationStatus["PAUSED"] = "paused";
    AutomationStatus["ERROR"] = "error";
})(AutomationStatus || (AutomationStatus = {}));
/**
 * Automation types
 */
export var AutomationType;
(function (AutomationType) {
    AutomationType["SCHEDULED_TRANSFER"] = "scheduled_transfer";
    AutomationType["BALANCE_REBALANCING"] = "balance_rebalancing";
    AutomationType["THRESHOLD_TRANSFER"] = "threshold_transfer";
    AutomationType["CROSS_CHAIN_OPTIMIZATION"] = "cross_chain_optimization";
    AutomationType["YIELD_FARMING"] = "yield_farming";
    AutomationType["DOLLAR_COST_AVERAGING"] = "dollar_cost_averaging";
})(AutomationType || (AutomationType = {}));
/**
 * Trigger types
 */
export var TriggerType;
(function (TriggerType) {
    TriggerType["SCHEDULED"] = "scheduled";
    TriggerType["BALANCE_THRESHOLD"] = "balance_threshold";
    TriggerType["PRICE_CHANGE"] = "price_change";
    TriggerType["MANUAL"] = "manual";
    TriggerType["WEBHOOK"] = "webhook";
})(TriggerType || (TriggerType = {}));
/**
 * Condition types
 */
export var ConditionType;
(function (ConditionType) {
    ConditionType["BALANCE_CHECK"] = "balance_check";
    ConditionType["TIME_WINDOW"] = "time_window";
    ConditionType["MARKET_HOURS"] = "market_hours";
    ConditionType["PRICE_RANGE"] = "price_range";
    ConditionType["CUSTOM"] = "custom";
})(ConditionType || (ConditionType = {}));
/**
 * Action types
 */
export var ActionType;
(function (ActionType) {
    ActionType["TRANSFER"] = "transfer";
    ActionType["NOTIFICATION"] = "notification";
    ActionType["WEBHOOK"] = "webhook";
    ActionType["PAUSE_RULE"] = "pause_rule";
    ActionType["CUSTOM"] = "custom";
})(ActionType || (ActionType = {}));
//# sourceMappingURL=automation.js.map