//EventDetail.tsx
import React, { useState, useEffect } from 'react';
import {
    Loader2,
    ShoppingCart,
    CheckSquare
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { useNavigate } from '@tanstack/react-router';
import CartedTab from '@/components/event/EventCartedTab';
import CheckedOutTab from '@/components/event/EventCheckedOutTab';
import PageTitle from '@/components/PageTitle';

const Carts: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('carted');

    useEffect(() => {
        
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
        <PageTitle
                title="Carts"
                description="Manage your carts and checkouts"
                
            />
            <div className="space-y-6">
                

                {/* Tabs */}
                <div className="mt-8">
                    <Tabs defaultValue="carted" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
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
                            <TabsContent value="carted">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <CartedTab />
                                )}
                            </TabsContent>

                            <TabsContent value="checkedout">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <CheckedOutTab />
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default Carts;