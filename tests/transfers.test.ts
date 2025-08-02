/**
 * Tests for TransfersService
 */

import { TransfersService } from '../src/services/transfers';
import { BraleAPIError } from '../src/errors/api-error';
import { TransferStatus, ValueType } from '../src/types/common';
import type { AxiosInstance } from 'axios';

describe('TransfersService', () => {
  let service: TransfersService;
  let mockHttpClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new TransfersService(mockHttpClient);
  });

  describe('list', () => {
    it('should list transfers for an account', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [
              {
                id: 'transfer-1',
                accountId: 'account-1',
                amount: { value: '100', currency: 'SBC' },
                status: 'completed',
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
              },
            ],
            pagination: {
              offset: 0,
              limit: 20,
              total: 1,
              hasMore: false,
            },
          },
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await service.list('account-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/accounts/account-1/transfers',
        { params: {} }
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.id).toBe('transfer-1');
      expect(result.pagination.total).toBe(1);
    });

    it('should apply filters and pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [],
            pagination: {
              offset: 20,
              limit: 10,
              total: 0,
              hasMore: false,
            },
          },
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await service.list(
        'account-1',
        {
          status: TransferStatus.COMPLETED,
          currency: ValueType.SBC,
          createdAfter: new Date('2023-01-01'),
        },
        { limit: 10, offset: 20 }
      );

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/accounts/account-1/transfers',
        {
          params: {
            limit: '10',
            offset: '20',
            status: 'completed',
            currency: 'SBC',
            created_after: '2023-01-01T00:00:00.000Z',
          },
        }
      );
    });

    it('should throw error for invalid account ID', async () => {
      await expect(service.list('')).rejects.toThrow(BraleAPIError);
    });
  });

  describe('get', () => {
    it('should get a specific transfer', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transfer-1',
            accountId: 'account-1',
            amount: { value: '100', currency: 'SBC' },
            status: 'completed',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await service.get('account-1', 'transfer-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/accounts/account-1/transfers/transfer-1'
      );

      expect(result.id).toBe('transfer-1');
      expect(result.accountId).toBe('account-1');
    });

    it('should throw error for invalid transfer ID', async () => {
      await expect(service.get('account-1', '')).rejects.toThrow(BraleAPIError);
    });
  });

  describe('create', () => {
    const validRequest = {
      amount: '100',
      currency: 'SBC' as any,
      source: {
        type: 'SBC' as any,
        transferType: 'base' as any,
        addressId: 'source-address-1',
      },
      destination: {
        type: 'SBC' as any,
        transferType: 'base' as any,
        addressId: 'dest-address-1',
      },
    };

    it('should create a transfer', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transfer-1',
            accountId: 'account-1',
            ...validRequest,
            status: 'pending',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await service.create('account-1', validRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/accounts/account-1/transfers',
        expect.objectContaining({
          ...validRequest,
          idempotencyKey: expect.any(String),
        }),
        {
          headers: {
            'Idempotency-Key': expect.any(String),
          },
        }
      );

      expect(result.id).toBe('transfer-1');
      expect(result.status).toBe('pending');
    });

    it('should use provided idempotency key', async () => {
      const requestWithKey = {
        ...validRequest,
        idempotencyKey: 'custom-key-123',
      };

      const mockResponse = {
        data: {
          data: {
            id: 'transfer-1',
            accountId: 'account-1',
            ...requestWithKey,
            status: 'pending',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      await service.create('account-1', requestWithKey);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/accounts/account-1/transfers',
        expect.objectContaining({
          idempotencyKey: 'custom-key-123',
        }),
        {
          headers: {
            'Idempotency-Key': 'custom-key-123',
          },
        }
      );
    });

    it('should validate request parameters', async () => {
      await expect(
        service.create('account-1', {
          ...validRequest,
          amount: '',
        })
      ).rejects.toThrow(BraleAPIError);

      await expect(
        service.create('account-1', {
          ...validRequest,
          amount: 'invalid',
        })
      ).rejects.toThrow(BraleAPIError);

      await expect(
        service.create('account-1', {
          ...validRequest,
          currency: undefined as any,
        })
      ).rejects.toThrow(BraleAPIError);
    });
  });

  describe('estimate', () => {
    it('should estimate transfer costs', async () => {
      const mockResponse = {
        data: {
          data: {
            fees: [
              {
                type: 'network',
                amount: { value: '0.001', currency: 'ETH' },
                description: 'Network fee',
                paidBy: 'sender',
              },
            ],
            totalCost: { value: '100.001', currency: 'ETH' },
            estimatedTime: '2-5 minutes',
            sufficientBalance: true,
            requiredBalance: { value: '100.001', currency: 'ETH' },
          },
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const request = {
        amount: '100',
        currency: 'ETH' as any,
        source: {
          type: 'ETH' as any,
          transferType: 'ethereum' as any,
          addressId: 'source-address-1',
        },
        destination: {
          type: 'ETH' as any,
          transferType: 'ethereum' as any,
          addressId: 'dest-address-1',
        },
      };

      const result = await service.estimate('account-1', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/accounts/account-1/transfers/estimate',
        request
      );

      expect(result.fees).toHaveLength(1);
      expect(result.estimatedTime).toBe('2-5 minutes');
      expect(result.sufficientBalance).toBe(true);
    });
  });

  describe('simpleTransfer', () => {
    it('should create a simple external wallet transfer', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transfer-1',
            accountId: 'account-1',
            amount: { value: '100', currency: 'SBC' },
            status: 'pending',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            source: {
              type: 'SBC',
              transferType: 'base',
            },
            destination: {
              type: 'SBC',
              transferType: 'base',
              addressId: 'external-address-id',
            },
          },
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await service.simpleTransfer(
        'account-1',
        '100',
        '0x1234567890abcdef1234567890abcdef12345678',
        'SBC',
        'base',
        {
          note: 'Test transfer',
          smartRecovery: true,
        }
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/accounts/account-1/transfers',
        expect.objectContaining({
          amount: '100',
          currency: 'SBC',
          note: 'Test transfer',
          smartRecovery: true,
        }),
        expect.any(Object)
      );

      expect(result.id).toBe('transfer-1');
    });
  });

  describe('cancel', () => {
    it('should cancel a pending transfer', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transfer-1',
            accountId: 'account-1',
            status: 'cancelled',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T01:00:00Z',
          },
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await service.cancel('account-1', 'transfer-1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/accounts/account-1/transfers/transfer-1/cancel'
      );

      expect(result.status).toBe('cancelled');
    });
  });

  describe('retry', () => {
    it('should retry a failed transfer', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transfer-1',
            accountId: 'account-1',
            status: 'pending',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T01:00:00Z',
          },
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await service.retry('account-1', 'transfer-1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/accounts/account-1/transfers/transfer-1/retry',
        {},
        {
          headers: {
            'Idempotency-Key': expect.any(String),
          },
        }
      );

      expect(result.status).toBe('pending');
    });
  });
});