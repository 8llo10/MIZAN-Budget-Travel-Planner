import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MIZAN — Budget-First Travel Planner',
  description: 'Plan trips around what you can actually spend. Compare flights, accommodation, food, local transport and experiences across Saudi Arabia, the GCC and Arab destinations.',
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
