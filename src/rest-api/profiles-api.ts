import axios from 'axios';
import { Profile } from '@/@types';

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to fetch all accounts
export const fetchProfiles = async (): Promise<Profile[]> => {
    try {
        const response = await api.get('/profiles');
        return response.data;
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
};

// Function to fetch profile details
export const fetchProfileDetails = async (id: string): Promise<any> => {
    try {
        const response = await api.get(`/profiles/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile details:', error);
        throw error;
    }
};

// Function to add new accounts
export const addProfiles = async (profiles: string): Promise<any> => {
    try {
        console.log("addProfiles :::", profiles)
        const response = await api.post('/profiles', { name: profiles });
        console.log("addProfiles :::", response.data)
        return response.data;
    } catch (error) {
        console.error('Error adding profiles:', error);
        throw error;
    }
};

// Function to delete an account
export const deleteProfile = async (id: string): Promise<any> => {
    try {
        const response = await api.delete(`/profiles/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
    }
};


// add account to profile
export const addAccountToProfile = async (profileId: string, account: string): Promise<any> => {
    try {

        
        const response = await api.post(`/profiles/${profileId}/accounts`, { account });
        return response.data;
    } catch (error) {
        console.error('Error adding account to profile:', error);
        throw error;
    }
};

// Function to delete an account from a profile
export const deleteAccountFromProfile = async (profileId: string, email: string): Promise<any> => {
    try {
        const response = await api.delete(`/profiles/${profileId}/accounts/${email}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting account from profile:', error);
        throw error;
    }
};

export default api;