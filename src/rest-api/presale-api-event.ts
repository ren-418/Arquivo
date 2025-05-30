import axios from 'axios';
import { PresaleCode } from '@/@types';

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to fetch presale codes for an event
export const fetchEventPresaleCodes = async (eventId: string): Promise<{ codes: PresaleCode[] }> => {
    try {
        const response = await api.get(`/event/${eventId}/presale_codes`);
        return response.data.presale_codes;
    } catch (error) {
        console.error(`Error fetching presale codes for event ${eventId}:`, error);
        throw error;
    }
};

// Function to add presale codes to an event
export const addEventPresaleCodes = async (eventId: string, codes: string[], areGeneric: boolean): Promise<any> => {
    try {
        console.log("Adding presale codes to event:", eventId, codes, areGeneric);
        const response = await api.post(`/event/${eventId}/presale_codes`, {
            presale_codes: codes,
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
        const response = await api.get(`/event/${eventId}/presale_codes/clear`);
        return response.data;
    } catch (error) {
        console.error(`Error clearing presale codes for event ${eventId}:`, error);
        throw error;
    }
};

// Function to recheck presale codes for an event
export const recheckEventPresaleCodes = async (eventId: string): Promise<any> => {
    try {
        const response = await api.get(`/event/${eventId}/presale_codes/recheck`);
        return response.data;
    } catch (error) {
        console.error(`Error rechecking presale codes for event ${eventId}:`, error);
        throw error;
    }
};

export default api;