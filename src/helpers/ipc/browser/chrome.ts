import { ipcMain } from "electron";
import { chromium, Frame, Page } from "patchright";

interface TicketData {
    id_token: string;
    sid: string;
    sotc: string;
    sortc: string;
    ma_dvt: string;
    checkout_url: string;
    bid: string;
    proxy: string;

}

// Change to a Map to track which cart corresponds to each browser
// The key will be the cart ID (using checkout_url as the unique identifier)
const activeBrowsers = new Map<string, any>();

// Set up IPC handlers once the app is ready
export function setupIpcHandlers() {
    // Add a handler to check if a checkout is already open for a cart
    ipcMain.handle('is-checkout-open', (event, checkoutUrl: string) => {
        return activeBrowsers.has(checkoutUrl);
    });

    // Handle single ticket checkout
    ipcMain.on('checkout-manually', async (event, ticketData: TicketData) => {
        const cartId = ticketData.checkout_url;

        // 1) If there’s already any in‑flight or open browser for this cart, bail out immediately.
        if (activeBrowsers.has(cartId)) {
            console.log('Cart already being checked out:', cartId);
            event.sender.send('checkout-already-open', cartId);
            return;
        }

        // 2) Reserve the cart right away (using `null` as a placeholder).
        //    This prevents any re‑entry before openWithPlaywright finishes.
        activeBrowsers.set(cartId, null);
        event.sender.send('checkout-started', cartId);

        try {
            // 3) Actually launch the browser.
            const browser = await openWithPlaywright(ticketData);

            // 4) Replace the placeholder with the real browser instance.
            activeBrowsers.set(cartId, browser);

            // 5) When it closes, clean up.
            browser.on('disconnected', () => {
                activeBrowsers.delete(cartId);
                console.log('Browser instance closed and cleaned up');
                event.sender.send('checkout-ended', cartId);
            });

            console.log('Opening manual checkout with Playwright:', cartId);

        } catch (error) {
            // 6) If launch fails, remove the reservation so the user can retry.
            activeBrowsers.delete(cartId);
            console.error('Failed to open manual checkout:', error);
            event.sender.send('checkout-failed', cartId);
        }
    });


    // Add a handler to close all browsers when app is exiting
    ipcMain.on('app-will-quit', async () => {
        await closeAllBrowsers();
    });
}

// Update the close all browsers function to work with the Map
async function closeAllBrowsers() {
    console.log(`Closing ${activeBrowsers.size} active browser instances...`);

    const closePromises = Array.from(activeBrowsers.values()).map(async (browser: any) => {
        try {
            await browser.close();
            console.log('Browser instance closed successfully');
        } catch (error) {
            console.error('Error closing browser instance:', error);
        }
    });

    await Promise.all(closePromises);
    activeBrowsers.clear();
    console.log('All browser instances closed');
}

// Function to parse proxy string into server, username, and password
function parseProxyString(proxyStr: string): { server: string, username?: string, password?: string } {
    // Check if proxy string is empty
    if (!proxyStr || proxyStr.trim() === '') {
        return { server: '' };
    }

    // Handle format: 74.114.55.11:8080
    if (proxyStr.includes(':') && proxyStr.split(':').length === 2) {
        return { server: `http://${proxyStr}` };
    }

    // Handle format: 74.114.55.11:8080:a101:NGw3mHXfhRKFzNycBVJ9
    if (proxyStr.includes(':') && proxyStr.split(':').length === 4) {
        const parts = proxyStr.split(':');
        const ip = parts[0];
        const port = parts[1];
        const username = parts[2];
        const password = parts[3];

        return {
            server: `http://${ip}:${port}`,
            username,
            password
        };
    }

    // Default case, just pass the string as is
    return { server: proxyStr };
}

// Function to open a browser with Playwright and set cookies
async function openWithPlaywright(ticketData: TicketData) {
    // Extract domain from checkout URL
    console.log("TICKET DATA; ", ticketData);

    // Parse proxy string
    const proxyConfig = parseProxyString(ticketData.proxy);
    console.log("Using proxy configuration:", {
        ...proxyConfig,
        password: proxyConfig.password ? '********' : undefined // Don't log actual password
    });

    // Set up browser launch options
    const launchOptions: any = {
        headless: false, // Show the browser
        viewport: null,  // Full window size
        channel: "chrome",
    };

    // Only add proxy if a server is provided
    if (proxyConfig.server) {
        launchOptions.proxy = {
            server: proxyConfig.server,
            username: proxyConfig.username,
            password: proxyConfig.password
        };
    }

    // Launch a new browser
    const browser = await chromium.launch(launchOptions);

    // Set up page close detection
    browser.on('disconnected', () => {
        console.log('Browser disconnected event detected');
    });

    // Create a new context
    const context = await browser.newContext({
        viewport: null // This makes the browser use the full window size
    });

    var domains = [".livenation.com", ".ticketmaster.com", ".ticketmaster.ca"]

    for (const domain of domains) {
        // Set the cookies
        await context.addCookies([
            {
                name: 'id-token',
                value: ticketData.id_token,
                domain: domain,
                path: '/',
            },
            {
                name: 'SID',
                value: ticketData.sid,
                domain: domain,
                path: '/',
            },
            {
                name: 'SOTC',
                value: ticketData.sotc,
                domain: domain,
                path: '/',
            },
            {
                name: 'SORTC',
                value: ticketData.sortc,
                domain: domain,
                path: '/',
            },
            {
                name: 'ma.dvt',
                value: ticketData.ma_dvt,
                domain: domain,
                path: '/',
            },
            {
                name: 'BID',
                value: ticketData.bid,
                domain: domain,
                path: '/',
            },
        ]);
    }

    // Create a new page and navigate to the checkout URL
    const page = await context.newPage();

    // Set up listener for page close event
    page.on('close', async () => {
        console.log('Page closed, checking if all pages are closed');

        // Get all pages in this browser context
        const pages = context.pages();

        if (pages.length === 0) {
            console.log('All pages closed, closing browser');
            try {
                await browser.close();
                console.log('Browser closed successfully');
            } catch (error) {
                console.error('Error closing browser:', error);
            }
        } else {
            console.log(`${pages.length} pages still open`);
        }
    });

    // helper to fire on every main‐frame nav
    const watchPage = (page: Page) => {
        page.on("framenavigated", (frame: Frame) => {
            if (frame === page.mainFrame()) {
                checkForConfirmation(page).catch(err =>
                    console.error("Confirmation check failed:", err)
                );
            }
        });
    };

    // wire up *all* pages (initial + popups)
    context.on("page", watchPage);

    const firstPage = await context.newPage();
    watchPage(firstPage);

    // kick things off
    await firstPage.goto(ticketData.checkout_url);
    return browser;
}

async function checkForConfirmation(page: Page) {
    try {
        // only ever touch the main frame
        const frame = page.mainFrame();
        const url = frame.url();

        // 1) check URL
        const isConfirmationUrl = url === "https://checkout.ticketmaster.com/confirmation";

        // 2) check for the magic text
        let hasAnticipation = false;
        try {
            hasAnticipation = await frame
                .locator("text=Let the Anticipation Beg")
                .count() > 0;
        } catch (e) {
            console.warn("Anticipation-check failed:", (e as Error).message);
        }

        // 3) pull out “Order #: …” if present
        let orderNumber = "";
        try {
            const orderEl = frame.locator('[data-tid="order-number"]');
            if (await orderEl.count()) {
                const txt = await orderEl.innerText();               // “Order #: 16-48681/PHI”
                const m = txt.match(/Order #:\s*(.+)/);
                orderNumber = m ? m[1] : txt.trim();
            }
        } catch (e) {
            console.warn("Order‑number extraction failed:", (e as Error).message);
        }

        // 4) if *any* condition is met, print it
        if (isConfirmationUrl || hasAnticipation || orderNumber) {
            console.log(`Order #: ${orderNumber}`);
        }
    } catch (e) {
        // this should *never* bubble up
        console.error("Unexpected error in confirmation check:", (e as Error).stack);
    }
}