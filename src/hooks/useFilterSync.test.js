import { describe, it, expect } from 'vitest';
import { filtersToUrlParams, urlParamsToFilters } from './useFilterSync';

describe('useFilterSync', () => {
  const mockUniqueValues = {
    years: [2024, 2025],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    regions: ['Москва', 'Санкт-Петербург'],
    customers: ['Customer A', 'Customer B'],
    suppliers: ['Supplier A'],
    products: ['Product A']
  };

  describe('filtersToUrlParams', () => {
    it('should create URL params from filters', () => {
      const filters = {
        years: [],
        months: [],
        regions: ['Москва'],
        customers: [],
        suppliers: [],
        products: [],
        minAmount: 0,
        maxAmount: 1e9
      };

      const params = filtersToUrlParams(filters, [], []);
      expect(params).toContain('regions=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0');
    });

    it('should handle selected years', () => {
      const filters = { years: [], months: [], regions: [], customers: [], suppliers: [], products: [], minAmount: 0, maxAmount: 1e9 };
      const params = filtersToUrlParams(filters, [2024, 2025], []);
      expect(params).toContain('years=2024%2C2025');
    });

    it('should handle selected months', () => {
      const filters = { years: [], months: [], regions: [], customers: [], suppliers: [], products: [], minAmount: 0, maxAmount: 1e9 };
      const params = filtersToUrlParams(filters, [], [1, 2, 3]);
      expect(params).toContain('months=1%2C2%2C3');
    });

    it('should not include empty values', () => {
      const filters = { years: [], months: [], regions: [], customers: [], suppliers: [], products: [], minAmount: 0, maxAmount: 1e9 };
      const params = filtersToUrlParams(filters, [], []);
      expect(params).toBe('');
    });

    it('should include minAmount when not zero', () => {
      const filters = { years: [], months: [], regions: [], customers: [], suppliers: [], products: [], minAmount: 1000, maxAmount: 1e9 };
      const params = filtersToUrlParams(filters, [], []);
      expect(params).toContain('minAmount=1000');
    });
  });

  describe('urlParamsToFilters', () => {
    it('should parse regions from URL params', () => {
      const params = new URLSearchParams('regions=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0');
      const { filters } = urlParamsToFilters(params, mockUniqueValues);
      expect(filters.regions).toContain('Москва');
    });

    it('should parse years from URL params', () => {
      const params = new URLSearchParams('years=2024%2C2025');
      const { selectedYears } = urlParamsToFilters(params, mockUniqueValues);
      expect(selectedYears).toEqual([2024, 2025]);
    });

    it('should parse months from URL params', () => {
      const params = new URLSearchParams('months=1%2C2%2C3');
      const { selectedMonths } = urlParamsToFilters(params, mockUniqueValues);
      expect(selectedMonths).toEqual([1, 2, 3]);
    });

    it('should filter out invalid values', () => {
      const params = new URLSearchParams('years=2024%2C9999');
      const { selectedYears } = urlParamsToFilters(params, mockUniqueValues);
      expect(selectedYears).toEqual([2024]);
    });

    it('should return empty filters for empty params', () => {
      const params = new URLSearchParams('');
      const { filters, selectedYears, selectedMonths } = urlParamsToFilters(params, mockUniqueValues);
      expect(filters.regions).toEqual([]);
      expect(selectedYears).toEqual([]);
      expect(selectedMonths).toEqual([]);
    });
  });
});
