import { useState, useEffect, useCallback } from 'react';
import { Account } from '@/types';
import { fetchAccounts, addAccounts, deleteAccount } from '@/lib/accounts-api';
import { toast } from 'sonner';

export function useAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load accounts data
    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAccounts();
            setAccounts(data);
        } catch (err) {
            setError('Failed to load accounts. Please try again later.');
            // toast.error("Failed to load accounts. Please try again later.")
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add new accounts
    const handleAddAccounts = useCallback(async (accountsData: string[]) => {
        try {
            await addAccounts(accountsData);
            // toast.success("Accounts added successfully!")
            // Reload accounts after adding
            loadAccounts();
            return true;
        } catch (err) {
            // toast.error("Failed to add accounts. Please try again.")
            return false;
        }
    }, [loadAccounts]);

    // Delete an account
    const handleDeleteAccount = useCallback(async (email: string) => {
        try {
            await deleteAccount(email);
            // toast.success("Account deleted successfully!")
            // Reload accounts after deletion
            loadAccounts();
            return true;
        } catch (err) {
            // toast.error("Failed to delete account. Please try again.")
            return false;
        }
    }, [loadAccounts]);

    // Load accounts on component mount
    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    return {
        accounts,
        isLoading,
        error,
        refreshAccounts: loadAccounts,
        addAccounts: handleAddAccounts,
        deleteAccount: handleDeleteAccount,
    };
}