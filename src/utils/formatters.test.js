import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatQuantity, sanitizeString } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format number as Russian rubles', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('₽');
      expect(result.replace(/\s/g, ' ')).toContain('1 000 000');
    });

    it('should format zero', () => {
      expect(formatCurrency(0).replace(/\s/g, ' ')).toBe('0 ₽');
    });

    it('should format negative numbers', () => {
      expect(formatCurrency(-1000)).toContain('-');
    });

    it('should format decimals without fraction digits', () => {
      expect(formatCurrency(1000.99)).not.toContain('.99');
    });
  });

  describe('formatNumber', () => {
    it('should format number with Russian locale', () => {
      expect(formatNumber(1000000).replace(/\s/g, ' ')).toBe('1 000 000');
    });

    it('should format zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatQuantity', () => {
    it('should format quantity without fraction digits', () => {
      expect(formatQuantity(1000.99).replace(/\s/g, ' ')).toBe('1 001');
    });

    it('should format zero', () => {
      expect(formatQuantity(0)).toBe('0');
    });
  });

  describe('sanitizeString', () => {
    it('should return empty string for non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });

    it('should remove dangerous HTML characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).not.toContain('<');
      expect(sanitizeString('<script>alert("xss")</script>')).not.toContain('>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should limit string length to 500', () => {
      const longString = 'a'.repeat(600);
      expect(sanitizeString(longString).length).toBe(500);
    });
  });
});
