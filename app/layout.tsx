import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SNICKERS® Store | Pure Satisfaction',
  description: 'Shop Snickers bars, limited editions, and classic favorites.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning>{children}</body></html>;
}
