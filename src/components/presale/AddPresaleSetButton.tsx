import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddPresaleSetModal from './AddPresaleSetModal';
import { motion } from 'framer-motion';
import { AddPresaleCodeSetPayload } from '@/@types';

interface AddPresaleSetButtonProps {
    onAddPresaleSet: (data: AddPresaleCodeSetPayload) => Promise<boolean>;
}

const AddPresaleSetButton: React.FC<AddPresaleSetButtonProps> = ({ onAddPresaleSet }) => {
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
                    Add New Set
                </Button>
            </motion.div>

            <AddPresaleSetModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={onAddPresaleSet}
            />
        </>
    );
};

export default AddPresaleSetButton;