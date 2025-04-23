// hooks/use-carts-data.ts
import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types/history';
import { toast } from 'sonner';
import { HistoryService, handleApiError, withRetry } from '@/lib/api';

export function useCartsData(eventId: string) {
  const [cartsData, setCartsData] = useState<CartItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch carts data
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
      const data = await withRetry(() => HistoryService.getCartData(eventId));
      setCartsData(data);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to load cart data');
      setError(errorMessage);
      console.error('Error fetching cart data:', err);
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
    cartsData,
    isLoading,
    error,
    refreshCartsData: fetchData
  };
}