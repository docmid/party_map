import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = { title: 'D&D Atlas' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) { return <html lang="ru"><body>{children}</body></html>; }
