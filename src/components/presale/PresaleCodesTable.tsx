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
import { PresaleCodeSet } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Trash, Eye, Edit, Ticket, Search, Calendar } from 'lucide-react';
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
import { formatDistanceToNow, format } from 'date-fns';

interface PresaleCodesTableProps {
  data: PresaleCodeSet[];
  isLoading: boolean;
  onDelete: (id: number) => Promise<boolean>;
  onViewEdit: (id: number) => void;
}

type SortField = 'name' | 'codesCount' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const PresaleCodesTable: React.FC<PresaleCodesTableProps> = ({ 
  data, 
  isLoading, 
  onDelete, 
  onViewEdit 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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
      result = result.filter(item => 
        item.name.toLowerCase().includes(term)
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
        case 'codesCount':
          valueA = a.codesCount;
          valueB = b.codesCount;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
          break;
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      formatted: format(date, 'MMM dd, yyyy HH:mm'),
      relative: formatDistanceToNow(date, { addSuffix: true })
    };
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
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
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} sets
            </div>
          </div>
        )}
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {renderSortButton('name', 'Name', <Ticket className="h-4 w-4" />)}
              </TableHead>
              <TableHead>
                {renderSortButton('codesCount', 'Codes', <Badge className="h-4 w-4" />)}
              </TableHead>
              <TableHead>
                {renderSortButton('createdAt', 'Created At', <Calendar className="h-4 w-4" />)}
              </TableHead>
              <TableHead>
                {renderSortButton('updatedAt', 'Updated At', <Calendar className="h-4 w-4" />)}
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
                    <div className="h-6 w-16 rounded-md bg-muted animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-36 rounded-md bg-muted animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-36 rounded-md bg-muted animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-6 w-24 ml-auto rounded-md bg-muted animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 py-6">
                    <Ticket className="h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">No presale code sets found</p>
                    {searchTerm ? (
                      <p className="text-xs text-muted-foreground">Try adjusting your search term</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Add your first presale code set to get started</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {currentData.map((presaleSet, index) => {
                  const createdDate = formatDate(presaleSet.createdAt);
                  const updatedDate = formatDate(presaleSet.updatedAt);
                  
                  return (
                    <motion.tr
                      key={presaleSet.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="relative group"
                    >
                      <TableCell className="font-medium max-w-[300px] truncate">
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{presaleSet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {presaleSet.codesCount} {presaleSet.codesCount === 1 ? 'code' : 'codes'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{createdDate.formatted}</span>
                          <span className="text-xs text-muted-foreground">{createdDate.relative}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{updatedDate.formatted}</span>
                          <span className="text-xs text-muted-foreground">{updatedDate.relative}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-2 flex items-center gap-1"
                            onClick={() => onViewEdit(presaleSet.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span>View/Edit</span>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2 flex items-center gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                                <span>Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the presale code set
                                  <span className="font-semibold"> {presaleSet.name} </span>
                                  and all associated codes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => onDelete(presaleSet.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
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

export default PresaleCodesTable;