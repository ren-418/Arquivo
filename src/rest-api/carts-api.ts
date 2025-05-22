import api from './api';
import { cartsApi } from './api';

const USE_MOCK_DATA = true; // Set to false to use real API

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

export const getAllEvents = async () => {
    if (USE_MOCK_DATA) {
        return [
            {
                id: "9cd05a79-005b-4c70-a1d5-b78e3fc9f710",
                event_name: "Hamilton (Touring)",
                date: "2025-07-31",
                venue: "DeVos Performance Hall"
            },
            {
                id: "0b947f4b-d2fc-4216-8737-9459c5d61ef2",
                event_name: "Lainey Wilson",
                date: "2025-06-26",
                venue: "American Family Insurance Amphitheater - Summerfest Grounds"
            },
            {
                id: "057b96fb-ce0f-495d-a24e-af6ec4328ca4",
                event_name: "Megan Thee Stallion",
                date: "2025-06-28",
                venue: "American Family Insurance Amphitheater - Summerfest Grounds"
            }
        ];
    }
    const response = await cartsApi.get('/events');
    return response.data;
};

interface Event {
    id: string;
    event_name?: string;
    date?: string;
    venue?: string;
}

export const getWholeCartedTickets = async () => {
    if (USE_MOCK_DATA) {
        return [
            {
                id: "cart1",
                event_id: "9cd05a79-005b-4c70-a1d5-b78e3fc9f710",
                event_name: "Hamilton (Touring)",
                event_date: "2025-07-31",
                event_venue: "DeVos Performance Hall",
                email: "user1@example.com",
                section: "A",
                row: "1",
                image: "",
                seats: "1,2",
                price: 120,
                carts_remaining: 2,
                deadline: "2025-07-31T20:00:00Z",
                checkout_url: "https://checkout.com/1"
            },
            {
                id: "cart2",
                event_id: "0b947f4b-d2fc-4216-8737-9459c5d61ef2",
                event_name: "Lainey Wilson",
                event_date: "2025-06-26",
                event_venue: "American Family Insurance Amphitheater - Summerfest Grounds",
                email: "user2@example.com",
                section: "B",
                row: "2",
                image: "",
                seats: "3,4",
                price: 90,
                carts_remaining: 1,
                deadline: "2025-06-26T19:00:00Z",
                checkout_url: "https://checkout.com/2"
            }
        ];
    }
    const events = await getAllEvents();
    const allCarts = await Promise.all(
        events.map(async (event: Event) => {
            const response = await cartsApi.get(`/event/${event.id}/carts`);
            return response.data.carts;
        })
    );
    return allCarts.flat();
};  

export const getWholeCheckedOutTickets = async () => {
    if (USE_MOCK_DATA) {
        // Example: one checked out ticket per event
        return [
            {
                id: "checkout1",
                event_id: "9cd05a79-005b-4c70-a1d5-b78e3fc9f710",
                event_name: "Hamilton (Touring)",
                event_date: "2025-07-31",
                event_venue: "DeVos Performance Hall",
                email: "user1@example.com",
                section: "A",
                row: "1",
                seats: ["1", "2"],
                price: 120,
                orderId: "ORD123",
                message: "Success",
                map: "https://example.com/map1.png",
                purchaseDate: "2025-07-01T12:00:00Z"
            },
            {
                id: "checkout2",
                event_id: "0b947f4b-d2fc-4216-8737-9459c5d61ef2",
                event_name: "Lainey Wilson",
                event_date: "2025-06-26",
                event_venue: "American Family Insurance Amphitheater - Summerfest Grounds",
                email: "user2@example.com",
                section: "B",
                row: "2",
                seats: ["3", "4"],
                price: 90,
                orderId: "ORD456",
                message: "Success",
                map: "https://example.com/map2.png",
                purchaseDate: "2025-06-10T15:00:00Z"
            }
        ];
    }
    const events = await getAllEvents();
    const allCheckouts = await Promise.all(
        events.map(async (event: Event) => {
            const response = await cartsApi.get(`/event/${event.id}/checkouts`);
            return response.data.checkouts;
        })
    );
    return allCheckouts.flat();
};









