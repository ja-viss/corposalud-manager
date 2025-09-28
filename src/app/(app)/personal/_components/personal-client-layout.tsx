
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PersonalClientLayoutProps {
    children: React.ReactNode;
    showUserTab: boolean;
}

export function PersonalClientLayout({ children, showUserTab }: PersonalClientLayoutProps) {
    const pathname = usePathname();
    
    let activeTab = 'cuadrillas';
    if (showUserTab && pathname.includes('/usuarios')) {
        activeTab = 'usuarios';
    } else if (pathname.includes('/cuadrillas')) {
        activeTab = 'cuadrillas';
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs value={activeTab} className="w-full">
                <TabsList className={`grid w-full max-w-md ${showUserTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {showUserTab && (
                        <Link href="/personal/usuarios" passHref>
                            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                        </Link>
                    )}
                    <Link href="/personal/cuadrillas" passHref>
                        <TabsTrigger value="cuadrillas">Cuadrillas</TabsTrigger>
                    </Link>
                </TabsList>
                <div className="mt-6 w-full">
                    {children}
                </div>
            </Tabs>
        </div>
    )
}
