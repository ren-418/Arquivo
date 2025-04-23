import axios from 'axios';
import { AddEventPayload, EventsResponse, Event } from '@/types';

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: 'http://172.233.123.242:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const dropCart = async (taskId: string, cartId: number) => {
    const response = await api.post(`/tasks/${taskId}/carts/${cartId}/drop`);
    return response.data;
};

export const checkoutCart = async (taskId: string, cartId: number) => {
    const response = await api.post(`/tasks/${taskId}/carts/${cartId}/checkout`);
    return response.data;
};

// Function to fetch all events
export const fetchEvents = async (): Promise<EventsResponse> => {
    try {
        const response = await api.get('/tasks');
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

// Function to fetch a single event by ID
export const fetchEventById = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.get(`/tasks/${eventId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
        throw error;
    }
};

export const enableCarting = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.post(`/tasks/${eventId}/enable-carting`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
        throw error;
    }
};


export const enableQuickPicks = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.post(`/tasks/${eventId}/enable-quickpicks`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
        throw error;
    }
};

export const enableQB = async (eventId: string): Promise<{ task: Event }> => {
    try {
        const response = await api.post(`/tasks/${eventId}/enable-qb`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
        throw error;
    }
};

// Function to add a new event
export const addEvent = async (eventData: AddEventPayload): Promise<any> => {
    try {
        const response = await api.post('/tasks', eventData);
        return response.data;
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
};

// Function to delete an event
export const deleteEvent = async (eventId: string): Promise<any> => {
    try {
        const response = await api.delete(`/tasks/${eventId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};


// History API Service
const API_URL = '/api/history';
export const HistoryService = {

    // Get all histories
    async getAllHistories() {
        const response = await api.get(API_URL);
        return response.data;
    },

    // Get history by ID
    async getHistoryById(id: string) {
        const response = await api.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Delete history
    async deleteHistory(id: string) {
        const response = await api.delete(`${API_URL}/${id}`);
        return response.data;
    },

    // Get queue data for a history
    async getQueueData(historyId: string) {
        const response = await api.get(`${API_URL}/${historyId}/queue`);
        return response.data;
    },

    // Get cart data for a history
    async getCartData(historyId: string) {
        const response = await api.get(`${API_URL}/${historyId}/carts`);
        return response.data;
    },

    // Get checkout data for a history
    async  getCheckoutData(historyId: string) {
        const response = await api.get(`${API_URL}/${historyId}/checkouts`);
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