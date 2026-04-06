import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Тіл-құрал | Қазақ тілін оқыту орталығы',
  description: 'AI-powered Kazakh language learning platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
