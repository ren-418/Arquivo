import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { Event, EventTableItem, EventApiResponse } from "@/@types";

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatCountdown = (deadline: Date): string => {
  const now = new Date();
  const timeRemaining = new Date(deadline).getTime() - now.getTime();

  if (timeRemaining <= 0) {
    return 'Expired';
  }

  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Format date to a readable string
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

// Count the number of accounts in an event
// export function countAccounts(event: EventApiResponse): number {
//   console.log('event', event);
//   return Object.keys(event.accounts || {}).length;
// }

// Transform events data to table format
export function transformEventsToTableData(eventsData: EventTableItem[]): EventTableItem[] {
  
  return Object.entries(eventsData).map(([id, event]) => ({
    id:event.id,
    event_name: event.event_name,
    date: formatDate(event.date),
    venue: event.venue,
    accounts: event.accounts,
  }));
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}