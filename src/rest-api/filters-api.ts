import api from './api';
import { Filter } from '@/@types';

/**
 * Fetch all filters for an event
 */
export const getFilters = async (taskId: string) => {
    const response = await api.get(`/event/${taskId}/filters`);
    return response.data.filters;
};

/**
 * Add a new filter to an event
 */
export const addFilter = async (taskId: string, filter: Omit<Filter, 'id'>) => {
    const response = await api.post(`/event/${taskId}/filters`, filter);
    return response.data;
};

/**
 * Remove a filter from an event
 */
export const removeFilter = async (taskId: string, filterId: string) => {
    const response = await api.delete(`/event/${taskId}/filters/${filterId}`);
    return response.data;
};

/**
 * Update a filter
 */
export const updateFilter = async (taskId: string, filter: Filter) => {

    // const filterToUpdate = {
    //     sections: filter.sections,
    //     priority: filter.priority,
    //     rows: filter.rows,
    //     excluded_ticket_types: filter.excluded_ticket_types,
    //     min_price: filter.min_price,
    //     max_price: filter.max_price,
    //     min_seats: filter.min_seats,
    //     max_seats: filter.max_seats
    // }

    const response = await api.post(`/event/${taskId}/filters/${filter.id}`, filter);
    return response.data;
};

/**
 * Drop tickets that don't match current filters
 */

export const updateFilterOrder = async (taskId: string, filterOrder: string[]) => {
    const response = await api.post(`/event/${taskId}/filters/reorder`, { order: filterOrder });
    return response.data;
};

export const dropNonMatchingCarts = async (taskId: string) => {
    const response = await api.get(`/event/${taskId}/filters/drop`);
    return response.data;
};

/**
 * Reset all filters for an event
 */
export const resetFilters = async (taskId: string) => {
    const response = await api.delete(`/events/${taskId}/filters`);
    return response.data;
};