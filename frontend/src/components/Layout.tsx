import React from 'react';
import TopBar from './TopBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
            <ToastContainer position="top-right" autoClose={1500} />
        </div>
    );
};

export default Layout; 
