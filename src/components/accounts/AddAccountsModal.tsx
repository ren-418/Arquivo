import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddAccountsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (accountsData: string[]) => Promise<boolean>;
}

const AddAccountsModal: React.FC<AddAccountsModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [accountsText, setAccountsText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!accountsText.trim()) {
            setError('Please enter at least one account.');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            // Split by new lines and filter out empty lines
            const accountLines = accountsText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (accountLines.length === 0) {
                setError('Please enter at least one account.');
                setIsSubmitting(false);
                return;
            }

            const success = await onSubmit(accountLines);

            if (success) {
                setAccountsText('');
                onClose();
            }
        } catch (err) {
            setError('There was an error processing your request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add Accounts</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted p-4 rounded-md text-sm">
                        <p className="font-medium mb-2">Format: Enter 1 account per line</p>
                        <code className="font-mono text-xs block mb-2">email@example.com;password;etc...</code>
                        <p className="text-muted-foreground text-xs">
                            For complete account data, provide all 17 fields separated by semicolons.
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    <div className="h-64 overflow-hidden relative">
                        <Textarea
                            placeholder="Enter account data here, one account per line..."
                            className="font-mono text-sm resize-none absolute inset-0 w-full h-full whitespace-nowrap overflow-x-auto"
                            value={accountsText}
                            onChange={(e) => setAccountsText(e.target.value)}
                            disabled={isSubmitting}
                            style={{ maxHeight: '100%', minHeight: '100%' }}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            'Save Accounts'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddAccountsModal;