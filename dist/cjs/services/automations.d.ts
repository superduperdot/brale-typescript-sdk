/**
 * Automations service for managing automated transfer workflows
 */
import type { AxiosInstance } from 'axios';
import type { AutomationRule, CreateAutomationRequest, UpdateAutomationRequest, AutomationStatus, AutomationType, ExecutionResult } from '../models/automation';
import type { PaginationParams, PaginatedResponse } from '../types/common';
/**
 * Automation filters for listing rules
 */
export interface AutomationFilters {
    /** Filter by status */
    status?: AutomationStatus | AutomationStatus[];
    /** Filter by type */
    type?: AutomationType;
    /** Filter by creation date range */
    createdAfter?: Date;
    createdBefore?: Date;
    /** Search by name or description */
    search?: string;
}
/**
 * Service for managing automation rules
 */
export declare class AutomationsService {
    private readonly httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * List automation rules for an account
     *
     * @param accountId - The account ID
     * @param filters - Optional filters for the automation list
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of automation rules
     */
    list(accountId: string, filters?: AutomationFilters, pagination?: PaginationParams): Promise<PaginatedResponse<AutomationRule>>;
    /**
     * Get a specific automation rule by ID
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @returns Promise resolving to the automation rule
     */
    get(accountId: string, automationId: string): Promise<AutomationRule>;
    /**
     * Create a new automation rule
     *
     * @param accountId - The account ID
     * @param request - Automation rule creation request
     * @returns Promise resolving to the created automation rule
     */
    create(accountId: string, request: CreateAutomationRequest): Promise<AutomationRule>;
    /**
     * Update an existing automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @param request - Automation rule update request
     * @returns Promise resolving to the updated automation rule
     */
    update(accountId: string, automationId: string, request: UpdateAutomationRequest): Promise<AutomationRule>;
    /**
     * Delete an automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @returns Promise resolving when deletion is complete
     */
    delete(accountId: string, automationId: string): Promise<void>;
    /**
     * Start/activate an automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @returns Promise resolving to the activated automation rule
     */
    start(accountId: string, automationId: string): Promise<AutomationRule>;
    /**
     * Stop/deactivate an automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @returns Promise resolving to the deactivated automation rule
     */
    stop(accountId: string, automationId: string): Promise<AutomationRule>;
    /**
     * Pause an automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @param duration - Optional pause duration in seconds
     * @returns Promise resolving to the paused automation rule
     */
    pause(accountId: string, automationId: string, duration?: number): Promise<AutomationRule>;
    /**
     * Resume a paused automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @returns Promise resolving to the resumed automation rule
     */
    resume(accountId: string, automationId: string): Promise<AutomationRule>;
    /**
     * Manually trigger an automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @returns Promise resolving to the execution result
     */
    trigger(accountId: string, automationId: string): Promise<ExecutionResult>;
    /**
     * Get execution history for an automation rule
     *
     * @param accountId - The account ID
     * @param automationId - The automation rule ID
     * @param pagination - Pagination parameters
     * @returns Promise resolving to paginated list of execution results
     */
    getExecutions(accountId: string, automationId: string, pagination?: PaginationParams): Promise<PaginatedResponse<ExecutionResult>>;
    /**
     * Test an automation rule without executing actions
     *
     * @param accountId - The account ID
     * @param request - Automation rule to test
     * @returns Promise resolving to test result
     */
    test(accountId: string, request: CreateAutomationRequest): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
        estimatedCost?: string;
    }>;
    /**
     * Validate account ID
     */
    private validateAccountId;
    /**
     * Validate automation ID
     */
    private validateAutomationId;
    /**
     * Validate create automation request
     */
    private validateCreateAutomationRequest;
    /**
     * Validate update automation request
     */
    private validateUpdateAutomationRequest;
    /**
     * Create query parameters from filters
     */
    private createFiltersQuery;
    /**
     * Transform API automation response
     */
    private transformAutomationResponse;
    /**
     * Transform API automations list response
     */
    private transformAutomationsResponse;
    /**
     * Transform API execution response
     */
    private transformExecutionResponse;
    /**
     * Transform API executions list response
     */
    private transformExecutionsResponse;
}
//# sourceMappingURL=automations.d.ts.map