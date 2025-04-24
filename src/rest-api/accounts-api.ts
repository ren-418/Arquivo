import axios from 'axios';
import { Account } from '@/@types';

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: 'http://172.233.123.242:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to fetch all accounts
export const fetchAccounts = async (): Promise<Account[]> => {
    try {
        const response = await api.get('/accounts');
        return response.data;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
};

// Function to add new accounts
export const addAccounts = async (accountStrings: string[]): Promise<any> => {
    try {
        const response = await api.post('/accounts', { accounts: accountStrings });
        return response.data;
    } catch (error) {
        console.error('Error adding accounts:', error);
        throw error;
    }
};

// Function to delete an account
export const deleteAccount = async (email: string): Promise<any> => {
    try {
        const response = await api.delete(`/accounts/${email}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
};

export default api;