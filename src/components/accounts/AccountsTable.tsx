import React, { useCallback, useState } from 'react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, ArrowUpDown, Trash, CreditCard, Mail, Lock, Globe, ExternalLink } from 'lucide-react';
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
import { toast } from 'sonner';

interface AccountsTableProps {
    data: Account[];
    isLoading: boolean;
    onDelete: (email: string) => void;
}

type SortField = 'email' | 'card_number' | 'proxy';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const AccountsTable: React.FC<AccountsTableProps> = ({ data, isLoading, onDelete }) => {
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
        let result = [...data];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(account =>
                account.email.toLowerCase().includes(term) ||
                account.card_number.toLowerCase().includes(term) ||
                account.proxy.toLowerCase().includes(term)
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
                case 'card_number':
                    valueA = a.card_number;
                    valueB = b.card_number;
                    break;
                case 'proxy':
                    valueA = a.proxy;
                    valueB = b.proxy;
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
    }, [data, searchTerm, sortField, sortDirection]);

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

        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatCardNumber = (number: string) => {
        return `${number.slice(0, 4)}...${number.slice(-4)}`;
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
    const handleManualCheckout = useCallback((account: Account) => {
        try {
            // Call the function in Electron's main process through IPC
            window.electron.checkoutManually({
                sortc: account.sortc,
                sotc: account.sotc,
                id_token: account.id_token,
                sid: account.sid,
                ma_dvt: account.ma_dvt,
                checkout_url: "https://www.ticketmaster.com/",
                bid: account.bid,
                proxy: account.proxy,
                name_on_card: account.first_name + " " + account.last_name,
                card_number: account.card_number,
                exp_month: account.exp_month,
                exp_year: account.exp_year,
                cvv: account.cvv,
                address_line_1: account.address_line_1,
                city: account.city,
                postal_code: account.PostalCode,
                phone: account.phone,
            });

            // toast.success("Starting Browser");
        } catch (error) {
            console.error('Failed to start browser:', error);
            // toast.error("Failed to start browser");
        }
    }, []);
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by email, card number, or proxy..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {!isLoading && filteredAndSortedData.length > 0 && (
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
                                {renderSortButton('card_number', 'Credit Card', <CreditCard className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead>
                                {renderSortButton('proxy', 'Proxy', <Globe className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                        <div className="h-6 w-24 rounded-md bg-muted animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-6 w-32 rounded-md bg-muted animate-pulse"></div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-6 w-40 rounded-md bg-muted animate-pulse"></div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="h-6 w-12 ml-auto rounded-md bg-muted animate-pulse"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredAndSortedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2 py-6">
                                        <Mail className="h-10 w-10 text-muted-foreground" />
                                        <p className="text-muted-foreground">No accounts found</p>
                                        {searchTerm ? (
                                            <p className="text-xs text-muted-foreground">Try adjusting your search term</p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">Add your first account to get started</p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <AnimatePresence>
                                {currentData.map((account, index) => (
                                    <motion.tr
                                        key={account.email}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                        className="relative group"
                                    >
                                        <TableCell className="font-medium max-w-[250px] truncate">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {account.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            <div className="flex items-center">
                                                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7">
                                                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {formatCardNumber(account.card_number)}
                                                        <MoreHorizontal className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-60">
                                                    <div className="p-3 space-y-3">
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground">Card Number</p>
                                                            <p className="font-mono text-sm flex justify-between">
                                                                {account.card_number}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(account.card_number);
                                                                        // toast.info("Card number copied to clipboard")
                                                                    }}
                                                                >
                                                                    <span className="text-xs">Copy</span>
                                                                </Button>
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-muted-foreground">Exp Month</p>
                                                                <p className="font-mono text-sm">{account.exp_month}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-muted-foreground">Exp Year</p>
                                                                <p className="font-mono text-sm">{account.exp_year}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-muted-foreground">CVV</p>
                                                                <p className="font-mono text-sm">{account.cvv}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm max-w-[250px] truncate">
                                            <div className="flex items-center">
                                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {account.proxy}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleManualCheckout(account)}
                                            >
                                                <ExternalLink size={14} className="mr-2" />
                                                Open
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the account
                                                            <span className="font-semibold"> {account.email} </span>
                                                            and all associated data.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => onDelete(account.email)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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

export default AccountsTable;