// pages/HistoryDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { QueueTable } from '@/components/history/QueueTable';
import { CartsTable } from '@/components/history/CartsTable';
import { CheckoutsTable } from '@/components/history/CheckoutsTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistoryDetail } from '@/custom-hooks/use-history-detail';

const HistoryDetailPage: React.FC = () => {
    const params = useParams({ from: '/history/$eventId' });
    const { eventId } = params;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('queue');

    const {
        eventDetail,
        isLoading,
        error
    } = useHistoryDetail(eventId);

    const handleGoBack = () => {
        navigate({ to: "/history" });
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
        <div className="container mx-auto py-6 space-y-6">
            {/* Back button */}
            <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 mb-4"
                onClick={handleGoBack}
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to History</span>
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
                    <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                        {error}
                    </div>
                ) : eventDetail ? (
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{eventDetail.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>{formatEventDate(eventDetail.date)}</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4" />
                                <span>{eventDetail.venue}</span>
                            </div>
                            <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                <Badge variant="outline">
                                    {eventDetail.accounts} {eventDetail.accounts === 1 ? 'account' : 'accounts'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Tabs */}
            <div className="mt-8">
                <Tabs defaultValue="queue" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="queue">Queue</TabsTrigger>
                        <TabsTrigger value="carts">Carts</TabsTrigger>
                        <TabsTrigger value="checkouts">Checkouts</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="queue" className="space-y-4">
                            <QueueTable eventId={eventId} />
                        </TabsContent>

                        <TabsContent value="carts" className="space-y-4">
                            <CartsTable eventId={eventId} />
                        </TabsContent>

                        <TabsContent value="checkouts" className="space-y-4">
                            <CheckoutsTable eventId={eventId} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default HistoryDetailPage;