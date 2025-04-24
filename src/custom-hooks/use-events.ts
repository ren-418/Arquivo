import { useState, useEffect, useCallback } from 'react';
import { fetchEvents, addEvent, deleteEvent } from '@/rest-api/api';
import { transformEventsToTableData } from '@/utils/utils';
import { toast } from "sonner"
import { AddEventPayload, EventsResponse, EventTableItem } from '../@types/index';

export function useEvents() {
    const [eventsData, setEventsData] = useState<EventsResponse>({});
    const [tableData, setTableData] = useState<EventTableItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load events data
    const loadEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchEvents();
            setEventsData(data);
            setTableData(transformEventsToTableData(data));
        } catch (err) {
            setError('Failed to load events. Please try again later.');
            // toast.error('Failed to load events. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add a new event
    const handleAddEvent = useCallback(async (eventData: AddEventPayload) => {
        try {
            await addEvent(eventData);
            // toast.success('Event added successfully!');
            // Reload events after adding
            loadEvents();
            return true;
        } catch (err) {
            // toast.error('Failed to add event. Please try again.');
            return false;
        }
    }, [loadEvents]);

    // Delete an event
    const handleDeleteEvent = useCallback(async (eventId: string) => {
        try {
            await deleteEvent(eventId);
            // toast.success('Event deleted successfully!');
            // Reload events after deletion
            loadEvents();
            return true;
        } catch (err) {
            // toast.error('Failed to delete event. Please try again.');
            return false;
        }
    }, [loadEvents]);

    // Load events on component mount
    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    return {
        eventsData,
        tableData,
        isLoading,
        error,
        refreshEvents: loadEvents,
        addEvent: handleAddEvent,
        deleteEvent: handleDeleteEvent,
    };
}