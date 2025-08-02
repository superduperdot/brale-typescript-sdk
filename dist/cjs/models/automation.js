"use strict";
/**
 * Automation models for automated transfer workflows and rules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = exports.ConditionType = exports.TriggerType = exports.AutomationType = exports.AutomationStatus = void 0;
/**
 * Automation status
 */
var AutomationStatus;
(function (AutomationStatus) {
    AutomationStatus["ACTIVE"] = "active";
    AutomationStatus["INACTIVE"] = "inactive";
    AutomationStatus["PAUSED"] = "paused";
    AutomationStatus["ERROR"] = "error";
})(AutomationStatus || (exports.AutomationStatus = AutomationStatus = {}));
/**
 * Automation types
 */
var AutomationType;
(function (AutomationType) {
    AutomationType["SCHEDULED_TRANSFER"] = "scheduled_transfer";
    AutomationType["BALANCE_REBALANCING"] = "balance_rebalancing";
    AutomationType["THRESHOLD_TRANSFER"] = "threshold_transfer";
    AutomationType["CROSS_CHAIN_OPTIMIZATION"] = "cross_chain_optimization";
    AutomationType["YIELD_FARMING"] = "yield_farming";
    AutomationType["DOLLAR_COST_AVERAGING"] = "dollar_cost_averaging";
})(AutomationType || (exports.AutomationType = AutomationType = {}));
/**
 * Trigger types
 */
var TriggerType;
(function (TriggerType) {
    TriggerType["SCHEDULED"] = "scheduled";
    TriggerType["BALANCE_THRESHOLD"] = "balance_threshold";
    TriggerType["PRICE_CHANGE"] = "price_change";
    TriggerType["MANUAL"] = "manual";
    TriggerType["WEBHOOK"] = "webhook";
})(TriggerType || (exports.TriggerType = TriggerType = {}));
/**
 * Condition types
 */
var ConditionType;
(function (ConditionType) {
    ConditionType["BALANCE_CHECK"] = "balance_check";
    ConditionType["TIME_WINDOW"] = "time_window";
    ConditionType["MARKET_HOURS"] = "market_hours";
    ConditionType["PRICE_RANGE"] = "price_range";
    ConditionType["CUSTOM"] = "custom";
})(ConditionType || (exports.ConditionType = ConditionType = {}));
/**
 * Action types
 */
var ActionType;
(function (ActionType) {
    ActionType["TRANSFER"] = "transfer";
    ActionType["NOTIFICATION"] = "notification";
    ActionType["WEBHOOK"] = "webhook";
    ActionType["PAUSE_RULE"] = "pause_rule";
    ActionType["CUSTOM"] = "custom";
})(ActionType || (exports.ActionType = ActionType = {}));
//# sourceMappingURL=automation.js.map