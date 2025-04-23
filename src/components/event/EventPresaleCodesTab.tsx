import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowUpDown, Search, Ticket, RefreshCw, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PresaleCode, PresaleCodeSet } from '@/types';
import { useEventPresaleCodes } from '@/hooks/use-event-presale-codes';
import { usePresaleCodes } from '@/hooks/use-presale-codes';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Switch } from '../ui/switch';

interface EventPresaleCodesTabProps {
    eventId: string;
}

type SortField = 'code' | 'is_valid' | 'is_used' | 'are_generic';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const EventPresaleCodesTab: React.FC<EventPresaleCodesTabProps> = ({ eventId }) => {
    // Custom hooks
    const {
        presaleCodes,
        isLoading,
        isSubmitting,
        error,
        addPresaleCodes,
        clearAllPresaleCodes,
        recheckPresaleCodes
    } = useEventPresaleCodes(eventId);

    const {
        presaleCodeSets,
        fetchPresaleDetail
    } = usePresaleCodes();

    // Local state
    const [codesText, setCodesText] = useState('');
    const [areGeneric, setAreGeneric] = useState(false);
    const [selectedSetId, setSelectedSetId] = useState<string>('');
    const [isFetchingSavedCodes, setIsFetchingSavedCodes] = useState(false);

    // Table state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('code');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

    // Handle loading presale codes from saved sets
    const handleLoadSavedCodes = async (setId: string) => {
        if (!setId) return;

        setIsFetchingSavedCodes(true);
        setSelectedSetId(setId);

        try {
            const id = parseInt(setId);
            const detail = await fetchPresaleDetail(id);

            if (detail && detail.codes) {
                setCodesText(detail.codes.join('\n'));
                toast.success(`Loaded ${detail.codes.length} codes from "${detail.name}"`)
            }
        } catch (err) {
            toast.error('Failed to load saved presale codes')
        } finally {
            setIsFetchingSavedCodes(false);
        }
    };

    // Handle form submission
    const handleSubmitCodes = async () => {
        const codes = codesText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (codes.length === 0) {
            toast.error("Please enter at least one presale code")
            return;
        }

        const success = await addPresaleCodes(codes, areGeneric);

        if (success) {
            // Clear the form
            setCodesText('');
            setSelectedSetId('');
        }
    };

    // Handle clear all codes
    const handleClearAll = async () => {
        await clearAllPresaleCodes();
    };

    // Handle recheck codes
    const handleRecheckCodes = async () => {
        await recheckPresaleCodes();
    };

    // Handle sort toggle
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction if already sorting by this field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new sort field and default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Filter and sort data
    const filteredAndSortedData = React.useMemo(() => {
        let result = [...presaleCodes];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(code =>
                code.code.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'code':
                    comparison = a.code.localeCompare(b.code);
                    break;
                case 'is_valid':
                    comparison = Number(a.is_valid) - Number(b.is_valid);
                    break;
                case 'is_used':
                    comparison = Number(a.is_used) - Number(b.is_used);
                    break;
                case 'are_generic':
                    comparison = Number(a.are_generic) - Number(b.are_generic);
                    break;
                default:
                    comparison = a.code.localeCompare(b.code);
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [presaleCodes, searchTerm, sortField, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

    // Reset to first page when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortDirection, pageSize]);

    // Get current page data
    const currentData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedData, currentPage, pageSize]);

    // Handle page change
    const handlePageChange = (page: number) => {
        // Ensure page is within bounds
        const targetPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(targetPage);
    };

    // Render the sort button for column headers
    const renderSortButton = (field: SortField, label: string) => (
        <Button
            variant="ghost"
            onClick={() => handleSort(field)}
            className="h-8 px-2 flex items-center"
        >
            {label}
            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === field ? 'opacity-100' : 'opacity-40'}`} />
        </Button>
    );

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <div className="space-y-4 p-4 border rounded-md bg-card">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Add Presale Codes</h3>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="presale-codes-input">Presale Codes (one per line)</Label>
                    <Textarea
                        id="presale-codes-input"
                        placeholder="Enter codes here, one per line..."
                        className="h-32 font-mono text-sm"
                        value={codesText}
                        onChange={(e) => setCodesText(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                {/* New position for Are Generic - more prominent as a card */}
                <div className="flex items-center space-x-3 p-3 border rounded-md bg-muted/40">
                    <div className="flex-1">
                        <h4 className="font-medium text-sm">Generic Codes</h4>
                        <p className="text-xs text-muted-foreground">Check this if codes can be used multiple times</p>
                    </div>
                    <Switch
                        id="are-generic-switch"
                        checked={areGeneric}
                        onCheckedChange={(checked) => setAreGeneric(checked)}
                    />
                </div>

                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <div className="flex-1">
                        <Label htmlFor="saved-codes-select" className="mb-2 block">
                            Import from Saved Presale Codes
                        </Label>
                        <Select
                            value={selectedSetId}
                            onValueChange={handleLoadSavedCodes}
                            disabled={isFetchingSavedCodes || presaleCodeSets.length === 0}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a presale code set" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Saved Presale Code Sets</SelectLabel>
                                    {presaleCodeSets.map((set) => (
                                        <SelectItem key={set.id} value={set.id.toString()}>
                                            {set.name} ({set.codesCount} codes)
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-none self-end">
                        <Button
                            className="w-full"
                            onClick={handleSubmitCodes}
                            disabled={isSubmitting || codesText.trim().length === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Codes'
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Presale Codes Table */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search codes or ticket types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRecheckCodes}
                            disabled={isLoading || isSubmitting || presaleCodes.length === 0}
                            className="h-9"
                        >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Recheck Codes
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading || isSubmitting || presaleCodes.length === 0}
                                    className="h-9 text-destructive border-destructive/30 hover:bg-destructive/10"
                                >
                                    <Trash className="mr-2 h-3.5 w-3.5" />
                                    Clear All
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove all presale codes from this event. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={handleClearAll}
                                    >
                                        Clear All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Table pagination info */}
                {filteredAndSortedData.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <select
                                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                            >
                                <option value="5">5 per page</option>
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                            </select>
                        </div>
                        <div className="text-muted-foreground">
                            Showing {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} codes
                        </div>
                    </div>
                )}

                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{renderSortButton('code', 'Code')}</TableHead>
                                <TableHead>Ticket Type</TableHead>
                                <TableHead>{renderSortButton('is_used', 'Is Used')}</TableHead>
                                <TableHead>{renderSortButton('are_generic', 'Is Generic')}</TableHead>
                                <TableHead>{renderSortButton('is_valid', 'Is Valid')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAndSortedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2 py-6">
                                            <Ticket className="h-10 w-10 text-muted-foreground" />
                                            <p className="text-muted-foreground">No presale codes found</p>
                                            {searchTerm ? (
                                                <p className="text-xs text-muted-foreground">Try adjusting your search term</p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Add presale codes to get started</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <AnimatePresence>
                                    {currentData.map((code, index) => (
                                        <motion.tr
                                            key={`${code.code}-${index}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className="group"
                                        >
                                            <TableCell className="font-mono">
                                                <div className="flex items-center">
                                                    <span>{code.code}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(code.code);
                                                            toast.info(`Copied "${code.code}" to clipboard`);
                                                        }}
                                                    >
                                                        <span className="text-xs">Copy</span>
                                                    </Button>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {code.ticket_types && code.ticket_types.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {code.ticket_types.map((type, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {type}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {code.is_used ? (
                                                    <span className="inline-flex items-center text-destructive">
                                                        <X className="mr-1 h-4 w-4" />
                                                        Used
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-green-600">
                                                        <Check className="mr-1 h-4 w-4" />
                                                        Available
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {code.are_generic ? (
                                                    <span className="inline-flex items-center text-green-600">
                                                        <Check className="mr-1 h-4 w-4" />
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-amber-600">
                                                        <X className="mr-1 h-4 w-4" />
                                                        No
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {code.is_valid ? (
                                                    <span className="inline-flex items-center text-green-600">
                                                        <Check className="mr-1 h-4 w-4" />
                                                        Valid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-destructive">
                                                        <X className="mr-1 h-4 w-4" />
                                                        Invalid
                                                    </span>
                                                )}
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination component */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {/* Generate pagination links */}
                                {Array.from({ length: totalPages }).map((_, index) => {
                                    const pageNumber = index + 1;

                                    // Show first page, last page, and pages around current page
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    isActive={pageNumber === currentPage}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }

                                    // Show ellipsis for gaps (but only once per gap)
                                    if (
                                        (pageNumber === 2 && currentPage > 3) ||
                                        (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                                    ) {
                                        return (
                                            <PaginationItem key={`ellipsis-${pageNumber}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventPresaleCodesTab;