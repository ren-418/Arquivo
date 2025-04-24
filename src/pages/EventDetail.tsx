//EventDetail.tsx
import React, { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Loader2,
    Play,
    ShoppingCart,
    Ticket,
    Filter,
    CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventDetail } from '@/custom-hooks/use-event-detail';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EventProgressTab from '@/components/event/EventProgressTab';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useParams } from '@tanstack/react-router';
import { enableCarting, enableQB, enableQuickPicks } from '@/rest-api/api';
import EventPresaleCodesTab from '@/components/event/EventPresaleCodesTab';
import EventFiltersTab from '@/components/event/EventFiltersTab';
import CartedTab from '@/components/event/EventCartedTab';
import CheckedOutTab from '@/components/event/EventCheckedOutTab';

const EventDetail: React.FC = () => {
    const params = useParams({ from: '/event/$eventId' });
    const { eventId } = params;

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('progress');

    const {
        eventDetail,
        eventInfo,
        accountsArray,
        isLoading,
        error
    } = useEventDetail(eventId || '');

    // Action handlers
    const handleStartLooking = () => {
        // toast.info("Looking for seats for the event...");
        enableQuickPicks(eventId);
    };

    const handleStartCarting = () => {
        // toast.info("Starting Carting Process...");
        enableCarting(eventId);
    };

    const handleEnableQB = () => {
        // toast.info("Enabled Queue Bypass");
        enableQB(eventId);
    };

    const handleGoBack = () => {
        navigate({
            to: "/"
        });
    };

    // Format event date
    const formatEventDate = (dateString?: string) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return format(date, 'EEEE, MMMM d, yyyy');
        } catch (err) {
            return dateString;
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Back button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 mb-4"
                    onClick={handleGoBack}
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Dashboard</span>
                </Button>

                {/* Event Header */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-3/4" />
                            <div className="flex gap-4">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-6 w-60" />
                            </div>
                        </div>
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-destructive/10 text-destructive rounded-md"
                        >
                            {error}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-3xl font-bold tracking-tight"><a target='_blank' href={eventDetail?.event_url}>{eventInfo?.event_name}</a></h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>{formatEventDate(eventInfo?.date)}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{eventInfo?.venue}</span>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                    {accountsArray.length} {accountsArray.length === 1 ? 'account' : 'accounts'}
                                </Badge>

                                {eventInfo?.hasQueue && (
                                    <Badge className="bg-amber-500">Queue Active</Badge>
                                )}

                                {eventInfo?.isQbEnabled && (
                                    <Badge className="bg-green-600">QB Enabled</Badge>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Tabs */}
                <div className="mt-8">
                    <Tabs defaultValue="progress" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-5">
                            <TabsTrigger value="progress" className="flex gap-2 items-center">
                                <Play className="h-4 w-4" />
                                <span>Progress</span>
                            </TabsTrigger>
                            <TabsTrigger value="presale" className="flex gap-2 items-center">
                                <Ticket className="h-4 w-4" />
                                <span>Presale Codes</span>
                            </TabsTrigger>
                            <TabsTrigger value="filters" className="flex gap-2 items-center">
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                            </TabsTrigger>
                            <TabsTrigger value="carted" className="flex gap-2 items-center">
                                <ShoppingCart className="h-4 w-4" />
                                <span>Carted</span>
                            </TabsTrigger>
                            <TabsTrigger value="checkedout" className="flex gap-2 items-center">
                                <CheckSquare className="h-4 w-4" />
                                <span>Checked out</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="progress" className="space-y-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <EventProgressTab
                                        accounts={accountsArray}
                                        isLoading={isLoading}
                                        hasQueue={eventInfo?.hasQueue}
                                        isQbEnabled={eventInfo?.isQbEnabled}
                                        onStartLooking={handleStartLooking}
                                        onStartCarting={handleStartCarting}
                                        onEnableQB={handleEnableQB}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="presale">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <EventPresaleCodesTab eventId={eventId || ''} />
                                )}
                            </TabsContent>

                            <TabsContent value="filters">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <>
                                        {eventDetail && (

                                            <EventFiltersTab taskID={eventId} eventId={eventDetail.event_id || ''} sections={eventDetail.sections || []} rows={eventDetail.rows || []} ticket_types={eventDetail.ticket_types || []} map_id={eventDetail.map_id || ''} />
                                        )}
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="carted">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <CartedTab eventId={eventId || ''} />
                                )}
                            </TabsContent>

                            <TabsContent value="checkedout">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <CheckedOutTab eventId={eventId || ''} />
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default EventDetail;