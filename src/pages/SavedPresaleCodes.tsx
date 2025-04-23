import React, { useState } from 'react';
import { usePresaleCodes } from '@/hooks/use-presale-codes';
import { motion } from 'framer-motion';
import PresaleCodesTable from '@/components/presale/PresaleCodesTable';
import AddPresaleSetButton from '@/components/presale/AddPresaleSetButton';
import PresaleSetDetailModal from '@/components/presale/PresaleSetDetailModal';
import PageTitle from '@/shared/PageTitle';

const SavedPresaleCodes: React.FC = () => {
    const {
        presaleCodeSets,
        isLoading,
        error,
        fetchPresaleDetail,
        addPresaleCodeSet: handleAddPresaleSet,
        updatePresaleCodeSet: handleUpdatePresaleSet,
        deletePresaleCodeSet: handleDeletePresaleSet,
    } = usePresaleCodes();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPresaleSetId, setSelectedPresaleSetId] = useState<number | null>(null);

    const handleViewEdit = (id: number) => {
        setSelectedPresaleSetId(id);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedPresaleSetId(null);
    };

    return (
        <>
            <PageTitle
                title="Saved Presale Codes"
                description="Manage your presale codes for quick access"
                rightContent={<AddPresaleSetButton onAddPresaleSet={handleAddPresaleSet} />}
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
                <PresaleCodesTable
                    data={presaleCodeSets}
                    isLoading={isLoading}
                    onDelete={handleDeletePresaleSet}
                    onViewEdit={handleViewEdit}
                />
            </motion.div>

            {/* Detail/Edit Modal */}
            <PresaleSetDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                presaleSetId={selectedPresaleSetId}
                onUpdate={handleUpdatePresaleSet}
                onDelete={handleDeletePresaleSet}
                loadPresaleDetail={fetchPresaleDetail}
            />
        </>
    );
};

export default SavedPresaleCodes;