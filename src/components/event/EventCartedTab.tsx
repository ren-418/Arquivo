import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Clock,
    Check,
    ShoppingCart,
    Trash2,
    CheckCircle,
    Loader2,
    AlertCircle,
    Map,
    ExternalLink,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatCountdown } from '@/utils/utils';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';

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
import { dropCartedTicket, checkoutCartedTicket,getCartedTickets } from '@/rest-api/carts-api';



interface CartedTicket {
    email: string;
    section: string;
    row: string;
    seats: string;
    price: number;
    deadline: Date;
    map?: string;
    accountId: string;
    sortc: string;
    sotc: string;
    id_token: string;
    sid: string;
    ma_dvt: string;
    checkout_url: string;
    bid: string;
    proxy: string;
    carts_remaining: number;
    name_on_card: string;
    card_number: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
    address_line_1: string;
    city: string;
    postal_code: string;
    phone: string;
}


interface CartedTabProps {
    eventId: string;
}


type SortableColumn = 'email' | 'section' | 'row' | 'seats' | 'price' | 'deadline' | 'carts_remaining' | null;


const CartedTab: React.FC<CartedTabProps> = React.memo(({ eventId }) => {
    
    const { accountsArray: accounts, isLoading: accountsLoading } = useEventDetail(eventId);

    const [loading, setLoading] = useState(false);
    const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [selectedTicketForMap, setSelectedTicketForMap] = useState<CartedTicket | null>(null);
    const [checkoutConfirmationOpen, setCheckoutConfirmationOpen] = useState(false);
    const [ticketToCheckout, setTicketToCheckout] = useState<string | null>(null);
    const [bulkCheckoutConfirmationOpen, setBulkCheckoutConfirmationOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<CartedTicket | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    
    const [openCheckouts, setOpenCheckouts] = useState<Set<string>>(new Set());
    
    const [sortColumn, setSortColumn] = useState<SortableColumn>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    

    const [cartedTickets, setCartedTickets] = useState<CartedTicket[]>([]);

    const fetchCartedTickets = async () => {
         const response = await getCartedTickets(eventId);
         
         const ticketsWithDate = response.map((ticket: any) => ({
             ...ticket,
             deadline: new Date(ticket.deadline)
         }));
         setCartedTickets(ticketsWithDate);
    }

    useEffect(() => {
        fetchCartedTickets();
    }, [cartedTickets]);
    
    const sortedTickets = useMemo(() => {
        
        if (!sortColumn) return cartedTickets;

        return [...cartedTickets].sort((a, b) => {
            
            let aValue: any, bValue: any;

            switch (sortColumn) {
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'section':
                    aValue = a.section;
                    bValue = b.section;
                    break;
                case 'row':
                    aValue = a.row;
                    bValue = b.row;
                    break;
                case 'seats':
                    aValue = a.seats;
                    bValue = b.seats;
                    break;
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'carts_remaining':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'deadline':
                    aValue = a.deadline?.getTime();
                    bValue = b.deadline?.getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [cartedTickets, sortColumn, sortDirection]);

    const handleSort = useCallback((column: SortableColumn) => {
        
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
        
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    
    const getSortIcon = useCallback((column: SortableColumn) => {
        if (sortColumn !== column) {
            return <ArrowUpDown size={14} className="ml-1 text-muted-foreground opacity-50" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp size={14} className="ml-1 text-primary" />
            : <ArrowDown size={14} className="ml-1 text-primary" />;
    }, [sortColumn, sortDirection]);

    const getTicketDetails = (email: string | null) => {
        if (!email) return null;
        return cartedTickets.find(ticket => ticket.email === email);
    };

    
    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 150);
        return () => clearTimeout(timer);
    }, []);
    
    
    useEffect(() => {
        const markOpen = (_: any, url: string) => {
            setOpenCheckouts(s => new Set(s).add(url));
        };
        const markClosed = (_: any, url: string) => {
            setOpenCheckouts(s => {
                const next = new Set(s);
                next.delete(url);
                return next;
            });
        };

        // window.electron.ipcRenderer.on('checkout-started', markOpen);
        // window.electron.ipcRenderer.on('checkout-ended', markClosed);
        // window.electron.ipcRenderer.on('checkout-failed', markClosed);
        // window.electron.ipcRenderer.on('checkout-already-open', () => {
        //     // toast.info("Checkout already open for that cart");
        // });

        // return () => {
        //     window.electron.ipcRenderer.removeListener('checkout-started', markOpen);
        //     window.electron.ipcRenderer.removeListener('checkout-ended', markClosed);
        //     window.electron.ipcRenderer.removeListener('checkout-failed', markClosed);
        //     window.electron.ipcRenderer.removeListener('checkout-already-open', () => { });
        // };
    }, []);

    
    useEffect(() => {
        if (!window.electron) return; // Skip if not in Electron environment
        
        cartedTickets.forEach(({ checkout_url }) => {
            window.electron.ipcRenderer
                .invoke('is-checkout-open', checkout_url)
                .then((open: boolean) => {
                    if (open) {
                        setOpenCheckouts(s => new Set(s).add(checkout_url));
                    }
                })
                .catch(console.error);
        });
    }, [cartedTickets]);


    
    useEffect(() => {
        if (!window.electron) return; // Skip if not in Electron environment
        
        cartedTickets.forEach(ticket => {
            window.electron.ipcRenderer
                .invoke('is-checkout-open', ticket.checkout_url)
                .then((open: boolean) => {
                    if (open) {
                        setOpenCheckouts(s => {
                            const next = new Set(s);
                            next.add(ticket.checkout_url);
                            return next;
                        });
                    }
                })
                .catch((err: any) => console.error('ipc invoke failed', err));
        });
    }, [cartedTickets]);

    useEffect(() => {
        if (!window.electron) return; // Skip if not in Electron environment
        
        if (cartedTickets.length === 0) return;

        const interval = setInterval(() => {
            cartedTickets.forEach(({ checkout_url }) => {
                window.electron.ipcRenderer
                    .invoke('is-checkout-open', checkout_url)
                    .then((open: boolean) => {
                        setOpenCheckouts(prev => {
                            const next = new Set(prev);
                            if (open) next.add(checkout_url);
                            else next.delete(checkout_url);
                            return next;
                        });
                    })
                    .catch((err: any) => console.error('Polling is‑open failed', err));
            });
        }, 1000); // every second

        return () => clearInterval(interval);
    }, [cartedTickets]);


    
    const handleManualCheckout = useCallback((ticket: CartedTicket) => {
        if (!window.electron) {
            // Fallback behavior for non-Electron environment
            window.open(ticket.checkout_url, '_blank');
            return;
        }

        // 1) Optimistically mark it open
        setOpenCheckouts(s => {
            const next = new Set(s);
            next.add(ticket.checkout_url);
            return next;
        });

        // 2) Fire the real IPC
        window.electron.ipcRenderer.send('checkout-manually', {
            sortc: ticket.sortc,
            sotc: ticket.sotc,
            id_token: ticket.id_token,
            sid: ticket.sid,
            ma_dvt: ticket.ma_dvt,
            checkout_url: ticket.checkout_url,
            bid: ticket.bid,
            proxy: ticket.proxy,
            name_on_card: ticket.name_on_card,
            card_number: ticket.card_number,
            exp_month: ticket.exp_month,
            exp_year: ticket.exp_year,
            cvv: ticket.cvv,
            address_line_1: ticket.address_line_1,
            city: ticket.city,
            postal_code: ticket.postal_code,
            phone: ticket.phone,
        });

        // toast.success("Starting manual checkout process");
    }, []);


    const handleCheckoutTicket = async (email: string) => {
        try {
            setLoading(true);

            // Find the ticket and associated account id
            const ticket = cartedTickets.find(t => t.email === email);
            if (!ticket) {
                throw new Error("Ticket not found");
            }
            await checkoutCartedTicket(eventId, ticket.id);

        } catch (error) {
            console.error('Failed to checkout ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDropTicket = async (email: string) => {
        try {
            setLoading(true);

            // Find the ticket and associated account id
            const ticket = cartedTickets.find(t => t.email === email);
            if (!ticket) {
                throw new Error("Ticket not found");
            }

            // Get the account id from the ticket
           

            await dropCartedTicket(eventId, ticket.id);
            // toast.success("Ticket dropped successfully");

            // No need to update cartedTickets state as it's derived from accounts
            // which will be updated via the useEventDetail polling

        } catch (error) {
            console.error('Failed to drop ticket:', error);
            // toast.error("Failed to drop ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkCheckout = async () => {
        if (selectedTickets.length === 0) return;

        try {
            setLoading(true);
            setBulkCheckoutConfirmationOpen(false);

            for (const email of selectedTickets) {

                const ticket = cartedTickets.find(t => t.email === email);
                if (!ticket) continue;


                const accountId = ticket.accountId;

                const accountIndex = accounts.findIndex(account => account.id === accountId);
                if (accountIndex === -1) continue;

                // await checkoutCart(eventId, accountIndex);
            }

            // Clear selection
            setSelectedTickets([]);

            // toast.success(`${selectedTickets.length} ticket(s) checked out successfully`);
        } catch (error) {
            console.error('Failed to checkout tickets:', error);
            // toast.error("Failed to checkout some tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDrop = async () => {
        if (selectedTickets.length === 0) return;

        try {
            setLoading(true);

            // Process each selected ticket
            for (const email of selectedTickets) {
                // Find the ticket and associated account id
                const ticket = cartedTickets.find(t => t.email === email);
                if (!ticket) continue;

                // Get the account id from the ticket
                const accountId = ticket.accountId;

                // Find the account index based on account id
                const accountIndex = accounts.findIndex(account => account.id === accountId);
                if (accountIndex === -1) continue;

                await dropCart(eventId, accountIndex);
            }

            // Clear selection
            setSelectedTickets([]);

            // toast.success(`${selectedTickets.length} ticket(s) dropped successfully`);
        } catch (error) {
            console.error('Failed to drop tickets:', error);
            // toast.error("Failed to drop some tickets");
        } finally {
            setLoading(false);
        }
    };

    

    const handleSelectAll = useCallback(() => {
        if (selectedTickets.length === cartedTickets.length) {
            // If all are selected, deselect all
            setSelectedTickets([]);
        } else {
            // Otherwise, select all
            setSelectedTickets(cartedTickets.map(ticket => ticket.email));
        }
    }, [selectedTickets.length, cartedTickets]);

    const handleSelectTicket = useCallback((email: string) => {
        setSelectedTickets(prev => {
            if (prev.includes(email)) {
                return prev.filter(id => id !== email);
            } else {
                return [...prev, email];
            }
        });
    }, []);

    const openCheckoutConfirmation = useCallback((email: string) => {
        setTicketToCheckout(email);
        setCheckoutConfirmationOpen(true);
    }, []);

    const handleConfirmCheckout = useCallback(async () => {
        if (!ticketToCheckout) return;

        setCheckoutConfirmationOpen(false);
        await handleCheckoutTicket(ticketToCheckout);
        setTicketToCheckout(null);
    }, [ticketToCheckout, handleCheckoutTicket]);

    const openBulkCheckoutConfirmation = useCallback(() => {
        if (selectedTickets.length === 0) return;
        setBulkCheckoutConfirmationOpen(true);
    }, [selectedTickets.length]);

    const openSeatMap = useCallback((ticket: CartedTicket) => {
        setSelectedTicketForMap(ticket);
    }, []);

    const getCountdownClass = useCallback((deadline: Date) => {
        const now = new Date();
        const diffMs = deadline.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) {
            return "text-red-500 animate-pulse font-bold";
        } else if (diffMins < 3) {
            return "text-amber-500 font-medium";
        } else {
            return "text-green-500";
        }
    }, []);

   
    const openDeleteDialog = useCallback((ticket: CartedTicket) => {
        setTicketToDelete(ticket);
        setDeleteDialogOpen(true);
    }, []);

   
    const confirmDeleteTicket = useCallback(async () => {
        if (!ticketToDelete) return;

        await handleDropTicket(ticketToDelete.email);
        setDeleteDialogOpen(false);
        setTicketToDelete(null);
    }, [ticketToDelete, handleDropTicket]);

   
    const EmptyCartPlaceholder = React.memo(() => (

        <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {loading ? (
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 size={24} className="animate-spin mb-2" />
                        <span>Loading carted tickets...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <ShoppingCart size={24} className="mb-2 opacity-50" />
                        <span>No tickets currently in cart</span>
                    </div>
                )}
            </TableCell>
        </TableRow>
    ));
    const TicketRow = React.memo(({ ticket, index }: { ticket: CartedTicket, index: number }) => (
        <TableRow
            key={ticket.email}
            className={`hover:bg-accent/10 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'} ${pageLoaded ? `animate-fadeIn delay-${Math.min((index % 10) * 50, 500)}` : ''}`}
        >
            <TableCell>
                <Checkbox
                    checked={selectedTickets.includes(ticket.email)}
                    onCheckedChange={() => handleSelectTicket(ticket.email)}
                />
            </TableCell>
            <TableCell className="font-medium" >
                {ticket.email.split('@')[0]}
            </TableCell>
            <TableCell>
                <div className="flex items-center">
                    <Badge variant="outline" className="bg-primary/10">
                        {ticket.section}
                    </Badge>
                    <span className="ml-2 text-muted-foreground">Row {ticket.row}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6"
                        onClick={() => openSeatMap(ticket)}
                    >
                        <Map size={14} className="mr-1" />
                    </Button>
                </div>
            </TableCell>
            <TableCell>
                <span className="font-mono">{ticket.seats}</span>
            </TableCell>
            <TableCell>
                <span className="font-medium text-green-500">${ticket.price.toFixed(2)}</span>
            </TableCell>
            <TableCell>
                {/* <span className="font-medium text-green-500">${(ticket.price * ticket.seats.split(" ").length).toFixed(2)}</span> */}
            </TableCell>
            <TableCell>
                <span className="font-medium">{ticket.carts_remaining}</span>
            </TableCell>
            <TableCell>
                <div className={`flex items-center ${getCountdownClass(ticket.deadline)}`}>
                    <Clock className="h-4 w-4 mr-1" />
                    {formatCountdown(ticket.deadline)}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                    <Button
                        size="sm"
                        onClick={() => openCheckoutConfirmation(ticket.email)}
                        disabled={loading}
                        variant="default"
                        title="Checkout"
                    >
                        <CheckCircle size={14} className="" />
                    </Button>
                    {openCheckouts.has(ticket.checkout_url) ? (
                        <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center">
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Checkout Open
                        </Badge>
                    ) : (
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={loading}
                            onClick={() => handleManualCheckout(ticket)}
                            title="Checkout manually"
                        >
                            <ExternalLink size={14} />
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => openDeleteDialog(ticket)}
                        title="Drop ticket"
                    >
                        <Trash2 size={14} className="text-destructive" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    ));

    const SortableTableHead = React.memo(({
        column,
        children,
        className = ""
    }: {
        column: SortableColumn,
        children: React.ReactNode,
        className?: string
    }) => (
        <TableHead
            className={`cursor-pointer hover:bg-muted/30 transition-colors ${className}`}
            onClick={() => handleSort(column)}
        >
            <div className="flex items-center">
                {children}
                {getSortIcon(column)}
            </div>
        </TableHead>
    ));

    return (
        <div className={`space-y-6 ${pageLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    <h2 className="text-xl font-bold flex items-center">
                        <ShoppingCart size={18} className="text-primary mr-2" />
                        Carted Tickets
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                            ({cartedTickets.length})
                        </span>
                    </h2>
                </div>
            </div>
            <Card>
                <CardHeader className="pb-3 flex flex-row justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                        <ShoppingCart size={18} className="text-primary mr-2" />
                        Manage Tickets
                    </CardTitle>
                    {cartedTickets.length > 0 && (
                        <div className="flex items-center">
                            <div className="mr-4 flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={selectedTickets.length > 0 && selectedTickets.length === cartedTickets.length}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="text-sm text-muted-foreground">
                                    Select All ({selectedTickets.length}/{cartedTickets.length})
                                </label>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    onClick={openBulkCheckoutConfirmation}
                                    disabled={loading || selectedTickets.length === 0}
                                    variant="default"
                                >
                                    <CheckCircle size={14} className="mr-2" />
                                    Checkout ({selectedTickets.length})
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={loading || selectedTickets.length === 0}
                                        >
                                            <Trash2 size={14} className="mr-2 text-destructive" />
                                            Drop
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Drop Selected Tickets</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove {selectedTickets.length} selected tickets from your cart. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={handleBulkDrop}
                                            >
                                                Drop Tickets
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-hidden rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-12"></TableHead>
                                    <SortableTableHead className='text-center' column="email">Email</SortableTableHead>
                                    <SortableTableHead className='text-center' column="section">Location</SortableTableHead>
                                    <SortableTableHead className='text-center' column="seats">Seats</SortableTableHead>
                                    <SortableTableHead className='text-center' column="price">Price</SortableTableHead>
                                    <SortableTableHead className='text-center' column="price">Total Price</SortableTableHead>
                                    <SortableTableHead className='text-center' column="price">Carts Remaining</SortableTableHead>
                                    <SortableTableHead className='text-center' column="deadline">Countdown</SortableTableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 size={24} className="animate-spin mb-2" />
                                                <span>Loading carted tickets...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : sortedTickets.length === 0 ? (
                                    <EmptyCartPlaceholder />
                                ) : (
                                    sortedTickets.map((ticket, index) => (
                                        <TicketRow
                                            key={`${ticket.email}-${ticket.accountId}`}
                                            ticket={ticket}
                                            index={index}
                                        />
                                    ))
                                )}
                            </TableBody> 
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={selectedTicketForMap !== null} onOpenChange={(open) => !open && setSelectedTicketForMap(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Map size={18} className="text-primary mr-2" />
                            Seat Map - Section {selectedTicketForMap?.section}, Row {selectedTicketForMap?.row}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTicketForMap?.seats} - ${selectedTicketForMap?.price.toFixed(2)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative aspect-video rounded-md border">
                        <img
                            src={selectedTicketForMap?.map || '/api/placeholder/600/300'}
                            alt="Venue seating map"
                            className="w-full h-full object-cover rounded-md"
                        />

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
                            onClick={() => {
                                setSelectedTicketForMap(null);
                                if (selectedTicketForMap) {
                                    openCheckoutConfirmation(selectedTicketForMap.email);
                                }
                            }}
                            disabled={loading || !selectedTicketForMap}
                        >
                            <CheckCircle size={14} className="mr-2" />
                            Checkout Ticket
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog
                open={checkoutConfirmationOpen}
                onOpenChange={(open) => {
                    setCheckoutConfirmationOpen(open);
                    if (!open) setTicketToCheckout(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <CheckCircle size={18} className="text-green-500 mr-2" />
                            Confirm Ticket Checkout
                        </DialogTitle>
                        <DialogDescription>
                            You are about to purchase this ticket. Please confirm your order.
                        </DialogDescription>
                    </DialogHeader>

                    {ticketToCheckout && (
                        <div className="space-y-4 my-4">
                            <div className="border bg-muted/10 rounded-md p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">
                                            {getTicketDetails(ticketToCheckout)?.email.split('@')[0]}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <div className="flex items-center">
                                            <Badge variant="outline" className="bg-primary/10">
                                                {getTicketDetails(ticketToCheckout)?.section}
                                            </Badge>
                                            <span className="ml-2">Row {getTicketDetails(ticketToCheckout)?.row}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Seats</p>
                                        <p className="font-mono">{getTicketDetails(ticketToCheckout)?.seats}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Price</p>
                                        <p className="font-medium text-green-500">
                                            ${getTicketDetails(ticketToCheckout)?.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-b py-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total</span>
                                    <span className="text-green-500 font-bold text-lg">
                                        ${getTicketDetails(ticketToCheckout)?.price.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center bg-muted/10 p-3 rounded-md border">
                                <AlertCircle size={18} className="text-muted-foreground mr-2 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Once purchased, tickets will be available in your account. Payment will be processed immediately.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            onClick={handleConfirmCheckout}
                            disabled={loading || !ticketToCheckout}
                        >
                            <Check size={14} className="mr-2" />
                            Confirm Purchase
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog
                open={bulkCheckoutConfirmationOpen}
                onOpenChange={setBulkCheckoutConfirmationOpen}
            >
                <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <CheckCircle size={18} className="text-green-500 mr-2" />
                            Confirm Bulk Checkout
                        </DialogTitle>
                        <DialogDescription>
                            You are about to purchase {selectedTickets.length} tickets. Please confirm your order.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <div className="max-h-60 overflow-y-auto overflow-x-hidden border bg-muted/10 rounded-md p-2">
                            <div className="w-full overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="whitespace-nowrap">Email</TableHead>
                                            <TableHead className="whitespace-nowrap">Section</TableHead>
                                            <TableHead className="whitespace-nowrap">Seats</TableHead>
                                            <TableHead className="whitespace-nowrap text-right">Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedTickets
                                            .filter(ticket => selectedTickets.includes(ticket.email))
                                            .map((ticket, index) => (
                                                <TableRow
                                                    key={ticket.email}
                                                    className={`border-b ${index % 2 === 0 ? 'bg-muted/5' : 'bg-transparent'}`}
                                                >
                                                    <TableCell className="py-2 truncate max-w-[120px]">
                                                        <span className="text-sm truncate block">
                                                            {ticket.email.split('@')[0]}
                                                            <span className="text-muted-foreground">@{ticket.email.split('@')[1]}</span>
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-2 whitespace-nowrap">
                                                        <Badge variant="outline" className="bg-primary/10 text-xs">
                                                            {ticket.section}
                                                        </Badge>
                                                        <span className="ml-1 text-muted-foreground text-xs">Row {ticket.row}</span>
                                                    </TableCell>
                                                    <TableCell className="py-2 whitespace-nowrap">
                                                        <span className="font-mono text-sm">{ticket.seats}</span>
                                                    </TableCell>
                                                    <TableCell className="py-2 text-right whitespace-nowrap">
                                                        <span className="text-green-500 text-sm">${ticket.price.toFixed(2)}</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="border-t border-b py-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total ({selectedTickets.length} tickets)</span>
                                <span className="text-green-500 font-bold text-lg">
                                    ${sortedTickets
                                        .filter(ticket => selectedTickets.includes(ticket.email))
                                        .reduce((sum, ticket) => sum + ticket.price, 0)
                                        .toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center bg-muted/10 p-3 rounded-md border">
                            <AlertCircle size={18} className="text-muted-foreground mr-2 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                Once purchased, all tickets will be available in your respective accounts. Payment will be processed immediately.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button
                            onClick={handleBulkCheckout}
                            disabled={loading || selectedTickets.length === 0}
                            className="w-full sm:w-auto"
                        >
                            <Check size={14} className="mr-2" />
                            Confirm Purchase ({selectedTickets.length})
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Drop Ticket</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the ticket from your cart. This action cannot be undone.
                            {ticketToDelete && ticketToDelete.carts_remaining > 0 && ticketToDelete.carts_remaining < 5 ? (
                                <span className="block mt-1">You only have {ticketToDelete.carts_remaining} remaning carts</span>
                            ) : (
                                <>
                                    {ticketToDelete && ticketToDelete.carts_remaining === 0 && (
                                        <span className="block mt-1 text-red-500">You don't have any cart remaning, if drop this cart, this account will not be able to cart again and will need to rejoin the queue!</span>
                                    )}
                                </>
                            )}
                            {ticketToDelete && (
                                <div className="mt-2 p-2 border rounded bg-muted/10">
                                    <p className="text-sm">
                                        <span className="font-medium">{ticketToDelete.email}</span>
                                        <span className="block mt-1">
                                            Section {ticketToDelete.section}, Row {ticketToDelete.row}, Seats: {ticketToDelete.seats}
                                        </span>
                                        <span className="block mt-1 text-green-500">${ticketToDelete.price.toFixed(2)}</span>

                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteTicket}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Drop Ticket
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
});

export default CartedTab;