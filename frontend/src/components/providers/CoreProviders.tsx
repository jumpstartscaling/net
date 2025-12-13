import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster as SonnerToaster } from 'sonner';
import { queryClient } from '@/lib/react-query';

interface CoreProviderProps {
    children: React.ReactNode;
}

export const CoreProvider = ({ children }: CoreProviderProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <SonnerToaster position="top-right" theme="system" richColors closeButton />
        </QueryClientProvider>
    );
};

export const GlobalToaster = () => {
    return <SonnerToaster position="top-right" theme="system" richColors closeButton />;
}
