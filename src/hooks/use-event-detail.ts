import { useState, useEffect, useCallback, useRef } from 'react';
import { Event, Account } from '@/types';
import { fetchEventById } from '@/lib/api';
import { toast } from 'sonner';

export function useEventDetail(eventId: string) {
    const [eventDetail, setEventDetail] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    // Load event details once
    const loadEventDetail = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchEventById(eventId);
            setEventDetail(response.task);
        } catch (err) {
            setError('Failed to load event details. Please try again later.');
            // toast.error("Failed to load event details. Please try again later.")
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    // Setup polling for fresh data
    const setupPolling = useCallback(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }

        // Set up new interval (polling every second)
        intervalRef.current = window.setInterval(async () => {
            try {
                const response = await fetchEventById(eventId);
                setEventDetail(response.task);
                // Reset error state if the request succeeds after a previous error
                if (error) setError(null);
            } catch (err) {
                // Only show the error toast once, not on every failed poll
                if (!error) {
                    setError('Failed to refresh event data. Will keep trying...');
                    // toast.error("Failed to refresh event data. Will keep trying...")
                }
            }
        }, 1000); // Poll every second

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [eventId, error]);

    // Load event details on component mount
    useEffect(() => {
        loadEventDetail();
    }, [loadEventDetail]);

    // Setup polling after initial load
    useEffect(() => {
        // Only start polling once initial data is loaded
        if (!isLoading && eventDetail) {
            const cleanup = setupPolling();
            return cleanup;
        }
    }, [isLoading, eventDetail, setupPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    // Extract accounts as an array for easier manipulation
    const accountsArray = eventDetail ?
        Object.entries(eventDetail.accounts).map(([id, account]) => ({
            id,
            ...account
        })) : [];

    // Extract event metadata
    const eventInfo = eventDetail ? {
        name: eventDetail.name,
        date: eventDetail.date,
        venue: eventDetail.venue,
        hasQueue: eventDetail.has_queue,
        isQbEnabled: eventDetail.is_qb_enabled,
    } : null;

    return {
        eventDetail,
        eventInfo,
        accountsArray,
        isLoading,
        error,
        refreshEventDetail: loadEventDetail,
    };
}