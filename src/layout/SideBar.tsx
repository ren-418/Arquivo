import React from 'react';
import { cn } from '@/utils/utils';
import { LayoutDashboard, Users, Ticket, History } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Link, useLocation } from '@tanstack/react-router';

interface SidebarItemProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, title, isActive }) => {
    return (
        <Link to={href} className="relative block">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 mb-1",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
            >
                {icon}
                <span className="font-medium">{title}</span>
                {isActive && (
                    <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute right-0 w-1 h-full bg-primary-foreground rounded-l-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </motion.div>
        </Link>
    );
};

const Sidebar: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const menuItems = [
        {
            href: '/',
            title: 'Dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            href: '/accounts',
            title: 'Accounts',
            icon: <Users className="h-5 w-5" />,
        },
        {
            href: '/presale-codes',
            title: 'Presale Codes',
            icon: <Ticket className="h-5 w-5" />,
        },

        {
            href: '/history',
            title: 'History',
            icon: <History className="h-5 w-5" />,
        },
    ];

    return (
        <div className="h-full min-h-screen w-64 bg-card border-r overflow-y-auto">
            <div className="p-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center space-x-2"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        className="h-8 w-8 rounded-md bg-primary flex items-center justify-center"
                    >
                        <span className="text-primary-foreground font-bold text-lg">J</span>
                    </motion.div>
                    <span className="text-xl font-bold text-primary">Jason</span>
                </motion.div>
            </div>

            <div className="px-3 py-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * (index + 1), duration: 0.4 }}
                        >
                            <SidebarItem
                                href={item.href}
                                icon={item.icon}
                                title={item.title}
                                isActive={
                                    currentPath === item.href ||
                                    (item.href !== '/' && currentPath.startsWith(item.href))
                                }
                            />
                        </motion.div>
                    ))}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * (5 + 1), duration: 0.4 }}
                    >
                        <ThemeToggle />
                    </motion.div>

                </motion.div>
            </div>

        </div>
    );
};

export default Sidebar;