import React, { useState, useEffect } from 'react';
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
import { Loader2, AlertCircle, Edit, Copy, CheckCircle2, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { PresaleCodeSetDetail, UpdatePresaleCodeSetPayload } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PresaleSetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    presaleSetId: number | null;
    onUpdate: (id: number, data: UpdatePresaleCodeSetPayload) => Promise<boolean>;
    onDelete: (id: number) => Promise<boolean>;
    loadPresaleDetail: (id: number) => Promise<PresaleCodeSetDetail | null>;
}

const PresaleSetDetailModal: React.FC<PresaleSetDetailModalProps> = ({
    isOpen,
    onClose,
    presaleSetId,
    onUpdate,
    onDelete,
    loadPresaleDetail
}) => {
    const [presaleDetail, setPresaleDetail] = useState<PresaleCodeSetDetail | null>(null);
    const [name, setName] = useState('');
    const [codesText, setCodesText] = useState('');
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Load presale set details when modal is opened
    useEffect(() => {
        const fetchDetail = async () => {
            if (isOpen && presaleSetId !== null) {
                setIsLoadingDetail(true);
                setError(null);

                try {
                    const detail = await loadPresaleDetail(presaleSetId);

                    if (detail) {
                        setPresaleDetail(detail);
                        setName(detail.name);
                        setCodesText(detail.codes.join('\n'));
                    } else {
                        setError('Failed to load presale code set details.');
                    }
                } catch (err) {
                    setError('An error occurred while loading the presale code set details.');
                } finally {
                    setIsLoadingDetail(false);
                }
            }
        };

        fetchDetail();
    }, [isOpen, presaleSetId, loadPresaleDetail]);

    // Reset state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setIsEditMode(false);
            setError(null);
            setIsCopied(false);
        }
    }, [isOpen]);

    const handleCopyToClipboard = () => {
        if (presaleDetail) {
            navigator.clipboard.writeText(presaleDetail.codes.join('\n'))
                .then(() => {
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                    // toast.info("All presale codes copied to clipboard")
                })
                .catch(() => {
                    // toast.error("Failed to copy to clipboard")
                });
        }
    };

    const handleUpdate = async () => {
        if (!presaleDetail) return;

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

            const success = await onUpdate(presaleDetail.id, {
                name: name.trim(),
                codes
            });

            if (success) {
                // Update local state and exit edit mode
                setPresaleDetail({
                    ...presaleDetail,
                    name: name.trim(),
                    codes,
                    updatedAt: new Date().toISOString()
                });
                setIsEditMode(false);
                // toast.success("Presale code set updated successfully!")
            }
        } catch (err) {
            setError('There was an error updating the presale code set.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!presaleDetail) return;

        setIsSubmitting(true);

        try {
            const success = await onDelete(presaleDetail.id);

            if (success) {
                onClose();
            }
        } catch (err) {
            setError('There was an error deleting the presale code set.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'MMMM dd, yyyy HH:mm:ss');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        {isLoadingDetail ? 'Loading...' : isEditMode ? 'Edit Presale Code Set' : 'Presale Code Set Details'}
                    </DialogTitle>
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

                    {isLoadingDetail ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : presaleDetail ? (
                        <>
                            {/* Header with metadata */}
                            {!isEditMode && (
                                <div className="bg-muted rounded-md p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">{presaleDetail.name}</h3>
                                            <Badge variant="outline" className="mt-1">
                                                {presaleDetail.codes.length} {presaleDetail.codes.length === 1 ? 'code' : 'codes'}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1"
                                                onClick={() => setIsEditMode(true)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span>Edit</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 gap-1 ${isCopied ? 'text-green-600' : ''}`}
                                                onClick={handleCopyToClipboard}
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4" />
                                                        <span>Copy All</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                            <span className="font-medium">Created:</span> {formatDate(presaleDetail.createdAt)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Last Updated:</span> {formatDate(presaleDetail.updatedAt)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit Form */}
                            {isEditMode ? (
                                <div className="space-y-4">
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
                            ) : (
                                <div className="border rounded-md">
                                    <div className="p-3 border-b bg-muted/50">
                                        <h4 className="font-medium">Presale Codes</h4>
                                    </div>
                                    <div className="p-3 max-h-[300px] overflow-y-auto">
                                        <div className="font-mono text-sm space-y-1">
                                            {presaleDetail.codes.map((code, index) => (
                                                <div key={index} className="flex justify-between items-center p-1 hover:bg-muted rounded">
                                                    <span>{code}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(code);
                                                            // toast.info(`Code "${code}" copied to clipboard`)
                                                        }}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            No presale code set found or failed to load details.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {isEditMode ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (presaleDetail) {
                                        setName(presaleDetail.name);
                                        setCodesText(presaleDetail.codes.join('\n'));
                                        setIsEditMode(false);
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                onClick={handleUpdate}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isSubmitting || isLoadingDetail}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Set'
                                )}
                            </Button>
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PresaleSetDetailModal;