// hooks/use-checkouts-data.ts
import { useState, useEffect, useCallback } from 'react';
import { CheckoutItem } from '@/@types/history';
import { toast } from 'sonner';
import { HistoryService, handleApiError, withRetry } from '@/rest-api/api';

export function useCheckoutsData(eventId: string) {
    const [checkoutsData, setCheckoutsData] = useState<CheckoutItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch checkouts data
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
            const data = await withRetry(() => HistoryService.getCheckoutData(eventId));
            setCheckoutsData(data);
        } catch (err) {
            const errorMessage = handleApiError(err, 'Failed to load checkout data');
            setError(errorMessage);
            console.error('Error fetching checkout data:', err);
            // toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    // Fetch data on component mount or eventId change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        checkoutsData,
        isLoading,
        error,
        refreshCheckoutsData: fetchData
    };
}