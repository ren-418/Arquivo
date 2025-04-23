import { useState, useEffect, useCallback } from 'react';
import { PresaleCode } from '@/types';
import { fetchEventPresaleCodes, addEventPresaleCodes, clearEventPresaleCodes } from '@/lib/presale-api-event';
import { toast } from 'sonner';

export function useEventPresaleCodes(eventId: string) {
    const [presaleCodes, setPresaleCodes] = useState<PresaleCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load presale codes
    const loadPresaleCodes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchEventPresaleCodes(eventId);
            setPresaleCodes(response.codes || []);
        } catch (err) {
            setError('Failed to load presale codes. Please try again later.');
            console.error('Error loading presale codes:', err);
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    // Add presale codes
    const addPresaleCodes = useCallback(async (codes: string[], areGeneric: boolean = false) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // Filter out empty codes
            const validCodes = codes.filter(code => code.trim().length > 0);

            if (validCodes.length === 0) {
                toast.error("No valid presale codes provided.")
                setIsSubmitting(false);
                return false;
            }

            await addEventPresaleCodes(eventId, validCodes, areGeneric);

            toast.success(`Added ${validCodes.length} presale code(s).`)

            // Refresh the list of presale codes
            await loadPresaleCodes();
            return true;
        } catch (err) {
            setError('Failed to add presale codes. Please try again.');
            toast.error("Failed to add presale codes. Please try again.")
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [eventId, loadPresaleCodes]);

    // Clear all presale codes
    const clearAllPresaleCodes = useCallback(async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await clearEventPresaleCodes(eventId);

            toast.success("All presale codes have been cleared.")

            // Reset the local state
            setPresaleCodes([]);
            return true;
        } catch (err) {
            setError('Failed to clear presale codes. Please try again.');
            toast.error("Failed to clear presale codes. Please try again.")
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [eventId]);

    // Recheck presale codes
    const recheckPresaleCodes = useCallback(async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await loadPresaleCodes();

            toast.success("Presale codes rechecked successfully.")
            return true;
        } catch (err) {
            setError('Failed to recheck presale codes. Please try again.');
            toast.error("Failed to recheck presale codes. Please try again.")
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [loadPresaleCodes]);

    // Load presale codes on component mount
    useEffect(() => {
        loadPresaleCodes();
    }, [loadPresaleCodes]);

    return {
        presaleCodes,
        isLoading,
        isSubmitting,
        error,
        loadPresaleCodes,
        addPresaleCodes,
        clearAllPresaleCodes,
        recheckPresaleCodes,
    };
}