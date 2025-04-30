import { useState, useEffect, useCallback } from 'react';
import { Profile } from '@/@types';
import { fetchProfiles, addProfiles, deleteProfile } from '@/rest-api/profiles-api';

export function useProfiles() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load accounts data
    const loadProfiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchProfiles();
            console.log("loadProfiles :::", data)
            setProfiles(data);
        } catch (err) {
            setError('Failed to load profiles. Please try again later.');
            // toast.error("Failed to load profiles. Please try again later.")
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add new profiles
    const handleAddProfiles = useCallback(async (name: string) => {
        try {
                await addProfiles(name);
            // toast.success("Profiles added successfully!")
            // Reload accounts after adding
            loadProfiles();
            return true;
        } catch (err) {
            // toast.error("Failed to add accounts. Please try again.")
            return false;
        }
    }, [loadProfiles]);

    // Delete an profile
    const handleDeleteProfile = useCallback(async (id: string) => {
        try {
            await deleteProfile(id);
            // toast.success("Profile deleted successfully!")
            // Reload profiles after deletion
            loadProfiles();
            return true;
        } catch (err) {
            // toast.error("Failed to delete account. Please try again.")
            return false;
        }
    }, [loadProfiles]);

    // Load profiles on component mount
    useEffect(() => {
        loadProfiles();
    }, [loadProfiles]);

    return {
        profiles,
        isLoading,
        error,
        refreshProfiles: loadProfiles,
        addProfiles: handleAddProfiles,
        deleteProfile: handleDeleteProfile,
    };
}