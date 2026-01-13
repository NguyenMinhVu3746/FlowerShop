/**
 * AI CHAT LAYOUT
 * ==============
 * Layout riêng cho trang AI Chat (không có footer)
 */

import { Header } from '@/components/layout';

export default function AIChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
