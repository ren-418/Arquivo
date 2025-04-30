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
import { MoreHorizontal, ArrowUpDown, Trash, CreditCard, Mail, Lock, Globe, ExternalLink, Users, Calendar } from 'lucide-react';

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

import { fetchProfiles } from '@/rest-api/profiles-api';

interface Profile {
    id: string;
    name: string;
    accountCount: number;
    createdAt: string;
}

interface ProfilesTableProps {
    data: Profile[];
    isLoading: boolean;
    onDelete: (id: string) => Promise<any>;
    onProfileClick?: (id: string) => void;
}

type SortField = 'name' | 'accountCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const ProfilesTable: React.FC<ProfilesTableProps> = ({ data, isLoading, onDelete, onProfileClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

    // Handle sort toggle
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Filter and sort data
    const filteredAndSortedData = React.useMemo(() => {
        if (!data) return [];
        
        let result = [...data];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(profile =>
                profile.name.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let valueA, valueB;

            switch (sortField) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'accountCount':
                    valueA = a.accountCount;
                    valueB = b.accountCount;
                    break;
                case 'createdAt':
                    valueA = new Date(a.createdAt).getTime();
                    valueB = new Date(b.createdAt).getTime();
                    break;
                default:
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        return result;
    }, [data, searchTerm, sortField, sortDirection]);

    // Reset to first page when filter changes or data updates
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortDirection, pageSize, data]);

    // Get current page data
    const currentData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedData, currentPage, pageSize]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

    // Handle page change
    const handlePageChange = (page: number) => {
        const targetPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatCardNumber = (number: string) => {
        return `${number.slice(0, 4)}...${number.slice(-4)}`;
    };

    const initData = async () => {
        const profilesData = await fetchProfiles();
        // setInitialData(profilesData);
    }

    React.useEffect(() => {
        initData();
    }, [data])

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
                        placeholder="Search by profile name..."
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
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} profiles
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                {renderSortButton('name', 'Profile Name', <Mail className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead>
                                {renderSortButton('accountCount', 'Number of Accounts', <Users className="h-4 w-4" />)}
                            </TableHead>
                            <TableHead>
                                {renderSortButton('createdAt', 'Created At', <Calendar className="h-4 w-4" />)}
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
                                    <TableCell className="text-right">
                                        <div className="h-6 w-20 rounded-md bg-muted animate-pulse ml-auto"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : currentData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">No profiles found</p>
                                        {searchTerm && (
                                            <p className="text-xs text-muted-foreground">Try adjusting your search term</p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentData.map((profile) => (
                                <TableRow 
                                    key={profile.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => onProfileClick?.(profile.id)}
                                >
                                    <TableCell>{profile.name}</TableCell>
                                    <TableCell>{profile.accountCount}</TableCell>
                                    <TableCell>{new Date(profile.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete Profile
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this profile? This action cannot be undone.
                                                        All accounts in this profile will be permanently deleted.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(profile.id);
                                                        }}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

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

                            {Array.from({ length: totalPages }).map((_, index) => {
                                const pageNumber = index + 1;

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

export default ProfilesTable;