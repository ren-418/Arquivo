import React from 'react';
import EventTable from '@/components/dashboard/EventTable';
import AddEventButton from '@/components/dashboard/AddEventButton';
import { useEvents } from '@/hooks/use-events';
import { motion } from 'framer-motion';
import PageTitle from '@/shared/PageTitle';

const Dashboard: React.FC = () => {
    const {
        tableData,
        isLoading,
        error,
        addEvent: handleAddEvent,
        deleteEvent: handleDeleteEvent,
    } = useEvents();

    return (
        <>
            <PageTitle
                title="Dashboard"
                description="Manage your events and tasks"
                rightContent={<AddEventButton onAddEvent={handleAddEvent} />}
            />

            {error ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md"
                >
                    {error}
                </motion.div>
            ) : null}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <EventTable
                    data={tableData}
                    isLoading={isLoading}
                    onDelete={handleDeleteEvent}
                />
            </motion.div>
        </>
    );
};

export default Dashboard;