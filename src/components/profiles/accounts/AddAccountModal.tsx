import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';

const accountSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    proxy: z.string().min(1, { message: 'Proxy is required' }),
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    card_number: z.string().regex(/^\d{16}$/, { message: 'Card number must be 16 digits' }),
    exp_month: z.string().regex(/^(0[1-9]|1[0-2])$/, { message: 'Invalid expiration month (01-12)' }),
    exp_year: z.string().regex(/^\d{2}$/, { message: 'Invalid expiration year (YY)' }),
    cvv: z.string().regex(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' }),
    address_line_1: z.string().min(1, { message: 'Address is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    PostalCode: z.string().min(1, { message: 'Postal code is required' }),
    phone: z.string().min(1, { message: 'Phone number is required' }),
    sortc: z.string(),
    sotc: z.string(),
    id_token: z.string(),
    sid: z.string(),
    ma_dvt: z.string(),
    bid: z.string(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AddAccountModalProps {
    onAddAccount: (account: AccountFormData) => Promise<void>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ onAddAccount, open, onOpenChange }) => {
    const form = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            email: '',
            proxy: '',
            first_name: '',
            last_name: '',
            card_number: '',
            exp_month: '',
            exp_year: '',
            cvv: '',
            address_line_1: '',
            city: '',
            PostalCode: '',
            phone: '',
            sortc: '',
            sotc: '',
            id_token: '',
            sid: '',
            ma_dvt: '',
            bid: '',
        },
    });

    const onSubmit = async (data: AccountFormData) => {
        try {
            await onAddAccount(data);
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to add account:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="proxy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proxy</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Proxy" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="First Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Last Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="card_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Card Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Card Number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <FormField
                                    control={form.control}
                                    name="exp_month"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Month</FormLabel>
                                            <FormControl>
                                                <Input placeholder="MM" maxLength={2} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="exp_year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year</FormLabel>
                                            <FormControl>
                                                <Input placeholder="YY" maxLength={2} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cvv"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CVV</FormLabel>
                                            <FormControl>
                                                <Input placeholder="CVV" maxLength={4} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="address_line_1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="PostalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Postal Code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Phone" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sortc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SORTC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SORTC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sotc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SOTC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SOTC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="id_token"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID Token</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ID Token" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ma_dvt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MA DVT</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MA DVT" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="BID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full">Add Account</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddAccountModal; 