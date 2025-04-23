import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, getCurrentTheme, setTheme, syncThemeWithLocal } from '@/lib/theme';

interface ThemeContextType {
    theme: ThemeMode;
    setThemeMode: (theme: ThemeMode) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    setThemeMode: async () => { },
    isLoading: true,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initTheme = async () => {
            try {
                await syncThemeWithLocal();
                const currentTheme = await getCurrentTheme();
                setThemeState(currentTheme.local || currentTheme.system);
            } catch (error) {
                console.error('Error initializing theme:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initTheme();
    }, []);

    const setThemeMode = async (newTheme: ThemeMode) => {
        try {
            await setTheme(newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Error setting theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setThemeMode, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};