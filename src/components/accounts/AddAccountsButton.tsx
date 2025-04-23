import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import AddAccountsModal from './AddAccountsModal';
import { motion } from 'framer-motion';

interface AddAccountsButtonProps {
    onAddAccounts: (data: string[]) => Promise<boolean>;
}

const AddAccountsButton: React.FC<AddAccountsButtonProps> = ({ onAddAccounts }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
                    <Check className="h-4 w-4" />
                    Check Accounts
                </Button>
            </motion.div>

            <AddAccountsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={onAddAccounts}
            />
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={handleOpenModal}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Accounts
                </Button>
            </motion.div>

            <AddAccountsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={onAddAccounts}
            />
        </div>
    );
};

export default AddAccountsButton;