import SessionProvider from '@/context/SessionProvider';
import { inter } from '@/styles/fonts';
import { theme } from '@/styles/theme';
import '@mantine/charts/styles.css';
import {
  ColorSchemeScript,
  DirectionProvider,
  MantineProvider,
} from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <body className={inter.className}>
        <ColorSchemeScript />
        <DirectionProvider>
          <SessionProvider>
            <MantineProvider theme={theme}>
              <ModalsProvider>
                <Notifications />
                {children}
              </ModalsProvider>
            </MantineProvider>
          </SessionProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
