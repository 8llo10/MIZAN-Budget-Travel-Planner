import type { Metadata } from 'next';
import { Manrope, Noto_Kufi_Arabic } from 'next/font/google';
import ThemeToggle from '@/components/ThemeToggle';
import './globals.css';

const manrope = Manrope({subsets:['latin'],variable:'--font-latin',display:'swap'});
const kufi = Noto_Kufi_Arabic({subsets:['arabic'],variable:'--font-arabic',display:'swap'});

export const metadata: Metadata = {
  title: 'MIZAN — Budget-First Travel Planner',
  description: 'Plan trips around what you can actually spend. Compare flights, accommodation, food, local transport and experiences across Saudi Arabia, the GCC and Arab destinations.',
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
  themeColor: [
    {media:'(prefers-color-scheme: light)',color:'#f7fbfe'},
    {media:'(prefers-color-scheme: dark)',color:'#0b1720'}
  ]
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${kufi.variable}`}><body><ThemeToggle/>{children}</body></html>;
}
