import axios from 'axios';
import { PresaleCode } from '@/types';

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: 'http://127.0.0.1:8282',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to fetch presale codes for an event
export const fetchEventPresaleCodes = async (eventId: string): Promise<{ codes: PresaleCode[] }> => {
    try {
        const response = await api.get(`/tasks/${eventId}/presale-codes`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching presale codes for event ${eventId}:`, error);
        throw error;
    }
};

// Function to add presale codes to an event
export const addEventPresaleCodes = async (eventId: string, codes: string[], areGeneric: boolean): Promise<any> => {
    try {
        const response = await api.post(`/tasks/${eventId}/presale-codes`, {
            codes: codes,
            are_generic: areGeneric
        });
        return response.data;
    } catch (error) {
        console.error(`Error adding presale codes to event ${eventId}:`, error);
        throw error;
    }
};

// Function to clear presale codes from an event
export const clearEventPresaleCodes = async (eventId: string): Promise<any> => {
    try {
        const response = await api.delete(`/tasks/${eventId}/presale-codes`);
        return response.data;
    } catch (error) {
        console.error(`Error clearing presale codes for event ${eventId}:`, error);
        throw error;
    }
};

export default api;