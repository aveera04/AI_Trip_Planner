import { useState, useEffect } from 'react';

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  response?: {
    answer: string;
    processingTime?: number;
  };
}

export const useQueryHistory = () => {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  useEffect(() => {
    // Load history from localStorage on mount
    try {
      const stored = localStorage.getItem('travelPlannerHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Error loading query history:', error);
    }
  }, []);

  const saveToStorage = (newHistory: QueryHistoryItem[]) => {
    try {
      localStorage.setItem('travelPlannerHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving query history:', error);
    }
  };

  const addQuery = (query: string, response?: { answer: string; processingTime?: number }) => {
    const newItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      response
    };

    const newHistory = [newItem, ...history.slice(0, 49)]; // Keep only latest 50 items
    setHistory(newHistory);
    saveToStorage(newHistory);
    return newItem.id;
  };

  const updateQueryResponse = (id: string, response: { answer: string; processingTime?: number }) => {
    const newHistory = history.map(item => 
      item.id === id ? { ...item, response } : item
    );
    setHistory(newHistory);
    saveToStorage(newHistory);
  };

  const removeQuery = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    saveToStorage(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    saveToStorage([]);
  };

  const searchHistory = (searchTerm: string) => {
    return history.filter(item => 
      item.query.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    history,
    addQuery,
    updateQueryResponse,
    removeQuery,
    clearHistory,
    searchHistory
  };
};

export type { QueryHistoryItem };
