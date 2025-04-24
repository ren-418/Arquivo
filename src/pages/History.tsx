// pages/HistoryPage.tsx
import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { HistoryTable } from '@/components/history/HistoryTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, ListFilter } from 'lucide-react';
import { useEventHistory } from '@/custom-hooks/use-event-history';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { events, isLoading, error, deleteEvent } = useEventHistory();
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    // Handle row click to navigate to detail page
    const handleRowClick = (eventId: string) => {
        navigate({ to: `/history/${eventId}` });
    };

    // Handle delete event
    const handleDeleteEvent = async (eventId: string) => {
        try {
            await deleteEvent(eventId);
            // toast.success("The event has been removed from your history.");
        } catch (error) {
            // toast.error("Failed to delete event. Please try again.");
        }
    };

    // Optional handlers for additional actions
    const handleExportEvent = (eventId: string) => {
        // toast.success(`Exporting event ${eventId}...`);
        // Implementation would go here
    };

    const handleDuplicateEvent = (eventId: string) => {
        // toast.success(`Duplicating event ${eventId}...`);
        // Implementation would go here
    };

    // Handle add new event
    const handleAddEvent = () => {
        navigate({ to: '/events/new' });
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setIsFiltersVisible(!isFiltersVisible);
    };

    return (
        <motion.div
            className="container mx-auto py-6 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="flex justify-between items-center"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, type: "spring" }}
            >
                <motion.h1
                    className="text-3xl font-bold tracking-tight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <span className="flex items-center">
                        Event History
                    </span>
                </motion.h1>

            </motion.div>

            <AnimatePresence>
                {isFiltersVisible && (
                    <motion.div
                        className="rounded-lg border border-border p-4 space-y-4"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Filters</h3>
                            <Button variant="ghost" size="sm" onClick={toggleFilters}>
                                Close
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Date Range</label>
                                <div className="flex gap-2">
                                    <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                    <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Venue</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="">All venues</option>
                                    <option value="online">Online</option>
                                    <option value="in-store">In-Store</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Account Count</label>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                    <input type="number" placeholder="Max" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline">Reset</Button>
                            <Button>Apply Filters</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <HistoryTable
                    events={events}
                    isLoading={isLoading}
                    error={error}
                    onRowClick={handleRowClick}
                    onDelete={handleDeleteEvent}
                    onExport={handleExportEvent}
                    onDuplicate={handleDuplicateEvent}
                />
            </motion.div>
        </motion.div>
    );
};

export default HistoryPage;