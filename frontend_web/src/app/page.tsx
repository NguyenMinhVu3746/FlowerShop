/**
 * HOME PAGE
 * =========
 * Landing page with Header, Footer, and content
 */

'use client';

import { Header, Footer } from '@/components/layout';
import HomePage from './(client)/page';

export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}
