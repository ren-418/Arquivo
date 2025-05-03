export type ThemeMode = "dark" | "light" | "system";

const THEME_KEY = "theme";

export interface ThemePreferences {
    system: ThemeMode;
    local: ThemeMode | null;
}

export async function getCurrentTheme(): Promise<ThemePreferences> {
    try {
        const currentTheme = await window.themeMode?.current() || 'system';
        const localTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
        return {
            system: currentTheme,
            local: localTheme,
        };
    } catch (error) {
        console.error('Error getting current theme:', error);
        return {
            system: 'system',
            local: localStorage.getItem(THEME_KEY) as ThemeMode | null,
        };
    }
}

export async function setTheme(newTheme: ThemeMode) {
    try {
        switch (newTheme) {
            case "dark":
                await window.themeMode?.dark();
                updateDocumentTheme(true);
                break;
            case "light":
                await window.themeMode?.light();
                updateDocumentTheme(false);
                break;
            case "system": {
                const isDarkMode = await window.themeMode?.system() || false;
                updateDocumentTheme(isDarkMode);
                break;
            }
        }
        localStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
        console.error('Error setting theme:', error);
        // Fallback to just updating the document theme
        updateDocumentTheme(newTheme === 'dark');
        localStorage.setItem(THEME_KEY, newTheme);
    }
}

export async function toggleTheme() {
    try {
        const isDarkMode = await window.themeMode?.toggle() || false;
        const newTheme = isDarkMode ? "dark" : "light";
        updateDocumentTheme(isDarkMode);
        localStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
        console.error('Error toggling theme:', error);
        const currentTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        updateDocumentTheme(newTheme === 'dark');
        localStorage.setItem(THEME_KEY, newTheme);
    }
}

export async function syncThemeWithLocal() {
    try {
        const { local } = await getCurrentTheme();
        if (!local) {
            await setTheme("system");
            return;
        }
        await setTheme(local);
    } catch (error) {
        console.error('Error syncing theme with local:', error);
    }
}

function updateDocumentTheme(isDarkMode: boolean) {
    if (!isDarkMode) {
        document.documentElement.classList.remove("dark");
    } else {
        document.documentElement.classList.add("dark");
    }
}