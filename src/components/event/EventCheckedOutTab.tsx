// CheckedOutTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
    CheckSquare,
    Loader2,
    AlertCircle,
    Map,
    Download,
    Search
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { getCheckedOutTickets } from '@/rest-api/checkout-api';
import { getWholeCheckedOutTickets } from '@/rest-api/carts-api';

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
    event_id?: string;
    event_name?: string;
    event_date?: string;
    event_venue?: string;
}

interface CheckedOutTabProps {
    eventId?: string;
}

const getCheckedOutColSpan = (eventId?: string) => {
    // Event, Date, Venue, Account, Location, Seats, Order ID, Price, Message, Actions
    return eventId ? 9 : 12;
};

const EmptyTicketsPlaceholder = ({ eventId }: { eventId?: string }) => (
    <TableRow>
        <TableCell colSpan={getCheckedOutColSpan(eventId)} className="py-24">
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                <CheckSquare size={24} className="mb-2 opacity-50" />
                <span className="text-muted-foreground">No checked out tickets found</span>
            </div>
        </TableCell>
    </TableRow>
);

const CheckedOutTab: React.FC<CheckedOutTabProps> = ({ eventId }) => {
    const { accountsArray: accounts, eventInfo } = useEventDetail(eventId || '');

    const [loading, setLoading] = useState(true);
    const [checkedOutTickets, setCheckedOutTickets] = useState<CheckedOutTicket[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicketForMap, setSelectedTicketForMap] = useState<CheckedOutTicket | null>(null);

    const processCheckedOutTickets = async () => {
        setLoading(true);
        try {
           

            let tickets: CheckedOutTicket[];
            if (eventId) {
                console.log('Getting checked out tickets for event', eventId);
                // Single event mode
                tickets = await getCheckedOutTickets(eventId);
            } else {
                console.log('Getting all checked out tickets');
                // All events mode
                tickets = await getWholeCheckedOutTickets();
            }
            setCheckedOutTickets(tickets);
            setLoading(false);
        } catch (error) {
            console.error('Failed to process checked out tickets:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
      
        console.log('Processing checked out tickets');
        processCheckedOutTickets();
    }, [ eventId]);

    const filteredTickets = useMemo(() => {
        // Create a Set of unique ticket keys
        const seen = new Set<string>();
        return checkedOutTickets
            .filter(ticket => {
                const key = `${ticket.email}-${ticket.orderId}`;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            })
            .filter(ticket => {
                const searchLower = searchTerm.toLowerCase();
                const seatsString = Array.isArray(ticket.seats) 
                    ? ticket.seats.join(', ') 
                    : String(ticket.seats || '');
                return (
                    ticket.email?.toLowerCase().includes(searchLower) ||
                    ticket.section?.toLowerCase().includes(searchLower) ||
                    ticket.row?.toLowerCase().includes(searchLower) ||
                    seatsString.toLowerCase().includes(searchLower) ||
                    ticket.orderId?.toLowerCase().includes(searchLower) ||
                    ticket.event_name?.toLowerCase().includes(searchLower) ||
                    ticket.event_venue?.toLowerCase().includes(searchLower)
                );
            });
    }, [checkedOutTickets, searchTerm]);

    // Handle ticket download
    const handleDownloadTicket = (ticket: CheckedOutTicket) => {
        // Implement actual download functionality
        console.log(ticket);
        // download ticket
        const downloadUrl = ticket.map;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${ticket.orderId}.png`;
        link.click();
    };

    // Open seat map
    const openSeatMap = (ticket: CheckedOutTicket) => {
        setSelectedTicketForMap(ticket);
    };

    return (
        <div className="space-y-6">
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
                                    {!eventId && (
                                        <>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Venue</TableHead>
                                        </>
                                    )}
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
                                    <EmptyTicketsPlaceholder eventId={eventId} />
                                ) : (
                                    filteredTickets.map((ticket, index) => (
                                        <TableRow
                                            key={`${ticket.email}-${ticket.orderId}`}
                                            className={`hover:bg-accent/10 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                                        >
                                            {!eventId && (
                                                <>
                                                    <TableCell className="font-medium">{ticket.event_name || '-'}</TableCell>
                                                    <TableCell>{ticket.event_date ? new Date(ticket.event_date).toLocaleDateString() : '-'}</TableCell>
                                                    <TableCell>{ticket.event_venue || '-'}</TableCell>
                                                </>
                                            )}
                                            <TableCell className="font-medium">{ticket.email?.split('@')[0] || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="bg-primary/10">{ticket.section || '-'}</Badge>
                                                    <span className="ml-2 text-muted-foreground">Row {ticket.row || '-'}</span>
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
                                                <span className="font-mono">{Array.isArray(ticket.seats) ? ticket.seats.join(', ') : (ticket.seats || '')}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-muted-foreground text-sm">{ticket.orderId || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-green-500">${typeof ticket.price === 'number' ? ticket.price.toFixed(2) : Number(ticket.price || 0).toFixed(2)}</span>
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