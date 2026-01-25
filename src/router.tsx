import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import AllJobs from './components/Admin/AllJobs';
import { registerLogoutHandler } from './services/api';
import { EditEmployees } from './components/Admin/EditEmployees';
import { EditVehicles } from './components/Admin/EditVehicles';
import { EditSubcontractors } from './components/Admin/EditSubcontractors';
import { EditEquipment } from './components/Admin/EditEquipment';
import MyHistory from './components/Employee/MyHistory';

function RootLayout() {
  const [opened, setOpened] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    registerLogoutHandler(logout);
  }, [logout]);

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
              Unverfehrt Farm Supply
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
          <Text fw="bold" size="sm" c="dimmed" px="xs" td="underline">
            Employee
          </Text>
          <NavItem label="Home" to="/" />
          <NavLink
            label="Google Drive"
            component="a"
            href="https://drive.google.com/drive/folders/0AKT1b2tW_e-kUk9PVA"
            target="_blank"
            rel="noopener noreferrer"
          />
          <NavItem label="Settings" to="/settings" />
          <NavItem label="Add Job" to="/job/new/create" />
          <NavItem label="My History" to="/my-history" />
          {user?.role === 'admin' && (
            <>
              <Text fw="bold" size="sm" c="dimmed" px="xs" td="underline">
                Admin
              </Text>
              <NavItem label="Create Job for employee" to="/create-job" />
              <NavItem label="All Jobs" to="/all-jobs" />
              <NavItem label="Manage Employees" to="/admin/employees" />
              <NavItem label="Manage Vehicles" to="/admin/vehicles" />
              <NavItem label="Manage Subcontractors" to="/admin/subcontractors" />
              <NavItem label="Manage Equipment" to="/admin/equipment" />
            </>
          )}
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

export const myHistoryRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/my-history',
  component: () => <MyHistory />,
});

export const adminManageEmployeesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin/employees',
  component: () => <EditEmployees />,
});

export const adminManageVehiclesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin/vehicles',
  component: () => <EditVehicles />,
});

export const adminManageSubcontractorsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin/subcontractors',
  component: () => <EditSubcontractors />,
});

export const adminManageEquipmentRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin/equipment',
  component: () => <EditEquipment />,
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
    myHistoryRoute,
    adminCreateJobRoute,
    utilizeJobRoute,
    allAdminExistingJobsRoute,
    adminManageEmployeesRoute,
    adminManageVehiclesRoute,
    adminManageSubcontractorsRoute,
    adminManageEquipmentRoute,
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
