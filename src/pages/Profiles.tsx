import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';  
import ProfilesTable from '@/components/profiles/ProfilesTable';
import AddProfilesButton from '@/components/profiles/AddProfilesButton';
import { useProfiles } from '@/custom-hooks/use-profiles';
import { motion } from 'framer-motion';
import PageTitle from '@/components/PageTitle';

const Profiles: React.FC = () => {
    const navigate = useNavigate();
    const {
        profiles,
        isLoading,
        error,
        addProfiles: handleAddProfiles,
        deleteProfile: handleDeleteProfile,
    } = useProfiles();

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleProfileClick = (id: string) => {
        navigate({ to: '/profiles/$profileId', params: { profileId: id } });  
    };

    return (
        <div>
            <PageTitle
                title="Profiles"
                description="Manage your ticketing profiles"
                rightContent={<AddProfilesButton onAddProfiles={handleAddProfiles} />}
            />
            {
                error ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md"
                    >
                        {error}
                    </motion.div>
                ) : null
            }
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <ProfilesTable
                    data={profiles}
                    isLoading={isLoading}
                    onDelete={handleDeleteProfile}
                    onProfileClick={handleProfileClick}
                />
            </motion.div>
        </div>
    );
};

export default Profiles;