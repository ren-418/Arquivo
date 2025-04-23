import React, { useEffect } from 'react';
import AccountsTable from '@/components/accounts/AccountsTable';
import AddAccountsButton from '@/components/accounts/AddAccountsButton';
import { useAccounts } from '@/hooks/use-accounts';
import { motion } from 'framer-motion';
import PageTitle from '@/shared/PageTitle';

const Accounts: React.FC = () => {
    const {
        accounts,
        isLoading,
        error,
        addAccounts: handleAddAccounts,
        deleteAccount: handleDeleteAccount,
    } = useAccounts();

    // Disable scrolling when component mounts
    useEffect(() => {
        // Save original styles to restore later
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Prevent scrolling on the body
        document.body.style.overflow = 'hidden';

        // Cleanup function to restore scrolling when component unmounts
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    return (
        <div>
            <PageTitle
                title="Accounts"
                description="Manage your ticketing accounts"
                rightContent={<AddAccountsButton onAddAccounts={handleAddAccounts} />}
            />

            {
                error ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md"
                    >
                        {error}
                    </motion.div>
                ) : null
            }

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <AccountsTable
                    data={accounts}
                    isLoading={isLoading}
                    onDelete={handleDeleteAccount}
                />
            </motion.div>
        </div>
    );
};

export default Accounts;