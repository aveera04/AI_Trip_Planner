// Daily quota management system for travel planner

const DAILY_QUOTA = 5;
const QUOTA_KEY = 'travel_planner_daily_quota';

export interface QuotaData {
  count: number;
  resetDate: string; // ISO date string for midnight
}

/**
 * Get current quota status, resetting if it's a new day
 */
export function getQuotaStatus(): QuotaData {
  // Get today's date reset time (midnight)
  const today = new Date();
  const resetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  
  // Get stored quota data
  const storedData = localStorage.getItem(QUOTA_KEY);
  let quotaData: QuotaData;
  
  if (storedData) {
    try {
      quotaData = JSON.parse(storedData);
      
      // Reset quota if it's a new day
      if (quotaData.resetDate !== resetDate) {
        quotaData = { count: 0, resetDate };
        localStorage.setItem(QUOTA_KEY, JSON.stringify(quotaData));
      }
    } catch (e) {
      // If parsing fails, reset to default
      quotaData = { count: 0, resetDate };
      localStorage.setItem(QUOTA_KEY, JSON.stringify(quotaData));
    }
  } else {
    // Initialize new quota
    quotaData = { count: 0, resetDate };
    localStorage.setItem(QUOTA_KEY, JSON.stringify(quotaData));
  }
  
  return quotaData;
}

/**
 * Check if user has remaining queries for today
 */
export function hasRemainingQueries(): boolean {
  const { count } = getQuotaStatus();
  return count < DAILY_QUOTA;
}

/**
 * Record query usage
 */
export function recordQueryUsage(): void {
  const quotaData = getQuotaStatus();
  quotaData.count += 1;
  localStorage.setItem(QUOTA_KEY, JSON.stringify(quotaData));
}

/**
 * Get number of remaining queries for today
 */
export function getRemainingQueries(): number {
  const { count } = getQuotaStatus();
  return Math.max(0, DAILY_QUOTA - count);
}

/**
 * Get time until quota reset (in milliseconds)
 */
export function getTimeUntilReset(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime() - now.getTime();
}

/**
 * Format time until reset in human-readable format
 */
export function getFormattedTimeUntilReset(): string {
  const msUntilReset = getTimeUntilReset();
  const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
  const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Get the daily quota limit
 */
export function getDailyQuota(): number {
  return DAILY_QUOTA;
}
