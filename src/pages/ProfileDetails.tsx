import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Users, ArrowLeft } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AddAccountsModal from '@/components/profiles/accounts/AddAccountModal';
import AccountsTable from '@/components/profiles/accounts/AccountsTable';
import { toast } from 'sonner';
import { fetchProfileDetails, deleteProfile, deleteAccountFromProfile } from '@/rest-api/profiles-api';
import api from '@/rest-api/api';

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

interface ProfileDetails {
    id: string;
    name: string;
    accountCount: number;
    createdAt: string;
    accounts: Account[];
}

interface AccountFormData {
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

const ProfileDetails: React.FC = () => {
    const { profileId } = useParams({ from: '/profiles/$profileId' });
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProfileDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddAccountsModalOpen, setIsAddAccountsModalOpen] = useState(false);

    const loadProfileDetails = async () => {
        if (!profileId) return;
        setIsLoading(true);
        try {
            const data = await fetchProfileDetails(profileId);
            console.log('data', data);
            setProfile(data);
        } catch (error) {
            toast.error("Failed to load profile details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (!profileId) return;
        try {
            await deleteProfile(profileId);
            toast.success("Profile deleted successfully");
            navigate({ to: '/profiles' });
        } catch (error) {
            toast.error("Failed to delete profile. Please try again.");
        }
    };

    const handleDeleteAccount = async (email: string) => {
        if (!profileId) return;
        try {
            await deleteAccountFromProfile(profileId, email);
            toast.success("Account removed from profile");
            loadProfileDetails();
        } catch (error) {
            toast.error("Failed to remove account. Please try again.");
        }
    };

    const handleAddAccount = async (accounts: string[]) => {
        if (!profileId) return;
        try {
            // The accounts array already contains the properly formatted strings
            const response = await api.post(`/profiles/${profileId}/accounts`, {
                accounts
            });

            toast.success(`Successfully added ${accounts.length} account(s)`);
            loadProfileDetails();
        } catch (error) {
            console.error('Failed to add accounts:', error);
            toast.error("Failed to add accounts. Please try again.");
        }
    };

    useEffect(() => {
        loadProfileDetails();
    }, [profileId]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!profile) {
        return <div>Profile not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate({ to: '/profiles' })}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <PageTitle
                        title={profile.name}
                        description={`Created on ${new Date(profile.createdAt).toLocaleDateString()}`}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsAddAccountsModalOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Accounts
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="gap-2">
                                <Trash className="h-4 w-4" />
                                Delete Profile
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this profile? This action cannot be undone.
                                    All accounts in this profile will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDeleteProfile}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="font-medium">{profile.accountCount} Accounts</p>
                    <p className="text-sm text-muted-foreground">
                        Total accounts in this profile
                    </p>
                </div>
            </div>

            <AccountsTable
                accounts={profile.accounts}
                onDeleteAccount={handleDeleteAccount}
            />

            <AddAccountsModal
                onAddAccount={handleAddAccount}
                open={isAddAccountsModalOpen}
                onOpenChange={setIsAddAccountsModalOpen}
            />
        </div>
    );
};

export default ProfileDetails; 