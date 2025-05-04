// hooks/use-history-detail.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { HistoryEventDetail } from '@/@types/history';

// API endpoint for history
const API_URL = '/api/history';

export function useHistoryDetail(eventId: string) {
    const [eventDetail, setEventDetail] = useState<HistoryEventDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch event detail
    const fetchDetail = useCallback(async () => {
        if (!eventId) {
            setError('Event ID is required');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/${eventId}`);
            setEventDetail(response.data);
        } catch (err) {
            // setError('Failed to load event details. Please try again later.');
            console.error('Error fetching event detail:', err);
            // toast.error('Failed to load event details');
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    // Fetch event detail on component mount or eventId change
    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        eventDetail,
        isLoading,
        error,
        refreshEventDetail: fetchDetail
    };
}