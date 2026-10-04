/**
 * Date formatting utilities for ElderCare webapp
 */

export const formatCurrentDate = (): string => {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
};

export const formatShortDate = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
};

export const getTodayDayName = (): string => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
};
