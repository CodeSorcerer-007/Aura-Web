import { describe, it, expect } from 'vitest';
import {
  formatLocalDate,
  getTodayDateString,
  formatDate,
  isOverdue,
  parseIntelligentDeadline
} from '../src/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatLocalDate', () => {
    it('formats a date to YYYY-MM-DD in local time', () => {
      const d = new Date(2026, 8, 20); // Sept 20, 2026 (0-indexed month)
      expect(formatLocalDate(d)).toBe('2026-09-20');
    });

    it('pads single digit months and days with leading zeroes', () => {
      const d = new Date(2026, 0, 5); // Jan 5, 2026
      expect(formatLocalDate(d)).toBe('2026-01-05');
    });

    it('returns null for invalid or null inputs', () => {
      expect(formatLocalDate(null)).toBeNull();
      expect(formatLocalDate(undefined)).toBeNull();
      expect(formatLocalDate(new Date('invalid'))).toBeNull();
    });
  });

  describe('getTodayDateString', () => {
    it('returns today as YYYY-MM-DD', () => {
      const today = getTodayDateString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatDate', () => {
    it('formats YYYY-MM-DD string to readable month, day, year', () => {
      const formatted = formatDate('2026-09-20');
      expect(formatted).toContain('Sep');
      expect(formatted).toContain('20');
      expect(formatted).toContain('2026');
    });

    it('returns null for empty or null string', () => {
      expect(formatDate(null)).toBeNull();
      expect(formatDate('')).toBeNull();
    });
  });

  describe('isOverdue', () => {
    it('returns true for past dates', () => {
      expect(isOverdue('2020-01-01')).toBe(true);
    });

    it('returns false for future dates', () => {
      expect(isOverdue('2099-12-31')).toBe(false);
    });
  });

  describe('parseIntelligentDeadline', () => {
    it('parses "tomorrow" and extracts deadline', () => {
      const result = parseIntelligentDeadline('Review documentation tomorrow');
      const expectedTomorrow = new Date();
      expectedTomorrow.setDate(expectedTomorrow.getDate() + 1);
      const expectedStr = formatLocalDate(expectedTomorrow);

      expect(result.deadline).toBe(expectedStr);
      expect(result.cleanedText).toBe('Review documentation');
    });

    it('parses "in 3 days" relative deadline', () => {
      const result = parseIntelligentDeadline('Deploy release in 3 days');
      const expected = new Date();
      expected.setDate(expected.getDate() + 3);
      expect(result.deadline).toBe(formatLocalDate(expected));
      expect(result.cleanedText).toBe('Deploy release');
    });

    it('parses recurring cadences', () => {
      const daily = parseIntelligentDeadline('Meditation every day');
      expect(daily.recurring).toEqual({ type: 'daily' });
      expect(daily.deadline).toBe(getTodayDateString());

      const weekly = parseIntelligentDeadline('Team sync every week');
      expect(weekly.recurring).toEqual({ type: 'weekly' });
    });

    it('parses ordinal dates like "oct 15th"', () => {
      const result = parseIntelligentDeadline('Quarterly planning on oct 15th');
      expect(result.deadline).toMatch(/^\d{4}-10-15$/);
      expect(result.cleanedText).toBe('Quarterly planning');
    });
  });
});
