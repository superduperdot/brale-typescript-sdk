/**
 * Smoke tests to verify basic SDK functionality
 * These are quick tests to catch major issues
 */

import { BraleClient, ValueType, TransferType } from '../src';

describe('Smoke Tests', () => {
  describe('SDK Exports', () => {
    it('should export main client class', () => {
      expect(BraleClient).toBeDefined();
      expect(typeof BraleClient).toBe('function');
    });

    it('should export enums', () => {
      expect(ValueType).toBeDefined();
      expect(ValueType.SBC).toBe('SBC');
      expect(ValueType.USDC).toBe('USDC');
      expect(ValueType.USD).toBe('USD');

      expect(TransferType).toBeDefined();
      expect(TransferType.BASE).toBe('base');
      expect(TransferType.ETHEREUM).toBe('ethereum');
      expect(TransferType.WIRE).toBe('wire');
      expect(TransferType.ACH).toBe('ach');
    });
  });

  describe('Client Initialization', () => {
    it('should initialize with valid config', () => {
      const client = new BraleClient({
        clientId: 'test-id',
        clientSecret: 'test-secret',
      });

      expect(client).toBeInstanceOf(BraleClient);
      expect(client.accounts).toBeDefined();
      expect(client.transfers).toBeDefined();
      expect(client.addresses).toBeDefined();
      expect(client.automations).toBeDefined();
    });

    it('should validate required config fields', () => {
      expect(() => {
        new BraleClient({} as any);
      }).toThrow();
    });
  });

  describe('Terminology Compliance', () => {
    it('should use correct onchain transfer types', () => {
      const onchainTypes = [
        TransferType.ETHEREUM,
        TransferType.BASE, 
        TransferType.POLYGON,
        TransferType.ARBITRUM,
        TransferType.OPTIMISM,
        TransferType.AVALANCHE,
        TransferType.CELO,
        TransferType.SOLANA,
        TransferType.BNB,
        TransferType.CANTON,
      ];

      onchainTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should use correct offchain transfer types', () => {
      const offchainTypes = [
        TransferType.WIRE,
        TransferType.ACH,
      ];

      offchainTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should use correct value types', () => {
      const valueTypes = [
        ValueType.USD,
        ValueType.USDC,
        ValueType.SBC,
      ];

      valueTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });
});