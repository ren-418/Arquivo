import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddAccountModalProps {
    onAddAccount: (accounts: string[]) => Promise<void>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ onAddAccount, open, onOpenChange }) => {
    const [accountsInput, setAccountsInput] = useState('');

    const handleSubmit = async () => {
        const accounts = accountsInput
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (accounts.length > 0) {
            await onAddAccount(accounts);
            setAccountsInput('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <div className="flex justify-between items-center">
                    <DialogTitle>Add Accounts</DialogTitle>
                    
                </div>
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Format: Enter 1 account per line</p>
                        <p className="text-xs text-muted-foreground">email@example.com;password;etc...</p>
                        <p className="text-xs text-muted-foreground">For complete account data, provide all 17 fields separated by semicolons.</p>
                    </div>
                    <textarea
                        placeholder="Enter account data here, one account per line..."
                        value={accountsInput}
                        onChange={(e) => setAccountsInput(e.target.value)}
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                        style={{
                            resize: 'none',
                            overflowX: 'auto',
                            whiteSpace: 'pre',
                            wordWrap: 'normal'
                        }}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            Save Accounts
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddAccountModal; 