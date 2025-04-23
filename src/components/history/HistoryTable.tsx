// components/history/HistoryTable.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Trash2,
    ArrowUpDown,
    Loader2,
    AlertCircle,
    Calendar,
    Building2,
    Users,
    Search,
    MoreHorizontal,
    Copy,
    Info,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { HistoryEvent } from '@/types/history';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface HistoryTableProps {
    events: HistoryEvent[];
    isLoading: boolean;
    error: string | null;
    onRowClick: (eventId: string) => void;
    onDelete: (eventId: string) => void;
    onExport?: (eventId: string) => void;
    onDuplicate?: (eventId: string) => void;
}

type SortField = 'id' | 'name' | 'date' | 'venue' | 'accounts';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export const HistoryTable: React.FC<HistoryTableProps> = ({
    events,
    isLoading,
    error,
    onRowClick,
    onDelete,
    onExport,
    onDuplicate,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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
    const filteredAndSortedEvents = useMemo(() => {
        let result = [...events];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(event =>
                event.id.toLowerCase().includes(term) ||
                event.name.toLowerCase().includes(term) ||
                event.venue.toLowerCase().includes(term) ||
                String(event.accounts).includes(term)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let valueA, valueB;

            switch (sortField) {
                case 'id':
                    valueA = a.id;
                    valueB = b.id;
                    break;
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'date':
                    valueA = new Date(a.date).getTime();
                    valueB = new Date(b.date).getTime();
                    break;
                case 'venue':
                    valueA = a.venue.toLowerCase();
                    valueB = b.venue.toLowerCase();
                    break;
                case 'accounts':
                    valueA = a.accounts;
                    valueB = b.accounts;
                    break;
                default:
                    valueA = new Date(a.date).getTime();
                    valueB = new Date(b.date).getTime();
            }

            if (sortDirection === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        return result;
    }, [events, searchTerm, sortField, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedEvents.length / pageSize);

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortDirection, pageSize]);

    // Get current page data
    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedEvents.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedEvents, currentPage, pageSize]);

    // Handle page change
    const handlePageChange = (page: number) => {
        // Ensure page is within bounds
        const targetPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(targetPage);

        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper for formatting dates
    const formatEventDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM d, yyyy');
        } catch (err) {
            return dateString;
        }
    };

    // Render the sort button for column headers
    const renderSortButton = (field: SortField, label: string, icon: React.ReactNode) => (
        <Button
            variant="ghost"
            onClick={() => handleSort(field)}
            className="h-8 px-2 flex items-center"
        >
            <span className="mr-2">{icon}</span>
            {label}
            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === field ? 'opacity-100' : 'opacity-40'}`} />
            {sortField === field && (
                <span className="ml-1 text-xs">
                    ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                </span>
            )}
        </Button>
    );

    if (error) {
        return (
            <div className="flex justify-center items-center h-64 text-destructive">
                <AlertCircle className="h-8 w-8 mr-2" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, venue, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {!isLoading && filteredAndSortedEvents.length > 0 && (
                    <div className="flex items-center gap-4">
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
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedEvents.length)} of {filteredAndSortedEvents.length} events
                        </div>
                    </div>
                )}
                {isDeleteDialogOpen && (
                    <AlertDialog open={isDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the event
                                    {/* You can pass the event name here based on your state */}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => {
                                        if (selectedEventId) {
                                            onDelete(selectedEventId);
                                            // toast.info(`Event deleted successfully`);
                                        }
                                        setIsDeleteDialogOpen(false);
                                    }}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                {renderSortButton('id', 'ID', <span className="h-4 w-4">#</span>)}
                            </TableHead>
                            <TableHead>
                                {renderSortButton('name', 'Name', <span className="h-4 w-4"></span>)}
                            </TableHead>
                            <TableHead>
                                {renderSortButton('date', 'Date', <Calendar className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead>
                                {renderSortButton('venue', 'Venue', <Building2 className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead>
                                {renderSortButton('accounts', 'Accounts', <Users className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <AnimatePresence>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <motion.tr
                                        key={`skeleton-${index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                        <TableCell>
                                            <div className="h-6 w-16 rounded-md bg-muted animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-6 w-48 rounded-md bg-muted animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <div className="h-4 w-4 mr-2 rounded-full bg-muted animate-pulse"></div>
                                                <div className="h-6 w-32 rounded-md bg-muted animate-pulse"></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <div className="h-4 w-4 mr-2 rounded-full bg-muted animate-pulse"></div>
                                                <div className="h-6 w-40 rounded-md bg-muted animate-pulse"></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <div className="h-4 w-4 mr-2 rounded-full bg-muted animate-pulse"></div>
                                                <div className="h-6 w-20 rounded-md bg-muted animate-pulse"></div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <div className="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
                                                <div className="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        ) : filteredAndSortedEvents.length === 0 ? (
                            <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <motion.div
                                        className="flex flex-col items-center justify-center space-y-2 py-6"
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <motion.div
                                            initial={{ rotate: -10 }}
                                            animate={{ rotate: 0 }}
                                            transition={{ duration: 0.5, type: "spring" }}
                                        >
                                            <Calendar className="h-10 w-10 text-muted-foreground" />
                                        </motion.div>
                                        <p className="text-muted-foreground">No events found</p>
                                        {searchTerm ? (
                                            <motion.p
                                                className="text-xs text-muted-foreground"
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Try adjusting your search term
                                            </motion.p>
                                        ) : (
                                            <motion.p
                                                className="text-xs text-muted-foreground"
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Add your first event to get started
                                            </motion.p>
                                        )}
                                    </motion.div>
                                </TableCell>
                            </motion.tr>
                        ) : (
                            <AnimatePresence>
                                {currentData.map((event, index) => (
                                    <motion.tr
                                        key={event.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                        className="relative group hover:bg-muted/30"
                                        onClick={() => onRowClick(event.id)}
                                    >
                                        <TableCell className="font-medium">
                                            {event.id}
                                        </TableCell>
                                        <TableCell className="max-w-[250px] truncate">
                                            {event.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {formatEventDate(event.date)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[250px] truncate">
                                            <div className="flex items-center group/venue">
                                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {event.venue}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 ml-2 opacity-0 group-hover/venue:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(event.venue);
                                                        // toast.info("Venue copied to clipboard");
                                                    }}
                                                >
                                                    <span className="text-xs">Copy</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {event.accounts}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                                if (onExport) onExport(event.id);
                                                                // toast.info(`Exporting event data...`);
                                                            }}
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            Export
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-destructive focus:text-destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedEventId(event.id);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>

                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
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
    );
};