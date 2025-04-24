import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Account } from '@/@types';
import { ArrowUpDown, Search, Mail, Lock, User } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EventProgressTabProps {
    accounts: (Account & { id: string })[];
    isLoading: boolean;
    hasQueue: boolean | undefined;
    isQbEnabled: boolean | undefined;
    onStartLooking: () => void;
    onStartCarting: () => void;
    onEnableQB: () => void;
}

type SortField = 'email' | 'status' | 'queue_position';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const EventProgressTab: React.FC<EventProgressTabProps> = ({
    accounts,
    isLoading,
    hasQueue,
    isQbEnabled,
    onStartLooking,
    onStartCarting,
    onEnableQB
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('email');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

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
        let result = [...accounts];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(account =>
                account.email.toLowerCase().includes(term) ||
                account.status.toLowerCase().includes(term) ||
                (account.queue_position && account.queue_position.toLowerCase().includes(term))
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let valueA, valueB;

            switch (sortField) {
                case 'email':
                    valueA = a.email.toLowerCase();
                    valueB = b.email.toLowerCase();
                    break;
                case 'status':
                    valueA = a.status.toLowerCase();
                    valueB = b.status.toLowerCase();
                    break;
                case 'queue_position':
                    // Handle empty queue positions
                    valueA = a.queue_position ? a.queue_position : '';
                    valueB = b.queue_position ? b.queue_position : '';
                    break;
                default:
                    valueA = a.email.toLowerCase();
                    valueB = b.email.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        return result;
    }, [accounts, searchTerm, sortField, sortDirection]);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
                <Button
                    className="gap-2"
                    onClick={onStartLooking}
                >
                    Start Looking for Seats
                </Button>
                <Button
                    className="gap-2"
                    onClick={onStartCarting}
                >
                    Start Carting
                </Button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {accounts.length > 0 && (
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
                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} accounts
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {renderSortButton('email', 'Email', <Mail className="h-4 w-4" />)}
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center">
                                        <Lock className="h-4 w-4 mr-2" />
                                        Password
                                    </div>
                                </TableHead>
                                <TableHead>
                                    {renderSortButton('status', 'Status', <Badge className="h-4 w-4" />)}
                                </TableHead>
                                <TableHead>
                                    {renderSortButton('queue_position', 'Queue Position', <User className="h-4 w-4" />)}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell>
                                            <div className="h-6 w-48 rounded-md bg-muted animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-6 w-32 rounded-md bg-muted animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-6 w-40 rounded-md bg-muted animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-6 w-20 rounded-md bg-muted animate-pulse"></div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAndSortedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2 py-6">
                                            <User className="h-10 w-10 text-muted-foreground" />
                                            <p className="text-muted-foreground">No accounts found</p>
                                            {searchTerm ? (
                                                <p className="text-xs text-muted-foreground">Try adjusting your search term</p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Add accounts to get started</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <AnimatePresence>
                                    {currentData.map((account, index) => (
                                        <motion.tr
                                            key={account.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className="relative group"
                                        >
                                            <TableCell className="font-medium max-w-[250px] truncate">
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                                    <span className="truncate">{account.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                <div className="flex items-center">
                                                    <Lock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                                    {account.password}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(account.password);
                                                            // toast.info("Password copied to clipboard")
                                                        }}
                                                    >
                                                        <span className="text-xs">Copy</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        account.status.toLowerCase().includes('error')
                                                            ? 'destructive'
                                                            : account.status.toLowerCase().includes('success') ||
                                                                account.status.toLowerCase().includes('checked out')
                                                                ? 'default'
                                                                : 'secondary'
                                                    }
                                                    className="font-normal"
                                                >
                                                    {account.status || 'Waiting'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {account.queue_position ? (
                                                    <span className="font-mono text-sm">{account.queue_position}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
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

export default EventProgressTab;