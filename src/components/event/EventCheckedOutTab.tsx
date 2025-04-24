// CheckedOutTab.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CheckSquare,
    Loader2,
    AlertCircle,
    Map,
    Download,
    ExternalLink,
    Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { useEventDetail } from '@/custom-hooks/use-event-detail';
import { Input } from '@/components/ui/input';
import TruncatedTextCell from '../TruncatedTextCell';


interface CheckedOutTicket {
    email: string;
    section: string;
    row: string;
    seats: string;
    price: number;
    purchaseDate: Date;
    orderId: string;
    map: string;
    message: string;
}

interface CheckedOutTabProps {
    eventId: string;
}

const CheckedOutTab: React.FC<CheckedOutTabProps> = ({ eventId }) => {
    // Fetch accounts and event data from the parent hook
    const { accountsArray: accounts, eventInfo } = useEventDetail(eventId);

    // State management
    const [loading, setLoading] = useState(true);
    const [checkedOutTickets, setCheckedOutTickets] = useState<CheckedOutTicket[]>([]);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicketForMap, setSelectedTicketForMap] = useState<CheckedOutTicket | null>(null);

    // Process account data to extract checked out tickets
    useEffect(() => {
        // Skip processing if accounts aren't loaded yet
        if (!accounts) {
            return;
        }

        const processCheckedOutTickets = () => {
            try {
                if (accounts.length === 0) {
                    setLoading(false);
                    return;
                }

                const tickets: CheckedOutTicket[] = accounts
                    .filter(account => account.checked_out && account.checked_out.order_id)
                    .map(account => {
                        // Get the seat string from seats array
                        const seatString = account.checked_out.seats
                            ? account.checked_out.seats.join(', ')
                            : 'N/A';

                        // Convert price string to number
                        const priceNumber = parseFloat(account.checked_out.price.replace(/[^0-9.]/g, ''));

                        return {
                            email: account.email,
                            section: account.checked_out.section,
                            row: account.checked_out.row,
                            seats: seatString,
                            price: isNaN(priceNumber) ? 0 : priceNumber,
                            purchaseDate: new Date(), // We don't have the actual purchase date in the data
                            map: account.checked_out.map,
                            orderId: account.checked_out.order_id,
                            message: account.checked_out.message
                        };
                    });

                setCheckedOutTickets(tickets);
                setLoading(false);
            } catch (error) {
                console.error('Failed to process checked out tickets:', error);
                // toast.error("Failed to load checked out tickets");
                setLoading(false);
            }
        };

        processCheckedOutTickets();
    }, [accounts]);

    // Set page loaded flag only once after mounting
    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 150);
        return () => clearTimeout(timer);
    }, []);

    // Filter tickets based on search term
    const filteredTickets = checkedOutTickets.filter(ticket =>
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.row.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.seats.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format purchase date
    const formatPurchaseDate = (date: Date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle ticket download
    const handleDownloadTicket = (ticket: CheckedOutTicket) => {
        // toast.success(`Ticket for ${ticket.email} downloaded`);
        // Implement actual download functionality
    };

    // Open seat map
    const openSeatMap = (ticket: CheckedOutTicket) => {
        setSelectedTicketForMap(ticket);
    };

    // Empty tickets placeholder
    const EmptyTicketsPlaceholder = () => (
        <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {loading ? (
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 size={24} className="animate-spin mb-2" />
                        <span>Loading checked out tickets...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <CheckSquare size={24} className="mb-2 opacity-50" />
                        <span>No checked out tickets found</span>
                    </div>
                )}
            </TableCell>
        </TableRow>
    );

    return (
        <div className={`space-y-6 ${pageLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    <h2 className="text-xl font-bold flex items-center">
                        <CheckSquare size={18} className="text-primary mr-2" />
                        Checked Out Tickets
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                            ({checkedOutTickets.length})
                        </span>
                    </h2>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tickets..."
                        className="w-[250px] pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <CheckSquare size={18} className="text-primary mr-2" />
                        Manage Checked Out Tickets
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-hidden rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Account</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Seats</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.length === 0 ? (
                                    <EmptyTicketsPlaceholder />
                                ) : (
                                    filteredTickets.map((ticket, index) => (
                                        <TableRow
                                            key={`${ticket.email}-${ticket.orderId}`}
                                            className={`hover:bg-accent/10 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'} ${pageLoaded ? `animate-fadeIn delay-${Math.min((index % 10) * 50, 500)}` : ''}`}
                                        >
                                            <TableCell className="font-medium">
                                                {ticket.email.split('@')[0]}
                                                <span className="text-muted-foreground">@{ticket.email.split('@')[1]}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="bg-primary/10">
                                                        {ticket.section}
                                                    </Badge>
                                                    <span className="ml-2 text-muted-foreground">Row {ticket.row}</span>
                                                    {ticket.map && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-1 h-6"
                                                            onClick={() => openSeatMap(ticket)}
                                                        >
                                                            <Map size={14} className="mr-1" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono">{ticket.seats}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-muted-foreground text-sm">
                                                    {ticket.orderId}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-green-500">${ticket.price.toFixed(2)}</span>
                                            </TableCell>
                                            <TruncatedTextCell text={ticket.message} maxLength={90} />
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownloadTicket(ticket)}
                                                        variant="default"
                                                    >
                                                        <Download size={14} className="mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Seat Map Dialog */}
            <Dialog open={selectedTicketForMap !== null} onOpenChange={(open) => !open && setSelectedTicketForMap(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Map size={18} className="text-primary mr-2" />
                            Seat Map - Section {selectedTicketForMap?.section}, Row {selectedTicketForMap?.row}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTicketForMap?.seats} - Order ID: {selectedTicketForMap?.orderId}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative aspect-video rounded-md border">
                        {selectedTicketForMap?.map ? (
                            <img
                                src={selectedTicketForMap.map}
                                alt="Venue seating map"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-map.png';
                                    // toast.error("Failed to load seat map");
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <AlertCircle className="mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">No map available</span>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="absolute bottom-4 right-4 bg-background/80 p-2 rounded-md border">
                            <div className="flex items-center mb-1">
                                <div className="w-3 h-3 bg-blue-500 mr-2"></div>
                                <span className="text-xs">Section {selectedTicketForMap?.section}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-xs">Your Seats</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => handleDownloadTicket(selectedTicketForMap!)}
                            disabled={!selectedTicketForMap}
                        >
                            <Download size={14} className="mr-2" />
                            Download Ticket
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CheckedOutTab;