# Electron Dashboard

A modern Electron-based dashboard application built with React, TypeScript, and Vite.

## Quick Start

### 1. Create a .env file

Before building or running the application, create a `.env` file in the root of your project with the following content:

```env
VITE_BACKEND_API=http://your.api.url
```

Replace `http://your.api.url` with the actual URL of your backend API. This environment variable is required for both web and Electron versions to communicate with your backend.

---

### Using Yarn
1. Install dependencies:
```bash
yarn install
```

2. Build the application:
```bash
yarn build --config vite.main.config.ts
yarn build --config vite.preload.config.ts
yarn build --config vite.renderer.config.mts
```

3. Start the application:
```bash
yarn start
```

The application will start in development mode and be available at `http://localhost:5173/`.

---

### Using npm
1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build -- --config vite.main.config.ts
npm run build -- --config vite.preload.config.ts
npm run build -- --config vite.renderer.config.mts
```

3. Start the application:
```bash
npm start
```

The application will start in development mode and be available at `http://localhost:5173/`.
