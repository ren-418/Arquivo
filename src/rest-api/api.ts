import axios from 'axios';
import { AddEventPayload, EventsResponse, Event } from '@/@types';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const cartsApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_CARTS,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to fetch all events
export const fetchEvents = async (): Promise<EventsResponse> => {
    try {
        const response = await api.get('/events');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};


// Function to fetch a single event by ID
export const fetchEventById = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.get(`/event/${eventId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
        throw error;
    }
};

export const enableCarting = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.post(`/event/${eventId}/carting/start`);
        return response.data;
    } catch (error) {
        console.error(`Error enabling carting for event with ID ${eventId}:`, error);
        throw error;
    }
};


export const enableQuickPicks = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.post(`/event/${eventId}/availability/start`);
        return response.data;
    } catch (error) {
        console.error(`Error enabling quick picks for event with ID ${eventId}:`, error);
        throw error;
    }
};

export const enableQB = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.post(`/events/${eventId}/enable-qb`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
        throw error;
    }
};

// Function to add a new event
export const addEvent = async (eventData: AddEventPayload): Promise<any> => {
    try {
        console.log('eventData:', eventData);
        const response = await api.post('/event', eventData);
        return response.data;
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
};

// Function to delete an event
export const deleteEvent = async (eventId: string): Promise<any> => {

    try {
        const response = await api.delete(`/event?id=${eventId}`);
        return response.data;
    } catch (error) { 
        console.error('Error deleting event:', error);
        throw error;
    }
};


// History API Service
export const HistoryService = {

    // Get all histories
    async getAllHistories() {
        const response = await api.get('/history');
        return response.data;
    },

    // Get history by ID
    async getHistoryById(id: string) {
        const response = await api.get(`/history/${id}`);
        return response.data;
    },

    // Delete history
    async deleteHistory(id: string) {
        const response = await api.delete(`/history/${id}`);
        return response.data;
    },

    // Get queue data for a history
    async getQueueData(historyId: string) {
        const response = await api.get(`/queue-history`);
        return response.data;
    },

    // Get cart data for a history
    async getCartData(historyId: string) {
        const response = await api.get(`/cart-history`);
        return response.data;
    },

    // Get checkout data for a history
    async  getCheckoutData(historyId: string) {
        const response = await api.get(`/checkout-history`);
        return response.data;
    }
};

// Retry utility for API calls
export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 1.5);
        }
        throw error;
    }
}

// Error handler utility
export function handleApiError(error: any, fallbackMessage = 'An error occurred'): string {
    if (axios.isAxiosError(error)) {
        // Handle Axios errors
        const response = error.response;
        if (response && response.data && response.data.error) {
            return response.data.error;
        }
        if (response && response.status) {
            switch (response.status) {
                case 400: return 'Invalid request data';
                case 401: return 'Unauthorized, please login again';
                case 403: return 'You do not have permission to access this resource';
                case 404: return 'The requested resource was not found';
                case 500: return 'Server error, please try again later';
                default: return `Error (${response.status})`;
            }
        }
        return error.message || fallbackMessage;
    }

    // Handle non-Axios errors
    if (error instanceof Error) {
        return error.message;
    }

    return fallbackMessage;
}

export default api;