# Authentication Setup Guide

This Vite + React application includes a complete authentication system using TanStack Router and Axios.

## Installation

1. Install dependencies:
```bash
npm install
```

The following packages are required:
- `@tanstack/react-router` - Modern routing library
- `@tanstack/router-vite-plugin` - Vite plugin for TanStack Router
- `@tanstack/router-devtools` - Developer tools for debugging routes
- `axios` - HTTP client for API calls

## Configuration

1. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Update the `VITE_API_URL` in your `.env` file to point to your backend API:
```env
VITE_API_URL=http://localhost:3000/api
```

## Backend API Requirements

Your backend should implement the following endpoints:

### POST `/api/auth/login`
Login endpoint that accepts username and password.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string (optional)"
  }
}
```

### POST `/api/auth/logout` (Optional)
Logout endpoint to invalidate tokens on the server side.

**Headers:**
```
Authorization: Bearer <token>
```

### GET `/api/auth/verify` (Optional)
Endpoint to verify token validity and get user info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string (optional)"
}
```

## Project Structure

```
src/
├── components/
│   ├── Login.tsx          # Login form component
│   ├── Login.css          # Login styles
│   ├── Dashboard.tsx      # Protected dashboard component
│   └── Dashboard.css      # Dashboard styles
├── contexts/
│   └── AuthContext.tsx    # Authentication context and provider
├── services/
│   └── api.ts             # Axios configuration and API functions
├── router.tsx             # TanStack Router configuration
├── App.tsx                # Main app component
└── main.tsx               # Entry point
```

## Features

### Authentication Context
- Global authentication state management
- Token storage in localStorage
- Auto-login on page refresh
- Login/logout functionality

### API Service
- Axios instance with base URL configuration
- Automatic token injection in request headers
- Response interceptor for handling 401 errors
- Centralized API endpoint functions

### Protected Routes
- Route guards using TanStack Router's `beforeLoad`
- Automatic redirect to login for unauthenticated users
- Automatic redirect to dashboard for authenticated users on login page

### Components
- **Login**: Beautiful login form with error handling
- **Dashboard**: Protected component showing user information

## Usage

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Customization

### Adding New Protected Routes

1. Create your component
2. Add a new route in `src/router.tsx`:

```typescript
const newRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/your-path',
  component: YourComponent,
  beforeLoad: () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw redirect({ to: '/login' });
    }
  },
});
```

3. Add the route to the route tree:
```typescript
const routeTree = rootRoute.addChildren([loginRoute, indexRoute, newRoute]);
```

### Modifying API Endpoints

Update the functions in `src/services/api.ts` to match your backend API structure.

### Styling

The app uses CSS modules for styling. Modify the `.css` files in the components directory to customize the appearance.

## Security Notes

- Tokens are stored in localStorage (consider using httpOnly cookies for enhanced security)
- Always use HTTPS in production
- Implement CORS properly on your backend
- Consider adding refresh token functionality
- Add rate limiting on login attempts

## Troubleshooting

### CORS Issues
Make sure your backend allows requests from your frontend origin. Add CORS headers or middleware.

### Token Expiration
Implement token refresh logic in the axios interceptor if your backend supports refresh tokens.

### Build Errors
If you encounter TypeScript errors, make sure all dependencies are installed and your `tsconfig.json` is properly configured.
