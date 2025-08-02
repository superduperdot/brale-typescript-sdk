/**
 * Automations service for managing automated transfer workflows
 */

import type { AxiosInstance } from 'axios';
import type {
  AutomationRule,
  CreateAutomationRequest,
  UpdateAutomationRequest,
  AutomationStatus,
  AutomationType,
  ExecutionResult,
} from '../models/automation';
import type { PaginationParams, PaginatedResponse, ApiResponse } from '../types/common';
import { BraleAPIError } from '../errors/api-error';
// import { retryable } from '../utils/retry'; // TODO: Re-enable when decorator issues are fixed
import { createPaginationQuery } from '../utils/pagination';
import { generateIdempotencyKey } from '../utils/idempotency';

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
export class AutomationsService {
  constructor(private readonly httpClient: AxiosInstance) {}

  /**
   * List automation rules for an account
   * 
   * @param accountId - The account ID
   * @param filters - Optional filters for the automation list
   * @param pagination - Pagination parameters
   * @returns Promise resolving to paginated list of automation rules
   */
  async list(
    accountId: string,
    filters?: AutomationFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<AutomationRule>> {
    this.validateAccountId(accountId);
    
    const query = {
      ...createPaginationQuery(pagination || {}),
      ...this.createFiltersQuery(filters || {}),
    };
    
    const response = await this.httpClient.get<ApiResponse<PaginatedResponse<AutomationRule>>>(
      `/accounts/${accountId}/automations`,
      { params: query }
    );
    
    return this.transformAutomationsResponse(response.data.data);
  }

  /**
   * Get a specific automation rule by ID
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @returns Promise resolving to the automation rule
   */
  async get(accountId: string, automationId: string): Promise<AutomationRule> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    const response = await this.httpClient.get<ApiResponse<AutomationRule>>(
      `/accounts/${accountId}/automations/${automationId}`
    );
    
    return this.transformAutomationResponse(response.data.data);
  }

  /**
   * Create a new automation rule
   * 
   * @param accountId - The account ID
   * @param request - Automation rule creation request
   * @returns Promise resolving to the created automation rule
   */
  async create(accountId: string, request: CreateAutomationRequest): Promise<AutomationRule> {
    this.validateAccountId(accountId);
    this.validateCreateAutomationRequest(request);
    
    const idempotencyKey = generateIdempotencyKey('automation');
    
    const response = await this.httpClient.post<ApiResponse<AutomationRule>>(
      `/accounts/${accountId}/automations`,
      request,
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    
    return this.transformAutomationResponse(response.data.data);
  }

  /**
   * Update an existing automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @param request - Automation rule update request
   * @returns Promise resolving to the updated automation rule
   */
  async update(
    accountId: string,
    automationId: string,
    request: UpdateAutomationRequest
  ): Promise<AutomationRule> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    this.validateUpdateAutomationRequest(request);
    
    const response = await this.httpClient.patch<ApiResponse<AutomationRule>>(
      `/accounts/${accountId}/automations/${automationId}`,
      request
    );
    
    return this.transformAutomationResponse(response.data.data);
  }

  /**
   * Delete an automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(accountId: string, automationId: string): Promise<void> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    await this.httpClient.delete(`/accounts/${accountId}/automations/${automationId}`);
  }

  /**
   * Start/activate an automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @returns Promise resolving to the activated automation rule
   */
  async start(accountId: string, automationId: string): Promise<AutomationRule> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    const response = await this.httpClient.post<ApiResponse<AutomationRule>>(
      `/accounts/${accountId}/automations/${automationId}/start`
    );
    
    return this.transformAutomationResponse(response.data.data);
  }

  /**
   * Stop/deactivate an automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @returns Promise resolving to the deactivated automation rule
   */
  async stop(accountId: string, automationId: string): Promise<AutomationRule> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    const response = await this.httpClient.post<ApiResponse<AutomationRule>>(
      `/accounts/${accountId}/automations/${automationId}/stop`
    );
    
    return this.transformAutomationResponse(response.data.data);
  }

  /**
   * Pause an automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @param duration - Optional pause duration in seconds
   * @returns Promise resolving to the paused automation rule
   */
  async pause(accountId: string, automationId: string, duration?: number): Promise<AutomationRule> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    const body: Record<string, unknown> = {};
    if (duration !== undefined) {
      body.duration = duration;
    }
    
    const response = await this.httpClient.post<ApiResponse<AutomationRule>>(
      `/accounts/${accountId}/automations/${automationId}/pause`,
      body
    );
    
    return this.transformAutomationResponse(response.data.data);
  }

  /**
   * Resume a paused automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @returns Promise resolving to the resumed automation rule
   */
  async resume(accountId: string, automationId: string): Promise<AutomationRule> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    const response = await this.httpClient.post<ApiResponse<AutomationRule>>(
      `/accounts/${accountId}/automations/${automationId}/resume`
    );
    
    return this.transformAutomationResponse(response.data.data);
  }

  /**
   * Manually trigger an automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @returns Promise resolving to the execution result
   */
  async trigger(accountId: string, automationId: string): Promise<ExecutionResult> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    const idempotencyKey = generateIdempotencyKey('trigger');
    
    const response = await this.httpClient.post<ApiResponse<ExecutionResult>>(
      `/accounts/${accountId}/automations/${automationId}/trigger`,
      {},
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    
    return this.transformExecutionResponse(response.data.data);
  }

  /**
   * Get execution history for an automation rule
   * 
   * @param accountId - The account ID
   * @param automationId - The automation rule ID
   * @param pagination - Pagination parameters
   * @returns Promise resolving to paginated list of execution results
   */
  async getExecutions(
    accountId: string,
    automationId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ExecutionResult>> {
    this.validateAccountId(accountId);
    this.validateAutomationId(automationId);
    
    const query = createPaginationQuery(pagination || {});
    
    const response = await this.httpClient.get<ApiResponse<PaginatedResponse<ExecutionResult>>>(
      `/accounts/${accountId}/automations/${automationId}/executions`,
      { params: query }
    );
    
    return this.transformExecutionsResponse(response.data.data);
  }

  /**
   * Test an automation rule without executing actions
   * 
   * @param accountId - The account ID
   * @param request - Automation rule to test
   * @returns Promise resolving to test result
   */
  async test(accountId: string, request: CreateAutomationRequest): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    estimatedCost?: string;
  }> {
    this.validateAccountId(accountId);
    this.validateCreateAutomationRequest(request);
    
    const response = await this.httpClient.post<ApiResponse<{
      valid: boolean;
      errors: string[];
      warnings: string[];
      estimatedCost?: string;
    }>>(
      `/accounts/${accountId}/automations/test`,
      request
    );
    
    return response.data.data;
  }

  /**
   * Validate account ID
   */
  private validateAccountId(accountId: string): void {
    if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
      throw new BraleAPIError('Invalid account ID', 400, 'INVALID_ACCOUNT_ID');
    }
  }

  /**
   * Validate automation ID
   */
  private validateAutomationId(automationId: string): void {
    if (!automationId || typeof automationId !== 'string' || automationId.trim().length === 0) {
      throw new BraleAPIError('Invalid automation ID', 400, 'INVALID_AUTOMATION_ID');
    }
  }

  /**
   * Validate create automation request
   */
  private validateCreateAutomationRequest(request: CreateAutomationRequest): void {
    if (!request.name || typeof request.name !== 'string' || request.name.trim().length === 0) {
      throw new BraleAPIError('Automation name is required', 400, 'MISSING_AUTOMATION_NAME');
    }
    
    if (request.name.length > 100) {
      throw new BraleAPIError('Automation name too long (max 100 characters)', 400, 'NAME_TOO_LONG');
    }
    
    if (!request.type) {
      throw new BraleAPIError('Automation type is required', 400, 'MISSING_AUTOMATION_TYPE');
    }
    
    if (!request.triggers || request.triggers.length === 0) {
      throw new BraleAPIError('At least one trigger is required', 400, 'MISSING_TRIGGERS');
    }
    
    if (!request.actions || request.actions.length === 0) {
      throw new BraleAPIError('At least one action is required', 400, 'MISSING_ACTIONS');
    }
  }

  /**
   * Validate update automation request
   */
  private validateUpdateAutomationRequest(request: UpdateAutomationRequest): void {
    if (request.name !== undefined) {
      if (typeof request.name !== 'string' || request.name.trim().length === 0) {
        throw new BraleAPIError('Invalid automation name', 400, 'INVALID_AUTOMATION_NAME');
      }
      
      if (request.name.length > 100) {
        throw new BraleAPIError('Automation name too long (max 100 characters)', 400, 'NAME_TOO_LONG');
      }
    }
  }

  /**
   * Create query parameters from filters
   */
  private createFiltersQuery(filters: AutomationFilters): Record<string, string> {
    const query: Record<string, string> = {};
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = filters.status.join(',');
      } else {
        query.status = filters.status;
      }
    }
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.search) {
      query.search = filters.search;
    }
    
    if (filters.createdAfter) {
      query.created_after = filters.createdAfter.toISOString();
    }
    
    if (filters.createdBefore) {
      query.created_before = filters.createdBefore.toISOString();
    }
    
    return query;
  }

  /**
   * Transform API automation response
   */
  private transformAutomationResponse(data: unknown): AutomationRule {
    const automation = data as any;
    
    // Transform date strings to Date objects
    if (typeof automation.createdAt === 'string') {
      automation.createdAt = new Date(automation.createdAt);
    }
    
    if (typeof automation.updatedAt === 'string') {
      automation.updatedAt = new Date(automation.updatedAt);
    }
    
    if (typeof automation.lastExecutedAt === 'string') {
      automation.lastExecutedAt = new Date(automation.lastExecutedAt);
    }
    
    if (typeof automation.nextExecutionAt === 'string') {
      automation.nextExecutionAt = new Date(automation.nextExecutionAt);
    }
    
    return automation as AutomationRule;
  }

  /**
   * Transform API automations list response
   */
  private transformAutomationsResponse(data: PaginatedResponse<unknown>): PaginatedResponse<AutomationRule> {
    return {
      ...data,
      data: data.data.map(automation => this.transformAutomationResponse(automation)),
    };
  }

  /**
   * Transform API execution response
   */
  private transformExecutionResponse(data: unknown): ExecutionResult {
    const execution = data as any;
    
    // Transform date strings to Date objects
    if (typeof execution.timestamp === 'string') {
      execution.timestamp = new Date(execution.timestamp);
    }
    
    return execution as ExecutionResult;
  }

  /**
   * Transform API executions list response
   */
  private transformExecutionsResponse(data: PaginatedResponse<unknown>): PaginatedResponse<ExecutionResult> {
    return {
      ...data,
      data: data.data.map(execution => this.transformExecutionResponse(execution)),
    };
  }
}