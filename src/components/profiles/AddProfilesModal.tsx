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
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddProfilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: string) => Promise<boolean>;
}

const AddProfilesModal: React.FC<AddProfilesModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [profileName, setProfileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!profileName.trim()) {
            setError('Please enter a profile name.');
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            const success = await onSubmit(profileName.trim());
            if (success) {
                setProfileName('');
                onClose();
            }
        } catch (err) {
            setError('There was an error creating the profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">Create New Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Profile Name</label>
                        <Input
                            placeholder="Enter profile name"
                            className="w-full"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            disabled={isSubmitting}
                        />
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
                </div>

                <DialogFooter className="flex justify-end space-x-2 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="px-4"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Profile'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddProfilesModal;