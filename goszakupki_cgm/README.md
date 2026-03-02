# Goszaupki CGM - Dashbord Analitiks

Web application for visualization and analysis of public procurement data.

## Tech Stack

- **Frontend**: React 19.2.4, Vite 7.3.1, Chart.js 4.5.1
- **Backend**: Node.js, Express 5.2.1, XLXX (Excel)
- **Testing**: Vitest, Playwright
- **Monitoring**: Sentry, Winston, Web Vitals

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start dev server
npm run dev
```

Access: http://localhost:3000

## Available Scripts

```bash
npm run dev           # Dev mode (server + frontend)
npm run build           # Production build
npm run test             # Unit tests
npm run test:e2e         # E2E tests
npm run lint             # ESLint check
npm run format           # Prettier format
```

## Structure

 ```
goszaupki_cgm/
├─╰╼─┶╣╼┶          # Excel database
─╰┶┿─╼┶┿                # Source code
──╼┶┿──╼┶┿                # Components
✁ ─╼┶┿──╼┶┿                # Hooks
──╼┶┿──╼┶┿                # Utils
──╼┶┿──╼┶┿                # E2E tests
```

## License

IS