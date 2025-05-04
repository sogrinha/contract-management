import React from 'react';
import TopBar from './TopBar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <TopBar />
            <main className="flex-1 bg-gray-100">
                {children}
            </main>
        </div>
    );
};

export default Layout; 
