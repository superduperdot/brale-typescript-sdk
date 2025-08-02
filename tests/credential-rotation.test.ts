/**
 * Tests for credential rotation functionality
 */

import { CredentialRotationManager, MockRotationProvider, RotationEvent } from '../src/security/credential-rotation';
import { BraleAuth } from '../src/auth';
import axios, { AxiosInstance } from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CredentialRotationManager', () => {
  let rotationManager: CredentialRotationManager;
  let mockProvider: MockRotationProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    rotationManager = new CredentialRotationManager({
      checkInterval: 1000, // 1 second for testing
      warningThresholdDays: 30,
      urgentThresholdDays: 7,
      maxCredentialAgeDays: 90,
      enableAuditLogging: false, // Disable for tests
    });

    mockProvider = new MockRotationProvider({
      clientId: 'new-client-id',
      clientSecret: 'new-client-secret',
    });

    rotationManager.setRotationProvider(mockProvider);
  });

  afterEach(() => {
    rotationManager.stopMonitoring();
  });

  describe('Credential Registration', () => {
    it('should register credentials for monitoring', () => {
      rotationManager.registerCredentials('test-client-id', {
        environment: 'test',
        tags: { service: 'brale-api' },
      });

      const status = rotationManager.getCredentialStatus();
      expect(status.registered).toBe(true);
      expect(status.status).toBe('healthy');
      expect(status.metadata?.environment).toBe('test');
    });

    it('should mask credential ID for security', () => {
      rotationManager.registerCredentials('very-long-client-id-12345', {
        environment: 'test',
      });

      const status = rotationManager.getCredentialStatus();
      // maskCredential shows first 4 and last 4 chars: "very" + "*" * (25-8) + "2345"
      expect(status.metadata?.credentialId).toBe('very*****************2345');
    });
  });

  describe('Rotation Status Detection', () => {
    it('should detect healthy credentials', () => {
      rotationManager.registerCredentials('test-client-id');
      const status = rotationManager.getCredentialStatus();

      expect(status.status).toBe('healthy');
      expect(status.daysSinceLastRotation).toBe(0);
      expect(status.daysUntilExpiration).toBe(90);
    });

    it('should detect warning status', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 65); // 65 days ago

      rotationManager.registerCredentials('test-client-id', {
        lastRotated: oldDate,
      });

      const status = rotationManager.getCredentialStatus();
      expect(status.status).toBe('warning');
      expect(status.daysUntilExpiration).toBeLessThanOrEqual(30);
    });

    it('should detect urgent status', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 85); // 85 days ago

      rotationManager.registerCredentials('test-client-id', {
        lastRotated: oldDate,
      });

      const status = rotationManager.getCredentialStatus();
      expect(status.status).toBe('urgent');
      expect(status.daysUntilExpiration).toBeLessThanOrEqual(7);
    });

    it('should detect expired status', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 95); // 95 days ago

      rotationManager.registerCredentials('test-client-id', {
        lastRotated: oldDate,
      });

      const status = rotationManager.getCredentialStatus();
      expect(status.status).toBe('expired');
      expect(status.daysUntilExpiration).toBeLessThan(0);
    });
  });

  describe('Rotation Events', () => {
    it('should emit rotation events when checking needs', (done) => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 95); // Expired

      rotationManager.registerCredentials('test-client-id', {
        lastRotated: oldDate,
      });

      rotationManager.on('rotation_event', (event: RotationEvent) => {
        expect(event.type).toBe('rotation_needed');
        expect(event.message).toContain('exceeded maximum age');
        done();
      });

      rotationManager.checkRotationNeeds();
    });

    it('should emit warning events', (done) => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 65); // Warning threshold

      rotationManager.registerCredentials('test-client-id', {
        lastRotated: oldDate,
      });

      rotationManager.on('rotation_event', (event: RotationEvent) => {
        expect(event.type).toBe('warning');
        expect(event.message).toContain('plan rotation soon');
        done();
      });

      rotationManager.checkRotationNeeds();
    });
  });

  describe('Credential Rotation Process', () => {
    beforeEach(() => {
      rotationManager.registerCredentials('old-client-id');
    });

    it('should successfully rotate credentials', async () => {
      const newCredentials = await rotationManager.rotateCredentials();

      expect(newCredentials.clientId).toBe('new-client-id');
      expect(newCredentials.clientSecret).toBe('new-client-secret');

      const status = rotationManager.getCredentialStatus();
      // "new-client-id" -> "new-" + "*" * (13-8) + "t-id" = "new-*****t-id"
      expect(status.metadata?.credentialId).toBe('new-*****t-id');
    });

    it('should emit rotation started and completed events', async () => {
      const events: RotationEvent[] = [];

      rotationManager.on('rotation_event', (event: RotationEvent) => {
        events.push(event);
      });

      await rotationManager.rotateCredentials();

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('rotation_started');
      expect(events[1].type).toBe('rotation_completed');
    });

    it('should handle rotation failures', async () => {
      // Make the provider fail validation
      jest.spyOn(mockProvider, 'validateCredentials').mockResolvedValue(false);

      const events: RotationEvent[] = [];
      rotationManager.on('rotation_event', (event: RotationEvent) => {
        events.push(event);
      });

      await expect(rotationManager.rotateCredentials()).rejects.toThrow('New credentials failed validation');

      const failedEvent = events.find(e => e.type === 'rotation_failed');
      expect(failedEvent).toBeDefined();
      expect(failedEvent?.message).toContain('failed validation');
    });

    it('should throw error when no provider is configured', async () => {
      const managerWithoutProvider = new CredentialRotationManager();
      managerWithoutProvider.registerCredentials('test-client-id');

      await expect(managerWithoutProvider.rotateCredentials()).rejects.toThrow('No rotation provider configured');
    });
  });

  describe('Monitoring', () => {
    it('should start and stop monitoring', () => {
      rotationManager.startMonitoring();
      expect((rotationManager as any).checkTimer).toBeTruthy();

      rotationManager.stopMonitoring();
      expect((rotationManager as any).checkTimer).toBeNull();
    });

    it('should perform initial check when starting monitoring', (done) => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 95); // Expired

      rotationManager.registerCredentials('test-client-id', {
        lastRotated: oldDate,
      });

      rotationManager.on('rotation_event', (event: RotationEvent) => {
        expect(event.type).toBe('rotation_needed');
        done();
      });

      rotationManager.startMonitoring();
    });
  });
});

describe('BraleAuth Credential Rotation Integration', () => {
  let auth: BraleAuth;
  let mockHttpClient: jest.Mocked<AxiosInstance>;
  let mockProvider: MockRotationProvider;

  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    authUrl: 'https://auth.test.com',
    timeout: 30000,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create proper mock HTTP client with interceptors
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    mockedAxios.create.mockReturnValue(mockHttpClient);
    auth = new BraleAuth(mockConfig);

    mockProvider = new MockRotationProvider({
      clientId: 'rotated-client-id',
      clientSecret: 'rotated-client-secret',
    });
  });

  afterEach(() => {
    auth.disableCredentialRotation();
  });

  describe('Rotation Setup', () => {
    it('should enable credential rotation', () => {
      auth.enableCredentialRotation(mockProvider, {
        maxCredentialAgeDays: 90,
        warningThresholdDays: 30,
      });

      const status = auth.getRotationStatus();
      expect(status.enabled).toBe(true);
      expect(status.status).toBe('healthy');
    });

    it('should disable credential rotation', () => {
      auth.enableCredentialRotation(mockProvider);
      auth.disableCredentialRotation();

      const status = auth.getRotationStatus();
      expect(status.enabled).toBe(false);
    });

    it('should return disabled status when rotation not enabled', () => {
      const status = auth.getRotationStatus();
      expect(status.enabled).toBe(false);
      expect(status.status).toBeUndefined();
    });
  });

  describe('Manual Rotation', () => {
    beforeEach(() => {
      auth.enableCredentialRotation(mockProvider);
    });

    it('should successfully rotate credentials', async () => {
      const newCredentials = await auth.rotateCredentials();

      expect(newCredentials.clientId).toBe('rotated-client-id');
      expect(newCredentials.clientSecret).toBe('rotated-client-secret');
    });

    it('should clear stored tokens after rotation', async () => {
      // Set up a mock token first
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      await auth.getAccessToken(); // This should create a stored token

      // Now rotate credentials
      await auth.rotateCredentials();

      // The token should be cleared
      expect(auth.getTokenExpiration()).toBeNull();
    });

    it('should throw error when rotation not enabled', async () => {
      const authWithoutRotation = new BraleAuth(mockConfig);

      await expect(authWithoutRotation.rotateCredentials()).rejects.toThrow(
        'Credential rotation is not enabled'
      );
    });
  });

  describe('Event Handling', () => {
    it('should handle rotation events with proper logging', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      auth.enableCredentialRotation(mockProvider);

      // Simulate a rotation event
      const rotationManager = (auth as any).rotationManager;
      rotationManager.emit('rotation_event', {
        type: 'warning',
        timestamp: new Date(),
        credentialId: 'test***ret',
        message: 'Test warning message',
        context: { test: true },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Brale SDK] Credential Rotation Event: warning',
        expect.objectContaining({
          message: 'Test warning message',
          credentialId: 'test***ret',
        })
      );

      consoleSpy.mockRestore();
    });

    it('should handle error events with error logging', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      auth.enableCredentialRotation(mockProvider);

      // Simulate a rotation failure event
      const rotationManager = (auth as any).rotationManager;
      rotationManager.emit('rotation_event', {
        type: 'rotation_failed',
        timestamp: new Date(),
        credentialId: 'test***ret',
        message: 'Test error message',
        context: { error: 'Test error' },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Brale SDK] Credential Rotation Event: rotation_failed',
        expect.objectContaining({
          message: 'Test error message',
        })
      );

      consoleSpy.mockRestore();
    });
  });
});