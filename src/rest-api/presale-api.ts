import axios from 'axios';
import { PresaleCodeSet, PresaleCodeSetDetail, AddPresaleCodeSetPayload, UpdatePresaleCodeSetPayload } from '@/@types';

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: 'http://172.233.123.242:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to fetch all presale code sets
export const fetchPresaleCodeSets = async (): Promise<{ presales: PresaleCodeSet[] }> => {
    try {
        const response = await api.get('/presales');
        return response.data;
    } catch (error) {
        console.error('Error fetching presale code sets:', error);
        throw error;
    }
};

// Function to fetch a single presale code set with details
export const fetchPresaleCodeSetDetail = async (id: number): Promise<{ presale: PresaleCodeSetDetail }> => {
    try {
        const response = await api.get(`/presales/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching presale code set detail for ID ${id}:`, error);
        throw error;
    }
};

// Function to add a new presale code set
export const addPresaleCodeSet = async (data: AddPresaleCodeSetPayload): Promise<any> => {
    try {
        const response = await api.post('/presales', { presales: [data] });
        return response.data;
    } catch (error) {
        console.error('Error adding presale code set:', error);
        throw error;
    }
};

// Function to update an existing presale code set
export const updatePresaleCodeSet = async (id: number, data: UpdatePresaleCodeSetPayload): Promise<any> => {
    try {
        const response = await api.put(`/presales/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating presale code set with ID ${id}:`, error);
        throw error;
    }
};

// Function to delete a presale code set
export const deletePresaleCodeSet = async (id: number): Promise<any> => {
    try {
        const response = await api.delete(`/presales/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting presale code set with ID ${id}:`, error);
        throw error;
    }
};

export default api;