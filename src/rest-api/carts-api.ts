import api from './api';

export const getCartedTickets = async (eventId: string) => {
    const response = await api.get(`/event/${eventId}/carts`);
    return response.data.carts;
};

export const dropCartedTicket = async (eventId: string, cartId: string) => {
    const response = await api.get(`/event/${eventId}/cart/${cartId}/drop`);
    return response.data;
};

export const checkoutCartedTicket = async (eventId: string, cartId: string) => {
    const response = await api.get(`/event/${eventId}/cart/${cartId}/checkout`);
    return response.data;
};







