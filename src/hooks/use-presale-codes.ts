import { useState, useEffect, useCallback } from 'react';
import { PresaleCodeSet, PresaleCodeSetDetail, AddPresaleCodeSetPayload, UpdatePresaleCodeSetPayload } from '@/types';
import { fetchPresaleCodeSets, fetchPresaleCodeSetDetail, addPresaleCodeSet, updatePresaleCodeSet, deletePresaleCodeSet } from '@/lib/presale-api';
import { toast } from 'sonner';

export function usePresaleCodes() {
    const [presaleCodeSets, setPresaleCodeSets] = useState<PresaleCodeSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load presale code sets
    const loadPresaleCodeSets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchPresaleCodeSets();
            setPresaleCodeSets(response.presales);
        } catch (err) {
            setError('Failed to load presale code sets. Please try again later.');
            toast.error("Failed to load presale code sets. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch a single presale code set details
    const fetchPresaleDetail = useCallback(async (id: number): Promise<PresaleCodeSetDetail | null> => {
        try {
            const response = await fetchPresaleCodeSetDetail(id);
            return response.presale;
        } catch (err) {
            toast.error("Failed to load presale code set details. Please try again.")
            return null;
        }
    }, []);

    // Add a new presale code set
    const addNewPresaleCodeSet = useCallback(async (data: AddPresaleCodeSetPayload): Promise<boolean> => {
        try {
            await addPresaleCodeSet(data);
            toast.success("Presale code set added successfully!")
            // Reload presale code sets after adding
            loadPresaleCodeSets();
            return true;
        } catch (err) {
            toast.error("Failed to add presale code set. Please try again.")
            return false;
        }
    }, [loadPresaleCodeSets]);

    // Update an existing presale code set
    const updateExistingPresaleCodeSet = useCallback(async (id: number, data: UpdatePresaleCodeSetPayload): Promise<boolean> => {
        try {
            await updatePresaleCodeSet(id, data);
            toast.success("Presale code set updated successfully!")
            // Reload presale code sets after updating
            loadPresaleCodeSets();
            return true;
        } catch (err) {
            toast.error("Failed to update presale code set. Please try again.")
            return false;
        }
    }, [loadPresaleCodeSets]);

    // Delete a presale code set
    const deleteExistingPresaleCodeSet = useCallback(async (id: number): Promise<boolean> => {
        try {
            await deletePresaleCodeSet(id);
            toast.success("Presale code set deleted successfully!")
            // Reload presale code sets after deletion
            loadPresaleCodeSets();
            return true;
        } catch (err) {
            toast.error("Failed to delete presale code set. Please try again.")
            return false;
        }
    }, [loadPresaleCodeSets]);

    // Load presale code sets on component mount
    useEffect(() => {
        loadPresaleCodeSets();
    }, [loadPresaleCodeSets]);

    return {
        presaleCodeSets,
        isLoading,
        error,
        refreshPresaleCodeSets: loadPresaleCodeSets,
        fetchPresaleDetail,
        addPresaleCodeSet: addNewPresaleCodeSet,
        updatePresaleCodeSet: updateExistingPresaleCodeSet,
        deletePresaleCodeSet: deleteExistingPresaleCodeSet,
    };
}