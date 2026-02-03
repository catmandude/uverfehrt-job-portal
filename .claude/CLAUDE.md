# Unverfehrt Farm Supply

A React-based web application for managing job operations, employee assignments, and resource allocation for a farm supply company.

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe routing
- **TanStack React Query** - Data fetching and caching
- **Mantine 8** - UI component library
- **Axios** - HTTP client
- **dayjs** - Date manipulation
- **xlsx** - Excel file parsing/generation

## Project Structure

```
src/
├── components/
│   ├── Admin/           # Admin-only components (AllJobs, CreateJob, Edit*)
│   └── Employee/        # Employee components (UtilizeJob, MyHistory, Modals/)
├── contexts/
│   └── AuthContext.tsx  # Authentication state & provider
├── services/
│   └── api.ts           # Axios instance & API functions
├── App.tsx              # Root component with providers
├── router.tsx           # TanStack Router configuration
├── types.ts             # TypeScript type definitions
└── main.tsx             # Entry point
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format with Prettier
```

## Key Features

| Route | Description |
|-------|-------------|
| `/login` | Authentication |
| `/` | Dashboard/home |
| `/create-job` | Admin: Create jobs (single or bulk via Excel) |
| `/job/$jobId/create` | Assign resources to a job |
| `/my-history` | View past completed jobs |
| `/all-jobs` | Admin: View and manage all jobs |
| `/admin/employees` | Admin: Manage employees |
| `/admin/vehicles` | Admin: Manage vehicles |
| `/admin/equipment` | Admin: Manage equipment |
| `/admin/subcontractors` | Admin: Manage subcontractors |

## Architecture Patterns

### Authentication
- Token-based auth with localStorage (`authToken`, `refreshToken`)
- Automatic logout on 401 responses
- Role-based UI (admin vs employee routes)
- Protected routes via TanStack Router's `beforeLoad`

### API Layer
- Centralized axios instance in `services/api.ts`
- Request interceptor adds Authorization header
- Response interceptor handles 401 errors
- Namespaced API objects: `authApi`, `jobsApi`, `employeesApi`, etc.

### Routing
- Nested routes with TanStack Router
- Root route wraps AuthProvider
- AppLayout route renders AppShell for authenticated pages
- Dynamic routes for job editing (`/job/$jobId/create`)

## Environment Variables

```
VITE_API_URL=http://localhost:3000/api
```

Default API: `https://unverfehrt-fast-1065632368040.us-central1.run.app/`

## Types

All TypeScript interfaces are in `src/types.ts`:
- `Job`, `NewJob`, `PredefinedJob` - Job data structures
- `Employee`, `Vehicle`, `Equipment`, `Subcontractor` - Resource types
- `JobEmployee`, `JobEquipment`, `JobPart`, etc. - Job resource assignments
