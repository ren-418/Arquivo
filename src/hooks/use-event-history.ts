// hooks/use-event-history.ts
import { useState, useEffect, useCallback } from 'react';
import { HistoryEvent } from '@/types/history';
import { toast } from 'sonner';
import { HistoryService, handleApiError, withRetry } from "@/lib/api"

export function useEventHistory() {
    const [events, setEvents] = useState<HistoryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch events
    const fetchEventHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Use the service with retry mechanism
            const data = await withRetry(() => HistoryService.getAllHistories());
            setEvents(data);
        } catch (err) {
            const errorMessage = handleApiError(err, 'Failed to load event history');
            setError(errorMessage);
            console.error('Error fetching events:', err);
            // toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Delete event
    const deleteEvent = useCallback(async (eventId: string) => {
        try {
            await HistoryService.deleteHistory(eventId);
            // Update local state to remove deleted event
            setEvents(prev => prev.filter(event => event.id !== eventId));
            // toast.success("Event deleted successfully");
            return true;
        } catch (err) {
            const errorMessage = handleApiError(err, 'Failed to delete event');
            console.error('Error deleting event:', err);
            // toast.error(errorMessage);
            throw err;
        }
    }, []);

    // Fetch events on component mount
    useEffect(() => {
        fetchEventHistory();
    }, [fetchEventHistory]);

    return {
        events,
        isLoading,
        error,
        refreshEvents: fetchEventHistory,
        deleteEvent
    };
}