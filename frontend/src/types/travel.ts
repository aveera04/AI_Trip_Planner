// Type definitions for enhanced travel planner features
// Used for localStorage persistence and component state management

import { TravelPlanResponse } from "@/services/api";

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  response?: {
    answer: string;
    processingTime?: number;
  };
}

export interface TravelPlanExport {
  answer: string;
  query: string;
  timestamp: string;
  processingTime?: number;
}

export interface ExampleQuery {
  category: string;
  query: string;
  icon: string;
}

export interface LoadingMessage {
  text: string;
  duration: number;
}

// Enhanced API response types
export interface EnhancedTravelPlanResponse extends TravelPlanResponse {
  processingTime?: number;
  requestTimestamp?: string;
}

// Component props types
export interface QueryHistoryProps {
  onSelectQuery: (query: string) => void;
  currentQuery?: string;
}

export interface ExportMenuProps {
  travelPlan: TravelPlanExport;
  className?: string;
}

// localStorage keys
export const STORAGE_KEYS = {
  QUERY_HISTORY: 'travelPlannerHistory',
  USER_PREFERENCES: 'travelPlannerPreferences',
  LAST_QUERY: 'travelPlannerLastQuery'
} as const;

// Configuration constants
export const CONFIG = {
  MAX_HISTORY_ITEMS: 50,
  LOADING_MESSAGE_INTERVAL: 3000,
  CONNECTION_CHECK_INTERVAL: 30000,
  MAX_QUERY_LENGTH: 1000,
  TRUNCATE_LENGTH: 80
} as const;
