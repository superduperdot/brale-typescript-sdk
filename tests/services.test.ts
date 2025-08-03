/**
 * Basic tests for Services to improve coverage
 */

import { AccountsService } from '../src/services/accounts';
import { AddressesService } from '../src/services/addresses';
import { AutomationsService } from '../src/services/automations';
import type { AxiosInstance } from 'axios';

// Mock axios
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
} as unknown as AxiosInstance;

describe('Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AccountsService', () => {
    let service: AccountsService;

    beforeEach(() => {
      service = new AccountsService(mockAxios);
    });

    it('should list accounts', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ id: 'account-1', name: 'Test Account' }],
            pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
          },
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.list();

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts', {
        params: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should get account by ID', async () => {
      const mockResponse = {
        data: {
          data: { id: 'account-1', name: 'Test Account' },
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.get('account-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1');
      expect(result.id).toBe('account-1');
    });

    it('should validate account ID', async () => {
      await expect(service.get('')).rejects.toThrow('Invalid account ID');
      await expect(service.get('   ')).rejects.toThrow('Invalid account ID');
    });

    it('should get account balances', async () => {
      const mockResponse = {
        data: {
          data: [{ valueType: 'SBC', available: '100.00' }],
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.getBalances('account-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1/balances');
      expect(result).toHaveLength(1);
    });

    it('should get account activity', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 'activity-1', type: 'transfer' }],
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.getActivity('account-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1/activity', {
        params: {},
      });
      expect(result).toHaveLength(1);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network Error');

      (mockAxios.get as jest.Mock).mockRejectedValue(mockError);

      await expect(service.get('non-existent')).rejects.toThrow('Network Error');
    });
  });

  describe('AddressesService', () => {
    let service: AddressesService;

    beforeEach(() => {
      service = new AddressesService(mockAxios);
    });

    it('should list addresses', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ id: 'addr-1', address: '0x123...' }],
            pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
          },
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.list('account-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1/addresses', {
        params: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should get address by ID', async () => {
      const mockResponse = {
        data: {
          data: { id: 'addr-1', address: '0x123...' },
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.get('account-1', 'addr-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1/addresses/addr-1');
      expect(result.id).toBe('addr-1');
    });

    it('should validate parameters', async () => {
      await expect(service.get('', 'addr-1')).rejects.toThrow('Invalid account ID');
      await expect(service.get('account-1', '')).rejects.toThrow('Invalid address ID');
    });

    it('should update address', async () => {
      const mockResponse = {
        data: {
          data: { id: 'addr-1', address: '0x123...', metadata: { updated: true } },
        },
      };

      (mockAxios.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.update('account-1', 'addr-1', { metadata: { updated: true } });

      expect(mockAxios.patch).toHaveBeenCalledWith('/accounts/account-1/addresses/addr-1', {
        metadata: { updated: true },
      });
      expect(result.id).toBe('addr-1');
    });
  });

  describe('AutomationsService', () => {
    let service: AutomationsService;

    beforeEach(() => {
      service = new AutomationsService(mockAxios);
    });

    it('should list automations', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ id: 'auto-1', name: 'Test Automation' }],
            pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
          },
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.list('account-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1/automations', {
        params: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should get automation by ID', async () => {
      const mockResponse = {
        data: {
          data: { id: 'auto-1', name: 'Test Automation' },
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.get('account-1', 'auto-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1/automations/auto-1');
      expect(result.id).toBe('auto-1');
    });

    it('should validate parameters', async () => {
      await expect(service.get('', 'auto-1')).rejects.toThrow('Invalid account ID');
      await expect(service.get('account-1', '')).rejects.toThrow('Invalid automation ID');
    });

    it('should update automation', async () => {
      const mockResponse = {
        data: {
          data: { id: 'auto-1', name: 'Updated Automation' },
        },
      };

      (mockAxios.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.update('account-1', 'auto-1', { name: 'Updated Automation' });

      expect(mockAxios.patch).toHaveBeenCalledWith('/accounts/account-1/automations/auto-1', {
        name: 'Updated Automation',
      });
      expect(result.name).toBe('Updated Automation');
    });

    it('should delete automation', async () => {
      (mockAxios.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      await service.delete('account-1', 'auto-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/accounts/account-1/automations/auto-1');
    });

    it('should pause automation', async () => {
      const mockResponse = {
        data: {
          data: { id: 'auto-1', status: 'paused' },
        },
      };

      (mockAxios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.pause('account-1', 'auto-1', 3600);

      expect(mockAxios.post).toHaveBeenCalledWith('/accounts/account-1/automations/auto-1/pause', {
        duration: 3600,
      });
      expect(result.status).toBe('paused');
    });

    it('should resume automation', async () => {
      const mockResponse = {
        data: {
          data: { id: 'auto-1', status: 'active' },
        },
      };

      (mockAxios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.resume('account-1', 'auto-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/accounts/account-1/automations/auto-1/resume');
      expect(result.status).toBe('active');
    });

    it('should trigger automation', async () => {
      const mockResponse = {
        data: {
          data: { id: 'exec-123', status: 'pending' },
        },
      };

      (mockAxios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.trigger('account-1', 'auto-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/accounts/account-1/automations/auto-1/trigger', {}, expect.objectContaining({
        headers: expect.objectContaining({
          'Idempotency-Key': expect.any(String),
        }),
      }));
      expect(result.status).toBe('pending');
    });

    it('should get executions', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ id: 'exec-1', status: 'completed' }],
            pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
          },
        },
      };

      (mockAxios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.getExecutions('account-1', 'auto-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/accounts/account-1/automations/auto-1/executions', {
        params: {},
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const service = new AccountsService(mockAxios);
      const networkError = new Error('Network Error');

      (mockAxios.get as jest.Mock).mockRejectedValue(networkError);

      await expect(service.get('account-1')).rejects.toThrow('Network Error');
    });

    it('should handle API errors with status codes', async () => {
      const service = new AddressesService(mockAxios);
      const apiError = new Error('Bad Request');

      (mockAxios.get as jest.Mock).mockRejectedValue(apiError);

      await expect(service.get('account-1', 'addr-1')).rejects.toThrow('Bad Request');
    });
  });
});