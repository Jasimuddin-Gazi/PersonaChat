
import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google'; // Import Inter and Manrope
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils'; // Import cn

// Configure Inter font
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Configure Manrope font (for headings)
// Ensure weights are strings
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['600', '700', '800'], // Changed 800.0 to '800'
});

export const metadata: Metadata = {
  title: 'PersonaChat',
  description: 'Create and chat with AI personas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Remove suppressHydrationWarning if not strictly needed or if hydration issues are resolved
    <html lang="en">
      {/* Apply font variables */}
      <body className={cn(
         inter.variable,
         manrope.variable,
         'font-sans antialiased'
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Add the background animation class here */}
          <main className="min-h-screen bg-gradient-animation">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

