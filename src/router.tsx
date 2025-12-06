import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { Login } from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/Home';
import CreateJob from './components/Admin/CreateJob';
import UtilizeJob from './components/Employee/UtilizeJob';

import {
  AppShell,
  Burger,
  Button,
  Container,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import AllJobs from './components/Admin/AllJobs';

// -------------------------
// Root Layout with AppShell
// -------------------------
function RootLayout() {
  const [opened, setOpened] = useState(false);

  const NavItem = ({ label, to }: { label: string; to: string }) => (
    <NavLink label={label} component={Link} to={to} onClick={() => setOpened(false)} />
  );
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group px="md" justify="space-between" h="100%">
          <Group>
            <Burger opened={opened} onClick={() => setOpened(!opened)} size="sm" />
            <Text fw={700} size="lg">
              Field App
            </Text>
          </Group>
          <Button
            variant="outline"
            color="red"
            onClick={() => {
              localStorage.removeItem('authToken');
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ScrollArea>
          <Text fw="bold" size="sm" color="dimmed" px="xs" td="underline">
            Employee
          </Text>
          <NavItem label="Home" to="/" />
          <NavItem label="Settings" to="/settings" />
          <NavItem label="Utilize Job" to="/job/new/create" />
          <Text fw="bold" size="sm" color="dimmed" px="xs" td="underline">
            Admin
          </Text>
          <NavItem label="Create Job" to="/create-job" />
          <NavItem label="All Jobs" to="/all-jobs" />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg" py="md">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

// -------------------------
// Root Route (AuthProvider)
// -------------------------
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet /> {/* AppShell injected by child layout route */}
    </AuthProvider>
  ),
});

// -------------------------
// Login route (NO AppShell)
// -------------------------
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  beforeLoad: () => {
    const token = localStorage.getItem('authToken');
    if (token) throw redirect({ to: '/' });
  },
});

// ----------------------------------------------
// Protected layout route that wraps AppShell
// ----------------------------------------------
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app-layout',
  component: RootLayout,
  beforeLoad: () => {
    const token = localStorage.getItem('authToken');
    if (!token) throw redirect({ to: '/login' });
  },
});

// Protected Home route (inside AppShell)
const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: HomePage,
});

// Example Settings route
const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/settings',
  component: () => <div>Settings Page</div>,
});

export const adminCreateJobRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/create-job',
  component: () => <CreateJob />,
});

export const utilizeJobRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/job/$jobId/create',
  parseParams: (params) => ({
    jobId: params.jobId,
  }),
  component: () => <UtilizeJob />,
});

export const allAdminExistingJobsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/all-jobs',
  component: () => <AllJobs />,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([
    indexRoute,
    settingsRoute,
    adminCreateJobRoute,
    utilizeJobRoute,
    allAdminExistingJobsRoute,
  ]),
]);

// Create router instance
export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
