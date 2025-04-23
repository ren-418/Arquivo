import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AddPresaleCodeSetPayload } from '@/types';

interface AddPresaleSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddPresaleCodeSetPayload) => Promise<boolean>;
}

const AddPresaleSetModal: React.FC<AddPresaleSetModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [name, setName] = useState('');
    const [codesText, setCodesText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        // Validate inputs
        if (!name.trim()) {
            setError('Please enter a name for the presale code set.');
            return;
        }

        if (!codesText.trim()) {
            setError('Please enter at least one presale code.');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            // Split by new lines and filter out empty lines
            const codes = codesText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (codes.length === 0) {
                setError('Please enter at least one presale code.');
                setIsSubmitting(false);
                return;
            }

            const success = await onSubmit({
                name: name.trim(),
                codes
            });

            if (success) {
                // Reset form and close modal
                setName('');
                setCodesText('');
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
                    <DialogTitle className="text-2xl">Add New Presale Code Set</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
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

                    <div className="space-y-2">
                        <Label htmlFor="presale-name">Presale Code Set Name</Label>
                        <Input
                            id="presale-name"
                            placeholder="e.g. Citi Card Presale, Artist Fan Club, etc."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="presale-codes">Presale Codes (one per line)</Label>
                        <Textarea
                            id="presale-codes"
                            placeholder="Enter codes here, one per line..."
                            className="h-64 font-mono text-sm"
                            value={codesText}
                            onChange={(e) => setCodesText(e.target.value)}
                            disabled={isSubmitting}
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
                            'Save Presale Codes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPresaleSetModal;