import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Trash, Globe, CreditCard } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Account {
    email: string;
    proxy: string;
    first_name: string;
    last_name: string;
    card_number: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
    address_line_1: string;
    city: string;
    PostalCode: string;
    phone: string;
    sortc: string;
    sotc: string;
    id_token: string;
    sid: string;
    ma_dvt: string;
    bid: string;
}

interface AccountsTableProps {
    accounts: Account[];
    onDeleteAccount: (email: string) => Promise<void>;
}

const AccountsTable: React.FC<AccountsTableProps> = ({ accounts, onDeleteAccount }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAccounts = accounts?.filter(account =>
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.proxy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCardNumber = (number: string) => {
        return `${number.slice(0, 4)}...${number.slice(-4)}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or proxy..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Proxy</TableHead>
                            <TableHead>Card Info</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAccounts?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Mail className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">No accounts found</p>
                                        {searchTerm && (
                                            <p className="text-xs text-muted-foreground">Try adjusting your search term</p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAccounts?.map((account) => (
                                <TableRow key={account.email}>
                                    <TableCell>{account.email}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            {account.proxy}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            {formatCardNumber(account.card_number)}
                                            <span className="text-muted-foreground">
                                                ({account.exp_month}/{account.exp_year})
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {account.first_name} {account.last_name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{account.address_line_1}</div>
                                            <div className="text-muted-foreground">
                                                {account.city}, {account.PostalCode}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete Account
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to remove this account from the profile?
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        onClick={() => onDeleteAccount(account.email)}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AccountsTable; 