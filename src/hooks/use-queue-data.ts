// hooks/use-queue-data.ts
import { useState, useEffect, useCallback } from 'react';
import { QueueItem } from '@/types/history';
import { toast } from 'sonner';
import { HistoryService, handleApiError, withRetry } from '@/lib/api';

export function useQueueData(eventId: string) {
  const [queueData, setQueueData] = useState<QueueItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch queue data
  const fetchData = useCallback(async () => {
    if (!eventId) {
      setError('Event ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Use the service with retry mechanism
      const data = await withRetry(() => HistoryService.getQueueData(eventId));
      setQueueData(data);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to load queue data');
      setError(errorMessage);
      console.error('Error fetching queue data:', err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Fetch data on component mount or eventId change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    queueData,
    isLoading,
    error,
    refreshQueueData: fetchData
  };
}