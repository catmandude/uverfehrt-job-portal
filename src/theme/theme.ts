import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    orange: [
      '#fff4e6',
      '#ffe8cc',
      '#ffd8a8',
      '#ffc078',
      '#ffa94d',
      '#ff8800',
      '#e67700',
      '#cc6d00',
      '#b35f00',
      '#994d00',
    ],
    dark: [
      '#f5f5f5',
      '#e7e7e7',
      '#cdcdcd',
      '#b2b2b2',
      '#9a9a9a',
      '#8b8b8b',
      '#848484',
      '#717171',
      '#333333',
      '#1a1a1a',
    ],
  },
  primaryColor: 'orange',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
});
