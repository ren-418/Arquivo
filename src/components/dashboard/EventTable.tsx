import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventTableItem } from '@/types';
import { Trash, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';

interface EventTableProps {
    data: EventTableItem[];
    isLoading: boolean;
    onDelete: (id: string) => void;
}

const EventTable: React.FC<EventTableProps> = ({ data, isLoading, onDelete }) => {
    const navigate = useNavigate();

    const handleNavigateToEvent = (eventId: string) => {
        navigate({ to: '/event/$eventId', params: { eventId } })
    };
    return (
        <div className="w-full overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Event Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Accounts</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                                <TableCell>
                                    <div className="h-6 w-2/3 rounded-md bg-muted animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-6 w-24 rounded-md bg-muted animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-6 w-32 rounded-md bg-muted animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-6 w-12 rounded-md bg-muted animate-pulse"></div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="h-6 w-20 ml-auto rounded-md bg-muted animate-pulse"></div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center space-y-2 py-6">
                                    <Calendar className="h-10 w-10 text-muted-foreground" />
                                    <p className="text-muted-foreground">No events found</p>
                                    <p className="text-xs text-muted-foreground">Add your first event to get started</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        <AnimatePresence>
                            {data.map((event) => (
                                <motion.tr
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative group cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleNavigateToEvent(event.id)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.1, duration: 0.3 }}
                                                className="w-2 h-2 rounded-full bg-primary"
                                            />
                                            {event.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {event.date}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {event.venue}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {event.accountsCount} {event.accountsCount === 1 ? 'account' : 'accounts'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNavigateToEvent(event.id);
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Trash className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the event
                                                            <span className="font-semibold"> {event.name} </span>
                                                            and remove all associated accounts.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(event.id);
                                                            }}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default EventTable;