// API Service Layer for AI Travel Planner
// Centralized HTTP client with error handling and configuration

interface TravelPlanRequest {
  question: string;
}

interface TravelPlanResponse {
  answer: string;
  timestamp: string;
  status: 'success' | 'error';
  query: string;
}

interface ErrorResponse {
  error: string;
  timestamp: string;
  status: 'error';
  query?: string;
}

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
}

interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: Record<string, string>;
  frontend_url: string;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // Environment-based configuration
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.timeout = 300000; // 5 minutes for AI processing
  }

  /**
   * Generic fetch wrapper with error handling and timeout
   */
  private async fetchWithTimeout<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.detail || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - AI processing took too long. Please try again.');
        }
        throw error;
      }
      
      throw new Error('Network error occurred. Please check your connection.');
    }
  }

  /**
   * Generate travel plan
   */
  async generateTravelPlan(request: TravelPlanRequest): Promise<TravelPlanResponse> {
    return this.fetchWithTimeout<TravelPlanResponse>('/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthResponse> {
    return this.fetchWithTimeout<HealthResponse>('/health', {
      method: 'GET',
    });
  }

  /**
   * Get API information
   */
  async getApiInfo(): Promise<ApiInfoResponse> {
    return this.fetchWithTimeout<ApiInfoResponse>('/api/info', {
      method: 'GET',
    });
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  TravelPlanRequest,
  TravelPlanResponse,
  ErrorResponse,
  HealthResponse,
  ApiInfoResponse,
};
