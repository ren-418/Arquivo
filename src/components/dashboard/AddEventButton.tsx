import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddEventModal from './AddEventModal';
import { AddEventPayload } from '@/@types';
import { motion } from 'framer-motion';

interface AddEventButtonProps {
    onAddEvent: (data: AddEventPayload) => Promise<boolean>;
}

const AddEventButton: React.FC<AddEventButtonProps> = ({ onAddEvent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={handleOpenModal}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Event
                </Button>
            </motion.div>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={onAddEvent}
            />
        </>
    );
};

export default AddEventButton;