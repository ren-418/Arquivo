import api from './api';

export const getCheckedOutTickets = async (eventId: string) => {
    const response = await api.get(`/event/${eventId}/checkouts`);
    return response.data.checkouts;
};






