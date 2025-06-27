import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { createClient } from '@/lib/supabase/server';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Genesis Pro',
  description: 'Personal Budgeting Dashboard',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  let gaMeasurementId: string | null = null;
  if (supabase) {
      // Supabase might throw an error if the table doesn't exist, so we wrap it.
      try {
        const { data: gaSetting } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'ga_measurement_id')
          .single();
        if (gaSetting) {
          gaMeasurementId = gaSetting.value;
        }
      } catch (error) {
        // This is expected if the settings table hasn't been created yet.
        // We can safely ignore it.
        console.log("Could not fetch GA settings, likely because table doesn't exist yet.")
      }
  }


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {gaMeasurementId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
