// types/history.ts

// Main history event type
export interface HistoryEvent {
    id: string;
    name: string;
    date: string;
    venue: string;
    accounts: number;
}

// History detail type
export interface HistoryEventDetail extends HistoryEvent {
    description?: string;
    status?: 'completed' | 'archived';
    created_at: string;
}

// Queue data types
export interface QueueItem {
    email: string;
    password: string;
    queue_position: string;
    timestamp?: string;
}

// Cart data types
export interface CartItem {
    email: string;
    password: string;
    section: string;
    row: string;
    price: string;
    result: 'checkedout' | 'dropped' | 'timedout';
    timestamp?: string;
}

// Checkout data types
export interface CheckoutItem {
    email: string;
    password: string;
    order_id: string;
    section: string;
    row: string;
    price: string;
    result: 'confirmed' | 'processing' | 'verified';
    timestamp?: string;
}