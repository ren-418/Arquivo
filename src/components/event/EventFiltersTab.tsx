import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Filter as FilterIcon,
    RefreshCw,
    Plus,
    DollarSign,
    Hash,
    Trash2,
    Info,
    Map,
    List,
    X,
    AlertTriangle,
    Loader2,
    GripVertical,  // Added GripVertical icon for drag handle
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'; // Added Reorder, useDragControls
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Filter, TicketType } from '@/@types';
import { MultiSelect } from '@/components/ui/multi-select';
import { NumericInput } from '@/components/ui/numeric-input';
import { loadVenueMap } from '@/utils/venue-map-utils';
import { getFilters, addFilter as apiAddFilter, removeFilter as apiRemoveFilter, dropNonMatchingCarts } from '@/rest-api/filters-api'; // Added updateFilterOrder
import { toast } from 'sonner';

interface EventFiltersTabProps {
    eventId: string;
    taskID: string;
    sections: string[];
    rows?: string[];
    ticket_types: TicketType[];
    map_id: string;
}

// Custom draggable table row component
// This component is no longer needed since we've replaced it with inline Reorder.Item implementation
// in the main component to ensure proper alignment

const EventFiltersTab: React.FC<EventFiltersTabProps> = ({ eventId, taskID, sections, rows, ticket_types, map_id }) => {
    // State for filters
    const [filters, setFilters] = useState<Filter[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [currentFilterTab, setCurrentFilterTab] = useState('form');
    const [pageLoaded, setPageLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [editingFilterId, setEditingFilterId] = useState<string | null>(null);


    // Filter form state
    const [filterForm, setFilterForm] = useState<Omit<Filter, 'id'>>({
        sections: [],
        rows: [],
        excluded_ticket_types: [],
        min_price: 0,
        max_price: 1000,
        min_seats: 1,
        max_seats: 8
    });

    // Map related state
    const [mapLoading, setMapLoading] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [selectedMapSections, setSelectedMapSections] = useState<string[]>([]);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const listenersAddedRef = useRef<boolean>(false);

    // Event details state (mocked for now - would come from event detail context)
    const [availableSections, setAvailableSections] = useState<string[]>([]);
    const [availableRows, setAvailableRows] = useState<string[]>([]);
    const [availableTicketTypes, setAvailableTicketTypes] = useState<TicketType[]>([]);
    const [mapID, setMapID] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    // Effect to load mock event data and initialize the page
    useEffect(() => {
        // Mock data setup - in a real app, this would come from the event detail
        setAvailableSections(sections);
        if (rows) {
            setAvailableRows(rows);
        } else {
            setAvailableRows([]);
        }
        setAvailableTicketTypes(ticket_types);
        setMapID(map_id); // This would come from the event details

        fetchFilters();
    }, []);

    // Effect to handle map initialization when the map tab is selected
    useEffect(() => {
        if (currentFilterTab === 'map' && mapID) {
            // Reset the map container
            if (svgContainerRef.current) {
                svgContainerRef.current.innerHTML = '';
            }

            // Load the map with current selections
            loadVenueMap(
                eventId,
                {
                    containerRef: svgContainerRef,
                    onSelectionsChange: setSelectedMapSections,
                    initialSelections: selectedMapSections
                },
                sections,
                setMapLoading,
                setMapError
            );

            listenersAddedRef.current = true;
        }
    }, [currentFilterTab, mapID]);

    // Effect to sync map selections with form
    useEffect(() => {
        if (currentFilterTab === 'map') {
            setFilterForm(prev => ({
                ...prev,
                sections: selectedMapSections
            }));
        }
    }, [selectedMapSections, currentFilterTab]);

    // Fetch filters from API
    const fetchFilters = async () => {
        if (!taskID) return;

        try {
            setIsRefreshing(true);
            // Assuming getFilters returns a record of filters, we provide the expected type:
            const response: Record<string, Filter> = await getFilters(taskID);

            if (response) {
                // Transform the object of filters into an array with IDs included
                const filtersArray = Object.entries(response).map(([id, filterData]) => ({
                    id,
                    ...filterData,  // Now TypeScript recognizes filterData as a Filter object
                }));

                setFilters(filtersArray);
            } else {
                setFilters([]);
            }
        } catch (error) {
            setFilters([]);
            console.error('Failed to fetch filters:', error);
            // toast.error("Failed to load filters");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Add a new filter
    const addFilter = async () => {
        if (!taskID) return;

        try {
            setLoading(true);

            // Create updated filter object with parsed integers
            const updatedFilter = {
                ...filterForm,
                min_price: typeof filterForm.min_price === 'string'
                    ? parseInt(filterForm.min_price, 10) || 0
                    : filterForm.min_price,
                max_price: typeof filterForm.max_price === 'string'
                    ? parseInt(filterForm.max_price, 10) || 1000
                    : filterForm.max_price,
                min_seats: typeof filterForm.min_seats === 'string'
                    ? parseInt(filterForm.min_seats, 10) || 1
                    : filterForm.min_seats,
                max_seats: typeof filterForm.max_seats === 'string'
                    ? parseInt(filterForm.max_seats, 10) || 8
                    : filterForm.max_seats
            };

            await apiAddFilter(taskID, updatedFilter);
            await fetchFilters(); // Refresh from the server

            setIsFilterDialogOpen(false);

            // Reset form and selections
            setFilterForm({
                sections: [],
                rows: [],
                excluded_ticket_types: [],
                min_price: 0,
                max_price: 1000,
                min_seats: 1,
                max_seats: 8
            });
            setSelectedMapSections([]);

            // Clear map selections visually
            if (svgContainerRef.current) {
                //  clearMapSelections(svgContainerRef);
            }

            // toast.success("Filter added successfully")
        } catch (error) {
            console.error('Failed to add filter:', error);
            // toast.error("Failed to add filter")
        } finally {
            setLoading(false);
        }
    };

    // Delete a filter
    const deleteFilter = async (id: string) => {
        if (!taskID) return;

        try {
            setLoading(true);
            await apiRemoveFilter(taskID, id);
            setFilters(filters.filter(filter => filter.id !== id));

            // toast.success("Filter removed successfully")
        } catch (error) {
            console.error('Failed to delete filter:', error);
            // toast.error("Failed to delete filter")
        } finally {
            setLoading(false);
        }
    };

    // Handle filter reordering
    const handleReorder = async (newOrder: Filter[]) => {
        if (!taskID) return;

        try {
            setFilters(newOrder);

            // Get the ordered IDs to send to the backend
            const orderedIds = newOrder.map(filter => filter.id);

            // Call API to update filter order
            // This is a new function that would need to be added to your API
            //await updateFilterOrder(eventId, orderedIds);

        } catch (error) {
            console.error('Failed to update filter order:', error);
            // toast.error("Failed to update filter order");

            // Revert to original order if there's an error
            fetchFilters();
        }
    };

    // Drop non-matching carts
    const handleDropNonMatchingCarts = async () => {
        if (!taskID) return;

        try {
            setLoading(true);
            await dropNonMatchingCarts(taskID);

            // toast.success("Non-matching carted tickets have been dropped")
        } catch (error) {
            console.error('Failed to drop non-matching carts:', error);
            // toast.error("Failed to drop non-matching carted tickets")
        } finally {
            setLoading(false);
        }
    };

    // Handle MultiSelect changes
    const handleSectionsChange = (values: string[]) => {
        setFilterForm(prev => ({
            ...prev,
            sections: values
        }));

        // Update map selections to match dropdown if we're on the map tab
        if (currentFilterTab === 'map' && svgContainerRef.current) {
            //  updateMapSelections(svgContainerRef, values);
            setSelectedMapSections(values);
        }
    };

    const handleRowsChange = (values: string[]) => {
        setFilterForm(prev => ({
            ...prev,
            rows: values
        }));
    };

    const handleExcludedTicketTypesChange = (values: string[]) => {
        setFilterForm(prev => ({
            ...prev,
            excluded_ticket_types: values
        }));
    };

    // Create options format for MultiSelect
    const sectionOptions = availableSections.map(section => ({
        label: section,
        value: section
    }));

    const rowOptions = availableRows.map(row => ({
        label: row,
        value: row
    }));

    const ticketTypeOptions = availableTicketTypes.map(type => ({
        label: type.name,
        value: type.type_id
    }));

    const openEditDialog = (filter: Filter) => {
        setFilterForm({
            sections: filter.sections,
            rows: filter.rows,
            excluded_ticket_types: filter.excluded_ticket_types,
            min_price: filter.min_price,
            max_price: filter.max_price,
            min_seats: filter.min_seats,
            max_seats: filter.max_seats
        });
        setEditingFilterId(filter.id);
        setIsEditing(true);
        setIsFilterDialogOpen(true);
        setCurrentFilterTab('form');
    };


    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
        >
            <motion.div
                variants={itemVariants}
                className="flex justify-between items-center mb-3"
            >
                <div className="flex items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                        <FilterIcon className="h-5 w-5 mr-2 text-primary" />
                        Ticket Filters
                    </h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchFilters}
                    disabled={isRefreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader className="pb-3 flex flex-row justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                            <FilterIcon className="h-5 w-5 mr-2 text-primary" />
                            Filter Configuration
                            <Badge variant="outline" className="ml-2">
                                {filters.length}
                            </Badge>
                        </CardTitle>

                        <div className="flex space-x-2">
                            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={loading} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Filter
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-6xl max-h-[90vh]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center">
                                            <FilterIcon className="h-5 w-5 mr-2 text-primary" />
                                            Add New Filter
                                        </DialogTitle>
                                    </DialogHeader>

                                    <Tabs
                                        defaultValue="form"
                                        value={currentFilterTab}
                                        onValueChange={setCurrentFilterTab}
                                        className="mt-4"
                                    >
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="form" className="flex items-center gap-2">
                                                <List className="h-4 w-4" />
                                                Form Input
                                            </TabsTrigger>
                                            <TabsTrigger value="map" className="flex items-center gap-2">
                                                <Map className="h-4 w-4" />
                                                Seat Map
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="form" className="p-4 border rounded-md mt-2">
                                            <div className="grid gap-4">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium flex items-center">
                                                        <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Sections
                                                    </label>
                                                    <MultiSelect
                                                        options={sectionOptions}
                                                        onValueChange={handleSectionsChange}
                                                        value={filterForm.sections}
                                                        placeholder="Select sections"
                                                        maxCount={10}
                                                        className=""
                                                        disabled={loading}
                                                        variant="default"
                                                        modalPopover={true}
                                                    />
                                                    <p className="text-xs text-muted-foreground italic">
                                                        Select sections from the dropdown or switch to the Seat Map tab for visual selection
                                                    </p>
                                                </div>

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium flex items-center">
                                                        <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Rows
                                                    </label>
                                                    <MultiSelect
                                                        options={rowOptions}
                                                        onValueChange={handleRowsChange}
                                                        value={filterForm.rows}
                                                        placeholder="Select rows"
                                                        maxCount={10}
                                                        className=""
                                                        disabled={loading}
                                                        variant="default"
                                                        modalPopover={true}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium flex items-center">
                                                        <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Excluded Ticket Types
                                                    </label>
                                                    <MultiSelect
                                                        options={ticketTypeOptions}
                                                        onValueChange={handleExcludedTicketTypesChange}
                                                        value={filterForm.excluded_ticket_types}
                                                        placeholder="Select ticket types to exclude"
                                                        maxCount={5}
                                                        className=""
                                                        disabled={loading}
                                                        variant="default"
                                                        modalPopover={true}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                        <label className="text-sm font-medium flex items-center">
                                                            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            Min Price ($)
                                                        </label>
                                                        <NumericInput
                                                            value={filterForm.min_price}
                                                            onChange={(value) => setFilterForm({ ...filterForm, min_price: Number(value) })}
                                                            disabled={loading}
                                                            className="mt-1"
                                                            min={0}
                                                            max={10000}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium flex items-center">
                                                            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            Max Price ($)
                                                        </label>
                                                        <NumericInput
                                                            value={filterForm.max_price}
                                                            onChange={(value) => setFilterForm({ ...filterForm, max_price: Number(value) })}
                                                            disabled={loading}
                                                            className="mt-1"
                                                            min={0}
                                                            max={10000}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium flex items-center">
                                                            <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            Min Seats
                                                        </label>
                                                        <NumericInput
                                                            value={filterForm.min_seats}
                                                            onChange={(value) => setFilterForm({ ...filterForm, min_seats: Number(value) })}
                                                            disabled={loading}
                                                            className="mt-1"
                                                            min={1}
                                                            max={10}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium flex items-center">
                                                            <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            Max Seats
                                                        </label>
                                                        <NumericInput
                                                            value={filterForm.max_seats}
                                                            onChange={(value) => setFilterForm({ ...filterForm, max_seats: Number(value) })}
                                                            disabled={loading}
                                                            className="mt-1"
                                                            min={1}
                                                            max={10}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="map" className="p-4 border rounded-md mt-2">
                                            <div className="flex flex-col">
                                                <div className="bg-muted/30 p-3 rounded-md mb-4 border">
                                                    <p className="text-sm mb-1">
                                                        <span className="font-medium">Instructions:</span> Use the seat map to visually select your preferred sections.
                                                    </p>
                                                    <ul className="text-xs text-muted-foreground space-y-1">
                                                        <li>• Click on a section to select them individually</li>
                                                        <li>• Shift+click a section to select the entire level</li>
                                                        <li>• Selected sections: {selectedMapSections.length > 0 ? selectedMapSections.join(", ") : "None"}</li>
                                                    </ul>
                                                </div>
                                                <div className="rounded-md border">

                                                    <TransformWrapper
                                                        initialScale={1}
                                                        initialPositionX={0}
                                                        initialPositionY={0}
                                                        centerOnInit={true}
                                                    >
                                                        <TransformComponent
                                                            wrapperStyle={{
                                                                width: "100%",
                                                                height: "50vh",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center"
                                                            }}
                                                            contentStyle={{
                                                                width: "100%",
                                                                height: "100%",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center"
                                                            }}
                                                        >
                                                            <div
                                                                ref={svgContainerRef}
                                                                className="relative flex justify-center items-center"
                                                                style={{ width: '100%', height: '50vh' }}
                                                            ></div>
                                                        </TransformComponent>
                                                    </TransformWrapper>

                                                </div>

                                                {/* Selected sections from the map */}
                                                {selectedMapSections.length > 0 && (
                                                    <div className="mt-4">
                                                        <h3 className="text-sm font-medium mb-2">Selected Sections</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedMapSections.map(section => (
                                                                <Badge
                                                                    key={section}
                                                                    variant="outline"
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    {section}
                                                                    <button
                                                                        className="ml-1 rounded-full hover:bg-muted"
                                                                        onClick={() => {
                                                                            const newSections = selectedMapSections.filter(s => s !== section);
                                                                            setSelectedMapSections(newSections);
                                                                            // updateMapSelections(svgContainerRef, newSections);
                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <DialogFooter className="mt-6">
                                        <Button
                                            onClick={() => setIsFilterDialogOpen(false)}
                                            variant="outline"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={addFilter}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Filter
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={loading || filters.length === 0}
                                        className="flex items-center gap-2"
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        Drop Non-Matching Carts
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Drop Non-Matching Carts</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will immediately drop all carted tickets that don't match your current filters.
                                            This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={handleDropNonMatchingCarts}
                                            disabled={loading}
                                        >
                                            Proceed
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-md">
                            <div className="relative">
                                {/* Table header */}
                                <div className="flex w-full border-b">
                                    <div className="w-10 py-3 px-2 flex items-center justify-center">
                                        {/* Drag indicator column */}
                                    </div>
                                    <div className="flex-1 py-3 px-4 font-medium">Sections</div>
                                    <div className="flex-1 py-3 px-4 font-medium">Rows</div>
                                    <div className="flex-1 py-3 px-4 font-medium">Price Range</div>
                                    <div className="flex-1 py-3 px-4 font-medium">Seats Range</div>
                                    <div className="w-20 py-3 pr-4 text-right font-medium">Actions</div>
                                </div>

                                {/* Table body */}
                                {filters.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                                <span>Loading filters...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <FilterIcon className="h-8 w-8 mb-2 opacity-70" />
                                                <span>No filters available</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsFilterDialogOpen(true)}
                                                    className="mt-3"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First Filter
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Reorder.Group
                                        axis="y"
                                        values={filters}
                                        onReorder={handleReorder}
                                        className="w-full"
                                    >
                                        <AnimatePresence>
                                            {filters.map((filter, index) => (

                                                <Reorder.Item
                                                    key={filter.id}
                                                    value={filter}
                                                    className="flex w-full items-center border-b last:border-0 hover:bg-muted/50 group"
                                                    whileDrag={{
                                                        scale: 1.02,
                                                        boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
                                                        backgroundColor: "var(--muted)",
                                                        zIndex: 999
                                                    }}
                                                >
                                                    <div className="w-10 py-3 px-2 flex items-center justify-center">
                                                        <div className="cursor-grab active:cursor-grabbing px-1">
                                                            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 py-3 px-4">
                                                        {filter.sections.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {filter.sections.slice(0, 3).map(section => (
                                                                    <Badge
                                                                        key={section}
                                                                        variant="outline"
                                                                        className="bg-primary/10"
                                                                    >
                                                                        {section}
                                                                    </Badge>
                                                                ))}
                                                                {filter.sections.length > 3 && (
                                                                    <Badge variant="secondary">
                                                                        +{filter.sections.length - 3} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">All</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 py-3 px-4">
                                                        {filter.rows.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {filter.rows.slice(0, 5).map(row => (
                                                                    <Badge
                                                                        key={row}
                                                                        variant="outline"
                                                                        className="bg-primary/10"
                                                                    >
                                                                        {row}
                                                                    </Badge>
                                                                ))}
                                                                {filter.rows.length > 5 && (
                                                                    <Badge variant="secondary">
                                                                        +{filter.rows.length - 5} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">All</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 py-3 px-4 font-medium">
                                                        <div className="flex items-center">
                                                            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                                            <span>{filter.min_price}</span>
                                                            <span className="mx-1 text-muted-foreground">-</span>
                                                            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                                            <span>{filter.max_price}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 py-3 px-4">
                                                        <div className="flex items-center">
                                                            <Badge className="bg-blue-500/10 text-blue-500 mr-2">
                                                                {filter.min_seats}
                                                            </Badge>
                                                            <span className="text-muted-foreground">to</span>
                                                            <Badge className="bg-blue-500/10 text-blue-500 ml-2">
                                                                {filter.max_seats}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="w-20 py-3 pr-4 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(filter)} disabled={loading} className="text-primary hover:bg-primary/10"><Edit2 className="h-4 w-4" /></Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteFilter(filter.id)}
                                                            disabled={loading}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </AnimatePresence>
                                    </Reorder.Group>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default EventFiltersTab;