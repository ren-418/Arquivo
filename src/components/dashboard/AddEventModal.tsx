import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { AddEventPayload } from '@/@types';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
    event_url: z.string().url({ message: "Please enter a valid URL" }),
    number_of_accounts: z.number().int().min(1, { message: "At least 1 account is required" }),
    min_amount_of_seats: z.number().int().min(1, { message: "Minimum 1 seat required" }),
    max_amount_of_seats: z.number().int().min(1, { message: "Minimum 1 seat required" }),
    is_delay_enabled: z.boolean().default(true),
    delay: z.number().int().min(0).default(5),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddEventPayload) => Promise<boolean>;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            event_url: '',
            number_of_accounts: 1,
            min_amount_of_seats: 1,
            max_amount_of_seats: 2,
            is_delay_enabled: true,
            delay: 5,
        },
    });

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const success = await onSubmit({
                event_url: values.event_url,
                number_of_accounts: values.number_of_accounts,
                min_amount_of_seats: values.min_amount_of_seats,
                max_amount_of_seats: values.max_amount_of_seats,
                delay: values.is_delay_enabled ? values.delay : 0,
            });

            if (success) {
                form.reset();
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDelayEnabled = form.watch('is_delay_enabled');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add New Event</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="event_url"
                            render={({ field }) => (
                                <FormItem> 
                                    <FormLabel>Event URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://www.ticketmaster.com/event/..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the Ticketmaster event URL
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="number_of_accounts"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Accounts</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="min_amount_of_seats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Min Seats</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="max_amount_of_seats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Seats</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="is_delay_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Enable Delay</FormLabel>
                                            <FormDescription>
                                                Add a random delay between actions
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <AnimatePresence>
                                {isDelayEnabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="delay"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Delay (minutes)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Recommended: 5 minutes
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add Event'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEventModal;