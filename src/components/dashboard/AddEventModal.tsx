import React, { useState, useEffect } from 'react';
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
import { Profile } from '@/@types';
import { fetchProfiles } from '@/rest-api/profiles-api';
import { motion, AnimatePresence } from 'framer-motion';
import { MultiSelect } from '@/components/ui/multi-select';

const formSchema = z.object({
    event_url: z.string().url({ message: "Please enter a valid URL" }),
    profile_ids: z.array(z.string()).default([]),
    is_delay_enabled: z.boolean().default(true),
    delay: z.number().int().min(0).default(5),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { event_url: string; profile_ids: string[]; delay: number }) => Promise<boolean>;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [profilesLoading, setProfilesLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setProfilesLoading(true);
            fetchProfiles()
                .then(setProfiles)
                .finally(() => setProfilesLoading(false));
        }
    }, [isOpen]);

    const form = useForm<FormValues>({
        defaultValues: {
            event_url: '',
            profile_ids: [],
            is_delay_enabled: true,
            delay: 5,
        },
    });

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                event_url: values.event_url,
                profile_ids: values.profile_ids,
                delay: values.is_delay_enabled ? values.delay : 0,
            };
            const success = await onSubmit(payload);
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

                        <FormField
                            control={form.control}
                            name="profile_ids"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Profiles</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={profiles.map(profile => ({
                                                label: `${profile.name} (${profile.accountCount} accounts)`,
                                                value: profile.id,
                                            }))}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            placeholder="Select profiles..."
                                            maxCount={10}
                                            className=""
                                            disabled={profilesLoading}
                                            variant="default"
                                            modalPopover={true}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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