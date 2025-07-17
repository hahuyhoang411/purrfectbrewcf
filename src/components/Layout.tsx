
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBubble from './ChatBubble';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatBubble />
    </div>
  );
};

export default Layout;
