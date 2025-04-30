import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddProfilesModal from './AddProfilesModal';
import { motion } from 'framer-motion';

interface AddProfilesButtonProps {
    onAddProfiles: (name: string) => Promise<any>;
}

const AddProfilesButton: React.FC<AddProfilesButtonProps> = ({ onAddProfiles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (data: string) => {
        if (data.length > 0) {
            await onAddProfiles(data);
            return true;
        }
        return false;
    };

    return (
        <div className='flex items-center gap-2'>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={handleOpenModal}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Profile
                </Button>
            </motion.div>

            <AddProfilesModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default AddProfilesButton;