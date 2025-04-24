import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { ThemeMode } from '@/utils/theme';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
    const { theme, setThemeMode } = useTheme();

    const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
        {
            value: 'light',
            label: 'Light',
            icon: <Sun className="h-4 w-4" />,
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: <Moon className="h-4 w-4" />,
        },
        {
            value: 'system',
            label: 'System',
            icon: <Laptop className="h-4 w-4" />,
        },
    ];

    const currentIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="h-[1.2rem] w-[1.2rem]" />;
            case 'dark':
                return <Moon className="h-[1.2rem] w-[1.2rem]" />;
            case 'system':
                return <Laptop className="h-[1.2rem] w-[1.2rem]" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={"flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 mb-1"}
                >
                    {currentIcon()}
                    <span className="font-medium">Toggle theme</span>
                </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themeOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => setThemeMode(option.value)}
                        className={theme === option.value ? "bg-secondary" : ""}
                    >
                        <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                            {theme === option.value && (
                                <motion.div
                                    className="h-1.5 w-1.5 rounded-full bg-primary"
                                    layoutId="activeThemeIndicator"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ThemeToggle;