export interface Account {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    address_line_1: string;
    city: string;
    PostalCode: string;
    phone: string;
    proxy: string;
    card_number: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
    bid: string;
    checked_out: {
        order_id: string;
        row: string;
        section: string;
        seats: null | string[];
        price: string;
        map: string;
        message: string;
    };
    carted: {
        checkout_url: string;
        row: string;
        section: string;
        seats: null | string[];
        price: string;
        map: string;
        deadline: string;
        carts_remaining: number;
    };
    id_token: string;
    sid: string;
    sotc: string;
    sortc: string;
    ma_dvt: string;
    qb_bypass: boolean;
    status: string;
    queue_position: string;
}

export interface TicketType {
    type_id: string;
    event_id: string;
    name: string;
}

export interface Event {
    event_url: string;
    event_id: string;
    name: string;
    date: string;
    map_id: string;
    eps_mgr: string;
    domain: string;
    host: string;
    venue: string;
    rows: string[];
    seats: null | string[];
    sections: string[];
    accounts: Record<string, Account>;
    min_seats: number;
    max_seats: number;
    delay: number;
    is_delay_enabled: boolean;
    ticket_types: TicketType[];
    has_queue: boolean;
    is_qb_enabled: boolean;
}

export interface EventsResponse {
    [key: string]: Event;
}

export interface AddEventPayload {
    event_url: string;
    min_amount_of_seats: number;
    max_amount_of_seats: number;
    number_of_accounts: number;
    delay: number;
}

export interface EventTableItem {
    id: string;
    name: string;
    date: string;
    venue: string;
    accountsCount: number;
}
export interface PresaleCodeSet {
    id: number;
    name: string;
    codesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PresaleCodeSetDetail {
    id: number;
    name: string;
    codes: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AddPresaleCodeSetPayload {
    name: string;
    codes: string[];
}

export interface UpdatePresaleCodeSetPayload {
    name: string;
    codes: string[];
}// Presale code for an event
export interface PresaleCode {
    code: string;
    ticket_types?: string[];
    token: string;
    is_used: boolean;
    are_generic: boolean;
    is_valid: boolean;
}
// Event filter types
export interface Filter {
    id?: string;
    sections: string[];
    rows: string[];
    excluded_ticket_types: string[];
    min_price: number;
    max_price: number;
    min_seats: number;
    max_seats: number;
}
