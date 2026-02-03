import { RouterProvider } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';

import { router } from './router';
import './App.css'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';


const queryClient = new QueryClient()

function App() {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-right" />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
