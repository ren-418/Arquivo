import api from './api';
import { Filter } from '@/types';

/**
 * Fetch all filters for an event
 */
export const getFilters = async (taskId: string) => {
    const response = await api.get(`/events/${taskId}/filters`);
    return response.data.filters;
};

/**
 * Add a new filter to an event
 */
export const addFilter = async (taskId: string, filter: Omit<Filter, 'id'>) => {
    const response = await api.post(`/events/${taskId}/filters`, filter);
    return response.data;
};

/**
 * Remove a filter from an event
 */
export const removeFilter = async (taskId: string, filterId: string) => {
    const response = await api.delete(`/events/${taskId}/filters/${filterId}`);
    return response.data;
};

/**
 * Drop tickets that don't match current filters
 */
export const dropNonMatchingCarts = async (taskId: string) => {
    const response = await api.get(`/events/${taskId}/filters/drop`);
    return response.data;
};

/**
 * Reset all filters for an event
 */
export const resetFilters = async (taskId: string) => {
    const response = await api.delete(`/events/${taskId}/filters`);
    return response.data;
};