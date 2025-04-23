// components/history/CheckoutsTable.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search,
    ShoppingBag,
    Loader2,
    AlertCircle,
    DollarSign,
    CheckCircle,
    ShieldAlert,
    ShieldCheck,
    Copy,
    ArrowUpDown,
    Download,
    AtSign,
    Lock,
    Hash,
    MapPin,
    Rows
} from 'lucide-react';
import { useCheckoutsData } from '@/hooks/use-checkouts-data';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface CheckoutsTableProps {
    eventId: string;
    onExport?: () => void;
}

type SortField = 'email' | 'orderId' | 'section' | 'row' | 'price' | 'result';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export const CheckoutsTable: React.FC<CheckoutsTableProps> = ({ eventId, onExport }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('result');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const { checkoutsData, isLoading, error } = useCheckoutsData(eventId);

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

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortDirection, pageSize]);

    // Filter and sort checkouts data
    const filteredAndSortedData = useMemo(() => {
        if (!checkoutsData || checkoutsData.length === 0) return [];

        // Filter data based on search term
        let result = checkoutsData.filter(item =>
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.row.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Apply sorting
        result.sort((a, b) => {
            let valueA, valueB;

            // Define sort comparisons for each field
            switch (sortField) {
                case 'email':
                    valueA = a.email.toLowerCase();
                    valueB = b.email.toLowerCase();
                    break;
                case 'orderId':
                    valueA = a.order_id.toLowerCase();
                    valueB = b.order_id.toLowerCase();
                    break;
                case 'section':
                    valueA = a.section.toLowerCase();
                    valueB = b.section.toLowerCase();
                    break;
                case 'row':
                    valueA = a.row.toLowerCase();
                    valueB = b.row.toLowerCase();
                    break;
                case 'price':
                    valueA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
                    valueB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
                    break;
                case 'result':
                    // Custom sort order: confirmed > verified > processing
                    const resultOrder = { 'confirmed': 0, 'verified': 1, 'processing': 2 };
                    valueA = resultOrder[a.result];
                    valueB = resultOrder[b.result];
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
    }, [checkoutsData, searchTerm, sortField, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

    // Get current page data
    const currentData = useMemo(() => {
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

    // Get the appropriate badge for each result type
    const getResultBadge = (result: string) => {
        switch (result) {
            case 'confirmed':
                return (
                    <Badge className="bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle size={12} className="mr-1" />
                        Confirmed
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Loader2 size={12} className="mr-1 animate-spin" />
                        Processing
                    </Badge>
                );
            case 'verified':
                return (
                    <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <ShieldCheck size={12} className="mr-1" />
                        Verified
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {result}
                    </Badge>
                )
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

    // Count results by type
    const resultCounts = checkoutsData?.reduce((acc, item) => {
        acc[item.result] = (acc[item.result] || 0) + 1;
        return acc;
    }, {} as Record<CheckoutResult, number>) || {};

    // Calculate total value of checkouts
    const totalValue = useMemo(() => {
        if (!filteredAndSortedData.length) return 0;
        return filteredAndSortedData.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            return sum + (isNaN(price) ? 0 : price);
        }, 0);
    }, [filteredAndSortedData]);

    if (isLoading) {
        return (
            <motion.div
                className="flex justify-center items-center h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="flex justify-center items-center h-64 text-destructive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <AlertCircle className="h-8 w-8 mr-2" />
                <p>{error}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <CardTitle className="text-lg flex items-center">
                                <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
                                Checkout History
                                <Badge variant="outline" className="ml-2 bg-primary/10 text-xs">
                                    {checkoutsData?.length || 0} checkouts
                                </Badge>
                            </CardTitle>
                        </motion.div>
                        <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                if (onExport) onExport();
                                                // toast.success("Exporting checkout data...");
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p className="text-xs">Export Checkout Data</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search checkouts..."
                                    className="w-[250px] pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        {renderSortButton('email', 'Email', <AtSign className="h-4 w-4" />)}
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center">
                                            <Lock className="h-4 w-4 mr-2" />
                                            Password
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        {renderSortButton('orderId', 'Order ID', <Hash className="h-4 w-4" />)}
                                    </TableHead>
                                    <TableHead>
                                        {renderSortButton('section', 'Section', <MapPin className="h-4 w-4" />)}
                                    </TableHead>
                                    <TableHead>
                                        {renderSortButton('row', 'Row', <Rows className="h-4 w-4" />)}
                                    </TableHead>
                                    <TableHead>
                                        {renderSortButton('price', 'Price', <DollarSign className="h-4 w-4" />)}
                                    </TableHead>
                                    <TableHead>
                                        {renderSortButton('result', 'Result', <CheckCircle className="h-4 w-4" />)}
                                    </TableHead>
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
                                                    <div className="flex items-center">
                                                        <div className="h-4 w-4 mr-2 rounded-full bg-muted animate-pulse"></div>
                                                        <div className="h-6 w-36 rounded-md bg-muted animate-pulse"></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-6 w-24 rounded-md bg-muted animate-pulse"></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-6 w-24 rounded-md bg-muted animate-pulse"></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-6 w-16 rounded-md bg-muted animate-pulse"></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-6 w-12 rounded-md bg-muted animate-pulse"></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-6 w-16 rounded-md bg-muted animate-pulse"></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-6 w-24 rounded-md bg-muted animate-pulse"></div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                ) : filteredAndSortedData.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <motion.div
                                                className="flex flex-col items-center justify-center"
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <motion.div
                                                    initial={{ rotate: -10 }}
                                                    animate={{ rotate: 0 }}
                                                    transition={{ duration: 0.5, type: "spring" }}
                                                >
                                                    {searchTerm ? (
                                                        <Search className="h-10 w-10 mb-2 opacity-50" />
                                                    ) : (
                                                        <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
                                                    )}
                                                </motion.div>
                                                {searchTerm ? (
                                                    <>
                                                        <motion.p
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            No matching checkouts found
                                                        </motion.p>
                                                        <motion.p
                                                            className="text-sm"
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            Try a different search term
                                                        </motion.p>
                                                    </>
                                                ) : (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        No checkout data available
                                                    </motion.p>
                                                )}
                                            </motion.div>
                                        </TableCell>
                                    </motion.tr>
                                ) : (
                                    <AnimatePresence>
                                        {currentData.map((item, index) => (
                                            <motion.tr
                                                key={`${item.email}-${item.order_id}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                                className={`relative group hover:bg-muted/30 ${index % 2 === 0 ? 'bg-muted/10' : ''}`}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center group/email">
                                                        <span>{item.email.split('@')[0]}</span>
                                                        <span className="text-muted-foreground">@{item.email.split('@')[1]}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 ml-2 opacity-0 group-hover/email:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.email);
                                                                // toast.info("Email copied to clipboard");
                                                            }}
                                                        >
                                                            <span className="text-xs">Copy</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center group/password">
                                                        <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        <span className="font-mono text-xs px-2 py-1 bg-muted rounded-md">
                                                            {item.password}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 ml-2 opacity-0 group-hover/password:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.password);
                                                                // toast.info("Password copied to clipboard");
                                                            }}
                                                        >
                                                            <span className="text-xs">Copy</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    
                                                    <div className="flex items-center group/orderid">
                                                        <Hash className="h-4 w-4 mr-2 text-green-500" />
                                                        <span className="font-mono text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
                                                            {item.order_id}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 ml-2 opacity-0 group-hover/orderid:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.order_id);
                                                                // toast.info("Order ID copied to clipboard");
                                                            }}
                                                        >
                                                            <span className="text-xs">Copy</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        <Badge variant="outline" className="bg-primary/10">
                                                            {item.section}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Rows className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        {item.row}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                                        <span className="text-green-500 font-medium">{item.price}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getResultBadge(item.result)}</TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination and Summary */}
                    {filteredAndSortedData.length > 0 && (
                        <motion.div
                            className="p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
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
                                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} checkouts
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center">
                                    <motion.div
                                        className="flex items-center font-medium"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                        <span className="text-green-500">${totalValue.toFixed(2)} total</span>
                                    </motion.div>

                                    <div className="h-4 w-px bg-muted-foreground/20"></div>

                                    <div className="flex flex-wrap gap-3">
                                        {resultCounts.confirmed && (
                                            <motion.div
                                                className="flex items-center"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                                <span className="text-green-500">{resultCounts.confirmed} confirmed</span>
                                            </motion.div>
                                        )}
                                        {resultCounts.processing && (
                                            <motion.div
                                                className="flex items-center"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <Loader2 className="h-3 w-3 mr-1 text-amber-500 animate-spin" />
                                                <span className="text-amber-500">{resultCounts.processing} processing</span>
                                            </motion.div>
                                        )}
                                        {resultCounts.verified && (
                                            <motion.div
                                                className="flex items-center"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.6 }}
                                            >
                                                <ShieldCheck className="h-3 w-3 mr-1 text-blue-500" />
                                                <span className="text-blue-500">{resultCounts.verified} verified</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
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
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};